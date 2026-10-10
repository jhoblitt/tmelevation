import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PRESSURE_PA, MIN_PRESSURE_PA, P0_PA } from '../../site/js/atmosphere.js';
import {
  commitElevation,
  commitPressure,
  initialState,
  inputElevation,
  inputPressure,
  inputSlider,
  parseNumber,
  setElevationUnit,
  setMode,
  setPressureUnit,
  view,
} from '../../site/js/controls.js';

const input = { elev: inputElevation, press: inputPressure };
const commit = { elev: commitElevation, press: commitPressure };
const setUnit = { elev: setElevationUnit, press: setPressureUnit };
const invalidFlag = { elev: 'elevInvalid', press: 'pressInvalid' };
const textOf = { elev: 'elevText', press: 'pressText' };

const PRESSURE_UNITS = ['inHg', 'kPa', 'mbar'];
const SLIDER_FEET = [0, 1000, 5280, 10000, 15000];
// Elevations only the boxes reach, out to both ends of their range.
const BOX_FEET = [-3700, -1000, 20000, 30000, 36000];

const atFeet = (ft) => inputSlider(initialState(), ft);
const typedFeet = (ft) => commitElevation(inputElevation(initialState(), String(ft)));
const AT_FLOOR = typedFeet(-3700);
const AT_CEILING = typedFeet(36000);
const EVERY_FEET = [
  ...SLIDER_FEET.map((ft) => [ft, atFeet(ft)]),
  ...BOX_FEET.map((ft) => [ft, typedFeet(ft)]),
];

function near(actual, expected, tolerance) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

test('parseNumber reads thousands separators and either decimal separator', () => {
  const cases = [
    ['5280', 5280],
    ['5,280', 5280],
    ['84,3', 84.3],
    [' 29.92 ', 29.92],
    ['1,013.2', 1013.2],
    ['1,013', 1013],
    ['5,2', 5.2],
    ['84.', 84],
    ['-5', -5],
    ['−5', -5],
    ['−3,700', -3700],
    [' −1,128.26 ', -1128.26],
    ['1,000,000', 1000000],
    ['5,2803', 5.2803],
    ['1,234,5', 1234.5],
  ];
  for (const [text, expected] of cases) {
    assert.equal(parseNumber(text), expected, JSON.stringify(text));
  }
});

test('parseNumber rejects anything outside the grammar', () => {
  const rejected = [
    '',
    ' ',
    '-',
    'abc',
    '12a',
    '1,2,3',
    '1e5',
    'Infinity',
    '–5',
    '− 5',
    '−-5',
    '--5',
    '+5',
    '.5',
    '1.2.3',
    '1.234,5',
    '1 000',
    `1${'0'.repeat(400)}`,
  ];
  for (const text of rejected) {
    assert.equal(parseNumber(text), null, JSON.stringify(text));
  }
});

test('the initial state is sea level in feet and inches of mercury', () => {
  assert.deepEqual(initialState(), {
    pa: P0_PA,
    elevUnit: 'ft',
    pressUnit: 'inHg',
    mode: 'abs',
    edit: null,
  });
});

test('the initial view shows sea level', () => {
  assert.deepEqual(view(initialState()), {
    elevText: '0',
    pressText: '29.92',
    elevInvalid: false,
    pressInvalid: false,
    slider: { min: 0, max: 15000, step: 10, value: 0, valueText: '0 feet' },
    readout: '0 ft · 29.92 inHg',
    atSeaLevel: true,
    rhoRatio: 1,
    captionText: '',
  });
});

