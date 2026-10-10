// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2b, 2026-10-09).
//
// Raw PGA TOUR 2022-23 radar driver (provenance.md section 5): launch 172.85
// mph, 10.49 deg, 2571 rpm, flown at density ratio 0.992 (conditions.md).
// Measured: carry 283.8 yd, apex 34.0 yd, hang time 6.4 s, distance to apex
// 186.0 yd (65.5 % of carry), all season means, carry and hang to ground
// impact. For each law: (a1) nominal / unfitted, (a2) the mode-G global fit,
// (bG) / (bA) per-row kD, kL calibrated to the raw carry and apex, with the
// mode-G or mode-A* shape. Then an average-of-shots bound by Gauss-Hermite
// quadrature over independent normal launch spreads.
// Usage: node raw-driver.mjs F0 R0 R1 R2 R3

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, paramObject } from './laws.mjs';
import './laws2.mjs';
import { calibrate, fly, launchOf, toYd, M_PER_YD } from './core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const RAW = { ballSpeedMph: 172.85, launchDeg: 10.49, spinRpm: 2571 };
const RHO = 0.992;
const MEAS = { carry: 283.8, apex: 34.0, hang: 6.4, apexX: 186.0 };
const env = { rhoRatio: RHO };

function shape(fam, p, k, inputs = RAW) {
  const f = fly(launchOf(inputs), fam.law, p, k, env, { dt: 0.005, diag: true });
  return { carry: toYd(f.carryM), apex: toYd(f.maxHeightM), hang: f.timeS, apexX: toYd(f.apexXM), apexPct: (100 * f.apexXM) / f.carryM };
}

function calibrated(fam, p) {
  const cal = calibrate(launchOf(RAW), fam.law, p, { carryM: MEAS.carry * M_PER_YD, maxHeightM: MEAS.apex * M_PER_YD }, { kD: 1, kL: 1 }, 1e-6, env);
  return cal.ok ? { kD: cal.kD, kL: cal.kL } : null;
}

const row = (lab, s, k) =>
  `| ${lab} | ${s.carry.toFixed(1)} | ${s.apex.toFixed(1)} | ${s.hang.toFixed(2)} (${s.hang - MEAS.hang >= 0 ? '+' : ''}${(s.hang - MEAS.hang).toFixed(2)}) | ${s.apexPct.toFixed(1)} (${s.apexPct - 65.5 >= 0 ? '+' : ''}${(s.apexPct - 65.5).toFixed(1)}) | ${s.apexX.toFixed(1)} | ${k ? `${k.kD.toFixed(3)}, ${k.kL.toFixed(3)}` : '—'} |`;

console.log(`Raw driver ${RAW.ballSpeedMph} mph / ${RAW.launchDeg} deg / ${RAW.spinRpm} rpm at density ${RHO}. Measured: carry ${MEAS.carry}, apex ${MEAS.apex}, hang ${MEAS.hang} s, apex at ${MEAS.apexX} yd (65.5 %).`);
console.log('| Law, variant | carry yd | apex yd | hang s (vs 6.4) | apex % carry (vs 65.5) | apex distance yd | kD, kL |');
console.log('|---|---|---|---|---|---|---|');
const calibs = {};
for (const name of process.argv.slice(2)) {
  const fam = FAMILIES[name];
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  const pNom = paramObject(fam, fam.params.map((s) => s.init));
  const pG = paramObject(fam, o.g.theta);
  const pA = paramObject(fam, o.aStar.theta);
  console.log(row(`${name} (a1) nominal, unfitted`, shape(fam, pNom, { kD: 1, kL: 1 }), null));
  console.log(row(`${name} (a2) mode-G global fit`, shape(fam, pG, { kD: 1, kL: 1 }), null));
  const kG = calibrated(fam, pG);
  if (kG) console.log(row(`${name} (bG) calibrated, G shape`, shape(fam, pG, kG), kG));
  const kA = calibrated(fam, pA);
  if (kA) console.log(row(`${name} (bA) calibrated, A* shape`, shape(fam, pA, kA), kA));
  calibs[name] = { fam, pA, kA };
}

