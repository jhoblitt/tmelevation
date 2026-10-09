import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BALL_DIAMETER_M,
  BALL_MASS_KG,
  DT_S,
  G,
  LAMBDA0,
  MAX_FLIGHT_S,
  fly,
  launchFrom,
  spinParameter,
} from '../../site/js/flight.js';
import { RHO0 } from '../../site/js/atmosphere.js';
import { TOURS } from '../../site/js/data.js';
import { M_PER_YD, MPS_PER_MPH, degToRad, radToDeg, rpmToRadPerS } from '../../site/js/units.js';

function near(actual, expected, tolerance) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

const RADIUS_M = BALL_DIAMETER_M / 2;

const PGA_DRIVER_ROW = TOURS.find((tour) => tour.id === 'pga').rows.find(
  (row) => row.club === 'Driver',
);
const PGA_DRIVER = launchFrom({
  ballSpeedMph: PGA_DRIVER_ROW.ballSpeed,
  launchDeg: PGA_DRIVER_ROW.launch,
  spinRpm: PGA_DRIVER_ROW.spin,
});

const VACUUM = { kD: 0, kL: 0 };
const VACUUM_SHOT = { speedMps: 50, angleRad: degToRad(30), spinRadS: rpmToRadPerS(3000) };

test('model constants', () => {
  assert.equal(BALL_MASS_KG, 0.04593);
  assert.equal(BALL_DIAMETER_M, 0.04267);
  assert.equal(G, 9.80665);
  assert.equal(LAMBDA0, 2e-5);
  assert.equal(DT_S, 0.05);
  assert.equal(MAX_FLIGHT_S, 60);
});

test('launchFrom converts published units to SI', () => {
  const launch = launchFrom({ ballSpeedMph: 171, launchDeg: 10.4, spinRpm: 2545 });
  assert.deepEqual(launch, {
    speedMps: 171 * MPS_PER_MPH,
    angleRad: degToRad(10.4),
    spinRadS: rpmToRadPerS(2545),
  });
});

test('spinParameter is r times omega over air speed', () => {
  near(spinParameter(rpmToRadPerS(2545), 171 * MPS_PER_MPH), 0.07438, 1e-5);
});

test('a vacuum flight matches the closed-form projectile', () => {
  const result = fly(VACUUM_SHOT, VACUUM);
  assert.equal(result.ok, true);
  near(result.carryM, 220.775036, 1e-6);
  near(result.maxHeightM, 31.866132, 1e-6);
  near(radToDeg(result.landRad), 30, 1e-6);
});

test('wind does not move a vacuum flight', () => {
  const calm = fly(VACUUM_SHOT, VACUUM);
  const windy = fly(VACUUM_SHOT, VACUUM, { windMps: 10 });
  assert.equal(windy.ok, true);
  assert.equal(windy.carryM, calm.carryM);
  assert.equal(windy.maxHeightM, calm.maxHeightM);
  assert.equal(windy.landRad, calm.landRad);
  // Spin decay and air path follow the air-relative speed, so they do move.
  assert.notEqual(windy.landSpinRadS, calm.landSpinRadS);
  assert.notEqual(windy.airPathM, calm.airPathM);
});

test('zero spin gives zero lift', () => {
  const spinless = { ...PGA_DRIVER, spinRadS: 0 };
  const normal = fly(spinless, { kD: 1, kL: 1 });
  assert.equal(normal.ok, true);
  assert.deepEqual(fly(spinless, { kD: 1, kL: 5 }), normal);
});

test('the calibrated PGA Driver factors reproduce its published carry and max height', () => {
  // Spec section 8.1, from an independent implementation. Rounding the factors
  // to four places moves the carry by at most 0.015 yd; a 1 % error in either
  // force coefficient moves it by about 1-2 yd.
  const result = fly(PGA_DRIVER, { kD: 1.0893 / RHO0, kL: 0.9912 / RHO0 });
  assert.equal(result.ok, true);
  near(result.carryM / M_PER_YD, PGA_DRIVER_ROW.carry.yd, 0.05);
  near(result.maxHeightM / M_PER_YD, PGA_DRIVER_ROW.maxHeight.yd, 0.05);
  near(result.landSpinRadS / PGA_DRIVER.spinRadS, 0.777, 0.005);
});

