// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2 R2-2, 2026-10-09).
//
// Usage: node run-cond.mjs <family> [--restarts N] [--fixL] [--no-loo]
//        [--modeA] [--degeneracy] [--tag t]
// "Before" numbers come from out/<family>.json (the round 1 / round 2 fit of
// the same family with no per-tour density). Writes out/<family>-cond[-t].json.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES } from './laws.mjs';
import './laws2.mjs';
import { ROWS } from './eval.mjs';
import { condFamily, fitGc, tableGc, looGc, tourStats, equivalents, fitAc, tableAc, looAc } from './eval-cond.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const name = args[0];
const opt = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const has = (flag) => args.includes(flag);
const restarts = Number(opt('--restarts', 8));
const fixL = has('--fixL');
const tag = opt('--tag', fixL ? 'fixL' : '');
const fam = FAMILIES[name];
const base = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
const cf = condFamily(fam, { fixL });
const extra = fixL ? [1] : [1, 1];
const t0 = performance.now();
const el = () => `${((performance.now() - t0) / 1000).toFixed(1)} s`;
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : '—');
const f1 = (x) => (Number.isFinite(x) ? x.toFixed(1) : '—');
const pct = (b, a) => `${(100 * (1 - a / b)).toFixed(0)} %`;
const withTour = (table) => table.map((r, i) => ({ ...r, tour: ROWS[i].tour, club: ROWS[i].club }));
const rmsOf = (tab, k) => Math.sqrt(tab.reduce((s, r) => s + r[k] * r[k], 0) / tab.length);
const fmtTheta = (theta) => cf.params.map((s, i) => `${s.name}=${Math.abs(theta[i]) >= 1000 ? theta[i].toExponential(3) : theta[i].toPrecision(4)}`).join(', ');
const bound = (theta) =>
  cf.params.filter((s, i) => Math.abs(theta[i] - s.lo) < 1e-3 * (s.hi - s.lo) || Math.abs(theta[i] - s.hi) < 1e-3 * (s.hi - s.lo)).map((s) => s.name);

console.log(`# ${cf.title}`);
const out = { family: name, fixL, restarts };

// ----- mode G -----
const before = withTour(base.g.table);
const g = fitGc(cf, { restarts, seed: 21, starts: [[...base.g.theta, ...extra]] });
const after = tableGc(cf, g.theta);
const p = Object.fromEntries(cf.params.map((s, i) => [s.name, g.theta[i]]));
console.log(`\n## Mode G (${el()})`);
console.log(`theta: ${fmtTheta(g.theta)}; at bound: [${bound(g.theta).join(', ')}]`);
console.log(`cost ${g.cost.toFixed(2)}; restart costs: ${g.startCosts.map((c) => c.toFixed(1)).join(' ')}`);
const rL = fixL ? 1 : p.rL;
for (const [lab, r] of [['rP', p.rP], ['rL', rL], ['rP/rL', p.rP / rL]]) {
  const e = equivalents(r);
  console.log(`${lab} = ${r.toFixed(4)} -> ${f1(e.elevationFt)} ft at 25 degC, or ${f1(e.seaLevelTempC)} degC at sea level`);
}
console.log('| output | RMS before | after | removed | tour-offset share before | after | PGA mean before / after | LPGA mean before / after | matched-club PGA-LPGA mean before / after (n) |');
console.log('|---|---|---|---|---|---|---|---|---|');
const statsG = {};
for (const k of ['carry', 'height', 'land']) {
  const b = tourStats(before, k);
  const a = tourStats(after, k);
  statsG[k] = { before: b, after: a };
  console.log(`| ${k} | ${f2(b.rms)} | ${f2(a.rms)} | ${pct(b.rms, a.rms)} | ${(100 * b.offsetShare).toFixed(0)} % | ${(100 * a.offsetShare).toFixed(0)} % | ${f2(b.pgaMean)} / ${f2(a.pgaMean)} | ${f2(b.lpgaMean)} / ${f2(a.lpgaMean)} | ${f2(b.pairMean)} / ${f2(a.pairMean)} (${a.nPairs}) |`);
}
const drB = before.find((r) => r.id === 'PGA Driver');
const drA = after.find((r) => r.id === 'PGA Driver');
console.log(`PGA Driver carry residual: before ${f1(drB.carry)} yd, after ${f1(drA.carry)} yd; height ${f1(drB.height)} -> ${f1(drA.height)}; land ${f1(drB.land)} -> ${f1(drA.land)}`);
console.log('| Row | before carry / height / land | after |');
console.log('|---|---|---|');
before.forEach((b, i) => {
  const a = after[i];
  console.log(`| ${b.id} | ${f1(b.carry)} / ${f1(b.height)} / ${f1(b.land)} | ${f1(a.carry)} / ${f1(a.height)} / ${f1(a.land)} |`);
});
out.g = { theta: g.theta, cost: g.cost, startCosts: g.startCosts, table: after, stats: statsG, params: cf.params.map((s) => s.name) };

