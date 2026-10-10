# Golf-ball aerodynamic model for altitude adjustment — research

Status: COMPLETE (2026-10-08). Probe code is throwaway, under /tmp/claude-1000/aero-probe/.
Started 2026-10-08. Findings with sources: `aero-model.md.notes.md` (same directory).

Legend: **[V]** = verified against the primary source; **[S]** = secondary citation only
(someone else quoting the primary); **[D]** = derived/computed here.

## 1. Equations of motion (2D, backspin only)

**Frame and sign convention.** x horizontal downrange, y vertically up, z out of the page (right-handed).
A ball travelling in +x with **backspin** has angular velocity ω = +ω ẑ (counter-clockwise in this view: the
top surface moves backward). The Magnus/lift force is along ω̂ × v̂ = (−v_y, v_x)/V, i.e. velocity rotated
+90°, which points up and slightly backward on the way up and up and forward on the way down. Drag is along −v̂.

**Forces** (Penner 2001, eqs 12–15 **[V]**; Lyu et al. 2018, eqs 1–3 **[V]**):

    F_D = ½ ρ A C_D V²     (along −v̂)          A = π r² = π D²/4
    F_L = ½ ρ A C_L V²     (along ω̂ × v̂)

With k = ρA/(2m) and V = |v|, the 2D state (x, y, v_x, v_y, ω) obeys

    dx/dt  = v_x
    dy/dt  = v_y
    dv_x/dt = −k V (C_D v_x + C_L v_y)
    dv_y/dt = −k V (C_D v_y − C_L v_x) − g
    dω/dt  = −λ(ρ) · V ω / r          (spin decay, §4)

Penner writes the same thing in terms of the flight-path angle φ (velocity above horizontal):
a_x = (−F_D cos φ − F_L sin φ)/m, a_y = (−F_D sin φ + F_L cos φ)/m − g **[V]** (Penner 2001 eqs 14–15);
substituting cos φ = v_x/V, sin φ = v_y/V gives the component form above **[D]**. The component form has no
trig and no singularity at the apex, so it is the one to implement.

**Dimensionless groups** (Lyu et al. 2018, eqs 2–3 **[V]**):

- Spin parameter (a.k.a. spin factor / spin ratio) **S = r ω / V** — surface speed over ball speed, ω in rad/s
  (ω = 2π·rpm/60), r = D/2. Both Smits & Smith and Tavares et al. use this definition for their spin-decay fits
  (Nathan, eq. 1 **[S]**); the USGA/Quintavalla "spin ratio" SR = |ω| r/|V| is the same quantity **[S]**.
- Reynolds number **Re = V D / ν = ρ V D / μ**, D = diameter (not radius). μ depends on temperature only
  (≈1.789e-5 Pa·s at 15 °C, ISA), so at fixed temperature **Re ∝ ρ V**: at 10,000 ft (ρ/ρ₀ ≈ 0.688) the same ball
  speed gives 31% lower Re **[D]**.

**Ball** (R&A/USGA Rules of Equipment, Part 4 **[V]**): mass ≤ 1.620 oz = **45.93 g**, diameter ≥ 1.680 in =
**42.67 mm**. Tour balls sit at these limits; use m = 0.04593 kg, D = 0.04267 m (r = 0.021335 m), A = 1.4300e-3 m².
Smits & Smith used m = 0.04593 kg, r = 0.02134 m **[S]**; Penner 2001 uses 45.9 g / 4.27 cm **[V]**.

**g** = 9.80665 m/s² (standard; Penner used 9.81). Latitude variation of g (±0.3%) is irrelevant to the altitude delta.

**What is omitted, deliberately:** buoyancy (ρ V_ball / m ≈ 0.11% of weight at sea level **[D]**, and it shrinks with altitude); side spin/3-D effects (the tables are
pure backspin averages); wind; spin-axis tilt. None of these change sign or size with altitude enough to matter for a delta.
One omission is not harmless: the **reverse Magnus** effect. It is negative lift at the critical Re with
low S; Li et al. 2017 find it at S = 0.1 and Re ≈ 7.5e4, which is the end of a driver flight, and more so
at altitude. It belongs to the Re-dependence risk in §3, and the recommended model leaves it out.

## 2. Drag and lift coefficient models

Summary: there is **no open-access, primary-verified, closed-form C_D/C_L model that covers the whole
club range** (S ≈ 0.07 for a tour driver to S ≈ 1.2 at the apex of a wedge). The usable closed form is
Smits & Smith (1994); everything else is either tabular/graphical, ball-specific, CFD point values, or
limited to S ≤ 0.32.

