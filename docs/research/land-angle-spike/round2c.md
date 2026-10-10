# Land-angle spike, round 2c (R2c): every law against the measured driver altitude gains

Probe 2, 2026-10-09. Mandate: `BRIEF.md` "Round 2c". Verified numbers, each
with its command, are in `round2c.md.notes.md`. Harness changes are additive
and `harness/check-f0.mjs` still passes. Tags: **[P]** primary, **[S]**
secondary, **[D]** derived here.

## 1. Summary

**The check.** Each law's predicted driver carry gain is scored against the
PGA TOUR's on-site radar gains, player-matched. Measured: Chapultepec 7,746 ft
+16 to +22 yd (2017–2020), Castle Pines +27.5, Old Greenwood +23.0, sea-level
control −3.3. Each law was flown (a) at the season launch and (b) with each
event's measured launch shift. The criterion is |predicted − measured| ≤ 2·SE
+ 3.3 yd. All numbers are **[D]**.

| Law (variants) | Chapultepec (a) / (b) | Castle Pines (a) / (b) | Old Greenwood (a) / (b) |
|---|---|---|---|
| measured | +16.2…+21.9 | +27.5 ± 0.9 | +23.0 ± 1.3 |
| F0 (G, Aapp, Araw) | 20.6–27.6 / 34.5–39.6 | 18.7–23.9 / 27.8–30.0 | 18.0–22.9 / 30.4–31.0 |
| R0 | 22.9–27.2 / 37.6–41.9 | 20.9–23.8 / 30.2–32.0 | 20.1–22.9 / 32.9–34.0 |
| R1 | 20.1–21.9 / 25.4–34.8 | 18.5–19.5 / 25.3–27.9 | 17.8–18.8 / 26.4–30.6 |
| R2 | 17.5–19.4 / 15.4–31.3 | 16.2–17.5 / 22.1–26.1 | 15.7–16.9 / 22.6–28.4 |
| R3 | 17.4–20.5 / 16.8–33.3 | 16.2–18.4 / 22.2–27.4 | 15.7–17.7 / 22.8–29.9 |

(The (b) ranges for R1–R3 span the G variant, high, and the calibrated A
variants, low.)

- **Hard driver check, which depends on the launch treatment:**
  - With the measured launch shift everywhere (b), **R2 Araw passes all six
    events**, R3 Araw and Aapp miss by 0.1–0.2 yd, and the R1 A variants, R2 G
    and R3 Araw pass the 2024 pair. **F0 and R0 fail**: 15–23 yd too long at
    Chapultepec, 7–11 yd at Old Greenwood.
  - At fixed launch (a), only F0 G and R0 Aapp pass the 2024 pair, and no law
    passes all six.
- **The apex picks the treatment per event, and that leaves no winner.** At
  the 2024 events the measured apex drop (−6 / −11 ft) matches fixed launch
  (every law −9.6…−12.0 ft); the measured launch rise would raise the apex. At
  Chapultepec the apex rise (+2…+24 ft) matches the shifted launch. Scored
  that way, the Re-free laws (F0, R0) pass 2024 at best but miss Chapultepec
  by 15–23 yd. The banded laws (R2, R3 calibrated) get Chapultepec but come in
  7–11 yd short at both 2024 events.
- **Chapultepec shortfall.** No law produces it through density alone: the
  laws' own curvature at 7,746 ft is −1…+4 yd, against 10–15 measured, with
  the band adding 2–4 yd. The banded laws reproduce Chapultepec's *level* only
  through their damped response to the field's +3° / +370 rpm launch shift.
  The year-to-year trend weakly favours today's law instead (2σ).
- **Confounding.** Carry changes by 0.42–0.57 yd per foot of landing height.
  Landing areas ~26–48 ft above the season norm would rescue today's law at
  Chapultepec; ~19–24 ft below would rescue the band laws at Castle Pines
  (described as having big downhill tee shots). The 2017–18 hang-time drops
  cannot be terrain under any law (they would imply 30–62 yd of lost carry).
  With hang-implied terrain in 2019–20, the laws converge within 5–10 yd.
- **Verdict.** The driver data are consistent with every law to within their
  launch and terrain confounds. Chapultepec discriminates in favour of the
  low-Re band only if its launch shift is real and its terrain ordinary.

