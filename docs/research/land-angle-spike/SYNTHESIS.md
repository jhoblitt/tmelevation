# Land-angle model spike — synthesis

2026-10-09. Coordinator's synthesis of the three probes in this directory,
answering the question in `BRIEF.md`. Every number below was re-checked
against the probe files or re-derived; where a probe document was wrong, the
correction is noted.

**Round 2 (at the end) supersedes this section's recommendation and next
experiments.**

## Answer

**Not yet, and not with today's evidence.** A measured mechanism exists that
moves land angle the right way and improves the prediction of all three
outputs, but at the strength the table asks for it sits beyond the measured
data and conflicts with the altitude behaviour golfers report. Part of the
remaining gap also looks like how the table was compiled rather than physics.
No law met the success bar (land ≤ 1.5°, carry ≤ 2 yd, height ≤ 1 yd).

## What the spike established

1. **Modern tour balls lose lift sharply at low airspeed** (probe 1;
   `aero-data.md`, `aero-data.csv`). Above Re ≈ 7.5e4 (≈ 27.5 m/s at 25 °C,
   sea level) lift depends on spin ratio alone: refitting the CSV's 76
   modern-ball points gives `C_L ≈ 0.063 + 0.871·S` (rms 0.025; probe 1
   reports 0.065 + 0.85·S on 81). Below it, measured C_L as a share of that
   law has a median of 0.68 at Re 6.6–7.5e4, 0.05 at 5.8–6.6e4 (reversing to
   C_L −0.14 on some balls), and 0.36 at 4.5–5.8e4; drag rises in the same
   band (Lyu, Kensrud & Smith 2020; Bridgestone patents). No modern-ball data
   exist below Re 7e4 above S = 0.36, which is where iron and wedge descents
   end.
2. **The shipped lift law has the wrong shape late in flight.** Smits & Smith's
   `0.54·S^0.4` runs 30–50 % above modern balls at S ≤ 0.15 and grows as the
   ball slows, the opposite of the measured loss. The measured loss is the
   "balloon, then drop" shape: lift strong through mid-flight, gone late.
3. **That mechanism fits the table much better** (probe 2; `model-fits.md`).
   With one shared parameter set for all 23 rows, RMS carry / height / land
   goes from 7.58 / 2.19 / 4.21 (today's laws) to 4.09 / 1.92 / 2.38 (lift lost
   below Re ≈ 7.7e4). Under the app's per-row calibration, land RMS goes from
   4.65° to 1.76° with a sharp drag rise near Re 7–7.5e4.
4. **At that strength it breaks altitude.** Thin air lowers Re at a given
   speed, so the loss band arrives earlier in the flight: LPGA iron carry
   *falls* by about 7 % at 10,000 ft under the best shared law. Holding a
   defensible altitude response halves the effect. The best held candidate
   (F2-c1000) reaches land 2.02° (cross-validated 2.06°) but **fails hard
   oracle 9a** (carry dips ≤ 0.52 yd at 9,500–10,000 ft); `model-fits.md`
   claimed it passed every hard oracle, and now carries an erratum.
5. **The fits want more than was measured.** Steps sharper than measured,
   drag slopes in S at or past the measured top (0.8–2 against ≤ 0.68), acting
   at S 0.4–1.3 where nothing is measured.
6. **A tour-shaped residual survives every law.** PGA hybrid and long irons
   stay too shallow and LPGA short irons too steep; each tour fits alone to
   1.3–1.6° with different parameters, and the LPGA rows alone reject the lift
   loss. No shared law flies the PGA driver within 8 yd of its carry.
7. **The table is not one population** (probe 3; `provenance.md`). The driver
   rows match PGA TOUR's 2022-23 TrackMan radar season within 1–2 units, and
   94 % of those tee shots with a measured apex also have a measured ground
   impact, so driver land angles are mostly measured. The other rows are
   probably range data with an unknown modelled share; columns average
   different shot sets (PGA TOUR: 113,979 carry vs 121,740 apex attempts);
   the 2010 and 2019 editions said location and weather were not considered,
   and the 2023 edition says nothing. The gap follows spin combined with low
   launch, not carry or flight time: rows under 2,600 rpm sit at −1.1 to
   −1.5°, the low-launch 4,300–4,800 rpm PGA 5-wood, hybrid, 3- and 4-iron at
   −6.5 to −9.2°.
