import { test } from 'node:test';
import assert from 'node:assert/strict';
import { densityRatio, pressureAtElevation } from '../../site/js/atmosphere.js';
import { TOURS } from '../../site/js/data.js';
import { calibrateRow, rowDelta } from '../../site/js/model.js';
import { M_PER_FT } from '../../site/js/units.js';

// From the land-angle spike's harness (docs/research/land-angle-spike/harness,
// law R0), an independent implementation of the spec's model. The deltas do
// not depend on rho0, and reversing constant temperature, dropping or
// mis-scaling spin decay, or mis-computing S or Re each moves them by more
// than the tolerance.
const TOLERANCE = 0.05;
const GOLDEN = [
  { tourId: 'pga', club: 'Driver', ft: 5000, carryYd: 20.29, maxHeightYd: -3.3, landDeg: -5.44 },
  { tourId: 'pga', club: 'Driver', ft: 10000, carryYd: 34.35, maxHeightYd: -6.9, landDeg: -10.76 },
  { tourId: 'pga', club: '7 Iron', ft: 5000, carryYd: 16.27, maxHeightYd: -1.92, landDeg: -3.91 },
  { tourId: 'pga', club: '7 Iron', ft: 10000, carryYd: 30.79, maxHeightYd: -4.36, landDeg: -8.86 },
  { tourId: 'pga', club: 'PW', ft: 5000, carryYd: 11.73, maxHeightYd: -0.99, landDeg: -2.87 },
  { tourId: 'pga', club: 'PW', ft: 10000, carryYd: 22.0, maxHeightYd: -2.28, landDeg: -6.01 },
  { tourId: 'lpga', club: 'Driver', ft: 5000, carryYd: 11.46, maxHeightYd: -2.3, landDeg: -4.93 },
  { tourId: 'lpga', club: 'Driver', ft: 10000, carryYd: 18.12, maxHeightYd: -4.6, landDeg: -9.32 },
  { tourId: 'lpga', club: '3-wood', ft: 5000, carryYd: 12.56, maxHeightYd: -2.64, landDeg: -5.87 },
  { tourId: 'lpga', club: '3-wood', ft: 10000, carryYd: 19.62, maxHeightYd: -5.34, landDeg: -11.25 },
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
