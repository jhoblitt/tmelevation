// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Mode G (one global parameter set, no per-row knobs) and mode A (per-row kD,
// kL fitted to carry + height, as the app does) evaluation of a family, plus
// altitude behaviour, the Padjen soft check, TrackMan 2014 shots and wind
// table (informational), and ballooning diagnostics.

import { calibrate, fly, rhoRatioAtFt, tableRows, toDeg, toYd, M_PER_YD, MPS_PER_MPH, launchOf, RHO0, reynolds } from './core.mjs';
import { paramObject } from './laws.mjs';
import { multistart, lm } from './fit.mjs';

// Residual weights: the success-bar tolerances (carry 2 yd, height 1 yd,
// land 1.5 deg), so a residual of one bar-width costs the same in each.
export const WEIGHTS = { carry: 2, height: 1, land: 1.5 };
export const ROWS = tableRows();
const FAIL = 1e3;

const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);

export function predictRow(fam, p, row, k = { kD: 1, kL: 1 }, env = {}) {
  const f = fly(row.launch, fam.law, p, k, env);
  if (!f.ok) return { ok: false };
  return { ok: true, carryYd: toYd(f.carryM), heightYd: toYd(f.maxHeightM), landDeg: toDeg(f.landRad), flight: f };
}

// ---------- mode G ----------

export function residualsG(fam, theta, rows = ROWS, w = WEIGHTS) {
  const p = paramObject(fam, theta);
  const out = [];
  for (const row of rows) {
    const r = predictRow(fam, p, row);
    if (!r.ok) {
      out.push(FAIL, FAIL, FAIL);
      continue;
    }
    out.push((r.carryYd - row.carryYd) / w.carry, (r.heightYd - row.heightYd) / w.height, (r.landDeg - row.landDeg) / w.land);
  }
  if (CONSTRAINED) out.push(...altitudePenalty(fam, p, null));
  return out;
}

// ---------- altitude-defensibility penalty (modes Gc, A*c) ----------

// When on, every residual vector gains hinge penalties that are zero for a
// defensible altitude response: for every row (all 23, whatever rows are
// being fitted; the penalty uses launch conditions only, no table targets)
// carry must not fall, and max height and land angle must not rise, between
// 0, 2,500, 5,000, 7,500 and 10,000 ft (0.1 yd / 0.1 deg per unit); and the
// app's hard altitude oracles must hold: PGA Driver at 7,800 ft carry +5..+12 %
// and land -13..-5 deg, PGA 7 Iron at 6,400 ft carry +7..+16 % (0.25 per unit).
let CONSTRAINED = false;
let PEN_RR = [2500, 5000, 7500, 10000].map(rhoRatioAtFt);
// Round 2: penWeight multiplies every penalty residual (default 1 = round 1).
let PEN_W = 1;
export function setConstrained(v, stepFt = 2500, penWeight = 1) {
  CONSTRAINED = v;
  PEN_W = penWeight;
  PEN_RR = [];
  for (let ft = stepFt; ft <= 10000 + 1e-9; ft += stepFt) PEN_RR.push(rhoRatioAtFt(ft));
}
const band = (v, lo, hi, tol) => (v < lo ? (lo - v) / tol : v > hi ? (v - hi) / tol : 0);

export function altitudePenalty(fam, p, ks) {
  const out = [];
  ROWS.forEach((row, i) => {
    const k = ks ? ks[i] : { kD: 1, kL: 1 };
    const sea = k ? fly(row.launch, fam.law, p, k) : { ok: false };
    if (!sea.ok) {
      for (let j = 0; j < 3 * PEN_RR.length; j++) out.push(FAIL);
      return;
    }
    let prev = { c: 0, h: 0, l: 0 };
    for (const rr of PEN_RR) {
      const f = fly(row.launch, fam.law, p, k, { rhoRatio: rr });
      if (!f.ok) {
        out.push(FAIL, FAIL, FAIL);
        continue;
      }
      const cur = { c: toYd(f.carryM - sea.carryM), h: toYd(f.maxHeightM - sea.maxHeightM), l: toDeg(f.landRad - sea.landRad) };
      out.push((PEN_W * Math.max(0, prev.c - cur.c)) / 0.1, (PEN_W * Math.max(0, cur.h - prev.h)) / 0.1, (PEN_W * Math.max(0, cur.l - prev.l)) / 0.1);
      prev = cur;
    }
  });
  const oracle = (i, ft) => {
    const k = ks ? ks[i] : { kD: 1, kL: 1 };
    if (!k) return null;
    const sea = fly(ROWS[i].launch, fam.law, p, k);
    const alt = fly(ROWS[i].launch, fam.law, p, k, { rhoRatio: rhoRatioAtFt(ft) });
    if (!sea.ok || !alt.ok) return null;
    return { carryPct: (100 * (alt.carryM - sea.carryM)) / sea.carryM, landDeg: toDeg(alt.landRad - sea.landRad) };
  };
  const dr = oracle(0, 7800);
  const i7 = oracle(8, 6400);
  out.push(dr ? PEN_W * band(dr.carryPct, 5, 12, 0.25) : FAIL, dr ? PEN_W * band(dr.landDeg, -13, -5, 0.25) : FAIL, i7 ? PEN_W * band(i7.carryPct, 7, 16, 0.25) : FAIL);
  return out;
}

