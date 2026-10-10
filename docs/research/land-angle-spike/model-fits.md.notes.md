# model-fits notes (probe 2)

Verified facts, appended the moment each is verified. Each entry: claim,
source (file:line or the harness command that produced it), date,
primary/secondary/derived. All harness commands run from the worktree root
`/home/jhoblitt/github/tmelevation/.claude/worktrees/land-angle-spike` with
Node v22.22.2, sandboxed.

## Shipped model facts (read 2026-10-09, primary = the code itself)

- [P] Laws: C_D = kD·(0.24 + 0.18 S), C_L = kL·0.54·S^0.4, S = rω/u with u the
  air-relative speed; dω/dt = −(λ0·ρ/ρ0/r)·u·ω, λ0 = 2e-5.
  site/js/flight.js:7, :38, :46-48, :54.
- [P] Integrator: RK4, dt = 0.05 s, cap 60 s; apex = Hermite y at the linear
  vy zero crossing; landing = first step with y<0 and vy<0, 3 Newton
  iterations on the Hermite y, land angle from linearly interpolated (vx, vy).
  site/js/flight.js:8-9, :113-145.
- [P] Calibration: damped Newton on (carry, maxHeight) from (kD, kL) = (1, 1),
  forward-difference probe 1e-4 relative, tolerance 1e-4 m, up to 8 halvings.
  site/js/calibrate.js:3-8, :17-91. Targets the yards columns
  (site/js/model.js:12-17).
- [P] Reference air: RHO0 = P0·M/(R·T_REF), T_REF = 298.15 K (25 °C), density
  ratio = p/p0 at constant 25 °C. site/js/atmosphere.js:9, :19, :33-35.
- [P] App altitude delta = altitude flight − calibrated sea-level flight, same
  kD, kL. site/js/model.js:21-42.

## Harness check (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/check-f0.mjs`

- [D] Air viscosity at 25 °C (Sutherland, 1.716e-5 Pa·s at 273.15 K, S = 110.4 K):
  μ = 1.8371e-5 Pa·s; ρ0 = 1.18391 kg/m³ (site/js/atmosphere.js RHO0);
  Re(60 m/s) = 1.650e5, Re(25 m/s) = 6.874e4 (BRIEF: ~1.6e5 / ~6.8e4).
- [D] F0 per-row calibration reproduces every BRIEF land gap within 0.050°
  (bar 0.1°; the 0.05 maxima are the BRIEF's own 0.1° rounding, e.g. PGA
  Driver −1.051 printed −1.1). Harness vs shipped site/js (calibrateRow) land
  gap: max |diff| 5.1e-13° — the vector-form integrator is the shipped one to
  round-off.
- [D] F0 land RMS over 23 rows = 4.649°; PGA mean |gap| 5.187° (BRIEF: 5.2°).
- [D] PGA Driver at 5,280 ft (ρ/ρ0 = 0.82341): land change −5.3542° in the
  harness and in the shipped app (target −5.35°, |diff| 0.0042°, bar 0.05°);
  carry +18.112 yd both.
- [D] Per-row F0 factors kD 0.920–1.265, kL 0.813–1.114 (same output).

## Fitter and weights (2026-10-09)

- Fitter: bounded Levenberg–Marquardt (harness/fit.mjs; logistic map to the
  bounds, forward-difference Jacobian h = 1e-5 in z for mode G, 1e-3 for mode
  A* where the nested calibration adds ~1e-7 m jitter), best of the init start
  plus N seeded uniform random restarts (mulberry32).
- Weights: residuals divided by the success-bar tolerances, carry 2 yd, height
  1 yd, land 1.5°. Justification: the ±0.5 rounding is the same in all three
  columns (uniform-rounding SD 0.29), far below every tolerance, so rounding
  does not set the relative weights; the bar does. A run with equal unit
  weights is the sensitivity check (recorded per family where run).
- Mode A* = shape parameters (those not marked `level` in harness/laws.mjs)
  fitted to land angle with per-row kD, kL recalibrated at every evaluation
  (calibration tolerance 1e-7 m); level parameters held at the mode-G values
  (the per-row kD, kL absorb them).

## F0 — today's laws (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/run-family.mjs F0 --restarts 4`
(log: harness/out/F0.txt, JSON harness/out/F0.json)

- [D] Mode G (global gD = 1.128, gL = 0.9764; all 5 starts reach cost 621.8):
  RMS carry 7.58 yd, height 2.19 yd, land 4.21°. LOO-CV RMS 8.12 / 2.24 / 4.25.
  Worst: PGA Driver carry −26.6 yd, LPGA Driver −10.4 yd; land −7.3° (PGA 4i).
