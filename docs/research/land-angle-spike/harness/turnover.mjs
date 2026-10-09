// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2b, 2026-10-09).
//
// Per row, the elevation where carry turns over (first local maximum of carry
// against elevation at constant 25 degC), searched 0-15,000 ft on a 100 ft
// grid. Usage: node turnover.mjs F0:G F0:A R0:G R0:A R2:G ...
// (mode G uses out/<name>.json g.theta; mode A uses aStar.theta with per-row
// kD, kL calibrated at sea level, as the app does).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, paramObject } from './laws.mjs';
import './laws2.mjs';
import { ROWS, calibrateAll } from './eval.mjs';
import { fly, rhoRatioAtFt, toYd } from './core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const STEP = 100;
const TOP = 15000;
const EPS_YD = 1e-4;
const specs = process.argv.slice(2).map((s) => {
  const [name, mode] = s.split(':');
  return { name, mode };
});
const rr = [];
for (let ft = 0; ft <= TOP; ft += STEP) rr.push(rhoRatioAtFt(ft));

const results = specs.map(({ name, mode }) => {
  const fam = FAMILIES[name.replace(/-.*$/, '')];
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  const theta = mode === 'G' ? o.g.theta : o.aStar.theta;
  const p = paramObject(fam, theta);
  const cals = mode === 'A' ? calibrateAll(fam, theta) : null;
  return ROWS.map((row, i) => {
    const k = cals ? { kD: cals[i].kD, kL: cals[i].kL } : { kD: 1, kL: 1 };
    const carry = rr.map((r) => toYd(fly(row.launch, fam.law, p, k, { rhoRatio: r }).carryM));
    let turn = null;
    for (let j = 0; j + 1 < carry.length; j++) {
      if (carry[j + 1] < carry[j] - EPS_YD) {
        turn = j * STEP;
        break;
      }
    }
    const jMax = carry.indexOf(Math.max(...carry));
    return {
      id: row.id,
      turnFt: turn,
      gainAtTurnPct: turn === null ? null : (100 * (carry[turn / STEP] - carry[0])) / carry[0],
      gain15kPct: (100 * (carry[carry.length - 1] - carry[0])) / carry[0],
      maxFt: jMax * STEP,
    };
  });
});

const lab = (s) => `${s.name} ${s.mode === 'A' ? 'A*' : 'G'}`;
console.log('Elevation (ft) where carry first stops rising, 0-15,000 ft at 100 ft steps; "—" = rises to 15,000 ft. In brackets: carry gain % at the turnover / at 15,000 ft.');
console.log(`| Row | ${specs.map(lab).join(' | ')} |`);
console.log(`|---|${specs.map(() => '---').join('|')}|`);
ROWS.forEach((row, i) => {
  console.log(`| ${row.id} | ${results.map((res) => {
    const r = res[i];
    return r.turnFt === null ? `— (${r.gain15kPct.toFixed(1)})` : `${r.turnFt.toLocaleString('en-US')} (${r.gainAtTurnPct.toFixed(1)} / ${r.gain15kPct.toFixed(1)})`;
  }).join(' | ')} |`);
});
specs.forEach((s, k) => {
  const turned = results[k].filter((r) => r.turnFt !== null);
  const low = turned.length ? Math.min(...turned.map((r) => r.turnFt)) : null;
  console.log(`${lab(s)}: ${turned.length} of 23 rows turn over below 15,000 ft; lowest ${low === null ? '—' : `${low} ft (${turned.find((r) => r.turnFt === low).id})`}; below 10,000 ft: ${turned.filter((r) => r.turnFt < 10000).map((r) => `${r.id} ${r.turnFt}`).join(', ') || 'none'}`);
});
