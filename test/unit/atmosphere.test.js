import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ELEVATION_M,
  MIN_PRESSURE_PA,
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
  assert.equal(MAX_ELEVATION_M, 4572);
});

test('pressure at elevation matches the USSA 1976 table (truncated to 0.01 hPa)', () => {
  const table = [
    [0, 1013.25],
    [1000, 898.76],
    [1584.96, 836.82],
    [1600, 835.27],
    [1615.44, 833.69],
    [2000, 795.01],
    [3000, 701.21],
    [4500, 577.52],
  ];
  for (const [z, hpa] of table) {
    const computed = pressureAtElevation(z) / 100;
    assert.ok(
      hpa <= computed && computed < hpa + 0.01,
      `Z = ${z} m: ${computed} hPa is not in [${hpa}, ${hpa + 0.01})`,
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

test('the minimum pressure is the pressure at the maximum elevation', () => {
  near(MIN_PRESSURE_PA, 57206.8, 0.1);
  assert.equal(MIN_PRESSURE_PA, pressureAtElevation(MAX_ELEVATION_M));
});

test('elevationAtPressure inverts pressureAtElevation', () => {
  for (const z of [0, 1, 500, 1609.344, 3048, 4572]) {
    near(elevationAtPressure(pressureAtElevation(z)), z, 1e-6);
  }
});