## 2. The measured reference and how laws are scored

**Reference** (`altitude-evidence.md` §2 and its notes, re-verified **[S]**):
PGA TOUR on-site TrackMan radar, Par 4/5 tee shots, carry to the actual
ground impact. Each player at an event is compared with his own season
elsewhere (attempt-weighted mean ± SE). Air density is the event's moist-air
density over dry 25 °C sea level; the season air is ≈ 0.992.

| Event | ρ | Δcarry yd ± SE | Δball | Δlaunch | Δspin | Δapex ft |
|---|---|---|---|---|---|---|
| Chapultepec 2017 (7,746 ft) | 0.783 | +21.9 ± 1.0 | +0.0 | +3.1° | +369 | +23.8 |
| Chapultepec 2018 | 0.775 | +21.5 ± 1.2 | +0.1 | +3.0° | +404 | +15.1 |
| Chapultepec 2019 | 0.776 | +19.0 ± 1.8 | +1.7 | +0.9° | +353 | +7.5 |
| Chapultepec 2020 | 0.780 | +16.2 ± 2.8 | +2.4 | +1.2° | +138 | +2.4 |
| Castle Pines 2024 (6,234 ft) | 0.804 | +27.5 ± 0.9 | +1.5 | +1.2° | −21 | −11.1 |
| Old Greenwood 2024 (5,843 ft) | 0.812 | +23.0 ± 1.3 | +1.8 | +1.9° | −16 | −5.9 |
| Control: Vidanta 2024 (56 ft) | 0.994 | −3.3 ± 0.4 | +0.0 | −0.3° | +83 | +0.5 |

The 40 near-sea-level events give Δcarry = 148.8 − 150.1·ρ yd, i.e. +1.50 yd
per 0.01 of density, or +1.09 once launch shifts are regressed out. Extrapolated
to Chapultepec it predicts +31–32 yd; the measured +16–22 falls 10–15 yd short.

**Scoring** (`harness/driver-events.mjs`; log `harness/out/driver-events.txt`)
**[D]**:

- **Season baseline**: the 2022-23 radar driver (172.85 mph, 10.49°, 2,571
  rpm) at ρ 0.992. Each event is flown at its own ρ, and the predicted gain is
  event − baseline:
  - **(a)** at the season launch (fixed-launch physics);
  - **(b)** with the event's measured Δball, Δlaunch and Δspin applied (what
    the players actually hit).
- **Three variants per law**:
  - **G**: the mode-G global law, nothing per-row.
  - **Aapp**: the A\* shape with kD, kL from the app's PGA Driver row (171 mph,
    10.4°, 2,545 rpm → 282 / 35 yd at sea level).
  - **Araw**: the A\* shape calibrated to the raw radar carry and apex (283.8
    / 34.0 yd at 0.992), as in round 2b.
- **Hard-check criterion** (stated here, since the ruling gives none):
  |predicted − measured| ≤ 2·SE + 3.3 yd. The 3.3 yd is the sea-level
  control's bias, the method's own noise floor. Every law predicts the control
  at −0.1…−0.3 yd against the measured −3.3, so the control is in band for all.

## 3. Predicted against measured, per event

Carry gain in yd, (a) / (b); measured in the header **[D]**:

