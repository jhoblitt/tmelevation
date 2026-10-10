import {
  MAX_ELEVATION_M,
  MAX_PRESSURE_PA,
  MIN_ELEVATION_M,
  MIN_PRESSURE_PA,
  P0_PA,
  densityRatio,
  elevationAtPressure,
  pressureAtElevation,
} from './atmosphere.js';
import { MINUS } from './present.js';
import { M_PER, PA_PER } from './units.js';

// The boxes take the whole range the model covers; the slider keeps to
// 0–15,000 ft.
const SLIDER_MAX_M = 15000 * M_PER.ft;

function elevationUnit(unit, step, one, many) {
  return {
    min: MIN_ELEVATION_M / M_PER[unit],
    max: MAX_ELEVATION_M / M_PER[unit],
    sliderMax: SLIDER_MAX_M / M_PER[unit],
    step,
    one,
    many,
  };
}

const ELEVATION = {
  ft: elevationUnit('ft', 10, 'foot', 'feet'),
  m: elevationUnit('m', 5, 'metre', 'metres'),
};
const ELEVATION_HALF_STEP = 0.5;
const PRESSURE_DECIMALS = { inHg: 2, kPa: 2, mbar: 1 };

// Grouping by `,` (`1,234`), then a comma that is not a thousands separator
// may stand for the decimal point (`84,3`). The page writes a minus as
// U+2212, so that is accepted as well as `-`.
const NUMBER = /^\s*([-−]?)(\d+(?:,\d{3})*)(?:[.,](\d*))?\s*$/;

export function parseNumber(text) {
  const match = NUMBER.exec(text);
  if (match === null) {
    return null;
  }
  const [, sign, whole, fraction] = match;
  const value = Number(`${sign && '-'}${whole.replaceAll(',', '')}.${fraction || '0'}`);
  return Number.isFinite(value) ? value : null;
}

// en-US grouping whatever the browser's locale, with the page's minus sign.
function grouped(x, decimals) {
  const [whole, fraction] = x.toFixed(decimals).split('.');
  const digits = whole.replace(/\B(?=(\d{3})+$)/g, ',').replace('-', MINUS);
  return fraction === undefined ? digits : `${digits}.${fraction}`;
}

function clampPa(pa) {
  return Math.min(Math.max(pa, MIN_PRESSURE_PA), MAX_PRESSURE_PA);
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
      value <= MAX_PRESSURE_PA / PA_PER[unit] + halfStep,
  };
}

// The ends are taken before converting: pressureAtElevation is NaN for an
// elevation far outside the range.
function elevationPa(value, unit) {
  const { min, max } = ELEVATION[unit];
  const inRange = value >= min - ELEVATION_HALF_STEP && value <= max + ELEVATION_HALF_STEP;
  if (value <= min) {
    return { pa: MAX_PRESSURE_PA, inRange };
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
  const { sliderMax } = ELEVATION[state.elevUnit];
  return { ...state, pa: elevationPa(Math.min(value, sliderMax), state.elevUnit).pa, edit: null };
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
  // Past either end the slider stays at that end, and only its value text
  // says where the state is.
  let outside = '';
  if (shownElevation < 0) {
    outside = ', below the slider';
  } else if (shownElevation > elevation.sliderMax) {
    outside = ', beyond the slider';
  }
  const noun = Math.abs(shownElevation) === 1 ? elevation.one : elevation.many;
  return {
    elevText: edit?.field === 'elev' ? edit.text : elevText,
    pressText: edit?.field === 'press' ? edit.text : pressText,
    elevInvalid: edit?.field === 'elev' && !edit.valid,
    pressInvalid: edit?.field === 'press' && !edit.valid,
    slider: {
      min: 0,
      max: elevation.sliderMax,
      step: elevation.step,
      value: Math.min(Math.max(shownElevation, 0), elevation.sliderMax),
      valueText: `${elevText} ${noun}${outside}`,
    },
    readout,
    atSeaLevel,
    rhoRatio: densityRatio(pa),
    captionText: atSeaLevel ? '' : `at ${readout}`,
  };
}
