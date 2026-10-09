# Notes — physics review of 2026-10-08 spec

Each entry: fact, source (file:line / URL / script output).

## Spec facts read (2026-10-08 spec, file docs/superpowers/specs/2026-10-08-tmelevation-design.md)

- 5.1 (l.141-146): T held at 25 C, RH held at 50 % at every elevation; "Consequence used by the model: density ratio = P/P0".
- 5.2 (l.153-171): k = rho A/(2m), but NO absolute rho0 value or density formula is given anywhere in section 5.
- 5.3 (l.184-186): expected k_D 0.89-1.22, k_L 0.79-1.08 "from the research probe"; test: envelope.
- 5.5 item 2 (l.210-211): "model lands 1-9 deg shallower than TrackMan's table".
- 8.1 model (l.299-300): monotone carry up / height down / land down "from 0 to 15,000 ft" for every row.
- 8.3 oracle 9 (l.333): monotone 0 -> 10,000 ft (hard). Oracle 10 (l.334): carry +-4 yd, height +-3 yd hard; land soft.

## Research-probe facts (NOT verified, claims under test)

- aero-model.md:301-305 and notes:136: probe used rho_SL = 1.225 kg/m3 (15 C), dt = 1 ms (not 0.01 s), ratio = P/P0.
- aero-model.md.notes.md:200-202: whole-table k_D 0.89-1.22, k_L 0.79-1.08; land residuals PGA Dr -1.1 ... Hy -9.2 ... LPGA PW +0.7.
- aero-model.md.notes.md:218-221: calibrated at 1.184 vs 1.225 -> k rescale (0.889 -> 0.920), deltas identical.
- atmosphere.md:378-384: ratio at 5,000 ft 0.8320 dry / 0.8310 at 50 % RH (25 C); baseline rho 1.1773 (CIPM 25 C 50 % RH), 1.1839 dry.
- atmosphere.md:400-401: 15,000 ft ratio 0.565 dry / 0.562 at 50 % RH.
## Reproduction (script /tmp/claude-1000/review-physics/run_cal.mjs, model.mjs; Node v22.22.2)