if (!has('--no-loo')) {
  const loo = looGc(cf, g.theta);
  const r = { carry: rmsOf(loo.held, 'carry'), height: rmsOf(loo.held, 'height'), land: rmsOf(loo.held, 'land') };
  const iP = cf.params.findIndex((s) => s.name === 'rP');
  const iL = cf.params.findIndex((s) => s.name === 'rL');
  const rPs = loo.thetas.map((t) => t[iP]);
  const ratios = loo.thetas.map((t) => t[iP] / (iL >= 0 ? t[iL] : 1));
  console.log(`LOO-CV RMS carry ${f2(r.carry)} yd, height ${f2(r.height)} yd, land ${f2(r.land)} deg (${el()}); before (round 1/2 log): ${base.loo ? `${f2(base.loo.rms.carry)} / ${f2(base.loo.rms.height)} / ${f2(base.loo.rms.land)}` : '—'}`);
  console.log(`LOO rP ${Math.min(...rPs).toFixed(3)}..${Math.max(...rPs).toFixed(3)}; rP/rL ${Math.min(...ratios).toFixed(3)}..${Math.max(...ratios).toFixed(3)}`);
  out.loo = { rms: r, held: loo.held, thetas: loo.thetas };
}

// ----- mode A degeneracy check -----
if (has('--degeneracy')) {
  console.log(`\n## Mode A degeneracy check (${el()}): land RMS under per-row kD, kL at fixed densities, shape from ${base.aStar ? 'A*' : 'G'}`);
  const thetaA = base.aStar?.theta ?? base.g.theta;
  const cfFree = condFamily(fam);
  for (const [a, b] of [[1, 1], [0.85, 1], [1, 0.85], [0.85, 0.85], [1.15, 1]]) {
    const tab = tableAc(cfFree, [...thetaA, a, b]);
    console.log(`rP ${a}, rL ${b}: land RMS ${rmsOf(tab, 'land').toFixed(4)} deg; PGA Driver land ${tab[0].land.toFixed(3)}; PGA Hybrid ${tab[3].land.toFixed(3)}`);
  }
}

// ----- mode A* with densities -----
if (has('--modeA')) {
  const thetaFix = [...base.aStar.theta, ...extra];
  const a = fitAc(cf, thetaFix, { restarts: 3, seed: 5 });
  const tab = tableAc(cf, a.theta);
  const tb = withTour(base.aStar.table);
  const pa = Object.fromEntries(cf.params.map((s, i) => [s.name, a.theta[i]]));
  console.log(`\n## Mode A* with per-tour density (${el()})`);
  console.log(`theta: ${fmtTheta(a.theta)}; free: [${a.free.map((i) => cf.params[i].name).join(', ')}]; at bound: [${bound(a.theta).join(', ')}]; restart costs ${a.startCosts.map((c) => c.toFixed(1)).join(' ')}`);
  const sb = tourStats(tb, 'land');
  const sa = tourStats(tab, 'land');
  console.log(`land RMS before ${f2(sb.rms)} -> after ${f2(sa.rms)} (${pct(sb.rms, sa.rms)} removed); tour-offset share ${(100 * sb.offsetShare).toFixed(0)} % -> ${(100 * sa.offsetShare).toFixed(0)} %; PGA mean ${f2(sb.pgaMean)} -> ${f2(sa.pgaMean)}; LPGA mean ${f2(sb.lpgaMean)} -> ${f2(sa.lpgaMean)}; matched-club diff ${f2(sb.pairMean)} -> ${f2(sa.pairMean)}`);
  for (const [lab, r] of [['rP', pa.rP], ['rL', fixL ? 1 : pa.rL], ['rP/rL', pa.rP / (fixL ? 1 : pa.rL)]]) {
    const e = equivalents(r);
    console.log(`A* ${lab} = ${r.toFixed(4)} -> ${f1(e.elevationFt)} ft at 25 degC, or ${f1(e.seaLevelTempC)} degC at sea level`);
  }
  console.log('| Row | land before | after | kD, kL after |');
  console.log('|---|---|---|---|');
  tb.forEach((b, i) => console.log(`| ${b.id} | ${f1(b.land)} | ${f1(tab[i].land)} | ${f2(tab[i].kD)}, ${f2(tab[i].kL)} |`));
  out.aStar = { theta: a.theta, table: tab, before: tb, statsBefore: sb, statsAfter: sa };
  if (!has('--no-looA')) {
    const la = looAc(cf, a.theta);
    console.log(`A* LOO-CV land RMS ${f2(la.rms)} deg (${el()}); before ${base.aStar.loo ? f2(base.aStar.loo.rms) : '—'}`);
    out.aStar.loo = la;
  }
}

const file = join(here, 'out', `${name}-cond${tag ? `-${tag}` : ''}.json`);
writeFileSync(file, JSON.stringify(out, null, 1));
console.log(`\nwrote ${file} (${el()})`);
