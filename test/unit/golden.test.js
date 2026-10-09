import { test } from 'node:test';
import assert from 'node:assert/strict';
import { densityRatio, pressureAtElevation } from '../../site/js/atmosphere.js';
import { TOURS } from '../../site/js/data.js';
import { calibrateRow, rowDelta } from '../../site/js/model.js';
import { M_PER_FT } from '../../site/js/units.js';

// From an independent implementation of the spec's model. The deltas do not
// depend on rho0, and reversing constant temperature, dropping or mis-scaling
// spin decay, or mis-computing S each moves them by more than the tolerance.
const TOLERANCE = 0.05;
const GOLDEN = [
  { tourId: 'pga', club: 'Driver', ft: 5000, carryYd: 17.28, maxHeightYd: -3.44, landDeg: -5.07 },
  { tourId: 'pga', club: 'Driver', ft: 10000, carryYd: 29.58, maxHeightYd: -7.05, landDeg: -10.12 },
  { tourId: 'pga', club: '7 Iron', ft: 5000, carryYd: 15.88, maxHeightYd: -2.17, landDeg: -4.1 },
  { tourId: 'pga', club: '7 Iron', ft: 10000, carryYd: 29.24, maxHeightYd: -4.74, landDeg: -8.72 },
  { tourId: 'pga', club: 'PW', ft: 5000, carryYd: 12.02, maxHeightYd: -1.09, landDeg: -3.35 },
  { tourId: 'pga', club: 'PW', ft: 10000, carryYd: 22.48, maxHeightYd: -2.41, landDeg: -6.9 },
  { tourId: 'lpga', club: 'Driver', ft: 5000, carryYd: 9.62, maxHeightYd: -2.34, landDeg: -4.48 },
  { tourId: 'lpga', club: 'Driver', ft: 10000, carryYd: 15.52, maxHeightYd: -4.62, landDeg: -8.59 },
  { tourId: 'lpga', club: '3-wood', ft: 5000, carryYd: 10.26, maxHeightYd: -2.6, landDeg: -4.97 },
  { tourId: 'lpga', club: '3-wood', ft: 10000, carryYd: 16.55, maxHeightYd: -5.22, landDeg: -9.78 },
];

function rowOf(tourId, club) {
  return TOURS.find((tour) => tour.id === tourId).rows.find((row) => row.club === club);
}

const calibrations = new Map();
function calibrationOf(row) {
  if (!calibrations.has(row)) {
    calibrations.set(row, calibrateRow(row));
  }
  return calibrations.get(row);
}

for (const golden of GOLDEN) {
  const name = `${golden.tourId.toUpperCase()} ${golden.club} at ${golden.ft} ft`;
  test(`${name} matches the golden deltas`, () => {
    const row = rowOf(golden.tourId, golden.club);
    const cal = calibrationOf(row);
    assert.equal(cal.ok, true, cal.reason);
    const delta = rowDelta(cal, row, densityRatio(pressureAtElevation(golden.ft * M_PER_FT)));
    assert.equal(delta.ok, true, delta.reason);
    for (const quantity of ['carryYd', 'maxHeightYd', 'landDeg']) {
      assert.ok(
        Math.abs(delta[quantity] - golden[quantity]) <= TOLERANCE,
        `${quantity}: ${delta[quantity]} is not within ${TOLERANCE} of ${golden[quantity]}`,
      );
    }
  });
}
