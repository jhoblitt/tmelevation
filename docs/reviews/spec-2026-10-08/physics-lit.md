# Spec review 2026-10-08 — physics, attacked from the literature

Target: `docs/superpowers/specs/2026-10-08-tmelevation-design.md` §5.2, §5.3,
§5.5, §11. Reviewer mandate: attack (1) dropping Reynolds-number dependence and
(2) the land-angle offset, from published sources and physical reasoning.
Numerical re-implementation of the model is a separate reviewer's job.

Status: complete (2026-10-08).

## Summary

Neither decision is wrong enough to block the design. Both are argued from evidence that does not carry the weight the spec puts
on it, and the two are coupled in a way the spec does not say.

- **Decision 1 (drop Re).** The crisis band is right for modern tour balls. Lyu et al. 2018 measured Pro V1/Pro V1x/TP5X-era
  balls, spinning and not, at S up to about 0.3. Spin shifts the crisis to lower Re, and nothing open measures it at the S of
  irons and wedges. The spec's reason, "matches the published altitude evidence", does not hold up:
  - a spin-shifted-crisis variant passes **every hard oracle** with about 30 % smaller iron gains (L3);
  - most of the evidence is TrackMan's own model or TrackMan-derived planning numbers;
  - the club pattern is matched less well than the research claims, missing the wedge drop.

  Keeping Re-free is defensible on a different ground: it reproduces what TrackMan's own model does. That ground should be stated,
  with the two-sided physics range.
- **Decision 2 (land-angle offset).** Against TrackMan's *own* model shots (2014, fully specified 6-irons) the offset is only
  1–2°. The 2023 table's 6-iron rows are longer, lower and about 4° steeper than TrackMan's model gives at the same launch, which
  no single trajectory does. So most of the offset is a property of the table's land column, not of the physics (L4). The one
  physical mechanism that closes the remainder is a low-Re drag rise, which is the term Decision 1 drops.
  - As written, oracle 10 fails its hard carry band (+4.4 yd) for that reason (L5).
  - Published + Δ remains the right display. The methods page must say that Δ is computed on a shallower trajectory and carries
    about ±2° of structural uncertainty at 10,000 ft (L6).
  - TrackMan's own wind table is a primary check of the model's land-angle *response*: within 1° in all eight cases. It should
    become an oracle.

Findings by severity: major L3, L4, L5; minor L1, L2, L6; nit L7. No blockers.

## Decision 1 findings — dropping Reynolds-number dependence

### L1 — The critical-Re band is right for modern tour balls, but the spec misstates what is known about spin (minor, §5.5 item 1)

**Attacked:** the claim that the crisis band "Re ≈ 4×10⁴–1.1×10⁵" applies to the balls TrackMan's tour players use, and the
research's claim that "spin does not remove the crisis".

**Evidence.**
- Lyu, Kensrud, Smith & Tosaya (2018) measured 13 *current production* models, including the Titleist Pro V1 and Pro V1x,
  TaylorMade TP5X, Srixon Z-Star XV and Callaway Chrome Soft (Table 1), in still air. Non-spinning C_D is "near 0.5 at …
  Re = 5 × 10⁴, and close to 0.2 at … Re = 1 × 10⁵" (§3.1.1). Spinning balls at 1500–2500 rpm show "a drag crisis similar to
  non-rotating balls" (§3.1.2). **[primary]** So the band is not an artefact of the 1976 Bearman & Harvey or 2006 Choi balls:
  it holds for modern multi-layer urethane balls. The spec is right on the band.
- At Lyu's crisis speeds (≈18–35 m/s), 1500–2500 rpm is S ≈ 0.1–0.32 (derived). The crisis is therefore *measured* up to S ≈ 0.3,
  not only for non-spinning balls. The research's variant (iii) calls its ΔC_D "Lyu's non-spinning crisis"; the spinning fit
  (Fig. 3b: C_D ≈ 0.52 at Re 5×10⁴, ≈0.26 at 7.8×10⁴, ≈0.20 at 10⁵) has the same size.