- [D] Mode A (per-row kD, kL): land RMS 4.65° (identical to the check; F0 has
  no shape parameter for A*).
- [D] Altitude, mode A (= the shipped app): carry +6.4% (PGA Dr) … +9.6% at
  5,280 ft; PGA 10.5–16.9%, LPGA 7.0–15.7% at 10,000 ft; Padjen 7,800 ft PGA
  Driver: carry +8.8%, apex −15.6%, land −7.93° (vs −9°). Monotone 0–10,000 ft
  on a 250 ft grid; 3 carry falls above 14,750 ft (LPGA 3-wood, 4 Iron), worst
  0.02 yd.
- [D] Altitude, mode G: PGA Driver 5,280 ft +8.4%; Padjen carry +11.9%, apex
  −13.1%, land −7.75°; monotone 0–10k; 7 carry falls ≥ 13,750 ft (worst 0.05 yd).
- [D] TrackMan 2014 (informational), mode A: 6-iron land −1.8° (PGA), −1.1°
  (LPGA) — matches physics-lit L4; wind land-response errors ≤ 0.9°.
- [D] Ballooning mode A: rise 0.9–5.9° peaking at 16.3–32.8% of carry; apex at
  60.8–66.7% of carry; PGA Hybrid 10.2° → 14.5° (BRIEF: 1–6°, 17–33%, 61–67%).

## F0b — S-only, free C_D slope and C_L exponent (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/run-family.mjs F0b --restarts 10`
(log harness/out/F0b.txt)

- [D] Mode G: a0 0.2351, a1 0.3212, c0 0.5170, cexp 0.4068 (all 11 starts
  cost 398.7). RMS carry 5.22 yd, height 1.84 yd, land 4.00°; LOO-CV 6.25 /
  1.98 / 4.09. PGA Driver carry −14.2, PGA PW −12.3 yd.
- [D] Mode A with G shape: land RMS 4.22°. Mode A* (a1, cexp free): a1 → 0.8
  (upper bound), cexp 0.306, land RMS 3.38°, A* LOO-CV 3.39°; kD then 0.49–0.87.
- [D] Altitude mode A*: PGA Dr 5,280 ft +7.1%; Padjen carry +9.7%, apex
  −15.1%, land −8.50°; monotone 0–10k (one 0.00 yd carry fall at 15,000 ft).

## F2 — drag rise below a critical Re (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/run-family.mjs F2 --restarts 12`
(log harness/out/F2.txt)

- [D] Mode G: a0 0.2359, a1 0.2086, c0 0.4770, dD 0.2243, ReD 7.07e4, wD
  0.03 (lower bound: a near-step crisis). All 13 starts cost 253.0. RMS carry
  4.67, height 1.69, land 2.46°; LOO-CV 5.62 / 1.76 / 2.88.
- [D] Mode A (G shape) land RMS 1.88°; A* (a1 → 0 bound, dD 0.221, ReD
  7.49e4, wD 0.03 bound) land RMS 1.76°, A* LOO-CV 2.11°.
- [D] Altitude: NOT monotone 0–10k in either mode (G 141, A 318 violations;
  PGA Driver land rises from 250 ft; LPGA iron carry falls from 3,000–6,000 ft).
  Mode A 10,000 ft carry gains PGA 0.4–7.2%, LPGA −3.1–1.8%; Padjen land
  −4.76° (A), fails app hard oracles 3 and 6 (7i @ 6,400 ft +4.7%).
- [D] TrackMan 2014 wind land-response errors up to 3.5° (A).

## F3 — F1 + F2 with shared Re_c, width fixed 0.15 (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/run-family.mjs F3 --restarts 12`
(log harness/out/F3.txt)

- [D] Mode G: lift loss dL → 0 (bound): the fit chooses the drag rise only
  (dD 0.2514, Rec 7.54e4). RMS carry 4.75, height 1.81, land 2.59°; LOO-CV
  5.74 / 1.91 / 2.77. A*: a1 → 0, dL → 0, dD 0.290, Rec 8.04e4; land RMS
  1.80°, LOO-CV 2.08°.
- [D] Altitude: not monotone; mode A carry gain at 10,000 ft PGA −1.9…+1.8%,
  LPGA −7.4…+2.0%; fails app oracles 1 and 6. Drag-crisis families reproduce
  the 2026-10-08 finding (zero/negative iron gains).

