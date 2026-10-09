# physics-lit review — findings log

Each entry: claim | source (DOI/URL + page/fig/eq) | primary or secondary | accessed.
All access dates 2026-10-08 unless stated.

## Lyu, Kensrud, Smith, Tosaya (2018), Proceedings 2(6):238, doi:10.3390/proceedings2060238 — PRIMARY read (PDF text + Fig 3 rendered)

- [V] 13 production models incl. Titleist Pro V1 and Pro V1x, TaylorMade TP5X, Srixon Z-Star XV, Callaway Chrome Soft
  (Table 1) — i.e. modern multi-layer urethane tour balls, not 1970s balata. Light gates in still air, 18–91 m/s, 1500–4500 rpm. (pp. 2–3)
- [V] Non-spinning: average C_D "near 0.5 at low speed (Re = 5 × 10^4), and close to 0.2 at higher speed (Re = 1 × 10^5)";
  largest ball-to-ball difference at Re < 7.5e4 (§3.1.1). Abstract: model-to-model C_D difference ">0.1" at Re < 1e5, "<0.05" above.
- [V] Spinning: "Balls were projected with 1500 to 2500 rpm spin ... A drag crisis similar to non-rotating balls was observed for
  the spinning balls." Fits over 50,000<Re<100,000 and 75,000<Re<200,000 (§3.1.2). Fig 3b (KK ball, spinning) read from the rendered
  figure: C_D ≈ 0.52 @ Re 5e4, ≈0.41 @ ~6.2e4, ≈0.26 @ ~7.8e4, ≈0.20 @ 1e5, ≈0.18–0.19 @ 1.5–2e5. Only ~4 points span the crisis.
