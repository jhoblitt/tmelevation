import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ELEVATION_M,
  MAX_PRESSURE_PA,
  MIN_ELEVATION_M,
  MIN_PRESSURE_PA,
  MU0_PA_S,
  P0_PA,
  RHO0,
  T_REF_K,
  densityRatio,
  elevationAtPressure,
  pressureAtElevation,
} from '../../site/js/atmosphere.js';
import { M_PER_FT } from '../../site/js/units.js';

function near(actual, expected, tolerance) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

test('sea-level constants', () => {
  assert.equal(P0_PA, 101325);
  assert.equal(T_REF_K, 298.15);
});

test('the elevation range runs from -3,700 ft to 36,000 ft', () => {
  assert.equal(MIN_ELEVATION_M, -3700 * M_PER_FT);
  assert.equal(MAX_ELEVATION_M, 36000 * M_PER_FT);
  near(MIN_ELEVATION_M, -1127.76, 1e-9);
  near(MAX_ELEVATION_M, 10972.8, 1e-9);
  // The troposphere formula holds up to 11 km geopotential.
  const geopotential = (6356766 * MAX_ELEVATION_M) / (6356766 + MAX_ELEVATION_M);
  assert.ok(geopotential < 11000, `${geopotential} m'`);
});

test('pressure at elevation matches the USSA 1976 table (truncated to 5 figures)', () => {
  const table = [
    [-500, 1074.7, 0.1],
    [0, 1013.25],
    [1000, 898.76],
    [1584.96, 836.82],
    [1600, 835.27],
    [1615.44, 833.69],
    [2000, 795.01],
    [3000, 701.21],
    [4500, 577.52],
  ];
  for (const [z, hpa, digit = 0.01] of table) {
    const computed = pressureAtElevation(z) / 100;
    assert.ok(
      hpa <= computed && computed < hpa + digit,
      `Z = ${z} m: ${computed} hPa is not in [${hpa}, ${hpa + digit})`,
    );
  }
});

test('pressure at 5,280 ft is 834.318 hPa', () => {
  near(pressureAtElevation(5280 * M_PER_FT) / 100, 834.318, 0.001);
});

test('density ratio at 5,000, 10,000 and 15,000 ft', () => {
  const expected = [
    [5000, 0.832085],
    [10000, 0.687832],
    [15000, 0.564587],
  ];
  for (const [ft, ratio] of expected) {
    near(densityRatio(pressureAtElevation(ft * M_PER_FT)), ratio, 1e-6);
  }
});

test('density ratio is pressure over sea-level pressure', () => {
  assert.equal(densityRatio(P0_PA), 1);
  assert.equal(densityRatio(P0_PA / 2), 0.5);
});

test('sea-level air density at 25 degrees C is 1.18391 kg/m3', () => {
  near(RHO0, 1.18391, 1e-5);
});

test("air viscosity at 25 degrees C is Sutherland's 1.8371e-5 Pa s", () => {
  near(MU0_PA_S, 1.83715e-5, 1e-10);
});

test('the pressure range is the pressures at the ends of the elevation range', () => {
  near(MIN_PRESSURE_PA, 22797.1, 0.1);
  assert.equal(MIN_PRESSURE_PA, pressureAtElevation(MAX_ELEVATION_M));
  near(densityRatio(MIN_PRESSURE_PA), 0.22499, 1e-5);
  near(MAX_PRESSURE_PA, 115629.6, 0.1);
  assert.equal(MAX_PRESSURE_PA, pressureAtElevation(MIN_ELEVATION_M));
  near(densityRatio(MAX_PRESSURE_PA), 1.14118, 1e-5);
  assert.equal(pressureAtElevation(0), P0_PA);
});

test('elevationAtPressure inverts pressureAtElevation', () => {
  for (const z of [-1127.76, -500, 0, 1, 500, 1609.344, 3048, 4572, 10972.8]) {
    near(elevationAtPressure(pressureAtElevation(z)), z, 1e-6);
  }
});