## F1 — lift loss below a critical Re (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/run-family.mjs F1 --restarts 12`
(log harness/out/F1.txt)

- [D] Mode G: a0 0.2301, a1 0.1579, c0 0.4717, dL 0.9168, ReL 7.735e4, wL
  0.03 (lower bound: a step). Two basins: cost 238.8 (7 of 13 starts) and
  399.1 (= F0b-like, no lift loss). RMS carry 4.09 yd, height 1.92 yd, land
  2.38°; LOO-CV 4.96 / 2.04 / 2.52. Coefficient map: C_L at Re ≤ 7e4 is
  0.016–0.041 (lift switched off), 0.19–0.36 above 1e5.
- [D] Mode A (G shape): land RMS 2.43°, kL up to 1.43 (LPGA PW). A*: a1 → 0.8
  (bound), dL 0.860, ReL 7.97e4, wL 0.03 (bound); land RMS 2.05°, LOO-CV 2.21°;
  kD falls to 0.41–0.78.
- [D] Altitude: not monotone 0–10k (G 414, A 356 violations; LPGA irons'
  carry falls from 2,000–3,000 ft). 10,000 ft carry: PGA +1.4…+6.4% (G), LPGA
  −7.1…+0.1% (G); land change at 10k up to −16 to −20°. Padjen land −5.74°
  (G) / −6.82° (A); 7i @ 6,400 ft +4.7% (G) fails app oracle 6.
- [D] Ballooning G: apex 58.2–69.7% of carry (F0 G 60.0–67.1%).

## Second round: F4s, F4l, F5, F6, F8, F9 (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --restarts 12`
for F in F4s F4l F5 F6 F8 F9 (logs harness/out/<F>.txt). RMS order is carry yd
/ height yd / land °.

- [D] F4s (saturating C_L = cmax(1−e^(−S/S0)) × lift loss, w 0.15): G cmax
  0.362, S0 0.138, dL → 1 (bound), ReL 6.67e4; RMS 5.50 / 2.68 / 2.71, CV
  6.87 / 2.93 / 2.78. A(G) 3.52°, A* 2.41° (a1, S0, dL at bounds), CV 2.42°.
  Not monotone (LPGA 3-wood carry falls from 4,000 ft); app oracle 6 fails.
- [D] F4l (linear C_L = c1 S × lift loss): G RMS 7.28 / 3.94 / 4.40 (c1 1.71,
  ReL 1.19e5, wL 0.11), CV 8.84 / 4.58 / 4.73; A* 1.95°, CV 2.07°. Mode G
  altitude wild (PGA Driver 5,280 ft carry −1.2%); A* not monotone.
- [D] F5 (spin-shifted drag crisis Re(1+βS), w 0.15): G dD → 0.4 (bound), ReD
  7.41e4, β 0.546; RMS 4.50 / 1.78 / 2.79, CV 5.41 / 1.87 / 3.04. A(G) 2.10°;
  A* drives β → 0 and reproduces F3 A* (1.80°, CV 2.08°). Not monotone; 7i
  @ 6,400 ft +5.0% (G).
- [D] F6 (drag rise fading with S, w 0.15): G dD → 0.4 (bound), ReD 6.91e4,
  Sf 1.27; RMS 4.31 / 1.80 / 2.50, CV 5.20 / 1.88 / 2.68. A(G) 1.87°, A* 1.76°
  (CV 1.98°). Not monotone; A* 10,000 ft carry LPGA −7.1…−0.6%.
- [D] F8 (lift loss fading with S, w 0.15): G dL → 1 (bound), ReL 6.80e4, Sf
  1.01; RMS 4.33 / 2.11 / 3.40, CV 5.26 / 2.21 / 3.49. A* 2.71°. Passes app
  oracles 1, 2, 3, 6 in G (Padjen carry +8.5%, land −8.31°) but not monotone
  (LPGA long-iron carry falls from 5,000 ft, worst 0.86 yd per 250 ft).
- [D] F9 (F0b + spin-decay multiplier m): G m → 0.25 (lower bound), RMS 5.19 /
  1.84 / 3.97, CV 6.21 / 1.99 / 4.06. A*: a1 → 0, cexp → 1.5 (bound), m 6.36;
  land RMS 3.04°, CV 3.06°; altitude monotone 0–15,000 ft and app oracles pass
  (Padjen land −7.52°), but TrackMan wind land-response errors up to 4.1° and
  tailwind carry-response errors up to 22 yd; maxS at landing of PGA Driver
  0.07 (spin largely gone).