// Average of shots vs shot of averages: independent normal spreads in ball
// speed, launch and spin, 5-point Gauss-Hermite per dimension (125 shots).
const GH = [
  [-2.8569700139, 0.0112574113],
  [-1.3556261800, 0.2220759220],
  [0, 0.5333333333],
  [1.3556261800, 0.2220759220],
  [2.8569700139, 0.0112574113],
];
const SPREADS = [
  { label: 'moderate', sv: 6, sl: 2, ss: 500 },
  { label: 'wide', sv: 10, sl: 3, ss: 800 },
];
console.log('\nAverage-of-shots minus shot-of-averages (calibrated, A* shape): mean over the spread minus the value at the mean launch; apex % is the ratio of means (mean apex distance / mean carry), as PGA TOUR publishes it.');
console.log('| Law | spread (SD mph / deg / rpm) | carry yd | apex yd | hang s | apex % (ratio of means) |');
console.log('|---|---|---|---|---|---|');
for (const [name, { fam, pA, kA }] of Object.entries(calibs)) {
  if (!kA) continue;
  const at = shape(fam, pA, kA);
  for (const sp of SPREADS) {
    let c = 0;
    let a = 0;
    let h = 0;
    let ax = 0;
    for (const [xv, wv] of GH) {
      for (const [xl, wl] of GH) {
        for (const [xs, ws] of GH) {
          const w = wv * wl * ws;
          const s = shape(fam, pA, kA, { ballSpeedMph: RAW.ballSpeedMph + sp.sv * xv, launchDeg: RAW.launchDeg + sp.sl * xl, spinRpm: RAW.spinRpm + sp.ss * xs });
          c += w * s.carry;
          a += w * s.apex;
          h += w * s.hang;
          ax += w * s.apexX;
        }
      }
    }
    const pct = (100 * ax) / c;
    const d = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(2)}`;
    console.log(`| ${name} | ${sp.label} (${sp.sv} / ${sp.sl} / ${sp.ss}) | ${d(c - at.carry)} | ${d(a - at.apex)} | ${d(h - at.hang)} | ${d(pct - at.apexPct)} |`);
  }
}

// Spread-calibrated variant: kD, kL chosen so that the MEAN over the spread
// of carry and apex equals the measured means (283.8 / 34.0 yd), then the
// mean hang time and the ratio-of-means apex position are compared with the
// measured 6.4 s and 65.5 %. Damped Newton with a forward-difference
// Jacobian, flights at dt 0.05 s inside the solve.
function spreadMeans(fam, p, k, sp, dt) {
  let c = 0;
  let a = 0;
  let h = 0;
  let ax = 0;
  for (const [xv, wv] of GH) {
    for (const [xl, wl] of GH) {
      for (const [xs, ws] of GH) {
        const w = wv * wl * ws;
        const inp = { ballSpeedMph: RAW.ballSpeedMph + sp.sv * xv, launchDeg: RAW.launchDeg + sp.sl * xl, spinRpm: RAW.spinRpm + sp.ss * xs };
        const f = fly(launchOf(inp), fam.law, p, k, env, { dt, diag: true });
        c += w * toYd(f.carryM);
        a += w * toYd(f.maxHeightM);
        h += w * f.timeS;
        ax += w * toYd(f.apexXM);
      }
    }
  }
  return { carry: c, apex: a, hang: h, apexPct: (100 * ax) / c };
}

function spreadCalibrate(fam, p, start, sp) {
  let k = { ...start };
  const res = (m) => [m.carry - MEAS.carry, m.apex - MEAS.apex];
  let m = spreadMeans(fam, p, k, sp, 0.05);
  let r = res(m);
  for (let it = 0; it < 12 && Math.hypot(r[0], r[1]) > 1e-3; it++) {
    const hD = 1e-4 * k.kD;
    const hL = 1e-4 * k.kL;
    const mD = spreadMeans(fam, p, { kD: k.kD + hD, kL: k.kL }, sp, 0.05);
    const mL = spreadMeans(fam, p, { kD: k.kD, kL: k.kL + hL }, sp, 0.05);
    const J = [
      [(mD.carry - m.carry) / hD, (mL.carry - m.carry) / hL],
      [(mD.apex - m.apex) / hD, (mL.apex - m.apex) / hL],
    ];
    const det = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    const dD = (-r[0] * J[1][1] + r[1] * J[0][1]) / det;
    const dL = (-r[1] * J[0][0] + r[0] * J[1][0]) / det;
    let t = 1;
    let accepted = false;
    for (let hv = 0; hv < 8; hv++, t /= 2) {
      const kt = { kD: k.kD + t * dD, kL: k.kL + t * dL };
      const mt = spreadMeans(fam, p, kt, sp, 0.05);
      const rt = res(mt);
      if (Math.hypot(rt[0], rt[1]) < Math.hypot(r[0], r[1])) {
        k = kt;
        m = mt;
        r = rt;
        accepted = true;
        break;
      }
    }
    if (!accepted) break;
  }
  return { k, m: spreadMeans(fam, p, k, sp, 0.005), resid: r };
}

console.log('\nSpread-calibrated (A* shape): kD, kL set so the MEAN carry and apex over the spread equal 283.8 / 34.0 yd; then mean hang and ratio-of-means apex position.');
console.log('| Law | spread | kD, kL | mean carry / apex yd | mean hang s (vs 6.4) | apex % ratio of means (vs 65.5) |');
console.log('|---|---|---|---|---|---|');
for (const [name, { fam, pA, kA }] of Object.entries(calibs)) {
  if (!kA) continue;
  for (const sp of SPREADS) {
    const { k, m } = spreadCalibrate(fam, pA, kA, sp);
    console.log(`| ${name} | ${sp.label} | ${k.kD.toFixed(3)}, ${k.kL.toFixed(3)} | ${m.carry.toFixed(1)} / ${m.apex.toFixed(1)} | ${m.hang.toFixed(2)} (${m.hang - MEAS.hang >= 0 ? '+' : ''}${(m.hang - MEAS.hang).toFixed(2)}) | ${m.apexPct.toFixed(1)} (${m.apexPct - 65.5 >= 0 ? '+' : ''}${(m.apexPct - 65.5).toFixed(1)}) |`);
  }
}