test('typing 5280 ft moves the state and every other view of it', () => {
  const s = inputElevation(initialState(), '5280');
  assert.deepEqual(s.edit, { field: 'elev', text: '5280', valid: true });

  const v = view(s);
  assert.equal(v.elevText, '5280');
  assert.equal(v.elevInvalid, false);
  assert.equal(v.pressText, '24.64');
  assert.equal(view(setPressureUnit(s, 'kPa')).pressText, '83.43');
  assert.equal(view(setPressureUnit(s, 'mbar')).pressText, '834.3');
  assert.equal(v.slider.value, 5280);
  assert.equal(v.slider.valueText, '5,280 feet');
  near(v.rhoRatio, 0.823408, 1e-6);
  assert.equal(v.readout, '5,280 ft · 24.64 inHg');
  assert.equal(v.captionText, 'at 5,280 ft · 24.64 inHg');
  assert.equal(v.atSeaLevel, false);

  const committed = commitElevation(s);
  assert.equal(committed.edit, null);
  assert.ok(Object.is(committed.pa, s.pa));
  assert.equal(view(committed).elevText, '5,280');

  const metres = view(setElevationUnit(committed, 'm'));
  assert.equal(metres.elevText, '1,609');
  assert.equal(metres.slider.valueText, '1,609 metres');
  assert.equal(metres.readout, '1,609 m · 24.64 inHg');
});

test('the box being edited shows its text verbatim', () => {
  const s = inputElevation(initialState(), ' 5,280 ');
  assert.equal(view(s).elevText, ' 5,280 ');
  assert.equal(view(inputPressure(s, '24,6')).pressText, '24,6');
});

test('the slider value text names a single unit in the singular', () => {
  assert.equal(view(inputElevation(initialState(), '1')).slider.valueText, '1 foot');
  assert.equal(
    view(inputElevation(initialState(), '-1')).slider.valueText,
    '−1 foot, below the slider',
  );
  const metres = setElevationUnit(initialState(), 'm');
  assert.equal(view(inputElevation(metres, '1')).slider.valueText, '1 metre');
  assert.equal(view(inputElevation(metres, '-1')).slider.valueText, '−1 metre, below the slider');
});

test('past either end of the slider it stays at that end, and its value text says so', () => {
  const cases = [
    ['20000', 'ft', 15000, '20,000 feet, beyond the slider'],
    ['20000', 'm', 4572, '6,096 metres, beyond the slider'],
    ['15010', 'm', 4572, '4,575 metres, beyond the slider'],
    ['36000', 'ft', 15000, '36,000 feet, beyond the slider'],
    ['-1000', 'ft', 0, '−1,000 feet, below the slider'],
    ['-1000', 'm', 0, '−305 metres, below the slider'],
    ['-3700', 'ft', 0, '−3,700 feet, below the slider'],
  ];
  for (const [feet, unit, value, valueText] of cases) {
    const s = setElevationUnit(typedFeet(feet), unit);
    const { slider, elevText, readout, captionText } = view(s);
    assert.deepEqual(
      slider,
      { min: 0, max: unit === 'ft' ? 15000 : 4572, step: unit === 'ft' ? 10 : 5, value, valueText },
      `${feet} ft in ${unit}`,
    );
    // Only the slider stays put: the box, readout and caption show the state.
    assert.ok(valueText.startsWith(`${elevText} `), valueText);
    assert.ok(readout.startsWith(`${elevText} ${unit} · `), readout);
    assert.equal(captionText, `at ${readout}`);
  }
  // The slider's own end is not past it.
  assert.equal(view(atFeet(15000)).slider.valueText, '15,000 feet');
  assert.equal(view(setElevationUnit(atFeet(15000), 'm')).slider.valueText, '4,572 metres');
});

test('the slider moves a state past either end back into its range', () => {
  for (const [from, to, text] of [
    [AT_CEILING, 14990, '14,990'],
    [typedFeet(20000), 15000, '15,000'],
    [AT_FLOOR, 10, '10'],
    [typedFeet(-1), 0, '0'],
  ]) {
    const moved = inputSlider(from, to);
    assert.ok(Object.is(moved.pa, atFeet(to).pa), `${view(from).elevText} → ${to}`);
    assert.equal(view(moved).elevText, text);
    assert.doesNotMatch(view(moved).slider.valueText, /slider/);
  }
  // The metres slider's DOM range ends a step past 4,572 m (app.js).
  const metres = setElevationUnit(AT_CEILING, 'm');
  assert.ok(Object.is(inputSlider(metres, 4575).pa, atFeet(15000).pa));
});

