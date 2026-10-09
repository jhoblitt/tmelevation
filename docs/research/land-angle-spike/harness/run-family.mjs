// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Usage: node run-family.mjs <family> [--restarts N] [--seed S] [--no-loo]
//        [--no-looA] [--no-fitA] [--weights c,h,l] [--tag name]
// Writes out/<family>[-tag].json and prints a summary.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES } from './laws.mjs';
import {
  WEIGHTS, ROWS, fitG, tableG, rmsOf, looG, tableA, fitA, looA, calibrateAll,
  altitudeDeltas, monotonicity, trackman2014, ballooning, coefficientMap,
  setConstrained, altitudePenalty, calibrateAll as calAll,
} from './eval.mjs';
import { paramObject } from './laws.mjs';

const args = process.argv.slice(2);
const name = args[0];
const fam = FAMILIES[name];
if (!fam) throw new Error(`unknown family ${name}; have ${Object.keys(FAMILIES).join(', ')}`);
const opt = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const has = (flag) => args.includes(flag);
const restarts = Number(opt('--restarts', 10));
const seed = Number(opt('--seed', 1));
const constrained = has('--constrained');
const penStep = Number(opt('--pen-step', 2500));
setConstrained(constrained, penStep);
const tag = opt('--tag', constrained ? (penStep === 2500 ? 'c' : `c${penStep}`) : '');
const w = opt('--weights', null);
const weights = w ? Object.fromEntries(['carry', 'height', 'land'].map((k, i) => [k, Number(w.split(',')[i])])) : WEIGHTS;

const t0 = performance.now();
const elapsed = () => `${((performance.now() - t0) / 1000).toFixed(1)} s`;
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : String(x));
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : String(x));
const fmtTheta = (theta) => fam.params.map((s, i) => `${s.name}=${Math.abs(theta[i]) >= 1000 ? theta[i].toExponential(3) : theta[i].toPrecision(4)}`).join(', ');
const atBound = (theta) =>
  fam.params.filter((s, i) => Math.abs(theta[i] - s.lo) < 1e-3 * (s.hi - s.lo) || Math.abs(theta[i] - s.hi) < 1e-3 * (s.hi - s.lo)).map((s) => s.name);

console.log(`# ${fam.title}`);
console.log(`weights carry/height/land = ${weights.carry}/${weights.height}/${weights.land}; restarts ${restarts}; seed ${seed}; altitude-constrained: ${constrained}${constrained ? ` (penalty grid ${penStep} ft)` : ''}`);
const penCost = (theta, ks) => altitudePenalty(fam, paramObject(fam, theta), ks).reduce((s, v) => s + v * v, 0);

// Mode G
const g = fitG(fam, { w: weights, restarts, seed });
const tg = tableG(fam, g.theta);
const rg = rmsOf(tg);
console.log(`\n## Mode G (${elapsed()})`);
console.log(`theta: ${fmtTheta(g.theta)}; at bound: [${atBound(g.theta).join(', ')}]`);
console.log(`weighted cost ${g.cost.toFixed(3)} (altitude-penalty part ${penCost(g.theta, null).toFixed(3)}); restart costs: ${g.startCosts.map((c) => c.toFixed(1)).join(' ')}`);
console.log(`RMS carry ${f2(rg.carry)} yd, height ${f2(rg.height)} yd, land ${f2(rg.land)} deg`);
console.log('| Row | carry | height | land |');
console.log('|---|---|---|---|');
for (const t of tg) console.log(`| ${t.id} | ${f1(t.carry)} | ${f1(t.height)} | ${f1(t.land)} |`);

let loo = null;
if (!has('--no-loo')) {
  loo = looG(fam, g.theta, { w: weights });
  console.log(`LOO-CV RMS carry ${f2(loo.rms.carry)} yd, height ${f2(loo.rms.height)} yd, land ${f2(loo.rms.land)} deg (${elapsed()})`);
  const spread = fam.params.map((s, i) => {
    const v = loo.thetas.map((t) => t[i]);
    return `${s.name} ${Math.min(...v).toPrecision(3)}..${Math.max(...v).toPrecision(3)}`;
  });
  console.log(`LOO parameter spread: ${spread.join('; ')}`);
  console.log(`LOO held-out land residuals: ${loo.held.map((h) => f1(h.land)).join(' ')}`);
}

