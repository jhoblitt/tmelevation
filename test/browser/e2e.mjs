// End-to-end tests of the pages in headless Chrome: the Review Focus cases
// RF-1…RF-5, the footer's links from the keyboard, a background tab,
// back/forward with and without the back/forward cache, and the sticky
// controls.
//
//   node test/browser/e2e.mjs [siteDir]      (default: site/)
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import {
  commitElevation,
  initialState,
  inputElevation,
  inputSlider,
  setElevationUnit,
  setMode,
  view,
} from '../../site/js/controls.js';
import { createModel } from '../../site/js/model.js';
import { angleCell, distanceCell, rowStatus } from '../../site/js/present.js';
import { launch, watch } from './cdp.mjs';
import { serve } from './serve.mjs';

const SITE = process.argv[2] ?? fileURLToPath(new URL('../../site/', import.meta.url));

const PHONE = { width: 390, height: 844, mobile: true, deviceScaleFactor: 3 };
const NARROW = { width: 320, height: 568, mobile: true, deviceScaleFactor: 2 };
const NARROW_LANDSCAPE = { width: 568, height: 320, mobile: true, deviceScaleFactor: 2 };
const DESKTOP = { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 };

const STATE = 'document.documentElement.dataset.state';
const READY = `${STATE} === 'ready'`;
const SETTLED = `${STATE} !== 'loading' && ${STATE}`;
const SHOWS_LOAD_ERROR = `${STATE} === 'error' && !document.getElementById('load-error').hidden`;
const FRAMES =
  'new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done())))';

// What the page should show, computed in Node by the modules the page runs.
// Node and Chrome can differ in the last bit of pow/exp/atan2, so only the
// rounded display text is compared, never a float.

const model = createModel();
while (model.calibrateNext()) {
  // Calibrates every row up front.
}

const MODELLED = {
  maxHeight: [distanceCell, 'maxHeightYd'],
  land: [angleCell, 'landDeg'],
  carry: [distanceCell, 'carryYd'],
};

function expectedCells(state) {
  const v = view(state);
  const deltas = model.deltasAt(v.rhoRatio);
  const cells = {};
  for (const entry of model.entries) {
    const { status, delta } = deltas.get(entry.key);
    for (const [col, [present, field]] of Object.entries(MODELLED)) {
      const shown = present(entry.row[col], delta?.[field], {
        mode: state.mode,
        showDelta: !v.atSeaLevel,
        status: rowStatus(status, delta),
      });
      cells[`${entry.key} ${col}`] = { v: shown.value, d: shown.delta, sr: shown.a11y };
    }
  }
  return cells;
}

// The slider holds the shown elevation on its step grid (5 m or 10 ft).
function expectedControls(state) {
  const v = view(state);
  return {
    elev: v.elevText,
    unit: state.elevUnit,
    slider: Math.round(v.slider.value / v.slider.step) * v.slider.step,
    readout: v.readout,
    carry: expectedCells(state)['pga:0 carry'].v,
  };
}

const SEA_LEVEL = initialState();
const AT_5280 = commitElevation(inputElevation(SEA_LEVEL, '5280'));

// In-page functions; each is serialised into the page, so it uses no outer names.

function readCells() {
  return Object.fromEntries(
    [...document.querySelectorAll('td[data-col]')].map((td) => [
      `${td.dataset.key} ${td.dataset.col}`,
      {
        v: td.querySelector('.v').textContent,
        d: td.querySelector('.d').textContent,
        sr: td.querySelector('.sr').textContent,
      },
    ]),
  );
}

function readControls() {
  const byId = (id) => document.getElementById(id);
  return {
    elev: byId('elev').value,
    unit: byId('elev-unit').value,
    slider: byId('slider').valueAsNumber,
    readout: byId('readout').textContent,
    carry: document.querySelector('td[data-key="pga:0"][data-col="carry"] .v').textContent,
  };
}

function readBox() {
  const box = document.getElementById('elev');
  return {
    text: box.value,
    invalid: box.getAttribute('aria-invalid'),
    unit: document.getElementById('elev-unit').value,
    focused: document.activeElement === box,
  };
}

function deltaLines() {
  return [...document.querySelectorAll('td[data-col] .d')].map((d) => ({
    text: d.textContent,
    hidden: d.classList.contains('hidden'),
  }));
}

function setSlider(value) {
  const slider = document.getElementById('slider');
  slider.value = String(value);
  slider.dispatchEvent(new Event('input', { bubbles: true }));
}