| Law, variant | Castle Pines +27.5 | Old Greenwood +23.0 | Chapultepec 2017 +21.9 | 2018 +21.5 | 2019 +19.0 | 2020 +16.2 |
|---|---|---|---|---|---|---|
| F0 G | 23.9 / 30.0 | 22.9 / 31.0 | 26.6 / 36.6 | 27.6 / 38.0 | 27.5 / 36.4 | 27.0 / 36.4 |
| F0 Aapp | 20.3 / 28.8 | 19.5 / 31.0 | 22.4 / 38.2 | 23.2 / 39.6 | 23.1 / 35.8 | 22.7 / 35.8 |
| F0 Araw | 18.7 / 27.8 | 18.0 / 30.4 | 20.6 / 38.1 | 21.3 / 39.4 | 21.2 / 34.5 | 20.8 / 34.7 |
| R0 G | 20.9 / 30.2 | 20.1 / 32.9 | 22.9 / 40.6 | 23.7 / 41.9 | 23.6 / 37.6 | 23.2 / 37.6 |
| R0 Aapp | 23.8 / 32.0 | 22.9 / 34.0 | 26.3 / 40.3 | 27.2 / 41.7 | 27.0 / 39.3 | 26.6 / 39.5 |
| R0 Araw | 21.9 / 30.8 | 21.1 / 33.3 | 24.1 / 40.5 | 24.9 / 41.8 | 24.8 / 38.2 | 24.4 / 38.3 |
| R1 G | 18.6 / 27.9 | 18.0 / 30.6 | 20.2 / 34.0 | 20.8 / 34.8 | 20.7 / 32.7 | 20.5 / 34.0 |
| R1 Aapp | 19.5 / 25.5 | 18.8 / 26.4 | 21.2 / 25.4 | 21.9 / 26.4 | 21.8 / 27.6 | 21.5 / 29.8 |
| R1 Araw | 18.5 / 25.3 | 17.8 / 26.7 | 20.1 / 26.2 | 20.6 / 27.1 | 20.6 / 27.5 | 20.3 / 29.7 |
| R2 G | 17.5 / 26.1 | 16.9 / 28.4 | 18.9 / 29.3 | 19.4 / 30.1 | 19.4 / 29.3 | 19.1 / 31.3 |
| R2 Aapp | 16.8 / 22.1 | 16.3 / 22.6 | 18.2 / 15.4 | 18.6 / 15.8 | 18.6 / 19.9 | 18.3 / 24.2 |
| R2 Araw | 16.2 / 22.4 | 15.7 / 23.4 | 17.5 / 17.4 | 17.9 / 17.7 | 17.8 / 21.0 | 17.6 / 25.0 |
| R3 G | 18.4 / 27.4 | 17.7 / 29.9 | 20.0 / 32.5 | 20.5 / 33.3 | 20.5 / 31.7 | 20.2 / 33.2 |
| R3 Aapp | 16.9 / 22.2 | 16.3 / 22.8 | 18.2 / 16.8 | 18.7 / 17.3 | 18.7 / 20.6 | 18.4 / 24.6 |
| R3 Araw | 16.2 / 22.4 | 15.7 / 23.5 | 17.4 / 18.3 | 17.9 / 18.8 | 17.8 / 21.4 | 17.6 / 25.1 |

**Pass matrix** (within 2·SE + 3.3 yd): Castle Pines, Old Greenwood,
Chapultepec 2017–2020, under (a) | (b):

| Law, variant | (a) | (b) | 2024 pair (a) / (b) | all six (a) / (b) |
|---|---|---|---|---|
| F0 G | y y y n n n | y n n n n n | **pass** / fail | fail / fail |
| F0 Aapp, F0 Araw, R0 G, R0 Araw, R1 G | n y y y y y | y n n n n n | fail / fail | fail / fail |
| R0 Aapp | y y y y n n | y n n n n n | **pass** / fail | fail / fail |
| R1 Aapp, R1 Araw | n y y y y y | y y y y n n | fail / **pass** | fail / fail |
| R2 G | n n y y y y | y y n n n n | fail / **pass** | fail / fail |
| R2 Aapp | n n y y y y | n y n y y y | fail / fail | fail / fail |
| **R2 Araw** | n n y y y y | y y y y y y | fail / **pass** | fail / **pass** |
| R3 G | n y y y y y | y n n n n n | fail / fail | fail / fail |
| R3 Aapp | n n y y y y | n y y y y y | fail / fail | fail (CP by 0.1 yd) |
| R3 Araw | n n y y y y | y y y y y n | fail / **pass** | fail (2020 by 0.2 yd) |

**Apex decides which launch treatment applies, and it differs by event**
(Δapex ft, measured vs (a) / (b), every law):

| Event | measured | (a) | (b) |
|---|---|---|---|
| Castle Pines | −11.1 | −10.1…−12.0 | +2.1…+3.3 |
| Old Greenwood | −5.9 | −9.6…−11.4 | +9.9…+10.9 |
| Chapultepec 2017 | +23.8 | −11.5…−13.5 | +24.7…+28.9 |
| Chapultepec 2018 | +15.1 | −12.0…−14.1 | +23.9…+28.3 |
| Chapultepec 2019 | +7.5 | −11.9…−14.1 | +4.2…+7.5 |
| Chapultepec 2020 | +2.4 | −11.7…−13.8 | +5.0…+6.9 |

