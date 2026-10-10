// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Model families. Each family is a list of bounded global parameters and a
// law { cd(Re, S, p), cl(Re, S, p), decay(ctx, p) }. A parameter marked
// level: 'D' or 'L' sets the overall drag or lift level; in mode A the
// per-row kD, kL absorb it, so mode A fixes it and fits only the rest.

import { smitsDecay, LAMBDA0, RADIUS_M } from './core.mjs';

const decay1 = smitsDecay(1);
const smits = (ctx) => decay1(ctx);

// Smooth step in ln Re: 1 well below Re_c, 0 well above, width w in ln Re
// (10-90 % over 4.4 w).
export function lowRe(re, reC, w) {
  return 1 / (1 + Math.exp((Math.log(re) - Math.log(reC)) / w));
}

// Fixed transition width for families that do not fit it: 0.15 in ln Re puts
// the 10-90 % span at a factor of about 1.9 in Re, the width of the measured
// crisis (Lyu 2018 Fig. 3: C_D 0.5 at 5e4 to 0.2 at 1e5).
export const W_FIXED = 0.15;

const P = (name, lo, hi, init, level = null) => ({ name, lo, hi, init, level });

export const FAMILIES = {
  F0: {
    title: "F0 baseline: today's laws, global kD, kL",
    params: [P('gD', 0.5, 1.6, 1, 'D'), P('gL', 0.4, 1.6, 1, 'L')],
    law: {
      cd: (re, s, p) => p.gD * (0.24 + 0.18 * s),
      cl: (re, s, p) => p.gL * 0.54 * s ** 0.4,
      decay: smits,
    },
  },
  F0b: {
    title: 'F0b: S-only, free C_D slope and C_L exponent',
    params: [P('a0', 0.1, 0.4, 0.24, 'D'), P('a1', 0, 0.8, 0.18), P('c0', 0.2, 1.2, 0.54, 'L'), P('cexp', 0.1, 1.5, 0.4)],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.c0 * s ** p.cexp,
      decay: smits,
    },
  },
  F1: {
    title: 'F1: lift loss below a critical Re',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.6, 0.6, 'L'),
      P('dL', 0, 1, 0.3),
      P('ReL', 3e4, 2.5e5, 1e5),
      P('wL', 0.03, 1.0, 0.2),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.c0 * s ** 0.4 * (1 - p.dL * lowRe(re, p.ReL, p.wL)),
      decay: smits,
    },
  },
  F2: {
    title: 'F2: drag rise below a critical Re',
    params: [
      P('a0', 0.1, 0.4, 0.2, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.2, 0.5, 'L'),
      P('dD', 0, 0.4, 0.1),
      P('ReD', 3e4, 2.5e5, 8e4),
      P('wD', 0.03, 1.0, 0.2),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s + p.dD * lowRe(re, p.ReD, p.wD),
      cl: (re, s, p) => p.c0 * s ** 0.4,
      decay: smits,
    },
  },
  F3: {
    title: 'F3: F1 + F2, one shared critical Re, fixed width',
    params: [
      P('a0', 0.1, 0.4, 0.2, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.6, 0.6, 'L'),
      P('dL', 0, 1, 0.3),
      P('dD', 0, 0.4, 0.1),
      P('Rec', 3e4, 2.5e5, 9e4),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s + p.dD * lowRe(re, p.Rec, W_FIXED),
      cl: (re, s, p) => p.c0 * s ** 0.4 * (1 - p.dL * lowRe(re, p.Rec, W_FIXED)),
      decay: smits,
    },
  },
  F4s: {
    title: 'F4s: saturating C_L(S) = cmax(1 - exp(-S/S0)) with F1 lift loss (fixed width)',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('cmax', 0.15, 1.5, 0.4, 'L'),
      P('S0', 0.03, 1.5, 0.2),
      P('dL', 0, 1, 0.3),
      P('ReL', 3e4, 2.5e5, 1e5),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.cmax * (1 - Math.exp(-s / p.S0)) * (1 - p.dL * lowRe(re, p.ReL, W_FIXED)),
      decay: smits,
    },
  },
  F4l: {
    title: 'F4l: linear C_L(S) = c1 S with F1 lift loss',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c1', 0.2, 3, 1.0, 'L'),
      P('dL', 0, 1, 0.3),
      P('ReL', 3e4, 2.5e5, 1e5),
      P('wL', 0.03, 1.0, 0.2),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.c1 * s * (1 - p.dL * lowRe(re, p.ReL, p.wL)),
      decay: smits,
    },
  },
};