function setUnit(value) {
  const select = document.getElementById('elev-unit');
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

// RF-1: every input in one task, so the last one surely lands while rows are
// calibrating, then the state and the pending (…) cells of the frame that
// renders it. At sea level no cell is pending (its delta line is hidden), so
// the pending cells can only be counted after the slider has moved.
async function sweep(values) {
  const root = document.documentElement;
  const slider = document.getElementById('slider');
  const before = root.dataset.state;
  for (const value of values) {
    slider.value = String(value);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }
  await new Promise((done) => requestAnimationFrame(() => done()));
  const pending = [...document.querySelectorAll('td[data-col] .d')].filter(
    (d) => d.textContent === '…',
  );
  return { before, after: root.dataset.state, pending: pending.length };
}

function measure() {
  const box = (node) => {
    const { top, bottom, left, right, width, height } = node.getBoundingClientRect();
    return { top, bottom, left, right, width, height };
  };
  const root = document.documentElement;
  const pinned = document.getElementById('pinned');
  return {
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    pinned: box(pinned),
    pinnedChildren: [...pinned.children].map(box),
    slider: box(document.getElementById('slider')),
    scrollers: [...document.querySelectorAll('.scroller')].map((s) => ({
      left: s.scrollLeft,
      max: s.scrollWidth - s.clientWidth,
    })),
  };
}

// Resolves once no scroller has moved for three frames (false after ~2 s).
async function scrollSettled() {
  const positions = () =>
    [...document.querySelectorAll('.scroller')].map((s) => s.scrollLeft).join();
  let last = positions();
  let still = 0;
  for (let i = 0; i < 120 && still < 3; i += 1) {
    await new Promise((done) => requestAnimationFrame(() => done()));
    const now = positions();
    still = now === last ? still + 1 : 0;
    last = now;
  }
  return still >= 3;
}

// Each changing column's header and cells in both tables, with the right
// edge of the same row's pinned Club cell and the scroller's visible right
// edge: a cell under the Club column lies inside the viewport yet is hidden.
function changingColumns() {
  const columns = ['maxHeight', 'land', 'carry'];
  const cells = [];
  for (const section of document.querySelectorAll('[data-tour]')) {
    const scroller = section.querySelector('.scroller');
    const visibleRight =
      scroller.getBoundingClientRect().left +
      scroller.clientLeft +
      scroller.clientWidth -
      parseFloat(getComputedStyle(scroller).paddingRight);
    const first = section.querySelector('tbody tr');
    const indexes = columns.map((col) => first.querySelector(`[data-col="${col}"]`).cellIndex);
    for (const tr of section.querySelectorAll('tr')) {
      const club = tr.cells[0].getBoundingClientRect().right;
      columns.forEach((col, i) => {
        const { left, right } = tr.cells[indexes[i]].getBoundingClientRect();
        cells.push({
          tour: section.dataset.tour,
          row: tr.rowIndex,
          col,
          left,
          right,
          club,
          visibleRight,
        });
      });
    }
  }
  return cells;
}

// The Land Angle daggers (one per table) and the footnote they point to.
function landNote() {
  const shown = (node) => node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  return {
    daggers: [...document.querySelectorAll('.dagger')].map((node) => ({
      tour: node.closest('[data-tour]').dataset.tour,
      id: node.id,
      shown: shown(node),
    })),
    footnote: shown(document.getElementById('land-footnote')),
  };
}

function scrolledAway(tour) {
  const scroller = document.querySelector(`[data-tour="${tour}"] .scroller`);
  return scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 1;
}

function paddings(selectors) {
  return selectors.map((selector) => {
    const style = getComputedStyle(document.querySelector(selector));
    return { selector, left: parseFloat(style.paddingLeft), right: parseFloat(style.paddingRight) };
  });
}

function pageWidth() {
  const root = document.documentElement;
  return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
}

function scrolledTo(id) {
  return { scrolled: scrollY, top: document.getElementById(id).getBoundingClientRect().top };
}

// The elements stuck to the top of the viewport; the Club cells, which stick
// to a scroller's left edge, are not among them.
function pinnedAtTop() {
  const pinned = [...document.body.querySelectorAll('*')]
    .filter((node) => !node.closest('.scroller') && getComputedStyle(node).position === 'sticky')
    .map((node) => {
      const { top, height } = node.getBoundingClientRect();
      return { id: node.id, top, height };
    });
  return { scrolled: scrollY, pinned };
}

function hiddenNotice() {
  return {
    visibility: document.visibilityState,
    hidden: document.getElementById('load-error').hidden,
  };
}

// Elements reaching past the viewport that are not inside a scroller of their own.
function overflowing() {
  const width = document.documentElement.clientWidth;
  return [...document.body.querySelectorAll('*')]
    .filter((node) => !node.closest('.eq, .scroller'))
    .filter((node) => {
      const { left, right, width: w } = node.getBoundingClientRect();
      return w > 0 && (left < -0.5 || right > width + 0.5);
    })
    .map(
      (node) => `${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ''}.${node.className}`,
    );
}

// The page's observer pins a scroller by writing scrollLeft, and the scroll
// event of that write arrives a frame later. A task in between may widen the
// table (a calibration slice's render, a font swap), so the event then reads
// as a scroll away from the right edge. This widens the PGA table once, so the
// page writes, and again from a task queued by an observer notified after the
// page's, i.e. after the write and before the next frame's scroll event.
function widenBetweenWriteAndScroll() {
  const scroller = document.querySelector('[data-tour="pga"] .scroller');
  const value = scroller.querySelector('td[data-key="pga:0"][data-col="carry"] .v');
  const frame = () => new Promise((done) => requestAnimationFrame(() => done()));
  const startWidth = scroller.scrollWidth;
  const position = () => ({
    left: scroller.scrollLeft,
    max: scroller.scrollWidth - scroller.clientWidth,
  });
  return new Promise((done) => {
    let step = 'first';
    const watcher = new ResizeObserver(() => {
      if (step !== 'written') {
        return;
      }
      step = 'second';
      watcher.disconnect();
      // The page's observer, notified first, has just pinned the wider table.
      const written = { widened: scroller.scrollWidth > startWidth, ...position() };
      if (!written.widened || Math.abs(written.left - written.max) > 1) {
        done({ written });
        return;
      }
      setTimeout(async () => {
        value.textContent = '888,888/888,888';
        await frame();
        await frame();
        await frame();
        done({ written, ...position() });
      }, 0);
    });
    watcher.observe(scroller.firstChild);
    requestAnimationFrame(() => {
      value.textContent = '8,888/8,888';
      step = 'written';
    });
  });
}

function focused() {
  const node = document.activeElement;
  return { id: node.id, outline: getComputedStyle(node).outlineStyle };
}

function footerStop() {
  const node = document.activeElement;
  const style = getComputedStyle(node);
  const { left, right, height } = node.getBoundingClientRect();
  return {
    id: node.id,
    inFooter: node.closest('footer') !== null,
    outline: style.outlineStyle,
    outlineWidth: parseFloat(style.outlineWidth),
    left,
    right,
    height,
    clientWidth: document.documentElement.clientWidth,
  };
}

function visible(selector) {
  const node = document.querySelector(selector);
  const { width, height } = node?.getBoundingClientRect() ?? { width: 0, height: 0 };
  return {
    text: node?.textContent ?? null,
    shown:
      Boolean(node?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) &&
      width > 0 &&
      height > 0,
  };
}

const call = (fn, ...args) => `(${fn})(${args.map((arg) => JSON.stringify(arg)).join(', ')})`;

// Harness

let browser;
const cases = [];
const test = (name, fn) => cases.push({ name, fn });

async function withPage({ viewport = PHONE, serveOptions = {}, extraArgs = null } = {}, fn) {
  const server = await serve(SITE, serveOptions);
  const owner = extraArgs === null ? browser : await launch({ extraArgs });
  try {
    const page = await owner.newPage();
    const seen = watch(page);
    try {
      await page.emulate(viewport);
      await fn({ page, seen, browser: owner, url: (path) => `${server.url}/${path}` });
    } finally {
      await page.close();
    }
  } finally {
    if (owner !== browser) {
      await owner.close();
    }
    await server.close();
  }
}

async function load(page, url, timeoutMs = 30000) {
  await page.goto(url);
  const state = await page.waitFor(SETTLED, timeoutMs);
  assert.equal(state, 'ready', `${url} reached data-state ${state}`);
  await page.eval(`document.fonts.ready.then(() => ${FRAMES})`);
}

async function type(page, id, text) {
  await page.eval(
    `(() => { const box = document.getElementById('${id}'); box.focus(); box.select(); })()`,
  );
  await page.send('Input.insertText', { text });
}

const frames = (page) => page.eval(FRAMES);

// A scroller at its right edge, to the pixel the page itself allows.
const atRightEdge = (scrollers) => scrollers.every(({ left, max }) => left >= max - 1);

async function settle(page) {
  assert.ok(await page.eval(call(scrollSettled)), 'the tables kept scrolling');
}

async function hiddenColumns(page) {
  return (await page.eval(call(changingColumns))).filter(
    ({ left, right, club, visibleRight }) => left < club - 0.5 || right > visibleRight + 0.5,
  );
}

const landNoteAt = (shown) => ({
  daggers: [
    { tour: 'pga', id: 'land-dagger', shown },
    { tour: 'lpga', id: '', shown },
  ],
  footnote: shown,
});

// Cases

test('RF-1: moving the slider during calibration ends on the model at 5,280 ft', () =>
  withPage({}, async ({ page, seen, url }) => {
    // 29 positions across the range, then 5,280 ft.
    const values = Array.from({ length: 29 }, (_, i) => Math.round((i * 15000) / 28 / 10) * 10);
    values.push(5280);
    await page.send('Emulation.setCPUThrottlingRate', { rate: 20 });
    await page.goto(url('index.html'), { waitUntil: 'commit' });
    await page.waitFor(`document.documentElement.dataset.app === 'started'`, 20000);
    const race = await page.eval(call(sweep, values));
    assert.equal(race.before, 'loading', 'calibration finished before the slider moved');
    assert.ok(
      race.after === 'loading' && race.pending > 0,
      `the race did not happen: ${JSON.stringify(race)}`,
    );
    assert.equal(await page.waitFor(SETTLED, 120000), 'ready');
    await page.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await frames(page);
    assert.deepEqual(await page.eval(call(readCells)), expectedCells(inputSlider(SEA_LEVEL, 5280)));
    assert.equal(await page.eval(`document.getElementById('load-error').hidden`), true);
    assert.deepEqual(seen.problems, []);
  }));

test('RF-2: changing the unit over invalid text shows the state in metres', () =>
  withPage({}, async ({ page, seen, url }) => {
    await load(page, url('index.html'));
    await type(page, 'elev', '5280');
    await page.key('Enter');
    await type(page, 'elev', 'abc');
    await frames(page);
    assert.deepEqual(await page.eval(call(readBox)), {
      text: 'abc',
      invalid: 'true',
      unit: 'ft',
      focused: true,
    });

    // From the keyboard: leaving the box reverts it, then the unit changes.
    await page.key('Tab');
    assert.equal(await page.eval(`document.activeElement.id`), 'elev-unit');
    await page.key('ArrowDown');
    await frames(page);
    const metres = view(setElevationUnit(AT_5280, 'm'));
    assert.equal(metres.elevText, '1,609');
    assert.deepEqual(await page.eval(call(readBox)), {
      text: metres.elevText,
      invalid: 'false',
      unit: 'm',
      focused: false,
    });

    // While the box still has focus: the only path where the unit change
    // meets the pending text.
    await type(page, 'elev', 'abc');
    await frames(page);
    await page.eval(call(setUnit, 'ft'));
    await frames(page);
    assert.deepEqual(await page.eval(call(readBox)), {
      text: '5,280',
      invalid: 'false',
      unit: 'ft',
      focused: true,
    });
    assert.deepEqual(seen.problems, []);
  }));

test('RF-3: keyboard only', () =>
  withPage({}, async ({ page, seen, url }) => {
    await page.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await load(page, url('index.html'));
    const stops = [];
    for (let i = 0; i < 7; i += 1) {
      await page.key('Tab');
      stops.push(await page.eval(call(focused)));
    }
    assert.deepEqual(
      stops.map(({ id }) => id),
      ['elev', 'elev-unit', 'press', 'press-unit', 'slider', 'mode-abs', 'mode-pct'],
    );
    for (const { id, outline } of stops) {
      assert.notEqual(outline, 'none', `#${id} shows no focus outline`);
    }
    // At sea level nothing has changed, so neither the Land Angle daggers
    // nor the footnote they refer to are shown.
    assert.deepEqual(await page.eval(call(landNote)), landNoteAt(false));

    // One step of the slider: values cannot change (≈ 0.04 yd), the deltas,
    // both daggers and the footnote appear.
    await page.eval(`document.getElementById('slider').focus()`);
    await page.key('ArrowRight');
    await frames(page);
    const step = expectedControls(inputSlider(SEA_LEVEL, 10));
    assert.equal(step.elev, '10');
    assert.equal(step.carry, '282/258');
    assert.deepEqual(await page.eval(call(readControls)), step);
    const deltas = await page.eval(call(deltaLines));
    assert.equal(deltas.length, 69);
    for (const { text, hidden } of deltas) {
      assert.equal(hidden, false);
      assert.ok(text.startsWith('±0'), `delta ${text} after one 10 ft step`);
    }
    assert.deepEqual(await page.eval(call(landNote)), landNoteAt(true));

    // Enter commits the box, which is normalised while it keeps focus.
    await type(page, 'elev', '5280');
    await page.key('Enter');
    await frames(page);
    const committed = expectedControls(AT_5280);
    assert.equal(committed.elev, '5,280');
    assert.notEqual(committed.carry, '282/258');
    assert.deepEqual(await page.eval(call(readControls)), committed);
    assert.equal(await page.eval('document.activeElement.id'), 'elev');

    // Space on Δ % switches every delta to percent.
    await page.eval(`document.getElementById('mode-pct').focus()`);
    await page.key(' ');
    await frames(page);
    assert.equal(
      await page.eval(`document.getElementById('mode-pct').getAttribute('aria-pressed')`),
      'true',
    );
    assert.deepEqual(await page.eval(call(readCells)), expectedCells(setMode(AT_5280, 'pct')));
    assert.deepEqual(seen.problems, []);
  }));

for (const viewport of [NARROW, DESKTOP]) {
  test(`footer at ${viewport.width} px: Tab reaches the methods and GitHub links`, () =>
    withPage({ viewport }, async ({ page, seen, url }) => {
      await page.send('Emulation.setFocusEmulationEnabled', { enabled: true });
      await load(page, url('index.html'));
      await page.eval(`document.querySelector('footer').scrollIntoView()`);
      await frames(page);
      const stops = [];
      for (let i = 0; i < 20 && stops.at(-1)?.id !== 'repo-link'; i += 1) {
        await page.key('Tab');
        stops.push(await page.eval(call(footerStop)));
      }
      const footer = stops.filter(({ inFooter }) => inFooter);
      assert.deepEqual(
        footer.map(({ id }) => id),
        ['methods-link', '', 'repo-link'],
        JSON.stringify(stops.map(({ id }) => id)),
      );
      for (const stop of footer.filter(({ id }) => id !== '')) {
        const { id, outline, outlineWidth, left, right, height, clientWidth } = stop;
        assert.ok(outline !== 'none' && outlineWidth > 0, `#${id} shows no focus outline`);
        assert.ok(left >= 0 && right <= clientWidth, `#${id} spans ${left}…${right} px`);
        assert.ok(height >= 44, `#${id} is ${height} px tall`);
      }
      assert.deepEqual(seen.problems, []);
    }));
}

test('RF-4: 320 px phones and rotation', () =>
  withPage({ viewport: NARROW }, async ({ page, seen, url }) => {
    await load(page, url('index.html'));
    await settle(page);

    const first = await page.eval(call(measure));
    assert.equal(first.clientWidth, 320);
    assert.ok(first.scrollWidth <= first.clientWidth, `page is ${first.scrollWidth} px wide`);
    assert.ok(first.pinned.height <= 64, `pinned row is ${first.pinned.height} px tall`);
    // One line: the children share a centre line (the readout is shorter
    // than the 44 px controls and centred beside them).
    const centres = first.pinnedChildren.map(({ top, bottom }) => (top + bottom) / 2);
    assert.ok(
      Math.max(...centres) - Math.min(...centres) <= 2,
      `pinned row is not one line: ${JSON.stringify(first.pinnedChildren)}`,
    );
    assert.ok(atRightEdge(first.scrollers), JSON.stringify(first.scrollers));
    assert.ok(
      first.scrollers.every(({ max }) => max > 0),
      'the tables do not scroll at 320 px',
    );

    // The readout has a fixed width, so the slider does not change length.
    await page.eval(call(setSlider, 15000));
    await frames(page);
    await settle(page);
    const highest = await page.eval(call(measure));
    assert.equal(await page.eval(`document.getElementById('elev').value`), '15,000');
    assert.ok(
      Math.abs(highest.slider.width - first.slider.width) <= 1,
      `slider ${first.slider.width} → ${highest.slider.width} px`,
    );
    assert.ok(
      highest.scrollWidth <= highest.clientWidth,
      `page is ${highest.scrollWidth} px wide at 15,000 ft`,
    );
    // The delta lines and wider values arrive after the observer's last write.
    assert.ok(atRightEdge(highest.scrollers), JSON.stringify(highest.scrollers));

    await page.emulate(NARROW_LANDSCAPE);
    await frames(page);
    await settle(page);
    const landscape = await page.eval(call(measure));
    assert.ok(atRightEdge(landscape.scrollers), JSON.stringify(landscape.scrollers));

    // Scroll the PGA table left by hand, then rotate back.
    await page.eval(
      `document.querySelector('[data-tour="pga"] .scroller').scrollIntoView({ block: 'center' })`,
    );
    await frames(page);
    await page.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: NARROW_LANDSCAPE.width / 2,
      y: NARROW_LANDSCAPE.height / 2,
      deltaX: -150,
      deltaY: 0,
    });
    await page.waitFor(call(scrolledAway, 'pga'), 2000);
    await settle(page);
    const scrolled = (await page.eval(call(measure))).scrollers;
    await page.emulate(NARROW);
    await frames(page);
    await settle(page);
    const back = (await page.eval(call(measure))).scrollers;
    assert.equal(back[0].left, scrolled[0].left, 'the PGA table lost the position the user chose');
    assert.ok(
      atRightEdge([back[1]]),
      `the LPGA table left its right edge: ${JSON.stringify(back)}`,
    );

    // Safe-area insets, as on a phone held sideways.
    await page.emulate(NARROW_LANDSCAPE);
    await page.send('Emulation.setSafeAreaInsetsOverride', {
      insets: { top: 0, left: 40, right: 40, bottom: 0 },
    });
    await frames(page);
    for (const { selector, left, right } of await page.eval(
      call(paddings, ['#pinned', 'footer']),
    )) {
      assert.ok(left >= 40 && right >= 40, `${selector} padding ${left}/${right} px, insets 40 px`);
    }
    const inset = await page.eval(call(measure));
    assert.ok(
      inset.scrollWidth <= inset.clientWidth,
      `page is ${inset.scrollWidth} px wide with insets`,
    );
    assert.deepEqual(seen.problems, []);
  }));

