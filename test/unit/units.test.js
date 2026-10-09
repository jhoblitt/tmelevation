import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  M_PER,
  M_PER_FT,
  M_PER_YD,
  MPS_PER_MPH,
  PA_PER,
  degToRad,
  radToDeg,
  rpmToRadPerS,
} from '../../site/js/units.js';

function near(actual, expected, tolerance) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} is not within ${tolerance} of ${expected}`,
  );
}

test('rpmToRadPerS converts revolutions per minute to radians per second', () => {
  near(rpmToRadPerS(2545), 266.51178, 1e-5);
  assert.equal(rpmToRadPerS(0), 0);
  near(rpmToRadPerS(60), 2 * Math.PI, 1e-12);
});

test('a pressure unit is the stated number of pascals', () => {
  assert.equal(PA_PER.inHg, 3386.389);
  assert.equal(PA_PER.kPa, 1000);
  assert.equal(PA_PER.mbar, 100);
});

test('length units are exact metre multiples', () => {
  assert.equal(M_PER_FT, 0.3048);
  assert.equal(M_PER_YD, 0.9144);
  near(5280 * M_PER_FT, 1609.344, 1e-9);
  assert.deepEqual(M_PER, { ft: 0.3048, m: 1 });
});

test('a mile per hour is 0.44704 metres per second', () => {
  assert.equal(MPS_PER_MPH, 0.44704);
});

test('degToRad and radToDeg round-trip', () => {
  near(degToRad(180), Math.PI, 1e-15);
  near(radToDeg(Math.PI), 180, 1e-12);
  for (const deg of [-90, -0.9, 0, 10.4, 25.2, 89.9]) {
    near(radToDeg(degToRad(deg)), deg, 1e-12);
  }
});
