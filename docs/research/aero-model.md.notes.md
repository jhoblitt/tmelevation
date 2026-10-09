# aero-model research — findings log

Each entry: claim; source (URL/DOI + page/eq); accessed date; [V] primary read / [S] secondary only.

## Spin decay (Nathan, "The Spin Decay of a Baseball", spindown-rev1.pdf)

- Source: A. M. Nathan, https://baseball.physics.illinois.edu/spindown-rev1.pdf (open access; accessed 2026-10-08).
  This is a SECONDARY source for golf data: it quotes Smits & Smith (1994) and Tavares et al. (1999).
- [S] Both Smits & Smith and Tavares et al. define Spin Decay Rate SRD = (dω/dt)·R²/v² and fit SRD = −λ·S,
  S = Rω/v (Nathan eq. 1). λ = 2.0e-5 (Smits & Smith), 2.5e-5 (Tavares) (eq. 2).
- [S] => dω/dt = −λ v ω / R; ω(t)=ω0 exp(−λ v t / R); τ = R/(vλ) (eqs 3–5). At v=44.7 m/s, R=0.0213 m:
  τ = 23.8 s (Smits), 19.1 s (Tavares) (eq. 6).
- [S] Tavares model: I dω/dt = −R ρ A C_M v², A = πR², I = α M R², C_M = β S (eqs 7–8) =>
  λ = β R³ ρ π /(M α) (eq. 9). With α=0.4, ρ=1.18, M=0.0459: β = 0.010 (Smits), 0.012 (Tavares) (eq. 10).
  KEY: in the torque form, λ ∝ ρ, i.e. spin-decay rate scales linearly with air density.
- [S] Citations: Tavares, Shannon, Melvin, "Golf ball spin decay model based on radar measurements",
  Science and Golf III (1998 WSCG), Human Kinetics 1999, pp. 464–472. Smits & Smith, "A new aerodynamic
  model of a golf ball in flight", Science and Golf II (1994 WSCG), E&FN Spon 1994, pp. 340–347.
- [S] Nathan sec. V: spin decay with τ≈20 s changes a 406 ft baseball fly by <0.1 ft (competing lift/drag
  reductions; τ ∝ 1/v so average τ is longer). For golf, the effect is likely bigger (higher S, longer flights) — check in probe.

## Smits & Smith (1994) model — via patent text (SECONDARY, OCR-noisy)

- [S] Search-engine summary of US patents (e.g. "Steerable rotating projectile", USPTO 11230375/12330782) quoting
  Smits & Smith: range 4e4<Re<2.5e5, 0.04<S<1.4; model valid for driver shots 7e4<Re<2.1e5, 0.08<S<0.2:
  C_D = C_D1 + C_D2·S + C_D3·sin(π(Re−A1)/A2); C_L = C_L1·S^0.4; spin decay (dω/dt)·d²/(4U²) = R1·S;
  C_D1=0.24, C_D2=0.18, C_D3=0.06, C_L1=0.54, R1=0.00002, A1=90000, A2=200000. Accessed 2026-10-08.
  Needs primary/clean-text verification (OCR exponent ambiguity 0.4 vs 2.4 noted).
  R1=2e-5 is consistent with Nathan's λ=2.0e-5 for Smits (d²/4 = R²).

## Lyu, Kensrud, Smith, Tosaya (2018) "Aerodynamics of Golf Balls in Still Air"

- Source: Proceedings 2018, 2(6), 238; doi:10.3390/proceedings2060238; CC BY 4.0 open access.
  PDF fetched from https://mdpi-res.com/d_attachment/proceedings/proceedings-02-00238/article_deploy/proceedings-02-00238.pdf
  (accessed 2026-10-08). [V] primary read (text + figures rendered).