test('RF-4: a table that widens between the pinning write and its scroll event stays pinned', () =>
  withPage({ viewport: NARROW }, async ({ page, seen, url }) => {
    await load(page, url('index.html'));
    const { written, left, max } = await page.eval(call(widenBetweenWriteAndScroll));
    assert.ok(written.widened, 'the first widening did not widen the table');
    assert.ok(
      Math.abs(written.left - written.max) <= 1,
      `the page did not pin the widened table: ${JSON.stringify(written)}`,
    );
    assert.ok(
      atRightEdge([{ left, max }]),
      `the PGA table was unpinned by the scroll event of its own pinning: ${left}/${max}`,
    );
    assert.deepEqual(seen.problems, []);
  }));

// Spec section 4.4: a phone table starts at its right edge so that Max
// Height, Land Angle and Carry all show beside the pinned Club column.
for (const [width, height] of [
  [320, 568],
  [360, 740],
  [375, 667],
]) {
  test(`RF-4: at ${width} px every changing column shows beside the Club column`, () =>
    withPage(
      { viewport: { width, height, mobile: true, deviceScaleFactor: 2 } },
      async ({ page, seen, url }) => {
        await load(page, url('index.html'));
        // At sea level, then at the top of the range in percent, the widest deltas.
        for (const [feet, mode] of [
          [0, 'abs'],
          [15000, 'pct'],
        ]) {
          await page.eval(call(setSlider, feet));
          await page.eval(`document.getElementById('mode-${mode}').click()`);
          await frames(page);
          await settle(page);
          const { scrollers } = await page.eval(call(measure));
          assert.ok(atRightEdge(scrollers), `${feet} ft: ${JSON.stringify(scrollers)}`);
          const hidden = await hiddenColumns(page);
          assert.equal(
            hidden.length,
            0,
            `${feet} ft, ${mode}: ${hidden.length} cells hidden, e.g. ${JSON.stringify(hidden.slice(0, 3))}`,
          );
        }
        assert.deepEqual(seen.problems, []);
      },
    ));
}

