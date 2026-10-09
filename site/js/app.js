import {
  commitElevation,
  commitPressure,
  initialState,
  inputElevation,
  inputPressure,
  inputSlider,
  setElevationUnit,
  setMode,
  setPressureUnit,
  view,
} from './controls.js';
import { TOURS } from './data.js';
import { createModel } from './model.js';
import { angleCell, distanceCell, launchCells, rowStatus } from './present.js';
import { VERSION } from './version.js';

// boot.js's watchdog waits for this mark.
document.documentElement.dataset.app = 'started';

const root = document.documentElement;
const byId = (id) => document.getElementById(id);

const loadError = byId('load-error');
// A graph that fails to fetch, parse or link never runs this module, so a
// failure boot.js reported before this point was its watchdog on a slow
// load or an unrelated error, and the calculator is in fact starting.
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

// [key, header lines, unit line]; the last three are the modelled columns.
const COLUMNS = [
  ['clubSpeed', ['Club Speed'], '(mph)'],
  ['attack', ['Attack Angle'], '(deg)'],
  ['ballSpeed', ['Ball Speed'], '(mph)'],
  ['smash', ['Smash', 'Factor'], ''],
  ['launch', ['Launch Angle'], '(deg)'],
  ['spin', ['Spin Rate'], '(rpm)'],
  ['maxHeight', ['Max Height'], '(yards/meters)'],
  ['land', ['Land Angle'], '(deg)'],
  ['carry', ['Carry'], '(yards/meters)'],
];
const MODELLED = {
  maxHeight: { present: distanceCell, delta: 'maxHeightYd' },
  land: { present: angleCell, delta: 'landDeg' },
  carry: { present: distanceCell, delta: 'carryYd' },
};

function make(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  node.textContent = text;
  return node;
}

// Every cell has a value line and a delta line, so a row's values align.
function twoLine(cell, value) {
  const v = make('span', 'v', value);
  const d = make('span', 'd');
  d.setAttribute('aria-hidden', 'true');
  cell.append(v, d);
  return { v, d };
}

const cells = [];
const captions = [];
const daggers = [];
const scrollers = [];

function header() {
  const row = make('tr');
  const club = make('th', 'club');
  club.scope = 'col';
  club.append(make('span', 'sr', 'Club'));
  row.append(club);
  for (const [key, lines, unit] of COLUMNS) {
    const th = make('th');
    th.scope = 'col';
    for (const line of lines) {
      th.append(make('span', 'name', line));
    }
    if (key === 'land') {
      const dagger = make('span', 'dagger hidden', '†');
      daggers.push(dagger);
      th.lastChild.append(dagger);
    }
    if (unit) {
      th.append(unitLine(unit));
    }
    row.append(th);
  }
  return row;
}

// Chrome does not break after the slash in "(yards/meters)"; a narrow
// screen needs that line to wrap there.
function unitLine(unit) {
  const span = make('span', 'unit');
  const [first, ...rest] = unit.split('/');
  span.append(first);
  for (const part of rest) {
    span.append('/', document.createElement('wbr'), part);
  }
  return span;
}

function body(tour) {
  return tour.rows.map((row, index) => {
    const tr = make('tr');
    const club = make('th', 'club');
    club.scope = 'row';
    twoLine(club, row.club);
    tr.append(club);
    const launch = launchCells(row);
    for (const [col] of COLUMNS) {
      const td = make('td');
      tr.append(td);
      if (!MODELLED[col]) {
        twoLine(td, launch[col]);
        continue;
      }
      const key = `${tour.id}:${index}`;
      td.dataset.col = col;
      td.dataset.key = key;
      const { v, d } = twoLine(td, '');
      const sr = make('span', 'sr');
      td.append(sr);
      cells.push({ key, col, row, v, d, sr });
    }
    return tr;
  });
}

function section(tour) {
  const node = make('section');
  node.dataset.tour = tour.id;
  const titleId = `${tour.id}-title`;
  node.setAttribute('aria-labelledby', titleId);

  const title = make('div', 'title');
  const h2 = make('h2');
  h2.id = titleId;
  h2.append(make('span', 'tour', tour.title), ' ', make('span', 'units', 'YARDS/METERS'));
  title.append(h2, make('span', 'year', String(tour.year)));

  const caption = make('p', 'caption');
  captions.push(caption);

  const scroller = make('div', 'scroller');
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', `${tour.label} averages table`);
  scroller.tabIndex = 0;
  scrollers.push(scroller);

  const table = make('table');
  table.setAttribute('aria-labelledby', titleId);
  const thead = make('thead');
  thead.append(header());
  const tbody = make('tbody');
  tbody.append(...body(tour));
  table.append(thead, tbody);
  scroller.append(table);

  node.append(title, caption, scroller);
  return node;
}

const footnote = byId('land-footnote');
for (const tour of TOURS) {
  footnote.before(section(tour));
}
daggers[0].id = 'land-dagger';
byId('version').textContent = VERSION;

// Rendering

const controls = {
  elev: byId('elev'),
  elevUnit: byId('elev-unit'),
  press: byId('press'),
  pressUnit: byId('press-unit'),
  slider: byId('slider'),
  readout: byId('readout'),
  modeAbs: byId('mode-abs'),
  modePct: byId('mode-pct'),
};

const model = createModel();
let state = initialState();
let frame = 0;
const reported = new Set();

function setText(node, text) {
  if (node.textContent !== text) {
    node.textContent = text;
  }
}