| Model | Functional form & coefficients | Valid range | Status / access |
|---|---|---|---|
| **Smits & Smith (1994)**, *Science and Golf II* pp. 340–347 | C_D = 0.24 + 0.18 S + 0.06 sin(π(Re − 90 000)/200 000); C_L = 0.54 S^0.4; spin decay (dω/dt)·d²/(4U²) = −2×10⁻⁵ S | Fit stated "for driver shots" 70 000 < Re < 210 000, 0.08 < S < 0.2; underlying wind-tunnel data 40 000 < Re < 250 000, 0.04 < S < 1.4 | **[S]** — read only as R. D. Mehta's review text reproduced verbatim in US 11230375 B1; the book chapter is not open access and was not read. Spin-decay constant independently confirmed by Penner 2001 eq. 16 **[V]** and Nathan **[S]**. Mehta's text gives the decay law without a sign; it is a decay, so the sign is negative. |
| **Bearman & Harvey (1976)**, *Aeronautical Quarterly* 27:112–122, doi:10.1017/S0001925900007617 | Tabular/graphical only. C_L rises monotonically with S (≈0.08→0.25); C_D rises for S > 0.1 (≈0.27→0.32); trends Re-independent for 126 000 < Re < 238 000. At S = 0.15: C_D ≈ 0.28, C_L ≈ 0.18 | Re 40 000–240 000, S 0.02–0.3 | **[S]** (Mehta text; Crabill et al. 2019). Paywalled (Cambridge). Used by Penner 2001 and MacDonald & Hanzely 1991 via interpolation **[V via Penner]**. |
| **Lyu, Kensrud, Smith & Tosaya (2018)**, *Proceedings* 2(6):238, doi:10.3390/proceedings2060238 | Kirkland ball, spinning at 1500–2500 rpm: C_D = 1.29e-10 Re² − 2.59e-5 Re + 1.50 (5e4 < Re < 1e5); C_D = 1.91e-11 Re² − 5.40e-6 Re + 0.56 (7.5e4 < Re < 2e5); C_L = −3.25 S² + 1.99 S | Speed 18–91 m/s; lift fit S ≈ 0.04–0.32 (speeds 32–91 m/s) | **[V]**, CC BY 4.0. Coefficients read from figure annotations (Figs 3b, 4b). One ball model. The lift quadratic peaks at S ≈ 0.31 and then falls, so it **cannot be used for irons or wedges**. |
| **Quintavalla (2002)** (USGA), *Science and Golf IV*, ch. 30 | Regression of C_L, C_D on spin ratio SR = ωr/V and Re (polynomial plus log terms, per patent summaries) | Fitted per ball from Indoor Test Range data | **[S]**, form only. Coefficients are ball-specific and not public. |
| **Penner (2001)**, *Am. J. Phys.* 69:563, doi:10.1119/1.1344164 | No closed form; interpolates Bearman & Harvey's hexagonal-dimple data | — | **[V]**, open author copy. Its value here is the EOM and spin decay (§1, §4), not the coefficients. |
| **Penner (2003)**, *Rep. Prog. Phys.* 66:131, doi:10.1088/0034-4885/66/2/202 | Not seen | — | Paywalled; **not verified**. |
| **MacDonald & Hanzely (1991)**, *Am. J. Phys.* 59:213, doi:10.1119/1.16564 | Bearman & Harvey coefficients (per Penner 2001) | — | Closed; **not verified**. |
| **Robinson & Robinson (2013)**, *Phys. Scr.* 88:018101 | Lift and drag ∝ V², independent of Re | — | Not read. Jensen's 2014 comment shows by dimensional analysis that their lift law is wrong for spin-dependent forces **[V]** (abstract). **Do not use.** |
| **Aoki, Muto & Okanaga (2010)**, *Procedia Eng.* 2:2431, doi:10.1016/j.proeng.2010.04.011 | C_D, C_L versus spin parameter for a 328-dimple ball | — | Gold OA (CC BY-NC-ND), but ScienceDirect blocked automated download; **not verified**. |
| **Choi, Jeon & Choi (2006)**, *Phys. Fluids* 18:041702 | Non-spinning drag crisis: critical Re ≈ 80 000, post-crisis C_D ≈ 0.21 | — | **[S]** (Crabill 2019; Li 2016). Closed. |
| **Li, Tsubokura & Tsunoda (2017)**, *Flow Turb. Combust.*, PMC6044256 (LES) | Rotating ball at S = 0.1: C_D 0.506 / 0.317 / 0.240 and C_L +0.150 / **−0.137** / +0.135 at Re 4.3e4 / 7.5e4 / 1.1e5 | Point values | **[V]**, CC BY. Shows that both the drag crisis and a reversed Magnus force survive moderate spin. |
| **Crabill, Witherden & Jameson (2019)**, *Sports Eng.*, arXiv:1806.00378 (CFD) | S = 0.15, Re = 1.5e5: C_L ≈ 0.16, C_D ≈ 5% above the static value | Point value | **[V]**. |
| **Jorgensen**, *The Physics of Golf* (book) | Not seen | — | **Not verified.** |

What the probe adds (§7): **uncalibrated**, Smits & Smith with its Re term misses tour carries by −10%
(PGA driver) to +5% (PGA 7-iron). Dropping the Re term gives −2% to +7.5%, but every apex comes out
6–8 yd high. The Lyu fits overshoot iron carries by 20–28%, which is expected given their lift law. So
no published model reproduces the table without per-club calibration, which is what the plan assumed.

**Shape matters more than level.** Calibration absorbs the overall C_D and C_L levels per club, so what
carries into the altitude delta is (a) how C_L and C_D vary with S along the flight and (b) whether C_D
or C_L depends on Re. The probe shows (a) is a small effect: swapping (C_D = 0.24 + 0.18 S, C_L ∝ S^0.4) for
(C_D = 0.22 + 0.25 S, C_L ∝ S) changes the calibrated carry gain by ≤0.2 percentage points on irons and
by 1.1–1.7 points on drivers (at 7,800–10,000 ft). (b) is the
dominant structural uncertainty (§3).

## 3. Reynolds-number dependence

**The crisis lies inside the golf flight envelope.** For dimpled balls the drag crisis falls at roughly
Re ≈ 4×10⁴–1.1×10⁵, and where exactly depends on the ball:

- Lyu et al. 2018 **[V]**: C_D ≈ 0.5 at Re 5e4 and ≈ 0.2 at 1e5, measured on production balls in still air, both non-spinning and at 1500–2500 rpm.
- Li 2016 LES **[V]**: C_D ≈ 0.49 at Re 4.3e4, 0.39 at 7.5e4 and 0.22 at 1.1e5. Li reports these agree with Choi et al. (2006).
- Choi et al. 2006 **[S]**: critical Re ≈ 8e4.
- Bearman & Harvey 1976 **[S]**: critical Re ≈ 5e4.

