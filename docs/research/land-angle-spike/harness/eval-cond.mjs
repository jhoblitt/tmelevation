// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2 R2-2, 2026-10-09).
//
// Tour conditions diagnostic: one physics for every row, plus one effective
// air-density ratio per tour (rP for PGA rows, rL for LPGA rows; 1 = 25 degC
// sea level). The densities are an environment term, never part of a
// candidate model. Flights of a tour's rows (and, in mode A, their per-row
// calibration) run at that tour's density; Re follows it at fixed 25 degC
// viscosity, i.e. the elevation reading of a density change.

import { calibrate, fly, toYd, toDeg, M_PER_YD, M_PER_FT } from './core.mjs';
import { paramObject } from './laws.mjs';
import './laws2.mjs';
import { multistart } from './fit.mjs';
import { ROWS, WEIGHTS } from './eval.mjs';
import { elevationAtPressure, P0_PA, T_REF_K } from '../../../../site/js/atmosphere.js';

const FAIL = 1e3;
const P = (name, lo, hi, init, level = null) => ({ name, lo, hi, init, level });
const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);

export const R_BOUNDS = [0.6, 1.3];

// fixL: LPGA held at 25 degC sea level, only rP free (identifies the ratio
// when the absolute level is degenerate with the family's level parameters).
export function condFamily(fam, { fixL = false } = {}) {
  const extra = fixL ? [P('rP', ...R_BOUNDS, 1)] : [P('rP', ...R_BOUNDS, 1), P('rL', ...R_BOUNDS, 1)];
  return { title: `${fam.title} + per-tour density${fixL ? ' (LPGA fixed at 1)' : ''}`, params: [...fam.params, ...extra], law: fam.law, fixL };
}

export function envOf(cf, p, row) {
  return { rhoRatio: row.tour === 'pga' ? p.rP : cf.fixL ? 1 : p.rL };
}

// ---------- mode G ----------

export function residualsGc(cf, theta, rows = ROWS, w = WEIGHTS) {
  const p = paramObject(cf, theta);
  const out = [];
  for (const row of rows) {
    const f = fly(row.launch, cf.law, p, { kD: 1, kL: 1 }, envOf(cf, p, row));
    if (!f.ok) {
      out.push(FAIL, FAIL, FAIL);
      continue;
    }
    out.push((toYd(f.carryM) - row.carryYd) / w.carry, (toYd(f.maxHeightM) - row.heightYd) / w.height, (toDeg(f.landRad) - row.landDeg) / w.land);
  }
  return out;
}

export function fitGc(cf, { rows = ROWS, restarts = 8, seed = 1, starts, maxIter = 150 } = {}) {
  return multistart(cf.params, (t) => residualsGc(cf, t, rows), starts ?? [cf.params.map((s) => s.init)], { restarts, seed, maxIter });
}

export function tableGc(cf, theta, rows = ROWS) {
  const p = paramObject(cf, theta);
  return rows.map((row) => {
    const f = fly(row.launch, cf.law, p, { kD: 1, kL: 1 }, envOf(cf, p, row));
    return { id: row.id, tour: row.tour, club: row.club, carry: toYd(f.carryM) - row.carryYd, height: toYd(f.maxHeightM) - row.heightYd, land: toDeg(f.landRad) - row.landDeg };
  });
}

export function looGc(cf, thetaBest, { maxIter = 100 } = {}) {
  const held = [];
  const thetas = [];
  for (let i = 0; i < ROWS.length; i++) {
    const train = ROWS.filter((_, j) => j !== i);
    const fit = fitGc(cf, { rows: train, restarts: 0, starts: [thetaBest], maxIter });
    thetas.push(fit.theta);
    held.push(tableGc(cf, fit.theta, [ROWS[i]])[0]);
  }
  return { held, thetas };
}

// ---------- mode A ----------