function setValue(input, text) {
  if (input.value !== text) {
    input.value = text;
  }
}

// A range input snaps its value to a step, and 4,572 m is not a multiple of
// 5, so the DOM range ends at the next step and the state clamps the excess.
function renderSlider({ slider }) {
  const node = controls.slider;
  const domMax = Math.ceil(slider.max / slider.step) * slider.step;
  node.min = String(slider.min);
  node.max = String(domMax);
  node.step = String(slider.step);
  const position = slider.value === slider.max ? domMax : slider.value;
  if (node.valueAsNumber !== position) {
    node.value = String(position);
  }
  node.setAttribute('aria-valuetext', slider.valueText);
}

function renderControls(v) {
  setValue(controls.elev, v.elevText);
  setValue(controls.press, v.pressText);
  controls.elev.setAttribute('aria-invalid', String(v.elevInvalid));
  controls.press.setAttribute('aria-invalid', String(v.pressInvalid));
  controls.elevUnit.value = state.elevUnit;
  controls.pressUnit.value = state.pressUnit;
  renderSlider(v);
  setText(controls.readout, v.readout);
  controls.modeAbs.setAttribute('aria-pressed', String(state.mode === 'abs'));
  controls.modePct.setAttribute('aria-pressed', String(state.mode === 'pct'));
  for (const caption of captions) {
    setText(caption, v.captionText);
  }
  for (const dagger of daggers) {
    dagger.classList.toggle('hidden', v.atSeaLevel);
  }
  footnote.hidden = v.atSeaLevel;
}

function renderCells(v) {
  const deltas = model.deltasAt(v.rhoRatio);
  for (const cell of cells) {
    const { status: entryStatus, delta } = deltas.get(cell.key);
    const status = rowStatus(entryStatus, delta);
    if (status === 'failed' && !reported.has(cell.key)) {
      reported.add(cell.key);
      console.error(`model failed for ${cell.key}`, delta ?? 'calibration');
      fail();
    }
    const { present, delta: field } = MODELLED[cell.col];
    const shown = present(cell.row[cell.col], delta?.[field], {
      mode: state.mode,
      showDelta: !v.atSeaLevel,
      status,
    });
    setText(cell.v, shown.value);
    setText(cell.d, shown.delta);
    cell.d.classList.toggle('hidden', shown.deltaHidden);
    setText(cell.sr, shown.a11y);
  }
}

function render() {
  cancelAnimationFrame(frame);
  frame = 0;
  const v = view(state);
  renderControls(v);
  renderCells(v);
}

function update(next) {
  state = next;
  if (frame === 0) {
    frame = requestAnimationFrame(render);
  }
}

// Events

function bindBox(input, onInput, onCommit) {
  const commit = () => update(onCommit(state));
  input.addEventListener('input', () => update(onInput(state, input.value)));
  input.addEventListener('change', commit);
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      commit();
    }
  });
}

bindBox(controls.elev, inputElevation, commitElevation);
bindBox(controls.press, inputPressure, commitPressure);
controls.slider.addEventListener('input', () =>
  update(inputSlider(state, controls.slider.valueAsNumber)),
);
controls.elevUnit.addEventListener('change', () =>
  update(setElevationUnit(state, controls.elevUnit.value)),
);
controls.pressUnit.addEventListener('change', () =>
  update(setPressureUnit(state, controls.pressUnit.value)),
);
controls.modeAbs.addEventListener('click', () => update(setMode(state, 'abs')));
controls.modePct.addEventListener('click', () => update(setMode(state, 'pct')));
// Back/forward restores can bring back control values the state never had.
window.addEventListener('pageshow', render);

// A scroller stays pinned to its right edge, where the modelled columns are,
// until the user scrolls it away. Observing sizes covers viewport resizes
// and rotation as well as font swaps and delta lines that widen the table.
const pinnedRight = new Map(scrollers.map((scroller) => [scroller, true]));

function atRightEdge(scroller) {
  return scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft <= 1;
}

const written = new Map();

const resizes = new ResizeObserver(() => {
  for (const [scroller, pinned] of pinnedRight) {
    if (pinned) {
      const left = scroller.scrollWidth - scroller.clientWidth;
      written.set(scroller, left);
      scroller.scrollLeft = left;
    }
  }
});

function onScroll(scroller) {
  // The event of the observer's own write says nothing about the user, and
  // the table may have widened before it arrived, so that position need not
  // read as the right edge any more.
  if (Math.abs(scroller.scrollLeft - written.get(scroller)) <= 1) {
    return;
  }
  written.delete(scroller);
  pinnedRight.set(scroller, atRightEdge(scroller));
}

for (const scroller of scrollers) {
  scroller.addEventListener('scroll', () => onScroll(scroller), { passive: true });
  resizes.observe(scroller);
  resizes.observe(scroller.firstChild);
}

// Load: paint the published tables, then calibrate in ~8 ms slices that
// yield through a message, which background tabs do not throttle as they
// do timers.

render();

const SLICE_MS = 8;
const channel = new MessageChannel();

function calibrateSlice() {
  const start = performance.now();
  while (!model.isComplete() && performance.now() - start < SLICE_MS) {
    model.calibrateNext();
  }
  render();
  if (!model.isComplete()) {
    channel.port2.postMessage(null);
  } else if (!failed) {
    root.dataset.state = 'ready';
  }
}

channel.port1.addEventListener('message', calibrateSlice);
channel.port1.start();
channel.port2.postMessage(null);
