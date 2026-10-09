import { fly } from './flight.js';

export const MAX_ITERATIONS = 20;

const SEA_LEVEL = { rhoRatio: 1, windMps: 0 };
const TOLERANCE_M = 1e-4;
const RELATIVE_PROBE = 1e-4;
const MAX_HALVINGS = 8;

function isUsableFactor(k) {
  return Number.isFinite(k) && k > 0;
}

// Fits the drag and lift factors so that the sea-level flight of `launch`
// reproduces the target carry and max height, by damped Newton iteration on
// F(kD, kL) = (carry - carryM, maxHeight - maxHeightM) from (1, 1).
export function calibrate(launch, { carryM, maxHeightM }) {
  let steps = 0;
  let iterations = 0;
  const flyAt = (kD, kL) => {
    const flight = fly(launch, { kD, kL }, SEA_LEVEL);
    steps += flight.steps;
    return flight;
  };
  const residual = (flight) => [flight.carryM - carryM, flight.maxHeightM - maxHeightM];
  const squaredNorm = ([rCarry, rHeight]) => rCarry * rCarry + rHeight * rHeight;
  const fail = (reason) => ({ ok: false, reason, iterations, steps });

  let kD = 1;
  let kL = 1;
  let sea = flyAt(kD, kL);
  if (!sea.ok) {
    return fail('flight');
  }
  let r = residual(sea);

  // Written so that a NaN residual never counts as converged.
  while (!(Math.abs(r[0]) < TOLERANCE_M && Math.abs(r[1]) < TOLERANCE_M)) {
    if (iterations === MAX_ITERATIONS) {
      return fail('diverged');
    }
    iterations += 1;

    const hD = RELATIVE_PROBE * kD;
    const probeD = flyAt(kD + hD, kL);
    if (!probeD.ok) {
      return fail('flight');
    }
    const hL = RELATIVE_PROBE * kL;
    const probeL = flyAt(kD, kL + hL);
    if (!probeL.ok) {
      return fail('flight');
    }
    const carryByD = (probeD.carryM - sea.carryM) / hD;
    const carryByL = (probeL.carryM - sea.carryM) / hL;
    const heightByD = (probeD.maxHeightM - sea.maxHeightM) / hD;
    const heightByL = (probeL.maxHeightM - sea.maxHeightM) / hL;
    // A singular Jacobian gives a non-finite step, which no trial accepts.
    const det = carryByD * heightByL - carryByL * heightByD;
    const stepD = (carryByL * r[1] - heightByL * r[0]) / det;
    const stepL = (heightByD * r[0] - carryByD * r[1]) / det;

    const norm = squaredNorm(r);
    let accepted = false;
    for (let halvings = 0, t = 1; halvings <= MAX_HALVINGS; halvings++, t /= 2) {
      const trialD = kD + t * stepD;
      const trialL = kL + t * stepL;
      if (!isUsableFactor(trialD) || !isUsableFactor(trialL)) {
        continue;
      }
      const trial = flyAt(trialD, trialL);
      // A trial that fails to fly is rejected like one that does not improve.
      if (!trial.ok) {
        continue;
      }
      const trialResidual = residual(trial);
      if (squaredNorm(trialResidual) < norm) {
        kD = trialD;
        kL = trialL;
        sea = trial;
        r = trialResidual;
        accepted = true;
        break;
      }
    }
    if (!accepted) {
      return fail('diverged');
    }
  }
  return { ok: true, kD, kL, iterations, steps, sea };
}