// Added after the first round (F1-F3 wanted step-like Re features).
Object.assign(FAMILIES, {
  F5: {
    title: 'F5: drag rise with a spin-shifted critical Re, Re_eff = Re (1 + beta S), width 0.15',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.2, 0.5, 'L'),
      P('dD', 0, 0.4, 0.15),
      P('ReD', 3e4, 2.5e5, 8e4),
      P('beta', 0, 10, 1),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s + p.dD * lowRe(re * (1 + p.beta * s), p.ReD, W_FIXED),
      cl: (re, s, p) => p.c0 * s ** 0.4,
      decay: smits,
    },
  },
  F6: {
    title: 'F6: drag rise fading with spin, dD exp(-S/Sf), width 0.15',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.2, 0.5, 'L'),
      P('dD', 0, 0.4, 0.15),
      P('ReD', 3e4, 2.5e5, 8e4),
      P('Sf', 0.02, 2, 0.3),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s + p.dD * lowRe(re, p.ReD, W_FIXED) * Math.exp(-s / p.Sf),
      cl: (re, s, p) => p.c0 * s ** 0.4,
      decay: smits,
    },
  },
  F7: {
    title: 'F7: smooth power-law Re dependence, C_D (Re/1e5)^qD, C_L (Re/1e5)^qL',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.2, 0.5, 'L'),
      P('cexp', 0.1, 1.5, 0.4),
      P('qD', -0.6, 0.6, 0),
      P('qL', -0.6, 1.2, 0),
    ],
    law: {
      cd: (re, s, p) => (p.a0 + p.a1 * s) * (re / 1e5) ** p.qD,
      cl: (re, s, p) => p.c0 * s ** p.cexp * (re / 1e5) ** p.qL,
      decay: smits,
    },
  },
  F8: {
    title: 'F8: lift loss below a critical Re, fading with spin, dL exp(-S/Sf), width 0.15',
    params: [
      P('a0', 0.1, 0.4, 0.22, 'D'),
      P('a1', 0, 0.8, 0.18),
      P('c0', 0.2, 1.6, 0.6, 'L'),
      P('dL', 0, 1, 0.3),
      P('ReL', 3e4, 2.5e5, 8e4),
      P('Sf', 0.02, 2, 0.3),
    ],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.c0 * s ** 0.4 * (1 - p.dL * lowRe(re, p.ReL, W_FIXED) * Math.exp(-s / p.Sf)),
      decay: smits,
    },
  },
  F9: {
    title: 'F9: F0b plus a spin-decay multiplier m on Smits & Smith',
    params: [P('a0', 0.1, 0.4, 0.24, 'D'), P('a1', 0, 0.8, 0.18), P('c0', 0.2, 1.6, 0.54, 'L'), P('cexp', 0.1, 1.5, 0.4), P('m', 0.25, 16, 1)],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.c0 * s ** p.cexp,
      decay: (ctx, p) => -((p.m * LAMBDA0 * ctx.rhoRatio) / RADIUS_M) * ctx.u * ctx.omega,
    },
  },
});

// Measured-anchored shapes (probe 1's aero-data.md.notes.md, read
// 2026-10-09): Lyu 2020 Fig. 3 three-ball mid-range C_D at ~2250 rpm
// (S ~ 0.07-0.27) by Re, plus Lyu 2018 Fig. 3a at 2.5e5; Lyu 2018 Fig. 4b lift
// quadratic C_L = -3.25 S^2 + 1.99 S (fitted for S ~ 0.04-0.32).
const CD_MEAS = [
  [5.0e4, 0.475],
  [6.3e4, 0.35],
  [7.5e4, 0.26],
  [1.0e5, 0.225],
  [1.25e5, 0.195],
  [1.5e5, 0.175],
  [1.75e5, 0.2],
  [2.0e5, 0.2],
  [2.5e5, 0.21],
];
export function cdMeasured(re) {
  if (re <= CD_MEAS[0][0]) return CD_MEAS[0][1];
  for (let i = 1; i < CD_MEAS.length; i++) {
    const [r1, c1] = CD_MEAS[i];
    if (re <= r1) {
      const [r0, c0] = CD_MEAS[i - 1];
      const t = Math.log(re / r0) / Math.log(r1 / r0);
      return c0 + t * (c1 - c0);
    }
  }
  return CD_MEAS[CD_MEAS.length - 1][1];
}
export function clMeasured(s, cHi) {
  return s <= 0.3 ? -3.25 * s * s + 1.99 * s : 0.3045 + cHi * (s - 0.3);
}

