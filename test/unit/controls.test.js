import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_PRESSURE_PA, P0_PA } from '../../site/js/atmosphere.js';
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

const atFeet = (ft) => inputSlider(initialState(), ft);

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
    '−5',
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
  const metres = setElevationUnit(initialState(), 'm');
  assert.equal(view(inputElevation(metres, '1')).slider.valueText, '1 metre');
});

test('switching units in either box never changes the state', () => {
  for (const ft of SLIDER_FEET) {
    const s = atFeet(ft);
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
  for (const ft of SLIDER_FEET) {
    for (const unit of PRESSURE_UNITS) {
      const s = setPressureUnit(atFeet(ft), unit);
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
  assert.equal(view(committed).elevText, '15,000');

  for (const text of ['-100', '-100,000,000']) {
    const below = commitElevation(inputElevation(s, text));
    assert.ok(Object.is(below.pa, P0_PA), `${text} → ${below.pa}`);
    assert.equal(view(below).elevText, '0');
  }
});

test('a pressure beyond the range is held while typing and clamps on commit', () => {
  const s = atFeet(5280);
  const typing = inputPressure(s, '30.10');
  assert.ok(Object.is(typing.pa, s.pa));
  assert.equal(view(typing).pressInvalid, true);

  const committed = commitPressure(typing);
  assert.ok(Object.is(committed.pa, P0_PA));
  assert.equal(view(committed).atSeaLevel, true);
  assert.equal(view(committed).pressText, '29.92');

  const below = commitPressure(inputPressure(s, '10'));
  assert.ok(Object.is(below.pa, MIN_PRESSURE_PA));
  assert.equal(view(below).elevText, '15,000');
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
  for (const ft of SLIDER_FEET) {
    const s = setElevationUnit(setPressureUnit(atFeet(ft), 'kPa'), 'm');
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
  assert.ok(Object.is(inputSlider(s, 4572).pa, MIN_PRESSURE_PA));
});

test('the boundary text each box shows is accepted while typing', () => {
  const mid = atFeet(5280);

  const inHgTop = inputPressure(mid, '16.89');
  assert.equal(view(inHgTop).pressInvalid, false);
  assert.ok(Object.is(inHgTop.pa, MIN_PRESSURE_PA));

  const inHgSea = inputPressure(mid, '29.92');
  assert.equal(view(inHgSea).pressInvalid, false);
  assert.equal(view(inHgSea).elevText, '1');
  assert.equal(view(inHgSea).atSeaLevel, false);

  const kPaSea = inputPressure(setPressureUnit(mid, 'kPa'), '101.33');
  assert.equal(view(kPaSea).pressInvalid, false);
  assert.ok(Object.is(kPaSea.pa, P0_PA));

  const mbarSea = inputPressure(setPressureUnit(mid, 'mbar'), '1,013.3');
  assert.equal(view(mbarSea).pressInvalid, false);
  assert.ok(Object.is(mbarSea.pa, P0_PA));

  const ftTop = inputElevation(mid, '15,000');
  assert.equal(view(ftTop).elevInvalid, false);
  assert.ok(Object.is(ftTop.pa, MIN_PRESSURE_PA));

  // Whatever each box shows at either end of the range, typed back, is valid.
  for (const end of [initialState(), atFeet(15000)]) {
    for (const unit of PRESSURE_UNITS) {
      const shown = view(setPressureUnit(end, unit)).pressText;
      const typed = inputPressure(setPressureUnit(mid, unit), shown);
      assert.equal(view(typed).pressInvalid, false, `${unit} ${shown}`);
    }
    for (const unit of ['ft', 'm']) {
      const shown = view(setElevationUnit(end, unit)).elevText;
      const typed = inputElevation(setElevationUnit(mid, unit), shown);
      assert.equal(view(typed).elevInvalid, false, `${unit} ${shown}`);
    }
  }
});

test('values within half a display step outside a limit are accepted and clamped', () => {
  const cases = [
    ['elev', 'ft', '-0.5', '-0.5001', P0_PA],
    ['elev', 'ft', '15,000.5', '15,000.5001', MIN_PRESSURE_PA],
    ['elev', 'm', '-0.5', '-0.5001', P0_PA],
    ['elev', 'm', '4,572.5', '4,572.5001', MIN_PRESSURE_PA],
    ['press', 'inHg', '29.9262', '29.9263', P0_PA],
    ['press', 'inHg', '16.8882', '16.8881', MIN_PRESSURE_PA],
    ['press', 'kPa', '101.33', '101.3301', P0_PA],
    ['press', 'kPa', '57.2019', '57.2018', MIN_PRESSURE_PA],
    ['press', 'mbar', '1,013.3', '1,013.3001', P0_PA],
    ['press', 'mbar', '572.019', '572.018', MIN_PRESSURE_PA],
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
