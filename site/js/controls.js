import {
  MAX_ELEVATION_M,
  MIN_PRESSURE_PA,
  P0_PA,
  densityRatio,
  elevationAtPressure,
  pressureAtElevation,
} from './atmosphere.js';
import { M_PER, PA_PER } from './units.js';

const ELEVATION = {
  ft: { max: 15000, step: 10, one: 'foot', many: 'feet' },
  m: { max: MAX_ELEVATION_M, step: 5, one: 'metre', many: 'metres' },
};
const ELEVATION_HALF_STEP = 0.5;
const PRESSURE_DECIMALS = { inHg: 2, kPa: 2, mbar: 1 };

// Grouping by `,` (`1,234`), then a comma that is not a thousands separator
// may stand for the decimal point (`84,3`).
const NUMBER = /^\s*(-?)(\d+(?:,\d{3})*)(?:[.,](\d*))?\s*$/;

export function parseNumber(text) {
  const match = NUMBER.exec(text);
  if (match === null) {
    return null;
  }
  const [, sign, whole, fraction] = match;
  const value = Number(`${sign}${whole.replaceAll(',', '')}.${fraction || '0'}`);
  return Number.isFinite(value) ? value : null;
}

// en-US grouping whatever the browser's locale.
function grouped(x, decimals) {
  const [whole, fraction] = x.toFixed(decimals).split('.');
  const digits = whole.replace(/\B(?=(\d{3})+$)/g, ',');
  return fraction === undefined ? digits : `${digits}.${fraction}`;
}

function clampPa(pa) {
  return Math.min(Math.max(pa, MIN_PRESSURE_PA), P0_PA);
}

// Both boxes decide range membership on the number as typed, in its own unit,
// and then clamp in pressure space: the conversions do not round-trip
// bit-exactly, so a converted value is never compared with a range end. Half
// a display step of tolerance lets the text a box shows at either end of the
// range be typed back.
function pressurePa(value, unit) {
  const halfStep = 0.5 / 10 ** PRESSURE_DECIMALS[unit];
  return {
    pa: clampPa(value * PA_PER[unit]),
    inRange:
      value >= MIN_PRESSURE_PA / PA_PER[unit] - halfStep &&
      value <= P0_PA / PA_PER[unit] + halfStep,
  };
}

// The ends are taken before converting: pressureAtElevation is NaN for an
// elevation far outside the range.
function elevationPa(value, unit) {
  const { max } = ELEVATION[unit];
  const inRange = value >= -ELEVATION_HALF_STEP && value <= max + ELEVATION_HALF_STEP;
  if (value <= 0) {
    return { pa: P0_PA, inRange };
  }
  if (value >= max) {
    return { pa: MIN_PRESSURE_PA, inRange };
  }
  return { pa: clampPa(pressureAtElevation(value * M_PER[unit])), inRange };
}

function typed(state, field, text, toPa, unit) {
  const value = parseNumber(text);
  const target = value === null ? null : toPa(value, unit);
  const valid = target !== null && target.inRange;
  return { ...state, pa: valid ? target.pa : state.pa, edit: { field, text, valid } };
}

// Out-of-range text clamps; unparseable text is dropped, so the box reverts.
function committed(state, field, toPa, unit) {
  if (state.edit?.field !== field) {
    return { ...state };
  }
  const value = parseNumber(state.edit.text);
  const pa = value === null ? state.pa : toPa(value, unit).pa;
  return { ...state, pa, edit: null };
}

function withoutEdit(state, field) {
  return state.edit?.field === field ? null : state.edit;
}

export function initialState() {
  return { pa: P0_PA, elevUnit: 'ft', pressUnit: 'inHg', mode: 'abs', edit: null };
}

export function inputElevation(state, text) {
  return typed(state, 'elev', text, elevationPa, state.elevUnit);
}

export function commitElevation(state) {
  return committed(state, 'elev', elevationPa, state.elevUnit);
}

export function inputPressure(state, text) {
  return typed(state, 'press', text, pressurePa, state.pressUnit);
}

export function commitPressure(state) {
  return committed(state, 'press', pressurePa, state.pressUnit);
}

// The slider moves the state both boxes show, so neither keeps a pending edit.
export function inputSlider(state, value) {
  return { ...state, pa: elevationPa(value, state.elevUnit).pa, edit: null };
}

export function setElevationUnit(state, unit) {
  return { ...state, elevUnit: unit, edit: withoutEdit(state, 'elev') };
}

export function setPressureUnit(state, unit) {
  return { ...state, pressUnit: unit, edit: withoutEdit(state, 'press') };
}

export function setMode(state, mode) {
  return { ...state, mode };
}

export function view(state) {
  const { pa, elevUnit, pressUnit, edit } = state;
  const elevation = ELEVATION[elevUnit];
  const shownElevation = Math.round(elevationAtPressure(pa) / M_PER[elevUnit]);
  const elevText = grouped(shownElevation, 0);
  const pressText = grouped(pa / PA_PER[pressUnit], PRESSURE_DECIMALS[pressUnit]);
  const readout = `${elevText} ${elevUnit} · ${pressText} ${pressUnit}`;
  const atSeaLevel = shownElevation === 0;
  return {
    elevText: edit?.field === 'elev' ? edit.text : elevText,
    pressText: edit?.field === 'press' ? edit.text : pressText,
    elevInvalid: edit?.field === 'elev' && !edit.valid,
    pressInvalid: edit?.field === 'press' && !edit.valid,
    slider: {
      min: 0,
      max: elevation.max,
      step: elevation.step,
      value: shownElevation,
      valueText: `${elevText} ${shownElevation === 1 ? elevation.one : elevation.many}`,
    },
    readout,
    atSeaLevel,
    rhoRatio: densityRatio(pa),
    captionText: atSeaLevel ? '' : `at ${readout}`,
  };
}