At the two 2024 events, the measured apex drop matches fixed-launch physics
(a). The measured launch rise would instead raise the apex by 2–11 ft in every
law, so the 2024 "launch shift" does not behave like a real change of launch.
At Chapultepec it is the opposite: the measured apex rise matches (b), so the
higher launch there was real. Scoring each event with the treatment its own
apex supports, i.e. 2024 under (a) and Chapultepec under (b):

| Law, variant | 2024 under (a) | Chapultepec under (b) |
|---|---|---|
| F0 G, R0 Aapp | pass both | fail all four years, 15–23 yd too long |
| F0 Aapp, F0 Araw, R0 G, R0 Araw | Castle Pines 6–9 yd short; Old Greenwood pass | fail all four, 15–22 yd too long |
| R1 G | Castle Pines 9 yd short | fail all four, 12–18 yd too long |
| R1 Aapp, R1 Araw | Castle Pines 8–9 yd short | pass 2017–18; fail 2019–20 (8.5–13.6 too long) |
| R2 G, R3 G | Castle Pines 9–10 short (R2 G also Old Greenwood) | fail all four, 7–17 yd too long |
| R2 Aapp, R2 Araw, R3 Aapp, R3 Araw | Castle Pines 11 yd and Old Greenwood 7 yd short | pass 3–4 of 4 (R2 Araw, R3 Aapp all four; R2 Aapp misses 2017 by 1.3 yd, R3 Araw 2020 by 0.2) |

**No law passes every event under this apex-consistent scoring.** The Re-free
laws (F0, R0) pass the 2024 events at best (F0 G, R0 Aapp) but miss
Chapultepec by 15–23 yd. The banded laws under calibration (R2, R3) get
Chapultepec but come in 7–11 yd short at both 2024 events.

## 4. The Chapultepec shortfall

The measured shortfall is defined against the measured low-altitude line: +31–32
yd predicted against +16–22 measured, i.e. 10–15 yd. Two parts of the
comparison matter **[D]**:

- **Curvature in density, at fixed launch.** Each law's own carry-gain line
  was fitted over ρ 0.906–1.062 and extrapolated to 0.779. Against that
  extrapolation the law's own prediction at 0.779 falls short by −0.6…1.0 yd
  (F0), 1.3–1.5 (R0), 2.6–3.0 (R1), 3.3–3.8 (R2) and 3.0–3.7 (R3). The low-Re
  band adds 2–4 yd of curvature by 7,746 ft. **No law produces a 10–15 yd
  curvature at fixed launch**; the band laws come closest.
- **The line itself.** At fixed launch the laws' low-altitude slopes are
  1.02–1.32 yd per 0.01 ρ. That matches the measured *launch-adjusted* slope
  (1.09), not the raw one (1.50). Part of the raw line is launch change that
  accompanies density, so the raw line overstates the fixed-launch gain at
  Chapultepec.
- **Where the shortfall comes from in the models: the launch response.**
  Chapultepec's apex shows that the field really did launch higher (+3.1° and
  +369 rpm in 2017, +3.0° and +404 rpm in 2018). Applying that shift (b):
  - Today's law and R0 add 10–18 yd to their fixed-launch gain and land 15–23
    yd above the measured carry.
  - The banded laws under calibration (R2, R3 Aapp/Araw) change by only −3…+1
    yd in 2017–18. Presumably the extra launch and spin push more of the thin-air
    descent into the low-Re band, where the lift lost offsets the height
    gained (not isolated here). They land 3–7 yd below the measured carry.
  - **So the banded laws reproduce Chapultepec's level, and the Re-free laws
    do not, but only through the launch response, not through density
    curvature.**
- **The year pattern runs the other way.** The measured gain falls from 2017
  to 2020 (+21.9 → +16.2) as the launch shift shrinks (+3.1° → +1.2°) and
  ball-speed gain grows (+0.0 → +2.4 mph). Under (b), F0 follows that direction
  (38 → 35 yd), while R2/R3 rise (17 → 25 yd). The 2017→2020 difference is
  5.7 ± 2.9 yd, about 2σ, so it is a weak counter-signal against the band laws.

## 5. Terrain and launch confounding

