// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2c, 2026-10-09).
//
// Carry to ground impact per foot of landing height (landing area above (+)
// or below (-) the tee), for the raw-radar-calibrated driver of each law at
// the season air and at Castle Pines / Chapultepec air.
// Usage: node terrain-sens.mjs F0 R0 R1 R2 R3

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, paramObject } from './laws.mjs';
import './laws2.mjs';
import { calibrate, fly, launchOf, toYd, M_PER_YD, M_PER_FT } from './core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const BASE = { ballSpeedMph: 172.85, launchDeg: 10.49, spinRpm: 2571 };
console.log('| Law (Araw) | air | carry, flat yd | Δcarry landing 10 ft below tee | 10 ft above | yd per ft (mean) | land angle ° |');
console.log('|---|---|---|---|---|---|---|');
for (const name of process.argv.slice(2)) {
  const fam = FAMILIES[name];
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  const p = paramObject(fam, o.aStar.theta);
  const cal = calibrate(launchOf(BASE), fam.law, p, { carryM: 283.8 * M_PER_YD, maxHeightM: 34.0 * M_PER_YD }, { kD: 1, kL: 1 }, 1e-6, { rhoRatio: 0.992 });
  const k = { kD: cal.kD, kL: cal.kL };
  for (const [lab, rho] of [['season 0.992', 0.992], ['Castle Pines 0.804', 0.804], ['Chapultepec 0.779', 0.779]]) {
    const f = (h) => fly(launchOf(BASE), fam.law, p, k, { rhoRatio: rho }, { dt: 0.005, groundM: h * M_PER_FT });
    const c0 = f(0);
    const dn = toYd(f(-10).carryM - c0.carryM);
    const up = toYd(f(10).carryM - c0.carryM);
    console.log(`| ${name} | ${lab} | ${toYd(c0.carryM).toFixed(1)} | ${dn >= 0 ? '+' : ''}${dn.toFixed(1)} | ${up.toFixed(1)} | ${((dn - up) / 20).toFixed(2)} | ${((c0.landRad * 180) / Math.PI).toFixed(1)} |`);
  }
}