- Spin *moves* the crisis. Li, Tsubokura & Tsunoda (2017, Table 1) find that at Γ = 0.1 the rotating ball's C_D at the critical
  Re is 19 % *below* the non-rotating ball's. They attribute this to earlier transition on the side rotating against the flow,
  where "the local Reynolds number increases". **[primary]** Kim, Choi, Park & Yoo (2014, JFM 754 R2, abstract) give the same
  mechanism for spheres. **[primary, abstract only]** The effect therefore grows with S.
- Lyu measured lift only at 32–91 m/s "to avoid the influence of the reverse Magnus effect at low speed" (§3.2). No open
  dataset gives a golf ball's C_D or C_L in the crisis band at S > 0.3. Smits & Smith had such data (S to 1.4, Re down to 4×10⁴)
  but published a closed form only for 7×10⁴ < Re < 2.1×10⁵, 0.08 < S < 0.2 **[secondary, via Mehta's text]**.
- Where the crisis sits depends on the ball design. Lyu's ball-to-ball C_D spread exceeds 0.1 below Re 10⁵ and is under 0.05
  above it (abstract). Li (2017) puts it near 5×10⁴ for Bearman & Harvey's deep dimples and near 8×10⁴ for a 392-dimple ball.
  US 8,197,361 B2 reports that at DSP ≤ 0.4 near Re 6×10⁴ the Pro V1's lift "remains positive while the 173 golf ball becomes
  negative" **[primary patent text]**. Reverse Magnus is therefore pattern-specific, and for the Pro V1 it was not seen at
  DSP ≤ 0.4.

**Recommended change.** Keep the band. Reword §5.5 item 1 to say: the crisis is measured for current tour balls up to S ≈ 0.3.
Its behaviour at the S = 0.3–1.2 that irons and wedges reach late in flight is *unmeasured* in open literature. Spin is known to
shift it to lower Re, so its effect on iron and wedge deltas is unknown in size. The plausible variants span about −30 %
(spin-shifted crisis) to +25 % (Smits & Smith sin term) on iron gains (L3), which is not the same claim as "up to about 2×".

### L3 — "Matches the published altitude evidence" is not established: the hard oracles cannot tell the Re-free model from a Re-dependent one (major, §5.5 item 1, §8.3, §11 risk 1)

**Attacked:** the spec's stated reason for dropping Re: "the Re-free model is the one that matches the published altitude
evidence (section 8.3)".

**Evidence.**
- *The oracles do not discriminate* (throwaway probe; every variant calibrated to the table's carry and max height as in §5.3).
  Two variants pass **every hard oracle** in §8.3 (1–6, 8):
  - **Dsh** adds Lyu's spinning-ball crisis ΔC_D, but shifts it to lower Re as spin rises. It evaluates ΔC_D at Re·(1+S)/1.2,
    following the advancing-side mechanism in Li (2017) and Kim (2014).
  - **Efade** applies the crisis only over the S ≤ 0.3 range where it was measured.

  Both fail only the soft ordering oracle 7, and narrowly: PW 7.8 % vs 7-iron 7.7 % for Dsh. Their iron gains are about 30 %
  smaller than the spec model's. At 6,300 ft the PGA 7-iron gains +7.7 % under Dsh and +11.2 % under the spec model. The PGA
  mean at 7,200 ft is +7.0 % against +10.8 %. The crisis-for-all-S variant fails oracles 5–7, and the Smits & Smith sin(Re) term
  fails oracles 1, 4, 5 and 8. The bands are wide (§8.3 says so). Passing them shows the model is not absurd. It does not show
  that Re dependence is absent.
- *The evidence mostly measures TrackMan's own model, not physics.*
  - Oracles 1–3 are TrackMan's model, as the research itself says.
  - Oracle 5 is TrackMan Support's wording.
  - Oracles 6–7 are caddie planning sheets. Players spent that week "checking and rechecking their Trackman numbers"
    (Global Golf Post, per reference-data, **[secondary]**). DeChambeau: "We use the normalised numbers we get on two devices
    on the range" (Golf Digest 2020-02-21, read at the republished page). The planning numbers are TrackMan output: either
    TrackMan's normalization model or TrackMan-measured range flights.
  - Oracle 4 (Titleist) is an industry rule of thumb with no disclosed basis.
  - Oracle 8 comes closest to measurement: Penge's "work on the range with monitors" at 1,500 m, plus a Golf Digest paraphrase
    of TrackMan.

  TrackMan's ball model is proprietary: "Every golf ball has its own aerodynamic model" (TrackMan 2014, **[primary]**). Agreement
  with these sources therefore says the Re-free model resembles TrackMan's model. It says nothing about which Re physics is true.
- *The club-pattern match is weaker than claimed.*
  - Both caddie sheets put the PW 2.3–3.8 points below the 7-iron. Penge's launch-monitor numbers at 1,500 m are "five percent
    in the wedges", 7.5 % for the 6–9 irons and 5 % for the woods (DP World Tour 2026, **[secondary]**).
  - The spec model puts the PW only 0.7 points below the 7-iron at 6,300 ft.
  - At 4,920 ft the spec model gives driver/woods +6.0–7.5 %, 6–9 irons +8.1–9.0 % and PW +8.3 %. It is 1–3 points above
    Penge everywhere, most of all on wedges. Dsh gives 4.2–5.3 %, 5.7–7.0 % and 6.5 %.
  - Penge's figures are the only ones in the evidence set that come from range work at altitude. They sit between the two models.
    (Penge's "wedges" may mean 50–60° clubs rather than the table's PW. The caddie-sheet PW comparison does not have that
    ambiguity.)
- *Padjen's low-trajectory driver* (TrackMan model, **[secondary]**): 277 → 288 yd (+4.0 %) at 7,800 ft. The spec's driver
  coefficients can reproduce that sea-level shot (8.9°, 277 yd, 76 ft apex) only at ≈182 mph ball speed and 1,340 rpm. That is
  unphysical for a 113 mph swing (smash 1.61). The spec model then predicts +6.1 %. The +8.5 % match on the high-trajectory case
  is real, but the pair as a whole is not reproduced.

**Recommended change.**
- Keep the Re-free model as the baseline, but restate why. The tables are TrackMan's, and what evidence there is about
  TrackMan's own altitude model fits the Re-free model best: Padjen high +8.5 % exactly, and the land-angle response to wind
  (L5).
- Rewrite §5.5 item 1 and §11 risk 1 to say so, and to say that a physically motivated spin-shifted crisis also passes every
  hard oracle with about 30 % smaller iron gains. The two-sided physics range is roughly −30 % (spin-shifted crisis) to +25 %
  (Smits & Smith sin term) on iron gains. Do not call it "up to about 2×".
- In §8.3, label each oracle by what it measures: TrackMan model, TrackMan-derived planning, or launch-monitor at altitude.
- Add a soft oracle from the caddie sheets: at 6,300 ft, gain(PW) ≤ gain(7-iron) − 1.5 points. Both sheets show −2.3 and
  −3.8 points. The spec model gives −0.7 and fails it today, and the methods page should show that failure. Oracle 7 as written
  (PW ≤ 7-iron) is too weak to test the wedge drop the sources describe.

### L7 — "The reference temperature cancels" is a convenience, not evidence for the Re-free choice (nit, §5.5 item 1)

§5.5 item 1 gives, as part of the case for dropping Re, that "the deltas depend only on P/P₀, so the assumed reference
temperature cancels". That is true of the Re-free model; the research probe checked it at 1.225 against 1.184 kg/m³. But it is
a property of the simplification, not evidence that the simplification is right. §5.1 already fixes the temperature at 25 °C, so
a Re-dependent model would be just as well defined. **Recommended change:** move the sentence to §5.1 or §5.4 as a consequence
of the model, and out of the justification.

## Decision 2 findings — the land-angle offset

### L2 — The definitions match the model, so the offset is not a measurement-plane artefact (minor, §5.2 / §5.5 item 2)

**Attacked:** the hypothesis that TrackMan measures land angle or max height against a different reference (tee height, ground
at the landing point) than the model's y = 0 launch and y = 0 landing.

**Evidence.** TrackMan defines Landing Angle as "the angle the golf ball lands at relative to the horizon and at a point that
has the same elevation as where it was launched". Height (Apex) is "measured relative to the elevation at which the golf ball
was launched". Carry runs to the point where the ball crosses the launch elevation, and Hang Time is the time "to carry flat"
**[primary, TrackMan Support, 2025]**. These are exactly the model's definitions. Tee height (≈ 0.03 m for a driver, 0 for
irons) is the launch elevation, so it cannot matter either.

One caveat follows from the definition. A ball that lands *above* its launch elevation (an elevated green, an uphill range)
never physically crosses the launch plane. TrackMan must then extrapolate its own model below the landing point. For those shots
the table's land angle is partly TrackMan-model output. The tour-averages post says only that the data come "from competition as
well as on the range" **[primary]**.

**Recommended change.** On the methods page, state TrackMan's three definitions and that the model uses the same reference plane.
Remove "definition mismatch" from the list of candidate causes.

### L4 — Most of the 6-iron offset lies between TrackMan's table and TrackMan's own model, and the one physical mechanism that closes the rest is the Re term §5.5 item 1 drops (major, §5.5 item 2, §11 risk 2)

**Attacked:** "the cause is unresolved", and the implied framing that the offset is a defect of this project's physics.

**Evidence.**
- *TrackMan's own model trajectories.* TrackMan's 2014 Normalization post gives two fully specified model shots **[primary,
  images read directly]**:
  - PGA 6-iron: 130 mph, 14.7°, 6088 rpm → 184 yd, 33.8 yd, 48.0°.
  - LPGA 6-iron: 110 mph, 18.6°, 5950 rpm → 152 yd, 27.7 yd, 45.6°.

  Calibrated to those carries and heights, the spec model lands at 46.2° and 44.5°: **−1.8° and −1.1°**. Calibrated to the 2023
  table's 6-iron rows, it is −5.5° and −4.2°.
- *The table row disagrees with TrackMan's model at the same launch.* The spec model calibrated to TrackMan's model shot and
  flown at the table's PGA 6-iron launch (130 mph, 14.0°, 6204 rpm) gives 183.7 yd, 32.7 yd and 45.7°. The table says 188 yd,
  32 yd and 50°. The table row is 4 yd *longer*, about 1 yd *lower*, and 4° *steeper* than a TrackMan-model-like trajectory.
  A single trajectory cannot do that: longer and lower means flatter. The LPGA row shows the same pattern: 153.2, 25.3, 42.5
  against the table's 155, 25, 46. Swapping the lift and drag shapes does not change this. So two thirds to three quarters of
  the 6-iron gap comes from the table's land-angle column. TrackMan's own model does not produce it from the table's launch, carry and
  height either.
- *Mechanisms ruled out or bounded* (throwaway probe, each followed by re-calibration):
  - Measurement-plane definition: ruled out (L2).
  - Shot-to-shot dispersion: −0.45°, the wrong sign (research probe).
  - Wind that cancels to first order across opposite-direction stat holes: TrackMan's own wind table shows the second-order
    term is non-zero. Averaging 10 mph head and tail wind gives +0.8° land angle and −2 yd carry, with apex unchanged.
    Re-calibrating to wind-averaged data leaves only −0.1 to −0.45° of residual for an along-line wind of RMS 4.5–10 mph.
  - Spin decay (none, Smits, TrackMan's "4 %/s", 3× Smits): ≤0.2°.
  - C_L saturating above S = 0.3, or a steeper C_D(S) slope (0.22 + 0.35 S): ≤0.8°.

  None reaches the 3–9° seen on woods, hybrids and long irons.
- *What does close it.* Adding the measured low-Re drag rise (Lyu 2018, Fig. 3b) late in flight brings the PGA residuals to
  within about ±2° for 10 of 12 clubs: hybrid −5.0°, 3-iron −3.0°, driver +1.1°. It overshoots the LPGA short irons by
  +4.0 to +4.7°. The research probe found the same ("best sea-level land match"). Physically this is expected. Drag that
  rises as the ball slows takes horizontal speed away on the descending branch, and a steeper descent at fixed carry and apex
  follows. But applied at all S, the rise wrecks the iron deltas (L3), and
  the spin-shifted version closes only about a third of the gap.

**Conclusion.** The offset has two parts.
- About 1–2° is a real structural difference between the spec model and TrackMan's model.
- The rest is a property of the table's land column. It is not a calm, single-trajectory triple consistent with the table's
  launch, carry and height, even under TrackMan's own model. The likely explanation is provenance: "competition as well as on
  the range", per-column averages over possibly different shot sets, and TrackMan's extrapolation to the launch plane when a ball
  lands above it. That is unverified (see Unverified concerns).

To whatever extent the offset is physical, it points *toward* a late-flight drag rise, which is the Re dependence §5.5 item 1
removes. The spec presents the two limitations as independent. They are coupled.

**Recommended change.** Replace "the cause is unresolved" in §5.5 item 2 and §11 risk 2 with the three facts above:
- Against TrackMan's own model shots the offset is 1–2°.
- The table's land column is steeper than TrackMan's model gives at the table's launch.
- The only physical mechanism found that closes it is the low-Re drag rise left out in item 1.

Methods-page table 4 should show TrackMan's 2014 model 6-irons beside the table rows.

### L5 — Oracle 10 as specified fails, and for the reason in L4; recast it on TrackMan's model shots and add TrackMan's wind responses (major, §8.3 oracle 10)

**Attacked:** oracle 10's design, "TrackMan model 6 Iron at sea level with the calibrated PGA / LPGA 6 Iron factors … carry
±4 yd (hard)".

**Evidence.**
- Fitted to the 2023 PGA 6-iron row (k_D 1.150, k_L 0.927) and flown at TrackMan's 130 mph, 14.7°, 6088 rpm, the spec model
  gives **188.4 yd, 33.2 yd, 45.1°** against 184 yd, 33.8 yd, 48.0°. That is +4.4 yd, outside the hard ±4 yd band. The result is
  unchanged at dt = 0.5 ms, and in a Re-free model it does not depend on the absolute ρ₀.
- Land is −2.9°, just inside the soft ±3°. LPGA: 153.9 yd, 27.4 yd, 43.9° against 152, 27.7, 45.6, which passes.
- The 4 yd is the table-versus-TrackMan-model inconsistency of L4. The reference-data research already noticed it ("carries
  4 yd farther … despite lower launch and higher spin"). It is not a model error, so tuning the band to pass it would hide the
  finding.
- The same TrackMan post gives the 6-iron model shots under 10 and 20 mph head- and tailwinds **[primary]**. These are the only
  primary TrackMan-model responses to a change in aerodynamic loading with launch conditions fully stated. Calibrated to the calm
  shot, the spec model matches TrackMan's *land-angle responses* within 1° in all eight cases. PGA TW20 is −14.4° against −15.3°;
  HW20 is +21.6° against +21.5°.
  It over-responds in carry by 9–19 %: PGA TW20 +26.6 yd against +23, HW20 −44.6 against −41. Apex responses are within
  1.1 yd.

**Recommended change.**
- Recast oracle 10 to calibrate k_D and k_L *to TrackMan's model shot itself* (184 yd and 33.8 yd; 152 yd and 27.7 yd). Check
  the land angle (soft, ±3°; the spec model gives −1.8° and −1.1°).
- Add TrackMan's wind responses as soft oracles: land-angle response ±2°, carry response within ±25 % or ±4 yd, whichever is
  larger. TrackMan rounds carry to whole yards. Flying a constant along-line wind needs a test-only wind argument on
  `flight.js` (relative-velocity aerodynamics). That is a small seam cost for the only primary check of the model's response to
  a change in air loading.
- Do not fix the failure by widening the band.

### L6 — "Published + Δ" is defensible for land angle, but Δ carries about ±2° of structural uncertainty at 10,000 ft and the methods page must say it is computed on a shallower trajectory (minor, §4.3, §5.4, §5.5 item 2)

**Attacked:** displaying round(published + Δ) for land angle when the model's own sea-level land angle is up to 9° off.

**Evidence.**
- The level and the change come from different places. The level is TrackMan's measured average, which L4 shows is not
  reproducible as one trajectory. Δ is a property of the aerodynamics. TrackMan's wind table is a primary check of that property,
  and there the spec model's land-angle *response* is within 1° of TrackMan's model (L5). Adding a model Δ to a measured level is
  therefore the better of the available choices. Displaying the model's absolute land angle would be 1–9° wrong at sea level and
  would break success criterion 1.
- How far Δ moves across the variants that are physically plausible and pass the hard oracles (A, Dsh, Efade; probe), at
  10,000 ft:
  - PGA driver: −7.8 to −10.1°.
  - 7-iron: −5.7 to −8.7°.
  - PW: −3.9 to −7.1°.

  That is roughly ±1.5° about the midpoint, rising to ±2° if the crisis-for-all-S variant is included.
- Against Padjen's TrackMan figures (**[secondary]**: −9° for both trajectories at 7,800 ft), the spec model gives −7.9° for
  the table driver, and −7.7° and −7.1° for the two Padjen shots. It may under-respond by 1–2° on drivers.
- Spin-decay choice does not matter (≤0.2°, after re-calibration).

**Recommended change.** Keep published + Δ for land angle. The methods page should say three things:
- The model's own sea-level land angle is shallower than the table by up to 9° (show it per row, as already planned).
- Δ is computed on that shallower trajectory.
- Its structural uncertainty is about ±2° at 10,000 ft. This is a reasoned bound from the variant spread above, not a
  confidence interval. For comparison, the same variants span +7.7 % to +11.2 % for the PGA 7-iron's carry gain at
  6,300 ft.

A short qualifier beside the Land Angle column header ("indicative") would carry this to the main page without clutter.

## Unverified concerns

Plausible, but not established by evidence found in this review. Not findings.

- **U1 — Per-column averaging over different shot sets.** TrackMan's post says the data come "from competition as well as on
  the range" and that stat holes run in opposite directions, but not whether every column averages the same shots. If land
  angle and max height came only from fully tracked shots (range, say) and carry partly from competition, the row would not be
  one trajectory. That would explain L4's inconsistency. Unverified; TrackMan publishes no methodology at that level.
- **U2 — TrackMan's extrapolation to the launch plane.** Shots landing above the launch elevation need extrapolation (L2). The
  extrapolation would steepen or flatten the reported land angle depending on TrackMan's descent model. No TrackMan document
  found describes it.
- **U3 — TrackMan's ball model may itself be Re-dependent.** "Every golf ball has its own aerodynamic model" (TrackMan 2014).
  If TrackMan's normalization includes low-Re effects, matching its outputs with a Re-free model is coincidence over the tested
  range. Nothing public settles this.
- **U4 — Ball generation.** The comparison with TrackMan's model in L4 and L5 uses its 2014 "premium ball" model against
  2023-era balls. Ball aerodynamics changed in that period (Lyu: model-to-model C_D spread > 0.1 below Re 10⁵), so part of L4's
  4 yd / 4° could be the ball rather than the averaging.
- **U5 — High-S, low-Re data exist but were not read.** Smits & Smith (1994) measured S to 1.4 at Re down to 4×10⁴. Aoki, Muto &
  Okanaga (2010, Procedia Eng. 2:2431, gold OA, but ScienceDirect refused automated download) measured a rotating 328-dimple
  ball. Either could settle whether the crisis survives at iron and wedge S. A human with a browser can read Aoki at
  doi:10.1016/j.proeng.2010.04.011.
- **U6 — Wind shear.** L4's wind estimate uses TrackMan's constant-wind convention. Real wind is stronger at apex height, which
  enlarges the second-order term. It is still very unlikely to reach 4–9°.
- **U7 — A better altitude oracle may exist.** PGA TOUR radar stats (TrackMan-measured carry, apex, launch and spin per event)
  for Barracuda (Tahoe), WGC-Mexico 2017–2020 and the 2024 BMW at Castle Pines would be *measured* same-field flights at altitude,
  not model outputs. Not retrieved: the stats pages are JavaScript applications.

## Recommended spec changes

In priority order. None requires changing the model itself.

1. **§8.3 oracle 10 (L5, major).** Calibrate to TrackMan's 2014 model shots (PGA 184 yd / 33.8 yd, LPGA 152 / 27.7) and check
   land angle, soft ±3°. Do not keep the current form: as written it fails its hard carry band (+4.4 yd) because the table and
   TrackMan's model disagree. Add TrackMan's 10 and 20 mph head- and tailwind responses as soft oracles (land ±2°; carry ±25 % or
   ±4 yd). That needs a test-only wind argument in `flight.js`.
2. **§5.5 item 1 and §11 risk 1 (L3, major).** Justify Re-free as "closest to TrackMan's own model (Padjen +8.5 %; TrackMan's
   wind responses), which is what the page emulates". Do not say "the model that matches the published altitude evidence".
   State that a spin-shifted drag-crisis variant also passes every hard oracle with about 30 % smaller iron gains, and that the
   physics range on iron gains is about −30 % to +25 %. Label every §8.3 oracle by provenance (TrackMan model, TrackMan-derived
   planning, launch monitor at altitude).
3. **§8.3 (L3).** Add a soft oracle for the wedge drop the sources agree on: at 6,300 ft, gain(PW) ≤ gain(7-iron) − 1.5 points.
   Show its current failure on the methods page.
4. **§5.5 item 2 and §11 risk 2 (L4, major).** Replace "cause unresolved" with:
   - against TrackMan's own model shots the offset is 1–2°;
   - the table's land column is steeper than TrackMan's model gives at the table's launch;
   - the only physical mechanism found that closes it is the low-Re drag rise that item 1 omits, so the two limitations are
     coupled.

   Methods-page table 4 should show TrackMan's 2014 model 6-irons beside the table rows.
5. **§4.3 / §6 (L6).** Keep published + Δ for land angle. On the methods page, state that Δ is computed on a trajectory up to 9°
   shallower than the table's, with about ±2° structural uncertainty at 10,000 ft. Consider an "indicative" qualifier on the Land
   Angle column header.
6. **§5.5 item 1 (L1).** Say the crisis is measured on current tour balls up to S ≈ 0.3, that spin shifts it to lower Re, and
   that it is unmeasured in open literature at S = 0.3–1.2.
7. **§5.5 item 2 and §6 (L2).** Quote TrackMan's definitions (all three referenced to the launch elevation) and note that the
   model uses the same plane.
8. **§5.5 item 1 (L7, nit).** Move "the reference temperature cancels" out of the justification.

## Sources

P = read at the primary source in this review; S = secondary only; A = abstract only. All accessed 2026-10-08.

- P — Lyu, B., Kensrud, J., Smith, L., Tosaya, T. (2018). Aerodynamics of Golf Balls in Still Air. *Proceedings* 2(6), 238.
  doi:10.3390/proceedings2060238. PDF text and rendered Fig. 3:
  https://mdpi-res.com/d_attachment/proceedings/proceedings-02-00238/article_deploy/proceedings-02-00238.pdf (§§2, 3.1.1, 3.1.2,
  3.2, 3.3; Table 1; Fig. 3a/b).
- P — Li, J., Tsubokura, M., Tsunoda, M. (2017). Numerical Investigation of the Flow Past a Rotating Golf Ball and Its Comparison
  with a Rotating Smooth Sphere. *Flow Turbul. Combust.* doi:10.1007/s10494-017-9859-1. Europe PMC full text, PMC6044256
  (Methods; Fig. 4–5 discussion; Table 1).
- A — Kim, J., Choi, H., Park, H., Yoo, J. Y. (2014). Inverse Magnus effect on a rotating sphere: when and why. *J. Fluid Mech.*
  754, R2. doi:10.1017/jfm.2014.428 (Crossref abstract).
- A — Aoki, K., Muto, K., Okanaga, H. (2010). Aerodynamic characteristics and flow pattern of a golf ball with rotation.
  *Procedia Eng.* 2, 2431–2436. doi:10.1016/j.proeng.2010.04.011 (Semantic Scholar abstract; full text not obtained).
- P — Li, J., Tsubokura, M., Tsunoda, M. (2015). Numerical investigation of the flow around a golf ball at around the critical
  Reynolds number… *Flow Turbul. Combust.* 95, 415–436. Kobe repository AM, https://hdl.handle.net/20.500.14094/90003493
  (non-spinning; context only).
- P (text only, figures not seen) — US 8,197,361 B2, "Low lift golf ball". https://patents.google.com/patent/US8197361B2/en
  (TrackMan-radar-derived C_L/C_D method; Pro V1 vs 173-pattern lift near Re 6×10⁴).
- S — Smits, A. J., Smith, D. R. (1994), *Science and Golf II* pp. 340–347, via R. D. Mehta's text in US 11230375 B1, as recorded
  in `docs/research/aero-model.md.notes.md`. Not re-read here.
- P — TrackMan, "Normalization feature explained", 2014-07-09, https://www.trackman.com/blog/golf/normalization-feature-explained ,
  and its table images (PGA and LPGA 6-iron calm and wind):
  https://a.storyblok.com/f/117513/407x210/0ce2fd44b7/pga-tour-6-iron.png ,
  https://a.storyblok.com/f/117513/410x208/acc893e2e4/lpga-tour-6-iron.png .
- P — TrackMan Support, "Parameters | Landing Angle (Tee to Green)", 2025-08-06,
  https://support.trackmangolf.com/hc/en-us/articles/39727190664859-Parameters-Landing-Angle-Tee-to-Green
- P — TrackMan Support, "Parameters | Height (Apex)", 2025-08-06,
  https://support.trackmangolf.com/hc/en-us/articles/39726869324699-Parameters-Height-Apex
- P — TrackMan Support, "Practice | Trackman Data Parameter Definitions", updated 2025-11-27,
  https://support.trackmangolf.com/hc/en-us/articles/5089892383515-Practice-Trackman-Data-Parameter-Definitions
- P — TrackMan, "Introducing updated tour averages", https://www.trackman.com/blog/introducing-updated-tour-averages
  (data provenance paragraph).
- P (publisher) — Brian Wacker, Golf Digest / Australian Golf Digest, 2020-02-21,
  https://www.australiangolfdigest.com.au/heres-what-tour-pros-are-doing-in-mexico-city-to-adjust-to-playing-at-altitude/
  (DeChambeau, Simpson quotes).
- S — Padjen/TrackMan (PGA TOUR 2017), TaylorMade caddie sheets (2024), Penge (DP World Tour 2026), Global Golf Post (2024), as
  recorded in `docs/research/reference-data.md`. Not re-read here.

Throwaway probe (not product code): `/tmp/claude-1000/review-physics-lit/scripts/` (`fm.py`, `t1_wind.py` … `t6_padjen.py`),
outputs `/tmp/claude-1000/review-physics-lit/out_*.txt`.