export function fitG(fam, { rows = ROWS, w = WEIGHTS, restarts = 10, seed = 1, starts = null, maxIter = 150 } = {}) {
  const specs = fam.params;
  const s0 = starts ?? [specs.map((s) => s.init)];
  return multistart(specs, (t) => residualsG(fam, t, rows, w), s0, { restarts, seed, maxIter });
}

export function tableG(fam, theta, rows = ROWS) {
  const p = paramObject(fam, theta);
  return rows.map((row) => {
    const r = predictRow(fam, p, row);
    return {
      id: row.id,
      ok: r.ok,
      carry: r.carryYd - row.carryYd,
      height: r.heightYd - row.heightYd,
      land: r.landDeg - row.landDeg,
    };
  });
}

export function rmsOf(table) {
  return {
    carry: rms(table.map((t) => t.carry)),
    height: rms(table.map((t) => t.height)),
    land: rms(table.map((t) => t.land)),
  };
}

// Leave-one-row-out: refit on 22 rows from the full-data optimum (plus
// `restarts` random starts) and predict the held-out row.
export function looG(fam, thetaBest, { w = WEIGHTS, restarts = 0, seed = 7, maxIter = 100 } = {}) {
  const held = [];
  const thetas = [];
  for (let i = 0; i < ROWS.length; i++) {
    const train = ROWS.filter((_, j) => j !== i);
    const fit = fitG(fam, { rows: train, w, restarts, seed: seed + i, starts: [thetaBest], maxIter });
    thetas.push(fit.theta);
    held.push(tableG(fam, fit.theta, [ROWS[i]])[0]);
  }
  return { held, rms: rmsOf(held), thetas };
}

// ---------- mode A ----------

export function calibrateAll(fam, theta, rows = ROWS, tol = 1e-4) {
  const p = paramObject(fam, theta);
  return rows.map((row) => {
    const targets = { carryM: row.carryYd * M_PER_YD, maxHeightM: row.heightYd * M_PER_YD };
    let cal = calibrate(row.launch, fam.law, p, targets, { kD: 1, kL: 1 }, tol);
    if (!cal.ok) {
      for (const start of [{ kD: 0.7, kL: 0.7 }, { kD: 1.5, kL: 1.5 }, { kD: 1.2, kL: 0.8 }, { kD: 0.8, kL: 1.2 }]) {
        cal = calibrate(row.launch, fam.law, p, targets, start, tol);
        if (cal.ok) break;
      }
    }
    return cal;
  });
}

export function residualsA(fam, theta, rows = ROWS, w = WEIGHTS, tol = 1e-7) {
  const cals = calibrateAll(fam, theta, rows, tol);
  const out = cals.map((cal, i) => (cal.ok ? (toDeg(cal.sea.landRad) - rows[i].landDeg) / w.land : FAIL));
  if (CONSTRAINED) {
    const all = rows === ROWS ? cals : calibrateAll(fam, theta, ROWS, 1e-6);
    out.push(...altitudePenalty(fam, paramObject(fam, theta), all.map((c) => (c.ok ? { kD: c.kD, kL: c.kL } : null))));
  }
  return out;
}

export function tableA(fam, theta, rows = ROWS) {
  const cals = calibrateAll(fam, theta, rows, 1e-6);
  return cals.map((cal, i) => ({
    id: rows[i].id,
    ok: cal.ok,
    kD: cal.kD,
    kL: cal.kL,
    land: cal.ok ? toDeg(cal.sea.landRad) - rows[i].landDeg : NaN,
  }));
}