test('sea level is a shown elevation of exactly 0, so just below it the changes show', () => {
  for (const [box, text, atSeaLevel, elevText] of [
    ['elev', '-0.4', true, '0'],
    ['elev', '-0.6', false, '−1'],
    ['elev', '−1', false, '−1'],
    ['press', '29.93', false, '−8'],
    ['press', '30.00', false, '−73'],
  ]) {
    const v = view(commit[box](input[box](initialState(), text)));
    assert.equal(v.atSeaLevel, atSeaLevel, text);
    assert.equal(v.elevText, elevText, text);
    assert.equal(v.captionText, atSeaLevel ? '' : `at ${v.readout}`, text);
  }
});

test('switching units in either box never changes the state', () => {
  for (const [ft, s] of EVERY_FEET) {
    assert.equal(parseNumber(view(s).elevText), ft);
    let moved = s;
    for (const unit of ['m', 'ft', 'm']) {
      moved = setElevationUnit(moved, unit);
      assert.ok(Object.is(moved.pa, s.pa), `${ft} ft → ${unit}`);
    }
    for (const unit of [...PRESSURE_UNITS, 'kPa']) {
      moved = setPressureUnit(moved, unit);
      assert.ok(Object.is(moved.pa, s.pa), `${ft} ft → ${unit}`);
    }
  }
});

test('typing the displayed pressure back moves the displayed elevation by at most 15 ft', () => {
  for (const [ft, state] of EVERY_FEET) {
    for (const unit of PRESSURE_UNITS) {
      const s = setPressureUnit(state, unit);
      const after = commitPressure(inputPressure(s, view(s).pressText));
      const moved = Math.abs(parseNumber(view(after).elevText) - ft);
      assert.ok(moved <= 15, `${ft} ft, ${unit}: moved ${moved} ft`);
    }
  }
});

test('an elevation beyond the range is held while typing and clamps on commit', () => {
  const s = atFeet(5280);
  const typing = inputElevation(s, '150000');
  assert.ok(Object.is(typing.pa, s.pa));
  assert.equal(view(typing).elevInvalid, true);

  const committed = commitElevation(typing);
  assert.ok(Object.is(committed.pa, MIN_PRESSURE_PA));
  assert.equal(committed.edit, null);
  assert.equal(view(committed).elevText, '36,000');

  for (const text of ['-5000', '−5,000', '-100,000,000']) {
    const typingBelow = inputElevation(s, text);
    assert.ok(Object.is(typingBelow.pa, s.pa), text);
    assert.equal(view(typingBelow).elevInvalid, true, text);
    const below = commitElevation(typingBelow);
    assert.ok(Object.is(below.pa, MAX_PRESSURE_PA), `${text} → ${below.pa}`);
    assert.equal(view(below).elevText, '−3,700');
  }
});

test('a pressure beyond the range is held while typing and clamps on commit', () => {
  const s = atFeet(5280);
  const typing = inputPressure(s, '35');
  assert.ok(Object.is(typing.pa, s.pa));
  assert.equal(view(typing).pressInvalid, true);

  const committed = commitPressure(typing);
  assert.ok(Object.is(committed.pa, MAX_PRESSURE_PA));
  assert.equal(view(committed).pressText, '34.15');
  assert.equal(view(committed).elevText, '−3,700');

  const below = commitPressure(inputPressure(s, '5'));
  assert.ok(Object.is(below.pa, MIN_PRESSURE_PA));
  assert.equal(view(below).pressText, '6.73');
  assert.equal(view(below).elevText, '36,000');
});

test('a pressure above 101.325 kPa, as on a high-pressure day, is below sea level', () => {
  const s = inputPressure(initialState(), '30.23');
  assert.equal(view(s).pressInvalid, false);
  assert.ok(s.pa > P0_PA);
  assert.equal(view(commitPressure(s)).readout, '−284 ft · 30.23 inHg');
});