- [V] Definitions (eqs 1–3): F_D = ½ρAV²C_D, F_L = ½ρAV²C_L; Re = VD/ν (ν kinematic viscosity); S = rω/V.
- [V] 13 production balls in still air (light gates), 18–91 m/s, 1500–4500 rpm.
- [V] Non-spinning: C_D ≈ 0.5 at Re = 5e4, ≈ 0.2 at Re = 1e5 (Sec 3.1.1; Fig 3a) — drag crisis inside the golf speed range.
  Largest ball-to-ball C_D spread at Re < 7.5e4 (>0.1), small (<0.05) above 1e5.
- [V] Spinning (1500–2500 rpm) shows a similar drag crisis (Sec 3.1.2). Fig 3b fits for KK (Kirkland 2017) ball:
  low-speed  (5e4<Re<1e5):   C_D = 1.29e-10 Re² − 2.59e-5 Re + 1.50
  high-speed (7.5e4<Re<2e5): C_D = 1.91e-11 Re² − 5.40e-6 Re + 0.56
  (values read from the figure image; [D] high-speed fit min ≈0.178 at Re≈1.41e5; =0.211 at 1e5; low fit =0.53 at 5e4, 0.20 at 1e5.)
- [V] Lift (Fig 4b, KK ball, S≈0.04–0.32, v 32–91 m/s): C_L = −3.25 S² + 1.99 S. 2nd-order polynomial in S; peaks ≈0.305 at S≈0.31,
  so NOT usable for wedge-like S (0.45+). Low speeds excluded "to avoid the influence of the reverse Magnus effect at low speed".
- [V] Trajectory sim used 71.5 m/s, 6°, 3000 rpm with "4% per second spin decay" citing TrackMan Newsletter #7 p.7
  (http://www.gavlegolf.com/Media/Get/2610/trackman.pdf). C_D uncertainty 0.0025 → 2.3 m carry error.
- [V] Ball-to-ball spread: ΔC_D, ΔC_L ≈0.02 average → 18 m carry spread on a driver shot (Sec 4).

## Penner (2001) "The physics of golf: The optimum loft of a driver", Am. J. Phys. 69(5), 563–568

- DOI 10.1119/1.1344164. Green OA copy (author-accepted, AAPT copyright notice, personal use) at VIU repository:
  https://www.viurrspace.ca/server/api/core/bitstreams/59c73ed3-fece-4b2c-8e96-a14336895139/content (accessed 2026-10-08). [V] primary read.
- [V] Ball: USGA diameter 4.27 cm (1.68 in), mass 45.9 g (1.62 oz) (p.565). I = (2/5) m r² for impact model.
- [V] ρ = 1.204 kg/m³ "for dry air at 20 °C" (p.565). F_D = ½ρ(πr²)C_D v² (eq 12), F_L = ½ρ(πr²)C_L v² (eq 13).
- [V] Equations of motion (eqs 14–15), φ = angle of velocity above horizontal:
  a_x = (−F_D cos φ − F_L sin φ)/m ; a_y = (−F_D sin φ + F_L cos φ)/m − g, g = 9.81 m/s².
- [V] C_D, C_L: "interpolated C_D and C_L values from Bearman and Harvey" (hexagonally dimpled balls) — tabular, no closed form in this paper.
  Penner: B&H coefficients "decrease with increasing speed and increase with increasing spin"; B&H's computed carries agreed with
  driving-machine carries for hexagonally dimpled balls (p.565).
- [V] Spin decay (eq 16), from Smits & Smith: α = dω/dt = −(0.00002)(ω v / r). Wind-tunnel tests: decay ≈ exponential,
  landing spin ≈ 75% of initial for a driver shot (p.565). [D] identical to Nathan's SRD = −λS with λ = 2e-5.
- [V] Numerics: "step size of 0.001 s, which resulted in a calculation uncertainty in the carry and drive of less than 0.1 yd" (p.566).
- [V] Validation: carry vs Williams' driving-machine data (British ball, 4.12 cm) — reasonable agreement for dynamic loft ≈12° (Fig. 4).

## Smits & Smith (1994) model — clean secondary text (Mehta's review text, reproduced in a patent)

- Source: US 11230375 B1 ("Steerable rotating projectile"), Google Patents HTML https://patents.google.com/patent/US11230375B1/en
  (accessed 2026-10-08). The passage is R. D. Mehta's sports-ball-aerodynamics review text (the patent's reference list cites
  Mehta 1985 Ann. Rev. Fluid Mech. and Mehta & Pallis 2001) — SECONDARY for Smits & Smith.
