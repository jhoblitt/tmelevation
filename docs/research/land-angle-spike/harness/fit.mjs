// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09).
//
// Bounded Levenberg-Marquardt with seeded random restarts. Bounds are
// enforced by a logistic map theta = lo + (hi - lo) / (1 + exp(-z)), so the
// solver works on an unbounded z.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function toTheta(specs, z) {
  return specs.map((s, i) => s.lo + (s.hi - s.lo) / (1 + Math.exp(-z[i])));
}

export function toZ(specs, theta) {
  return specs.map((s, i) => {
    const f = Math.min(1 - 1e-9, Math.max(1e-9, (theta[i] - s.lo) / (s.hi - s.lo)));
    return Math.log(f / (1 - f));
  });
}

function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    if (Math.abs(M[c][c]) < 1e-300) return null;
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);

// resFn(theta) -> residual array. Returns { theta, cost, iterations }.
export function lm(specs, resFn, theta0, { maxIter = 200, h = 1e-5, tol = 1e-9 } = {}) {
  let z = toZ(specs, theta0);
  let r = resFn(toTheta(specs, z));
  let cost = dot(r, r);
  let mu = 1e-3;
  let stall = 0;
  let iter = 0;
  const n = z.length;
  for (; iter < maxIter; iter++) {
    const J = [];
    for (let j = 0; j < n; j++) {
      const zj = z.slice();
      zj[j] += h;
      const rj = resFn(toTheta(specs, zj));
      J.push(rj.map((v, i) => (v - r[i]) / h));
    }
    const A = [];
    const g = [];
    for (let a = 0; a < n; a++) {
      A.push([]);
      for (let b = 0; b < n; b++) A[a].push(dot(J[a], J[b]));
      g.push(dot(J[a], r));
    }
    const maxDiag = Math.max(...A.map((row, i) => row[i]), 1e-12);
    let accepted = false;
    for (let tries = 0; tries < 12; tries++) {
      const B = A.map((row, i) => row.map((v, j) => (i === j ? v + mu * Math.max(v, 1e-6 * maxDiag) : v)));
      const d = solve(B, g.map((v) => -v));
      if (d === null || !d.every(Number.isFinite)) {
        mu *= 10;
        continue;
      }
      const zt = z.map((v, i) => v + Math.max(-4, Math.min(4, d[i])));
      const rt = resFn(toTheta(specs, zt));
      const ct = dot(rt, rt);
      if (Number.isFinite(ct) && ct < cost) {
        const rel = (cost - ct) / Math.max(cost, 1e-300);
        z = zt;
        r = rt;
        cost = ct;
        mu = Math.max(mu * 0.3, 1e-12);
        accepted = true;
        stall = rel < tol ? stall + 1 : 0;
        break;
      }
      mu *= 10;
    }
    if (!accepted || stall >= 3) break;
  }
  return { theta: toTheta(specs, z), cost, iterations: iter, residuals: r };
}

// Best of: the given starts plus `restarts` uniform random starts inside the
// bounds (2 % margin).
export function multistart(specs, resFn, starts, { restarts = 8, seed = 1, ...opts } = {}) {
  const rand = mulberry32(seed);
  const all = starts.slice();
  for (let k = 0; k < restarts; k++) {
    all.push(specs.map((s) => s.lo + (s.hi - s.lo) * (0.02 + 0.96 * rand())));
  }
  let best = null;
  const costs = [];
  for (const t0 of all) {
    const res = lm(specs, resFn, t0, opts);
    costs.push(res.cost);
    if (best === null || res.cost < best.cost) best = res;
  }
  best.startCosts = costs;
  return best;
}