test('methods.html at 320 px: only equations and tables scroll', () =>
  withPage({ viewport: NARROW }, async ({ page, seen, url }) => {
    await load(page, url('methods.html'), 60000);
    const { scrollWidth, clientWidth } = await page.eval(call(pageWidth));
    assert.equal(clientWidth, 320);
    assert.ok(scrollWidth <= clientWidth, `page is ${scrollWidth} px wide`);
    assert.deepEqual(await page.eval(call(overflowing)), []);
    assert.deepEqual(seen.problems, []);
  }));

test('RF-5: with JavaScript disabled each page shows its <noscript> text', () =>
  withPage({}, async ({ page, seen, url }) => {
    await page.send('Emulation.setScriptExecutionDisabled', { value: true });
    for (const path of ['index.html', 'methods.html']) {
      await page.goto(url(path));
      const notice = await page.eval(call(visible, 'noscript .notice'));
      assert.match(notice.text ?? '', /needs? JavaScript/, path);
      assert.ok(notice.shown, `${path}: the <noscript> text is not visible`);
      assert.equal(await page.eval(`document.getElementById('load-error').hidden`), true, path);
    }
    assert.deepEqual(seen.problems, []);
  }));

for (const [label, serveOptions] of [
  ['a module fails to load', { fail404: ['/js/flight.js'] }],
  ['a module has a syntax error', { override: { '/js/units.js': 'export const = ;' } }],
]) {
  test(`RF-5: ${label}: #load-error and data-state="error" within 2 s`, () =>
    withPage({ serveOptions }, async ({ page, url }) => {
      for (const path of ['index.html', 'methods.html']) {
        const started = Date.now();
        await page.goto(url(path), { waitUntil: 'commit' });
        await page.waitFor(
          `location.pathname.endsWith('/${path}') && ${SHOWS_LOAD_ERROR}`,
          2000 - (Date.now() - started),
        );
        assert.ok(
          (await page.eval(call(visible, '#load-error'))).shown,
          `${path}: #load-error is not visible`,
        );
      }
    }));
}

