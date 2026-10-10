// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Informational agreement with TrackMan's 2014 model 6-iron shots and wind
// table, from out/<name>.json. Usage: node tm-table.mjs F0 F1 ...

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const f1 = (x) => `${x >= 0.05 ? '+' : ''}${x.toFixed(1)}`;
console.log('| Family | mode | PGA 6i carry / height / land vs TM | LPGA 6i | wind land-response error, max abs (°) | wind carry-response error, max abs (yd) |');
console.log('|---|---|---|---|---|---|');
for (const name of process.argv.slice(2)) {
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  for (const mode of ['G', 'A']) {
    const t = o.tm[mode];
    const s = (x) => (mode === 'A' ? `— / — / ${f1(x.land)}` : `${f1(x.carry)} / ${f1(x.height)} / ${f1(x.land)}`);
    const maxAbs = (k) => Math.max(...t.wind.map((w) => Math.abs(w[k]))).toFixed(1);
    console.log(`| ${name} | ${mode === 'A' ? 'A*' : 'G'} | ${s(t.shots.pga)} | ${s(t.shots.lpga)} | ${maxAbs('landResp')} | ${maxAbs('carryResp')} |`);
  }
}
