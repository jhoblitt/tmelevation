// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// For each row's F0-calibrated sea-level flight (the shipped app's), the
// share of flight time and of the descent spent below Re 7e4 and 8e4.

import { calibrate, RHO0, reynolds, M_PER_YD, DT_S } from './core.mjs';
import { FAMILIES, paramObject, initTheta } from './laws.mjs';
import { ROWS } from './eval.mjs';

const fam = FAMILIES.F0;
const p = paramObject(fam, initTheta(fam));
console.log('| Row | min Re | % of flight time below 7e4 / 8e4 | % of descent time below 7e4 / 8e4 |');
console.log('|---|---|---|---|');
const sums = { pga: [0, 0, 0], lpga: [0, 0, 0] };
for (const row of ROWS) {
  const cal = calibrate(row.launch, fam.law, p, { carryM: row.carryYd * M_PER_YD, maxHeightM: row.heightYd * M_PER_YD });
  // Re-integrate with a simple RK4 copy at fine dt, sampling speed and vy.
  const k = (RHO0 * (Math.PI * 0.04267 ** 2) / 4) / (2 * 0.04593);
  let s = [0, 0, row.launch.speedMps * Math.cos(row.launch.angleRad), row.launch.speedMps * Math.sin(row.launch.angleRad), row.launch.spinRadS];
  const f = (st) => {
    const u = Math.hypot(st[2], st[3]);
    const sp = (0.021335 * st[4]) / u;
    const re = reynolds(RHO0, u);
    const cd = cal.kD * fam.law.cd(re, sp, p);
    const cl = cal.kL * fam.law.cl(re, sp, p);
    return [st[2], st[3], -k * u * (cd * st[2] + cl * st[3]), -k * u * (cd * st[3] - cl * st[2]) - 9.80665, -((2e-5) / 0.021335) * u * st[4]];
  };
  const h = DT_S / 10;
  let t = 0;
  let below7 = 0;
  let below8 = 0;
  let desc = 0;
  let desc7 = 0;
  let desc8 = 0;
  let minRe = Infinity;
  while (s[1] >= 0 || s[3] > 0) {
    const k1 = f(s);
    const k2 = f(s.map((v, i) => v + (h / 2) * k1[i]));
    const k3 = f(s.map((v, i) => v + (h / 2) * k2[i]));
    const k4 = f(s.map((v, i) => v + h * k3[i]));
    s = s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t += h;
    const re = reynolds(RHO0, Math.hypot(s[2], s[3]));
    minRe = Math.min(minRe, re);
    if (re < 7e4) below7 += h;
    if (re < 8e4) below8 += h;
    if (s[3] < 0) {
      desc += h;
      if (re < 7e4) desc7 += h;
      if (re < 8e4) desc8 += h;
    }
  }
  const pc = (a, b) => ((100 * a) / b).toFixed(0);
  console.log(`| ${row.id} | ${minRe.toExponential(2)} | ${pc(below7, t)} / ${pc(below8, t)} | ${pc(desc7, desc)} / ${pc(desc8, desc)} |`);
  const acc = sums[row.tour];
  acc[0] += desc7 / desc;
  acc[1] += desc8 / desc;
  acc[2] += 1;
}
for (const [tour, [a, b, n]] of Object.entries(sums)) {
  console.log(`${tour}: mean share of descent below 7e4 ${((100 * a) / n).toFixed(0)} %, below 8e4 ${((100 * b) / n).toFixed(0)} %`);
}
