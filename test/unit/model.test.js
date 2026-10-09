import { test } from 'node:test';
import assert from 'node:assert/strict';
import { densityRatio, pressureAtElevation } from '../../site/js/atmosphere.js';
import { TOURS } from '../../site/js/data.js';
import { calibrateRow, createModel, rowDelta } from '../../site/js/model.js';
import { M_PER_FT, M_PER_YD } from '../../site/js/units.js';

const KEYS = TOURS.flatMap((tour) => tour.rows.map((_, index) => `${tour.id}:${index}`));
const PGA_DRIVER_ROW = TOURS[0].rows[0];
const RHO_RATIO_15000_FT = 0.564587;

function calibrateAll(model) {
  while (model.calibrateNext()) {}
  return model;
}

const CALIBRATED = calibrateAll(createModel());

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

test('every row calibrates to its published yards', () => {
  assert.equal(CALIBRATED.entries.length, 23);
  for (const { key, status, cal, row } of CALIBRATED.entries) {
    assert.equal(status, 'ready', `${key}: ${cal.reason}`);
    const carryYd = cal.sea.carryM / M_PER_YD;
    const maxHeightYd = cal.sea.maxHeightM / M_PER_YD;
    assert.ok(Math.abs(carryYd - row.carry.yd) <= 0.01, `${key}: carry ${carryYd}`);
    assert.ok(Math.abs(maxHeightYd - row.maxHeight.yd) <= 0.01, `${key}: max height ${maxHeightYd}`);
  }
});

test('a density ratio of 1 changes nothing, exactly, on every row', () => {
  for (const { key, cal, row } of CALIBRATED.entries) {
    assert.deepEqual(
      rowDelta(cal, row, 1),
      { ok: true, carryYd: 0, maxHeightYd: 0, landDeg: 0, steps: 0 },
      key,
    );
  }
});

test('every row gains carry and loses max height and land angle, monotonically, up to 10,000 ft', () => {
  let previous = null;
  for (let ft = 0; ft <= 10000; ft += 250) {
    const deltas = CALIBRATED.deltasAt(densityRatio(pressureAtElevation(ft * M_PER_FT)));
    for (const key of KEYS) {
      const { status, delta } = deltas.get(key);
      assert.equal(status, 'ready', key);
      assert.equal(delta.ok, true, `${key} at ${ft} ft: ${delta.reason}`);
      if (previous !== null) {
        const before = previous.get(key).delta;
        const at = `${key} at ${ft} ft`;
        assert.ok(delta.carryYd >= before.carryYd, `${at}: carry ${delta.carryYd} < ${before.carryYd}`);
        assert.ok(
          delta.maxHeightYd <= before.maxHeightYd,
          `${at}: max height ${delta.maxHeightYd} > ${before.maxHeightYd}`,
        );
        assert.ok(delta.landDeg <= before.landDeg, `${at}: land ${delta.landDeg} > ${before.landDeg}`);
      }
    }
    previous = deltas;
  }
  for (const key of KEYS) {
    const { delta } = previous.get(key);
    assert.ok(delta.carryYd > 0, `${key}: carry ${delta.carryYd}`);
    assert.ok(delta.maxHeightYd < 0, `${key}: max height ${delta.maxHeightYd}`);
    assert.ok(delta.landDeg < 0, `${key}: land ${delta.landDeg}`);
  }
});

test('rows calibrate one at a time, PGA rows first, then LPGA rows', () => {
  const model = createModel();
  assert.equal(KEYS[0], 'pga:0');
  assert.equal(KEYS[12], 'lpga:0');
  assert.deepEqual(
    model.entries.map(({ key }) => key),
    KEYS,
  );
  for (const tour of TOURS) {
    tour.rows.forEach((row, index) => {
      const entry = model.entries.find(({ key }) => key === `${tour.id}:${index}`);
      assert.equal(entry.tourId, tour.id);
      assert.equal(entry.index, index);
      assert.equal(entry.row, row);
      assert.equal(entry.status, 'pending');
      assert.equal(entry.cal, null);
    });
  }
  assert.equal(model.isComplete(), false);

  for (let n = 1; n <= KEYS.length; n++) {
    assert.equal(model.calibrateNext(), true, `call ${n}`);
    const done = model.entries.filter(({ status }) => status !== 'pending').map(({ key }) => key);
    assert.deepEqual(done, KEYS.slice(0, n));
    assert.equal(model.isComplete(), n === KEYS.length, `call ${n}`);
  }
  assert.equal(model.calibrateNext(), false);
  assert.equal(model.isComplete(), true);
});

