// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2c, 2026-10-09).
//
// Scores each law against the PGA TOUR on-site radar driver gains at altitude
// (altitude-evidence.md section 2): player-matched event minus own season,
// carry to ground impact. Season baseline: the 2022-23 radar launch
// (172.85 mph, 10.49 deg, 2571 rpm) at density 0.992. Each event is flown at
// its density, (a) at the season launch and (b) with the event's measured
// ball-speed / launch / spin shift. Variants per law: G = mode-G global fit;
// Aapp = A* shape with kD, kL from the app's PGA Driver row (171 mph, 10.4
// deg, 2545 rpm -> 282 / 35 yd at sea level); Araw = A* shape calibrated to the
// raw radar carry / apex (283.8 / 34.0 yd at 0.992), as in round 2b.
// Usage: node driver-events.mjs F0 R0 R1 R2 R3

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, paramObject } from './laws.mjs';
import './laws2.mjs';
import { calibrate, fly, launchOf, toYd, M_PER_YD } from './core.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const BASE = { ballSpeedMph: 172.85, launchDeg: 10.49, spinRpm: 2571 };
const RHO_SEASON = 0.992;
const YD_TO_FT = 3;
const CONTROL_OFFSET = 3.3; // |control event bias|, yd (Vidanta 2024: -3.30 +- 0.43)
const EVENTS = [
  { id: 'Mexico 2017', rho: 0.783, dv: 0.0, dl: 3.13, ds: 369, meas: 21.86, se: 0.96, adj: 11.9, apexFt: 23.8, hang: -1.46 },
  { id: 'Mexico 2018', rho: 0.775, dv: 0.07, dl: 3.03, ds: 404, meas: 21.53, se: 1.24, adj: 11.7, apexFt: 15.1, hang: -1.16 },
  { id: 'Mexico 2019', rho: 0.776, dv: 1.69, dl: 0.9, ds: 353, meas: 19.02, se: 1.78, adj: 12.6, apexFt: 7.5, hang: -0.08 },
  { id: 'Mexico 2020', rho: 0.78, dv: 2.35, dl: 1.24, ds: 138, meas: 16.19, se: 2.75, adj: 8.0, apexFt: 2.4, hang: -0.68 },
  { id: 'Castle Pines 2024', rho: 0.804, dv: 1.45, dl: 1.23, ds: -21, meas: 27.51, se: 0.94, adj: 21.3, apexFt: -11.1, hang: null, hard: true },
  { id: 'Old Greenwood 2024', rho: 0.812, dv: 1.79, dl: 1.89, ds: -16, meas: 23.03, se: 1.25, adj: 14.2, apexFt: -5.9, hang: null, hard: true },
  { id: 'Control Vidanta 2024', rho: 0.994, dv: 0.02, dl: -0.25, ds: 83, meas: -3.3, se: 0.43, adj: null, apexFt: 0.5, hang: null },
];
const TREND = { a: 148.81, b: -150.06 }; // measured 40-event line, dcarry = a + b*rho (yd)
const TREND_RHO = [0.906, 0.923, 0.977, 1.048, 1.062];

const shifted = (e) => ({ ballSpeedMph: BASE.ballSpeedMph + e.dv, launchDeg: BASE.launchDeg + e.dl, spinRpm: BASE.spinRpm + e.ds });
const flyAt = (v, rho, inputs, groundM = 0) => fly(launchOf(inputs), v.fam.law, v.p, v.k, { rhoRatio: rho }, { dt: 0.005, diag: true, groundM });

