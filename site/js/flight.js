import { RHO0 } from './atmosphere.js';
import { MPS_PER_MPH, degToRad, rpmToRadPerS } from './units.js';

export const BALL_MASS_KG = 0.04593;
export const BALL_DIAMETER_M = 0.04267;
export const G = 9.80665;
export const LAMBDA0 = 2e-5;
export const DT_S = 0.05;
export const MAX_FLIGHT_S = 60;

const RADIUS_M = BALL_DIAMETER_M / 2;
const AREA_M2 = (Math.PI * BALL_DIAMETER_M ** 2) / 4;
const NEWTON_ITERATIONS = 3;

// State indices. VX and VY are ground velocity; the air-relative velocity
// exists only inside derivative().
const X = 0;
const Y = 1;
const VX = 2;
const VY = 3;
const OMEGA = 4;
const AIR_PATH = 5;

export function launchFrom({ ballSpeedMph, launchDeg, spinRpm }) {
  return {
    speedMps: ballSpeedMph * MPS_PER_MPH,
    angleRad: degToRad(launchDeg),
    spinRadS: rpmToRadPerS(spinRpm),
  };
}

export function spinParameter(spinRadS, airSpeedMps) {
  return (RADIUS_M * spinRadS) / airSpeedMps;
}

function derivative({ kD, kL }, { rhoRatio, windMps }) {
  const k = (rhoRatio * RHO0 * AREA_M2) / (2 * BALL_MASS_KG);
  const decayPerM = (LAMBDA0 * rhoRatio) / RADIUS_M;
  return (state) => {
    const vx = state[VX];
    const vy = state[VY];
    const omega = state[OMEGA];
    const ux = vx - windMps;
    const u = Math.sqrt(ux * ux + vy * vy);
    // With no airflow every force term is zero anyway; this keeps S out of 0/0.
    const s = u > 0 ? spinParameter(omega, u) : 0;
    const cd = kD * (0.24 + 0.18 * s);
    const cl = kL * 0.54 * s ** 0.4;
    return [
      vx,
      vy,
      -k * u * (cd * ux + cl * vy),
      -k * u * (cd * vy - cl * ux) - G,
      -decayPerM * u * omega,
      u,
    ];
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

// Cubic Hermite through (q0, dq0) and (q1, dq1) across a step of length h,
// evaluated at the step fraction s.
function hermite(q0, dq0, q1, dq1, h, s) {
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * q0 +
    (s3 - 2 * s2 + s) * h * dq0 +
    (3 * s2 - 2 * s3) * q1 +
    (s3 - s2) * h * dq1
  );
}

function hermiteSlope(q0, dq0, q1, dq1, h, s) {
  const s2 = s * s;
  return (
    (6 * s2 - 6 * s) * q0 +
    (3 * s2 - 4 * s + 1) * h * dq0 +
    (6 * s - 6 * s2) * q1 +
    (3 * s2 - 2 * s) * h * dq1
  );
}

function lerp(a, b, s) {
  return a + (b - a) * s;
}

export function fly(
  launch,
  { kD = 1, kL = 1 } = {},
  { rhoRatio = 1, windMps = 0 } = {},
  { dt = DT_S } = {},
) {
  const f = derivative({ kD, kL }, { rhoRatio, windMps });
  const { speedMps, angleRad, spinRadS } = launch;
  let state = [0, 0, speedMps * Math.cos(angleRad), speedMps * Math.sin(angleRad), spinRadS, 0];
  let rate = f(state);
  // Heights are measured from the launch point, so a shot that never climbs peaks at 0.
  let maxHeightM = 0;
  // A non-positive or NaN dt would never advance time; treat it as never landing.
  const maxSteps = dt > 0 ? Math.ceil(MAX_FLIGHT_S / dt) : 0;

  for (let steps = 1; steps <= maxSteps; steps++) {
    const next = rk4(f, state, rate, dt);
    if (!next.every(Number.isFinite)) {
      return { ok: false, reason: 'nonfinite', steps };
    }
    const nextRate = f(next);
    const at = (i, s) => hermite(state[i], rate[i], next[i], nextRate[i], dt, s);

    if (state[VY] > 0 && next[VY] <= 0) {
      const s = state[VY] / (state[VY] - next[VY]);
      maxHeightM = Math.max(maxHeightM, at(Y, s));
    }

    if (next[Y] < 0 && next[VY] < 0) {
      let s = state[Y] / (state[Y] - next[Y]);
      for (let i = 0; i < NEWTON_ITERATIONS; i++) {
        const residual = at(Y, s);
        if (residual === 0) {
          break;
        }
        s -= residual / hermiteSlope(state[Y], rate[Y], next[Y], nextRate[Y], dt, s);
      }
      return {
        ok: true,
        carryM: at(X, s),
        maxHeightM,
        landRad: Math.atan2(-lerp(state[VY], next[VY], s), lerp(state[VX], next[VX], s)),
        landSpinRadS: lerp(state[OMEGA], next[OMEGA], s),
        airPathM: at(AIR_PATH, s),
        timeS: (steps - 1 + s) * dt,
        steps,
      };
    }

    state = next;
    rate = nextRate;
  }
  return { ok: false, reason: 'cap', steps: maxSteps };
}
