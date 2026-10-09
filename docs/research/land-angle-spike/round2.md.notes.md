# round2 notes (probe 2, round 2)

Verified facts, appended as verified: claim, source (file:line or the harness
command), date, primary/secondary/derived. Commands run from the worktree root
`/home/jhoblitt/github/tmelevation/.claude/worktrees/land-angle-spike`, Node
v22.22.2, sandboxed.

## Inputs read (2026-10-09)

- [S] User rulings: one physics for both tours and every club; no per-tour or
  per-club physics parameters in any candidate model. BRIEF.md:133-146.
- [S] R2-1 mandate: pin C_L, C_D to aero-data.md §1 / aero-data.csv; free only
  onset Re (7–8e4), minimum Re (5.5–6.5e4), depth (0.4–1.3), and optionally one
  ball-spread scale per coefficient; extrapolate explicitly where flights leave
  the measured range (S > 0.36 at Re < 7e4; past the measured Re span) with ≥ 2
  alternatives; B&H high-S points as the only guide; shipped spin decay;
  hard oracles 1, 2, 3, 6 and 9a. BRIEF.md:148-170.
- [S] Measured laws (probe 1, aero-data.md:41-107):
  C_L = C_L0(S)·f_L(Re, S); C_L0 = 0.065 + 0.85 S (0.04 ≤ S ≤ 0.30), min(0.45,
  0.32 + 0.25 (S − 0.30)) (0.30 < S ≤ 1.0); f_L = 1 − a·w(Re), w smooth step 0
  at Re_hi (7.0–8.0e4, ≈ 7.5e4) to 1 at Re_lo (5.5–6.5e4, ≈ 6.2e4); a 0.8–1.0,
  bounds 0.4–1.3; partial recovery f ≈ 0.2–0.7 at Re 5e4; Bridgestone
  f(7e4)/f(8e4) ≈ 0.59–0.77 at S ≈ 0.17.
  C_D = C_D0(S) + k_Re (Re − 1.5e5) + ΔC_D,crisis; C_D0 = 0.220 − 0.27 S + 3.0
  S² (S ≤ 0.22), 0.30 + 0.38 (S − 0.22) (0.22 < S ≤ 0.46); k_Re 0.010–0.017
  per 1e5; ΔC_D,crisis ball-specific, 0 to +0.25 at Re 5e4.
- [S] Measured lift ratio table (measured C_L / C_L0) aero-data.md:230-235:
  Re 7e4: 0.34 / 0.63 / 0.76 / 0.85 for S < 0.12 / 0.12–0.20 / 0.20–0.28 /
  0.28–0.36; 6.5e4: −0.20 / −0.13 / 0.32 / 0.63; 6e4: 0.26 / −0.31 / −0.06 /
  0.30; 5e4: 0.72 / 0.56 / 0.19 / 0.30.
- [S] Measured-range validity aero-data.md:111-117: Re 7.5e4–2e5 / S 0.04–0.30
  well covered; Re 5e4–7.5e4 / S 0.05–0.36 one lab + one manufacturer; S > 0.36
  only B&H 1976; Re < 4.5e4 none for modern balls; Re > 2e5 sparse.