function variants(name) {
  const fam = FAMILIES[name];
  const o = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  const pG = paramObject(fam, o.g.theta);
  const pA = paramObject(fam, o.aStar.theta);
  const app = calibrate(launchOf({ ballSpeedMph: 171, launchDeg: 10.4, spinRpm: 2545 }), fam.law, pA, { carryM: 282 * M_PER_YD, maxHeightM: 35 * M_PER_YD }, { kD: 1, kL: 1 }, 1e-6);
  const raw = calibrate(launchOf(BASE), fam.law, pA, { carryM: 283.8 * M_PER_YD, maxHeightM: 34.0 * M_PER_YD }, { kD: 1, kL: 1 }, 1e-6, { rhoRatio: RHO_SEASON });
  return [
    { lab: `${name} G`, fam, p: pG, k: { kD: 1, kL: 1 } },
    { lab: `${name} Aapp`, fam, p: pA, k: { kD: app.kD, kL: app.kL } },
    { lab: `${name} Araw`, fam, p: pA, k: { kD: raw.kD, kL: raw.kL } },
  ];
}

const all = process.argv.slice(2).flatMap(variants);
const f1 = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(1)}`;

console.log('Predicted driver carry gain (yd) vs measured; (a) season launch, (b) event launch shift applied. Pass band for the hard check: |pred(b) - measured| <= 2 SE + 3.3 yd (control bias).');
const summary = [];
for (const v of all) {
  const s0 = flyAt(v, RHO_SEASON, BASE);
  const c0 = toYd(s0.carryM);
  const h0 = toYd(s0.maxHeightM);
  console.log(`\n### ${v.lab} (kD ${v.k.kD.toFixed(3)}, kL ${v.k.kL.toFixed(3)}; season carry ${c0.toFixed(1)} yd, apex ${h0.toFixed(1)} yd, hang ${s0.timeS.toFixed(2)} s)`);
  console.log('| Event | measured | pred (a) | pred (b) | (b) − meas | band | within | apex ft meas / (a) / (b) | hang s meas / (b) |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  const rec = { lab: v.lab, events: {} };
  for (const e of EVENTS) {
    const fa = flyAt(v, e.rho, BASE);
    const fb = flyAt(v, e.rho, shifted(e));
    const pa = toYd(fa.carryM) - c0;
    const pb = toYd(fb.carryM) - c0;
    const band = 2 * e.se + CONTROL_OFFSET;
    const ok = Math.abs(pb - e.meas) <= band;
    const apA = (toYd(fa.maxHeightM) - h0) * YD_TO_FT;
    const apB = (toYd(fb.maxHeightM) - h0) * YD_TO_FT;
    rec.events[e.id] = { pa, pb, ok, okA: Math.abs(pa - e.meas) <= band, apA, apB, hangB: fb.timeS - s0.timeS };
    console.log(`| ${e.id} | ${f1(e.meas)} ± ${e.se.toFixed(2)} | ${f1(pa)} | ${f1(pb)} | ${f1(pb - e.meas)} | ±${band.toFixed(1)} | ${ok ? 'yes' : 'no'} | ${f1(e.apexFt)} / ${f1(apA)} / ${f1(apB)} | ${e.hang === null ? '—' : f1(e.hang)} / ${f1(fb.timeS - s0.timeS)} |`);
  }
  // Model's own low-altitude trend and its extrapolation to Chapultepec.
  const xs = TREND_RHO;
  const ys = xs.map((r) => toYd(flyAt(v, r, BASE).carryM) - c0);
  const mx = xs.reduce((s, x) => s + x, 0) / xs.length;
  const my = ys.reduce((s, y) => s + y, 0) / ys.length;
  const b = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  const a = my - b * mx;
  const rM = 0.779;
  const lin = a + b * rM;
  const atM = toYd(flyAt(v, rM, BASE).carryM) - c0;
  rec.trend = { slopePer001: -b / 100, lin, atM, short: lin - atM };
  console.log(`model low-altitude slope ${(-b / 100).toFixed(2)} yd per 0.01 rho (measured 1.50); linear extrapolation to rho 0.779: ${f1(lin)} yd vs model ${f1(atM)} yd -> model's own Chapultepec shortfall ${(lin - atM).toFixed(1)} yd (measured 10-15 yd vs the measured line)`);
  summary.push(rec);
}