// Mode A*: the family's shape parameters (those not marked level) fitted to
// land angle under per-row calibration; level parameters held at `thetaFix`.
export function fitA(fam, thetaFix, { rows = ROWS, restarts = 3, seed = 3, maxIter = 60, extraStarts = [] } = {}) {
  const free = fam.params.map((s, i) => (s.level ? null : i)).filter((i) => i !== null);
  if (free.length === 0) return { theta: thetaFix.slice(), cost: NaN, free };
  const specs = free.map((i) => fam.params[i]);
  const merge = (sub) => {
    const t = thetaFix.slice();
    free.forEach((i, k) => {
      t[i] = sub[k];
    });
    return t;
  };
  const starts = [free.map((i) => thetaFix[i]), ...extraStarts.map((t) => free.map((i) => t[i]))];
  const res = multistart(specs, (sub) => residualsA(fam, merge(sub), rows), starts, { restarts, seed, maxIter, h: 1e-3 });
  return { theta: merge(res.theta), cost: res.cost, free, startCosts: res.startCosts };
}

export function looA(fam, thetaBest, { maxIter = 40 } = {}) {
  const free = fam.params.map((s, i) => (s.level ? null : i)).filter((i) => i !== null);
  if (free.length === 0) return null;
  const held = [];
  for (let i = 0; i < ROWS.length; i++) {
    const train = ROWS.filter((_, j) => j !== i);
    const fit = fitA(fam, thetaBest, { rows: train, restarts: 0, maxIter });
    held.push(tableA(fam, fit.theta, [ROWS[i]])[0]);
  }
  return { held, rms: rms(held.map((h) => h.land)) };
}

// ---------- altitude ----------

// mode 'G': global law, deltas against the model's own sea-level flight.
// mode 'A': per-row calibration `cals`, deltas against the calibrated flight.
export function altitudeDeltas(fam, theta, mode, cals, ft, rows = ROWS) {
  const p = paramObject(fam, theta);
  const rr = rhoRatioAtFt(ft);
  return rows.map((row, i) => {
    const k = mode === 'A' ? { kD: cals[i].kD, kL: cals[i].kL } : { kD: 1, kL: 1 };
    const sea = fly(row.launch, fam.law, p, k, { rhoRatio: 1 });
    const alt = fly(row.launch, fam.law, p, k, { rhoRatio: rr });
    if (!sea.ok || !alt.ok) return { id: row.id, ok: false };
    return {
      id: row.id,
      ok: true,
      carryPct: (100 * (alt.carryM - sea.carryM)) / sea.carryM,
      carryYd: toYd(alt.carryM - sea.carryM),
      heightYd: toYd(alt.maxHeightM - sea.maxHeightM),
      heightPct: (100 * (alt.maxHeightM - sea.maxHeightM)) / sea.maxHeightM,
      landDeg: toDeg(alt.landRad - sea.landRad),
    };
  });
}

// Strict (non-strict inequality) monotonicity of carry up, height down, land
// down between adjacent grid points; reported separately for 0-10,000 ft
// (the app's hard oracle 9a range) and 10,000-15,000 ft, with the largest
// carry fall in yards.
export function monotonicity(fam, theta, mode, cals, { toFt = 15000, gridFt = 250 } = {}) {
  let prev = null;
  const issues = [];
  let low = 0;
  let high = 0;
  let worstCarryFallYd = 0;
  for (let ft = 0; ft <= toFt; ft += gridFt) {
    const d = altitudeDeltas(fam, theta, mode, cals, ft);
    if (prev) {
      d.forEach((cur, i) => {
        const was = prev[i];
        let msg = null;
        if (!cur.ok) msg = `${cur.id} flight fails at ${ft}`;
        else if (!(cur.carryYd >= was.carryYd)) {
          msg = `${cur.id} carry falls at ${ft} ft`;
          worstCarryFallYd = Math.max(worstCarryFallYd, was.carryYd - cur.carryYd);
        } else if (!(cur.heightYd <= was.heightYd)) msg = `${cur.id} height rises at ${ft} ft`;
        else if (!(cur.landDeg <= was.landDeg)) msg = `${cur.id} land rises at ${ft} ft`;
        if (msg) {
          issues.push(msg);
          if (ft <= 10000) low += 1;
          else high += 1;
        }
      });
    }
    prev = d;
  }
  return { ok: issues.length === 0, ok10k: low === 0, low, high, worstCarryFallYd, issues: issues.slice(0, 6), count: issues.length };
}

// ---------- informational: TrackMan 2014 shots and wind table ----------