test('empty and garbage text is invalid, holds the state, and reverts on commit', () => {
  const s = atFeet(5280);
  const shown = view(s);
  for (const box of ['elev', 'press']) {
    for (const text of ['', 'abc', '8x']) {
      const typing = input[box](s, text);
      assert.ok(Object.is(typing.pa, s.pa), `${box} ${JSON.stringify(text)}`);
      assert.equal(view(typing)[invalidFlag[box]], true);
      assert.equal(view(typing)[textOf[box]], text);

      const committed = commit[box](typing);
      assert.ok(Object.is(committed.pa, s.pa));
      assert.equal(committed.edit, null);
      assert.equal(view(committed)[textOf[box]], shown[textOf[box]]);
      assert.equal(view(committed)[invalidFlag[box]], false);
    }
  }
});

test('committing a box that was not edited leaves the state bit-identical', () => {
  for (const [, state] of EVERY_FEET) {
    const s = setElevationUnit(setPressureUnit(state, 'kPa'), 'm');
    assert.ok(Object.is(commitPressure(s).pa, s.pa));
    assert.ok(Object.is(commitElevation(s).pa, s.pa));
    assert.deepEqual(commitElevation(commitPressure(s)), s);
  }
  const typingPressure = inputPressure(atFeet(5280), '8');
  assert.deepEqual(commitElevation(typingPressure), typingPressure);
});

test('RF-2: a unit change replaces invalid text in that box with the state', () => {
  const s = atFeet(5280);

  const elev = setElevationUnit(inputElevation(s, 'abc'), 'm');
  assert.equal(view(elev).elevInvalid, false);
  assert.equal(view(elev).elevText, '1,609');
  assert.ok(Object.is(elev.pa, s.pa));

  const press = setPressureUnit(inputPressure(s, 'abc'), 'kPa');
  assert.equal(view(press).pressInvalid, false);
  assert.equal(view(press).pressText, '83.43');
  assert.ok(Object.is(press.pa, s.pa));
});

test('a unit change in one box keeps the pending edit in the other', () => {
  const elev = inputElevation(initialState(), '52');
  assert.deepEqual(setPressureUnit(elev, 'kPa').edit, elev.edit);
  const press = inputPressure(initialState(), '2');
  assert.deepEqual(setElevationUnit(press, 'm').edit, press.edit);
});

test('the slider clears a pending edit in either box', () => {
  for (const box of ['elev', 'press']) {
    const moved = inputSlider(input[box](initialState(), 'abc'), 1000);
    assert.equal(moved.edit, null);
    assert.equal(view(moved).elevText, '1,000');
    assert.equal(view(moved)[invalidFlag[box]], false);
  }
});

test('the metres slider works in metres', () => {
  const s = inputSlider(setElevationUnit(initialState(), 'm'), 1610);
  const v = view(s);
  assert.equal(v.elevText, '1,610');
  assert.deepEqual(v.slider, {
    min: 0,
    max: 4572,
    step: 5,
    value: 1610,
    valueText: '1,610 metres',
  });
  // 15,000 ft is 4,572 m exactly, so both units' slider ends are one state.
  assert.ok(Object.is(inputSlider(s, 4572).pa, atFeet(15000).pa));
});