- [S] B&H 1976 high-S points (aero-data.csv:270-303, digitized by probe 1 from
  Kensrud 2010's reproduction; Re = U·D/1.58e-5; ±0.008 digitizing): at Re
  3.78e4 C_L 0.205 / 0.277 / 0.392 / 0.421 / 0.452 at S 0.299 / 0.448 / 0.599 /
  0.746 / 1.002, C_D 0.366 / 0.403 / 0.406 / 0.517 / 0.544; at Re 5.91e4 C_L
  0.265 / 0.339 / 0.363 / 0.404 at S 0.286 / 0.383 / 0.477 / 0.641, C_D 0.347
  / 0.363 / 0.439 / 0.455; at 8.24e4 C_L 0.302 / 0.352 at S 0.342 / 0.460, C_D
  0.366 / 0.391.

## Harness additions (2026-10-09)

- harness/laws2.mjs (new): families R0 (supercritical laws only), R1 (band
  persists at all S), R2 (band fades to 0 by S 0.6, B&H), R3 (fades by S 1.0),
  R2f (R2 with C_D0 flat beyond S 0.46). Free: ReHi [7e4, 8e4], ReLo [5.5e4,
  6.5e4], a [0.4, 1.3], dC [0, 0.25], sD [0.9, 1.1], sL [0.85, 1.15]; init =
  nominal (7.5e4, 6.2e4, 0.9, 0.17, 1, 1). Fixed choices: k_Re 0.0135 per 1e5
  above Re 1e5; lift recovery to w = 0.62 at Re 5e4 (f(5e4) = 0.44 at a 0.9),
  held below; crisis drag smoothstep 8.5e4 → 5e4 moved with the band; C_D0
  continuous at S 0.22 (quadratic 0.3058 vs published 0.30), slope 0.38
  continued to S 0.64 then flat.
- [D] Nominal dC = 0.17: measured C_D at Re ≈ 5e4 minus C_D0 at the
  measurement's S (Lyu 2020 0.46–0.49 at S ≈ 0.27 → +0.14…+0.17; KK 0.525 at
  S ≈ 0.24 → +0.21), with the frozen k_Re term −0.0068.
- run-family.mjs: `import './laws2.mjs'` and a `--fixed` flag (evaluate init
  values, no fit). summary.mjs: hard-oracle column now 1, 2, 3, 6 and 9a.
  plausibility.mjs, driver-shape.mjs: `import './laws2.mjs'`.
- [D] Harness check after these edits: `node docs/research/land-angle-spike/harness/check-f0.mjs`
  → max |harness − BRIEF| 0.050°, |harness − app| 5.1e-13°, 5,280 ft −5.3542°.

## Unfitted measured surfaces (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --fixed --tag nominal`
for R0 R1 R2 R3 F0 (logs harness/out/<F>-nominal.txt); summary:
`node docs/research/land-angle-spike/harness/summary.mjs F0 F0-nominal R0-nominal R1-nominal R2-nominal R3-nominal`.
- [D] Mode G RMS carry / height / land, nothing fitted: today's laws (F0,
  gD = gL = 1) 16.94 / 5.83 / 4.22; R0 5.23 / 3.06 / 6.36; R1 14.68 / 3.45 /
  4.92; R2 7.38 / 3.08 / 3.66; R3 10.01 / 3.21 / 3.51. (F0 with its 2 levels
  fitted: 7.58 / 2.19 / 4.21.)
- [D] Mode A land RMS, nothing fitted beyond the app's per-row kD, kL: F0
  (shipped app) 4.65; R0 3.96; R1 2.81; R2 2.43; R3 1.88.
- [D] Hard oracles (1, 2, 3, 6, 9a), nominal: R0 G fails 9a (12 falls, LPGA
  3-wood from 7,250 ft, ≤ 0.23 yd), R0 A passes all; R1/R2/R3 fail 9a in G and
  A (162–226 falls) and fail 3 in A (Padjen land −4.05°). F0 nominal passes all.

## Implementation check against the measured points (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/plausibility.mjs F0-nominal R0-nominal R1-nominal R2-nominal R3-nominal`
(aero-data.csv now has 216 points with Re and S: 93 C_D, 216 C_L).
- [D] Nominal R surfaces vs measured, Re ≥ 8e4: C_D bias −0.001 / RMS 0.016
  (n 68), C_L −0.003 / 0.020 (n 80) — the implementation reproduces probe 1's
  supercritical fits (probe 1: rms 0.020 / 0.024). Today's law unfitted: C_D
  +0.019 / 0.037, C_L +0.054 / 0.057.
- [D] Re < 8e4 C_L (n 136): R1 +0.004 / 0.096, R2 +0.013 / 0.080, R3 +0.009 /
  0.085, R0 (no band) +0.136 / 0.165, F0 +0.184 / 0.207.
- [D] Re < 8e4 C_D (n 25): R1 +0.076 / 0.093, R2 +0.045 / 0.070, R0 −0.040 /
  0.077. The low-Re drag points mix crisis balls (Lyu) with balls that show
  none (Bridgestone at 7e4; B&H whose crisis sits near 4e4), so any single dC
  is biased against one group (probe 1: "ball-specific").