At sea level, D = 42.67 mm puts that Re band at V ≈ 14–38 m/s, which is the slow end of every full shot.
The probe's in-flight ranges at sea level are **[D]**:

- PGA driver: Re 73k–223k.
- PGA 7-iron: Re 55k–161k.
- PGA PW: Re 46k–136k.

At 10,000 ft the PW range is 43k–93k.

**Spin does not remove the crisis.** Li, Tsubokura & Tsunoda 2017 **[V]** ran a rotating ball at S = 0.1.
They got C_D = 0.51, 0.32 and 0.24 at Re 4.3e4, 7.5e4 and 1.1e5, and the lift reversed sign (C_L = −0.14)
in the critical regime. No open source characterises the crisis at the S = 0.3–1.2 that irons and wedges
reach late in flight. Smits & Smith had such data (S up to 1.4, Re down to 4e4) but published a closed
form only for the driver range. Their sin(Re) term makes C_D *rise* with Re from 90k to 190k (the
supercritical rise) **[S]**.

**Altitude feeds straight into Re.** Re = ρVD/μ, and μ depends on temperature only, so at fixed
temperature and speed Re falls in proportion to ρ: −17% at 5,000 ft and −31% at 10,000 ft. Any
Re-dependent coefficient therefore changes the altitude delta itself, not just the sea-level level that
calibration absorbs. Without Re dependence the delta depends only on ρ/ρ_SL; the probe checked this, and
deltas calibrated at ρ_SL = 1.225 and 1.184 agree to 0.01 yd. That makes the result independent of the
absolute conditions TrackMan's table was normalised to, provided the user's temperature handling is
consistent.

**How much it matters** (probe; each variant calibrated to the same sea-level carry and apex; carry gain at 7,800 ft):

| Variant | PGA Driver | PGA 7i | PGA PW | LPGA Driver |
|---|---|---|---|---|
| (i) Re-independent: C_D = a + bS, C_L = c S^0.4 | +8.8% | +13.5% | +12.8% | +6.0% |
| (ii) Smits & Smith with its sin(Re) term | +12.3% | +17.7% | +15.9% | +10.1% |
| (iii) (i) plus Lyu's non-spinning crisis ΔC_D below Re 1e5 | +7.6% | +7.5% | +5.1% | +4.2% |

The structural choice is worth a factor of about 2 on short irons. It is the largest modelling
uncertainty in the whole approach, far larger than spin decay, knob choice or the table's rounding.

**External evidence favours (i).** None of it is primary, and all of it reflects TrackMan's or players'
view of the world rather than physics:

- **TrackMan, via a PGA Tour article** (2017, quoting TrackMan's J. Padjen **[S]**, from the sibling
  `reference-data` notes): a "high-trajectory" tour driver going 282 yd / 34 yd apex / 38° land at sea
  level becomes 306 yd (+8.5%) / −6 yd apex / 29° land at 7,800 ft. Variant (i) calibrated to the 2023
  PGA driver (282 / 35 / 39) gives +24.9 yd (+8.8%), −5.5 yd and −7.9°. (iii) gives +7.6% and (ii) +12.3%.
- **The pattern across clubs.** TrackMan staff say mid and short irons gain the most at altitude and
  drivers and wedges less: a "bell curve", with low-ball hitters gaining less. Player planning yardages
  at Castle Pines (about 6,400 ft) put the 7-iron at +12–14% and the driver at +8–10%. Variant (i)
  reproduces this pattern (6,400 ft interpolated: 7-iron ≈ +11%, driver ≈ +7.5%, LPGA driver below the
  PGA driver). Variant (iii) inverts it, with irons gaining *less* than the driver, and (ii) overshoots the driver.
- **Titleist's Aoyama rule**, 1.16% per 1,000 ft **[S]**: 5.8% at 5,000 ft, against variant (i)'s 6.1% for the PGA driver.
- **TrackMan Support**, "VG | Altitude in Course Play" (recorded in the sibling notes as a primary TrackMan
  statement; I did not read it myself): at about 7,000 ft the ball "will travel roughly 10% further in the
  air than at sea level", club unspecified. Variant (i) at 7,000 ft gives about 8% for the PGA driver and
  12% for 7-iron/PW, consistent with that. Variant (iii) gives ≤7.1% for every club.

