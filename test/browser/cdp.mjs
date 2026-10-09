// A small Chrome DevTools Protocol driver for the browser tests, over Node's
// global WebSocket: it launches headless Chrome (CHROME_BIN, else
// google-chrome) on a throwaway profile, and each page is a target attached
// with a flattened session on the one browser connection.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const LAUNCH_MS = 30000;
const COMMAND_MS = 120000;
const NAVIGATION_MS = 30000;
const POLL_MS = 25;

// A run that dies with an exception or is interrupted must not leave Chrome
// or its profile behind. SIGINT and SIGTERM end the process without an
// 'exit' event unless they are handled. The 'exit' handler must be
// synchronous, and Chrome's helper processes go on writing to the profile for
// a moment after the browser process is killed, so it pauses before removing.
const running = new Map();
const AFTER_KILL_MS = 500;

function removeProfile(profile) {
  rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}

process.on('exit', () => {
  if (running.size === 0) {
    return;
  }
  for (const child of running.keys()) {
    child.kill('SIGKILL');
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, AFTER_KILL_MS);
  for (const profile of running.values()) {
    removeProfile(profile);
  }
});
for (const [signal, code] of [
  ['SIGINT', 130],
  ['SIGTERM', 143],
]) {
  process.once(signal, () => process.exit(code));
}

async function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

class Connection {
  #socket;
  #nextId = 1;
  #calls = new Map();
  #listeners = new Map();

  constructor(socket) {
    this.#socket = socket;
    socket.addEventListener('message', ({ data }) => this.#receive(JSON.parse(data)));
    socket.addEventListener('close', () => {
      for (const { reject, timer } of this.#calls.values()) {
        clearTimeout(timer);
        reject(new Error('the DevTools connection closed'));
      }
      this.#calls.clear();
    });
  }

  #receive(message) {
    if (message.id === undefined) {
      const key = `${message.sessionId ?? ''} ${message.method}`;
      for (const listener of this.#listeners.get(key) ?? []) {
        listener(message.params);
      }
      return;
    }
    const call = this.#calls.get(message.id);
    if (call === undefined) {
      return;
    }
    this.#calls.delete(message.id);
    clearTimeout(call.timer);
    if (message.error) {
      call.reject(
        new Error(`${call.method}: ${message.error.message} ${message.error.data ?? ''}`.trim()),
      );
    } else {
      call.resolve(message.result);
    }
  }

  send(method, params = {}, sessionId) {
    const id = this.#nextId;
    this.#nextId += 1;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#calls.delete(id);
        reject(new Error(`${method}: no reply within ${COMMAND_MS} ms`));
      }, COMMAND_MS);
      this.#calls.set(id, { method, resolve, reject, timer });
      this.#socket.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
    });
  }

  on(sessionId, method, listener) {
    const key = `${sessionId ?? ''} ${method}`;
    if (!this.#listeners.has(key)) {
      this.#listeners.set(key, new Set());
    }
    this.#listeners.get(key).add(listener);
    return () => this.#listeners.get(key).delete(listener);
  }

  close() {
    this.#socket.close();
  }
}

const KEYS = {
  Tab: { keyCode: 9 },
  Enter: { keyCode: 13, text: '\r' },
  ' ': { keyCode: 32, text: ' ', code: 'Space' },
  ArrowLeft: { keyCode: 37 },
  ArrowUp: { keyCode: 38 },
  ArrowRight: { keyCode: 39 },
  ArrowDown: { keyCode: 40 },
};

class Page {
  #connection;
  #sessionId;

  constructor(connection, targetId, sessionId) {
    this.#connection = connection;
    this.#sessionId = sessionId;
    this.targetId = targetId;
  }

  send(method, params = {}) {
    return this.#connection.send(method, params, this.#sessionId);
  }

  // Returns a function that removes the listener.
  on(event, listener) {
    return this.#connection.on(this.#sessionId, event, listener);
  }

