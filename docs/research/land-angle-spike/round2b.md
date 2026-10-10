# Land-angle spike, round 2b (R2b-2): re-rank with altitude soft, and the raw radar driver

Probe 2, 2026-10-09. Mandate: `BRIEF.md` "Round 2b", R2b-2. Verified numbers,
each with its command, are in `round2b.md.notes.md`. Harness changes are
additive and `harness/check-f0.mjs` still passes. Tags: **[P]** primary,
**[S]** secondary, **[D]** derived here.

## 1. Summary

All numbers are **[D]** from the harness. Fits are those of rounds 1 and 2;
nothing was refitted for this round.

- **Ranking with every altitude oracle soft** (the ranking is unchanged from round 2):
  - Mode G, by weighted cost (RMS carry / height / land, LOO-CV in brackets):
    1. R2: 5.39 / 2.04 / 2.73 (5.88 / 2.12 / 2.81)
    2. R3: 6.08 / 1.99 / 2.81 (6.49 / 2.07 / 2.93)
    3. R0: 6.39 / 2.04 / 3.73 (6.69 / 2.10 / 3.78)
    4. R1: 7.33 / 2.02 / 3.02 (7.68 / 2.07 / 3.09)
    5. F0 for reference: 7.58 / 2.19 / 4.21 (8.12 / 2.24 / 4.25)
  - Mode A, by land RMS (CV): R3 1.62° (1.79°), R1 1.67° (1.79°), R2 2.27°
    (2.39°), R0 3.96°, F0 (the app) 4.65°.
- **Oracle 6** (PGA 7-iron carry at 6,400 ft; band +7…+16 %, players' plans
  +12–14 %):
  - mode G: R2 +10.8 %, R3 +11.0 %, R0 +13.1 %, R1 +12.0 %, F0 +11.6 %;
  - mode A: R3 +6.0 %, R1 +8.7 %, R2 +7.8 %, R0 +11.7 %, F0 +11.3 %.
  - The banded laws give up iron altitude gain in exactly the mode where they
    fit land best.
- **Carry turnover, LPGA 4–7 irons:**
  - Today's law and R0 keep them rising to 15,000 ft (LPGA 4-iron ≥ 13,700 ft).
  - Banded laws turn them over at 6,200–12,300 ft in mode G and 600–8,100 ft
    in mode A. R2 A\* puts the LPGA 5-iron peak at 600 ft and has it 24 %
    shorter at 15,000 ft than at sea level.
- **Raw PGA TOUR radar driver** (172.85 mph / 10.49° / 2,571 rpm at density
  0.992; measured hang 6.4 s, apex at 65.5 % of carry):
  - Unfitted, the measured surface gives 6.38 s / 64.1 % (apex 4.8 yd low).
    Today's law gives 7.67 s / 66.4 % (apex 9.3 yd high).
  - Calibrated to the radar's carry and apex, every law hangs 0.40–0.55 s too
    long (F0 6.80 s best, R0 6.95 s) and puts the apex at 65.0–65.9 % (R0
    65.5 % exact).
  - Averaging over plausible shot spreads moves hang by −0.06…−0.34 s and the
    apex position by up to +1 point. The calibrated differences between laws
    (≤ 0.15 s, ≤ 0.9 points) sit inside that uncertainty.
  - The raw driver prefers the measured surface where nothing is fitted, and
    cannot separate the laws once they are calibrated.

## 2. Re-ranking with every altitude oracle soft

With the altitude oracles demoted to soft (BRIEF, Round 2b ruling), the
candidates rank on fit alone. The oracles are reported as values, not as
pass/fail, with **oracle 6 first**: PGA 7-iron carry gain at 6,400 ft. The app
band is +7…+16 %; Scheffler and McIlroy planned +12.0 % and +13.8 %,
planning yardages, not measurements **[S]**. Oracles 1–3 are Padjen's TrackMan
figures for a PGA driver at 7,800 ft (+8.5 % carry, −18 % apex, −9° land). 9a
counts carry/height/land monotonicity breaks from 0 to 10,000 ft on a 250 ft
grid (`harness/rerank.mjs`; fits from rounds 1 and 2) **[D]**.

**Mode G (one parameter set, no per-row knobs), ranked by weighted cost:**

