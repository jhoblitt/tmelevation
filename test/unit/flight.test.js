import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BALL_DIAMETER_M,
  BALL_MASS_KG,
  DRAG_PER_RE,
  DT_S,
  G,
  LAMBDA0,
  MAX_FLIGHT_S,
  RE_FLOOR,
  dragCoefficient,
  fly,
  launchFrom,
  liftCoefficient,
  reynoldsNumber,
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
  assert.equal(DRAG_PER_RE, 0.0135 / 1e5);
  assert.equal(RE_FLOOR, 1e5);
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

test('reynoldsNumber is rho U D over the 25 degree C viscosity and scales with density', () => {
  near(reynoldsNumber(1, 25), 68744.5, 0.1);
  near(reynoldsNumber(1, 60), 164986.7, 0.1);
  near(reynoldsNumber(0.5, 60), 164986.7 / 2, 0.1);
});

test('the lift law: zero at no spin, measured line from S 0.04 to 0.30, then the Bearman & Harvey shape capped at 0.45', () => {
  for (const [s, cl] of [
    // Below the data (S 0.04) the line runs to zero; every tour flight starts at S 0.074.
    [0, 0],
    [0.02, 0.0495],
    [0.04, 0.099],
    [0.1, 0.15],
    [0.2, 0.235],
    [0.3, 0.32],
    [0.5, 0.37],
    [0.82, 0.45],
    [1.2, 0.45],
  ]) {
    near(liftCoefficient(s), cl, 1e-12);
  }
});

test('the drag law at Re 1.5e5: measured quadratic to S 0.22, then slope 0.38, flat above S 0.64', () => {
  for (const [s, cd] of [
    [0, 0.22],
    [0.1, 0.223],
    [0.2, 0.286],
    [0.22, 0.3058],
    [0.3, 0.3362],
    [0.5, 0.4122],
    [0.64, 0.4654],
    [1, 0.4654],
  ]) {
    near(dragCoefficient(s, 1.5e5), cd, 1e-12);
  }
});

test('the drag rises 0.0135 per 1e5 of Reynolds number, frozen below Re 1e5', () => {
  near(dragCoefficient(0.1, 2e5), 0.22975, 1e-12);
  near(dragCoefficient(0.1, 1e5), 0.21625, 1e-12);
  for (const re of [0, 5e4, 7e4, 99999]) {
    assert.equal(dragCoefficient(0.1, re), dragCoefficient(0.1, 1e5), `Re ${re}`);
  }
});

test('the laws are continuous where their pieces meet', () => {
  const eps = 1e-9;
  const jump = (f, x) => Math.abs(f(x + eps) - f(x - eps));
  for (const s of [0.04, 0.22, 0.3, 0.64]) {
    assert.ok(jump(liftCoefficient, s) < 1e-8, `lift at S ${s}`);
    for (const re of [5e4, 1.5e5, 2e5]) {
      assert.ok(jump((x) => dragCoefficient(x, re), s) < 1e-8, `drag at S ${s}, Re ${re}`);
    }
  }
  assert.ok(jump((re) => dragCoefficient(0.1, re), RE_FLOOR) < 1e-8, 'drag at the Re floor');
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
  // Spec section 8.1, from the land-angle spike's harness, an independent
  // implementation. Rounding the factors to four places moves the carry by at
  // most 0.015 yd; a 1 % error in either force coefficient moves it by about 1-2 yd.
  const result = fly(PGA_DRIVER, { kD: 1.2771 / RHO0, kL: 1.4435 / RHO0 });
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
  // Spec section 5.2 bounds every row at 1e-3 yd and 1.3e-3 degrees; this
  // flight's errors are 2.6e-6 yd and 4.5e-4 degrees. The laws' corners (S
  // 0.22, 0.30, 0.64 and Re 1e5) cost RK4 its fourth order in the step that
  // crosses one.
  const flight = fly(PGA_DRIVER);
  const reference = fly(PGA_DRIVER, {}, {}, { dt: 0.001 });
  assert.equal(flight.ok, true);
  assert.equal(reference.ok, true);
  assert.ok(Math.abs(flight.carryM - reference.carryM) / M_PER_YD <= 1e-5);
  assert.ok(Math.abs(flight.maxHeightM - reference.maxHeightM) / M_PER_YD <= 1e-5);
  assert.ok(Math.abs(radToDeg(flight.landRad - reference.landRad)) <= 1.3e-3);
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