- [D] At Re 5e4 the ball speed is ≈17.6 m/s (ν≈1.5e-5, D=42.67 mm); 1500–2500 rpm there is S = rω/V ≈ 0.19–0.32; at Re 1e5 S ≈ 0.10–0.16.
  So Lyu's "spinning" crisis is measured at S up to ≈0.3 — the crisis is NOT a non-spinning-only phenomenon up to S≈0.3.
  (The research's variant (iii) labels its ΔC_D "Lyu's non-spinning crisis"; the spinning fit shows the same magnitude.)
- [V] Lift measured only at 32–91 m/s "To avoid the influence of the reverse Magnus effect at low speed" (§3.2) — i.e. NO lift
  data in the crisis band; lift fit C_L(S) is a supercritical-only law.
- [V] Trajectory sim used "4% per second spin decay [21]" = Trackman Newsletter #7 p.7 (§3.3).
- Accessed 2026-10-08 (mdpi-res.com PDF).

## Li, Tsubokura, Tsunoda (2017), Flow Turb. Combust., doi:10.1007/s10494-017-9859-1 — PRIMARY read (Europe PMC full text XML, PMC6044256)

- [V] Spin parameter fixed at Γ = 0.1 for every rotating case ("chosen as the typical flying condition") (Methods). So this LES says
  nothing about S = 0.3–1.2.
- [V] Fig 4 discussion: B&H experiment at the same spin parameter (k/D 0.9e-2, 250 dimples) shows the crisis "around 5 × 10^4",
  vs Li's 392-dimple k/D 0.5e-2 ball near 8e4: "certainly caused by the different dimple geometry".
- [V] "At the critical Reynolds number ... the drag coefficient of the rotating golf ball drops when compared to the non-rotating
  golf ball" (Table 1: −19.0 % at Re 7.5e4), attributed to separation moving downstream on the side rotating against the flow, where
  "the local Reynolds number increases". I.e. spin moves the crisis to LOWER Re, even at Γ = 0.1. Li notes this disagrees with B&H.
- [V] Lift at Re 7.5e4 negative (C_l/C_d −0.43); golf-ball supercritical lift slightly LOWER than subcritical.
- [V] Davies (1949) dropped spinning balls; "negative Magnus effect was not reported for the golf balls" (Introduction).
- [V] Beratlis et al. 2012 (J. Turbul. 13:15) DNS rotating dimpled sphere: critical Re ≈ 5e4 (dimple depth 0.63e-2 D); negative
  Magnus in one critical case (as reported by Li, i.e. [S] for Beratlis).
- Accessed 2026-10-08.

## Aerodynamic patent US 8,197,361 B2 ("Low lift golf ball", Aero-X) — PRIMARY read of patent text only (figures not seen)

- [V] CL, CD derived from TrackMan Net System (3-radar) tracks of Golf Labs robot shots, regressed on Re, spin, DSP; "3,000-5,000 rpm"
  and Re "120,000-180,000"; B2 ball: spin ~3,400–3,500 rpm at Re ≈170,000 at launch, "about 2,900-3,200 rpm at Re ≈ 80,000" near
  the end of flight. Wind tunnel (FIGS 17–18) DSP 0.0–0.4: "As Re drops to the 60,000 range, the Pro V1® golf ball lift remains
  positive while the 173 golf ball becomes negative."
  => (a) a radar-tracked driver flight reaches Re ≈ 8e4 at the end; (b) low-Re lift reversal is DIMPLE-PATTERN specific; for a
  Pro V1 at DSP ≤0.4 the lift stays positive at Re ≈ 6e4. URL https://patents.google.com/patent/US8197361B2/en, accessed 2026-10-08.

## TrackMan definitions and table provenance — PRIMARY (TrackMan pages)

- [V] Landing Angle: "The angle the golf ball lands at relative to the horizon and at a point that has the same elevation as where
  it was launched." https://support.trackmangolf.com/hc/en-us/articles/39727190664859-Parameters-Landing-Angle-Tee-to-Green
  (created 2025-08-06, updated 2025-08-07).
- [V] Height (Apex): "The maximum Height or Apex of the trajectory measured relative to the elevation at which the golf ball was
  launched." https://support.trackmangolf.com/hc/en-us/articles/39726869324699-Parameters-Height-Apex (2025-08-06).
- [V] Carry: straight-line distance from launch to where the ball crosses a point at the same elevation; Hang Time: time "to carry
  flat". https://support.trackmangolf.com/hc/en-us/articles/5089892383515-Practice-Trackman-Data-Parameter-Definitions (updated 2025-11-27).
  => TrackMan's carry, max height and land angle are all referenced to the LAUNCH-ELEVATION plane — the spec's y = 0 launch and
  y = 0 landing match TrackMan's definitions. Terrain (uphill/downhill landing) cannot bias the table's land angle unless TrackMan
  fails to project; when the ball lands above launch elevation TrackMan must extrapolate below the landing point (model-dependent;
  the pages do not say how).
- [V] Tour-averages post (https://www.trackman.com/blog/introducing-updated-tour-averages): "Averages are based on data from
  competition as well as on the range"; men 40+ events / 200+ players, PGA TOUR and DP World Tour; "Official stat holes are picked
  going in opposite directions to reduce any effects from wind"; no statement on altitude/temperature normalization or on whether
  each column averages the same set of shots. The post is dated 2024-05-02 (per WebFetch) though the tables say 2023.

## TrackMan "Normalization feature explained" (2014-07-09) wind tables — PRIMARY (images read directly, Storyblok URLs)

- [V] PGA TOUR 6 iron, TrackMan model, 130 mph / 14.7° / 6088 rpm, constant wind "throughout the entire ball flight":
  Calm 184 yd / 33.8 yd / 48.0°; 10 mph HW 166 / 38.1 / 58.1; 20 HW 143 / 42.8 / 69.5; 10 TW 198 / 29.7 / 39.5; 20 TW 207 / 26.1 / 32.7.
  https://a.storyblok.com/f/117513/407x210/0ce2fd44b7/pga-tour-6-iron.png
- [V] LPGA Tour 6 iron, 110 mph / 18.6° / 5950 rpm: Calm 152 / 27.7 / 45.6; 10 HW 139 / 31.3 / 55.6; 20 HW 121 / 35.3 / 67.4;
  10 TW 161 / 24.5 / 37.7; 20 TW 167 / 21.7 / 31.7. https://a.storyblok.com/f/117513/410x208/acc893e2e4/lpga-tour-6-iron.png
- [V] Post text: "Every golf ball has its own aerodynamic model"; "Normalization assumes the golfer is using a 'premium' golf ball";
  defaults "77°F and sea level". https://www.trackman.com/blog/golf/normalization-feature-explained
  => Ten fully specified TrackMan-model trajectories, including perturbations that reduce (tailwind) and raise (headwind)
  air-relative speed: the only PRIMARY TrackMan-model data with launch conditions, apex and land angle together.

## Review probe results [D] — throwaway code /tmp/claude-1000/review-physics-lit/scripts/{fm,t1_wind,t2_cross}.py, outputs out_t1_wind.txt, out_t2_cross.txt

- Model A = spec model (C_D = kd(0.24+0.18S), C_L = kl·0.54·S^0.4, λ=2e-5·ρ/ρ0), RK4 dt 2 ms, wind as constant along-line air velocity.
- Calibrated to TrackMan's OWN model calm 6-iron (184/33.8): A lands 46.2° vs TrackMan 48.0° (−1.8°, PGA); LPGA 44.5° vs 45.6° (−1.1°).
  Against the 2023 TABLE 6-iron rows the same model is −5.5° (PGA, 44.5 vs 50) and −4.2° (LPGA, 41.8 vs 46).
- A calibrated to TrackMan's model shot, flown at the 2023 table's PGA 6-iron launch (130/14.0/6204): 183.7 yd / 32.7 yd / 45.7°
  vs table 188/32/50. LPGA (111/16.7/5904): 153.2/25.3/42.5 vs table 155/25/46. Same pattern with Lsat, Dlin, Dsh variants.
  => The table row is 4 yd longer, ~1 yd lower AND ~4° steeper than a TrackMan-model-like trajectory at the same launch — the
  opposite of what one trajectory does (longer + lower ⇒ flatter). ~2/3 of the 6-iron land-angle gap sits between the table and
  TrackMan's own model, not between the spec's physics and TrackMan's physics.
- Wind responses (TrackMan − calm) vs model A (calibrated to calm): PGA TW20 land −15.3 vs −14.4; HW20 +21.5 vs +21.6; TW20 carry
  +23 vs +26.6; HW20 −41 vs −44.6. LPGA similar. A matches TrackMan's land-angle RESPONSE within ~1°, over-responds in carry ~10–15 %.
  Crisis-everywhere variant C lands +4.0° (PGA) / +3.9° (LPGA) too STEEP vs TrackMan calm and over-responds in HW land angle by +4–6°.
  Spin-shifted crisis (Dsh) lands +0.3/+0.7° vs TrackMan calm. Lift saturating above S=0.3 (Lsat) best matches TrackMan's wind carry
  responses (TW20 +22.6 vs +23; HW20 −41.9 vs −41).
- [V, from the TrackMan wind table] Opposite-direction averaging does not cancel wind in second order: mean of (HW, TW) at 10 mph
  = land +0.8°, carry −2 yd, apex +0.1 yd vs calm; at 20 mph = land +3.1°, carry −9 yd, apex +0.65 yd (PGA 6-iron). LPGA: 10 mph
  land +1.05°, carry −2 yd; 20 mph +3.95°, −8 yd (corrected arithmetic: (67.4+31.7)/2 − 45.6; (121+167)/2 − 152).
- [D] t3_windavg.py (out_t3_windavg.txt): Gaussian along-line wind σ = 2 / 3 / 4.5 m/s over each row (model A as truth):
  averaged land angle steeper by +0.15–0.24° / +0.33–0.53° / +0.73–1.15°, carry shorter 0.4 / 1 / 2–2.5 yd, apex +≤0.17 yd.
  After re-calibrating k_D, k_L to the wind-averaged carry & apex, the model's land residual is only −0.1 / −0.2 / −0.45°.
  => wind convexity is real and has the right sign but explains ≤ ~0.5° of a 1–9° gap.
- [D] t4_table.py (out_t4_table.txt): whole-table sea-level land residuals reproduce the research exactly for model A
  (PGA Dr −1.1 … Hy −9.2 … PW −3.3; LPGA Dr −1.5 … PW +0.7). Variants (all calibrated to carry & apex):
  * Lsat (C_L capped above S 0.3) and Dlin (C_D = kd(0.22+0.35S)): residuals improve by ≤0.8° — lift/drag S-shape cannot close it.
  * SS (Smits sin Re term): residuals WORSE (−2.8 … −10.7); fails hard oracles 1, 4, 5, 8a, 8b (driver +13.8 % at 7,800 ft).
  * C (Lyu crisis added for all S): residuals mostly within ±2° (PGA Hy −5.0; LPGA 8i–PW +4–4.7), fails oracles 5, 6, 7.
  * Dsh (crisis evaluated at Re·(1+S)/1.2, i.e. spin shifts crisis lower): PASSES every hard oracle (1–6, 8); fails soft 7
    by 0.1 pt (PW 7.8 vs 7i 7.7 at 6,300 ft). 7i gain at 6,300 ft 7.7 % (A: 11.2 %); PGA mean at 7,200 ft 7.05 % (A: 10.8 %).
  * Efade (crisis only S ≤ 0.3, faded to 0 by 0.6): PASSES every hard oracle; fails soft 7 (PW 10.1 > 7i 8.5).
  => The spec's HARD oracles do not discriminate between the Re-free model and a spin-shifted-crisis model whose iron gains are
     ~30 % smaller. Only the soft ordering oracle and the central values of the player/TrackMan figures favour model A.
- [D] t5_penge.py (out_t5_penge.txt), PGA carry gain at 4,920 ft (ratio 0.8346): A Dr 6.0, woods 6.7–7.5, 3–5i 6.8–8.3, 6–9i 8.1–9.0,
  PW 8.3; Dsh Dr 4.2, woods 4.8–5.3, 6–9i 5.7–7.0, PW 6.5; Efade Dr 4.9, 6i 5.0, 7–9i 7.1–8.5, PW 8.2; C everything 2.8–5.5.
  Penge (DP World Tour 2026, secondary): woods 5, 6–9 irons 7.5, wedges 5 (his "wedges" may be 50–60°).
- [D] t6_padjen.py (out_t6_padjen.txt), table-driver (kd,kl) per variant, solve ball speed & spin to hit Padjen's SL carry/apex:
  A high: 172.5 mph/2179 rpm, +8.5 % carry (TM +8.5), apex −14.6 % (TM −17.6), land −7.7 (TM −9).
  A low: needs 182.3 mph/1341 rpm (unphysical at 113 mph club; smash 1.61), +6.1 % (TM +4.0), apex −15.9 % (TM −21.1), land −7.1 (TM −9).
  Dsh high +5.1 %, low +3.6 %; SS high +13.5 %, low +10.7 %. All variants under-predict Padjen's apex drop and land drop.
- [D] Spin-decay law (smits / TrackMan 4 %/s time-based / none / 3× smits), after re-calibration: land residual changes ≤0.2°
  (out_t7_decay.txt).
- [D] Oracle 10 as specified (calibrate to 2023 6i row, fly TrackMan 2014 launch): PGA 188.43 yd / 33.16 / 45.14° (dt 2 ms and
  0.5 ms identical) vs 184/33.8/48.0 → carry +4.4 yd, OUTSIDE the hard ±4 yd band; land −2.9° (soft ±3, inside). LPGA 153.93 /
  27.44 / 43.85 vs 152/27.7/45.6 → pass.
- [V] Golf Digest/Australian Golf Digest, Brian Wacker, 2020-02-21 (https://www.australiangolfdigest.com.au/heres-what-tour-pros-are-doing-in-mexico-city-to-adjust-to-playing-at-altitude/):
  DeChambeau "We use the normalised numbers we get on two devices on the range that tells us how far it goes"; article says he used
  two TrackMan devices on the range. Simpson: "If I'm hitting it lower, we'll [adjust] 10 percent ... higher, we'll play 16 percent."
  => tour planning numbers are TrackMan-derived (model normalization or TrackMan-measured range flights; ambiguous which).
- Negative result: web search 2026-10-08 for measured same-launch golf flights at altitude (radar/robot, Denver etc.) found none,
  consistent with the research.
- Not obtained: Aoki, Muto, Okanaga (2010) Procedia Eng 2:2431 (ScienceDirect 403; Elsevier API rate-limited) — Semantic Scholar
  abstract only: 328-dimple ball, forces vs rotation measured + LES; no numbers seen. Kim et al. (2014) JFM 754 R2: Crossref abstract
  only (mechanism: boundary layer moving against the rotating surface transitions, the other stays laminar).

## Status

- Review complete 2026-10-08; findings L1–L7 written to physics-lit.md (major L3, L4, L5; minor L1, L2, L6; nit L7).
