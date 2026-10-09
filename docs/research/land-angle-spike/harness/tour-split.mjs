// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Fits each family to one tour's rows at a time (modes G and A*), to see
// whether the PGA and LPGA land columns want different laws.
// Usage: node tour-split.mjs F0b F1 F2 ...

import { FAMILIES } from './laws.mjs';
import { ROWS, fitG, tableG, rmsOf, fitA, tableA } from './eval.mjs';

const f2 = (x) => x.toFixed(2);
console.log('| Family | rows | G RMS carry / height / land | A* land RMS | G theta | A* theta |');
console.log('|---|---|---|---|---|---|');
for (const name of process.argv.slice(2)) {
  const fam = FAMILIES[name];
  for (const tour of ['pga', 'lpga', 'all']) {
    const rows = tour === 'all' ? ROWS : ROWS.filter((r) => r.tour === tour);
    const g = fitG(fam, { rows, restarts: 8, seed: 11 });
    const rg = rmsOf(tableG(fam, g.theta, rows));
    const a = fitA(fam, g.theta, { rows, restarts: 2, seed: 5, maxIter: 50 });
    const ta = tableA(fam, a.theta, rows);
    const ra = Math.sqrt(ta.reduce((s, t) => s + t.land * t.land, 0) / ta.length);
    const th = (t) => fam.params.map((s, i) => `${s.name} ${Math.abs(t[i]) >= 1000 ? t[i].toExponential(2) : t[i].toPrecision(3)}`).join(', ');
    console.log(`| ${name} | ${tour} (${rows.length}) | ${f2(rg.carry)} / ${f2(rg.height)} / ${f2(rg.land)} | ${f2(ra)} | ${th(g.theta)} | ${th(a.theta)} |`);
  }
}