8. **Spin decay is not the lever.** The one measured flight (TrackMan radar,
   Pro V1x, ≈ 75 rpm/s over a driver flight) sits at or slightly below the
   shipped law; scaling decay ×16 moves the mean PGA gap only 5.2° → 4.5°.
9. **TrackMan's 2014 model lacks the steepening** (informational, per the
   user's ruling): laws that fit the 2023 land column land 2–4° steeper than
   TrackMan's 2014 model 6-irons.
10. **No independent check exists** for land angle, apex and carry together,
    or for apex and land angle at altitude. The only new altitude datum is
    Arccos's 2026 GPS figure: amateur total driver distance +8.7 % at
    5,000+ ft.

## Recommendation

- **The app:** keep the shipped laws and "published + Δ". No candidate is both
  better and shippable: the one that keeps altitude defensible still fails
  CI. Correct the methods page's land-angle limitation with these findings —
  it currently attributes most of the gap to averaging, which the spike does
  not support.
- **The base for the 3-D project:** build on measured, Re- and S-dependent
  coefficient surfaces in vector form — the supercritical linear C_L(S), the
  low-Re lift loss and drag rise bounded by the measured data — not on the
  Re-free Smits & Smith law. A Re-free model cannot represent the mechanism
  this spike found, nor temperature or humidity beyond density.
- **The crux to settle before trusting any weather or altitude prediction:**
  how the low-Re band behaves at S > 0.36, and how real iron carry changes at
  altitude. The two are coupled: if the measured loss holds at high spin,
  altitude gains for irons are smaller than density alone predicts.

## Next experiments

1. **Measured-surface refit** (cheap; harness exists): fix C_L and C_D to the
   measured surfaces, fit only measured-bounded parameters (onset Re 7–8e4,
   minimum 5.5–6.5e4, depth 0.4–1.3), and report both modes and altitude.
2. **Provenance test:** refit with per-tour and driver-versus-rest land
   offsets; if the residual collapses, the table's compilation explains it.
3. **The S > 0.36, Re < 7e4 gap:** read Aoki, Muto & Okanaga 2010 (Procedia
   Engineering 2:2431, open access, but it refused every automated download;
   13 points are seen only through a 2019 reproduction) and search for wedge
   aerodynamics.
4. **Independent altitude data for irons**, which decides finding 4.

## Files

- `BRIEF.md` — question, binding decisions, rules.
- `aero-data.md`, `aero-data.md.notes.md`, `aero-data.csv` — probe 1.
- `model-fits.md`, `model-fits.md.notes.md`, `harness/` — probe 2. The harness
  is throwaway spike code; `harness/out/*.txt` are the run summaries the
  documents cite. The raw `harness/out/*.json` fit dumps (3.5 MB) are not
  committed; re-running `harness/run-family.mjs` regenerates them.
- `provenance.md`, `provenance.md.notes.md` — probe 3.

---

## Round 2 (2026-10-09)

Round 2 ran under the user's rulings in `BRIEF.md` ("Round 2", "Round 2b"):
one physics for both tours and every club, and altitude checks soft unless a
measurement backs them. Files: `round2.md`, `round2-conditions.md`,
`conditions.md`, `round2b.md`, `altitude-evidence.md`, `round2c.md`, each with
its notes. The headline numbers below were re-run or recomputed by the
coordinator.

### Findings

1. **Measured surfaces, nothing fitted, already beat today's model.** With
   C_L and C_D pinned to the measured supercritical laws and no low-Re band
   (R0), the app's per-row calibration lands at 3.96° RMS against 4.65°, and
   all five of the app's hard oracles pass (`harness/out/R0-nominal.txt`).
2. **Adding the measured low-Re band fits land best,** fading with spin ratio
   where no data exist: per-row calibration 1.62° (CV 1.79°) with a slow fade
   (R3); one shared law set 5.39 / 2.04 / 2.73 yd / yd / ° (CV 5.88 / 2.12 /
   2.81) with a fade by S ≈ 0.6 (R2). Keeping the band at every S fits worse
   than no band. No law met the success bar.
3. **The band costs iron gains at altitude.** Under per-row calibration the
   banded laws give the PGA 7-iron +6.0 to +8.7 % at 6,400 ft against players'
   planned +12–14 % (soft oracle 6; R0 +11.7 %, today +11.3 %). LPGA iron
   carry turns over between 600 and 8,100 ft; under R2 the LPGA 5-iron peaks
   at 600 ft. Physically coherent — thin air lowers Re at a given speed, so
   the band arrives earlier — but no measurement confirms or refutes it for
   irons.