Object.assign(FAMILIES, {
  F10: {
    title: 'F10: measured-anchored laws: C_D = gD [CDmeas(fRe Re) + a1 (S - 0.15)], C_L = gL CLmeas(S) (Lyu quadratic, linear above S 0.3)',
    params: [P('gD', 0.6, 1.5, 1, 'D'), P('a1', 0, 0.8, 0.3), P('gL', 0.5, 1.6, 1, 'L'), P('cHi', 0, 0.8, 0.2), P('fRe', 0.6, 1.6, 1)],
    law: {
      cd: (re, s, p) => p.gD * Math.max(0.05, cdMeasured(p.fRe * re) + p.a1 * (s - 0.15)),
      cl: (re, s, p) => p.gL * clMeasured(s, p.cHi),
      decay: smits,
    },
  },
  F10r: {
    title: 'F10r: F10 with the C_D(Re) curve frozen at Re 1.5e5 (Re-free control)',
    params: [P('gD', 0.6, 1.8, 1.2, 'D'), P('a1', 0, 0.8, 0.3), P('gL', 0.5, 1.6, 1, 'L'), P('cHi', 0, 0.8, 0.2)],
    law: {
      cd: (re, s, p) => p.gD * Math.max(0.05, cdMeasured(1.5e5) + p.a1 * (s - 0.15)),
      cl: (re, s, p) => p.gL * clMeasured(s, p.cHi),
      decay: smits,
    },
  },
});

// Third round (spin-ratio-scaled late-flight effects, after probe 3 found the
// land gap organised by spin and launch). All Re-free, so the altitude
// response stays density-only. The C_D slope bound is widened to 2 to test
// whether the 0.8 bound was binding.
Object.assign(FAMILIES, {
  F0bw: {
    title: 'F0bw: F0b with the C_D slope bound widened to 2',
    params: [P('a0', 0.05, 0.4, 0.2, 'D'), P('a1', 0, 2, 0.3), P('c0', 0.2, 1.2, 0.52, 'L'), P('cexp', 0.05, 1.5, 0.4)],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => p.c0 * s ** p.cexp,
      decay: smits,
    },
  },
  F10rn: {
    title: 'F10rn: F10r with lift allowed to fall above S 0.3 (cHi >= -1) and C_D slope bound 2',
    params: [P('gD', 0.4, 1.8, 1.2, 'D'), P('a1', 0, 2, 0.3), P('gL', 0.5, 1.6, 1, 'L'), P('cHi', -1, 0.8, 0.2)],
    law: {
      cd: (re, s, p) => p.gD * Math.max(0.05, cdMeasured(1.5e5) + p.a1 * (s - 0.15)),
      cl: (re, s, p) => p.gL * Math.max(0, clMeasured(s, p.cHi)),
      decay: smits,
    },
  },
  F11: {
    title: 'F11: peaked C_L(S) = cmax [x e^(1-x)]^n, x = S/Sp (lift falls above Sp), C_D = a0 + a1 S',
    params: [P('a0', 0.05, 0.4, 0.2, 'D'), P('a1', 0, 2, 0.3), P('cmax', 0.15, 1.0, 0.35, 'L'), P('Sp', 0.1, 2, 0.4), P('n', 0.2, 3, 0.6)],
    law: {
      cd: (re, s, p) => p.a0 + p.a1 * s,
      cl: (re, s, p) => {
        const x = s / p.Sp;
        return x > 0 ? p.cmax * (x * Math.exp(1 - x)) ** p.n : 0;
      },
      decay: smits,
    },
  },
});

export function paramObject(family, theta) {
  const p = {};
  family.params.forEach((spec, i) => {
    p[spec.name] = theta[i];
  });
  return p;
}

export function initTheta(family) {
  return family.params.map((spec) => spec.init);
}