test('the boundary text each box shows is accepted while typing', () => {
  const mid = atFeet(5280);
  const ends = [
    ['press', 'inHg', '6.73', MIN_PRESSURE_PA],
    ['press', 'inHg', '34.15', MAX_PRESSURE_PA],
    ['press', 'kPa', '115.63', MAX_PRESSURE_PA],
    ['press', 'mbar', '1,156.3', MAX_PRESSURE_PA],
    ['elev', 'ft', '36,000', MIN_PRESSURE_PA],
    ['elev', 'ft', '−3,700', MAX_PRESSURE_PA],
    ['elev', 'm', '10,973', MIN_PRESSURE_PA],
    ['elev', 'm', '−1,128', MAX_PRESSURE_PA],
  ];
  for (const [box, unit, text, limit] of ends) {
    const typed = input[box](setUnit[box](mid, unit), text);
    assert.equal(view(typed)[invalidFlag[box]], false, `${unit} ${text}`);
    assert.ok(Object.is(typed.pa, limit), `${unit} ${text} → ${typed.pa}`);
  }
  // The top's kPa and mbar texts lie just inside the range.
  for (const [unit, text] of [
    ['kPa', '22.80'],
    ['mbar', '228.0'],
  ]) {
    const typed = inputPressure(setPressureUnit(mid, unit), text);
    assert.equal(view(typed).pressInvalid, false, `${unit} ${text}`);
    assert.equal(view(typed).elevText, '35,997');
  }

  // Whatever each box shows at either end of the range, typed back, is valid.
  for (const end of [AT_FLOOR, AT_CEILING]) {
    for (const unit of PRESSURE_UNITS) {
      const shown = view(setPressureUnit(end, unit)).pressText;
      const typed = inputPressure(setPressureUnit(mid, unit), shown);
      assert.equal(view(typed).pressInvalid, false, `${unit} ${shown}`);
    }
    for (const unit of ['ft', 'm']) {
      const shown = view(setElevationUnit(end, unit)).elevText;
      const typed = inputElevation(setElevationUnit(mid, unit), shown);
      assert.equal(view(typed).elevInvalid, false, `${unit} ${shown}`);
      assert.ok(Object.is(typed.pa, end.pa), `${unit} ${shown}`);
    }
  }
});

test('values within half a display step outside a limit are accepted and clamped', () => {
  const cases = [
    ['elev', 'ft', '-3,700.5', '-3,700.5001', MAX_PRESSURE_PA],
    ['elev', 'ft', '−3,700.5', '−3,700.5001', MAX_PRESSURE_PA],
    ['elev', 'ft', '36,000.5', '36,000.5001', MIN_PRESSURE_PA],
    ['elev', 'm', '-1,128.26', '-1,128.2601', MAX_PRESSURE_PA],
    ['elev', 'm', '10,973.3', '10,973.3001', MIN_PRESSURE_PA],
    ['press', 'inHg', '34.1503', '34.1504', MAX_PRESSURE_PA],
    ['press', 'inHg', '6.7270', '6.7269', MIN_PRESSURE_PA],
    ['press', 'kPa', '115.6345', '115.6346', MAX_PRESSURE_PA],
    ['press', 'kPa', '22.7922', '22.7921', MIN_PRESSURE_PA],
    ['press', 'mbar', '1,156.345', '1,156.346', MAX_PRESSURE_PA],
    ['press', 'mbar', '227.922', '227.921', MIN_PRESSURE_PA],
  ];
  const mid = atFeet(5280);
  for (const [box, unit, accepted, rejected, limit] of cases) {
    const s = setUnit[box](mid, unit);

    const inside = input[box](s, accepted);
    assert.equal(view(inside)[invalidFlag[box]], false, `${unit} ${accepted}`);
    assert.ok(Object.is(inside.pa, limit), `${unit} ${accepted} → ${inside.pa}`);

    const outside = input[box](s, rejected);
    assert.equal(view(outside)[invalidFlag[box]], true, `${unit} ${rejected}`);
    assert.ok(Object.is(outside.pa, s.pa));
    assert.ok(Object.is(commit[box](outside).pa, limit), `${unit} ${rejected} on commit`);
  }
});

test('setMode switches the delta mode and nothing else', () => {
  const s = inputElevation(atFeet(5280), '52');
  const pct = setMode(s, 'pct');
  assert.deepEqual(pct, { ...s, mode: 'pct' });
  assert.deepEqual(setMode(pct, 'abs'), s);
});

test('every transition leaves its input untouched and returns a new state', () => {
  const base = inputPressure(atFeet(5280), '8');
  const snapshot = structuredClone(base);
  Object.freeze(base.edit);
  Object.freeze(base);
  const results = [
    inputElevation(base, '1000'),
    commitElevation(base),
    inputPressure(base, '25'),
    commitPressure(base),
    inputSlider(base, 100),
    setElevationUnit(base, 'm'),
    setPressureUnit(base, 'kPa'),
    setMode(base, 'pct'),
  ];
  view(base);
  assert.deepEqual(base, snapshot);
  for (const result of results) {
    assert.notEqual(result, base);
  }
});