const SHOTS = {
  pga: { ballSpeedMph: 130, launchDeg: 14.7, spinRpm: 6088, carryYd: 184, heightYd: 33.8, landDeg: 48.0 },
  lpga: { ballSpeedMph: 110, launchDeg: 18.6, spinRpm: 5950, carryYd: 152, heightYd: 27.7, landDeg: 45.6 },
};
const WIND = [
  { tour: 'pga', mph: -10, carryYd: 166, heightYd: 38.1, landDeg: 58.1 },
  { tour: 'pga', mph: -20, carryYd: 143, heightYd: 42.8, landDeg: 69.5 },
  { tour: 'pga', mph: 10, carryYd: 198, heightYd: 29.7, landDeg: 39.5 },
  { tour: 'pga', mph: 20, carryYd: 207, heightYd: 26.1, landDeg: 32.7 },
  { tour: 'lpga', mph: -10, carryYd: 139, heightYd: 31.3, landDeg: 55.6 },
  { tour: 'lpga', mph: -20, carryYd: 121, heightYd: 35.3, landDeg: 67.4 },
  { tour: 'lpga', mph: 10, carryYd: 161, heightYd: 24.5, landDeg: 37.7 },
  { tour: 'lpga', mph: 20, carryYd: 167, heightYd: 21.7, landDeg: 31.7 },
];

export function trackman2014(fam, theta, mode) {
  const p = paramObject(fam, theta);
  const out = { shots: {}, wind: [] };
  const ks = {};
  for (const [tour, shot] of Object.entries(SHOTS)) {
    const launch = launchOf(shot);
    let k = { kD: 1, kL: 1 };
    if (mode === 'A') {
      const cal = calibrate(launch, fam.law, p, { carryM: shot.carryYd * M_PER_YD, maxHeightM: shot.heightYd * M_PER_YD });
      k = { kD: cal.kD, kL: cal.kL };
    }
    ks[tour] = { launch, k };
    const f = fly(launch, fam.law, p, k);
    out.shots[tour] = {
      carry: toYd(f.carryM) - shot.carryYd,
      height: toYd(f.maxHeightM) - shot.heightYd,
      land: toDeg(f.landRad) - shot.landDeg,
      calmLand: toDeg(f.landRad),
    };
  }
  for (const wnd of WIND) {
    const { launch, k } = ks[wnd.tour];
    const calm = fly(launch, fam.law, p, k);
    const f = fly(launch, fam.law, p, k, { rhoRatio: 1, windMps: wnd.mph * MPS_PER_MPH });
    const shot = SHOTS[wnd.tour];
    out.wind.push({
      tour: wnd.tour,
      mph: wnd.mph,
      // response = model change from its own calm flight vs TrackMan's change.
      carryResp: toYd(f.carryM - calm.carryM) - (wnd.carryYd - shot.carryYd),
      landResp: toDeg(f.landRad - calm.landRad) - (wnd.landDeg - shot.landDeg),
      carryAbs: toYd(f.carryM) - wnd.carryYd,
      landAbs: toDeg(f.landRad) - wnd.landDeg,
    });
  }
  return out;
}

// ---------- ballooning ----------

export function ballooning(fam, theta, mode, cals, rows = ROWS) {
  const p = paramObject(fam, theta);
  return rows.map((row, i) => {
    const k = mode === 'A' ? { kD: cals[i].kD, kL: cals[i].kL } : { kD: 1, kL: 1 };
    const f = fly(row.launch, fam.law, p, k, {}, { dt: 0.005, diag: true });
    return {
      id: row.id,
      launchDeg: row.inputs.launchDeg,
      peakGammaDeg: toDeg(f.peakGammaRad),
      rise: toDeg(f.peakGammaRad) - row.inputs.launchDeg,
      peakAtPct: (100 * f.peakGammaXM) / f.carryM,
      apexAtPct: (100 * f.apexXM) / f.carryM,
      minRe: f.minRe,
      maxS: f.maxS,
      landSpeed: f.landSpeedMps,
    };
  });
}

// Coefficient map at a grid of (Re, S) for plausibility checks.
export function coefficientMap(fam, theta, k = { kD: 1, kL: 1 }) {
  const p = paramObject(fam, theta);
  const res = [5e4, 7e4, 1e5, 1.5e5, 2e5];
  const ss = [0.1, 0.2, 0.3, 0.5];
  return res.map((re) => ({
    re,
    cd: ss.map((s) => k.kD * fam.law.cd(re, s, p)),
    cl: ss.map((s) => k.kL * fam.law.cl(re, s, p)),
  }));
}

export { RHO0, reynolds };
