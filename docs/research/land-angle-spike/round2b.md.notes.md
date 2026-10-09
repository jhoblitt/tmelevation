# round2b notes (probe 2, R2b-2)

Verified facts, appended as verified: claim, source or command, date,
primary/secondary/derived. Commands from the worktree root
`/home/jhoblitt/github/tmelevation/.claude/worktrees/land-angle-spike`, Node
v22.22.2, sandboxed.

## Inputs verified (2026-10-09)

- [S] User ruling: every app altitude oracle (1, 2, 3, 6, 9a) is soft in the
  spike; report all, pass/fail on none; oracle 6 (PGA 7-iron +7–16 % at 6,400
  ft; Scheffler and McIlroy planned +12–14 %) prominently. BRIEF.md:201-212.
- [S] R2b-2 tasks: re-rank R0–R3 (both modes) and F0 with altitude soft, per-row
  carry turnover up to 15,000 ft; raw radar driver at density 0.992, (a)
  unfitted, (b) calibrated to raw carry 283.8 yd and apex 34.0 yd; hang time
  and apex position vs 6.4 s and 65.5 % (186.0 yd); bound the average-of-shots
  effect. BRIEF.md:226-240.
- [S, re-verified] PGA TOUR 2022-23 radar row: club 115.08, ball 172.85 mph,
  launch 10.49°, spin 2571 rpm, apex 34.0 yd, hang 6.4 s, carry 283.8 yd
  (ground impact), attempts 113,979 carry / 121,740 apex. provenance.md:441;
  distance to apex 186.0 yd → 65.5 % of carry, provenance.md:460-464; spin
  2570.6 and apex 102'1" in provenance.md.notes.md:131; distance to apex
  attempts 121,740, provenance.md.notes.md:134. Carry and hang time run to
  ground impact, apex relative to the tee (provenance.md:430-433).
- [S] Venue air: PGA TOUR 40 events equal weight, mean density ratio 0.992
  (SD 0.033, range 0.906–1.062); LPGA 0.994. conditions.md:31-32.

## Carry turnover (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/turnover.mjs F0:G F0:A R0:G R0:A R1:G R1:A R2:G R2:A R3:G R3:A`
(first local maximum of carry vs elevation at 25 °C, 100 ft grid to 15,000 ft;
decrease threshold 1e-4 yd; mode A uses the A* shape with per-row kD, kL at sea
level; JSON from round 1 / round 2 fits).
- [D] Rows turning over below 15,000 ft / lowest / below 10,000 ft:
  F0 G 2 / 13,600 (LPGA 3-wood) / none; F0 A 2 / 14,500 (LPGA 3-wood) / none;
  R0 G 7 / 8,400 (LPGA 3-wood) / LPGA 3-wood only; R0 A 7 / 13,400 / none;
  R1 G 16 / 5,300 / 6 rows (LPGA Driver 7,900, 3-wood 5,300, 5-wood 8,900,
  Hybrid 9,900, 4 Iron 8,300, 5 Iron 8,600); R1 A* 22 / 6,200 / 12 rows;
  R2 G 19 / 4,600 / 8 rows (LPGA Driver 6,900, 3-wood 4,600, 5-wood 8,200,
  Hybrid 8,700, 4 Iron 6,800, 5 Iron 6,200, 6 Iron 7,400, 7 Iron 7,900);
  R2 A* 22 / 600 (LPGA 5 Iron) / 19 rows; R3 G 17 / 5,200 / 6 rows; R3 A* 23 /
  2,400 (LPGA 5 Iron) / 20 rows.
- [D] LPGA irons (4–PW) turnover, ft (— = rises to 15,000): F0 G 14,800 / — /
  — / — / — / — / —; F0 A 14,700 / — ×6; R0 G 14,300 / — ×6; R0 A 13,700 / — ×6;
  R1 G 8,300 / 8,600 / 11,400 / 12,300 / — / — / —; R1 A* 6,200 / 6,200 / 7,400
  / 8,100 / 9,000 / 8,700 / —; R2 G 6,800 / 6,200 / 7,400 / 7,900 / 10,500 / —
  / —; R2 A* 2,400 / 600 / 2,100 / 4,800 / 8,000 / 8,800 / —; R3 G 8,000 /
  8,100 / 10,200 / 11,000 / — / — / —; R3 A* 3,000 / 2,400 / 3,700 / 4,800 /
  6,200 / 5,900 / 6,600.
- [D] Carry change at 15,000 ft for LPGA 5 Iron: F0 G +9.4 %, R0 G +13.3 %,
  R1 G +2.1 %, R2 G −4.7 %, R3 G +0.4 %, R2 A* −23.8 %, R3 A* −20.8 %.