// boot.js stands in for its own watchdog firing (or an unrelated early error)
// before the module starts; the module then starts normally.
const BOOT_REPORTS_FAILURE = `
window.bootReportedBeforeStart = document.documentElement.dataset.app !== 'started';
document.documentElement.dataset.state = 'error';
document.getElementById('load-error').hidden = false;
`;

test('a failure boot.js reported before the module started is cleared once it starts', () =>
  withPage(
    { serveOptions: { override: { '/js/boot.js': BOOT_REPORTS_FAILURE } } },
    async ({ page, seen, url }) => {
      for (const path of ['index.html', 'methods.html']) {
        await page.goto(url(path));
        assert.equal(
          await page.eval('window.bootReportedBeforeStart'),
          true,
          `${path}: boot.js did not report first`,
        );
        assert.equal(await page.waitFor(SETTLED, 60000), 'ready', path);
        assert.equal(await page.eval(`document.getElementById('load-error').hidden`), true, path);
      }
      assert.deepEqual(seen.problems, []);
    },
  ));

// At full speed calibration takes three ~8 ms slices, too few for a hidden
// tab's timer throttling to engage, so a timer-driven load would pass too;
// a slow phone's CPU makes it take enough slices to tell the two apart. A
// hidden tab runs boot.js's 10 s watchdog on whole-second wake-ups, up to
// about 12 s after navigation, so the notice is checked again once ready.
test('a background tab keeps #load-error hidden and reaches ready', () =>
  withPage({}, async ({ page, seen, browser: owner, url }) => {
    await page.send('Emulation.setCPUThrottlingRate', { rate: 10 });
    // Opened beforehand, so only the activation stands between the
    // navigation and the page going to the background.
    const front = await owner.newPage({ background: true });
    try {
      assert.equal(await page.eval('document.visibilityState'), 'visible');
      const started = Date.now();
      await page.goto(url('index.html'), { waitUntil: 'commit' });
      await owner.send('Target.activateTarget', { targetId: front.targetId });
      const hiddenWhile = await page.waitFor(
        `document.visibilityState === 'hidden' && ${STATE}`,
        2000,
      );
      assert.equal(hiddenWhile, 'loading', 'the page finished loading before it was hidden');
      await sleep(12000 - (Date.now() - started));
      assert.deepEqual(await page.eval(call(hiddenNotice)), { visibility: 'hidden', hidden: true });
      assert.equal(await page.waitFor(SETTLED, 30000 - (Date.now() - started)), 'ready');
      assert.deepEqual(await page.eval(call(hiddenNotice)), { visibility: 'hidden', hidden: true });
    } finally {
      await front.close();
    }
    assert.deepEqual(seen.problems, []);
  }));