export function calibrateAllc(cf, theta, rows = ROWS, tol = 1e-4) {
  const p = paramObject(cf, theta);
  return rows.map((row) => {
    const targets = { carryM: row.carryYd * M_PER_YD, maxHeightM: row.heightYd * M_PER_YD };
    const env = envOf(cf, p, row);
    let cal = calibrate(row.launch, cf.law, p, targets, { kD: 1, kL: 1 }, tol, env);
    if (!cal.ok) {
      for (const start of [{ kD: 0.7, kL: 0.7 }, { kD: 1.5, kL: 1.5 }, { kD: 1.2, kL: 0.8 }, { kD: 0.8, kL: 1.2 }]) {
        cal = calibrate(row.launch, cf.law, p, targets, start, tol, env);
        if (cal.ok) break;
      }
    }
    return cal;
  });
}

export function tableAc(cf, theta, rows = ROWS, tol = 1e-6) {
  return calibrateAllc(cf, theta, rows, tol).map((cal, i) => ({
    id: rows[i].id,
    tour: rows[i].tour,
    club: rows[i].club,
    ok: cal.ok,
    kD: cal.kD,
    kL: cal.kL,
    land: cal.ok ? toDeg(cal.sea.landRad) - rows[i].landDeg : NaN,
  }));
}

function residualsAc(cf, theta, rows, w = WEIGHTS) {
  return calibrateAllc(cf, theta, rows, 1e-7).map((cal, i) => (cal.ok ? (toDeg(cal.sea.landRad) - rows[i].landDeg) / w.land : FAIL));
}

export function fitAc(cf, thetaFix, { rows = ROWS, restarts = 3, seed = 3, maxIter = 60, starts = null } = {}) {
  const free = cf.params.map((s, i) => (s.level ? null : i)).filter((i) => i !== null);
  const specs = free.map((i) => cf.params[i]);
  const merge = (sub) => {
    const t = thetaFix.slice();
    free.forEach((i, k) => {
      t[i] = sub[k];
    });
    return t;
  };
  const s0 = starts ?? [free.map((i) => thetaFix[i])];
  const res = multistart(specs, (sub) => residualsAc(cf, merge(sub), rows), s0, { restarts, seed, maxIter, h: 1e-3 });
  return { theta: merge(res.theta), cost: res.cost, free, startCosts: res.startCosts };
}

export function looAc(cf, thetaBest, { maxIter = 40 } = {}) {
  const held = [];
  for (let i = 0; i < ROWS.length; i++) {
    const train = ROWS.filter((_, j) => j !== i);
    const fit = fitAc(cf, thetaBest, { rows: train, restarts: 0, maxIter });
    held.push(tableAc(cf, fit.theta, [ROWS[i]])[0]);
  }
  return { held, rms: rms(held.map((h) => h.land)) };
}

// ---------- tour-shaped residual ----------

// Share of the residual sum of squares carried by the per-tour means (the
// part a per-tour constant offset would remove), and the matched-club
// PGA - LPGA difference over the 11 clubs both tours list.
export function tourStats(table, key) {
  const v = (t) => table.filter((r) => r.tour === t).map((r) => r[key]);
  const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const pg = v('pga');
  const lp = v('lpga');
  const ssTot = table.reduce((s, r) => s + r[key] * r[key], 0);
  const ssBetween = pg.length * mean(pg) ** 2 + lp.length * mean(lp) ** 2;
  const pairs = [];
  for (const r of table.filter((x) => x.tour === 'pga')) {
    const m = table.find((x) => x.tour === 'lpga' && x.club === r.club);
    if (m) pairs.push(r[key] - m[key]);
  }
  return {
    rms: rms(table.map((r) => r[key])),
    pgaMean: mean(pg),
    lpgaMean: mean(lp),
    offsetShare: ssTot > 0 ? ssBetween / ssTot : 0,
    pairMean: mean(pairs),
    pairRms: rms(pairs),
    nPairs: pairs.length,
  };
}

// ---------- density as conditions ----------

export function equivalents(r) {
  const elevM = elevationAtPressure(r * P0_PA);
  return { ratio: r, elevationFt: elevM / M_PER_FT, seaLevelTempC: T_REF_K / r - 273.15 };
}