- [D] F7 (smooth power laws C_D ∝ (Re/1e5)^qD, C_L ∝ (Re/1e5)^qL; command as
  above, log harness/out/F7.txt): G a0 0.312, a1 0.135, c0 0.455, cexp 0.278,
  qD → −0.6 (bound), qL −0.543; all 13 starts cost 290.4. RMS 4.65 / 1.68 /
  3.15, CV 5.49 / 1.93 / 3.37. A(G) 2.47°, A* 1.98° (CV 2.13°). Monotone to
  15,000 ft in G and A*, but altitude response too small: Padjen (G) carry
  +5.8%, apex −8.4%, land −4.67° (fails app oracle 3), 7i @ 6,400 ft +5.5%
  (fails 6). Coefficient map: C_L(Re 5e4, S 0.1) = 0.35, C_D(Re 2e5, S 0.1)
  = 0.215.

## Measured coefficient data from probe 1 (read 2026-10-09, secondary to me)

Read from docs/research/land-angle-spike/aero-data.md.notes.md (probe 1,
in progress) and aero-data.csv (226 lines at read time):
- Lyu 2020 (Sports Eng. 23:3, CC BY): Pro V1 / ChromeSoft / B330-RX at
  ~2250 rpm: C_D 0.46–0.49 at Re 5e4 → 0.25–0.27 at 7.5e4 → 0.21–0.24 at
  1e5 → min 0.16–0.19 near 1.25–1.5e5 → ~0.20 at 2e5; C_L negative
  (−0.02…−0.09) at Re 6.2–6.3e4 for S ≲ 0.2, positive again ≤ 5e4; at Re 7e4
  C_L 0.30 at S 0.33–0.35 (Fig. 4). aero-data.md.notes.md:14-36.
- Lyu 2018 Fig. 3b KK spinning C_D: 0.525 (5.1e4), 0.41 (6.3e4), 0.263
  (7.6e4), 0.203 (9.9e4), 0.18 (1.24e5), 0.196 (1.68e5). aero-data.md.notes.md:48-52.
- USGA ITR example (US 6,186,002 B1): at SR ≈ 0.09 C_L flat in Re over
  8.1e4–2.0e5 (0.146–0.153), C_D 0.223 → 0.241. aero-data.md.notes.md:65-77.
- [D] Implied crisis: Re_c ≈ 6.3–6.6e4, ΔC_D ≈ 0.25–0.33, 10–90 % over
  ≈ 5.2e4–8e4 → logistic width w ≈ 0.1 in ln Re (my reading of the above).

## Altitude-constrained fits (modes Gc, A*c) (2026-10-09, derived)

Penalty (harness/eval.mjs `altitudePenalty`, on with `--constrained`): hinge
residuals for every one of the 23 rows — carry must not fall, max height and
land must not rise between 0 / 2,500 / 5,000 / 7,500 / 10,000 ft (0.1 yd or
0.1° per unit) — plus the app's hard oracles as bands: PGA Driver 7,800 ft
carry +5…+12 % and land −13…−5°, PGA 7i 6,400 ft carry +7…+16 % (0.25 per unit).
Uses launch conditions only, never table targets.

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --restarts 8 --constrained`
(logs harness/out/<F>-c.txt).

- [D] F0b-c and F9-c: penalty 0 at the unconstrained optimum; results identical
  to the unconstrained runs (F0b G land 4.00°, A* 3.38°; F9 G 3.97°, A* 3.04°).
- [D] Constrained, 2,500 ft penalty grid (summary: `node docs/research/land-angle-spike/harness/summary.mjs F0b-c F9-c F1-c F2-c F4s-c F6-c F8-c`).
  G RMS carry/height/land and CV land; A* land and CV:
  F1-c 4.73/1.88/3.30 (CV 3.38), A* 2.66 (2.68);
  F2-c 4.93/1.76/2.74 (CV 2.84), A* 1.92 (1.96);
  F4s-c 5.71/2.56/3.27 (CV 3.30), A* 2.97 (2.98);
  F6-c 4.98/1.84/3.26 (CV 3.36), A* 2.33 (2.36);
  F8-c 4.91/1.93/3.71 (CV 3.77), A* 3.04 (3.04).
  All pass app hard oracles 1, 2, 3, 6 but keep 6–17 small monotonicity
  violations between the 2,500 ft penalty nodes (carry falls ≤ 0.59 yd per
  250 ft, mostly 8,750–10,000 ft, LPGA 3-wood/4–5 irons) and many above
  10,000 ft. A fine-grid (1,000 ft) rerun is queued for F1, F2, F6, F10.
- [D] Constrained F2-c G: dD 0.124 (half the unconstrained 0.224), ReD 6.80e4,
  wD 0.03 (bound). F6-c G: dD 0.232, ReD 5.71e4, Sf 1.19, w 0.15.

## F10 / F10r — measured-anchored laws (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs F10 --restarts 10`,
same for F10r (logs harness/out/F10.txt, F10r.txt). Laws: C_D = gD·[CDmeas(fRe·Re)
+ a1(S − 0.15)] with CDmeas the Lyu 2020 Fig. 3 mid-range curve (0.475 @ 5e4,
0.35 @ 6.3e4, 0.26 @ 7.5e4, 0.225 @ 1e5, 0.195 @ 1.25e5, 0.175 @ 1.5e5, 0.20 @
1.75–2e5, 0.21 @ 2.5e5, log-linear between, flat outside); C_L = gL·(Lyu 2018
quadratic −3.25S² + 1.99S for S ≤ 0.3, then 0.3045 + cHi(S − 0.3)).
F10r freezes CDmeas at Re 1.5e5 (Re-free control).

