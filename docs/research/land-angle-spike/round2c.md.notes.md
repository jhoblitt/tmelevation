# round2c notes (probe 2, R2c)

Verified facts, appended as verified: claim, source or command, date,
primary/secondary/derived. Commands from the worktree root
`/home/jhoblitt/github/tmelevation/.claude/worktrees/land-angle-spike`, Node
v22.22.2, sandboxed.

## Inputs verified (2026-10-09)

- [S] User ruling: the PGA TOUR on-site radar driver gains are a HARD check
  for drivers up to 7,746 ft only; irons and above 7,746 ft stay soft.
  BRIEF.md:244-264.
- [S, re-verified against altitude-evidence.md:67-75 and
  altitude-evidence.md.notes.md:26-37, 87-88] Player-matched event − own
  season (excluding event), PGA TOUR radar tee shots, carry to ground impact:
  | event | ρ/ρ25 | Δcarry yd ± SE (%) | Δball mph | Δlaunch ° | Δspin rpm | Δapex ft | Δhang s |
  | Mexico 2017 (Chapultepec 7,746 ft) | 0.783 | +21.86 ± 0.96 (+7.8) | +0.00 | +3.13 | +369 | +23.8 | −1.46 |
  | Mexico 2018 | 0.775 | +21.53 ± 1.24 (+7.7) | +0.07 | +3.03 | +404 | +15.1 | −1.16 |
  | Mexico 2019 | 0.776 | +19.02 ± 1.78 (+6.7) | +1.69 | +0.90 | +353 | +7.5 | −0.08 |
  | Mexico 2020 | 0.780 | +16.19 ± 2.75 (+5.7) | +2.35 | +1.24 | +138 | +2.4 | −0.68 |
  | BMW 2024 (Castle Pines 6,234 ft) | 0.804 | +27.51 ± 0.94 (+9.5) | +1.45 | +1.23 | −21 | −11.1 (−10.5 %) | n/a |
  | Barracuda 2024 (Old Greenwood 5,843 ft) | 0.812 | +23.03 ± 1.25 (+8.1) | +1.79 | +1.89 | −16 | −5.9 (−5.8 %) | n/a |
  | Control Mexico Open 2024 (Vidanta 56 ft) | 0.994 | −3.30 ± 0.43 (−1.1) | +0.02 | −0.25 | +83 | +0.5 | — |
- [S] Season comparison air ≈ 0.99 (2022-23 0.992); density is moist air vs
  dry 25 °C sea level; event temperatures 18–28 °C. altitude-evidence.md.notes.md:25-29.
- [S] Low-altitude trend (40 events 2022-23): Δcarry = 148.81 − 150.06·ρ yd
  (rms 2.90); launch-adjusted 107.58 − 108.60·ρ (rms 2.40). Extrapolated: BMW
  +28.2 vs +27.5; Barracuda +27.0 vs +23.0; Mexico +31.4…+32.4 vs +16.2…+21.9
  (adjusted +22.3…+23.0 vs +8.0…+12.6). Launch-adjusted gains: Mexico +11.9 /
  +11.7 / +12.6 / +8.0 yd, BMW +21.3, Barracuda +14.2 (regression slopes 1.83
  yd/mph, 2.95 yd/°, 0.0019 yd/rpm, a lower bracket). altitude-evidence.md.notes.md:40-45, 62-71.

## Harness additions (2026-10-09)

- core.mjs `fly(..., { dt, diag, groundM = 0 })`: optional landing height
  relative to the launch point (positive = landing area above the tee); the
  crossing is taken on the descending branch only (`state[1] >= groundM`);
  default 0 = launch plane, unchanged. check-f0 after the change: 0.050° /
  5.1e-13° / −5.3542° — passes.
- driver-events.mjs (new), terrain-sens.mjs (new).

## Event scoring (2026-10-09, derived)

Command: `node docs/research/land-angle-spike/harness/driver-events.mjs F0 R0 R1 R2 R3`
(log harness/out/driver-events.txt). Season baseline: 2022-23 radar launch
172.85 mph / 10.49° / 2571 rpm at ρ 0.992; (a) event density at the season
launch; (b) event density with the measured Δball / Δlaunch / Δspin. Variants:
G (mode-G global law), Aapp (A* shape, kD/kL from the app's PGA Driver row,
171 / 10.4 / 2545 → 282 / 35 yd at ρ 1), Araw (A* shape calibrated to 283.8 /
34.0 yd at 0.992). Band: |pred − measured| ≤ 2·SE + 3.3 yd (control bias).
- [D] Castle Pines (measured +27.5 ± 0.9), pred (a) / (b): F0 G 23.9 / 30.0,
  F0 Aapp 20.3 / 28.8, F0 Araw 18.7 / 27.8, R0 G 20.9 / 30.2, R0 Aapp 23.8 /
  32.0, R0 Araw 21.9 / 30.8, R1 G 18.6 / 27.9, R1 Aapp 19.5 / 25.5, R1 Araw
  18.5 / 25.3, R2 G 17.5 / 26.1, R2 Aapp 16.8 / 22.1, R2 Araw 16.2 / 22.4, R3 G
  18.4 / 27.4, R3 Aapp 16.9 / 22.2, R3 Araw 16.2 / 22.4.
