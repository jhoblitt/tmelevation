// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Soft trajectory-shape check for the PGA Driver row against PGA TOUR 2022-23
// radar averages (probe 3, provenance.md section 5): hang time 6.4 s and apex
// at 65.5 % of carry (186.0 / 283.8 yd, ratio of means; both to ground impact).
// Usage: node driver-shape.mjs F0 F1 ...   (reads out/<name>.json)

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, paramObject } from './laws.mjs';
import './laws2.mjs';
import { ROWS } from './eval.mjs';
import { calibrate, fly, toYd, M_PER_YD } from './core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const row = ROWS.find((r) => r.id === 'PGA Driver');
console.log('| Family | mode | carry yd | apex yd | hang time s (6.4) | apex at % carry (65.5) |');
console.log('|---|---|---|---|---|---|');
for (const name of process.argv.slice(2)) {
  const fam = FAMILIES[name.replace(/-.*$/, '')];
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  for (const mode of ['G', 'A']) {
    const p = paramObject(fam, mode === 'G' ? o.g.theta : o.aStar.theta);
    let k = { kD: 1, kL: 1 };
    if (mode === 'A') {
      const cal = calibrate(row.launch, fam.law, p, { carryM: row.carryYd * M_PER_YD, maxHeightM: row.heightYd * M_PER_YD });
      k = { kD: cal.kD, kL: cal.kL };
    }
    const f = fly(row.launch, fam.law, p, k, {}, { dt: 0.005, diag: true });
    console.log(`| ${name} | ${mode === 'A' ? 'A*' : 'G'} | ${toYd(f.carryM).toFixed(1)} | ${toYd(f.maxHeightM).toFixed(1)} | ${f.timeS.toFixed(2)} | ${((100 * f.apexXM) / f.carryM).toFixed(1)} |`);
  }
}
