// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Markdown summary of out/<name>.json runs.
// Usage: node summary.mjs F0 F0b F1 ...

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '—');

const rows = [];
const alt = [];
for (const name of process.argv.slice(2)) {
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  const bound = (theta) =>
    o.params
      .filter((s, i) => Math.abs(theta[i] - s.lo) < 1e-3 * (s.hi - s.lo) || Math.abs(theta[i] - s.hi) < 1e-3 * (s.hi - s.lo))
      .map((s) => s.name)
      .join(', ') || '—';
  const g = o.g.rms;
  const cv = o.loo?.rms;
  rows.push(
    `| ${name} | ${o.params.length} | ${f2(g.carry)} / ${f2(g.height)} / ${f2(g.land)} | ${cv ? `${f2(cv.carry)} / ${f2(cv.height)} / ${f2(cv.land)}` : '—'} | ${f2(o.a0.rms)} | ${f2(o.aStar.rms)} | ${f2(o.aStar.loo?.rms)} | ${bound(o.g.theta)} | ${bound(o.aStar.theta)} |`,
  );
  for (const mode of ['G', 'A']) {
    const a = o.alt[mode];
    const pd = (ft) => a[ft].find((d) => d.id === 'PGA Driver');
    const range = (ft, key, tour) => {
      const v = a[ft].filter((d) => d.id.startsWith(tour)).map((d) => d[key]);
      return `${f1(Math.min(...v))}…${f1(Math.max(...v))}`;
    };
    const allRange = (ft, key) => {
      const v = a[ft].map((d) => d[key]);
      return `${f1(Math.min(...v))}…${f1(Math.max(...v))}`;
    };
    const h = a.oracles.hard;
    // Round 2: the app's hard set is 1, 2, 3, 6 and 9a (site/js/oracles.js).
    const fails = ['o1', 'o2', 'o3', 'o6', 'o9a'].filter((k) => !h[k]).map((k) => k.slice(1));
    alt.push(
      `| ${name} | ${mode === 'A' ? 'A*' : 'G'} | ${range(5280, 'carryPct', 'PGA')} / ${range(5280, 'carryPct', 'LPGA')} | ${range(10000, 'carryPct', 'PGA')} / ${range(10000, 'carryPct', 'LPGA')} | ${allRange(10000, 'heightYd')} | ${allRange(10000, 'landDeg')} | ${a.mono.ok10k ? 'yes' : `no (${a.mono.low})`} / ${a.mono.high === 0 ? 'yes' : `no (${a.mono.high}, ≤${f2(a.mono.worstCarryFallYd)} yd)`} | ${f1(pd(7800).carryPct)} / ${f1(pd(7800).heightPct)} / ${f2(pd(7800).landDeg)} | ${fails.length ? fails.join(', ') : 'pass'} |`,
    );
  }
}
console.log('| Family | k | G RMS carry / height / land | G LOO-CV RMS | A (G shape) land | A* land | A* LOO-CV land | G params at bound | A* params at bound |');
console.log('|---|---|---|---|---|---|---|---|---|');
rows.forEach((r) => console.log(r));
console.log('');
console.log('| Family | mode | carry % 5,280 ft PGA / LPGA | carry % 10,000 ft PGA / LPGA | max height Δ 10k (yd) | land Δ 10k (°) | monotone 0–10k / 10–15k | Padjen 7,800 ft carry % / apex % / land ° | app hard oracles failed |');
console.log('|---|---|---|---|---|---|---|---|---|');
alt.forEach((r) => console.log(r));
