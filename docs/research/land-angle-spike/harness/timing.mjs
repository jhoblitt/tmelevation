// THROWAWAY SPIKE CODE (land-angle spike, probe 2, 2026-10-09). Timing probe.
import { FAMILIES, initTheta } from './laws.mjs';
import { residualsG, residualsA } from './eval.mjs';

const fam = FAMILIES.F1;
const t = initTheta(fam);
let t0 = performance.now();
for (let i = 0; i < 20; i++) residualsG(fam, t);
console.log(`mode G eval (23 flights): ${((performance.now() - t0) / 20).toFixed(2)} ms`);
t0 = performance.now();
for (let i = 0; i < 3; i++) residualsA(fam, t);
console.log(`mode A eval (23 calibrations): ${((performance.now() - t0) / 3).toFixed(2)} ms`);