test('halving the time step moves the PGA Driver flight by less than display precision', () => {
  const coarse = fly(PGA_DRIVER, { kD: 1, kL: 1 }, { rhoRatio: 1 }, { dt: 0.05 });
  const fine = fly(PGA_DRIVER, { kD: 1, kL: 1 }, { rhoRatio: 1 }, { dt: 0.025 });
  assert.equal(coarse.ok, true);
  assert.equal(fine.ok, true);
  assert.ok(Math.abs(coarse.carryM - fine.carryM) / M_PER_YD < 0.001);
  assert.ok(Math.abs(coarse.maxHeightM - fine.maxHeightM) / M_PER_YD < 0.001);
  assert.ok(Math.abs(radToDeg(coarse.landRad - fine.landRad)) < 0.01);
});

test('the PGA Driver at dt 0.05 s is within the spec error bound of a dt 0.001 s reference', () => {
  // Spec section 5.2: at most 1e-6 yd and 1.1e-3 degrees.
  const flight = fly(PGA_DRIVER);
  const reference = fly(PGA_DRIVER, {}, {}, { dt: 0.001 });
  assert.equal(flight.ok, true);
  assert.equal(reference.ok, true);
  assert.ok(Math.abs(flight.carryM - reference.carryM) / M_PER_YD <= 1e-6);
  assert.ok(Math.abs(flight.maxHeightM - reference.maxHeightM) / M_PER_YD <= 1e-6);
  assert.ok(Math.abs(radToDeg(flight.landRad - reference.landRad)) <= 1.1e-3);
});

test('spin decays exponentially in the air path, scaled by density', () => {
  const landSpin = {};
  for (const rhoRatio of [1, 0.5]) {
    const result = fly(PGA_DRIVER, { kD: 1, kL: 1 }, { rhoRatio });
    assert.equal(result.ok, true);
    const measured = Math.log(PGA_DRIVER.spinRadS / result.landSpinRadS);
    const law = (LAMBDA0 * rhoRatio * result.airPathM) / RADIUS_M;
    assert.ok(
      Math.abs(measured - law) / law < 1e-5,
      `rhoRatio ${rhoRatio}: ln(w0/w) = ${measured}, law = ${law}`,
    );
    landSpin[rhoRatio] = result.landSpinRadS;
  }
  assert.ok(landSpin[0.5] > landSpin[1]);
});

test('a tailwind lengthens the PGA Driver carry and a headwind shortens it', () => {
  const tenMph = 10 * MPS_PER_MPH;
  const calm = fly(PGA_DRIVER);
  const tail = fly(PGA_DRIVER, {}, { windMps: tenMph });
  const head = fly(PGA_DRIVER, {}, { windMps: -tenMph });
  assert.ok(tail.carryM > calm.carryM, `tailwind ${tail.carryM} <= calm ${calm.carryM}`);
  assert.ok(head.carryM < calm.carryM, `headwind ${head.carryM} >= calm ${calm.carryM}`);
});

test('a non-finite state is a failure, not an exception', () => {
  let result;
  assert.doesNotThrow(() => {
    result = fly(PGA_DRIVER, {}, { rhoRatio: Number.NaN });
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'nonfinite');
});

test('a flight that cannot land within 60 s is a failure, not an exception', () => {
  const lob = launchFrom({ ballSpeedMph: 1000, launchDeg: 60, spinRpm: 0 });
  let result;
  assert.doesNotThrow(() => {
    result = fly(lob, VACUUM, { rhoRatio: 0 });
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'cap');
  assert.ok(result.steps <= 1201, `${result.steps} steps`);
});

test('a time step that never advances is a cap failure, not a hang', () => {
  for (const dt of [0, -0.05, Number.NaN]) {
    assert.deepEqual(fly(PGA_DRIVER, {}, {}, { dt }), { ok: false, reason: 'cap', steps: 0 });
  }
});

test('the PGA Driver lands within 160 steps at sea level and at 15,000 ft', () => {
  for (const rhoRatio of [1, 0.564587]) {
    const result = fly(PGA_DRIVER, {}, { rhoRatio });
    assert.equal(result.ok, true);
    assert.ok(result.steps <= 160, `rhoRatio ${rhoRatio}: ${result.steps} steps`);
  }
});