- [D] Old Greenwood (measured +23.0 ± 1.3), (a) / (b): F0 G 22.9 / 31.0, F0
  Aapp 19.5 / 31.0, F0 Araw 18.0 / 30.4, R0 G 20.1 / 32.9, R0 Aapp 22.9 / 34.0,
  R0 Araw 21.1 / 33.3, R1 G 18.0 / 30.6, R1 Aapp 18.8 / 26.4, R1 Araw 17.8 /
  26.7, R2 G 16.9 / 28.4, R2 Aapp 16.3 / 22.6, R2 Araw 15.7 / 23.4, R3 G 17.7 /
  29.9, R3 Aapp 16.3 / 22.8, R3 Araw 15.7 / 23.5.
- [D] Chapultepec 2017 / 2018 / 2019 / 2020 (measured +21.9 / +21.5 / +19.0 /
  +16.2), (a) range and (b): F0 G 26.6–27.6, (b) 36.6 / 38.0 / 36.4 / 36.4;
  F0 Araw 20.6–21.3, (b) 38.1 / 39.4 / 34.5 / 34.7; R0 Aapp 26.3–27.2, (b)
  40.3 / 41.7 / 39.3 / 39.5; R0 Araw 24.1–24.9, (b) 40.5 / 41.8 / 38.2 / 38.3;
  R1 Araw 20.1–20.6, (b) 26.2 / 27.1 / 27.5 / 29.7; R2 G 18.9–19.4, (b) 29.3 /
  30.1 / 29.3 / 31.3; R2 Araw 17.5–17.9, (b) 17.4 / 17.7 / 21.0 / 25.0; R3 Araw
  17.4–17.9, (b) 18.3 / 18.8 / 21.4 / 25.1.
- [D] Control (Vidanta ρ 0.994, measured −3.3 ± 0.4): every variant −0.1…−0.3
  yd (a) and (b).
- [D] Apex change (ft), measured vs (a) / (b): Castle Pines −11.1 vs −10.1…−12.0
  / +2.1…+3.3; Old Greenwood −5.9 vs −9.6…−11.4 / +9.9…+10.9; Mexico 2017
  +23.8 vs −11.5…−13.5 / +24.7…+28.9; 2018 +15.1 vs −12.0…−14.1 / +23.9…+28.3;
  2019 +7.5 vs −11.9…−14.1 / +4.2…+7.5; 2020 +2.4 vs −11.7…−13.8 / +5.0…+6.9.
  2024 apex supports (a); Mexico apex supports (b), for every law.
- [D] Model low-altitude slope at fixed launch (LS over ρ 0.906, 0.923, 0.977,
  1.048, 1.062): 1.02–1.32 yd per 0.01 ρ (measured raw 1.50, launch-adjusted
  1.09). Model's own curvature at ρ 0.779 (linear extrapolation − prediction):
  F0 −0.6…1.0 yd, R0 1.3–1.5, R1 2.6–3.0, R2 3.3–3.8, R3 3.0–3.7 (measured 10–15
  vs the measured line).
- [D] Pass matrix (within band): 2024 pair passes under (a) for F0 G and R0
  Aapp only; under (b) for R1 Aapp, R1 Araw, R2 G, R2 Araw, R3 Araw. All six
  events: none under (a); R2 Araw only under (b) (R3 Araw misses Mexico 2020
  by 0.2 yd; R3 Aapp misses Castle Pines by 0.1 yd).

## Terrain (2026-10-09, derived)

- [D] Hang-time-implied landing height at Mexico (Araw, (b) flight, solving
  model hang = season hang + measured Δhang): 2017 +94…+105 ft above tee, 2018
  +77…+95 ft, 2019 −12…+19 ft, 2020 +31…+45 ft; that terrain would cost −13…−62
  yd of carry (2017–18: −30…−62), more than the measured gain itself — so the
  2017–18 hang-time drops cannot be landing terrain under any law.
- [D] Command `node docs/research/land-angle-spike/harness/terrain-sens.mjs F0 R0 R1 R2 R3`:
  carry per foot of landing height 0.42–0.44 yd/ft (season air), 0.48–0.55
  (Castle Pines air), 0.48–0.57 (Chapultepec air); landing angles 30.5–38.4°.
  A 10 yd discrepancy ↔ ~18–24 ft of mean landing height difference (event vs
  season).
- [D] (b) flat prediction + hang-implied terrain effect, Mexico 2019 / 2020
  (measured +19.0 ± 1.8 / +16.2 ± 2.8; arithmetic on the driver-events log):
  F0 Araw 34.5 − 6.4 = 28.1 / 34.7 − 24.6 = 10.1; R0 Araw 38.2 − 9.4 = 28.8 /
  38.3 − 25.0 = 13.3; R1 Araw 27.5 − 2.8 = 24.7 / 29.7 − 18.3 = 11.4; R2 Araw
  21.0 + 4.4 = 25.4 / 25.0 − 13.4 = 11.6; R3 Araw 21.4 + 4.1 = 25.5 / 25.1 −
  13.5 = 11.6. Within band (±6.9 / ±8.8): 2019 R1, R2, R3 yes, F0 (+9.1), R0
  (+9.8) no; 2020 all yes.

## Status (2026-10-09)

- round2c.md sections 1–6 complete. Final `node docs/research/land-angle-spike/harness/check-f0.mjs`
  → 0.050° / 5.1e-13° / −5.3542° — passes.
- Assumptions: all events share the 2022-23 season launch and ρ 0.992 as
  baseline (Mexico 2017–2020 seasons not used separately); 25 °C viscosity for
  Re at every event (event temperatures 18–28 °C); the pass criterion
  (2·SE + 3.3 yd) is mine, not the user's.
- Not verified: hole geometry / landing elevations at any event; why the
  2017–18 Mexico hang times drop 1.2–1.5 s.