- [S] "Smits and Smith (8) made wind tunnel measurements on spinning golf balls over the range, 40,000<Re<250,000 and 0.04<S<1.4,
  covering the range of conditions experienced by the ball when using the full set of clubs ... CL measurements were slightly
  higher (~0.04) [than Bearman & Harvey] and a stronger dependence of C_D on the spin parameter was exhibited over the entire S range.
  ... for Re>200,000, a second decrease in C_D was observed ... could be due to compressibility effects (local Mach up to 0.5)."
- [S] "Smits and Smith (8) proposed the following model for driver shots in the operating range, 70,000<Re<210,000, 0.08<S<0.2:
  C_D = C_D1 + C_D2 S + C_D3 sin{π(Re−A1)/A2}, C_L = C_L1 S^0.4, Spin Rate Decay = δω/δt [d²/(4U²)] = R1 S.
  C_D1=0.24, C_D2=0.18, C_D3=0.06, C_L1=0.54, R1=0.00002, A1=90,000, A2=200,000." (clean HTML text; exponent is 0.4, not 2.4)
- [S] Bearman & Harvey (per same text): Re 40k–240k, S 0.02–0.3; C_L rises monotonically with S (≈0.08→0.25); C_D rises for S>0.1
  (≈0.27→0.32); trends independent of Re for 126,000<Re<238,000. B&H used a model 2.5× larger (lower Mach).