## R0 fitted (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/run-family.mjs R0 --restarts 10`
(log harness/out/R0.txt).
- [D] G: sD 1.060, sL 1.124 (inside 0.9–1.1 / 0.85–1.15; all 11 starts cost
  473.0). RMS 6.39 / 2.04 / 3.73, CV 6.69 / 2.10 / 3.78. A land RMS 3.96.
- [D] Hard oracles: G fails 9a (6 falls, LPGA 3-wood from 8,750 ft, ≤ 0.23
  yd); A passes 1, 2, 3, 6, 9a. Padjen G carry +9.1 %, apex −14.9 %, land
  −8.11°; A +10.3 % / −15.2 % / −8.46°.

## B&H guide against the laws (2026-10-09, derived by hand from aero-data.csv:270-303)

- [D] B&H C_L / C_L0(S): Re 3.78e4: 0.205/0.320 = 0.64 (S 0.299), 0.277/0.357
  = 0.78 (0.448), 0.392/0.395 = 0.99 (0.599), 0.421/0.432 = 0.98 (0.746),
  0.452/0.450 = 1.00 (1.002). Re 5.91e4: 0.265/0.308 = 0.86 (0.286), then
  0.995–0.997 at S 0.383 / 0.477 / 0.641.
- [D] B&H C_D vs C_D0: Re 5.91e4: 0.363 vs 0.368 (S 0.383), 0.439 vs 0.404
  (0.477), 0.455 vs 0.465 (0.641); Re 8.24e4: 0.366 vs 0.352 (0.342), 0.391 vs
  0.397 (0.460). Re 3.78e4 (inside B&H's own crisis): 0.517 / 0.544 at S
  0.746 / 1.002 vs C_D0 0.465 (flat beyond 0.64).

## Fitted measured-bounded families (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --restarts 10`
for R1 R2 R3 R2f (logs harness/out/<F>.txt); summary:
`node docs/research/land-angle-spike/harness/summary.mjs R0 R1 R2 R3 R2f`.
G RMS carry / height / land (CV); A(G shape); A* (CV):
- [D] R1 persist: G sD 1.002, sL 1.088, ReHi → 8.0e4, ReLo → 6.5e4, a → 0.40,
  dC → 0 (all at bounds; all 11 starts cost 496.1). 7.33 / 2.02 / 3.02 (7.68 /
  2.07 / 3.09); A(G) 2.57; A* ReHi 7.79e4, ReLo → 6.5e4, a → 0.40, dC 0.131:
  1.67 (1.79).
- [D] R2 fade by 0.6: G sD 1.002, sL 1.081, ReHi → 8.0e4, ReLo → 6.5e4, a →
  0.40, dC 0.112; cost 338.4 (1 of 11 starts; others 343.6). 5.39 / 2.04 / 2.73
  (5.88 / 2.12 / 2.81); A(G) 2.56; A* ReHi → 8e4, ReLo 6.34e4, a → 1.30, dC
  0.042: 2.27 (2.39).
- [D] R3 fade by 1.0: G sD 1.007, sL 1.090, ReHi → 8e4, ReLo → 6.5e4, a → 0.40,
  dC 0.028; cost 384.6. 6.08 / 1.99 / 2.81 (6.49 / 2.07 / 2.93); A(G) 2.54; A*
  ReHi → 8e4, ReLo → 6.5e4, a 1.102, dC 0.039: 1.62 (1.79).
- [D] R2f (R2, C_D0 flat beyond S 0.46): G sD 1.044, sL 1.112, ReHi 7.27e4,
  ReLo → 6.5e4, a → 0.40, dC 0.032; cost 351.2. 4.97 / 2.18 / 3.14 (5.33 / 2.25
  / 3.24); A* 2.66 (2.75).
- [D] Mode-G costs: R2 338.4 < R2f 351.2 < R3 384.6 < R0 473.0 < R1 496.1.
- [D] Hard oracles (1, 2, 3, 6, 9a): every banded family fails 9a in G and A*
  (G 30–94 falls, A* 90–301); R2 A* also fails 3 (Padjen land −4.45°), R3 A*
  fails 3 and 6, R2f A* fails 3 and 6. R0 A* passes all five; R0 G fails 9a.

## Per-row, driver shape, TrackMan (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/rows-table.mjs G F0-nominal R0-nominal R2-nominal R3-nominal`;
`node docs/research/land-angle-spike/harness/driver-shape.mjs F0-nominal R0-nominal R1-nominal R2-nominal R3-nominal R0 R1 R2 R3 R2f`;
`node docs/research/land-angle-spike/harness/tm-table.mjs F0-nominal R0-nominal R1-nominal R2-nominal R3-nominal R0 R1 R2 R3 R2f`.
- [D] Unfitted G per-row: low-S rows never enter the band and land too
  shallow under every measured surface (PGA Driver −6.4°, LPGA Driver −5.7…
  −5.8°, LPGA 3-wood −11.2°) with low apex (−6.8, −3.3, −7.1 yd). R2 nominal
  fixes the mid-S rows' land (PGA 5-wood −1.1, hybrid −0.8, 3–5 irons −1.8…
  −2.2) but flies them short (hybrid −14.8 yd, 4 iron −10.3 yd).
