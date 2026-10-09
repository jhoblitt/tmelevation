// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Compares each fitted family's C_D(Re, S) and C_L(Re, S) with the measured
// points probe 1 digitised into ../aero-data.csv (rows with Re and S known).
// Usage: node plausibility.mjs F0 F0b F1 ...   (reads out/<name>.json)

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FAMILIES, paramObject } from './laws.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function parseCsv(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = '';
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === ',' && !quoted) {
        cells.push(cur);
        cur = '';
      } else cur += ch;
    }
    cells.push(cur);
    rows.push(cells);
  }
  const [head, ...body] = rows;
  return body.map((c) => Object.fromEntries(head.map((h, i) => [h, c[i] ?? ''])));
}

const num = (s) => (s === '' || s === undefined ? NaN : Number(s));
const data = parseCsv(readFileSync(join(here, '..', 'aero-data.csv'), 'utf8'))
  .map((r) => ({ source: r.source, re: num(r.Re), s: num(r.S), cd: num(r.CD), cl: num(r.CL) }))
  .filter((r) => Number.isFinite(r.re) && Number.isFinite(r.s) && r.s > 0);

const median = (a) => {
  const b = a.filter(Number.isFinite).sort((x, y) => x - y);
  return b.length ? b[Math.floor(b.length / 2)] : 1;
};

function stats(pairs) {
  if (!pairs.length) return '—';
  const d = pairs.map(([m, x]) => m - x);
  const bias = d.reduce((s, v) => s + v, 0) / d.length;
  const rms = Math.sqrt(d.reduce((s, v) => s + v * v, 0) / d.length);
  return `${bias >= 0 ? '+' : ''}${bias.toFixed(3)} / ${rms.toFixed(3)} (n ${d.length})`;
}

console.log(`measured points with Re and S: ${data.length} (CD ${data.filter((r) => Number.isFinite(r.cd)).length}, CL ${data.filter((r) => Number.isFinite(r.cl)).length})`);
console.log('family | mode | C_D bias/RMS Re>=8e4 | C_D bias/RMS Re<8e4 | C_L bias/RMS Re>=8e4 | C_L bias/RMS Re<8e4 | C_L Re<8e4, S<0.2 | C_L Re<8e4, S>=0.2');
for (const name of process.argv.slice(2)) {
  const fam = FAMILIES[name.replace(/-.*$/, '')];
  const out = JSON.parse(readFileSync(join(here, 'out', `${name}.json`), 'utf8'));
  for (const [mode, theta, table] of [['G', out.g.theta, null], ['A*', out.aStar.theta, out.aStar.table]]) {
    const p = paramObject(fam, theta);
    const kD = table ? median(table.map((t) => t.kD)) : 1;
    const kL = table ? median(table.map((t) => t.kL)) : 1;
    const pick = (lo, hi, key, f, sLo = 0, sHi = Infinity) =>
      data.filter((r) => r.re >= lo && r.re < hi && r.s >= sLo && r.s < sHi && Number.isFinite(r[key])).map((r) => [f(r), r[key]]);
    const cd = (r) => kD * fam.law.cd(r.re, r.s, p);
    const cl = (r) => kL * fam.law.cl(r.re, r.s, p);
    console.log(
      `${name} | ${mode}${table ? ` (median kD ${kD.toFixed(2)}, kL ${kL.toFixed(2)})` : ''} | ${stats(pick(8e4, Infinity, 'cd', cd))} | ${stats(pick(0, 8e4, 'cd', cd))} | ${stats(pick(8e4, Infinity, 'cl', cl))} | ${stats(pick(0, 8e4, 'cl', cl))} | ${stats(pick(0, 8e4, 'cl', cl, 0, 0.2))} | ${stats(pick(0, 8e4, 'cl', cl, 0.2))}`,
    );
  }
}
