// THROWAWAY SPIKE CODE (land-angle spike, probe 2, round 2, 2026-10-09).
//
// Round 2 (R2-1): C_L(Re, S) and C_D(Re, S) pinned to probe 1's measured
// surfaces (aero-data.md section 1). Registers families R0-R3 into FAMILIES.
// Free parameters are only the measured-uncertain ones, inside measured
// bounds: lift-loss band onset ReHi (7-8e4), minimum ReLo (5.5-6.5e4), depth
// a (0.4-1.3), crisis drag rise dC at Re 5e4 (0-0.25), ball-spread scales
// sD (0.9-1.1) and sL (0.85-1.15). Family init values are the nominal
// (unfitted) surface.

import { FAMILIES } from './laws.mjs';
import { smitsDecay } from './core.mjs';

const decay1 = smitsDecay(1);
const smits = (ctx) => decay1(ctx);

const smooth = (t) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
};

// Supercritical lift, measured for S <= 0.30 (n 81, rms 0.024); the S > 0.30
// branch follows Bearman & Harvey 1976 (capped at their 0.45 at S 1.0).
export function cl0(s) {
  return s <= 0.3 ? 0.065 + 0.85 * s : Math.min(0.45, 0.32 + 0.25 * (s - 0.3));
}

// Supercritical drag: measured quadratic to S 0.22, B&H slope 0.38 to S 0.46
// (joined continuously; the published 0.30 intercept is 0.006 below the
// quadratic's 0.3058 at S 0.22). Beyond the measured S 0.46 the slope is
// continued to S 0.64, the highest S of B&H's Re 5.9e4 drag curve (0.455
// there), and held flat above (extrapolation).
const cdq = (x) => 0.22 - 0.27 * x + 3.0 * x * x;
const CDQ22 = cdq(0.22);
export function cd0(s, flatAbove = 0.64) {
  if (s <= 0.22) return cdq(s);
  return CDQ22 + 0.38 * (Math.min(s, flatAbove) - 0.22);
}

// Supercritical Re slope, mid of the measured +0.010...+0.017 per 1e5,
// applied above Re 1e5 and frozen below it (the crisis term takes over).
export const K_RE = 0.0135 / 1e5;

// Lift-loss weight: 0 above ReHi, smooth step to 1 at ReLo, then partial
// recovery to REC at Re 5e4 (measured f(5e4) ~ 0.44 = 1 - 0.9 * 0.62), held
// below 5e4 (no modern-ball data there).
export const REC = 0.62;
export function lossW(re, p) {
  if (re >= p.ReHi) return 0;
  if (re >= p.ReLo) return smooth(Math.log(p.ReHi / re) / Math.log(p.ReHi / p.ReLo));
  if (re > 5e4) return 1 - (1 - REC) * smooth(Math.log(p.ReLo / re) / Math.log(p.ReLo / 5e4));
  return REC;
}

// Crisis drag weight: smooth step from 0 at 8.5e4 to 1 at 5e4 at the nominal
// band (measured increments ~20 % of the 5e4 value at 7.5e4, ~55 % at 6.3e4),
// moved with the fitted band so lift loss and drag crisis share one
// boundary-layer transition; held at 1 below.
export function crisisW(re, p) {
  const hi = p.ReHi * (8.5 / 7.5);
  const lo = p.ReLo * (5.0 / 6.2);
  return smooth(Math.log(hi / re) / Math.log(hi / lo));
}

// S-extrapolation of the low-Re band (lift loss and crisis drag together)
// beyond the measured S 0.36: 'persist' keeps it at every S; 'fade06' fades it
// linearly to zero by S 0.6, where Bearman & Harvey's lift has fully recovered
// at Re 3.8e4; 'fade10' fades it to zero by S 1.0.
export function sFade(s, mode) {
  if (mode === 'persist' || s <= 0.36) return 1;
  const end = mode === 'fade06' ? 0.6 : 1.0;
  return s >= end ? 0 : 1 - (s - 0.36) / (end - 0.36);
}

const P = (name, lo, hi, init, level = null) => ({ name, lo, hi, init, level });

function measuredLaw(mode, { band = true, cdFlat = 0.64 } = {}) {
  return {
    cd: (re, s, p) => {
      const g = band ? sFade(s, mode) : 0;
      return p.sD * (cd0(s, cdFlat) + K_RE * (Math.max(re, 1e5) - 1.5e5) + (band ? p.dC * crisisW(re, p) * g : 0));
    },
    cl: (re, s, p) => {
      const g = band ? sFade(s, mode) : 0;
      return p.sL * cl0(s) * (1 - (band ? p.a * lossW(re, p) * g : 0));
    },
    decay: smits,
  };
}

const BAND_PARAMS = [
  P('sD', 0.9, 1.1, 1, 'D'),
  P('sL', 0.85, 1.15, 1, 'L'),
  P('ReHi', 7e4, 8e4, 7.5e4),
  P('ReLo', 5.5e4, 6.5e4, 6.2e4),
  P('a', 0.4, 1.3, 0.9),
  P('dC', 0, 0.25, 0.17),
];

Object.assign(FAMILIES, {
  R0: {
    title: 'R0: measured supercritical laws only (no low-Re band), ball-spread scales free',
    params: [P('sD', 0.9, 1.1, 1, 'D'), P('sL', 0.85, 1.15, 1, 'L')],
    law: measuredLaw('persist', { band: false }),
  },
  R1: {
    title: 'R1: measured surfaces, low-Re band persisting at all S (extrapolation X1)',
    params: BAND_PARAMS,
    law: measuredLaw('persist'),
  },
  R2: {
    title: 'R2: measured surfaces, low-Re band fading to zero by S 0.6 (extrapolation X2, B&H guide)',
    params: BAND_PARAMS,
    law: measuredLaw('fade06'),
  },
  R3: {
    title: 'R3: measured surfaces, low-Re band fading to zero by S 1.0 (extrapolation X3)',
    params: BAND_PARAMS,
    law: measuredLaw('fade10'),
  },
  R2f: {
    title: 'R2f: R2 with C_D0 held flat beyond the measured S 0.46 (drag-extrapolation sensitivity)',
    params: BAND_PARAMS,
    law: measuredLaw('fade06', { cdFlat: 0.46 }),
  },
});
