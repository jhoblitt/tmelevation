// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Ballooning diagnostics from out/<name>.json: rise of the ground flight-path
// angle above launch, where it peaks, and the apex position, as % of carry.
// Usage: node balloon-table.mjs <G|A> F0 F1 ...

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [mode, ...names] = process.argv.slice(2);
const outs = names.map((n) => JSON.parse(readFileSync(join(here, 'out', `${n}.json`), 'utf8')));
const f1 = (x) => x.toFixed(1);
console.log(`mode ${mode}; each cell: rise ° above launch (peak at % carry) / apex at % carry`);
console.log(`| Row | launch ° | ${names.join(' | ')} |`);
console.log(`|---|---|${names.map(() => '---').join('|')}|`);
outs[0].bal[mode].forEach((b, i) => {
  console.log(`| ${b.id} | ${f1(b.launchDeg)} | ${outs.map((o) => { const x = o.bal[mode][i]; return `${f1(x.rise)} (${f1(x.peakAtPct)}) / ${f1(x.apexAtPct)}`; }).join(' | ')} |`);
});
for (const [n, o] of names.map((n, i) => [n, outs[i]])) {
  const b = o.bal[mode];
  const r = (k) => `${f1(Math.min(...b.map((x) => x[k])))}…${f1(Math.max(...b.map((x) => x[k])))}`;
  const mean = (k) => f1(b.reduce((s, x) => s + x[k], 0) / b.length);
  console.log(`${n}: rise ${r('rise')} (mean ${mean('rise')}), peak at ${r('peakAtPct')}%, apex at ${r('apexAtPct')}% (mean ${mean('apexAtPct')}%)`);
}