  // waitUntil 'load' waits for the load event; 'commit' returns once the
  // navigation is committed, for tests that must act while the page loads.
  async goto(url, { waitUntil = 'load' } = {}) {
    let off;
    const loaded = new Promise((resolve) => {
      off = this.on('Page.loadEventFired', resolve);
    });
    try {
      const { errorText } = await this.send('Page.navigate', { url });
      if (errorText) {
        throw new Error(`navigating to ${url}: ${errorText}`);
      }
      if (waitUntil === 'load') {
        await withTimeout(
          loaded,
          NAVIGATION_MS,
          `${url} fired no load event within ${NAVIGATION_MS} ms`,
        );
      }
    } finally {
      off();
    }
  }

  // Evaluates an expression in the page, awaiting a promise result.
  async eval(expression) {
    const { result, exceptionDetails } = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (exceptionDetails) {
      throw new Error(
        `in page: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`,
      );
    }
    return result.value;
  }

  // A phone also gets the matching screen orientation, so a change between
  // portrait and landscape sizes is a rotation to the page.
  emulate({ width, height, mobile = true, deviceScaleFactor = mobile ? 2 : 1 }) {
    const orientation =
      width > height
        ? { type: 'landscapePrimary', angle: 90 }
        : { type: 'portraitPrimary', angle: 0 };
    return this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      mobile,
      deviceScaleFactor,
      ...(mobile && { screenWidth: width, screenHeight: height, screenOrientation: orientation }),
    });
  }

  async key(key) {
    const { keyCode, text, code = key } = KEYS[key] ?? {};
    if (keyCode === undefined) {
      throw new Error(`unsupported key ${JSON.stringify(key)}`);
    }
    const base = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
    await this.send('Input.dispatchKeyEvent', {
      ...base,
      ...(text ? { type: 'keyDown', text, unmodifiedText: text } : { type: 'rawKeyDown' }),
    });
    await this.send('Input.dispatchKeyEvent', { ...base, type: 'keyUp' });
  }

  // Polls until the expression is truthy and returns its value. An
  // evaluation that fails (the page is between documents) is retried.
  async waitFor(expression, timeoutMs = 10000) {
    const deadline = Date.now() + timeoutMs;
    let failure = null;
    for (;;) {
      try {
        const value = await this.eval(expression);
        if (value) {
          return value;
        }
        failure = null;
      } catch (error) {
        failure = error;
      }
      if (Date.now() >= deadline) {
        const last = failure === null ? '' : `; last error: ${failure.message}`;
        throw new Error(`timed out after ${timeoutMs} ms waiting for ${expression}${last}`);
      }
      await sleep(Math.min(POLL_MS, Math.max(0, deadline - Date.now())));
    }
  }

  close() {
    return this.#connection.send('Target.closeTarget', { targetId: this.targetId });
  }
}

class Browser {
  #connection;
  #child;
  #exited;
  #profile;

  constructor(connection, child, exited, profile) {
    this.#connection = connection;
    this.#child = child;
    this.#exited = exited;
    this.#profile = profile;
  }

  send(method, params = {}) {
    return this.#connection.send(method, params);
  }

