import { RHO0, densityRatio, pressureAtElevation } from './atmosphere.js';
import { TOURS } from './data.js';
import { createModel } from './model.js';
import { ORACLES, createOracleContext, formatBand } from './oracles.js';
import { ELLIPSIS, EM_DASH, MINUS } from './present.js';
import { M_PER_FT, radToDeg } from './units.js';
import { VERSION } from './version.js';

// boot.js's watchdog waits for this mark.
document.documentElement.dataset.app = 'started';

const root = document.documentElement;
const byId = (id) => document.getElementById(id);

const loadError = byId('load-error');
// As in app.js: a graph that fails to fetch, parse or link never runs this
// module, so a failure boot.js reported before this point was its watchdog
// on a slow load or an unrelated error.
root.dataset.state = 'loading';
loadError.hidden = true;
let failed = false;

function fail() {
  failed = true;
  root.dataset.state = 'error';
  loadError.hidden = false;
}

window.addEventListener('error', fail);
window.addEventListener('unhandledrejection', fail);

byId('version').textContent = VERSION;

function make(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  node.textContent = text;
  return node;
}

function signed(x, digits) {
  const size = Math.abs(x).toFixed(digits);
  if (Number(size) === 0) {
    return `±${size}`;
  }
  return `${x < 0 ? MINUS : '+'}${size}`;
}

// Calibration table: one row per table row, filled as each is calibrated.

const model = createModel();
const tourLabels = new Map(TOURS.map((tour) => [tour.id, tour.label]));

const calibrationRows = model.entries.map((entry) => {
  const tr = make('tr');
  const club = make('th', '', entry.row.club);
  club.scope = 'row';
  const fitted = {
    kD: make('td', 'num', ELLIPSIS),
    kL: make('td', 'num', ELLIPSIS),
    rhoKD: make('td', 'num', ELLIPSIS),
    rhoKL: make('td', 'num', ELLIPSIS),
    land: make('td', 'num', ELLIPSIS),
    difference: make('td', 'num', ELLIPSIS),
  };
  tr.append(
    make('td', '', tourLabels.get(entry.tourId)),
    club,
    fitted.kD,
    fitted.kL,
    fitted.rhoKD,
    fitted.rhoKL,
    fitted.land,
    make('td', 'num', `${entry.row.land}°`),
    fitted.difference,
  );
  return { entry, tr, fitted };
});
byId('calibration-table').tBodies[0].append(...calibrationRows.map(({ tr }) => tr));

function showCalibration({ entry, fitted }) {
  if (entry.status === 'failed') {
    for (const cell of Object.values(fitted)) {
      cell.textContent = EM_DASH;
    }
    console.error(`calibration failed for ${entry.key}`, entry.cal.reason);
    fail();
    return;
  }
  const { kD, kL, sea } = entry.cal;
  // The difference is taken from the shown angle, so the two columns agree.
  const land = radToDeg(sea.landRad).toFixed(1);
  fitted.kD.textContent = kD.toFixed(3);
  fitted.kL.textContent = kL.toFixed(3);
  fitted.rhoKD.textContent = (RHO0 * kD).toFixed(3);
  fitted.rhoKL.textContent = (RHO0 * kL).toFixed(3);
  fitted.land.textContent = `${land}°`;
  fitted.difference.textContent = `${signed(Number(land) - entry.row.land, 1)}°`;
}

// Validation table: one row per oracle, filled as each is evaluated.

function linkList(sources) {
  const list = make('ul', 'refs');
  for (const { label, url } of sources) {
    const link = make('a', '', label);
    link.href = url;
    const item = make('li');
    item.append(link);
    list.append(item);
  }
  return list;
}