- [D] F10 G: gD 1.075, a1 0.137, gL 0.915, cHi 0.455, fRe 0.736 (crisis moved
  to Re ≈ 8.6e4); two basins (366.7 ×4, 498.5 ×7). RMS carry 5.52, height 2.65,
  land 1.71° — the lowest mode-G land RMS of any family; CV 7.86 / 3.12 / 1.81.
  A(G) 2.21°, A* 1.80° (CV 1.93°). Altitude: carry FALLS with elevation (PGA
  Driver 7,800 ft −3.5% in G); fails app oracles 1 and 6; 648 monotonicity
  violations 0–10k.
- [D] F10r G: gD 1.597, a1 0.226, gL 1.049, cHi 0.357; RMS 6.08 / 2.49 / 3.43,
  CV 7.54 / 2.70 / 3.44. A* (a1 → 0.8, cHi → 0, i.e. C_L flat at 0.30 above
  S 0.3): land RMS 2.24°, CV 2.24°; A* altitude monotone 0–10k, passes app
  oracles, Padjen land −10.51° (G −8.29°); G has 3 small carry falls at
  9,500–10,000 ft (LPGA 3-wood, ≤ 0.18 yd).

## Equal-weight sensitivity (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs F1 --restarts 10 --weights 1,1,1 --tag w111 --no-fitA`
and the same for F0b (logs harness/out/F1-w111.txt, F0b-w111.txt).
- [D] F1 equal weights: same basin (dL 0.909, ReL 7.80e4, wL 0.03); RMS 4.07 /
  2.02 / 2.27 (vs 4.09 / 1.92 / 2.38 with bar weights); CV 4.98 / 2.11 / 2.42.
- [D] F0b equal weights: RMS 4.97 / 2.25 / 3.94 (vs 5.22 / 1.84 / 4.00).
  Weighting moves RMS by ≤ 0.4 in any output; conclusions unchanged.

## Coefficient plausibility vs measured points (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/plausibility.mjs F0 F0b F1 F2 F3 F4s F4l F5 F6 F7 F8 F9`
(176 measured points with Re and S from aero-data.csv: 65 C_D, 176 C_L;
bias / RMS of model − measured; A* uses the median per-row kD, kL).
- [D] Every family's C_L is above the measured lift at Re < 8e4 (n 120) except
  the lift-loss families: F0 G +0.189 / 0.210; F0b +0.181 / 0.202; F2 +0.165;
  F1 −0.042 / 0.099; F4s +0.036 / 0.094; F8 +0.057 / 0.100. At Re ≥ 8e4 (n 56)
  F0 C_L +0.047 / 0.050, F1 +0.017 / 0.035.
- [D] C_D at Re ≥ 8e4 (n 56): F0 +0.059 / 0.064; F0b +0.036 / 0.043; F1 +0.013
  / 0.030; F2 +0.025 / 0.035. C_D at Re < 8e4 (n 9): F2 +0.083 / 0.101, F6
  +0.121 / 0.124, F5 +0.147 / 0.148 (the fitted drag rise overshoots the
  measured crisis), F1 −0.092 / 0.125 (no drag rise).
- Caveat: measured S ≤ ~0.35 only; points mix four ball models (ball-to-ball
  spread ~0.02–0.03, Lyu 2018/2020).