**Terrain.** Carry runs to the actual ground impact, so landing-area height
against the tee changes it. The model gives 0.42–0.44 yd of carry per foot at
season air and 0.48–0.57 yd/ft at altitude, with landing angles of 30–38°
(`harness/terrain-sens.mjs`) **[D]**. A 10 yd discrepancy therefore needs the
event's mean landing area ~18–24 ft higher (or lower) than the season's
average, relative to the tee.

- **To save today's law or R0 at Chapultepec under (b)**, its landing areas
  would have to sit ~26–48 ft above the season's typical landing height. Hole
  geometry was not obtained (`altitude-evidence.md` §6), so this cannot be
  ruled out.
- **To save the banded laws at Castle Pines under (a)**, the drives would have
  to land ~19–24 ft *below* the season's typical height. Castle Pines is
  described as having big downhill tee shots (`altitude-evidence.md` §2
  **[S]**), which points that way, but the size is not verified.
- **The measured hang-time changes at Chapultepec are not a usable terrain
  gauge** **[D]**. Solving each law's flight for the landing height that
  reproduces the measured Δhang gives:
  - 2017–18: 77–105 ft above the tee, which would cost 30–62 yd of carry under
    every law, more than the whole measured gain. Those hang-time drops must
    come from something else: few radar holes (57–154 shots), shot mix, or
    tracking.
  - 2019–20: −12…+45 ft. With that terrain added to (b), the five laws land at
    +25–29 yd (2019, measured +19.0) and +10–13 yd (2020, measured +16.2).
    R1–R3 then sit within band in both years, F0 and R0 within band in 2020
    only, and the discrimination largely disappears.

**Launch.** The two launch treatments move a prediction by −3…+18 yd. That is
more than the spread between laws at fixed launch, which is 8–10 yd across
all variants.

- The apex says the launch shift was real at Chapultepec and not at the 2024
  events (§3). That is plausible: in 2017–18 the radar covered few holes, and
  the field's +3° launch came with a +15–24 ft apex.
- The regression-adjusted "fixed-launch" gains in `altitude-evidence.md` (+8.0
  to +12.6 yd at Chapultepec, +21.3 Castle Pines, +14.2 Old Greenwood) are a
  lower bracket built on cross-player slopes. Every law at fixed launch (a)
  sits at or above the top of the Chapultepec bracket (8–22 yd, against
  +17–28 yd predicted), and around the 2024 brackets: Castle Pines 16–24 against 21.3–27.5, Old Greenwood 16–23 against
  14.2–23.0.

## 6. Reading

1. **Does any law pass the hard driver check?** It depends on how the measured
   launch shift is treated, and the data do not say one way for all events.
   - With the players' measured launch applied everywhere (b), R2 Araw passes
     all six events, and R3 Araw and R3 Aapp miss by 0.1–0.2 yd. Today's law
     and R0 fail at Chapultepec by 15–23 yd and at Old Greenwood by 7–11 yd.
   - At fixed launch (a), only F0 G and R0 Aapp pass the two 2024 events, and
     no law passes all six.
   - With each event scored the way its own apex supports (2024 fixed,
     Chapultepec shifted), no law passes everything. The Re-free laws miss
     Chapultepec by 15–23 yd; the banded laws miss Castle Pines by ~11 yd and
     Old Greenwood by ~7 yd.
2. **Chapultepec's shortfall discriminates, conditionally.** If its launch
   shift is real (its apex says so) and its landing terrain is like the
   season's, then Chapultepec favours the measured low-Re band (R2/R3 under
   calibration) over today's law and R0, by ~13–25 yd. But no law gets there
   through density alone: band curvature supplies only 2–4 yd, and the rest
   is the band's damped response to higher launch and spin in thin air.
   Terrain of ~26–48 ft, or a launch shift that is partly artefact, would
   erase the discrimination. The year-by-year trend mildly favours today's law.
3. **The control is fine for all laws.** Every law predicts −0.1…−0.3 yd at
   Vidanta, against the measured −3.3 yd (method bias). Every law at fixed
   launch matches the 40-event launch-adjusted slope (1.02–1.32 against 1.09 yd
   per 0.01 ρ).
4. **What would settle it:** hole-level radar with landing elevations for
   Chapultepec and Castle Pines (to remove terrain), or a fixed-launch robot
   test at altitude. Both are named as missing in `altitude-evidence.md` §6.

