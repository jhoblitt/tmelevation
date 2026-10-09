import { test } from 'node:test';
import assert from 'node:assert/strict';
import { densityRatio, pressureAtElevation } from '../../site/js/atmosphere.js';
import { calibrate } from '../../site/js/calibrate.js';
import { TOURS } from '../../site/js/data.js';
import { fly, launchFrom } from '../../site/js/flight.js';
import { createModel, rowDelta } from '../../site/js/model.js';
import {
  ORACLES,
  createOracleContext,
  evaluateOracles,
  formatAnnotation,
} from '../../site/js/oracles.js';
import { MPS_PER_MPH, M_PER_FT, M_PER_YD, radToDeg } from '../../site/js/units.js';

function calibrated(model) {
  while (model.calibrateNext()) {}
  return model;
}

function ratioAt(ft) {
  return densityRatio(pressureAtElevation(ft * M_PER_FT));
}

function oracleById(id) {
  const oracle = ORACLES.find((candidate) => candidate.id === id);
  assert.ok(oracle, `no oracle ${id}`);
  return oracle;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function near(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} is not ${expected}`);
}

const MODEL = calibrated(createModel());
const RESULTS = evaluateOracles(createOracleContext(MODEL));

function resultOf(id) {
  return RESULTS.find(({ oracle }) => oracle.id === id);
}

function entryOf(model, tourId, club) {
  return model.entries.find((entry) => entry.tourId === tourId && entry.row.club === club);
}

// Independent of the oracles: the named row's delta straight from its calibration.
function deltaOf(tourId, club, ft) {
  const entry = entryOf(MODEL, tourId, club);
  const delta = rowDelta(entry.cal, entry.row, ratioAt(ft));
  assert.equal(delta.ok, true, `${tourId} ${club} at ${ft} ft: ${delta.reason}`);
  return { entry, delta };
}

function carryGain(tourId, club, ft) {
  const { entry, delta } = deltaOf(tourId, club, ft);
  return (100 * delta.carryYd) / entry.row.carry.yd;
}

const SHOTS = {
  pga: { ballSpeedMph: 130, launchDeg: 14.7, spinRpm: 6088, carryYd: 184, maxHeightYd: 33.8 },
  lpga: { ballSpeedMph: 110, launchDeg: 18.6, spinRpm: 5950, carryYd: 152, maxHeightYd: 27.7 },
};

const WIND = [
  { id: '12-pga-hw10', tourId: 'pga', mph: -10, carryYd: 166, landDeg: 58.1 },
  { id: '12-pga-hw20', tourId: 'pga', mph: -20, carryYd: 143, landDeg: 69.5 },
  { id: '12-pga-tw10', tourId: 'pga', mph: 10, carryYd: 198, landDeg: 39.5 },
  { id: '12-pga-tw20', tourId: 'pga', mph: 20, carryYd: 207, landDeg: 32.7 },
  { id: '12-lpga-hw10', tourId: 'lpga', mph: -10, carryYd: 139, landDeg: 55.6 },
  { id: '12-lpga-hw20', tourId: 'lpga', mph: -20, carryYd: 121, landDeg: 67.4 },
  { id: '12-lpga-tw10', tourId: 'lpga', mph: 10, carryYd: 161, landDeg: 37.7 },
  { id: '12-lpga-tw20', tourId: 'lpga', mph: 20, carryYd: 167, landDeg: 31.7 },
];

function shotCalibration(tourId) {
  const shot = SHOTS[tourId];
  const launch = launchFrom(shot);
  const cal = calibrate(launch, {
    carryM: shot.carryYd * M_PER_YD,
    maxHeightM: shot.maxHeightYd * M_PER_YD,
  });
  assert.equal(cal.ok, true, `${tourId} 2014 shot: ${cal.reason}`);
  return { launch, cal };
}

test('the oracles are the rows of spec 8.3, split into parts, with their kinds', () => {
  assert.deepEqual(
    ORACLES.map(({ id, kind }) => `${id} ${kind}`),
    [
      '1 hard',
      '2 hard',
      '3 hard',
      '4 soft',
      '5 soft',
      '6 hard',
      '7 soft',
      '8a soft',
      '8b soft',
      '9a hard',
      '9b soft',
      '10a hard',
      '10b hard',
      '11 soft',
      ...WIND.map(({ id }) => `${id} soft`),
    ],
  );
});

test('oracle ids are unique and every oracle cites at least one source with a URL', () => {
  const ids = ORACLES.map(({ id }) => id);
  assert.equal(new Set(ids).size, ids.length);
  const isText = (value) => typeof value === 'string' && value !== '';
  for (const oracle of ORACLES) {
    for (const field of ['title', 'measures', 'condition', 'expected']) {
      assert.ok(isText(oracle[field]), `${oracle.id} ${field}`);
    }
    assert.ok(oracle.sources.length >= 1, `${oracle.id} has no source`);
    for (const { label, url, note } of oracle.sources) {
      assert.ok(isText(label), `${oracle.id} source label`);
      assert.ok(isText(note), `${oracle.id} source note`);
      assert.match(new URL(url).protocol, /^https?:$/, `${oracle.id} source ${url}`);
    }
  }
});

test('the bands are the spec 8.3 bands', () => {
  const pct = (min, max) => ({ min, max, unit: '%' });
  const deg = (min, max) => ({ min, max, unit: 'deg' });
  assert.deepEqual(Object.fromEntries(ORACLES.map(({ id, band }) => [id, band])), {
    1: pct(5, 12),
    2: pct(-28, -8),
    3: deg(-13, -5),
    4: pct(3.5, 8.5),
    5: pct(6.5, 13),
    6: pct(7, 16),
    7: null,
    '8a': pct(4, 10),
    '8b': pct(3, 7.5),
    '9a': null,
    '9b': null,
    '10a': deg(45, 51),
    '10b': deg(42.6, 48.6),
    11: null,
    ...Object.fromEntries(WIND.map(({ id }) => [id, null])),
  });
});

test('evaluateOracles returns one result per oracle, in order', () => {
  assert.deepEqual(
    RESULTS.map(({ oracle }) => oracle),
    ORACLES,
  );
});

test('every hard oracle passes', () => {
  for (const { oracle, display, pass } of RESULTS) {
    if (oracle.kind === 'hard') {
      assert.equal(pass, true, `oracle ${oracle.id} (${oracle.title}): ${display}`);
    }
  }
});

test('every oracle evaluates to a finite number or a boolean with display text', () => {
  for (const { oracle, value, display, pass } of RESULTS) {
    assert.ok(
      typeof value === 'boolean' || Number.isFinite(value),
      `oracle ${oracle.id}: value ${value}`,
    );
    assert.equal(typeof display, 'string', oracle.id);
    assert.notEqual(display, '', oracle.id);
    assert.equal(typeof pass, 'boolean', oracle.id);
  }
});

test('the row oracles measure the named row at the named elevation', () => {
  const valueIs = (id, expected) => near(resultOf(id).value, expected, `oracle ${id}`);
  valueIs('1', carryGain('pga', 'Driver', 7800));
  const driver = deltaOf('pga', 'Driver', 7800);
  valueIs('2', (100 * driver.delta.maxHeightYd) / driver.entry.row.maxHeight.yd);
  valueIs('3', driver.delta.landDeg);
  valueIs('4', carryGain('pga', 'Driver', 5280));
  valueIs(
    '5',
    sum(TOURS[0].rows.map(({ club }) => carryGain('pga', club, 7200))) / TOURS[0].rows.length,
  );
  valueIs('6', carryGain('pga', '7 Iron', 6400));
  valueIs('8a', carryGain('pga', '7 Iron', 4920));
  valueIs('8b', carryGain('pga', 'Driver', 4920));

  const iron7 = carryGain('pga', '7 Iron', 6400);
  assert.equal(
    resultOf('7').value,
    iron7 >= carryGain('pga', 'Driver', 6400) && carryGain('pga', 'PW', 6400) <= iron7,
  );
  assert.equal(
    resultOf('11').value,
    carryGain('lpga', 'Driver', 5280) <= carryGain('pga', 'Driver', 5280) + 1,
  );
});

test('oracles 10a and 10b are the land angles of the calibrated 2014 TrackMan shots', () => {
  for (const [id, tourId] of [
    ['10a', 'pga'],
    ['10b', 'lpga'],
  ]) {
    const { cal } = shotCalibration(tourId);
    near(resultOf(id).value, radToDeg(cal.sea.landRad), id);
  }
});

test('the wind oracles fly the calibrated 2014 shots in head- and tailwind', () => {
  for (const { id, tourId, mph, carryYd, landDeg } of WIND) {
    const { launch, cal } = shotCalibration(tourId);
    const flight = fly(launch, cal, { rhoRatio: 1, windMps: mph * MPS_PER_MPH });
    assert.equal(flight.ok, true, id);
    const modelCarryYd = flight.carryM / M_PER_YD;
    const modelLandDeg = radToDeg(flight.landRad);
    const { value, pass } = resultOf(id);
    near(value, modelCarryYd, id);
    assert.equal(
      pass,
      Math.abs(modelCarryYd - carryYd) <= 5 && Math.abs(modelLandDeg - landDeg) <= 3,
      id,
    );
  }
});

test('formatAnnotation reports a failing banded soft oracle with % escaped', () => {
  const oracle = oracleById('4');
  assert.equal(
    formatAnnotation({ oracle, value: 9, display: '+9.0%', pass: false }),
    `::warning title=Soft oracle 4::${oracle.title}: +9.0%25 outside +3.5%25…+8.5%25`,
  );
});

test('formatAnnotation reports a failing unbanded soft oracle against its expectation', () => {
  const oracle = oracleById('7');
  assert.equal(
    formatAnnotation({ oracle, value: false, display: 'Driver +9.9%, 7 Iron +9.0%', pass: false }),
    `::warning title=Soft oracle 7::${oracle.title}: Driver +9.9%25, 7 Iron +9.0%25, expected ${oracle.expected}`,
  );
});

test('formatAnnotation escapes its title and message per the workflow-command rules', () => {
  const oracle = { id: 'x:y,z', title: 'a\r\nb', band: null, expected: '50%' };
  assert.equal(
    formatAnnotation({ oracle, value: false, display: 'd', pass: false }),
    '::warning title=Soft oracle x%3Ay%2Cz::a%0D%0Ab: d, expected 50%25',
  );
});

test('a calibrated model is reused: its steps grow only by the oracle flights', () => {
  const model = calibrated(createModel());
  const cals = model.entries.map(({ cal }) => cal);
  const before = model.stepsUsed();
  const ctx = createOracleContext(model);
  assert.equal(model.stepsUsed(), before, 'creating the context flew');

  // Each new elevation flies every row once through the model; nothing else does.
  const flightsAt = (ft) =>
    sum(model.entries.map(({ cal, row }) => rowDelta(cal, row, ratioAt(ft)).steps));
  const expectGrowth = (id, opts, elevations) => {
    const start = model.stepsUsed();
    oracleById(id).evaluate(ctx, opts);
    assert.equal(model.stepsUsed() - start, sum(elevations.map(flightsAt)), `oracle ${id}`);
  };
  expectGrowth('1', undefined, [7800]);
  expectGrowth('9b', { gridFt: 2000 }, [10000, 12000, 14000, 15000]);
  expectGrowth('9a', { gridFt: 3000 }, [0, 3000, 6000, 9000, 10000]);
  model.entries.forEach(({ key, cal }, i) => assert.equal(cal, cals[i], key));
});

test('with no model, the context builds and calibrates its own', () => {
  const result = oracleById('1').evaluate(createOracleContext());
  assert.equal(result.value, resultOf('1').value);
  assert.equal(result.pass, true);
});

// A model of 100 yd rows whose deltas are set by `delta(thin)`, where
// thin = 1 - rho/rho0 grows with elevation.
function stubModel(rows) {
  const entries = rows.map(({ tourId = 'x', club = 'Driver' }, index) => ({
    key: `${tourId}:${index}`,
    tourId,
    index,
    row: { club, carry: { yd: 100 } },
  }));
  return {
    entries,
    calibrateNext: () => false,
    deltasAt: (rhoRatio) =>
      new Map(
        entries.map((entry, i) => [
          entry.key,
          { status: 'ready', delta: { ok: true, ...rows[i].delta(1 - rhoRatio) } },
        ]),
      ),
  };
}

function gainsModel(gains) {
  return stubModel(
    gains.map(([tourId, club, carryYd]) => ({ tourId, club, delta: () => ({ carryYd }) })),
  );
}

test('a banded oracle passes inside its band, edges included, and fails outside it', () => {
  // On a 100 yd stub row, oracle 1's carry gain in percent is the carry delta in yards.
  for (const [carryYd, display, pass] of [
    [-3, '−3.0%', false],
    [0, '±0.0%', false],
    [4, '+4.0%', false],
    [5, '+5.0%', true],
    [12, '+12.0%', true],
    [12.5, '+12.5%', false],
  ]) {
    const ctx = createOracleContext(gainsModel([['pga', 'Driver', carryYd]]));
    assert.deepEqual(oracleById('1').evaluate(ctx), { value: carryYd, display, pass }, display);
  }
});

test('oracle 7 orders the PGA Driver, 7 Iron and PW gains', () => {
  const pattern = (driver, iron7, pw) =>
    oracleById('7').evaluate(
      createOracleContext(
        gainsModel([
          ['pga', 'Driver', driver],
          ['pga', '7 Iron', iron7],
          ['pga', 'PW', pw],
        ]),
      ),
    );
  assert.deepEqual(pattern(5, 10, 10), {
    value: true,
    display: 'Driver +5.0%, 7 Iron +10.0%, PW +10.0%',
    pass: true,
  });
  assert.equal(pattern(10, 10, 5).pass, true);
  assert.deepEqual(pattern(10.5, 10, 5), {
    value: false,
    display: 'Driver +10.5%, 7 Iron +10.0%, PW +5.0%',
    pass: false,
  });
  assert.equal(pattern(5, 10, 10.5).pass, false);
});

test('oracle 11 allows the LPGA Driver gain one point above the PGA Driver gain', () => {
  const ordering = (lpga, pga) =>
    oracleById('11').evaluate(
      createOracleContext(
        gainsModel([
          ['lpga', 'Driver', lpga],
          ['pga', 'Driver', pga],
        ]),
      ),
    );
  assert.deepEqual(ordering(7, 6), { value: true, display: 'LPGA +7.0%, PGA +6.0%', pass: true });
  assert.deepEqual(ordering(7.5, 6), {
    value: false,
    display: 'LPGA +7.5%, PGA +6.0%',
    pass: false,
  });
});

test('9a names the row, quantity and elevation that reverses; a flat stretch passes', () => {
  // Each case changes one quantity from 7,000 ft up: reversed, it turns back
  // and first fails at 8,000 ft; flat, it stays equal, which is still monotone.
  const turnAt = 1 - ratioAt(7000);
  const healthy = {
    carryYd: (thin) => 40 * thin,
    maxHeightYd: (thin) => -thin,
    landDeg: (thin) => -thin,
  };
  const run = (quantities) =>
    oracleById('9a').evaluate(
      createOracleContext(
        stubModel([
          {
            delta: (thin) =>
              Object.fromEntries(Object.entries(quantities).map(([key, f]) => [key, f(thin)])),
          },
        ]),
      ),
      { gridFt: 1000 },
    );
  const monotone = { value: true, display: 'monotone on a 1,000 ft grid', pass: true };
  for (const [key, complaint] of [
    ['carryYd', 'carry falls'],
    ['maxHeightYd', 'max height rises'],
    ['landDeg', 'land angle rises'],
  ]) {
    const f = healthy[key];
    const reversed = {
      ...healthy,
      [key]: (thin) => (thin <= turnAt ? f(thin) : 2 * f(turnAt) - f(thin)),
    };
    assert.deepEqual(run(reversed), {
      value: false,
      display: `X Driver ${complaint} at 8,000 ft`,
      pass: false,
    });
    const flat = { ...healthy, [key]: (thin) => f(Math.min(thin, turnAt)) };
    assert.deepEqual(run(flat), monotone, `${key} flat`);
  }
  assert.deepEqual(run(healthy), monotone);
});

test('the sweeps default to a 250 ft grid for 9a and a 10 ft grid for 9b', () => {
  assert.equal(resultOf('9a').display, 'monotone on a 250 ft grid');
  assert.equal(resultOf('9b').display, 'never decreases on a 10 ft grid');
});

test('9b fails on a drop in displayed carry, not on one rounding hides', () => {
  const above = (thin) => thin > 1 - ratioAt(13500);
  const run = (carryYd) =>
    oracleById('9b').evaluate(
      createOracleContext(stubModel([{ delta: (thin) => ({ carryYd: carryYd(thin) }) }])),
      { gridFt: 1000 },
    );
  const was = Math.round(100 + 40 * (1 - ratioAt(13000)));
  assert.deepEqual(
    run((thin) => (above(thin) ? 0 : 40 * thin)),
    { value: false, display: `X Driver carry ${was} → 100 yd at 14,000 ft`, pass: false },
  );
  assert.deepEqual(
    run((thin) => (above(thin) ? 15.0 : 15.2)),
    { value: true, display: 'never decreases on a 1,000 ft grid', pass: true },
  );
});

test('the sweeps reject a grid that would never advance', () => {
  const ctx = createOracleContext(MODEL);
  for (const id of ['9a', '9b']) {
    for (const gridFt of [0, -250, Number.NaN]) {
      assert.throws(
        () => oracleById(id).evaluate(ctx, { gridFt }),
        { name: 'RangeError', message: /grid step must be positive/ },
        `${id} ${gridFt}`,
      );
    }
  }
});

test('an oracle on a failed row fails instead of throwing', () => {
  const driver = TOURS[0].rows[0];
  const model = calibrated(
    createModel([{ id: 'pga', rows: [{ ...driver, ballSpeed: Number.NaN }] }]),
  );
  assert.equal(model.entries[0].status, 'failed');
  let result;
  assert.doesNotThrow(() => {
    result = oracleById('1').evaluate(createOracleContext(model));
  });
  assert.equal(result.pass, false);
  assert.ok(Number.isNaN(result.value), `value ${result.value}`);
});