## Ballooning (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/balloon-table.mjs G F0 F1 F2-c F10 F10r`
(dt = 0.005 s diagnostic flights; ground flight-path angle).
- [D] Mode G rise above launch / peak position / apex position (% carry):
  F0 0.7–6.6° (mean 3.6), peak 12.5–34.7 %, apex 60.0–67.1 % (mean 64.1 %);
  F1 0.2–5.2° (2.5), 8.2–34.5 %, apex 58.2–69.7 % (65.2 %);
  F2-c 0.4–5.9° (2.9), 10.2–34.3 %, apex 61.6–68.1 % (65.2 %);
  F10 0.0–5.0° (2.2), 2.8–37.2 %, apex 61.5–71.0 % (66.5 %);
  F10r 0.3–6.7° (3.3), 12.3–36.6 %, apex 61.2–67.7 % (64.6 %).
- [D] PGA Hybrid (launch 10.2°): rise F0 6.1°, F1 4.7°, F2-c 5.3°, F10 4.7°;
  apex F0 66.6 %, F1 69.3 %, F2-c 67.8 %, F10 70.3 %.

## Fine-grid (1,000 ft) altitude-constrained runs (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --restarts 6 --constrained --pen-step 1000`
(logs harness/out/<F>-c1000.txt).
- [D] F10-c1000 G: gD 1.399, a1 0.224, gL 1.056, cHi 0.229, fRe 1.588 — the
  constraint moves the measured crisis to Re ≈ 6.3e4/1.588 ≈ 4.0e4, below the
  measured 5–8e4 and mostly out of the flight envelope. RMS 6.58 / 2.63 / 3.00,
  CV 8.14 / 2.83 / 3.06. A* (fRe 1.514, a1 0.645, cHi → 0): 2.39°, CV 2.43°.
  3 (G) / 5 (A*) small carry falls at 9,500–10,000 ft (≤ 0.66 yd per 250 ft).
- [D] Measured local C_D slopes dC_D/dS from probe 1's USGA ITR condition means
  (aero-data.md.notes.md:66-68): 0.68 at Re 8.1e4 (S 0.097 → 0.218), 0.46 at
  1.23–1.25e5, 0.21 at 2e5. The harness bound a1 ≤ 0.8 sits just above the
  steepest; A* fits that hit a1 = 0.8 are at the edge of the measured range.

## Per-tour fits (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/tour-split.mjs F0b F1 F2 F10r F10`
(log harness/out/tour-split.txt; 8 restarts in G, 2 in A*).
- [D] F0b: PGA-only G land 4.84°, A* 3.97° (cexp → 0.103); LPGA-only G 2.68°,
  A* 2.45° (cexp 0.790). The tours want opposite C_L(S) exponents.
- [D] F1: PGA-only G 4.31 / 1.45 / 2.63, A* 1.71° with dL → 1.00, ReL 8.04e4
  (lift fully off below 8e4); LPGA-only G 3.42 / 1.90 / 2.68 with dL → 0 (no
  lift loss at all), A* 2.52° (dL → 0). LPGA rows, though slower (lower Re
  late in flight), reject the low-Re lift loss the PGA rows want.
- [D] F1 all-23 rerun inside tour-split reproduces run-family (G 4.09 / 1.92 /
  2.38; A* 2.05), a check on the per-tour script.
- [D] F2: PGA-only G 5.15 / 1.54 / 2.36 (dD 0.260, ReD 7.11e4), A* 1.27°
  (dD 0.260, ReD 7.42e4); LPGA-only G 3.38 / 1.75 / 2.17 (dD 0.138, ReD
  6.85e4), A* 1.60° (dD 0.200, ReD 8.04e4, wD 0.089); all-23 A* 1.76°. Per tour
  the A* drag-rise law nearly meets the 1.5° bar (PGA meets it), but the two
  tours want different rise sizes.
- [D] F10r: PGA-only G 7.06 / 2.56 / 3.96, A* 2.31°; LPGA-only G 3.77 / 2.33 /
  2.54, A* 1.95° (cHi 0.8 vs 0 for PGA).
- [D] F10: PGA-only G 5.38 / 2.33 / 1.43 (fRe 0.714, gD 1.06), A* 1.62°;
  LPGA-only G 4.22 / 2.22 / 1.75 (fRe 0.608, gD 0.907), A* 1.79°.

## Fine-grid constrained results (2026-10-09, derived)

