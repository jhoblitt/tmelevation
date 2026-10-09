// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09). Not product
// code; not tested beyond the harness check in check-f0.mjs.
//
// 2-D flight integrator in vector form with pluggable C_D(Re, S), C_L(Re, S)
// and spin-decay laws. Integrator, apex and landing interpolation copy the
// approach of site/js/flight.js; site/ modules are imported read-only for the
// table data and the atmosphere.

import { TOURS } from '../../../../site/js/data.js';
import { RHO0, densityRatio, pressureAtElevation, T_REF_K } from '../../../../site/js/atmosphere.js';
import { MPS_PER_MPH, M_PER_FT, M_PER_YD, degToRad, radToDeg, rpmToRadPerS } from '../../../../site/js/units.js';

export { M_PER_YD, M_PER_FT, MPS_PER_MPH, radToDeg, degToRad, RHO0 };

export const BALL_MASS_KG = 0.04593;
export const BALL_DIAMETER_M = 0.04267;
export const RADIUS_M = BALL_DIAMETER_M / 2;
export const AREA_M2 = (Math.PI * BALL_DIAMETER_M ** 2) / 4;
export const G = 9.80665;
export const LAMBDA0 = 2e-5;
export const DT_S = 0.05;
export const MAX_FLIGHT_S = 60;
const NEWTON_ITERATIONS = 3;

// Sutherland's law for air (mu_ref 1.716e-5 Pa s at 273.15 K, S = 110.4 K),
// evaluated at the app's 25 degC reference temperature.
export function airViscosity(tK) {
  return 1.716e-5 * (tK / 273.15) ** 1.5 * (273.15 + 110.4) / (tK + 110.4);
}
export const MU_25C = airViscosity(T_REF_K);

export function reynolds(rhoKgM3, uMps) {
  return (rhoKgM3 * uMps * BALL_DIAMETER_M) / MU_25C;
}

export function rhoRatioAtFt(ft) {
  return densityRatio(pressureAtElevation(ft * M_PER_FT));
}

export function launchOf({ ballSpeedMph, launchDeg, spinRpm }) {
  return {
    speedMps: ballSpeedMph * MPS_PER_MPH,
    angleRad: degToRad(launchDeg),
    spinRadS: rpmToRadPerS(spinRpm),
  };
}

// The 23 table rows with their targets in yards and degrees.
export function tableRows() {
  return TOURS.flatMap((tour) =>
    tour.rows.map((row) => ({
      id: `${tour.id === 'pga' ? 'PGA' : 'LPGA'} ${row.club}`,
      tour: tour.id,
      club: row.club,
      launch: launchOf({ ballSpeedMph: row.ballSpeed, launchDeg: row.launch, spinRpm: row.spin }),
      inputs: { ballSpeedMph: row.ballSpeed, launchDeg: row.launch, spinRpm: row.spin },
      carryYd: row.carry.yd,
      heightYd: row.maxHeight.yd,
      landDeg: row.land,
    })),
  );
}

// Default spin decay: Smits & Smith / site/js/flight.js, lambda scaled by rho.
export function smitsDecay(lambdaMult = 1) {
  return ({ u, omega, rhoRatio }) => -((lambdaMult * LAMBDA0 * rhoRatio) / RADIUS_M) * u * omega;
}

function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// Backspin about +z: for a ball moving along +x, omegaHat x vHat points up.
const OMEGA_HAT = [0, 0, 1];

// law = { cd(Re, S, p), cl(Re, S, p), decay({u, omega, Re, S, rhoRatio}, p) }
function derivative(law, p, { kD, kL }, { rhoRatio, windMps }) {
  const rho = rhoRatio * RHO0;
  const k = (rho * AREA_M2) / (2 * BALL_MASS_KG);
  return (state) => {
    const vRel = [state[2] - windMps, state[3], 0];
    const u = Math.hypot(vRel[0], vRel[1]);
    const omega = state[4];
    const s = u > 0 ? (RADIUS_M * omega) / u : 0;
    const re = reynolds(rho, u);
    const cd = kD * law.cd(re, s, p);
    const cl = kL * law.cl(re, s, p);
    // Drag along -vRel; Magnus along omegaHat x vRelHat. Both scale with u^2.
    const lift = cross(OMEGA_HAT, vRel);
    const ax = -k * cd * u * vRel[0] + k * cl * u * lift[0];
    const ay = -k * cd * u * vRel[1] + k * cl * u * lift[1] - G;
    const dOmega = law.decay({ u, omega, re, s, rhoRatio }, p);
    return [state[2], state[3], ax, ay, dOmega, u];
  };
}

function offset(state, rate, h) {
  return state.map((value, i) => value + h * rate[i]);
}