// Snapshots the controls when the page is shown, after the page's own
// pageshow handler (registered by the module, before DOMContentLoaded): a
// reloaded page's form state is restored just before pageshow, and the
// calibration renders that follow would otherwise hide what it showed.
const SNAPSHOT_AT_PAGESHOW = `document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('elev') === null) {
    return;
  }
  addEventListener('pageshow', (event) => {
    window.atPageshow = { persisted: event.persisted, controls: (${readControls})() };
  });
});`;

for (const [label, extraArgs, restored] of [
  ['with the back/forward cache', [], true],
  ['without the back/forward cache', ['--disable-features=BackForwardCache'], false],
]) {
  test(`back/forward ${label}: the controls and the table agree`, () =>
    withPage({ extraArgs }, async ({ page, seen, url }) => {
      await page.send('Page.addScriptToEvaluateOnNewDocument', { source: SNAPSHOT_AT_PAGESHOW });
      await load(page, url('index.html'));
      await type(page, 'elev', '5280');
      await page.key('Enter');
      await page.eval(call(setUnit, 'm'));
      await frames(page);
      const before = setElevationUnit(AT_5280, 'm');
      assert.deepEqual(await page.eval(call(readControls)), expectedControls(before));

      await page.eval(`document.getElementById('methods-link').click()`);
      await page.waitFor(
        `location.pathname.endsWith('/methods.html') && document.readyState === 'complete'`,
        10000,
      );
      const { currentIndex, entries } = await page.send('Page.getNavigationHistory');
      await page.send('Page.navigateToHistoryEntry', { entryId: entries[currentIndex - 1].id });
      await page.waitFor(
        `location.pathname.endsWith('/index.html') && document.readyState === 'complete' && ${READY}`,
        20000,
      );
      await frames(page);
      await sleep(200);

      const expected = expectedControls(restored ? before : SEA_LEVEL);
      const shown = await page.eval('window.atPageshow');
      assert.equal(
        shown.persisted,
        restored,
        restored
          ? 'the page was not restored from the back/forward cache'
          : 'the page was not reloaded',
      );
      assert.deepEqual(shown.controls, expected, 'the controls disagreed when the page was shown');
      assert.deepEqual(await page.eval(call(readControls)), expected);
      assert.deepEqual(seen.problems, []);
    }));
}