// Mode A with the mode-G shape
const tag0 = tableA(fam, g.theta);
const rmsA0 = Math.sqrt(tag0.reduce((s, t) => s + t.land * t.land, 0) / tag0.length);
console.log(`\n## Mode A, shape from mode G (${elapsed()})`);
console.log(`land RMS ${f2(rmsA0)} deg; kD ${f2(Math.min(...tag0.map((t) => t.kD)))}..${f2(Math.max(...tag0.map((t) => t.kD)))}, kL ${f2(Math.min(...tag0.map((t) => t.kL)))}..${f2(Math.max(...tag0.map((t) => t.kL)))}; failed: ${tag0.filter((t) => !t.ok).length}`);

// Mode A*: shape fitted to land under per-row calibration
let aStar = { theta: g.theta, free: [] };
let tas = tag0;
let rmsAs = rmsA0;
let looAres = null;
if (!has('--no-fitA')) {
  aStar = fitA(fam, g.theta, {});
  tas = tableA(fam, aStar.theta);
  rmsAs = Math.sqrt(tas.reduce((s, t) => s + t.land * t.land, 0) / tas.length);
  console.log(`\n## Mode A* (shape fitted to land; ${elapsed()})`);
  console.log(`theta: ${fmtTheta(aStar.theta)}; free: [${aStar.free.map((i) => fam.params[i].name).join(', ')}]; at bound: [${atBound(aStar.theta).join(', ')}]`);
  const ksA = calAll(fam, aStar.theta).map((c) => (c.ok ? { kD: c.kD, kL: c.kL } : null));
  console.log(`land RMS ${f2(rmsAs)} deg; altitude-penalty part ${penCost(aStar.theta, ksA).toFixed(3)}; restart costs: ${(aStar.startCosts ?? []).map((c) => c.toFixed(1)).join(' ')}`);
  if (!has('--no-looA') && aStar.free.length > 0) {
    looAres = looA(fam, aStar.theta);
    console.log(`A* LOO-CV land RMS ${f2(looAres.rms)} deg (${elapsed()})`);
  }
}
console.log('| Row | land A(G shape) | kD | kL | land A* | kD | kL |');
console.log('|---|---|---|---|---|---|---|');
tag0.forEach((t, i) => console.log(`| ${t.id} | ${f1(t.land)} | ${f2(t.kD)} | ${f2(t.kL)} | ${f1(tas[i].land)} | ${f2(tas[i].kD)} | ${f2(tas[i].kL)} |`));

