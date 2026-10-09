# Notes — plan coverage review

Scratch dir: /tmp/claude-1000/plan-review-coverage/

## Inputs read
- Plan read in full (606 lines); spec read in full (636 lines); SUMMARY.md read.
- Other plan reviewers (LEDGER.md): delivery covers Tasks 1/13/14 mechanics, browser covers Tasks 10-12 CDP/e2e feasibility. This review: coverage, seams, numbers, executability.
- physics.md.notes.md:23 — reviewer Newton: start (1,1), FD eps 1e-4, tol 1e-4 yd, 3 iterations, 10 flights/row (dt 0.01).
- secperf.md:88 / notes:74 — dt 0.05: 96-139 steps per flight.
## Atmosphere (script /tmp/claude-1000/plan-review-coverage/atm.mjs, Node 22.22.2)
- RHO0 = 1.18391248 (plan 1.18391 ±1e-5 OK). EXP = gM/(R*L) = 5.2558761; 1/EXP = 0.19026324; L/T0 = 2.25576956e-5.
- USSA table checks (plan Task 3 list): all 8 pass `table <= computed/100 < table+0.01`, both with derived and with literal constants.
- 5,280 ft = 834.317691 hPa (plan 834.318 ±0.001 OK). Ratios 5k/10k/15k = 0.8320854/0.6878324/0.5645873 (plan ±1e-6 OK both variants).
- MIN_PRESSURE_PA = 57206.8083 (derived) / 57206.8023 (literal) — plan 57206.8 ±0.1 OK both.
- ROUND TRIP: derived constants (inverse is exact algebraic inverse) err <= 3e-12 m. LITERAL spec constants (fwd 2.25577e-5 & 5.255876; inv 288.15/0.0065 & 0.190263) err up to -4.59e-3 m at 4572 m, -1.69e-3 at 1609 m, -1.07e-6 at 1 m -> plan Task 3 round-trip test (±1e-6 m) FAILS with the literal constants the plan's Behaviour text and spec §5.1 print.
- 5,280 ft: inHg 24.6374 -> "24.64"; kPa 83.4318 -> "83.43"; mbar 834.3177 -> "834.3"; ratio 0.8234075 (plan 0.823408 ±1e-6 OK).
- P0 = 29.9213 inHg -> "29.92". MIN_P = 16.8932 inHg -> displays "16.89" = 57196.1 Pa < MIN_P (out of range); 101.325 kPa displays "101.33" = 101330 > P0 (out of range); mbar "1,013.3" > P0. Boundary display strings re-typed are invalid while typing (clamp on commit).
## Flight (fl.mjs; implementation /tmp/claude-1000/plan-review-coverage/m.mjs, RK4 dt 0.05, plan's apex/landing rules, airPath as 6th RK4 state)
- Vacuum 50 m/s 30°: carry 220.7750363, apex 31.8661317, land 30.000000000 — equals analytic; plan values ±1e-6 OK.
- Vacuum + wind 10 m/s: carry/apex/land bit-identical, BUT landSpinRadS 241.25 vs 252.33 and airPathM 232.49 vs 184.60 differ (spin decay uses U=|v-w| and is not scaled by kD). "identical results" only holds for carry/maxHeight/land.
- Zero spin: kL 1 vs 5 results JSON-identical (Math.pow(0,0.4)=0). OK.
- rpmToRadPerS(2545) = 266.5117768 (plan 266.51178 ±1e-5 OK). S = 0.074382 (plan 0.07438 ±1e-5 OK).
- dt 0.05 vs 0.025 (kD=kL=1 PGA Driver): carry 2.6e-7 yd, apex 3.1e-7 yd, land 3.1e-4° — passes plan bounds. Steps 152 / 303.
- Spin law ln(w0/wland) = λ0 r airPath / R: rel err -7.0e-7 (rho 1), -6.5e-7 (rho 0.5) with airPath linear-interpolated at landing like ω; worst over 23 rows × {1,0.8,0.5,0.5646} uncalibrated = 1.05e-6 (exceeds 1e-6). With airPath taken at step end (not interpolated): -3.9e-3 / -2.1e-3 -> FAILS. Plan does not say how airPathM is integrated/interpolated.
- Tailwind 10 mph 273.69 m > calm 256.12 > headwind 234.69 OK.
- rhoRatio NaN -> nonfinite at step 1 OK.
- kL 1000 -> {ok:false, reason:'nonfinite', steps:2} (RK4 unstable: lift radius ~0.29 m, U/R·dt ≫ 2.8) — NOT 'cap' as plan Task 4 asserts. kL 100 / 50 -> cap at 1201 steps; kL 20/10/5 land (795/509/299 steps).
- Vacuum lob 1000 mph 60°, kD=kL=0, rhoRatio 0 -> cap, 1201 steps (deterministic alternative).
- Summing 0.05 1200 times = 59.99999999999873 (not > 60) -> cap fires at step 1201 with t accumulated; with t = steps*dt also 1201. "steps ≤ 1201" OK.
## Calibration + budgets + golden (cal.mjs)
- All 23 rows: ok, 3 iterations, 10 flights; residual ≤ 2.9e-5 yd. ρ0kD 1.0893–1.4982, ρ0kL 0.9622–1.3190; Jacobian cond 2.74–8.92.
- PGA Driver ρ0kD 1.0893, ρ0kL 0.9912 (plan ±0.002 OK); landing/launch spin 0.7774 (plan 0.777 ±0.005 OK).
- Total calibration steps 29,291 (≤ 50,000 OK). Recompute steps: 5k 2,736; 10k 2,609; 15k 2,449 (≤ 4,000 OK). Max steps/flight 139 (PGA Driver near SL).
- PGA Driver steps: kD=kL=1 152 (rho 1) / 130 (0.564587); calibrated 139 / 117 — "≤ 160" OK either way.
- Golden: all 30 values within 0.0048 of plan table (tol 0.05) OK.
- Land residual (model SL − table): PGA 1.05..9.16 shallower, LPGA Dr..7i 1.10..5.61, LPGA 8i −0.25, 9i −0.44, PW +0.68 — matches spec §5.5 item 2.
## Oracles (orc.mjs)
- O1 +8.82 %, O2 −15.60 %, O3 −7.93°, O4 +6.42 %, O5 mean 10.77 % (8.30–12.75), O6 +11.32 %, O7 Dr 7.55 / 7i 11.32 / PW 10.66 ordering true, O8a 8.88 %, O8b 6.04 %, O11 4.51 vs 6.42 true, O9a 0 violations (250 ft grid), O9b displayed carry 0 violations at 10 ft (11,523 flights) and 500 ft grids.
- O10 PGA land 46.23 (gap −1.77), LPGA 44.50 (gap −1.10) — plan orientation values 46.2/44.5 OK. Calibrations of 2014 shots converge in 3 iterations.
- O12 all eight within ±5 yd / ±3° (worst carry −3.63 PGA HW20, worst land −1.95 PGA HW10).
- LPGA 3-wood unrounded carry peak 14,450 ft (+18.343 yd), drop to 15k 0.027 yd; LPGA 4 Iron peak 14,730 ft, drop 0.005 yd. Displayed integers unchanged.
## Misc checks
- Calibrated PGA Driver spin law rel err: −9.6e-7 (ρ 1, θ 0.554), −8.9e-7 (ρ 0.5) — under 1e-6 by 4–11 %.
- Percent cases (misc.mjs): 8.036/164 → 4.8999999999999995 → "+4.9%"; −0.04/164 → "±0.0%"; −3.78/39 → "−9.7%"; −1.25 exactly representable for 200/−2.5, 164/−2.05, 80/−1 … → "−1.3%" (half away). OK.
- present absolute: 172/157, 32/29, 210/192, 47, 51 — all plan expectations OK (Math.round).
- (101.325).toFixed(2) = "101.33" in Node 22; (1013.25).toFixed(1) = "1013.3"; (16.8932).toFixed(2) = "16.89".
- Unreachable calibration (1000 yd / 1 yd): ok:false 'diverged' after 5 iterations, 15 flights, 6 ms (my impl returns diverged when 8 halvings fail; plan silent on that case).
- Pressure round trip (display → retype → commit), 0–15,000 ft every 10 ft, 3 units: worst displayed change 7 ft (11,760 ft, inHg) — plan bound 15 ft OK.
- Node 22.22.2 `node --test "test/unit/*.test.js"` expands the glob itself and skips test/unit/helper.js (globtest/) — glob is a valid substitute for the spec's explicit list.
- TrackMan PGA image (viewed /tmp/claude-1000/review-physics/dl-img/pga.jpg, data only): attack/launch/land cells print a degree sign (-0.9°, 10.4°, 39°); headers carry unit sub-lines "(mph)", "(deg)", "(yards/meters)". Plan's launchCells format matches.
- arrow.mjs: calibrated PGA Driver carry Δ at 10 ft = 0.0384 yd → `282/258` unchanged (pct 0.0); first displayed change at 140 ft (283/258). 5,280 → 5,290 ft: Δ 18.1124 → 18.1419, `300/275` and 6.4 % both unchanged. So one ArrowRight never changes the carry value; from 0 ft only the delta line un-hides (`±0/±0`).
- Plan Task 10 DOM contract lacks hooks Task 12 uses: pinned row, control bar, footer version element, Land Angle header/footnote (Task 10 "Produces" list vs Task 12 RF-4/sticky/smoke).
- delivery.md:121 (D7 fix): tag step `if: always()` + confirm via `git ls-remote --tags origin`. Plan Task 13 has neither; deploy job if lacks status function.
- Reference release.yml (/home/jhoblitt/github/conventions-claude/.github/workflows/release.yml): `npx --yes --package …@exact …`, node-version 22, no test job, no tag output.
- Hard-oracle margins: O1 8.82 in 5..12; O2 −15.6 in −8..−28; O3 −7.93 in −5..−13; O6 11.32 in 7..16; O10a gap −1.77 (±3, closest); O10b −1.10.

## Status
- Review complete 2026-10-08: findings K1–K18 written to coverage.md (3 major, 9 minor, 6 nit). Scripts: m.mjs atm.mjs fl.mjs cal.mjs orc.mjs misc.mjs unreach.mjs arrow.mjs globtest/.