- All 23 rows converge: damped Newton from (1,1), FD eps 1e-4, tol 1e-4 yd: 3 iterations, 10 flights per row, 230 flights total. Jacobian cond 3.2-8.9.
- rho0 = 1.225 (15 C, what the research probe used): kD 0.889-1.223, kL 0.785-1.077 -> reproduces aero-model.md:211 exactly.
- rho0 = 1.1773 (25 C 50 % RH, CIPM value from atmosphere.md:384, i.e. the spec's stated reference): kD 0.925-1.273 (LPGA 8 Iron 1.2725), kL 0.817-1.120 (LPGA PW 1.1204). Outside the spec's 5.3 envelope 0.89-1.22 / 0.79-1.08.
- Land residual (model - table) identical at both rho0 (as expected): PGA Dr -1.05, 3W -4.49, 5W -6.52, Hy -9.16, 3i -7.54, 4i -7.01, 5i -5.86, 6i -5.47, 7i -4.37, 8i -3.56, 9i -3.86, PW -3.35; LPGA Dr -1.52, 3W -1.10, 5W -4.68, Hy -5.61, 4i -3.96, 5i -4.85, 6i -4.23, 7i -2.58, 8i -0.25, 9i -0.44, PW +0.68. Reproduces aero notes:200-202.
  -> spec 5.5 item 2 "lands 1-9 deg shallower" is wrong for LPGA 8i (-0.25), 9i (-0.44), PW (+0.68 steeper).
- In-flight S ranges: PGA Dr 0.075-0.166; PGA 7i 0.29-0.75; PGA PW 0.45-1.07; LPGA PW 0.48-1.17. Landing spin 78-90 % of launch.
- Timing, naive array-allocating JS on this desktop: full calibration 97-98 ms; one 23-flight frame 9 ms.
- Timing, allocation-free scalar JS (fast.mjs), AMD Ryzen 9 7950X3D, Node 22: full calibration 48 ms warm / 55 ms cold / 170 ms --jitless; frame 4.4 ms (dt 0.01). dt 0.02: 24 ms / 2.2 ms. dt 0.05: 9.7 ms / 0.9 ms (fast_dt.mjs).
- dt accuracy (run_dt.mjs; worst over 23 rows vs dt=1e-4): dt 0.01 carry 3.7e-10 yd, apex 5.4e-10 yd, land 4.9e-5 deg; dt 0.05 carry 2.4e-7 yd, apex 3.4e-7 yd, land 1.1e-3 deg. Halving 0.01->0.005 changes carry 3.5e-10 yd. Spec's "about 3e-5 yd" (5.2) is 5 orders too pessimistic; harmless.
- Oracles (run_oracles.mjs, rho0 1.1773; identical at 1.225): O1 +8.82 % PASS; O2 -15.60 % PASS; O3 -7.93 deg PASS; O4 +6.42 % PASS; O5 mean 10.77 % (8.30-12.75) PASS; O6 +11.16 % PASS; O7 7i 11.16 / Dr 7.45 / PW 10.51 PASS; O8 7i 8.88 % PASS, Dr 6.04 % PASS; O9 0-10k monotone PASS; O11 LPGA 4.51 vs PGA 6.42 PASS.
- O10 PGA 6i: carry 188.43 vs 184 +-4 -> HARD FAIL (+4.43); height 33.16 PASS; land 45.14 (-2.86, inside soft band). LPGA 6i: 153.93 PASS, 27.44 PASS, 43.85 PASS.
- O10 robustness (run_o10.mjs): over the 2023 PGA 6i rounding box (carry 187.55-188.5 yd from yd+m, apex 31.5-32.26) O10 carry = 187.96..188.97; fails at the nominal integer targets the spec calibrates to.
- O10 was never evaluated by the research (no record in aero-model.md(.notes) or reference-data.md(.notes)).
- Calibrated directly to TrackMan's own 2014 6-iron model shot: land gap only -1.76 deg (PGA), -1.10 deg (LPGA) vs -5.47 / -4.23 for the 2023 table rows -> most of the table land-angle gap is not in the aero model.
- 8.1 monotonic carry 0-15,000 ft FAILS: LPGA 3-wood carry peaks at ratio 0.5775 (~14,437 ft), LPGA 4 Iron at 0.5705 (~14,741 ft); drop to 15k is 0.027 / 0.005 yd (displayed integers unchanged). LPGA Driver peaks at ~15,136 ft, PGA Hybrid ~15,470, LPGA 5-wood ~15,582, LPGA 5i ~15,739 (run_peak.mjs). Height and land monotone to 15k for all rows.
- Transcription check: both 1920x883 images downloaded to /tmp/claude-1000/review-physics/dl-img/ and read; all 23 rows x 9 columns match docs/research/trackman-2023-tour-averages.md (incl. LPGA 3-wood 2595 rpm, PGA 4 Iron 209/192).
- run_table.mjs: only yd/m mismatch is PGA 4 Iron (209/192 -> consistent interval 209.43-209.50 yd). Smash != ball/club beyond rounding for LPGA irons (e.g. PW 88/72 = 1.222 vs 1.25; max possible 88.5/71.5 = 1.238) -> columns are independently averaged, not one shot.
- run_land.mjs: alternative land mapping (scale model delta by (pub-launch)/(modelSL-launch), which has the right vacuum limit land -> launch) differs from additive "published + delta" by up to 3.37 deg at 10k (PGA Hybrid: displayed 38 vs 35), ~5 deg at 15k (-16.05 vs -21.02).
- run_land.mjs: PGA 6i calibrated to 2023 row: 10k dCarry 14.89 %, dLand -9.53; calibrated to TM 2014 shot (its own launch): 16.69 %, -9.04. LPGA: 11.02 % / -8.63 vs 13.23 % / -8.08.
- run_variants.mjs (k on 1.225 basis): spin decay unscaled -> PGA Dr 10k 9.9 % (vs 10.5), no decay 10.4 %; C_L saturating above S=0.3 -> deltas within 0.3 pp, kL up to 1.389; C_L linear -> PGA Dr 8.6 %, 7i 15.5 %, kL up to 2.08, 11 rows non-monotone to 15k; S&S sin(Re) -> fails O1 (12.94), O4, O5, O8a, O8b; Lyu crisis -> fails O5 (5.70), O6 (5.52), O9 (20 rows), land residual -5.2..+5.3.
- Mutants: S with D instead of r -> passes every hard oracle (except O10 like baseline), kL 0.58-0.80 (only envelope catches); C_L exponent 2.4 -> calibration throws (caught); rho on drag only / lift only / ft read as m -> caught by many oracles; ISA lapse density -> passes all hard oracles; decay with absolute rho -> passes all; rpm not converted -> only O8a (10.32 > 10) + envelope.
- Baseline at 1.225 basis: kD max 1.2230 > the spec's printed 1.22 (rounded down).
- run_display.mjs: rho0 invariance of deltas 1.9e-5 (calibration tol); humid 50 % RH ratio vs P/P0 at 15k: 0.5620 vs 0.5646 -> max carry diff 0.179 yd (PGA 9i). Displayed integers never reverse 0-15k (5 ft steps). First non-zero absolute delta: carry 130-255 ft, height 760-2480 ft, land 485-860 ft. Abs "±0" with non-zero 1-dp percent in 4.5 % of samples.
- run_round.mjs: 10k carry delta shifts up to 0.17 yd for carry target +-0.5 yd, up to 0.85 yd (LPGA 3-wood) for apex target +-0.5 yd; yd∩m midpoint targets shift it up to 0.38 yd (PGA 4 Iron).
- TrackMan 2014 6-iron model images downloaded (dl-img2/) and read: PGA calm 130/14.7/6088 -> 184/33.8/48.0; HW10 166/38.1/58.1; HW20 143/42.8/69.5; TW10 198/29.7/39.5; TW20 207/26.1/32.7. LPGA calm 110/18.6/5950 -> 152/27.7/45.6; HW10 139/31.3/55.6; HW20 121/35.3/67.4; TW10 161/24.5/37.7; TW20 167/21.7/31.7. Matches reference-data.md.notes.md:95-96.
- run_tm2014.mjs: calibrated to the calm TM shot, land gap: Re-free -1.76 (PGA) / -1.10 (LPGA); S&S sin(Re) -3.29 / -2.14; Lyu crisis +4.24 / +3.94; C_L linear -3.41 / -1.97. Re-free is closest.
- run_wind.mjs (wind = constant horizontal, relative velocity in forces): Re-free model-minus-TM: PGA HW10 -2.1 yd / land -2.0, HW20 -3.6 / -1.7, TW10 +1.6 / -1.3, TW20 +3.6 / -0.9 (carry rms 2.9); LPGA rms 2.5, land -0.7..-1.2. Crisis: carry rms 1.4 / 1.7 but land +2.0..+8.1. S&S: rms 5.7 / 4.9. Re-free over-responds in carry: TW20 gain 26.6 vs TM 23 (+16 %), HW20 loss 44.6 vs 41 (+9 %).
- run_clsat.mjs: over all 23 rows, 10k carry gain: saturating C_L (S capped 0.3) vs baseline max 0.83 pp (PGA 4 Iron); C_L linear vs baseline max 2.05 pp (PGA 3-wood).
- STATUS 2026-10-08: review complete; physics.md has Summary, P1-P12, Reproduction results, Non-findings, Unverified concerns.