const validationRows = ORACLES.map((oracle) => {
  const tr = make('tr');
  const id = make('th', '', oracle.id);
  id.scope = 'row';
  const measures = make('td');
  measures.append(make('span', 'case', oracle.title), oracle.measures);
  const sources = make('td');
  sources.append(linkList(oracle.sources));
  const expected = make('td');
  expected.append(make('span', 'expected', oracle.expected));
  // An ordering or sign oracle has no band; formatBand rejects null.
  if (oracle.band !== null) {
    expected.append(make('span', 'band', `band ${formatBand(oracle.band)}`));
  }
  const value = make('td', '', ELLIPSIS);
  const result = make('td', 'result', ELLIPSIS);
  tr.append(
    id,
    make('td', '', oracle.kind),
    measures,
    make('td', '', oracle.condition),
    sources,
    expected,
    value,
    result,
  );
  return { oracle, tr, value, result };
});
byId('validation-table').tBodies[0].append(...validationRows.map(({ tr }) => tr));

function showOracle({ oracle, value, result }, outcome) {
  value.textContent = outcome.display;
  if (outcome.pass) {
    result.textContent = 'PASS';
  } else {
    result.textContent = oracle.kind === 'hard' ? 'FAIL' : 'soft-fail';
  }
  // oracles.js reports a row or shot the model could not fly as a NaN value.
  if (Number.isNaN(outcome.value)) {
    console.error(`oracle ${oracle.id}: ${outcome.display}`);
    fail();
  }
}

// One grid for both monotonicity sweeps (9a and 9b), as spec section 6 names
// a single 500 ft grid; CI keeps its finer defaults.
const GRID_FT = 500;
const TOP_FT = 15000;

// A sweep asks for the deltas at every grid elevation inside one call (9a
// alone is 21 full recomputes), so the grid is computed beforehand, one
// elevation per macrotask, and the oracles read it from this cache. The keys
// are computed exactly as oracles.js computes its grid ratios; a key that
// missed would only cost a recompute.
const gridDeltas = new Map();
const gridRatios = [];
for (let ft = 0; ft <= TOP_FT; ft += GRID_FT) {
  gridRatios.push(densityRatio(pressureAtElevation(ft * M_PER_FT)));
}

// The page's one calibrated model, reading grid deltas through the cache.
const cachedModel = {
  ...model,
  deltasAt: (rhoRatio) => gridDeltas.get(rhoRatio) ?? model.deltasAt(rhoRatio),
};
let ctx = null;

// Work runs in macrotasks that yield through a message, which background
// tabs do not throttle as they do timers: calibration in ~8 ms slices as on
// the main page, then one grid elevation or one oracle per task.

const SLICE_MS = 8;
const channel = new MessageChannel();
let step = null;

function next(task) {
  step = task;
  channel.port2.postMessage(null);
}

let shown = 0;

function calibrateSlice() {
  const start = performance.now();
  while (!model.isComplete() && performance.now() - start < SLICE_MS) {
    model.calibrateNext();
  }
  while (shown < calibrationRows.length && calibrationRows[shown].entry.status !== 'pending') {
    showCalibration(calibrationRows[shown]);
    shown += 1;
  }
  if (!model.isComplete()) {
    next(calibrateSlice);
    return;
  }
  // Every row is calibrated, so this does not calibrate again.
  ctx = createOracleContext(cachedModel);
  next(warmGrid(0));
}

function warmGrid(i) {
  return () => {
    gridDeltas.set(gridRatios[i], model.deltasAt(gridRatios[i]));
    next(i + 1 < gridRatios.length ? warmGrid(i + 1) : evaluate(0));
  };
}

function evaluate(i) {
  return () => {
    const row = validationRows[i];
    showOracle(row, row.oracle.evaluate(ctx, { gridFt: GRID_FT }));
    if (i + 1 < validationRows.length) {
      next(evaluate(i + 1));
      return;
    }
    gridDeltas.clear();
    if (!failed) {
      root.dataset.state = 'ready';
    }
  };
}

channel.port1.addEventListener('message', () => step());
channel.port1.start();
next(calibrateSlice);