test('a row that fails to calibrate leaves the other rows working', () => {
  const badRow = { ...PGA_DRIVER_ROW, ballSpeed: Number.NaN };
  const model = createModel([{ id: 'x', rows: [badRow, PGA_DRIVER_ROW] }]);
  calibrateAll(model);
  assert.deepEqual(
    model.entries.map(({ key, status }) => [key, status]),
    [
      ['x:0', 'failed'],
      ['x:1', 'ready'],
    ],
  );
  assert.equal(model.entries[0].cal.ok, false);

  const deltas = model.deltasAt(0.8);
  assert.deepEqual(deltas.get('x:0'), { status: 'failed', delta: null });
  const { status, delta } = deltas.get('x:1');
  assert.equal(status, 'ready');
  assert.equal(delta.ok, true);
  assert.deepEqual(delta, rowDelta(calibrateRow(PGA_DRIVER_ROW), PGA_DRIVER_ROW, 0.8));
});

test('a failed calibration gives a failed delta at any ratio, without flying', () => {
  const failed = calibrateRow({ ...PGA_DRIVER_ROW, ballSpeed: Number.NaN });
  assert.equal(failed.ok, false);
  for (const cal of [failed, null]) {
    for (const rhoRatio of [0.8, 1]) {
      let delta;
      assert.doesNotThrow(() => {
        delta = rowDelta(cal, PGA_DRIVER_ROW, rhoRatio);
      });
      assert.deepEqual(delta, { ok: false, reason: 'calibration', steps: 0 }, `${cal} at ${rhoRatio}`);
    }
  }
});

test('a failed altitude flight is a failed delta, not an exception', () => {
  const { cal, row } = CALIBRATED.entries[0];
  assert.deepEqual(rowDelta(cal, row, Number.NaN), { ok: false, reason: 'nonfinite', steps: 1 });
});

test('calibration and each recompute stay inside the step budgets', () => {
  const model = calibrateAll(createModel());
  const calibrationSteps = model.stepsUsed();
  assert.equal(calibrationSteps, sum(model.entries.map(({ cal }) => cal.steps)));
  assert.ok(calibrationSteps <= 50000, `calibration took ${calibrationSteps} steps`);

  const deltas = model.deltasAt(RHO_RATIO_15000_FT);
  const recomputeSteps = model.stepsUsed() - calibrationSteps;
  assert.equal(recomputeSteps, sum([...deltas.values()].map(({ delta }) => delta.steps)));
  assert.ok(recomputeSteps > 0);
  assert.ok(recomputeSteps <= 4000, `recompute took ${recomputeSteps} steps`);

  model.deltasAt(RHO_RATIO_15000_FT);
  assert.equal(model.stepsUsed(), calibrationSteps + recomputeSteps);
});

test('a row calibrated after deltasAt gets its delta on the next call', () => {
  const model = createModel();
  model.calibrateNext();
  const first = model.deltasAt(0.8);
  assert.equal(first.get('pga:0').status, 'ready');
  assert.equal(first.get('pga:0').delta.ok, true);
  assert.deepEqual(first.get('pga:1'), { status: 'pending', delta: null });

  model.calibrateNext();
  const before = model.stepsUsed();
  const second = model.deltasAt(0.8);
  const { status, delta } = second.get('pga:1');
  assert.equal(status, 'ready');
  assert.equal(delta.ok, true);
  assert.equal(second.get('pga:0').delta, first.get('pga:0').delta);
  assert.equal(model.stepsUsed() - before, delta.steps);

  const { cal, row } = model.entries[0];
  assert.deepEqual(model.deltasAt(0.7).get('pga:0').delta, rowDelta(cal, row, 0.7));
});