Summary command: `node docs/research/land-angle-spike/harness/summary.mjs F2-c1000 F6-c1000 F10-c1000`
- [D] F2-c1000 G: a0 0.239, a1 0.260, c0 0.499, dD 0.117, ReD 6.78e4, wD 0.03
  (bound). RMS 4.95 / 1.77 / 2.79, CV 5.85 / 1.81 / 2.89. A(G) 2.81°; A* (a1
  → 0.8, dD 0.198, ReD 6.79e4) 2.02°, CV 2.06°. Altitude: 14 (G) / 6 (A*)
  carry falls 0–10k, ≤ 0.43 / 0.52 yd per 250 ft; app hard oracles pass;
  Padjen land −6.18° (G) / −7.71° (A*); PGA 10k carry 10.0–15.3 % (G).
- [D] F6-c1000 G: RMS 4.95 / 1.84 / 3.29, CV 5.90 / 1.89 / 3.38; A* 2.42°,
  CV 2.44°; 12 (G) / 9 (A*) small carry falls 0–10k (≤ 0.37 / 0.42 yd).
- [D] Even with 1,000 ft nodes a soft-penalty fit leaves a few carry falls
  between nodes (penalty part 6.5–7.3 of a ~300 cost): the hinge weight trades
  ≤ 0.5 yd non-monotonicity for land fit.
- [D] F1-c1000 G: dL 0.246, ReL 7.04e4, wL 0.03 (bound) — the constraint cuts
  the lift loss from 0.92 to 0.25. RMS 4.72 / 1.88 / 3.33, CV 5.59 / 1.92 /
  3.41; A* 2.73°, CV 2.75°. 12 (G) / 5 (A*) small carry falls 0–10k (≤ 0.41 /
  0.49 yd); app hard oracles pass; Padjen land −6.97° (G) / −7.73° (A*).

## TrackMan 2014 shots and wind table — informational (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/tm-table.mjs F0 F0b F1 F2 F6 F9 F10 F10r F1-c1000 F2-c1000 F10-c1000`
(shot inputs and wind table copied from site/js/oracles.js:93-137; mode A
calibrates to the shot's carry + height as oracle 10 does; wind response =
change from the model's own calm flight minus TrackMan's change).
- [D] 6-iron land, model − TrackMan model shot (PGA / LPGA), mode A*: F0 −1.8 /
  −1.1; F0b +0.5 / +0.5; F1 +3.8 / +2.3; F2 +3.1 / +3.0; F6 +3.2 / +2.8;
  F10 +3.4 / +3.0; F10r +2.7 / +1.9; F2-c1000 +3.0 / +2.7; F1-c1000 +1.7 / +1.3.
- [D] Max |wind land-response error|, mode A*: F0 0.9°, F2 3.5°, F6 3.6°,
  F10 5.0°, F10r 2.6°, F2-c1000 3.2°, F1-c1000 1.0°, F9 4.1° (F9 tailwind
  carry-response error 22.0 yd).
- [D] Mode G 6-iron carry vs TrackMan shot: +3.9 to +8.4 yd (PGA) in every
  family — the global laws fly TrackMan's 2014 6-iron launch longer than
  TrackMan's model did.

## Low-Re exposure by row (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/re-exposure.mjs` (F0
per-row calibrated sea-level flights, i.e. the shipped app's; independent RK4
re-integration at dt 0.005 s).
- [D] Share of the descent spent below Re 7e4 — PGA: Driver 0 %, 3-wood 41 %,
  5-wood 83 %, Hybrid 74 %, 3 Iron 96 %, 4 Iron–PW 100 %; LPGA: Driver 0 %,
  3-wood 80 %, 5-wood 98 %, Hybrid–PW 100 %. Means: PGA 83 %, LPGA 89 %.
  Share of whole flight below 7e4: PGA Hybrid 36 % vs LPGA Hybrid 52 %; PGA
  3-wood 20 % vs LPGA 3-wood 39 %.
- [D] So LPGA rows are at least as exposed to any Re < 7e4 effect as PGA rows,
  and more so for woods and hybrids, yet their F0 land gaps are smaller (LPGA
  Hybrid −5.6 vs PGA −9.2; LPGA 3-wood −1.1 vs PGA −4.5).
- [D] min Re (PGA Driver 7.69e4, PGA Hybrid 6.59e4) matches the run-family
  ballooning diagnostics for F0 mode A — a cross-check of the two integrations.

## Coordinator input from probe 3 (verified 2026-10-09 against provenance.md / notes)