function rk4(f, state, k1, h) {
  const k2 = f(offset(state, k1, h / 2));
  const k3 = f(offset(state, k2, h / 2));
  const k4 = f(offset(state, k3, h));
  return state.map((value, i) => value + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

function hermite(q0, dq0, q1, dq1, h, s) {
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * q0 + (s3 - 2 * s2 + s) * h * dq0 + (3 * s2 - 2 * s3) * q1 + (s3 - s2) * h * dq1;
}

function hermiteSlope(q0, dq0, q1, dq1, h, s) {
  const s2 = s * s;
  return (6 * s2 - 6 * s) * q0 + (3 * s2 - 4 * s + 1) * h * dq0 + (6 * s - 6 * s2) * q1 + (3 * s2 - 2 * s) * h * dq1;
}

const lerp = (a, b, s) => a + (b - a) * s;

// Returns carry, max height, land angle and, with diag, the ballooning
// diagnostics: peak ground flight-path angle and apex downrange position.
export function fly(launch, law, p, { kD = 1, kL = 1 } = {}, { rhoRatio = 1, windMps = 0 } = {}, { dt = DT_S, diag = false } = {}) {
  const f = derivative(law, p, { kD, kL }, { rhoRatio, windMps });
  const { speedMps, angleRad, spinRadS } = launch;
  let state = [0, 0, speedMps * Math.cos(angleRad), speedMps * Math.sin(angleRad), spinRadS, 0];
  let rate = f(state);
  let maxHeightM = 0;
  let apexXM = 0;
  let peakGammaRad = angleRad;
  let peakGammaXM = 0;
  let minRe = Infinity;
  let maxS = 0;
  const maxSteps = Math.ceil(MAX_FLIGHT_S / dt);
  for (let steps = 1; steps <= maxSteps; steps++) {
    const next = rk4(f, state, rate, dt);
    if (!next.every(Number.isFinite)) {
      return { ok: false, reason: 'nonfinite', steps };
    }
    const nextRate = f(next);
    const at = (i, s) => hermite(state[i], rate[i], next[i], nextRate[i], dt, s);
    if (diag) {
      const gamma = Math.atan2(next[3], next[2]);
      if (gamma > peakGammaRad) {
        peakGammaRad = gamma;
        peakGammaXM = next[0];
      }
      const u = Math.hypot(next[2] - windMps, next[3]);
      minRe = Math.min(minRe, reynolds(rhoRatio * RHO0, u));
      maxS = Math.max(maxS, (RADIUS_M * next[4]) / u);
    }
    if (state[3] > 0 && next[3] <= 0) {
      const s = state[3] / (state[3] - next[3]);
      const y = at(1, s);
      if (y > maxHeightM) {
        maxHeightM = y;
        apexXM = at(0, s);
      }
    }
    if (next[1] < 0 && next[3] < 0) {
      let s = state[1] / (state[1] - next[1]);
      for (let i = 0; i < NEWTON_ITERATIONS; i++) {
        const residual = at(1, s);
        if (residual === 0) break;
        s -= residual / hermiteSlope(state[1], rate[1], next[1], nextRate[1], dt, s);
      }
      const out = {
        ok: true,
        carryM: at(0, s),
        maxHeightM,
        landRad: Math.atan2(-lerp(state[3], next[3], s), lerp(state[2], next[2], s)),
        landSpinRadS: lerp(state[4], next[4], s),
        timeS: (steps - 1 + s) * dt,
        steps,
      };
      if (diag) {
        out.apexXM = apexXM;
        out.peakGammaRad = peakGammaRad;
        out.peakGammaXM = peakGammaXM;
        out.minRe = minRe;
        out.maxS = maxS;
        out.landSpeedMps = Math.hypot(lerp(state[2], next[2], s) - windMps, lerp(state[3], next[3], s));
      }
      return out;
    }
    state = next;
    rate = nextRate;
  }
  return { ok: false, reason: 'cap', steps: maxSteps };
}

const TOLERANCE_M = 1e-4;
const RELATIVE_PROBE = 1e-4;
const MAX_HALVINGS = 8;
const MAX_ITERATIONS = 30;

// Per-row kD, kL fitted to carry and max height at sea level, as
// site/js/calibrate.js does (damped Newton, forward-difference Jacobian).
export function calibrate(launch, law, p, { carryM, maxHeightM }, start = { kD: 1, kL: 1 }, tol = TOLERANCE_M) {
  const flyAt = (kD, kL) => fly(launch, law, p, { kD, kL });
  const residual = (fl) => [fl.carryM - carryM, fl.maxHeightM - maxHeightM];
  const sq = (r) => r[0] * r[0] + r[1] * r[1];
  let { kD, kL } = start;
  let sea = flyAt(kD, kL);
  if (!sea.ok) return { ok: false, reason: 'flight' };
  let r = residual(sea);
  let iterations = 0;
  while (!(Math.abs(r[0]) < tol && Math.abs(r[1]) < tol)) {
    if (iterations === MAX_ITERATIONS) return { ok: false, reason: 'diverged' };
    iterations += 1;
    const hD = RELATIVE_PROBE * kD;
    const pD = flyAt(kD + hD, kL);
    const hL = RELATIVE_PROBE * kL;
    const pL = flyAt(kD, kL + hL);
    if (!pD.ok || !pL.ok) return { ok: false, reason: 'flight' };
    const cD = (pD.carryM - sea.carryM) / hD;
    const cL = (pL.carryM - sea.carryM) / hL;
    const hhD = (pD.maxHeightM - sea.maxHeightM) / hD;
    const hhL = (pL.maxHeightM - sea.maxHeightM) / hL;
    const det = cD * hhL - cL * hhD;
    const stepD = (cL * r[1] - hhL * r[0]) / det;
    const stepL = (hhD * r[0] - cD * r[1]) / det;
    const norm = sq(r);
    let accepted = false;
    for (let h = 0, t = 1; h <= MAX_HALVINGS; h++, t /= 2) {
      const tD = kD + t * stepD;
      const tL = kL + t * stepL;
      if (!(Number.isFinite(tD) && tD > 0 && Number.isFinite(tL) && tL > 0)) continue;
      const trial = flyAt(tD, tL);
      if (!trial.ok) continue;
      const tr = residual(trial);
      if (sq(tr) < norm) {
        kD = tD;
        kL = tL;
        sea = trial;
        r = tr;
        accepted = true;
        break;
      }
    }
    if (!accepted) return { ok: false, reason: 'diverged' };
  }
  return { ok: true, kD, kL, iterations, sea };
}

export const toYd = (m) => m / M_PER_YD;
export const toDeg = radToDeg;