**Recommendation for Re:** leave it out of the baseline model. Use coefficients that depend on S only, and
document Re as the main open risk. A Re term is defensible physics, but for spinning balls at iron and
wedge S its form is unknown. The one published closed form (Smits & Smith's sin term) is a driver-range
fit that overshoots TrackMan once extrapolated. The only open-source crisis data (non-spinning, or S ≤ 0.25)
produces a club pattern that contradicts every empirical altitude source found. If a later version wants
Re, the hook is a multiplicative f(Re) on C_D (and possibly C_L). It would need validating against
measured at-altitude flights, which this research did not find.

## 4. Spin decay

**Published models.**

- **Smits & Smith (1994).** The spin decay rate, normalised as SRD = (dω/dt)·R²/V², is linear in S:
  SRD = −λS with λ = 2.0×10⁻⁵, which gives

      dω/dt = −λ V ω / R      ⇒  ω(t) = ω₀ exp(−∫λV/R dt),  τ = R/(λV)

  Sources: Nathan, eqs 1–5 **[S]**; the constant appears verbatim as α = −(0.00002)(ω_b v_b / r) in
  Penner 2001, eq. 16 **[V]**. Smits & Smith found SRD independent of Re at fixed S for Re 1.0–2.5e5
  **[S]**. τ is 23.8 s at 100 mph. Penner, citing wind-tunnel tests, says landing spin on a driver shot
  is about 75% of initial **[V]**; the probe gets 80–87%.
- **Tavares, Shannon & Melvin (1999)**, *Science and Golf III* pp. 464–472, radar measurements. The
  torque model is I dω/dt = −R ρ A C_M V², with C_M ≈ 0.012 S and I = 0.4 M R². This is the same law
  with λ = β π R³ ρ/(M α). At ρ = 1.18, β is 0.012 (Tavares; λ = 2.5e-5) or 0.010 (Smits; λ = 2.0e-5)
  **[S]** (Nathan eqs 7–10; Mehta/Nathan text in US 11230375).
- **TrackMan Newsletter #7**: "4% per second", cited by Lyu et al. 2018 as the spin decay used in their
  trajectory simulation **[S]**. The primary newsletter was not found: the gavlegolf.com URL has no
  Wayback copy. Smits's law gives λV/R = 2.8–7.0 %/s over V = 30–75 m/s (4.2 %/s at 45 m/s) **[D]**,
  so the two agree on average.

**Density dependence.** The decay is driven by aerodynamic torque, and that torque is proportional to the
dynamic pressure ½ρV². The Tavares form makes this explicit: λ ∝ ρ. Smits & Smith's SRD normalises by V²
without ρ, so their λ = 2e-5 holds at their tunnel density. Nathan converts it at ρ = 1.18. At altitude:

    λ(ρ) = λ₀ · ρ/ρ_SL,   λ₀ = 2.0×10⁻⁵

The ρ_SL used here should be the one the calibration uses. The 1.18 vs 1.225 difference in the
reference is 4% of λ and irrelevant to the result. **[D]**: thinner air means slower decay, so slightly
more spin late in flight at altitude.

**Does it matter?** Hardly, for the delta. With the recommended model and calibration, the 10,000 ft
carry gain changes as follows when the decay law is swapped among none, λ fixed, λ ∝ ρ, Tavares and
TrackMan's 4%/s: by ≤1.6 yd for the PGA driver and ≤0.7 yd for irons. The ρ-scaling alone is worth
+0.7 yd (7,800 ft) to +1.6 yd (10,000 ft) on the PGA driver. Nathan reaches the same conclusion for
baseball (a <0.1 ft change on a 406 ft fly) **[S]**. Keep spin decay because it is cheap and physically
right, and scale it with ρ. Its parameters need no calibration.

## 5. Calibration

**Knobs.** Use two per-club multipliers on the coefficient shapes, k_D on C_D(S) and k_L on C_L(S),
fitted so that the sea-level model reproduces the table's **carry** and **max height** exactly.

- **Well-posed.** At the solution, ∂carry/∂k_D ≈ −80 to −223 yd and ∂carry/∂k_L ≈ +15 to +117 yd per
  unit; ∂apex/∂k_D ≈ −17 to −34 yd and ∂apex/∂k_L ≈ +30 to +61 yd. Drag mostly moves carry and lift
  mostly moves apex. The 2×2 Jacobian's condition number is 3–9.
- **Convergence.** Newton with a finite-difference Jacobian (ε = 1e-4), started at (1, 1), converges in
  3 iterations for every row tried. Add a damping or backtracking line search as a safety net.
- **Size of the corrections.** Over all 23 table rows, starting from C_D = 0.24 + 0.18S and
  C_L = 0.54 S^0.4: k_D = 0.89–1.22 and k_L = 0.79–1.08. Corrections are at most about 22%, which is
  well inside ball-to-ball variation: Lyu et al. measured ΔC_D, ΔC_L ≈ 0.02, worth 18 m of driver carry
  **[V]**. Calibrated at ρ_SL = 1.184 instead of 1.225, k_D and k_L rise by about 3.5%, and the deltas
  are unchanged.
- **Robust to the choice of knob.** Using additive offsets (C_D + δ_D, C_L + δ_L, or mixed) instead of
  multipliers changes altitude deltas by ≤0.5 yd.
- **Robust to the table's rounding.** Moving the carry target ±0.5 yd shifts the 10,000 ft carry delta by
  ≤0.1 yd. Moving the apex target ±0.5 yd shifts it by ≤0.8 yd, so apex rounding (±1.5–2% of a 25–35 yd
  apex) is the larger term. The metres column narrows some intervals slightly: 282 yd / 258 m means
  281.6–282.5 yd. **[D]**

**Land angle is a check, not a target.** After calibration the sea-level model lands *shallower* than the
table for nearly every club:

- PGA: driver −1.1°, woods, hybrid and long irons −4.5 to −9.2°, 6-iron to PW −3.3 to −5.5°.
- LPGA: driver −1.5°, 3-wood −1.1°, 5-wood to 6-iron −4.0 to −5.6°, 7-iron −2.6°, 8-iron to PW within ±0.7°.

Three probe experiments tested whether a third knob should close the gap:

- **Lift or spin-decay knobs cannot match the land angle.** These were the C_L exponent, a C_L cap in S,
  and a spin-decay multiplier of ×8 to ×54.
- **Drag knobs can, but give unphysical coefficients.** A per-club C_D slope in S fits all three targets
  only with C_D(S = 0) < 0 for 8 of 12 PGA clubs and slopes up to 2.0. Altitude gains then grow to
  +18–20% at 10,000 ft.
- **A per-club Re-crisis weight gives impossible deltas.** It predicts zero or *negative* carry gain at
  10,000 ft for LPGA 4–6 irons, which contradicts every empirical source.
- **Column averaging is not the cause.** The averages are over many shots, so the land angle at the
  average launch need not equal the average land angle. Over a ±8 mph / ±2° / ±1000 rpm spread this
  moves the land angle by only −0.45°.

So the gap is real model-structure or data-definition error that this research could not resolve (see
Open risks). The app should show **published land angle + model Δ**, and should not fit to land angle.

**Validation literature.** No paper was found that validates a C_D/C_L trajectory model against TrackMan
tour averages, or against TrackMan data in general. The closest are:

- Penner 2001: carry against Williams' driving-machine data, with "reasonable agreement" **[V]**.
- Bearman & Harvey: carry against driving-machine carries for hexagonally dimpled balls, as reported by Penner **[V]**.
- Lyu et al. 2018: lab-measured coefficients run through a simulated carry, with no field comparison **[V]**.

TrackMan's own flight model is proprietary. The only "TrackMan-model" numbers found for altitude are the
journalist-reported Padjen figures in §3 **[S]**.

## 6. Numerics

**Integrator.** Use classical fixed-step RK4 on the 5-state system (x, y, v_x, v_y, ω). The dynamics are
smooth, with no stiffness: the shortest time scale is the drag time m/(½ρAC_D V) ≈ 2 s. The probe compared
step sizes against a dt = 1e-4 s reference (PGA driver and PW) **[D]**:

| dt | carry error | apex error | land-angle error |
|---|---|---|---|
| 0.05 s | ≤ 0.002 yd | < 1e-5 yd | ≤ 0.001° |
| 0.01 s | ≤ 3e-5 yd | — | ≤ 1e-5° |

dt = **0.01 s** is roughly 700 steps per flight, so ~23 rows × 3 densities is trivial in a browser. It sits
four orders of magnitude inside the 0.1 yd requirement. Penner used 0.001 s and reported <0.1 yd
**[V]**; that is overkill with RK4. Adaptive step control is unnecessary.

**Landing.** Stop at the first step where y < 0 and v_y < 0. Interpolate over that step with the cubic
Hermite polynomial in time, built from (y, v_y) at both ends, which costs nothing because v_y is already
the derivative of y. Solve y(t*) = 0 by 2–3 Newton iterations from the linear guess, then evaluate x(t*)
with the matching Hermite in (x, v_x). For the landing angle, interpolate v_x and v_y linearly to t* and
take atan2(−v_y, v_x). Plain linear interpolation of y is also fine (≤0.0016 yd extra at dt = 0.05 s).
The Hermite version keeps errors O(dt⁴) and costs nothing.

**Apex.** Detect the sign change of v_y within a step. Find t* by linear interpolation of v_y (it is
nearly linear there) and evaluate y(t*) with the same Hermite cubic. The probe's apex error was <1e-5 yd
even at dt = 0.05 s.

**Calibration solve.** Use 2×2 Newton with a forward-difference Jacobian (ε ≈ 1e-4 on k_D and k_L) and a
halving line search. That is 3 iterations × 3 flights, so about 10 flights per club. Pre-compute it once
per row at load, or ship the fitted (k_D, k_L) as data. Tolerance 1e-4 yd. Fit once at the reference sea-level density;
changing altitude only changes ρ in the forward runs. With the recommended Re-free model, the deltas
depend only on ρ/ρ_SL (§3), so the choice of reference density does not move them.

**Units.** Integrate in SI: 1 mph = 0.44704 m/s, 1 yd = 0.9144 m, ω = rpm·2π/60. Convert only for display.

## 7. Feasibility probe (THROWAWAY)

**THROWAWAY CODE.** The probe lives at `/tmp/claude-1000/aero-probe/`, outside the project, and is not
product code. It is Python 3 with no numpy or scipy needed:

- `probe.py` — model, integrator, calibrator.
- `run_uncal.py` — uncalibrated runs, S/Re ranges, numerics.
- `run_cal.py` — calibrated runs and the sensitivity modes `decay`, `knobs`, `rounding`, `jac`.
- `run3.py` — 3-target experiments.
- `run_all.py` — the whole table.

Raw outputs are the `out_*.txt` files.

**Setup.** m = 45.93 g, D = 42.67 mm, g = 9.80665, ρ_SL = 1.225 kg/m³ (ISA, 15 °C),
μ = 1.7894e-5 Pa·s, RK4 with dt = 1 ms, ball launched from y = 0. Altitude density is
ρ = ρ_SL·p/p₀ with p = 101325(1 − 2.25577e-5·h)^5.25588 at a constant 15 °C. That gives ρ/ρ_SL =
**0.8320 at 5,000 ft** and **0.6877 at 10,000 ft** (0.7485 at 7,800 ft, for the TrackMan comparison).
Spin decay is Smits's λ = 2e-5 scaled by ρ/ρ_SL.

Each cell below reads **carry yd / max height yd / land angle °**. Δ columns are altitude minus sea level.

**(a) Uncalibrated: Smits & Smith as published** (C_D = 0.24 + 0.18S + 0.06 sin(π(Re−9e4)/2e5), C_L = 0.54 S^0.4)

| Club | Table | Sea level | 5,000 ft | 10,000 ft | SL error vs table | Δ 5k | Δ 10k |
|---|---|---|---|---|---|---|---|
| PGA Driver | 282 / 35 / 39 | 252.6 / 35.9 / 40.5 | 278.5 / 34.0 / 36.1 | 304.4 / 31.7 / 31.5 | −29.4 (−10.4%) / +0.9 / +1.5 | +25.9 (+10.3%) / −2.0 / −4.4 | +51.8 (+20.5%) / −4.2 / −9.1 |
| PGA 7 Iron | 176 / 34 / 51 | 185.0 / 37.7 / 45.4 | 207.1 / 36.3 / 41.9 | 227.0 / 34.1 / 37.7 | +9.0 (+5.1%) / +3.7 / −5.6 | +22.1 (+11.9%) / −1.4 / −3.5 | +42.0 (+22.7%) / −3.7 / −7.7 |
| PGA PW | 142 / 32 / 52 | 145.4 / 38.2 / 48.9 | 163.2 / 37.6 / 46.2 | 179.4 / 36.2 / 43.0 | +3.4 (+2.4%) / +6.2 / −3.1 | +17.8 (+12.2%) / −0.6 / −2.7 | +34.0 (+23.4%) / −2.0 / −5.9 |
| LPGA Driver | 223 / 26 / 36 | 213.7 / 28.3 / 37.1 | 232.3 / 26.7 / 32.9 | 248.2 / 24.9 / 28.6 | −9.3 (−4.2%) / +2.3 / +1.1 | +18.5 (+8.7%) / −1.5 / −4.2 | +34.5 (+16.1%) / −3.4 / −8.5 |

**(b) Uncalibrated: Smits & Smith without the Re term** (C_D = 0.24 + 0.18S, C_L = 0.54 S^0.4)

| Club | Table | Sea level | 5,000 ft | 10,000 ft | SL error vs table | Δ 5k | Δ 10k |
|---|---|---|---|---|---|---|---|
| PGA Driver | 282 / 35 / 39 | 275.6 / 42.5 / 43.5 | 298.7 / 38.8 / 38.8 | 317.7 / 34.6 / 33.4 | −6.4 (−2.3%) / +7.5 / +4.5 | +23.1 (+8.4%) / −3.7 / −4.7 | +42.1 (+15.3%) / −8.0 / −10.1 |
| PGA 7 Iron | 176 / 34 / 51 | 189.1 / 40.4 / 47.1 | 207.8 / 37.6 / 43.4 | 223.3 / 34.2 / 39.0 | +13.1 (+7.5%) / +6.4 / −3.9 | +18.6 (+9.8%) / −2.8 / −3.7 | +34.2 (+18.1%) / −6.3 / −8.2 |
| PGA PW | 142 / 32 / 52 | 145.2 / 39.2 / 50.1 | 160.6 / 37.7 / 47.4 | 174.2 / 35.7 / 44.0 | +3.2 (+2.3%) / +7.2 / −1.9 | +15.4 (+10.6%) / −1.5 / −2.7 | +29.0 (+20.0%) / −3.5 / −6.1 |
| LPGA Driver | 223 / 26 / 36 | 229.3 / 31.9 / 39.3 | 242.9 / 28.9 / 34.5 | 252.3 / 25.8 / 29.7 | +6.3 (+2.8%) / +5.9 / +3.3 | +13.6 (+5.9%) / −3.0 / −4.8 | +23.0 (+10.0%) / −6.1 / −9.6 |

**(c) Calibrated: the recommended model** ((b) with k_D, k_L fitted per club to table carry and apex)

| Club | k_D, k_L | Sea level | 5,000 ft | 10,000 ft | SL land error | Δ 5k | Δ 10k |
|---|---|---|---|---|---|---|---|
| PGA Driver | 0.889, 0.809 | 282.0 / 35.0 / 37.9 | 299.3 / 31.6 / 32.9 | 311.6 / 27.9 / 27.8 | −1.1° | **+17.3 (+6.1%)** / −3.4 / −5.1 | **+29.6 (+10.5%)** / −7.1 / −10.1 |
| PGA 7 Iron | 1.108, 0.920 | 176.0 / 34.0 / 46.6 | 191.9 / 31.8 / 42.5 | 205.2 / 29.3 / 37.9 | −4.4° | **+15.9 (+9.0%)** / −2.2 / −4.1 | **+29.2 (+16.6%)** / −4.7 / −8.7 |
| PGA PW | 1.030, 0.785 | 142.0 / 32.0 / 48.7 | 154.0 / 30.9 / 45.3 | 164.5 / 29.6 / 41.8 | −3.3° | **+12.0 (+8.5%)** / −1.1 / −3.4 | **+22.5 (+15.8%)** / −2.4 / −6.9 |
| LPGA Driver | 0.941, 0.818 | 223.0 / 26.0 / 34.5 | 232.6 / 23.7 / 30.0 | 238.5 / 21.4 / 25.9 | −1.5° | **+9.6 (+4.3%)** / −2.3 / −4.5 | **+15.5 (+7.0%)** / −4.6 / −8.6 |

**Readings.**

- **Uncalibrated error is large.** Carry is −10% to +7.5% off and apex up to +7.5 yd; no off-the-shelf
  coefficient set reproduces the table, which justifies calibration.
- **Uncalibrated altitude deltas are unreliable.** The PGA driver at 10,000 ft gains +51.8 yd under (a)
  and +42.1 yd under (b) before calibration, but +29.6 yd after. Calibration matters for the delta as
  well as the level, because a model that flies too high or too far at sea level also over-responds to
  thinner air.
- **Calibrated deltas match the external evidence.** At 7,800 ft the PGA driver gains +24.9 yd (+8.8%),
  apex −5.5 yd, land −7.9°. TrackMan's reported numbers for a 282 yd tour drive are +24 yd (+8.5%),
  −6 yd, −9° **[S]**. Titleist's 1.16%/1,000 ft rule gives 5.8% at 5,000 ft against 6.1% here.
- **The club pattern matches.** Irons gain more than drivers (7-iron +9.0% / +16.6%) and LPGA drivers
  gain least (+4.3% / +7.0%), consistent with TrackMan staff and tour-player planning numbers (§3).
- **Apex and land angle both drop.** Apex falls 1–3.4 yd at 5,000 ft and 2.4–7.1 yd at 10,000 ft; land
  angle falls 3.4–5.1° and 6.9–10.1°. Flatter, longer flights are the qualitative picture every source
  describes.
- **The whole-table run** (`out_all_A.txt`) gives carry gains of PGA +6.1 to +9.1% at 5,000 ft and
  +10.5 to +16.9% at 10,000 ft; LPGA +4.3 to +8.5% and +7.0 to +15.7%.

## Recommendation

**Keep the planned approach.** Use a 2-D point-mass ODE, calibrate it per club at sea level, and display
published value + (model(ρ) − model(ρ_SL)). Two refinements: drop the Reynolds-number term, and treat land
angle as a check rather than a target.

**Model to implement:**

- **State and equations of motion.** State (x, y, v_x, v_y, ω), with k = ρA/(2m):
  - dv_x/dt = −k V (C_D v_x + C_L v_y)
  - dv_y/dt = −k V (C_D v_y − C_L v_x) − g
  - dω/dt = −λ₀ (ρ/ρ_SL) V ω / r, with λ₀ = 2.0×10⁻⁵
- **Coefficients.** S-only, Reynolds-independent, with S = rω/V:
  - C_D = k_D · (0.24 + 0.18 S)
  - C_L = k_L · 0.54 · S^0.4

  These are the Smits & Smith (1994) shapes with the sin(Re) term deliberately omitted.
- **Constants.** m = 0.04593 kg, D = 0.04267 m, A = πD²/4, g = 9.80665 m/s². Launch from y = 0;
  carry, apex and land angle are taken at y = 0.
- **Calibration knobs.** For each table row, fit k_D and k_L so the sea-level run reproduces the table's
  carry and max height exactly: 2×2 Newton, about 3 iterations, condition number 3–9. Expect k_D 0.89–1.22
  and k_L 0.79–1.08. **Do not** fit land angle.
- **Altitude run.** Same k_D and k_L, with ρ = ρ_SL · (ρ/ρ_SL from the atmosphere model). Under this model
  only the ratio matters, so the deltas do not depend on the absolute sea-level density assumed for
  TrackMan's table.
- **Numerics.** RK4 with dt = 0.01 s. Use cubic-Hermite interpolation for the landing point (y = 0) and
  the apex (v_y = 0), and take the landing angle as atan2(−v_y, v_x).

**Single primary source to cite:** Penner, A. R. (2001), "The physics of golf: The optimum loft of a
driver", *Am. J. Phys.* 69(5), 563–568, doi:10.1119/1.1344164. There is an open author copy at
https://www.viurrspace.ca/server/api/core/bitstreams/59c73ed3-fece-4b2c-8e96-a14336895139/content.

- **What it covers.** Eqs 12–15 give the drag and lift forces and the equations of motion; eq. 16 is
  exactly the spin-decay law above, with the 0.00002 constant attributed to Smits & Smith. It also gives
  the ball specification and the step-size and accuracy statement. I verified all of these in the source.
- **What it does not cover.** The C_D(S) and C_L(S) *shapes* are not in Penner; they come from Smits &
  Smith (1994), *Science and Golf II* pp. 340–347. That chapter is not open access, and I saw its formula
  only secondhand, through R. D. Mehta's review text. If the documentation page shows the
  0.24 + 0.18S / 0.54 S^0.4 forms, it should add Smits & Smith as a second reference, and someone should
  check the chapter first.

  Since k_D and k_L are recalibrated per club, the docs can instead state "S-dependence after Smits &
  Smith (1994), scaled per club to the published carry and max height".

**Expected size of the altitude effect** (calibrated probe, 15 °C held constant):

| | Carry gain at 5,000 ft | Carry gain at 10,000 ft |
|---|---|---|
| PGA driver | +17 yd (+6.1%) | +30 yd (+10.5%) |
| PGA 7-iron | +16 yd (+9.0%) | +29 yd (+16.6%) |
| PGA PW | +12 yd (+8.5%) | +22.5 yd (+15.8%) |
| LPGA driver | +10 yd (+4.3%) | +15.5 yd (+7.0%) |
| Whole table, PGA | +6–9% | +10.5–17% |
| Whole table, LPGA | +4–8.5% | +7–16% |

Across the table, max height drops 1–3.5 yd at 5,000 ft and 2.3–7.2 yd at 10,000 ft. Land angle drops
3–5.4° and 6.4–11°.

At 7,800 ft these numbers agree with TrackMan's journalist-reported tour-driver figures. They also agree
with the club pattern described by TrackMan staff and with Titleist's 1.16%/1,000 ft rule (§3, §7).

**The main caveat** is the Reynolds-number question (§3). Plausible low-Re aerodynamics, with a drag
crisis on the slow descent, would cut the iron and wedge gains by up to about half. The external
evidence argues against that, but it is all secondary.

## Sources

Status: **[V]** = primary read; **[S]** = secondary only; **[n/v]** = not verified (could not access).
Accessed 2026-10-08.

Golf-ball aerodynamics and flight:

- Penner, A. R. (2001). The physics of golf: The optimum loft of a driver. *Am. J. Phys.* 69(5), 563–568.
  doi:10.1119/1.1344164. Open author copy: https://www.viurrspace.ca/server/api/core/bitstreams/59c73ed3-fece-4b2c-8e96-a14336895139/content **[V]**
- Lyu, B., Kensrud, J., Smith, L., Tosaya, T. (2018). Aerodynamics of Golf Balls in Still Air.
  *Proceedings* 2(6), 238. doi:10.3390/proceedings2060238. CC BY 4.0:
  https://mdpi-res.com/d_attachment/proceedings/proceedings-02-00238/article_deploy/proceedings-02-00238.pdf **[V]**
- Smits, A. J., Smith, D. R. (1994). A new aerodynamic model of a golf ball in flight. In *Science and
  Golf II* (Cochran & Farrally, eds.), E&FN Spon, pp. 340–347. **[S]** via Mehta's review text in
  US 11230375 B1 (https://patents.google.com/patent/US11230375B1/en), via Nathan (below), and via Penner 2001, eq. 16.
- Bearman, P. W., Harvey, J. K. (1976). Golf ball aerodynamics. *Aeronautical Quarterly* 27, 112–122.
  doi:10.1017/S0001925900007617. **[S]** (paywalled).
- Tavares, G., Shannon, K., Melvin, T. (1999). Golf ball spin decay model based on radar measurements.
  *Science and Golf III*, Human Kinetics, pp. 464–472. **[S]** via Nathan and the patent text.
- Nathan, A. M. The Spin Decay of a Baseball (note). https://baseball.physics.illinois.edu/spindown-rev1.pdf
  **[V]** as a document; **[S]** for the golf data it quotes.
- Li, J., Tsubokura, M., Tsunoda, M. (2017). Numerical Investigation of the Flow Past a Rotating Golf Ball
  and Its Comparison with a Rotating Smooth Sphere. *Flow Turbul. Combust.* doi:10.1007/s10494-017-9859-1.
  CC BY, https://pmc.ncbi.nlm.nih.gov/articles/PMC6044256 **[V]**
- Li, J. (2016). Numerical Investigation of the Aerodynamics of a Golf Ball (PhD thesis, Hokkaido Univ.).
  doi:10.14943/doctoral.k12376. https://eprints.lib.hokudai.ac.jp/repo/huscap/all/62487/Jing_Li.pdf **[V]**
- Crabill, J., Witherden, F., Jameson, A. (2019). High-Order CFD Simulations of a Spinning Golf Ball.
  *Sports Engineering*. arXiv:1806.00378 **[V]**
- Choi, J., Jeon, W.-P., Choi, H. (2006). Mechanism of drag reduction by dimples on a sphere. *Phys.
  Fluids* 18, 041702. doi:10.1063/1.2191848. **[S]** (closed).
- Aoki, K., Muto, K., Okanaga, H. (2010). Aerodynamic characteristics and flow pattern of a golf ball
  with rotation. *Procedia Eng.* 2, 2431–2436. doi:10.1016/j.proeng.2010.04.011. Gold OA, CC BY-NC-ND.
  **[n/v]** (download blocked).
- Penner, A. R. (2003). The physics of golf. *Rep. Prog. Phys.* 66, 131–171. doi:10.1088/0034-4885/66/2/202
  **[n/v]** (paywalled).
- MacDonald, W. M., Hanzely, S. (1991). The physics of the drive in golf. *Am. J. Phys.* 59, 213.
  doi:10.1119/1.16564. **[n/v]** (closed); used Bearman & Harvey coefficients per Penner 2001 **[V]**.
- Robinson, G., Robinson, I. (2013). *Phys. Scr.* 88, 018101 **[n/v]**. Comment: Højgaard Jensen, J.
  (2014), *Phys. Scr.* 89, 067001, abstract **[V]** at
  https://forskning.ruc.dk/da/publications/0f1e9047-266b-495c-b615-1efd5ddb593b. Reply: *Phys. Scr.* 89, 067002.
- Quintavalla, S. J. (2002). A generally applicable model for the aerodynamic behavior of golf balls.
  *Science and Golf IV*, ch. 30. **[S]** (form only, via EP 4218964 A1 and search-engine patent summaries).
- Jorgensen, T. P. *The Physics of Golf* (book). **[n/v]**

Rules and atmosphere:

- R&A / USGA Rules of Equipment, Part 4 (ball weight ≤ 45.93 g, diameter ≥ 42.67 mm).
  https://www.randa.org/roe/the-rules-of-equipment/part-4-conformance-of-balls **[V]**
- Altitude cross-check figures (TrackMan / Padjen, Titleist / Aoyama, player yardages) come from the
  sibling file `docs/research/reference-data.md.notes.md` and are all **[S]**.

## Open risks

1. **Reynolds-number dependence (largest).** The drag crisis (Re ≈ 4e4–1.1e5) and a possible reversed
   Magnus force overlap the slow end of every flight, and altitude moves more of the flight into that
   band. Depending on the assumed Re physics, the calibrated iron and wedge carry gains vary by about 2×
   (§3). The recommendation (Re-free) rests on secondary evidence: journalist-quoted TrackMan figures and
   players' planning yardages. No measured same-launch flights at altitude were found.
2. **Land-angle gap.** After calibration the model lands 1–9° shallower than the table, and worst for the
   PGA hybrid and long irons. The gap is unexplained. Column averaging was tested and does not explain it.
   The only knobs that close it give unphysical coefficients or impossible deltas. The land-angle *delta*
   therefore carries extra structural uncertainty, plausibly ±2–3° at 10,000 ft (judgement, not computed).
3. **The coefficient-shape source is unverified at primary level.** The Smits & Smith formula was read
   only through Mehta's review text in a patent, and the chapter was not available. Calibration makes
   the numeric constants irrelevant, but the cited S^0.4 shape should be checked against the chapter
   before publication.
4. **High-S extrapolation.** The PW reaches S ≈ 1.2 near the apex at sea level. That is inside Smits &
   Smith's measured range (≤1.4) but outside their stated model range (0.08–0.2). The Bearman & Harvey
   data stop at S = 0.3.
5. **Unknown table conditions.** The table's atmosphere is unknown; this research assumed sea level. With
   the Re-free model only ρ/ρ_SL matters, so the reference temperature cancels (checked: 1.225 vs
   1.184 kg/m³ gives identical deltas). If the table were in fact recorded at altitude, the baseline
   would be off. That belongs to the atmosphere research.
6. **Primary spin-decay sources not read.** Neither Smits & Smith's nor Tavares's original was read, and
   TrackMan's "4%/s" newsletter is not online. Low impact: all variants change deltas by ≤1.6 yd.
7. **Out of scope by design.** Wind, humidity (which changes ρ; atmosphere research), side spin, ball
   model and temperature effects on ball COR are not modelled. Ball speed, launch angle and launch spin are
   held fixed at altitude. Air acts on the ball only after launch, so this is the natural same-launch
   comparison. Any real-world change in how players swing at altitude is outside the model.