- [D] PGA Driver (table launch) hang time / apex % of carry vs radar 6.4 s /
  65.5 %: F0 nominal G 7.56 s / 66.4 % (apex 41.8 yd), A 6.93 / 65.3; R0–R3
  nominal G 6.27 / 64.0 (apex 28.2 yd, carry 276.1), A* 7.09–7.10 / 65.8–66.0;
  fitted R0 G 6.70 / 65.1, R1 G 6.71 / 64.7, R2 G 6.68 / 64.7 (apex 31.3 yd),
  R3 G 6.70 / 64.7, R2f G 6.69 / 65.0; A* 6.99–7.09 / 65.8–66.5.
- [D] TrackMan 2014 6-irons (informational), R0 nominal G: carry +2.4 / +1.4
  yd, height −0.5 / +0.3 yd, land −1.3 / −0.4° (PGA / LPGA); max wind
  land-response error 0.9°, carry 0.8 yd. Today's laws unfitted G: +24.6 /
  +20.1 yd carry. R2 nominal G: −1.2 / −1.2 yd, land +1.2 / +1.1°, wind 2.4°.
  R1 nominal G: −15.3 yd, +8.9°.

## Altitude-penalised measured-bounded fits (2026-10-09, derived)

Harness addition: eval.mjs `setConstrained(v, stepFt, penWeight)` and
run-family `--pen-weight` (multiplies every penalty residual; default 1 keeps
round 1 unchanged). Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --restarts 6 --constrained --pen-step 500 --pen-weight 10`
(logs harness/out/<F>-c500w10.txt): penalty nodes every 500 ft to 10,000 ft,
weight 10 (a 0.01 yd carry fall costs 1).
- [D] R0-c500w10: sD 1.088, sL → 1.150 (bound); G 7.34 / 2.07 / 3.20, CV 7.47
  / 2.07 / 3.20; still fails 9a in G (LPGA 3-wood carry falls from 9,250 ft,
  ≤ 0.22 yd; 4 falls); A land 3.96, passes all five. Padjen G +9.6 % / −14.6 %
  / −8.20°. Within the measured ball-spread bounds the supercritical laws
  cannot make the LPGA 3-wood's carry rise all the way to 10,000 ft in mode G.

## Ballooning (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/balloon-table.mjs G F0 R0 R2 R3` and `... A F0 R0 R1 R3`.
- [D] Mode G rise / peak / apex (mean apex): F0 0.7–6.6° / 12.5–34.7 % /
  60.0–67.1 % (64.1); R0 0.2–6.4 / 9.5–35.1 / 60.0–68.3 (64.6); R2 0.1–5.9 /
  7.1–35.5 / 59.8–70.7 (65.1); R3 0.1–6.0 / 7.7–35.4 / 59.4–70.0 (64.9).
  PGA Hybrid apex F0 66.6 %, R0 68.0, R2 70.0, R3 69.5.