console.log('\n## Summary: hard events (2024) and Chapultepec');
console.log('| Law, variant | Castle Pines (a) / (b) vs +27.5 | Old Greenwood (a) / (b) vs +23.0 | Mexico 2017–2020 (b) vs +21.9 / +21.5 / +19.0 / +16.2 | hard check (2024, b) | own Chapultepec shortfall (yd) |');
console.log('|---|---|---|---|---|---|');
for (const r of summary) {
  const E = r.events;
  const hard = E['Castle Pines 2024'].ok && E['Old Greenwood 2024'].ok;
  console.log(`| ${r.lab} | ${f1(E['Castle Pines 2024'].pa)} / ${f1(E['Castle Pines 2024'].pb)} | ${f1(E['Old Greenwood 2024'].pa)} / ${f1(E['Old Greenwood 2024'].pb)} | ${['Mexico 2017', 'Mexico 2018', 'Mexico 2019', 'Mexico 2020'].map((k) => f1(E[k].pb)).join(' / ')} | ${hard ? 'pass' : 'fail'} | ${r.trend.short.toFixed(1)} |`);
}

// Terrain: landing height that reconciles the measured hang-time change at
// Mexico with the model's (b) flight, and the carry that height costs.
console.log('\n## Terrain implied by the measured hang-time change at Chapultepec (Araw variants)');
console.log('| Law | Event | model Δhang (b), flat | measured Δhang | landing height needed (ft above tee) | carry effect of that terrain (yd) |');
console.log('|---|---|---|---|---|---|');
for (const v of all.filter((x) => x.lab.endsWith('Araw'))) {
  const s0 = flyAt(v, RHO_SEASON, BASE);
  for (const e of EVENTS.filter((x) => x.hang !== null)) {
    const flat = flyAt(v, e.rho, shifted(e));
    const target = s0.timeS + e.hang;
    let lo = -40;
    let hi = flat.maxHeightM - 0.05;
    const t = (h) => flyAt(v, e.rho, shifted(e), h);
    let ok = true;
    if (!(t(lo).ok && t(lo).timeS >= target)) ok = false;
    for (let it = 0; ok && it < 60; it++) {
      const mid = (lo + hi) / 2;
      const f = t(mid);
      if (f.ok && f.timeS > target) lo = mid;
      else hi = mid;
    }
    const h = (lo + hi) / 2;
    const fh = t(h);
    console.log(`| ${v.lab} | ${e.id} | ${f1(flat.timeS - s0.timeS)} | ${f1(e.hang)} | ${ok ? f1(h / 0.3048) : 'out of range'} | ${ok && fh.ok ? f1(toYd(fh.carryM - flat.carryM)) : '—'} |`);
  }
}

// Pass matrix: within |pred - measured| <= 2 SE + 3.3 yd, per event, for
// both launch treatments.
console.log('\n## Pass matrix (within 2 SE + 3.3 yd): (a) season launch | (b) event launch shift');
const ORDER = ['Castle Pines 2024', 'Old Greenwood 2024', 'Mexico 2017', 'Mexico 2018', 'Mexico 2019', 'Mexico 2020', 'Control Vidanta 2024'];
console.log(`| Law, variant | (a) ${ORDER.map((o) => o.replace(' 2024', '').replace('Mexico ', 'M')).join(' / ')} | (b) same | 2024 pair (a) / (b) | all six (a) / (b) |`);
console.log('|---|---|---|---|---|');
for (const r of summary) {
  const E = r.events;
  const m = (k) => ORDER.map((o) => (E[o][k] ? 'y' : 'n')).join(' ');
  const pair = (k) => (E['Castle Pines 2024'][k] && E['Old Greenwood 2024'][k] ? 'pass' : 'fail');
  const six = (k) => (ORDER.slice(0, 6).every((o) => E[o][k]) ? 'pass' : 'fail');
  console.log(`| ${r.lab} | ${m('okA')} | ${m('ok')} | ${pair('okA')} / ${pair('ok')} | ${six('okA')} / ${six('ok')} |`);
}
