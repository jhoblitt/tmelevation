# Land-angle model spike — synthesis

2026-10-09. Coordinator's synthesis of the three probes in this directory,
answering the question in `BRIEF.md`. Every number below was re-checked
against the probe files or re-derived; where a probe document was wrong, the
correction is noted.

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