## Re-rank with altitude soft (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/rerank.mjs F0 R0 R1 R2 R3`
(fit statistics and altitude values from harness/out/<F>.json; weighted cost
= 23 × Σ(RMS/weight)²).
- [D] Mode G by weighted cost: R2 338 (5.39 / 2.04 / 2.73; CV 5.88 / 2.12 /
  2.81), R3 385 (6.08 / 1.99 / 2.81; CV 6.49 / 2.07 / 2.93), R0 473 (6.39 /
  2.04 / 3.73; CV 6.69 / 2.10 / 3.78), R1 496 (7.33 / 2.02 / 3.02; CV 7.68 /
  2.07 / 3.09), F0 622 (7.58 / 2.19 / 4.21; CV 8.12 / 2.24 / 4.25).
  Oracle 6 (PGA 7i carry % at 6,400 ft): R2 10.8, R3 11.0, R0 13.1, R1 12.0,
  F0 11.6. Oracle 1 / 2 / 3 at 7,800 ft (Dr carry % / apex % / land °): R2
  7.1 / −15.4 / −6.35; R3 7.6 / −15.4 / −6.90; R0 9.1 / −14.9 / −8.11; R1 7.6
  / −15.4 / −7.10; F0 11.9 / −13.1 / −7.75. 9a falls 0–10k: 94 / 50 / 6 / 44
  / 0.
- [D] Mode A by land RMS: R3 1.62 (CV 1.79), R1 1.67 (1.79), R2 2.27 (2.39),
  R0 3.96 (—, nothing fitted beyond kD, kL), F0 4.65 (—). Oracle 6: R3 6.0,
  R1 8.7, R2 7.8, R0 11.7, F0 11.3. Oracle 1 / 2 / 3: R3 6.8 / −15.5 / −4.55;
  R1 8.2 / −15.4 / −5.98; R2 6.8 / −15.4 / −4.45; R0 10.3 / −15.2 / −8.46; F0
  8.8 / −15.6 / −7.93. 9a falls: 291 / 90 / 287 / 0 / 0.

## Raw PGA TOUR radar driver (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/raw-driver.mjs F0 R0 R1 R2 R3`
(log harness/out/raw-driver.txt). Launch 172.85 mph / 10.49° / 2571 rpm,
density 0.992, diagnostic flights dt 0.005 s; (a1) nominal (F0 kD = kL = 1;
R nominal surface), (a2) mode-G global fit, (bG/bA) per-row kD, kL calibrated
at 0.992 to carry 283.8 yd and apex 34.0 yd with the G / A* shape.
- [D] (a1) carry / apex / hang / apex %: today's law 284.5 / 43.3 / 7.67 s /
  66.4 %; measured surface (R0–R3 identical, the driver stays above the band)
  281.4 / 29.2 / 6.38 s / 64.1 %.
- [D] (a2): F0 259.4 / 37.3 / 7.04 / 66.6; R0 282.5 / 32.8 / 6.81 / 65.2; R1
  290.3 / 32.8 / 6.82 / 64.8; R2 289.0 / 32.5 / 6.79 / 64.9; R3 289.4 / 32.7 /
  6.82 / 64.9.
- [D] (b) calibrated, hang (vs 6.4) / apex % (vs 65.5) / apex distance (vs
  186.0): F0 6.80 (+0.40) / 65.0 / 184.6 (kD 0.808, kL 0.813); R0 6.95 (+0.55)
  / 65.5 / 185.8 (1.009, 1.031); R1 6.92–6.95 / 65.6–65.7 / 186.2–186.6; R2
  6.90–6.93 / 65.9 / 186.9; R3 6.90–6.93 / 65.7–65.9 / 186.3–186.9.
- [D] Average-of-shots minus shot-of-averages at fixed calibration (5-point
  Gauss–Hermite per dimension, independent normal spreads; moderate SD 6 mph /
  2° / 500 rpm, wide 10 / 3 / 800): carry −2.3…−6.0 yd (F0) to −7.2…−14.5 yd
  (R2, R3); apex ±0.2 yd; hang −0.06…−0.34 s; ratio-of-means apex % −0.14…+0.96.
- [D] Spread-calibrated (kD, kL set so the spread MEANS of carry and apex equal
  283.8 / 34.0): mean hang / ratio-of-means apex %: F0 6.76 / 64.9 (moderate),
  6.69 / 64.7 (wide); R0 6.89 / 65.3, 6.80 / 65.0; R1 6.85 / 65.8, 6.75 /
  65.5; R2 6.78 / 66.0, 6.66 / 65.7; R3 6.78 / 66.0, 6.66 / 65.7. Hang excess
  +0.26…+0.49 s in every case.
- [D] Spreads are assumptions, not measurements (PGA TOUR publishes means
  only; "Par 4 and Par 5 tee shots" may include non-driver clubs).

## Status (2026-10-09)

- round2b.md sections 1–6 complete. New harness scripts only (turnover.mjs,
  rerank.mjs, raw-driver.mjs; logs harness/out/turnover.txt, raw-driver.txt);
  no existing module changed this round. `node docs/research/land-angle-spike/harness/check-f0.mjs`
  → 0.050° / 5.1e-13° / −5.3542° — passes.
- Not refitted: all fits are rounds 1 and 2 (out/<F>.json). Launch spreads in
  §5 are assumptions; hang time published to 0.1 s (±0.05 rounding).