test('sticky: the pinned row on a phone and the whole bar on desktop stay at the top', async () => {
  for (const [viewport, id] of [
    [PHONE, 'pinned'],
    [DESKTOP, 'controls'],
  ]) {
    await withPage({ viewport }, async ({ page, seen, url }) => {
      await load(page, url('index.html'));
      await page.eval(`document.querySelector('[data-tour="lpga"]').scrollIntoView()`);
      await frames(page);
      const { scrolled, top } = await page.eval(call(scrolledTo, id));
      assert.ok(scrolled > 200, `the page scrolled only ${scrolled} px`);
      assert.equal(top, 0, `#${id} at ${viewport.width} px`);
      assert.deepEqual(seen.problems, []);
    });
  }
});

// Spec section 4.1: a phone held sideways is as wide as a small desktop, but
// pinning the whole bar would cover half its height.
for (const [width, height] of [
  [844, 390],
  [932, 430],
]) {
  test(`sticky: a ${width}×${height} landscape phone pins only the compact row`, () =>
    withPage(
      { viewport: { width, height, mobile: true, deviceScaleFactor: 3 } },
      async ({ page, seen, url }) => {
        await load(page, url('index.html'));
        for (const [feet, mode] of [
          [0, 'abs'],
          [15000, 'pct'],
        ]) {
          await page.eval(call(setSlider, feet));
          await page.eval(`document.getElementById('mode-${mode}').click()`);
          await page.eval(`document.querySelector('[data-tour="lpga"]').scrollIntoView()`);
          await frames(page);
          await settle(page);
          const { scrolled, pinned } = await page.eval(call(pinnedAtTop));
          assert.ok(scrolled > 200, `the page scrolled only ${scrolled} px`);
          assert.equal(pinned.length, 1, `${feet} ft: pinned ${JSON.stringify(pinned)}`);
          const [{ id, top, height: tall }] = pinned;
          assert.equal(top, 0, `${feet} ft: #${id} at ${top} px`);
          assert.ok(tall <= 64, `${feet} ft: #${id} is ${tall} px tall`);
          assert.equal(id, 'pinned');
          const { scrollers } = await page.eval(call(measure));
          assert.ok(atRightEdge(scrollers), `${feet} ft: ${JSON.stringify(scrollers)}`);
          const hidden = await hiddenColumns(page);
          assert.equal(
            hidden.length,
            0,
            `${feet} ft, ${mode}: ${hidden.length} cells hidden, e.g. ${JSON.stringify(hidden.slice(0, 3))}`,
          );
        }
        assert.deepEqual(seen.problems, []);
      },
    ));
}

// Runner

browser = await launch();
let failed = 0;
try {
  for (const { name, fn } of cases) {
    const started = Date.now();
    try {
      await fn();
      console.log(`ok - ${name} (${Date.now() - started} ms)`);
    } catch (error) {
      failed += 1;
      console.log(`not ok - ${name} (${Date.now() - started} ms)`);
      console.log(String(error.stack ?? error).replace(/^/gm, '  '));
    }
  }
} finally {
  await browser.close();
}
console.log(`# e2e: ${cases.length - failed} passed, ${failed} failed`);
process.exitCode = failed === 0 ? 0 : 1;