// Altitude
const cals = calibrateAll(fam, aStar.theta);
const alt = {};
for (const [mode, theta, c] of [['G', g.theta, null], ['A', aStar.theta, cals]]) {
  alt[mode] = {};
  for (const ft of [4920, 5280, 6300, 6400, 7200, 7800, 10000]) alt[mode][ft] = altitudeDeltas(fam, theta, mode, c, ft);
  alt[mode].mono = monotonicity(fam, theta, mode, c);
}
console.log(`\n## Altitude (${elapsed()})`);
const pick = ['PGA Driver', 'PGA 3-wood', 'PGA Hybrid', 'PGA 4 Iron', 'PGA 7 Iron', 'PGA PW', 'LPGA Driver', 'LPGA 5 Iron', 'LPGA 7 Iron', 'LPGA PW'];
for (const mode of ['G', 'A']) {
  const mo = alt[mode].mono;
  console.log(`### mode ${mode}: monotone @250 ft: 0-10k ${mo.ok10k} (${mo.low} violations), 10-15k ${mo.high} violations, worst carry fall ${mo.worstCarryFallYd.toFixed(2)} yd; first: ${mo.issues.join("; ")}`);
  console.log('| Row | carry % 5,280 | 10,000 | height yd 5,280 | 10,000 | land deg 5,280 | 10,000 |');
  console.log('|---|---|---|---|---|---|---|');
  for (const id of pick) {
    const a = alt[mode][5280].find((d) => d.id === id);
    const b = alt[mode][10000].find((d) => d.id === id);
    console.log(`| ${id} | ${f1(a.carryPct)} | ${f1(b.carryPct)} | ${f1(a.heightYd)} | ${f1(b.heightYd)} | ${f1(a.landDeg)} | ${f1(b.landDeg)} |`);
  }
  for (const ft of [5280, 10000]) {
    const d = alt[mode][ft];
    const pga = d.filter((x) => x.id.startsWith('PGA')).map((x) => x.carryPct);
    const lpga = d.filter((x) => x.id.startsWith('LPGA')).map((x) => x.carryPct);
    console.log(`${ft} ft carry %: PGA ${f1(Math.min(...pga))}..${f1(Math.max(...pga))}, LPGA ${f1(Math.min(...lpga))}..${f1(Math.max(...lpga))}; land ${f1(Math.min(...d.map((x) => x.landDeg)))}..${f1(Math.max(...d.map((x) => x.landDeg)))}; height ${f1(Math.min(...d.map((x) => x.heightYd)))}..${f1(Math.max(...d.map((x) => x.heightYd)))} yd`);
  }
  const pd = alt[mode][7800].find((d) => d.id === 'PGA Driver');
  console.log(`Padjen (PGA Driver 7,800 ft): carry ${f1(pd.carryPct)}% (+8.5%), apex ${f1(pd.heightPct)}% (-18%), land ${f2(pd.landDeg)} deg (-9)`);
  const g64 = (id) => alt[mode][6400].find((d) => d.id === id).carryPct;
  const g63 = (id) => alt[mode][6300].find((d) => d.id === id).carryPct;
  const mean72 = alt[mode][7200].filter((d) => d.id.startsWith('PGA')).reduce((s, d) => s + d.carryPct, 0) / 12;
  const p49 = (id) => alt[mode][4920].find((d) => d.id === id).carryPct;
  const h78 = pd.heightPct;
  const hard = {
    o1: pd.carryPct >= 5 && pd.carryPct <= 12,
    o2: h78 >= -28 && h78 <= -8,
    o3: pd.landDeg >= -13 && pd.landDeg <= -5,
    o6: g64('PGA 7 Iron') >= 7 && g64('PGA 7 Iron') <= 16,
    o9a: alt[mode].mono.ok10k,
  };
  console.log(`app oracles: 1 ${hard.o1} 2 ${hard.o2} 3 ${hard.o3} 6 ${hard.o6} (7i@6400 ${f1(g64('PGA 7 Iron'))}%) 9a(0-10k) ${hard.o9a}; soft: 4 Dr@5280 ${f1(alt[mode][5280][0].carryPct)}% [3.5,8.5]; 5 PGA mean@7200 ${f1(mean72)}% [6.5,13]; 7 Dr/7i/PW@6400 ${f1(g64('PGA Driver'))}/${f1(g64('PGA 7 Iron'))}/${f1(g64('PGA PW'))}; PW-7i@6300 ${f1(g63('PGA PW') - g63('PGA 7 Iron'))} pts; 8a 7i@4920 ${f1(p49('PGA 7 Iron'))}% [4,10]; 8b Dr@4920 ${f1(p49('PGA Driver'))}% [3,7.5]; 11 LPGA-PGA Dr@5280 ${f1(alt[mode][5280][12].carryPct - alt[mode][5280][0].carryPct)} pts (<=1)`);
  alt[mode].oracles = { hard, mean72, g64: { dr: g64('PGA Driver'), i7: g64('PGA 7 Iron'), pw: g64('PGA PW') } };
}

