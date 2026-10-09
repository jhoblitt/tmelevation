import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_ITERATIONS, calibrate } from '../../site/js/calibrate.js';
import { fly, launchFrom } from '../../site/js/flight.js';
import { RHO0 } from '../../site/js/atmosphere.js';
import { TOURS } from '../../site/js/data.js';
import { M_PER_YD } from '../../site/js/units.js';

function near(actual, expected, tolerance, label = '') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}${actual} is not within ${tolerance} of ${expected}`,
  );
}

function inRange(actual, low, high, label) {
  assert.ok(actual >= low && actual <= high, `${label}: ${actual} is outside [${low}, ${high}]`);
}

function launchOf(row) {
  return launchFrom({ ballSpeedMph: row.ballSpeed, launchDeg: row.launch, spinRpm: row.spin });
}

function targetOf(row) {
  return { carryM: row.carry.yd * M_PER_YD, maxHeightM: row.maxHeight.yd * M_PER_YD };
}

const ROWS = TOURS.flatMap((tour) =>
  tour.rows.map((row) => ({ name: `${tour.id} ${row.club}`, row })),
);

function rowOf(tourId, club) {
  return TOURS.find((tour) => tour.id === tourId).rows.find((row) => row.club === club);
}

const PGA_DRIVER_ROW = rowOf('pga', 'Driver');
const PGA_DRIVER = launchOf(PGA_DRIVER_ROW);

test('calibration is capped at 20 iterations', () => {
  assert.equal(MAX_ITERATIONS, 20);
});

test('every row reproduces its published carry and max height within 0.01 yd', () => {
  assert.equal(ROWS.length, 23);
  for (const { name, row } of ROWS) {
    const launch = launchOf(row);
    const cal = calibrate(launch, targetOf(row));
    assert.equal(cal.ok, true, `${name}: ${cal.reason}`);
    assert.ok(cal.iterations <= MAX_ITERATIONS, `${name}: ${cal.iterations} iterations`);
    const flight = fly(launch, { kD: cal.kD, kL: cal.kL });
    assert.equal(flight.ok, true, name);
    near(flight.carryM / M_PER_YD, row.carry.yd, 0.01, `${name} carry: `);
    near(flight.maxHeightM / M_PER_YD, row.maxHeight.yd, 0.01, `${name} max height: `);
  }
});

test('every fitted factor lies inside the spec envelope with a 10 % margin', () => {
  for (const { name, row } of ROWS) {
    const cal = calibrate(launchOf(row), targetOf(row));
    assert.equal(cal.ok, true, `${name}: ${cal.reason}`);
    inRange(RHO0 * cal.kD, 0.981, 1.65, `${name} rho0 kD`);
    inRange(RHO0 * cal.kL, 0.864, 1.463, `${name} rho0 kL`);
  }
});

test('the PGA Driver calibrates to the spec factors and spin decay', () => {
  const cal = calibrate(PGA_DRIVER, targetOf(PGA_DRIVER_ROW));
  assert.equal(cal.ok, true);
  near(RHO0 * cal.kD, 1.0893, 0.002, 'rho0 kD: ');
  near(RHO0 * cal.kL, 0.9912, 0.002, 'rho0 kL: ');
  near(cal.sea.landSpinRadS / PGA_DRIVER.spinRadS, 0.777, 0.005, 'landing spin ratio: ');
});

test('the low-spin LPGA 3-wood converges', () => {
  const row = rowOf('lpga', '3-wood');
  assert.equal(row.spin, 2595);
  const cal = calibrate(launchOf(row), targetOf(row));
  assert.equal(cal.ok, true, cal.reason);
});

test('an unreachable target is a failure, not an exception', () => {
  const target = { carryM: 1000 * M_PER_YD, maxHeightM: 1 * M_PER_YD };
  let cal;
  assert.doesNotThrow(() => {
    cal = calibrate(PGA_DRIVER, target);
  });
  assert.equal(cal.ok, false);
  assert.equal(cal.reason, 'diverged');
  assert.ok(cal.iterations <= MAX_ITERATIONS, `${cal.iterations} iterations`);
});

test('identical inputs give bit-identical factors', () => {
  const first = calibrate(PGA_DRIVER, targetOf(PGA_DRIVER_ROW));
  const second = calibrate(PGA_DRIVER, targetOf(PGA_DRIVER_ROW));
  assert.equal(first.ok, true);
  assert.ok(Object.is(first.kD, second.kD), `${first.kD} vs ${second.kD}`);
  assert.ok(Object.is(first.kL, second.kL), `${first.kL} vs ${second.kL}`);
});

test('a target the starting factors already meet takes no iterations', () => {
  const start = fly(PGA_DRIVER, { kD: 1, kL: 1 });
  assert.equal(start.ok, true);
  const cal = calibrate(PGA_DRIVER, { carryM: start.carryM, maxHeightM: start.maxHeightM });
  assert.deepEqual(cal, { ok: true, kD: 1, kL: 1, iterations: 0, steps: start.steps, sea: start });
});

test('the sea-level flight is the flight at the fitted factors', () => {
  const cal = calibrate(PGA_DRIVER, targetOf(PGA_DRIVER_ROW));
  assert.equal(cal.ok, true);
  assert.deepEqual(cal.sea, fly(PGA_DRIVER, { kD: cal.kD, kL: cal.kL }));
});

test('steps counts every flight of the fit, Jacobian probes included', () => {
  // Each iteration flies two probes and at least one trial on top of the
  // starting flight. A fit's flights average at least 1.005 times the fitted
  // flight's step count on every row; leaving out the probes would put the
  // total below half this floor.
  for (const { name, row } of ROWS) {
    const cal = calibrate(launchOf(row), targetOf(row));
    assert.equal(cal.ok, true, `${name}: ${cal.reason}`);
    assert.ok(cal.iterations >= 1, `${name}: ${cal.iterations} iterations`);
    const floor = 0.9 * (1 + 3 * cal.iterations) * cal.sea.steps;
    assert.ok(cal.steps >= floor, `${name}: ${cal.steps} steps < ${floor}`);
  }
});

test('a line-search trial whose flight fails is halved, not fatal', () => {
  // The first full Newton step toward this unreachable target cannot land
  // within 60 s; halving past it keeps the fit going until it diverges.
  const cal = calibrate(launchOf(rowOf('pga', '7 Iron')), { carryM: 476, maxHeightM: 900 });
  assert.equal(cal.ok, false);
  assert.equal(cal.reason, 'diverged');
});

test('a target that is not a number never converges', () => {
  const cal = calibrate(PGA_DRIVER, {});
  assert.equal(cal.ok, false);
  assert.equal(cal.reason, 'diverged');
});

test('a failed flight is a failure, not an exception', () => {
  const broken = { ...PGA_DRIVER, speedMps: Number.NaN };
  let cal;
  assert.doesNotThrow(() => {
    cal = calibrate(broken, targetOf(PGA_DRIVER_ROW));
  });
  assert.deepEqual(cal, { ok: false, reason: 'flight', iterations: 0, steps: 1 });
});