- [S] Same patent (Nathan's text): Smits & Smith ball mass 0.04593 kg, radius 0.02134 m; spin-decay parameter ω̇R²/v² ≈ linear in S
  and independent of Re (fixed S) for Re (1.0–2.5)e5. Smits: dω/dt = −4.0e-6 v² S / R² with v in mph (τ=23.8 s at 100 mph);
  Tavares: −5.0e-6 (v in mph). [D] 4.0e-6 mph² = 2.0e-5 (m/s)² ×(0.44704²) ✓ consistent.
- [D] Behaviour of the S&S drag Re-term: sin term = 0 at Re=90k, +0.06 at Re=190k, negative below 90k. So within 70k–210k C_D RISES
  with Re (supercritical rise), max at 190k. Sign at Re<90k is extrapolation (model not valid <70k).

## Li Jing (2016) PhD thesis, Hokkaido Univ., "Numerical Investigation of the Aerodynamics of a Golf Ball"

- doi:10.14943/doctoral.k12376 ; https://eprints.lib.hokudai.ac.jp/repo/huscap/all/62487/Jing_Li.pdf (open; accessed 2026-10-08).
- [V] (LES, non-spinning golf ball, k/D = 0.5e-2) Sec 3.1 p.27–28: C_D ≈ 0.49 at Re = 4.3e4 (subcritical), ≈0.39 at 7.5e4 (critical),
  ≈0.22 at 1.1e5 (supercritical), ~constant up to 1.7e5. Agrees with Choi et al. (2006) experiments (k/D=0.4e-2);
  "obvious discrepancy" from Bearman & Harvey (k/D=0.9e-2) — i.e. the crisis location depends on dimple depth / ball design.
- [S] (Achenbach via Li) deeper roughness lowers critical Re and raises supercritical C_D.
- Takeaway [D]: for a non-spinning dimpled ball the drag crisis spans roughly Re 4e4–1.1e5, which in sea-level air (ν≈1.47e-5)
  with D=42.67 mm is v ≈ 14–38 m/s — i.e. the slow end of a golf flight. Consistent with Lyu et al. 2018 (0.5 at 5e4, 0.2 at 1e5).

## Ball limits — R&A/USGA Rules of Equipment, Part 4 (Conformance of Balls)

- [V] https://www.randa.org/roe/the-rules-of-equipment/part-4-conformance-of-balls (accessed 2026-10-08):
  "The weight of the ball must not be greater than 1.620 ounces avoirdupois (45.93 g)."
  "The diameter of the ball must not be less than 1.680 inches (42.67 mm)." No min weight / max diameter.
  => model ball: m = 0.04593 kg, D = 0.04267 m (r = 0.021335 m), matching Smits & Smith's 0.04593 kg / 0.02134 m.

## USGA "The Ball: Aerodynamics Background Information" (K-12 STEM sheet)

- [V] http://web.archive.org/web/20220124143850/https://www.usga.org/resources/stemfiles/AERO68/aerodynamics_background_info_MS.pdf
  (accessed 2026-10-08): qualitative only; USGA fires balls up to 200 mph through a 70-ft tunnel of sensors (Indoor Test Range) and
  combines with robot launch data to simulate trajectories. No equations. Not useful as an equation source.

## Quintavalla (2002) USGA model — existence only

- [S] EP 4218964 A1 (Sumitomo Rubber, published 2023-08-02), https://data.epo.org/publication-server/rest/v1.2/patents/EP4218964NWA1/document.html
  (accessed 2026-10-08), [0036]: USGA Indoor Test Range measures C_D, C_L under 15 conditions; USGA trajectory program per
  "S. J. Quintavalla ... Science and Golf IV, Chapter 30, A Generally Applicable Model for the Aerodynamic Behavior of Golf Balls" (2002).
  Search-engine summaries of other patents say the model writes C_L, C_D as regressions in spin ratio SR=|ω|r/|V| and
  Re=2|V|r/ν (polynomial + log terms). Coefficients are ball-specific and not public. NOT verified; paywalled book chapter.

## Crabill, Witherden, Jameson (2019) "High-Order CFD Simulations of a Spinning Golf Ball", Sports Engineering

- arXiv:1806.00378 (open; accessed 2026-10-08). [V] for their CFD; [S] for the B&H/Choi summaries.
- [S] Choi et al. (2006, non-spinning, k/d=4e-3, 392 dimples): critical Re ≈ 80,000 with post-crisis C_D ≈ 0.21 and a noticeable
  rise afterwards; Bearman & Harvey (k/d=9e-3): critical Re ≈ 50,000, post-crisis C_D ≈ 0.25, then nearly constant (Sec 2).
- [S] From B&H data (their Fig 6b): conventional ball at S = 0.15: C_D ≈ 0.28 (≈8% above static), C_L ≈ 0.18; at S=0.13, C_L ≈0.16.
- [V] Their CFD at Re=150,000, S=0.15: C_L ≈ 0.16, C_D ≈5% above static.
- Takeaway [D]: critical Re differs by ball design (≈5e4–8e4); post-crisis C_D 0.21–0.25 at low spin; spin adds ~0.02 at S≈0.15.

## Literature search: model validation against TrackMan / tour averages (negative result)

- Searched 2026-10-08 (web search, several phrasings: "golf trajectory model validated TrackMan", "TrackMan PGA Tour averages
  carry model drag lift", Lyu/Smith follow-ups, arXiv API "golf ball"): found NO peer-reviewed paper that validates a published
  C_D/C_L trajectory model against TrackMan tour averages. Closest: Lyu et al. 2018 (lab C_D/C_L → simulated carry, no field
  comparison); Penner 2001 (carry vs Williams driving-machine data); Bearman & Harvey 1976 (carry vs driving machine, per Penner).
- TrackMan's own ball-flight model is proprietary (no public equations found).

## PROBE results (THROWAWAY script /tmp/claude-1000/aero-probe/, run 2026-10-08) [D]

- Density ratios at 15 °C const: 5,000 ft 0.8320; 7,800 ft 0.7485; 10,000 ft 0.6877.
- Numerics: RK4 + cubic-Hermite landing/apex interpolation: dt=0.05 s already within 0.002 yd / 0.001° of dt=1e-4 s;
  dt=0.01 s within 3e-5 yd. Linear landing interpolation adds ≤0.0016 yd at dt=0.05. (out_uncal.txt)
- Along-flight ranges (S&S model, sea level): PGA Driver V 25–76 m/s, S 0.074–0.19, Re 73k–223k; PGA 7i S 0.29–0.76, Re 55k–161k;
  PGA PW S 0.45–1.21, Re 46k–136k; LPGA Dr S 0.088–0.19, Re 73k–187k. At 10,000 ft Re min/max: Driver 65k–154k; PW 43k–93k.
  Landing spin 80–87% of launch at SL (Smits λ=2e-5), i.e. Penner's "≈75%" ballpark.
- UNCALIBRATED S&S (incl. sin Re term) sea-level carry error vs table: PGA Dr −29.4 yd (−10.4%), 7i +9.0 (+5.1%), PW +3.4 (+2.4%),
  LPGA Dr −9.3 (−4.2%); apex +0.9/+3.7/+6.2/+2.3 yd; land +1.5/−5.6/−3.1/+1.1 deg.
  S&S without the Re term: carry −2.3%/+7.5%/+2.3%/+2.8%; apex +7.5/+6.4/+7.2/+5.9 yd.
- CALIBRATED (kd, kl multiplicative on C_D, C_L; target carry+apex exact; Newton converges in 3 iterations; Jacobian cond 3–9):
  model smits_noRe (C_D=0.24+0.18S, C_L=0.54 S^0.4, decay λ=2e-5·ρ/ρ0):
    PGA Dr kd .889 kl .809: +17.3 yd (+6.1%) @5k, +24.9 (+8.8%) @7.8k, +29.6 (+10.5%) @10k; apex −3.4/−5.5/−7.1; land −5.1/−7.9/−10.1
    PGA 7i kd 1.108 kl .920: +15.9 (+9.0%), +23.8 (+13.5%), +29.2 (+16.6%); apex −2.2/−3.6/−4.7; land −4.1/−6.7/−8.7
    PGA PW kd 1.030 kl .785: +12.0 (+8.5%), +18.1 (+12.8%), +22.5 (+15.8%); apex −1.1/−1.8/−2.4; land −3.4/−5.3/−6.9
    LPGA Dr kd .941 kl .818: +9.6 (+4.3%), +13.4 (+6.0%), +15.5 (+7.0%); apex −2.3/−3.6/−4.6; land −4.5/−6.9/−8.6
    Sea-level land-angle error after calibration: −1.1, −4.4, −3.3, −1.5 deg (model too shallow for irons).
  model smits (with S&S sin Re term): deltas larger: PGA Dr +8.0%/+12.3%/+15.3%; 7i +11.6/+17.7/+22.1%; land err −2.4/−5.8/−4.3/−2.5.
  model smits_crisis (noRe + Lyu non-spinning crisis ΔC_D below Re 1e5): PGA Dr +5.5/+7.6/+8.7%; 7i +5.6/+7.5/+8.0%;
    PW +4.1/+5.1/+4.9%; LPGA +3.4/+4.2/+4.2%; land err +0.0/+0.7/+0.8/−0.4 (best sea-level land match).
  model linear (C_D=0.22+0.25S, C_L=S): Dr +7.7% @7.8k, 7i +13.4%, PW +12.7%, LPGA +4.9% — close to smits_noRe.
- Spin-decay sensitivity (smits_noRe): none / λ fixed / λ∝ρ / Tavares / TrackMan 4%/s change the 10k-ft driver delta by ≤1.6 yd,
  irons ≤0.7 yd. ρ-scaling of decay worth ~+0.7–1.6 yd at 10k ft on driver.
- Knob choice ((kd,kl) vs additive offsets): altitude deltas agree within 0.5 yd.
- Table rounding (carry ±0.5, apex ±0.5 yd): delta at 10k ft moves ≤0.1 yd for carry, ≤0.8 yd for apex.
- External cross-check (from sibling reference-data notes, SECONDARY: PGA Tour 2017 article quoting TrackMan's J. Padjen):
  "high-trajectory" TrackMan driver 282 yd carry / 102 ft apex / 38° land at sea level → 7,800 ft: 306 yd (+24, +8.5%), 84 ft apex
  (−6 yd), 29° land (−9°). smits_noRe calibrated to 282/35: +24.9 yd, −5.5 yd, −7.9°. smits_crisis: +21.5, −5.5, −6.9.
  smits (with Re term): +34.6, −4.4, −7.4 (overshoots).

## Li, Tsubokura, Tsunoda (2017) "Numerical Investigation of the Flow Past a Rotating Golf Ball and Its Comparison with a Rotating Smooth Sphere", Flow Turbul. Combust.

- doi:10.1007/s10494-017-9859-1; open (CC BY) at https://pmc.ncbi.nlm.nih.gov/articles/PMC6044256 ; full text via Europe PMC
  fullTextXML (accessed 2026-10-08). [V] for their LES results; [S] for B&H/Beratlis summaries.
- [V] Table 1, rotating golf ball, spin parameter Γ = 0.1 (k/D = 0.4e-2, 392 dimples):
  Re 4.3e4 (subcritical) C_d 0.506, C_l +0.150; Re 7.5e4 (critical) C_d 0.317, C_l −0.137 (NEGATIVE Magnus);
  Re 1.1e5 (supercritical) C_d 0.240, C_l +0.135.  => with S=0.1 the drag crisis persists under spin, and lift can reverse sign
  in the critical regime. [S] B&H's lift sign change occurs near Re ≈ 5e4 (their ball's critical Re is lower); Beratlis et al. DNS
  critical Re ≈ 5e4 vs Li ≈ 8e4 — crisis location is ball-specific.
- [D] Relevance: PGA driver's in-flight Re min ≈ 73k at SL, 65k at 10,000 ft (probe) — i.e. the end of a driver flight sits at
  the upper edge of the critical range for some ball designs, and altitude pushes it further in.

## External cross-check of probe vs player altitude yardages (from sibling reference-data notes; SECONDARY)

- Scheffler / McIlroy Castle Pines (~6,400 ft) planning yardages (TaylorMade 2024): driver +10.0% / +8.1%, 7i +12.0% / +13.8%,
  PW +9.7% / (46°) +10.0%. Probe at 6,400 ft (interpolated, ρ/ρ0 ≈ 0.79): smits_noRe driver ≈ +7.5%, 7i ≈ +11.2%, PW ≈ +10.6%;
  smits_crisis driver ≈ +6.6%, 7i ≈ +6.5%, PW ≈ +4.6%. => player data (and TrackMan staff statements that mid/short irons gain most)
  favour the Re-independent model; the crisis model inverts the club pattern. [D]

## Robinson & Robinson (2013) Phys. Scr. 88 018101 — and Jensen's comment

- Crossref (accessed 2026-10-08): comment J. Højgaard Jensen, Phys. Scr. 89 (2014) 067001, doi:10.1088/0031-8949/89/6/067001;
  reply Robinson & Robinson, Phys. Scr. 89 (2014) 067002. Original paper not read (IOP page served no PDF).
- [V] Jensen abstract (RUC repository https://forskning.ruc.dk/da/publications/0f1e9047-266b-495c-b615-1efd5ddb593b):
  R&R assumed "both the drag force and the lift force are independent of the Reynolds number and proportional to the square of the
  projectile's velocity" and Jensen shows "by dimensional analysis, the latter assumption is shown to be incorrect for forces
  dependent on the angular velocity of the projectile, e.g. the lift force." => do not use R&R's lift law; use C_L(S).

## MacDonald & Hanzely (1991) — via Penner 2001

- [V via Penner 2001 p.563] "MacDonald and Hanzely used the Bearman and Harvey coefficients to determine ... optimum launch angle"
  (driver, 3500 rpm). Paper itself closed-access (Semantic Scholar: CLOSED), not read.

## PROBE — whole-table and 3-target runs (2026-10-08) [D]

- Model A (smits_noRe, (kd,kl) on carry+apex) whole table: kd 0.89–1.22, kl 0.79–1.08. Sea-level land-angle residual (model − table):
  PGA Dr −1.1, 3W −4.5, 5W −6.5, Hy −9.2, 3i −7.5, 4i −7.0, 5i −5.9, 6i −5.5, 7i −4.4, 8i −3.6, 9i −3.9, PW −3.3;
  LPGA Dr −1.5, 3W −1.1, 5W −4.7, Hy −5.6, 4i −4.0, 5i −4.9, 6i −4.2, 7i −2.6, 8i −0.2, 9i −0.4, PW +0.7. (out_all_A.txt)
  Carry gain @5k / @10k: PGA Dr +6.1/+10.5%, woods/long irons +6.6–7.6 / +11.2–13.3%, 5i–PW +8.2–9.1 / +15.0–16.9%;
  LPGA Dr +4.3/+7.0%, woods/long irons +5.1–5.9 / +8.3–10.1%, 6i–PW +6.3–8.5 / +11.0–15.7%.
- Matching land angle too needs a 3rd knob on the DRAG side (C_L exponent, C_L saturation, spin-decay ×8–54 could not match).
  B: C_D = a + b·S per club → fits all 3 but unphysical (a < 0 for 8 PGA clubs, b up to 2.0) and deltas +18–20% @10k for irons.
  C: Re-crisis weight w per club (w 0.06–2.4) → LPGA 4i–6i carry gain ≈ 0 or NEGATIVE at 10k ft; PGA hybrid +2.5% — contradicts
  every empirical source. => land angle should NOT be a calibration target; keep it as a loose check.
- Likely contributors to the land-angle gap (hypotheses, not verified): table rows are per-column averages over many shots, so
  (carry, apex, land) of the average launch is not the average of (carry, apex, land) — land angle is the most nonlinear in spin;
  real-world venues/wind/terrain; and model structure late in flight (low-Re drag).

- Averaging hypothesis TESTED [D]: PGA hybrid (model A calibrated), mean of outcomes over a 27-point launch spread (±8 mph,
  ±2°, ±1000 rpm) vs outcome at the mean launch: carry −1.6 yd, apex −0.1 yd, land −0.45° — small and in the wrong direction.
  So column-averaging does NOT explain the 4–9° land-angle gap. Remaining candidates: low-Re late-flight aero (drag crisis /
  lift loss) or how TrackMan's land angle is measured/aggregated. Unresolved.

- Invariance check [D]: model A calibrated at ρ_SL = 1.225 vs 1.184 kg/m³ (ISA 15 °C vs 25 °C/77 °F) then flown at ρ_SL·p/p0:
  altitude deltas identical to ≤0.01 yd / 0.01° (PGA Dr, 7i at 5k & 10k ft); only kd, kl rescale (0.889→0.920 etc.).
  Reason: with Re-independent C_D(S), C_L(S) the EOM depend on ρ only through ρ·kd and ρ·kl, so the delta depends only on
  ρ/ρ_SL. With a Re-dependent model this cancellation is lost (Re needs absolute ρ and μ(T)).

- Direct runs at 6,400 / 7,000 ft [D] (calibrated): smits_noRe PGA Dr +7.6/+8.1%, 7i +11.3/+12.3%, PW +10.7/+11.6%,
  LPGA Dr +5.2/+5.6%; smits_crisis PGA Dr +6.7/+7.1%, 7i +6.7/+7.1%, PW +4.7/+4.9%, LPGA Dr +3.9/+4.1%.
  (Compare TrackMan Support, per sibling notes: ~7,000 ft → "roughly 10% further in the air", club unspecified.)

