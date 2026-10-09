// Browser smoke test (spec §8.2): loads both pages at desktop size in
// headless Chrome and fails unless each reaches data-state="ready", every
// request returned 200 exactly once, nothing reported an error, warning or
// CSP violation, and the pages show the published values and the version.
//
//   node test/browser/smoke.mjs [artifactDir | baseUrl] [--expect-version <v>]
//
// A directory is served locally; an http(s) base URL is loaded as it is (the
// live check). With no target, an artifact of the expected version is built
// into $TMPDIR. Request statuses come from the DevTools protocol, so both
// modes check them the same way.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { ORACLES } from '../../site/js/oracles.js';
import { launch, watch } from './cdp.mjs';
import { serve } from './serve.mjs';

const BUILDER = fileURLToPath(new URL('../../scripts/build-artifact.mjs', import.meta.url));
const DESKTOP = { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 };
const STATE = 'document.documentElement.dataset.state';
const READY_MS = 20000;
// Chrome reports a preload left unused 3 s after the load event; the rest
// is margin for a slow runner.
const PRELOAD_GRACE_MS = 6000;
const CALIBRATION_ROWS = 23;
const CARRY = [
  ['pga', 'Driver', '282/258'],
  ['pga', '4 Iron', '209/192'],
  ['lpga', 'PW', '111/101'],
];

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { 'expect-version': { type: 'string', default: 'v0.0.0' } },
});
const version = values['expect-version'];
// Only a release build stamps its URLs; `dev` is the source tree served as is.
const stamped = /^v\d+\.\d+\.\d+$/.test(version);

async function target(arg) {
  if (arg !== undefined && /^https?:\/\//.test(arg)) {
    return { base: arg.endsWith('/') ? arg : `${arg}/`, close: async () => {} };
  }
  let dir = arg;
  let work = null;
  if (dir === undefined) {
    work = mkdtempSync(join(tmpdir(), 'tmelevation-smoke-'));
    dir = join(work, 'artifact');
    const built = spawnSync(process.execPath, [BUILDER, version, dir], { stdio: 'inherit' });
    if (built.status !== 0) {
      throw new Error(`build-artifact exited with ${built.status}`);
    }
  }
  const server = await serve(dir);
  return {
    base: `${server.url}/`,
    close: async () => {
      await server.close();
      if (work !== null) {
        rmSync(work, { recursive: true, force: true });
      }
    },
  };
}

function requestFailures(requests, pageUrl) {
  const failures = [];
  const { origin } = new URL(pageUrl);
  const counts = new Map();
  for (const { url, status, error } of requests) {
    counts.set(url, (counts.get(url) ?? 0) + 1);
    if (status !== 200) {
      failures.push(
        `${url}: ${error ?? (status === undefined ? 'no response' : `HTTP ${status}`)}`,
      );
    }
    const parsed = new URL(url);
    if (
      stamped &&
      parsed.origin === origin &&
      url !== pageUrl &&
      parsed.search !== `?v=${version}`
    ) {
      failures.push(`${url} does not carry ?v=${version}`);
    }
  }
  for (const [url, count] of counts) {
    if (count > 1) {
      failures.push(`${url} was requested ${count} times`);
    }
  }
  if (!counts.has(pageUrl)) {
    failures.push(`no request for ${pageUrl} was recorded`);
  }
  return failures;
}

// In-page readers; each is serialised into the page, so it uses no outer names.
function readIndex(carry) {
  const carryOf = (tour, club) =>
    [...document.querySelectorAll(`[data-tour="${tour}"] tbody tr`)]
      .find((tr) => tr.querySelector('.club .v')?.textContent === club)
      ?.querySelector('[data-col="carry"] .v')?.textContent ?? null;
  return {
    carry: carry.map(([tour, club]) => carryOf(tour, club)),
    version: document.getElementById('version').textContent,
  };
}

function readMethods() {
  const rows = (id) => [...document.getElementById(id).tBodies[0].rows];
  const pending = (tr) => [...tr.cells].some((cell) => cell.textContent === '…');
  return {
    calibration: rows('calibration-table').length,
    calibrationPending: rows('calibration-table').filter(pending).length,
    oracles: rows('validation-table').map((tr) => tr.cells[0].textContent),
    oraclesPending: rows('validation-table').filter(pending).length,
    version: document.getElementById('version').textContent,
  };
}

const CONTENT = {
  'index.html': async (page) => {
    const shown = await page.eval(`(${readIndex})(${JSON.stringify(CARRY)})`);
    const failures = [];
    CARRY.forEach(([tour, club, expected], i) => {
      if (shown.carry[i] !== expected) {
        failures.push(`${tour} ${club} carry shows ${shown.carry[i]}, not ${expected}`);
      }
    });
    if (shown.version !== version) {
      failures.push(`#version shows ${JSON.stringify(shown.version)}, not ${version}`);
    }
    return failures;
  },
  'methods.html': async (page) => {
    const shown = await page.eval(`(${readMethods})()`);
    const failures = [];
    if (shown.calibration !== CALIBRATION_ROWS || shown.calibrationPending > 0) {
      failures.push(
        `calibration table has ${shown.calibration} rows (${shown.calibrationPending} pending), not ${CALIBRATION_ROWS} filled`,
      );
    }
    const ids = ORACLES.map(({ id }) => id);
    if (JSON.stringify(shown.oracles) !== JSON.stringify(ids) || shown.oraclesPending > 0) {
      failures.push(
        `validation table shows oracles ${shown.oracles.join(', ')} (${shown.oraclesPending} pending), not ${ids.join(', ')} filled`,
      );
    }
    if (shown.version !== version) {
      failures.push(`#version shows ${JSON.stringify(shown.version)}, not ${version}`);
    }
    return failures;
  },
};

// The page's final state, or what it shows instead when it never gets there:
// still loading, no data-state at all, or a page that cannot be read.
async function settledState(page, timeoutMs) {
  try {
    return await page.waitFor(`['ready', 'error'].includes(${STATE}) && ${STATE}`, timeoutMs);
  } catch {
    try {
      return `still ${await page.eval(`${STATE} ?? '(no data-state attribute)'`)}`;
    } catch (error) {
      return `unreadable (${error.message})`;
    }
  }
}

async function check(browser, base, name) {
  const pageUrl = new URL(name, base).href;
  const page = await browser.newPage();
  const seen = watch(page);
  const failures = [];
  try {
    await page.emulate(DESKTOP);
    const started = Date.now();
    await page.goto(pageUrl);
    const loaded = Date.now();
    const state = await settledState(page, READY_MS - (loaded - started));
    if (state !== 'ready') {
      failures.push(`data-state is ${state}, not ready, ${READY_MS / 1000} s after navigation`);
    }
    await sleep(Math.max(0, loaded + PRELOAD_GRACE_MS - Date.now()));
    try {
      failures.push(...(await CONTENT[name](page)));
    } catch (error) {
      failures.push(`could not read the page: ${error.message}`);
    }
  } finally {
    await page.close();
  }
  return [...requestFailures(seen.requests, pageUrl), ...seen.problems, ...failures];
}

const site = await target(positionals[0]);
let failed = false;
try {
  const browser = await launch();
  try {
    for (const name of Object.keys(CONTENT)) {
      const failures = await check(browser, site.base, name);
      failed ||= failures.length > 0;
      console.log(`${failures.length === 0 ? 'ok' : 'not ok'} - smoke ${version} ${name}`);
      for (const failure of failures) {
        console.log(`  ${failure}`);
      }
    }
  } finally {
    await browser.close();
  }
} finally {
  await site.close();
}
process.exitCode = failed ? 1 : 0;