4. **Different air per tour is not the explanation.** Fitting one effective
   air density per tour moves carry but not land, and needs the PGA in
   3.5–7.7 % thinner air. The real schedules differ by 0.2 %: event-weighted
   tournament-week air is 0.9918 (40 PGA TOUR radar events, 2022-23) and
   0.9937 (32 LPGA events, 2023) of 25 °C sea level. The tour-shaped land
   residual stays unexplained; it is not physics shared across tours and not
   venue air.
5. **The raw radar driver wants a faster descent.** PGA TOUR's 2022-23 radar
   averages (172.85 mph, 10.49°, 2571 rpm; carry 283.8 yd to ground impact,
   apex 34.0 yd at 65.5 % of carry, hang 6.4 s; venue air 0.992). Unfitted,
   the measured surface gives 6.38 s and 64.1 % with the apex 4.8 yd low;
   today's law gives 7.67 s with the apex 9.3 yd high. Calibrated to the raw
   carry and apex, every law hangs 0.40–0.55 s too long (0.26–0.49 s after an
   assumed shot spread) and the laws differ by at most 0.15 s.
6. **One hard altitude reference exists — drivers only, ≤ 7,746 ft.** PGA
   TOUR on-site radar, player-paired: Chapultepec (ρ 0.78) +16 to +22 yd over
   four years, Castle Pines (0.80) +27.5 yd with apex −10.5 %, Old Greenwood
   (0.81) +23.0 yd; sea-level control −1.1 %. Players launched 1–3° higher at
   these events. Whether that shift is real decides the scoring: with it,
   only R2 calibrated to the raw driver passes all six events, and today's
   law overshoots Chapultepec by 15–23 yd; without it, nothing passes all
   six. Nothing measured exists for irons, above 7,746 ft, or showing carry
   falling with altitude.

### Recommendation

- **Base for the 3-D project.** Coefficients as `C_D(Re, S)` and
  `C_L(Re, S)` in vector form, built from the measured supercritical laws
  (R0), plus an explicit, parameterized low-Re band: measured onset, minimum
  and depth for S ≤ 0.36, and a fade with spin ratio beyond the data (R2's
  fade by S ≈ 0.6 is the best-supported default). The band is the model's
  largest uncertainty; it must be switchable, with R0 as the band-free
  reference.
- **Validation order.** Raw measurements first (the radar driver's carry,
  apex and hang time; the driver altitude events), the 2023 table second as
  population averages with its provenance caveats, TrackMan model figures
  last and informational.
- **This app.** No change is forced. The low-risk option is R0 under the
  app's calibration: measured lift and drag laws, land 4.65° → 3.96°, every
  hard oracle passing. A banded law should wait for the data below.

### What would settle it

1. **Iron carry at altitude, measured.** TrackMan has tracked PGA TOUR
   approach shots since 2022 without publishing them; Castle Pines 2024 is the
   single most decisive dataset.
2. **Lift and drag at Re 4–8e4 and S 0.36–1.3** — where iron and wedge
   descents end and no modern-ball data exist (Aoki, Muto & Okanaga 2010 is
   the nearest lead).
3. **Whether the altitude events' launch shifts are real**, from per-shot
   rather than averaged radar data.

---

## Round 3 — literature (2026-10-09)

A second, broader search of published ball-flight research, aimed at
ballistic coefficients and at lift as spin decays (`literature.md`, its
notes, `literature-data.csv`). It changes the picture in four places.

1. **The low-speed lift loss fades with spin in every data set that shows
   it,** gone by S 0.24–0.5; none shows a deficit above S ≈ 0.4. That backs a
   band that fades with spin ratio (round 2's R2 fades by S 0.6, the slow end
   of that range). Negative Magnus is ball-specific and seen only at S ≲ 0.2.
2. **Coefficients derived from real flights fall through the descent.**
   TrackMan radar fits along robot driver flights (Aero-X's patent US
   8,202,178) put the lift peak at 62–72 % of flight time and lift 18–24 %
   lower by landing; TrackMan's output for two shots (Watanabe et al. 2016)
   falls 38–52 % in lift and 25–63 % in drag through the descent. Drag falling
   late is something no C_D(Re, S) law produces. Whether that is physics — a
   dependence on the flight's history — or an artefact of TrackMan completing
   and smoothing the track is unresolved; nobody publishes raw in-flight
   deceleration.
