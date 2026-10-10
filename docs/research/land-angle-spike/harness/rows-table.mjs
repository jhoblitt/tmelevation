// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Per-row residual tables (model - table) from out/<name>.json.
// Usage: node rows-table.mjs G F0 F1 ...   (carry / height / land per family)
//        node rows-table.mjs A F0 F1 ...   (mode A* land per family)

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [mode, ...names] = process.argv.slice(2);
const outs = names.map((n) => JSON.parse(readFileSync(join(here, 'out', `${n}.json`), 'utf8')));
const f1 = (x) => (Number.isFinite(x) ? `${x >= 0.05 ? '+' : ''}${x.toFixed(1)}` : '—');

if (mode === 'G') {
  console.log(`| Row | ${names.map((n) => `${n} carry / height / land`).join(' | ')} |`);
  console.log(`|---|${names.map(() => '---').join('|')}|`);
  outs[0].g.table.forEach((row, i) => {
    console.log(`| ${row.id} | ${outs.map((o) => `${f1(o.g.table[i].carry)} / ${f1(o.g.table[i].height)} / ${f1(o.g.table[i].land)}`).join(' | ')} |`);
  });
} else {
  console.log(`| Row | ${names.map((n) => `${n} A* land (kD, kL)`).join(' | ')} |`);
  console.log(`|---|${names.map(() => '---').join('|')}|`);
  outs[0].aStar.table.forEach((row, i) => {
    console.log(`| ${row.id} | ${outs.map((o) => { const t = o.aStar.table[i]; return `${f1(t.land)} (${t.kD.toFixed(2)}, ${t.kL.toFixed(2)})`; }).join(' | ')} |`);
  });
}