  // A background page opens without taking the foreground from the others.
  async newPage({ background = false } = {}) {
    const { targetId } = await this.send('Target.createTarget', { url: 'about:blank', background });
    const { sessionId } = await this.send('Target.attachToTarget', { targetId, flatten: true });
    const page = new Page(this.#connection, targetId, sessionId);
    for (const domain of ['Page', 'Runtime', 'Network', 'Log']) {
      await page.send(`${domain}.enable`);
    }
    return page;
  }

  async close() {
    try {
      await withTimeout(this.send('Browser.close'), 5000, 'Browser.close timed out');
    } catch {
      // Killed below.
    }
    this.#connection.close();
    try {
      await withTimeout(this.#exited, 5000, 'Chrome did not exit');
    } catch {
      this.#child.kill('SIGKILL');
      await this.#exited;
    }
    running.delete(this.#child);
    removeProfile(this.#profile);
  }
}

async function endpoint(profile, child, launchFailure, stderr) {
  const file = join(profile, 'DevToolsActivePort');
  const deadline = Date.now() + LAUNCH_MS;
  while (Date.now() < deadline) {
    const failure = launchFailure();
    if (failure !== null) {
      throw new Error(`Chrome did not start: ${failure}\n${stderr()}`);
    }
    try {
      const [port, path] = readFileSync(file, 'utf8').split('\n');
      if (port && path) {
        return `ws://127.0.0.1:${port}${path}`;
      }
    } catch {
      // Not written yet.
    }
    await sleep(50);
  }
  child.kill('SIGKILL');
  throw new Error(`Chrome wrote no DevToolsActivePort within ${LAUNCH_MS} ms\n${stderr()}`);
}

export async function launch({ extraArgs = [] } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'tmelevation-chrome-'));
  const args = [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    // No fetches the tests did not ask for, and no updater files in TMPDIR.
    '--disable-background-networking',
    '--disable-component-update',
  ];
  if (process.env.CHROME_NO_SANDBOX === '1') {
    args.push('--no-sandbox');
  }
  args.push(...extraArgs, 'about:blank');
  const child = spawn(process.env.CHROME_BIN || 'google-chrome', args, {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  running.set(child, profile);
  let spawnError = null;
  child.once('error', (error) => {
    spawnError = error;
  });
  const exited = new Promise((resolve) => child.once('exit', resolve));
  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr = (stderr + chunk).slice(-20000);
  });
  const launchFailure = () => {
    if (spawnError !== null) {
      return spawnError.message;
    }
    return child.exitCode !== null || child.signalCode !== null
      ? `exited with ${child.exitCode ?? child.signalCode}`
      : null;
  };
  try {
    const url = await endpoint(profile, child, launchFailure, () => stderr);
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error(`cannot connect to ${url}`)), {
        once: true,
      });
    });
    return new Browser(new Connection(socket), child, exited, profile);
  } catch (error) {
    child.kill('SIGKILL');
    // A Chrome that never spawned never exits.
    await withTimeout(exited, 5000, 'Chrome did not exit').catch(() => {});
    running.delete(child);
    removeProfile(profile);
    throw error;
  }
}

// Records a page's requests and what the tests count as a problem: an
// uncaught exception; a console error, warning or failed assert; and a log
// entry that is an error, comes from the security source (how Chrome
// reports CSP and Trusted Types violations, whose text does not say
// "Refused to"), or warns that a preloaded resource went unused.
export function watch(page) {
  const requests = [];
  const current = new Map();
  const problems = [];
  page.on('Network.requestWillBeSent', ({ requestId, request, redirectResponse }) => {
    const redirected = current.get(requestId);
    if (redirectResponse && redirected) {
      redirected.status = redirectResponse.status;
    }
    const record = { url: request.url, status: undefined, error: undefined };
    requests.push(record);
    current.set(requestId, record);
  });
  page.on('Network.responseReceived', ({ requestId, response }) => {
    const record = current.get(requestId);
    if (record) {
      record.status = response.status;
    }
  });
  page.on('Network.loadingFailed', ({ requestId, errorText, blockedReason }) => {
    const record = current.get(requestId);
    if (record) {
      record.error = [errorText, blockedReason].filter(Boolean).join(' ');
    }
  });
  page.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
    problems.push(`uncaught: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`);
  });
  page.on('Runtime.consoleAPICalled', ({ type, args }) => {
    if (type === 'error' || type === 'warning' || type === 'assert') {
      problems.push(
        `console.${type}: ${args.map((arg) => arg.value ?? arg.description ?? arg.type).join(' ')}`,
      );
    }
  });
  page.on('Log.entryAdded', ({ entry }) => {
    if (
      entry.source === 'security' ||
      entry.level === 'error' ||
      (entry.level === 'warning' && /preload/i.test(entry.text))
    ) {
      problems.push(
        `log ${entry.source}/${entry.level}: ${entry.text}${entry.url ? ` (${entry.url})` : ''}`,
      );
    }
  });
  return { requests, problems };
}
