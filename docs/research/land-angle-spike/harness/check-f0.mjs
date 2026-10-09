// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Harness check: F0 (today's laws) with per-row kD, kL fitted to carry and
// height must reproduce the BRIEF's land-gap table within 0.1 deg on every
// row, and the shipped app's PGA Driver land change at 5,280 ft (-5.35 deg)
// within 0.05 deg. Also compares against the shipped site/js code directly.

import { calibrate, fly, rhoRatioAtFt, tableRows, toDeg, M_PER_YD, MU_25C, RHO0, reynolds } from './core.mjs';
import { FAMILIES, paramObject, initTheta } from './laws.mjs';
import { calibrateRow, rowDelta } from '../../../../site/js/model.js';
import { TOURS } from '../../../../site/js/data.js';
import { radToDeg } from '../../../../site/js/units.js';

const BRIEF_GAP = {
  'PGA Driver': -1.1, 'PGA 3-wood': -4.5, 'PGA 5-wood': -6.5, 'PGA Hybrid': -9.2, 'PGA 3 Iron': -7.5,
  'PGA 4 Iron': -7.0, 'PGA 5 Iron': -5.9, 'PGA 6 Iron': -5.5, 'PGA 7 Iron': -4.4, 'PGA 8 Iron': -3.6,
  'PGA 9 Iron': -3.9, 'PGA PW': -3.4,
  'LPGA Driver': -1.5, 'LPGA 3-wood': -1.1, 'LPGA 5-wood': -4.7, 'LPGA Hybrid': -5.6, 'LPGA 4 Iron': -4.0,
  'LPGA 5 Iron': -4.9, 'LPGA 6 Iron': -4.2, 'LPGA 7 Iron': -2.6, 'LPGA 8 Iron': -0.2, 'LPGA 9 Iron': -0.4,
  'LPGA PW': 0.7,
};

const fam = FAMILIES.F0;
const p = paramObject(fam, initTheta(fam));
const rows = tableRows();
const shipped = TOURS.flatMap((t) => t.rows);

console.log(`MU_25C = ${MU_25C.toExponential(4)} Pa s, RHO0 = ${RHO0.toFixed(5)} kg/m3, Re(60 m/s) = ${reynolds(RHO0, 60).toExponential(3)}, Re(25 m/s) = ${reynolds(RHO0, 25).toExponential(3)}`);
console.log('row | kD kL (harness) | land gap harness | BRIEF | |diff| | app land gap | |harness-app|');
let maxDiff = 0;
let maxApp = 0;
let sumSq = 0;
let pgaAbs = 0;
rows.forEach((row, i) => {
  const cal = calibrate(row.launch, fam.law, p, { carryM: row.carryYd * M_PER_YD, maxHeightM: row.heightYd * M_PER_YD });
  const gap = toDeg(cal.sea.landRad) - row.landDeg;
  const app = calibrateRow(shipped[i]);
  const appGap = radToDeg(app.sea.landRad) - row.landDeg;
  const d = Math.abs(gap - BRIEF_GAP[row.id]);
  const da = Math.abs(gap - appGap);
  maxDiff = Math.max(maxDiff, d);
  maxApp = Math.max(maxApp, da);
  sumSq += gap * gap;
  if (row.tour === 'pga') pgaAbs += Math.abs(gap);
  console.log(`${row.id.padEnd(12)} | ${cal.kD.toFixed(4)} ${cal.kL.toFixed(4)} | ${gap.toFixed(3)} | ${BRIEF_GAP[row.id].toFixed(1)} | ${d.toFixed(3)} | ${appGap.toFixed(3)} | ${da.toExponential(2)}`);
});
console.log(`max |harness - BRIEF| = ${maxDiff.toFixed(3)} deg (pass if <= 0.1: ${maxDiff <= 0.1})`);
console.log(`max |harness - shipped app| = ${maxApp.toExponential(2)} deg`);
console.log(`land RMS (23 rows) = ${Math.sqrt(sumSq / rows.length).toFixed(3)} deg; PGA mean |gap| = ${(pgaAbs / 12).toFixed(3)}`);

// App land change, PGA Driver, 5,280 ft.
const row = rows[0];
const cal = calibrate(row.launch, fam.law, p, { carryM: row.carryYd * M_PER_YD, maxHeightM: row.heightYd * M_PER_YD });
const rr = rhoRatioAtFt(5280);
const alt = fly(row.launch, fam.law, p, { kD: cal.kD, kL: cal.kL }, { rhoRatio: rr });
const dLand = toDeg(alt.landRad - cal.sea.landRad);
const appCal = calibrateRow(shipped[0]);
const appDelta = rowDelta(appCal, shipped[0], rr);
console.log(`rhoRatio(5280 ft) = ${rr.toFixed(5)}`);
console.log(`PGA Driver 5,280 ft land change: harness ${dLand.toFixed(4)} deg, shipped app ${appDelta.landDeg.toFixed(4)} deg, target -5.35; |harness - (-5.35)| = ${Math.abs(dLand + 5.35).toFixed(4)} (pass if <= 0.05: ${Math.abs(dLand + 5.35) <= 0.05})`);
console.log(`PGA Driver 5,280 ft carry change: harness ${((alt.carryM - cal.sea.carryM) / M_PER_YD).toFixed(3)} yd, app ${appDelta.carryYd.toFixed(3)} yd`);