- [S, verified in docs/research/land-angle-spike/provenance.md.notes.md:131,134,138
  and provenance.md:435-464] PGA TOUR 2022-23 radar (TrackMan) Par 4/5 tee
  shots: ball 172.85 mph, launch 10.49°, spin 2570.6 rpm, apex 102'1" (34.0 yd),
  hang time 6.4 s to ground impact, carry 283.8 yd to ground impact, distance
  to apex 186.0 yd → apex at 186.0/283.8 = 65.5 % of carry (ratio of means,
  derived by probe 3). Soft, informational trajectory-shape checks for the PGA
  Driver row. Caveat: ground impact, not carry-flat; averages over different
  shot subsets (121,740 apex vs 113,979 carry attempts).
- [S, provenance.md:523-531] Gap tracks spin and launch, not carry or flight
  time: rows with spin < 2,600 rpm −1.1…−1.5°; low-launch 4,300–4,800 rpm PGA
  5-wood / hybrid / 3–4 irons −6.5…−9.2°; high-spin short irons PGA −3.4…−3.9°,
  LPGA −0.4…+0.7°.

## PGA Driver trajectory shape vs PGA TOUR radar (2026-10-09, derived; soft)

Command: `node docs/research/land-angle-spike/harness/driver-shape.mjs F0 F0b F1 F2 F6 F7 F9 F10 F10r F1-c1000 F2-c1000 F10-c1000`
(dt 0.005 s; table-row launch 171 mph / 10.4° / 2545 rpm; mode A* calibrated
to 282 yd / 35 yd). Targets: hang 6.4 s, apex at 65.5 % of carry.
- [D] Hang time / apex %: F0 G 6.93 s / 66.5 %, F0 A (app) 6.93 / 65.3; F0b
  A* 6.84 / 65.7; F1 A* 6.71 / 67.1; F2 A* 6.98 / 65.5; F6 A* 6.96 / 66.9; F7
  A* 7.72 / 69.4; F9 A* 6.40 / 64.5; F10 G 6.54 / 67.6, A* 7.21 / 67.8; F10r
  A* 7.13 / 67.6; F1-c1000 A* 6.90 / 65.9; F2-c1000 A* 6.91 / 65.8.
- [D] Every family except F9 A* flies the driver 0.3–1.3 s longer than the
  radar mean; the apex position of the app (65.3 %) and F2 A* (65.5 %) matches.

## Third round: spin-ratio-scaled Re-free laws (2026-10-09, derived)

Commands: `node docs/research/land-angle-spike/harness/run-family.mjs <F> --restarts 10`
for F11, F10rn, F0bw (logs harness/out/<F>.txt); tables via summary.mjs,
driver-shape.mjs, tm-table.mjs, rows-table.mjs A.
- [D] Mode G rejects every spin-scaled shape: F0bw G = F0b G exactly (a1 0.321
  with the bound at 2); F10rn G = F10r G (cHi +0.357 although −1 allowed);
  F11 G puts the lift peak at the Sp = 2 bound (no peak in range), RMS 5.37 /
  1.87 / 3.94, CV 6.45 / 1.98 / 4.01.
- [D] Mode A*: F0bw a1 → 2.0 (the widened bound, so it binds again), cexp
  0.589: 2.59°, CV 2.60°, monotone 0–10k, kD 0.25–0.61. F10rn cHi → −1 (lift
  falls to zero by S ≈ 0.6), a1 0.995: 1.99°, CV 2.08°, monotone 0–10k, oracles
  pass, Padjen land −11.40° / carry +11.7 %, kL up to 7.08 (LPGA PW), tailwind
  carry-response error 20.6 yd. F11 Sp 0.366, n → 3 (sharp peak), a1 → 2:
  2.26°, CV 2.27°, NOT monotone (28 falls 0–10k), apex −31.7 % at 7,800 ft
  (fails app oracle 2), driver hang 8.91 s.
- [D] The tour-shaped residual persists in all three: PGA Hybrid −4.1 / −5.3 /
  −6.3, LPGA PW +4.3 / +4.3 / +2.7 (F10rn / F11 / F0bw).

## Status (2026-10-09)

- Deliverable model-fits.md sections 1–7 complete. Harness check re-run after
  all edits (`node docs/research/land-angle-spike/harness/check-f0.mjs`): still
  max |harness − BRIEF| 0.050°, |harness − app| 5.1e-13°, 5,280 ft −5.3542°.
- Family F3b was defined early but never run; removed from laws.mjs.