3. **High-spin lift peaks and falls.** An S-only lift law fitted to FlightScope
   carry and apex of 1,040 Pro V1 shots (Ferguson, McNally & McPhee 2022)
   peaks at S 0.52 and falls to 0.31 by S 0.75 — the same "less lift late"
   signature, absorbed into S. R0's high-S branch, from a 1976 ball, keeps
   rising to 0.45; that branch matters for wedges.
4. **Ballistic coefficient** (BC = m / (C_D·A); no golf source publishes one,
   so `literature.md` §3 converts C_D): about 145–150 kg/m² at launch, falling
   30–40 % to the slowest point as spin ratio grows, about half at wedge
   spin ratios, and ball-specific in the drag crisis.

Spin decay stays where it was: radar flights (Pro V1x driver, 5- and 8-iron)
and the FlightScope fit sit at or below Smits & Smith; one tunnel torque
measurement (Naruo 2004) is 1.6–5.4× faster at S 0.5–1.0, and the two
conflict.

**Candidate next experiments** (none run): an S-peaked high-spin lift branch
in the Ferguson shape; a switchable descent-phase reduction of lift and drag,
labelled "TrackMan-consistent, physics unconfirmed" — unlike the low-Re band,
a phase-based term does not move with air density, so it need not cost iron
gains at altitude. Sources to obtain by hand are in `literature.md` §8
(Smits & Smith 1994; Naruo & Mizota 2014; Aoki et al. 2010).

### Round 3b — retrieval (2026-10-10)

With the user's permission to search and download, every hand-only source
was retried by legitimate routes (`literature.md` §10). None of the named
paywalled or bot-blocked sources came back in full; open papers found on
the way did (Aoki, Muto & Okanaga 2011 on J-STAGE; Aoki 2004; Miller's 2009
thesis; Naruo & Mizota 2009; a Wayback copy of USGA TPX3006). What they add:

- **The shipped high-spin laws check out against a 2011 measurement.** A
  golf-size dimpled sphere measured to S 2.0 at Re 0.4–1.3e5 (Aoki 2011)
  follows one lift curve within ±0.03 from S ≈ 0.4 up, levelling at
  0.45–0.50 for S ≥ 1 — consistent with the shipped 0.45 cap and against an
  S-peaked shape. Where the shipped laws borrow the 1976 ball's shape
  (S 0.36–1.0), its supercritical points (Re ≥ 7.5e4, the regime the
  shipped laws model) put drag within −0.023 to +0.014 of the shipped law —
  inside the ±0.02 reading uncertainty — and lift 0.010–0.045 lower, about
  the 0.03 the sphere also sits below tour balls at S 0.3: a level
  difference the per-row lift factor absorbs, not a shape difference. Its
  drag does keep rising above S 1.0 (0.57–0.65 at S 1.3–2.0), but only in
  runs at Re ≤ 5e4, inside the low-speed regime the shipped laws leave
  out. Caveat: a PVC sphere, not a commercial ball — at low spin it has
  0.007–0.065 more drag than tour balls.
- **The low-Re lift loss fades by S ≈ 0.4** on that sphere, strengthening
  round 3's finding 1.
- **The late lift fall in TrackMan data stays unresolved,** with new
  evidence on both sides (radar descent is the least accurate part of a
  track; other trajectory studies report the same fall).
- **Erratum:** the Bearman & Harvey DOI used since round 1 resolved to the
  journal issue's front matter; the paper is doi:10.1017/S0001925900007617.
  Corrected in `literature.md` and `docs/research/aero-model.md`.

Still to obtain by hand: Smits & Smith 1994 and Tavares et al. 1999
(Science and Golf II and III), the 2025 USGA ITR protocol, and the two
Procedia Engineering papers (captcha); exact citations in `literature.md`
§10.3.

**Refitting the drag to the sphere was tried and not adopted** (coordinator,
2026-10-10; `harness/highs-drag-impact.mjs`, `harness/aoki-agreement.py`). A
piecewise-linear S > 0.22 branch through the sphere's supercritical means,
with its Re-4e4 rise above S 1.0, under the app's per-row calibration: land
RMS 3.965° → 3.998°, no carry falls up to 10,000 ft, at most 0.7 yd of carry
and 0.6° of land change at 10,000 ft (irons and wedges), and 210 of 2,139
displayed cells over 0–15,000 ft moved by one unit (189 with the branch held
flat above S 1.0). The change sits inside the data's own uncertainty, so the
shipped law stays and the methods page records the check.