| Rank | Law | Cost | RMS carry / height / land | LOO-CV | **Oracle 6: PGA 7i at 6,400 ft** | 1: Dr carry 7,800 ft | 2: apex | 3: land | 9a breaks |
|---|---|---|---|---|---|---|---|---|---|
| 1 | R2 (band fades by S 0.6) | 338 | 5.39 / 2.04 / 2.73 | 5.88 / 2.12 / 2.81 | **+10.8 %** | +7.1 % | −15.4 % | −6.35° | 94 |
| 2 | R3 (fades by S 1.0) | 385 | 6.08 / 1.99 / 2.81 | 6.49 / 2.07 / 2.93 | **+11.0 %** | +7.6 % | −15.4 % | −6.90° | 50 |
| 3 | R0 (no band) | 473 | 6.39 / 2.04 / 3.73 | 6.69 / 2.10 / 3.78 | **+13.1 %** | +9.1 % | −14.9 % | −8.11° | 6 |
| 4 | R1 (band persists) | 496 | 7.33 / 2.02 / 3.02 | 7.68 / 2.07 / 3.09 | **+12.0 %** | +7.6 % | −15.4 % | −7.10° | 44 |
| ref | F0 (today's law, 2 levels fitted) | 622 | 7.58 / 2.19 / 4.21 | 8.12 / 2.24 / 4.25 | **+11.6 %** | +11.9 % | −13.1 % | −7.75° | 0 |

**Mode A (the app's per-row kD, kL; band shape refitted = A\*), ranked by
land RMS:**

| Rank | Law | Land RMS | LOO-CV | **Oracle 6** | 1 | 2 | 3 | 9a breaks |
|---|---|---|---|---|---|---|---|---|
| 1 | R3 | 1.62° | 1.79° | **+6.0 %** | +6.8 % | −15.5 % | −4.55° | 291 |
| 2 | R1 | 1.67° | 1.79° | **+8.7 %** | +8.2 % | −15.4 % | −5.98° | 90 |
| 3 | R2 | 2.27° | 2.39° | **+7.8 %** | +6.8 % | −15.4 % | −4.45° | 287 |
| 4 | R0 | 3.96° | — (no shape fitted) | **+11.7 %** | +10.3 % | −15.2 % | −8.46° | 0 |
| ref | F0 (shipped app) | 4.65° | — | **+11.3 %** | +8.8 % | −15.6 % | −7.93° | 0 |

Readings:

- **The ranking is unchanged by demoting altitude.** Mode G puts R2 first and
  mode A puts R3 first, as in round 2. What changes is that their altitude
  behaviour is now a reported trade-off, not a disqualification.
- **Oracle 6, the nearest thing to real iron evidence**, separates the modes.
  - In mode G every law lands inside the +7…+16 % band. R0 (+13.1 %) and R1
    (+12.0 %) sit inside the players' +12–14 %, and R2 and R3 sit 1–2 points
    below it.
  - Under the app's calibration the banded laws fall to +6.0…+8.7 % (R3 below
    the band). R0 (+11.7 %) and today's app (+11.3 %) stay near the planners.
  - The better a banded law fits land under the app's calibration, the
    further its 7-iron falls short of the planners' altitude yardages.

## 3. Carry turnover elevation per row

The first elevation at which carry stops rising, searched 0–15,000 ft at 100
ft steps at 25 °C. "—" means carry still rises at 15,000 ft. The carry gains
at each turnover and at 15,000 ft are in `harness/out/turnover.txt`
(`harness/turnover.mjs`; mode A uses per-row kD, kL fitted at sea level, as
the app does) **[D]**.

| Row | F0 G | F0 A (app) | R0 G | R0 A | R1 G | R1 A\* | R2 G | R2 A\* | R3 G | R3 A\* |
|---|---|---|---|---|---|---|---|---|---|---|
| PGA Driver | — | — | — | — | 11,800 | 12,000 | 10,900 | 10,000 | 11,600 | 10,100 |
| PGA 3-wood | — | — | 14,500 | — | 11,400 | 11,500 | 10,900 | 9,900 | 11,400 | 10,000 |
| PGA 5-wood | — | — | — | — | 12,400 | 11,600 | 11,700 | 9,800 | 12,300 | 10,000 |
| PGA Hybrid | — | — | — | 14,400 | 11,800 | 10,100 | 11,100 | 8,000 | 11,700 | 8,300 |
| PGA 3 Iron | — | — | 14,500 | 14,800 | 10,700 | 9,900 | 10,000 | 7,700 | 10,600 | 8,100 |
| PGA 4 Iron | — | — | 14,800 | 14,900 | 10,800 | 9,900 | 10,100 | 7,200 | 10,700 | 7,500 |
| PGA 5 Iron | — | — | — | — | 11,800 | 10,300 | 10,200 | 7,500 | 11,600 | 7,600 |
| PGA 6 Iron | — | — | — | — | 14,000 | 10,700 | 10,800 | 5,600 | 13,200 | 7,400 |
| PGA 7 Iron | — | — | — | — | — | 11,100 | 11,100 | 6,300 | 14,100 | 7,900 |
| PGA 8 Iron | — | — | — | — | — | 11,400 | 12,900 | 9,600 | — | 8,500 |
| PGA 9 Iron | — | — | — | — | — | 11,100 | — | 11,300 | — | 8,600 |
| PGA PW | — | — | — | — | — | 10,800 | — | 13,000 | — | 8,800 |
| LPGA Driver | — | — | 12,700 | 14,200 | 7,900 | 8,200 | 6,900 | 5,900 | 7,700 | 6,000 |
| LPGA 3-wood | 13,600 | 14,500 | 8,400 | 13,400 | 5,300 | 7,500 | 4,600 | 5,100 | 5,200 | 5,500 |
| LPGA 5-wood | — | — | 13,600 | 14,200 | 8,900 | 7,900 | 8,200 | 4,800 | 8,700 | 5,400 |
| LPGA Hybrid | — | — | — | — | 9,900 | 8,100 | 8,700 | 4,400 | 9,600 | 5,100 |
| **LPGA 4 Iron** | 14,800 | 14,700 | 14,300 | 13,700 | 8,300 | 6,200 | 6,800 | 2,400 | 8,000 | 3,000 |
| **LPGA 5 Iron** | — | — | — | — | 8,600 | 6,200 | 6,200 | **600** | 8,100 | 2,400 |
| **LPGA 6 Iron** | — | — | — | — | 11,400 | 7,400 | 7,400 | 2,100 | 10,200 | 3,700 |
| **LPGA 7 Iron** | — | — | — | — | 12,300 | 8,100 | 7,900 | 4,800 | 11,000 | 4,800 |
| **LPGA 8 Iron** | — | — | — | — | — | 9,000 | 10,500 | 8,000 | — | 6,200 |
| **LPGA 9 Iron** | — | — | — | — | — | 8,700 | — | 8,800 | — | 5,900 |
| **LPGA PW** | — | — | — | — | — | — | — | — | — | 6,600 |
| rows turning below 15,000 / 10,000 ft | 2 / 0 | 2 / 0 | 7 / 1 | 7 / 0 | 16 / 6 | 22 / 12 | 19 / 8 | 22 / 19 | 17 / 6 | 23 / 20 |

Carry change at 15,000 ft, for scale: the LPGA 5 iron gains +9.4 % (F0 G) and
+13.3 % (R0 G), but +0.4 % (R3 G), −4.7 % (R2 G), −20.8 % (R3 A\*) and
−23.8 % (R2 A\*).

Readings:

- **Today's law and the measured band-free surface keep nearly every row
  rising to 15,000 ft.** Today's law turns over only the LPGA 3-wood and
  4-iron, above 13,600 ft. R0 turns over 7 rows, all above 12,700 ft except
  the LPGA 3-wood in mode G (8,400 ft).
- **With the measured low-Re band, LPGA iron carry peaks at mid-altitude.**
  For the LPGA 4–7 irons that is 6,200–12,300 ft in mode G and 600–8,100 ft
  under the app's calibration. Under R2 A\* and R3 A\* every LPGA 4–7 iron
  peaks below 5,000 ft and carries 14–24 % less at 15,000 ft than at sea
  level.
- **This is the physics the user's vacuum argument points to**, carry falling
  once lift is lost, but it arrives at ordinary playing elevations, not near
  vacuum. Whether real LPGA 5-irons lose carry above ~600–8,000 ft is now the
  testable claim (R2b-1's search).

## 4. Raw PGA TOUR radar driver

**Measured** (PGA TOUR 2022-23 TrackMan radar, Par 4/5 tee shots, season
means; `provenance.md` §5, re-verified in the notes **[S]**): ball 172.85 mph,
launch 10.49°, spin 2,571 rpm; carry 283.8 yd and hang time 6.4 s, both to
ground impact; apex 34.0 yd; distance to apex 186.0 yd, i.e. the apex at
**65.5 %** of carry as a ratio of means. Mean venue air density is 0.992 of
25 °C sea level (`conditions.md` **[S]**). The launch was flown at 0.992 with
diagnostic steps of 0.005 s (`harness/raw-driver.mjs`; log
`harness/out/raw-driver.txt`) **[D]**.

| Law, variant | carry yd | apex yd | hang s (vs 6.4) | apex % (vs 65.5) |
|---|---|---|---|---|
| Measured | 283.8 | 34.0 | 6.4 | 65.5 |
| **(a) nothing fitted** | | | | |
| Today's law (F0, kD = kL = 1) | 284.5 | 43.3 | 7.67 (+1.27) | 66.4 (+0.9) |
| Measured surface, nominal (R0–R3 identical: the driver stays above the band) | 281.4 | 29.2 | **6.38 (−0.02)** | 64.1 (−1.4) |
| **(a′) the mode-G global fits** | | | | |
| F0 G | 259.4 | 37.3 | 7.04 (+0.64) | 66.6 (+1.1) |
| R0 G | 282.5 | 32.8 | 6.81 (+0.41) | 65.2 (−0.3) |
| R1 / R2 / R3 G | 290.3 / 289.0 / 289.4 | 32.5–32.8 | 6.79–6.82 (+0.39…+0.42) | 64.8–64.9 (−0.6…−0.7) |
| **(b) calibrated to carry 283.8 and apex 34.0** | | | | |
| F0 (kD 0.808, kL 0.813) | 283.8 | 34.0 | **6.80 (+0.40)** | 65.0 (−0.5) |
| R0 (1.009, 1.031) | 283.8 | 34.0 | 6.95 (+0.55) | **65.5 (0.0)** |
| R1 (A\* / G shape) | 283.8 | 34.0 | 6.92–6.95 (+0.52…+0.55) | 65.6–65.7 (+0.1…+0.2) |
| R2 | 283.8 | 34.0 | 6.90–6.93 (+0.50…+0.53) | 65.9 (+0.4) |
| R3 | 283.8 | 34.0 | 6.90–6.93 (+0.50…+0.53) | 65.7–65.9 (+0.2…+0.4) |

**Which laws does the raw driver prefer?**

- **With nothing fitted, the measured surface by far.** It flies the radar
  launch 2.4 yd short and 4.8 yd low, but gets the hang time within 0.02 s
  and the apex position within 1.4 points. Today's law, unfitted, is right on
  carry but 9.3 yd too high and 1.27 s too long in the air.
- **As fitted to the table (mode G), the measured surfaces again.** R0 gets
  carry within 1.3 yd and apex within 1.2 yd. R1–R3 run 5–7 yd long. F0's
  global fit is 24 yd short, the round-1 driver shortfall.
- **Calibrated to the radar's carry and apex, barely at all.** Every law then
  keeps the ball up 0.40–0.55 s longer than the radar's 6.4 s. F0 is closest
  on hang time by 0.10–0.15 s. R0 hits the apex position exactly and F0 is 0.5
  points early. R2 and R3 are 0.4 points late. These differences are smaller
  than the averaging effects in §5 and the ±0.05 s rounding of the published
  hang time, so the calibrated test does not separate the laws.
- **One structural fact stands.** Matching this carry and apex needs 6–8 %
  less hang time than any calibrated law gives. A shorter flight at the same
  carry and apex means a higher mean horizontal speed: lower drag early, or a
  faster, steeper descent. In the unfitted measured surface the apex is too
  low, but it is the only variant that gets the time right.

## 5. Average of shots versus shot of averages

The radar numbers are means over ~114,000–122,000 shots. Hang time, apex and
carry are not linear in launch, and "65.5 %" is a ratio of two means taken
over different shot counts. The effect was bounded with 5-point
Gauss–Hermite quadrature per dimension (125 shots), with independent normal
spreads about the mean launch. The spreads are assumed, not measured: PGA TOUR
publishes means only, and "Par 4 and Par 5 tee shots" may include some
non-driver clubs. Moderate is SD 6 mph / 2° / 500 rpm; wide is 10 mph / 3° /
800 rpm **[D]**.

**At fixed calibration** (mean over the spread minus the value at the mean
launch):

| Law | carry yd | apex yd | hang s | apex % (ratio of means) |
|---|---|---|---|---|
| F0 | −2.3 / −6.0 | −0.1 / −0.2 | −0.06 / −0.14 | −0.05 / −0.14 |
| R0 | −4.2 / −9.5 | +0.1 / +0.2 | −0.06 / −0.14 | +0.06 / +0.02 |
| R1 | −6.3 / −12.7 | +0.1 / +0.1 | −0.12 / −0.24 | +0.52 / +0.65 |
| R2 | −7.4 / −14.5 | +0.1 / +0.1 | −0.18 / −0.34 | +0.74 / +0.96 |
| R3 | −7.2 / −14.3 | +0.1 / +0.1 | −0.17 / −0.33 | +0.72 / +0.90 |

(moderate / wide)

**Recalibrated so the spread means of carry and apex equal 283.8 / 34.0 yd**,
which is the like-for-like comparison with season means:

| Law | mean hang s, moderate / wide (vs 6.4) | apex %, moderate / wide (vs 65.5) |
|---|---|---|
| F0 | 6.76 / 6.69 (+0.36 / +0.29) | 64.9 / 64.7 |
| R0 | 6.89 / 6.80 (+0.49 / +0.40) | 65.3 / 65.0 |
| R1 | 6.85 / 6.75 (+0.45 / +0.35) | 65.8 / 65.5 |
| R2 | 6.78 / 6.66 (+0.38 / +0.26) | 66.0 / 65.7 |
| R3 | 6.78 / 6.66 (+0.38 / +0.26) | 66.0 / 65.7 |

- **Averaging shortens the mean hang time** by 0.06–0.34 s and moves the
  ratio-of-means apex position by up to +1 point. At the wide spread it
  closes a quarter to a half of the hang-time gap (to +0.26…+0.40 s), never
  all of it.
- **It reshuffles the small differences between laws.** Under the wide
  spread R2 and R3 come closest on hang (+0.26 s) and R1 on apex position
  (65.5 %). The law preferences in §4(b) are inside this uncertainty.
- **The carry Jensen gap is large for the banded laws** (−6…−15 yd), partly
  because the slower shots of the spread dip into the band. R0, without the
  band, gives −4…−10 yd. A season mean of carry is therefore not the carry
  of the mean shot, which matters for any calibration to averaged tables, the
  tour-average rows included.

## 6. Reading

1. **With altitude soft, the ranking stands:** R2 in mode G, R3 in mode A.
   Neither meets the success bar. What the altitude ruling changes is that
   their altitude behaviour becomes a reported property. That behaviour is
   stark: LPGA 4–7 iron carry peaks at 6,200–12,300 ft (mode G) or 600–8,100
   ft (mode A), against "still rising at 15,000 ft" for today's law.
2. **Oracle 6 is the sharpest real-world-ish discriminator, and it favours
   the band-free surfaces under the app's calibration.** PGA 7-iron +11.7 %
   (R0) and +11.3 % (today) against the players' +12–14 %; the banded A\* fits
   give +6.0…+8.7 %. In mode G every law gives +10.8…+13.1 %.
3. **The raw radar driver favours the measured surfaces where they are not
   fitted, and is neutral where they are.**
   - Unfitted, the measured surface gets the hang time (6.38 against 6.4 s)
     and apex position (64.1 % against 65.5 %) almost right, with an apex
     4.8 yd low. Today's law is 1.27 s and 9.3 yd off.
   - Calibrated to the radar's carry and apex, all laws hang 0.40–0.55 s too
     long and place the apex within ±0.5 points. That spread is inside the
     averaging uncertainty (0.06–0.34 s, up to 1 point).
4. **Open:**
   - Whether carry really turns over at mid-altitude for slower, mid-spin
     shots. That is the decisive measurement, and it is R2b-1's search.
   - Why every calibrated law hangs the driver ~0.4–0.5 s longer than the
     radar. Candidates are spin decay, or a drag shape that the table
     calibration hides. The ground-impact definition cuts both ways (landing
     areas below the tee lengthen the measured time, above it shorten it),
     and the mean height difference is unknown. It is unresolved.

