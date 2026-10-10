// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2b, 2026-10-09).
//
// Re-rank with every altitude oracle soft: fit quality first, and the app's
// altitude oracles reported as values (no pass/fail), oracle 6 first.
// Usage: node rerank.mjs F0 R0 R1 R2 R3

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const W = { carry: 2, height: 1, land: 1.5 };
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '—');
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const names = process.argv.slice(2);
const runs = names.map((n) => ({ n, o: JSON.parse(readFileSync(join(here, 'out', `${n}.json`), 'utf8')) }));

const costPerRow = (r) => (r.carry / W.carry) ** 2 + (r.height / W.height) ** 2 + (r.land / W.land) ** 2;
console.log('### Mode G (one parameter set), ranked by weighted cost');
console.log('| Law | weighted cost | RMS carry / height / land | LOO-CV | oracle 6: PGA 7i carry % at 6,400 ft | 1: Dr carry % 7,800 | 2: apex % | 3: land ° | 9a falls 0–10k |');
console.log('|---|---|---|---|---|---|---|---|---|');
const g = runs
  .map(({ n, o }) => ({ n, o, cost: 23 * costPerRow(o.g.rms) }))
  .sort((a, b) => a.cost - b.cost);
for (const { n, o, cost } of g) {
  const a = o.alt.G;
  const dr = a[7800].find((d) => d.id === 'PGA Driver');
  const i7 = a[6400].find((d) => d.id === 'PGA 7 Iron');
  const cv = o.loo?.rms;
  console.log(`| ${n} | ${cost.toFixed(0)} | ${f2(o.g.rms.carry)} / ${f2(o.g.rms.height)} / ${f2(o.g.rms.land)} | ${cv ? `${f2(cv.carry)} / ${f2(cv.height)} / ${f2(cv.land)}` : '—'} | ${f1(i7.carryPct)} | ${f1(dr.carryPct)} | ${f1(dr.heightPct)} | ${f2(dr.landDeg)} | ${a.mono.low} |`);
}
console.log('\n### Mode A (per-row kD, kL; shape refitted = A*), ranked by land RMS');
console.log('| Law | land RMS | LOO-CV | oracle 6: PGA 7i carry % at 6,400 ft | 1: Dr carry % 7,800 | 2: apex % | 3: land ° | 9a falls 0–10k |');
console.log('|---|---|---|---|---|---|---|---|');
const a = runs.slice().sort((x, y) => x.o.aStar.rms - y.o.aStar.rms);
for (const { n, o } of a) {
  const al = o.alt.A;
  const dr = al[7800].find((d) => d.id === 'PGA Driver');
  const i7 = al[6400].find((d) => d.id === 'PGA 7 Iron');
  console.log(`| ${n} | ${f2(o.aStar.rms)} | ${f2(o.aStar.loo?.rms)} | ${f1(i7.carryPct)} | ${f1(dr.carryPct)} | ${f1(dr.heightPct)} | ${f2(dr.landDeg)} | ${al.mono.low} |`);
}