// TrackMan 2014 (informational)
const tm = { G: trackman2014(fam, g.theta, 'G'), A: trackman2014(fam, aStar.theta, 'A') };
console.log(`\n## TrackMan 2014 (informational; ${elapsed()})`);
for (const mode of ['G', 'A']) {
  const s = tm[mode].shots;
  const wr = tm[mode].wind;
  console.log(`mode ${mode}: PGA 6i shot model-TM carry ${f1(s.pga.carry)} height ${f1(s.pga.height)} land ${f1(s.pga.land)}; LPGA 6i ${f1(s.lpga.carry)} / ${f1(s.lpga.height)} / ${f1(s.lpga.land)}`);
  console.log(`  wind land-response errors (model - TM): ${wr.map((x) => `${x.tour}${x.mph > 0 ? 'TW' : 'HW'}${Math.abs(x.mph)} ${f1(x.landResp)}`).join(', ')}; max |.| ${f1(Math.max(...wr.map((x) => Math.abs(x.landResp))))}`);
  console.log(`  wind carry-response errors yd: ${wr.map((x) => f1(x.carryResp)).join(' ')}`);
}

// Ballooning
const bal = { G: ballooning(fam, g.theta, 'G', null), A: ballooning(fam, aStar.theta, 'A', cals) };
console.log(`\n## Ballooning (${elapsed()})`);
for (const mode of ['G', 'A']) {
  const b = bal[mode];
  console.log(`mode ${mode}: rise ${f1(Math.min(...b.map((x) => x.rise)))}..${f1(Math.max(...b.map((x) => x.rise)))} deg at ${f1(Math.min(...b.map((x) => x.peakAtPct)))}..${f1(Math.max(...b.map((x) => x.peakAtPct)))}% carry; apex at ${f1(Math.min(...b.map((x) => x.apexAtPct)))}..${f1(Math.max(...b.map((x) => x.apexAtPct)))}% carry; minRe ${Math.min(...b.map((x) => x.minRe)).toExponential(2)}..${Math.max(...b.map((x) => x.minRe)).toExponential(2)}; maxS ${f2(Math.min(...b.map((x) => x.maxS)))}..${f2(Math.max(...b.map((x) => x.maxS)))}`);
  for (const id of ['PGA Driver', 'PGA Hybrid', 'PGA 7 Iron', 'PGA PW', 'LPGA Driver', 'LPGA PW']) {
    const x = b.find((y) => y.id === id);
    console.log(`  ${id}: launch ${f1(x.launchDeg)} peak ${f1(x.peakGammaDeg)} (+${f1(x.rise)}) at ${f1(x.peakAtPct)}%; apex at ${f1(x.apexAtPct)}%; minRe ${x.minRe.toExponential(2)}; maxS ${f2(x.maxS)}; land speed ${f1(x.landSpeed)} m/s`);
  }
}

// Coefficient map
console.log('\n## Coefficient map, mode G (rows Re; columns S = 0.1, 0.2, 0.3, 0.5)');
for (const m of coefficientMap(fam, g.theta)) console.log(`Re ${m.re.toExponential(1)}: C_D ${m.cd.map((v) => v.toFixed(3)).join(' ')} | C_L ${m.cl.map((v) => v.toFixed(3)).join(' ')}`);

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'out');
mkdirSync(outDir, { recursive: true });
const file = join(outDir, `${name}${tag ? `-${tag}` : ''}.json`);
writeFileSync(file, JSON.stringify({ family: name, title: fam.title, weights, restarts, seed, g: { theta: g.theta, cost: g.cost, startCosts: g.startCosts, table: tg, rms: rg }, loo: loo && { rms: loo.rms, held: loo.held, thetas: loo.thetas }, a0: { table: tag0, rms: rmsA0 }, aStar: { theta: aStar.theta, table: tas, rms: rmsAs, loo: looAres && { rms: looAres.rms, held: looAres.held } }, alt, tm, bal, params: fam.params }, null, 1));
console.log(`\nwrote ${file} (${elapsed()})`);