- [D] Mode A*: F0 0.9–5.9 / 63.9 % mean apex; R0 0.8–5.4 / 64.5; R1 0.7–4.6 /
  66.0; R3 0.7–4.2 / 66.2 (PGA 5-wood apex 71.9 %, hybrid 70.7 %).
- [D] PGA Driver minimum Re (run-family ballooning lines, harness/out/R1.txt,
  R2.txt, R3.txt): G 7.93–7.98e4, A* 7.32–7.47e4; fitted onsets ReHi 7.8–8.0e4.
- [D] R1 vs R2 mode G (`rows-table.mjs G R1 R2`): PGA 6i–PW carry −7.7 / −11.2 /
  −10.3 / −9.7 / −13.5 (R1) vs −2.7 / −5.2 / −4.7 / −4.7 / −9.3 (R2); land +0.8
  / +0.7 / +0.6 / −0.4 / +0.3 (R1) vs −1.3 / −2.3 / −2.3 / −3.1 / −2.2 (R2).
- [D] First 9a violations (harness/out/R2.txt, R3.txt, R1.txt "### mode"
  lines): R2 G LPGA 3-wood from 4,750 ft, R2 A* LPGA 5 Iron from 750 ft; R3 G
  LPGA 3-wood from 5,500 ft, R3 A* LPGA 5 Iron from 2,750 ft; R1 G LPGA 3-wood
  from 5,500 ft, R1 A* LPGA 4/5 Iron from 6,500 ft.
- [D] R2-c500w10: G at the weakest measured corner (ReHi → 7.0e4, ReLo → 5.5e4,
  a → 0.40, dC → 0; sD 1.077, sL 1.108; all 7 starts cost 832.0, penalty part
  289): 7.65 / 1.99 / 3.35, CV 7.86 / 2.06 / 3.39; fails 9a (6 falls, LPGA
  3-wood from 8,750 ft, ≤ 0.43 yd); passes 1, 2, 3, 6; Padjen +9.0 % / −14.5 %
  / −8.01°. A* (ReLo 5.68e4, a 0.40, dC 0): 3.59, CV 3.59; fails 9a (3 falls,
  LPGA 4 Iron from 9,500 ft, ≤ 0.42 yd); Padjen +10.3 % / −15.2 % / −8.39°.
- [D] Summary `node docs/research/land-angle-spike/harness/summary.mjs R0-c500w10 R1-c500w10 R2-c500w10 R3-c500w10`:
  R1-c G 9.54 / 2.09 / 3.59 (CV 9.74 / 2.16 / 3.65), A* 3.34 (CV 3.34); R3-c G
  8.23 / 2.01 / 3.36 (CV 8.43 / 2.07 / 3.40), A* 3.41 (CV 3.41). Band at the
  weakest corner in all (ReHi 7.0e4, ReLo 5.5e4 in G / 5.69e4 in A*, a 0.40,
  dC 0). Every one fails 9a in both modes: G 6–7 falls (LPGA 3-wood from
  8,500–8,750 ft, ≤ 0.43 yd), A* 3–5 falls (LPGA 4 Iron from 9,250–9,500 ft,
  ≤ 0.42 yd). All pass 1, 2, 3, 6; Padjen G +8.8…+9.0 % / −14.5…−14.6 % /
  −7.95…−8.01°, A* +10.3 % / −15.2 % / −8.39°.

## Status (2026-10-09)

- round2.md sections 1–7 complete. Final harness check
  (`node docs/research/land-angle-spike/harness/check-f0.mjs`) after all round-2
  edits (laws2.mjs, --fixed, --pen-weight, summary 9a): max |harness − BRIEF|
  0.050°, |harness − app| 5.1e-13°, PGA Driver 5,280 ft −5.3542° — passes.
- Not done: dC fixed at 0 as a separate unconstrained run (the constrained
  fits drive dC to 0 anyway); recovery level below ReLo and C_D0 beyond S 0.64
  were not varied beyond R2f.
