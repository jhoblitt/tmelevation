# round2-conditions notes (probe 2, R2-2 fit side)

Verified facts, appended as verified: claim, source or command, date,
primary/secondary/derived. Commands run from the worktree root
`/home/jhoblitt/github/tmelevation/.claude/worktrees/land-angle-spike`, Node
v22.22.2, sandboxed.

## Inputs (2026-10-09)

- [S] R2-2 mandate: one physics shared by both tours and every club; the only
  per-tour freedom is an effective air density (environment, never part of a
  candidate model); run on F0, R0, R2 in mode G; mode A only where density is
  not degenerate with per-row kD/kL (Re-free law → say so); report share of
  tour-shaped residual and of each RMS removed, densities as ratio to 25 °C sea
  level and as equivalent elevation (25 °C) or temperature (sea level), CV,
  and the PGA Driver carry shortfall. BRIEF.md:172-194.
- [S] Hypothesis basis: TrackMan's 2010 and 2019 editions say "Location and
  weather conditions are not considered". BRIEF.md:174-177 (not re-verified by
  me).

## Harness additions (2026-10-09)

- core.mjs `calibrate(..., tol, env = {})`: optional environment for the
  per-row calibration; default unchanged (sea level).
- eval-cond.mjs (new): per-tour density ratios rP (PGA rows), rL (LPGA rows)
  bounded 0.6–1.3, appended to a family's parameters; flights and mode-A
  calibrations of a tour's rows run at its density; Re follows ρ at fixed 25 °C
  viscosity (elevation reading). tourStats(): per-tour mean residual, share of
  the residual sum of squares carried by the per-tour means ("tour-offset
  share", what a per-tour constant would remove), matched-club PGA − LPGA mean
  over the 11 clubs both tours list. equivalents(): elevation at 25 °C via
  site/js/atmosphere.js elevationAtPressure(r·P0); sea-level temperature
  T = 298.15 K / r.
- run-cond.mjs (new): "before" = out/<family>.json (round 1 / round 2 fit);
  flags --fixL (LPGA at r = 1), --modeA, --degeneracy, --no-loo.
- [D] `node docs/research/land-angle-spike/harness/check-f0.mjs` after the
  calibrate change: 0.050° / 5.1e-13° / −5.3542° — passes.

## Mode G results (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-cond.mjs F0 --restarts 8 --fixL --degeneracy`,
`... R0 --restarts 8 --degeneracy`, `... R0 --restarts 8 --fixL --no-loo`,
`... R2 --restarts 8 --fixL --no-loo` (logs harness/out/<F>-cond[-fixL].txt).
- [D] F0 both free (smoke run, not kept): gD → 1.6 bound, rP 0.690, rL 0.738,
  ratio 0.935 — absolute level degenerate with gD, gL (only spin decay breaks
  it), so F0 is reported with LPGA anchored.
- [D] F0 fixL: gD 1.182, gL 1.024, rP 0.9345 (all 9 starts cost 571.7) →
  PGA air 6.5 % thinner ≈ 1,864 ft higher at 25 °C or 45.9 °C at sea level
  (+20.9 K). RMS 7.58 / 2.19 / 4.21 → 7.01 / 2.22 / 4.15 (carry −7 %, height
  +1 %, land −1 %). Tour-offset share: carry 12 % → 0 %, height 45 % → 44 %,
  land 64 % → 63 %. Matched-club PGA − LPGA land −0.80 → −2.35°. PGA Driver
  carry −26.6 → −24.1 yd. LOO-CV 7.86 / 2.27 / 4.23 (before 8.12 / 2.24 /
  4.25); LOO rP 0.912–0.958.
- [D] R0 both free: sD 1.036, sL 1.101, rP 1.011, rL 1.050, ratio 0.963 (all
  9 starts cost 456.3). RMS 6.39 / 2.04 / 3.73 → 6.19 / 2.05 / 3.69 (carry −3
  %, height 0 %, land −1 %); land offset share 68 % → 68 %; matched-club land
  −1.02 → −1.90°; PGA Driver −4.4 → −3.4 yd. LOO-CV 6.81 / 2.14 / 3.82, worse
  than before (6.69 / 2.10 / 3.78). LOO rP 0.960–1.160 (absolute level weakly
  identified), ratio 0.953–0.977.
- [D] R0 fixL: sD 1.086, sL → 1.150 bound, rP 0.9652 (976 ft / 35.7 °C);
  RMS 6.22 / 2.02 / 3.70; PGA Driver −3.0 yd.
- [D] R2 fixL: sD 1.042, sL 1.129, band at the same bounds as R2, dC 0.099,
  rP 0.9458 (1,533 ft / 42.1 °C); cost 312.7 (4 of 9 starts; others 323.1).
  RMS 5.39 / 2.04 / 2.73 → 5.13 / 2.03 / 2.55 (carry −5 %, height 0 %, land
  −6 %); land offset share 47 % → 49 %; matched-club land −0.33 → −1.58°; PGA
  Driver +2.0 → +3.8 yd.

## Mode A degeneracy (2026-10-09, derived)

- [D] F0: per-row-calibrated land RMS at (rP, rL) = (1, 1) 4.6494°, (0.85, 1)
  4.6487°, (1, 0.85) 4.6486°, (0.85, 0.85) 4.6479°, (1.15, 1) 4.6498° — a
  density change is absorbed by kD, kL; only spin decay (λ ∝ ρ) leaves ≤ 0.002°.
  Degenerate: not fitted.
- [D] R0 (Re enters only through k_Re): (1, 1) 3.9646°, (0.85, 1) 3.9126°,
  (1, 0.85) 3.9484°, (0.85, 0.85) 3.8962°, (1.15, 1) 4.0221° — ≤ 0.07° over
  ±15 %: nearly degenerate; not fitted.
- [D] R2 both free (command `node docs/research/land-angle-spike/harness/run-cond.mjs R2 --restarts 8 --modeA`,
  log harness/out/R2-cond.txt): G sD 1.061, sL → 1.150 bound, band at its
  R2 bounds, dC 0.122, rP 0.9218, rL 0.9595, ratio 0.9607 (8 of 9 starts cost
  301.1). rP → 2,236 ft at 25 °C or 50.3 °C at sea level; rL → 1,139 ft or
  37.6 °C; ratio → 1,106 ft or 37.2 °C. RMS 5.39 / 2.04 / 2.73 → 5.02 / 1.99 /
  2.52 (carry −7 %, height −2 %, land −8 %); offset share carry 15 → 5 %,
  height 4 → 2 %, land 47 → 53 %; matched-club land −0.33 → −1.19°; PGA Driver
  +2.0 → +3.6 yd. LOO-CV 5.50 / 2.07 / 2.59 (before 5.88 / 2.12 / 2.81); LOO rP
  0.914–0.929, ratio 0.951–0.977.
- [D] R2 mode A* (free ReHi, ReLo, a, dC, rP, rL from the round-2 A* shape):
  ReHi 7.75e4, ReLo → 6.5e4, a → 1.30, dC 0.145, rP 1.036, rL 1.123, ratio
  0.923 (all 4 starts cost 44.9). rL → −3,236 ft at 25 °C or −7.6 °C at sea
  level; rP → −988 ft or 14.6 °C; ratio → 2,199 ft or 49.9 °C. Land RMS 2.27 →
  2.10 (−8 %); offset share 37 → 28 %; PGA mean −1.90 → −1.42, LPGA +0.09 →
  −0.56; matched-club land −2.03 → −0.98°. A* LOO-CV 2.29 (before 2.39). PGA
  Hybrid −3.9 → −3.1°, LPGA 3-wood +4.5 → +3.1°.
- [D] Pure per-tour land offset benchmark (RMS × √(1 − offset share), before):
  F0 4.21 × √0.36 = 2.53°; R0 3.73 × √0.32 = 2.11°; R2 G 2.73 × √0.53 = 1.99°;
  R2 A* 2.27 × √0.63 = 1.80°. Density reaches 4.15 / 3.69 / 2.52 / 2.10.
- [S] conditions.md (sibling, schedule side) existed at 814 bytes when checked
  (skeleton); comparison left to the coordinator.

## Status (2026-10-09)

- round2-conditions.md sections 1–6 complete. Final
  `node docs/research/land-angle-spike/harness/check-f0.mjs`: 0.050° /
  5.1e-13° / −5.3542° — passes.
- [D] Equivalents used in §5 come from run-cond's printed lines (equivalents()
  → elevationAtPressure at 25 °C; T = 298.15/r). Rule of thumb: 1 % density ≈
  285 ft at 25 °C or ≈ 3 K at sea level.
- Not done: mode A for R1 / R3 (BRIEF named F0, R0, R2); temperature reading of
  density with μ(T) in Re (would lower Re by a further ~0.26 %/K, Sutherland
  d ln μ / d ln T ≈ 0.77 at 298 K).
