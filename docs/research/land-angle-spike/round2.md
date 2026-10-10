# Land-angle spike, round 2 (R2-1): measured-surface refit

Probe 2, round 2, 2026-10-09. Mandate: `BRIEF.md` "Round 2", R2-1. Verified
numbers, each with the command that produced it, are in `round2.md.notes.md`.
Harness: `docs/research/land-angle-spike/harness/` (throwaway; round-2 code is
additive, and `harness/check-f0.mjs` still passes). Claim tags as in round 1:
**[P]** primary, **[S]** secondary, **[D]** derived here.

## 1. Summary

C_L(Re, S) and C_D(Re, S) were pinned to probe 1's measured surfaces. Free
were only the band onset, band minimum, depth, crisis drag rise and one
ball-spread scale per coefficient, each inside its measured bound. Beyond the
measured S 0.36 the low-Re band was extrapolated three ways: persisting (R1),
fading by S 0.6 as Bearman & Harvey's ball does (R2), or fading by S 1.0 (R3).
R0, the supercritical surfaces with no band, is the control. There is one
physics for all 23 rows. All numbers are **[D]**.

| | Mode G RMS carry / height / land (LOO-CV) | Mode A land (CV) | Hard oracles 1, 2, 3, 6, 9a |
|---|---|---|---|
| Today's law, unfitted / shipped app | 16.94 / 5.83 / 4.22 | 4.65 | all pass |
| Measured, unfitted: R0 / R2 / R3 | 5.23 / 3.06 / 6.36; 7.38 / 3.08 / 3.66; 10.01 / 3.21 / 3.51 | 3.96; 2.43; 1.88 | R0 A passes; banded fail 3, 9a |
| **Best mode G: R2** (fade by 0.6) | **5.39 / 2.04 / 2.73 (5.88 / 2.12 / 2.81)** | 2.27 (2.39) | G fails 9a; A\* fails 3, 9a |
| **Best mode A: R3** (fade by 1.0) | 6.08 / 1.99 / 2.81 (6.49 / 2.07 / 2.93) | **1.62 (1.79)** | A\* fails 3, 6, 9a |
| R0 fitted (sD 1.06, sL 1.12) | 6.39 / 2.04 / 3.73 (6.69 / 2.10 / 3.78) | 3.96 | **A passes all five**; G fails 9a (LPGA 3-wood, ≤ 0.23 yd) |
| Band held to the altitude penalty | 7.65–9.54 / 1.99–2.09 / 3.35–3.59 | 3.34–3.59 | still fails 9a (G and A\*) |

1. **Unfitted, the measured surfaces beat today's model.** Under the app's
   calibration, land goes from 4.65° to 3.96° (no band) or 1.88–2.81° (banded).
   As a predictive model they beat today's unfitted law on carry and height
   in every variant, and on land with R2 and R3 (R0 and R1 land worse). Against today's law with its two levels fitted they are
   mixed: R2 matches carry, gains 0.55° on land and loses 0.9 yd on height. The
   unfitted supercritical surface also reproduces TrackMan's 2014 model 6-irons
   (within 2.4 yd and 1.3°) and wind responses (within 0.9°).
2. **No measured-bounded fit meets the success bar.** Mode G's best (R2) is
   5.39 / 2.04 / 2.73 against 2 / 1 / 1.5. Mode A's best (R3) is 1.62° (CV
   1.79°), the closest anything has come, but it fails hard oracles 3, 6 and
   9a.
3. **The table prefers the band fading with S.** As a predictive model it
   prefers R2 (fade by S 0.6, the Bearman & Harvey guide): cost 338 against 385
   for R3, 473 for no band and 496 for persisting. Persisting is worse than no
   band. Under per-row calibration the slow fade wins (R3 1.62°, R1 1.67°, R2
   2.27°). The guide is one 1970s ball with its crisis at a different Re.
4. **Hard oracles: only the band-free surface passes all five, and only under
   the app's calibration.** Every banded surface fails 9a in both modes,
   everywhere in the measured box, even refitted against a strict altitude
   penalty. Some LPGA long iron or the LPGA 3-wood then loses carry with
   elevation below 10,000 ft. R0 in mode G also fails 9a on the LPGA 3-wood
   above ~8,750 ft (≤ 0.23 yd per 250 ft).
5. **Altitude and Padjen.** The band moves earlier in thin air (Re ∝ ρ), so the
   iron carry gains of the banded fits shrink, down to −6…−8 % at 10,000 ft for
   LPGA irons under R2/R3 A\*. Padjen's land change (−9°) is met best without
   the band (R0 −8.1…−8.5°), less well with it (−6.0…−7.1°), and fails oracle 3
   under R2/R3 A\* (−4.5°). Carry at 7,800 ft stays near Padjen's +8.5 %
   (6.8–10.3 %).
6. **Driver shape (soft).** The driver barely touches the band. The measured
   surface gives a hang time of 6.27–6.70 s (radar 6.4 s) and an apex at
   64.0–65.1 % of carry (radar 65.5 %), but an apex 3.4–6.8 yd below the
   table's 35 yd. Calibrated to the table's apex (mode A), every law hangs
   7.0–7.1 s.

**Reading.** The measured low-Re lift collapse is what the land column asks
for, and the table even says how it should fade with spin. But within its
measured bounds the band cannot be made altitude-monotone, and the table wants
it shallower than measured. If an app change is wanted now, the defensible
one is R0 under the app's calibration: measured supercritical laws, every
coefficient inside the data, all five hard oracles, land 4.65° → 3.96°. The
band waits for measurements at S > 0.36 below Re 7e4 and for altitude data
that are not TrackMan-derived (§7).

## 2. The measured surfaces and what is free

**Laws (probe 1, `aero-data.md` §1 [S]; implemented in `harness/laws2.mjs`):**

```
C_L(Re, S) = sL · C_L0(S) · (1 − a · w(Re) · g(S))
C_D(Re, S) = sD · (C_D0(S) + k_Re · (max(Re, 1e5) − 1.5e5) + dC · w_D(Re) · g(S))

C_L0(S) = 0.065 + 0.85 S                     S ≤ 0.30   (measured, n 81, rms 0.024)
        = min(0.45, 0.32 + 0.25 (S − 0.30))  S > 0.30   (Bearman & Harvey shape)
C_D0(S) = 0.220 − 0.27 S + 3.0 S²            S ≤ 0.22   (measured, rms 0.020)
        = C_D0(0.22) + 0.38 (S − 0.22)       0.22–0.46  (B&H slope; measured)
        = continued to S 0.64, flat above    S > 0.46   (extrapolation)
k_Re    = +0.0135 per 1e5                               (measured 0.010–0.017)
```

- **w(Re)** is the lift-loss band: 0 above the onset ReHi, a smooth step to 1
  at the minimum ReLo, then partial recovery to 0.62 at Re 5e4. That puts the
  lift ratio f = 1 − a·w at 0.44 at a = 0.9, inside the measured 0.2–0.7.
  Below 5e4, where no modern ball has been measured, it is held.
- **w_D(Re)** is the crisis drag rise: a smooth step from 0 at 8.5e4 to 1 at
  5e4 at the nominal band, about the measured ~20 % of the 5e4 rise at 7.5e4
  and ~55 % at 6.3e4. It moves with ReHi and ReLo, so lift loss and drag
  crisis share one boundary-layer transition, as probe 1 reports they do
  (Lyu 2020: lift deficit tracks the crisis slope, r² 0.87).
- **g(S)** is the explicit extrapolation beyond the measured S 0.36. It is
  applied to both the lift loss and the crisis drag, since both come from the
  same mechanism.
- **Spin decay** is the shipped Smits & Smith law (probe 1 found nothing that
  says otherwise).
- Small implementation choices: C_D0 is joined continuously at S 0.22 (the
  quadratic gives 0.3058 there, the published linear branch 0.30), and k_Re
  is frozen below Re 1e5, where the crisis term takes over.

**Free parameters, each inside its measured bound (nominal value in brackets):**

| Parameter | Bound | Nominal | Basis |
|---|---|---|---|
| ReHi, band onset | 7.0–8.0e4 | 7.5e4 | BRIEF R2-1; probe 1 |
| ReLo, band minimum | 5.5–6.5e4 | 6.2e4 | BRIEF R2-1; probe 1 |
| a, band depth | 0.4–1.3 | 0.9 | BRIEF R2-1; a > 1 is negative lift |
| dC, crisis drag at Re 5e4 | 0–0.25 | 0.17 | probe 1: ball-specific, 0 to +0.25 |
| sD, drag ball-spread scale | 0.9–1.1 | 1 | ±0.02 on C_D ≈ 0.2 (Lyu 2018 ball spread) |
| sL, lift ball-spread scale | 0.85–1.15 | 1 | ±0.03 on C_L ≈ 0.2 (probe 1: ±0.02–0.03) |

dC is not on the BRIEF's list, but probe 1 gives it as measured-uncertain
(0 to +0.25), so it is freed within that bound. Its nominal 0.17 is the Lyu
2020 rise at Re ≈ 5e4 over C_D0 at the measurement's S (+0.14…+0.21) **[D]**.
No parameter is per-tour or per-club: one physics for all 23 rows, as ruled.

**Extrapolation alternatives where flights leave the measured range**
(S > 0.36 at Re < 7e4: the late descent of hybrids, irons and wedges, which reach
S 0.4–1.25):

| Family | g(S) above S 0.36 | Guide |
|---|---|---|
| R1 "persist" | 1 (band unchanged at every S) | none, the neutral assumption |
| R2 "fade by 0.6" | linear to 0 at S 0.6 | Bearman & Harvey 1976: at their trough Re 3.8e4 the lift ratio C_L / C_L0 is 0.64 at S 0.30, 0.78 at 0.45 and 0.99 at 0.60; at Re 5.9e4 their high-S lift and drag sit on the supercritical laws |
| R3 "fade by 1.0" | linear to 0 at S 1.0 | a slower fade, between R1 and R2 |
| R0 control | no band at all | the supercritical laws extrapolated |
| R2f | R2 with C_D0 flat beyond S 0.46 | drag-extrapolation sensitivity |

**How weak the B&H guide is.** It is one 1970s ball, measured on a 2.5×
model. The figures were digitized by probe 1 from a reproduction in Kensrud
2010 (±0.008). Its crisis and lift trough sit near Re 4e4, not the modern
6–7e4, so using it assumes the S-dependence of the loss carries over when the
crisis moves. It also reads ~0.04 below modern balls in lift at S ≈ 0.3. It is
the only measurement at S > 0.36 and low Re, and nothing modern confirms it.

**Implementation check** **[D]** (`harness/plausibility.mjs`, 216 measured
points). At Re ≥ 8e4 the nominal surfaces sit at C_D bias −0.001 (RMS 0.016)
and C_L bias −0.003 (RMS 0.020) against the measurements, against +0.019 /
+0.054 for today's law. At Re < 8e4 the banded surfaces' lift bias is +0.004 to
+0.013 (RMS 0.08–0.10, the reverse-Magnus scatter), against +0.184 for today's
law. Their low-Re drag is biased +0.05…+0.08, because the low-Re drag points
mix crisis balls (Lyu) with balls that show none (Bridgestone at 7e4, B&H).

## 3. Unfitted: the measured surfaces as published

Nominal values (§2), nothing fitted (`run-family.mjs <F> --fixed --tag
nominal`) **[D]**. "Today, unfitted" is the shipped law with kD = kL = 1. Mode A
keeps the app's per-row kD, kL fitted to carry and height, which is how the
app itself runs.

| Surface | Mode G RMS carry / height / land | Mode A land RMS | Hard oracles failed (G / A) |
|---|---|---|---|
| Today's law, unfitted | 16.94 / 5.83 / 4.22 | **4.65** (the shipped app) | — / — |
| Today's law, 2 levels fitted (F0, round 1) | 7.58 / 2.19 / 4.21 | 4.65 | — / — |
| R0 measured supercritical, no band | 5.23 / 3.06 / 6.36 | 3.96 | 9a / — |
| R1 band persists at all S | 14.68 / 3.45 / 4.92 | 2.81 | 9a / 3, 9a |
| R2 band fades by S 0.6 (B&H) | **7.38 / 3.08 / 3.66** | 2.43 | 9a / 3, 9a |
| R3 band fades by S 1.0 | 10.01 / 3.21 / 3.51 | **1.88** | 9a / 3, 9a |

**Do the measured surfaces, unfitted, beat today's model? Partly.**

- **Under the app's calibration (mode A), yes, on land angle.** All four
  measured surfaces beat the shipped app's 4.65° with nothing fitted: 3.96°
  without the band, 1.88–2.81° with it. But only R0, the one without the band,
  keeps a clean altitude response. Every banded surface fails hard oracle 9a
  (162–226 carry falls between 0 and 10,000 ft) and oracle 3 (Padjen land change
  only −4.05° at 7,800 ft).
- **As a predictive model (mode G), yes against today's law unfitted, mixed
  against today's law with its two levels fitted.** Unfitted, today's law flies
  the table 17 yd too long and 6 yd too high, and the measured surfaces cut
  that to 5–15 yd and 3.1–3.5 yd. Against F0 with its levels fitted (7.58 / 2.19 /
  4.21), R2 matches carry, improves land by 0.55° and loses 0.9 yd on height.
- **The measured supercritical surface reproduces TrackMan's own model.**
  Unfitted, R0 flies TrackMan's 2014 model 6-irons within 2.4 yd, 0.5 yd and
  1.3° (PGA) and 1.4 yd, 0.3 yd and 0.4° (LPGA). It also reproduces TrackMan's
  wind responses within 0.9° and 0.8 yd. TrackMan's 2014 model trajectories are
  therefore consistent with measured supercritical aerodynamics without a
  low-Re lift loss (informational).

Where the unfitted surfaces go wrong (per-row, `rows-table.mjs G`) **[D]**:

- **Low-spin rows never enter the band** (drivers and the LPGA 3-wood stay
  above Re 7.5e4, or reach it only at the very end). They fly 3–7 yd too low
  and land 5.7–11.2° too shallow under every measured surface. With nothing
  fitted, the measured lift (C_L 0.065 + 0.85 S) is too weak for them. The
  fitted lift scale sL ≈ 1.08–1.12 (§4) is the cure, and it sits inside the
  measured ball-to-ball spread.
- **The band fixes the mid-spin rows' land angle but costs them carry.** R2
  takes the PGA 5-wood, hybrid and 3–5 irons from −8.7…−10.1° (R0) to
  −0.8…−2.2°, but flies the hybrid and 4 iron 10–15 yd short.
- **Extrapolation matters most for the high-spin irons.** R1 and R3 keep the
  band active on the 6-iron to PW descents and fly them 4–24 yd short. R2 lets
  them recover above S 0.6 and leaves them near the supercritical result.

## 4. Fitted within measured bounds

Bounded Levenberg–Marquardt with 10 restarts, weights as in round 1 (carry / 2
yd, height / 1 yd, land / 1.5°), leave-one-row-out CV
(`run-family.mjs <F> --restarts 10`; logs `harness/out/<F>.txt`) **[D]**. Mode A\*
refits the band parameters (ReHi, ReLo, a, dC) to land under the app's per-row
kD, kL, which absorb sD and sL.

### 4.1 Mode G: one parameter set, no per-row knobs

| Family | RMS carry / height / land | LOO-CV | Fitted parameters (bold = at a measured bound) | Hard oracles failed |
|---|---|---|---|---|
| R0 no band | 6.39 / 2.04 / 3.73 | 6.69 / 2.10 / 3.78 | sD 1.060, sL 1.124 | 9a |
| R1 persist | 7.33 / 2.02 / 3.02 | 7.68 / 2.07 / 3.09 | sD 1.002, sL 1.088, **ReHi 8.0e4, ReLo 6.5e4, a 0.40, dC 0** | 9a |
| **R2 fade by 0.6** | **5.39 / 2.04 / 2.73** | **5.88 / 2.12 / 2.81** | sD 1.002, sL 1.081, **ReHi 8.0e4, ReLo 6.5e4, a 0.40**, dC 0.112 | 9a |
| R3 fade by 1.0 | 6.08 / 1.99 / 2.81 | 6.49 / 2.07 / 2.93 | sD 1.007, sL 1.090, **ReHi 8.0e4, ReLo 6.5e4, a 0.40**, dC 0.028 | 9a |
| R2f (C_D0 flat > S 0.46) | 4.97 / 2.18 / 3.14 | 5.33 / 2.25 / 3.24 | sD 1.044, sL 1.112, ReHi 7.27e4, **ReLo 6.5e4, a 0.40**, dC 0.032 | 9a |
| *F0, today (round 1)* | 7.58 / 2.19 / 4.21 | 8.12 / 2.24 / 4.25 | gD 1.128, gL 0.976 | — |
| *F1, best of round 1 (unbounded)* | 4.09 / 1.92 / 2.38 | 4.96 / 2.04 / 2.52 | lift switched off below 7.7e4 | 6, 9a |

Readings:

- **The table prefers R2, the band fading by S 0.6 (the B&H guide).** Its cost
  is 338 against 385 (R3), 473 (R0) and 496 (R1). Persisting the loss at high
  S (R1) is worse than having no band at all. The ranking is set by the
  6-iron to PW, which reach S > 0.6 late in flight. A persisting band flies
  them 4–6 yd shorter than a fading one, though it lands them 1–3° steeper,
  closer to the table.
- **Within measured bounds the band is pushed to its weakest, earliest
  corner.** In every banded family the fit takes the shallowest measured depth
  (a = 0.40), and puts the onset and the minimum at the highest measured Re
  (8.0e4, 6.5e4). The table wants a shallow loss starting early, not the
  measured nominal deep, narrow trough (a ≈ 0.9). The ball-spread scales stay
  inside their bounds (sD 1.00–1.06, sL 1.08–1.12): the measured lift is
  ~8–12 % too weak for the table, at the top of the ball-to-ball spread.
- **R2 beats today's model on all three outputs** (carry 5.39 vs 7.58, height
  2.04 vs 2.19, land 2.73 vs 4.21; CV likewise), with every coefficient inside
  measured ranges. It does not approach the success bar (2 yd / 1 yd / 1.5°).
  It is also worse than round 1's unbounded F1 (4.09 / 1.92 / 2.38), which
  needed a full lift switch-off that the measurements do not allow at high S.
- **The PGA Driver is no longer short.** R2 flies it +2.0 yd, against −11.7 to
  −26.6 yd in round 1, because the measured supercritical drag is lower than
  today's law. The largest carry misses move to the PGA PW (−9.3 yd), PGA
  hybrid (−8.6) and LPGA 4–5 irons (−7…−9). The LPGA 3-wood is the worst land
  row (−9.2°), because at 2,595 rpm it never reaches the band.
- **Overfitting is not the issue:** CV adds 0.3–0.5 yd and 0.05–0.12°, and
  the LOO parameters sit on the same bounds (R2: sL 1.07–1.09, dC 0.09–0.21).

### 4.2 Mode A: the app's per-row calibration

| Family | A (G shape) | A\* | A\* LOO-CV | A\* band parameters | Hard oracles failed (A\*) |
|---|---|---|---|---|---|
| F0 (shipped app) | 4.65 | 4.65 | — | — | — |
| R0 no band | 3.96 | 3.96 | — | — | **none** |
| R1 persist | 2.57 | 1.67 | 1.79 | ReHi 7.79e4, **ReLo 6.5e4, a 0.40**, dC 0.131 | 9a |
| R2 fade by 0.6 | 2.56 | 2.27 | 2.39 | **ReHi 8.0e4**, ReLo 6.34e4, **a 1.30**, dC 0.042 | 3, 9a |
| **R3 fade by 1.0** | 2.54 | **1.62** | **1.79** | **ReHi 8.0e4, ReLo 6.5e4**, a 1.10, dC 0.039 | 3, 6, 9a |
| R2f | 3.31 | 2.66 | 2.75 | **ReHi 8.0e4**, ReLo 6.49e4, **a 1.30**, dC 0.027 | 3, 6, 9a |

- **Under the app's calibration the measured band nearly reaches the bar:**
  R3 A\* 1.62° (CV 1.79°) and R1 1.67° (CV 1.79°), against 4.65° today and
  1.76° for round 1's best unbounded law. Mode A prefers the slow fade or no
  fade, the opposite of mode G, because the per-row kD and kL absorb the carry
  cost that R1 and R3 impose on the high-spin irons.
- **No banded mode-A fit keeps a defensible altitude response.** All fail 9a,
  and R2, R3 and R2f also fail oracle 3 (Padjen land change only −4.2 to
  −4.6°). R0, the measured supercritical laws with no band, is the only
  round-2 surface that passes all five hard oracles under the app's
  calibration, with land 3.96° (from 4.65°).
- **The tour-shaped residual shrinks but stays** (per-row A\* land, model −
  table):

| Row | F0 (app) | R0 | R1 A\* | R2 A\* | R3 A\* |
|---|---|---|---|---|---|
| PGA Driver | −1.1 | −0.5 | +0.7 | +0.5 | +0.5 |
| PGA 3-wood | −4.5 | −3.2 | +1.1 | +1.2 | +1.2 |
| PGA 5-wood | −6.5 | −5.3 | −0.6 | −0.5 | −0.5 |
| PGA Hybrid | −9.2 | −8.0 | −3.9 | −3.9 | −3.9 |
| PGA 3 Iron | −7.5 | −6.3 | −1.9 | −1.5 | −1.5 |
| PGA 4 Iron | −7.0 | −5.9 | −1.4 | −1.0 | −1.0 |
| PGA 5 Iron | −5.9 | −4.8 | −0.3 | 0.0 | +0.1 |
| PGA 6 Iron | −5.5 | −4.4 | −0.6 | −1.8 | −0.5 |
| PGA 7 Iron | −4.4 | −3.6 | +0.5 | −3.3 | +0.5 |
| PGA 8 Iron | −3.6 | −3.6 | +0.4 | −3.6 | −0.3 |
| PGA 9 Iron | −3.9 | −4.5 | −0.7 | −4.5 | −2.2 |
| PGA PW | −3.4 | −4.3 | −0.7 | −4.3 | −2.5 |
| LPGA Driver | −1.5 | −0.9 | +0.8 | +0.9 | +0.9 |
| LPGA 3-wood | −1.1 | +0.2 | +4.2 | +4.5 | +4.5 |
| LPGA 5-wood | −4.7 | −3.6 | +0.1 | +1.0 | +0.9 |
| LPGA Hybrid | −5.6 | −4.6 | −1.2 | −0.3 | −0.4 |
| LPGA 4 Iron | −4.0 | −3.1 | +0.3 | +0.7 | +0.7 |
| LPGA 5 Iron | −4.9 | −4.1 | −0.9 | −0.4 | −0.4 |
| LPGA 6 Iron | −4.2 | −3.5 | −0.7 | −1.6 | −0.5 |
| LPGA 7 Iron | −2.6 | −2.0 | +0.9 | −2.2 | +0.8 |
| LPGA 8 Iron | −0.2 | −0.4 | +2.7 | −0.4 | +1.8 |
| LPGA 9 Iron | −0.4 | −0.9 | +2.1 | −0.9 | +1.0 |
| LPGA PW | +0.7 | −0.4 | +2.6 | −0.4 | +0.3 |

  Two rows carry most of what is left: the PGA hybrid (−3.9° in every banded
  fit) and the LPGA 3-wood (+4.2 to +4.5°). The LPGA short irons, 2.5–4.7° too
  steep under round 1's best laws, are now within ±2.7° (R1) and ±1.8° (R3).
  Under R2 the high-spin PGA short irons stay 3.3–4.5° shallow, because the
  band has faded by the time they slow down.

### 4.3 Can the band be made altitude-defensible within its bounds?

Refitted with a strict altitude penalty: carry may not fall, and height and
land may not rise, at 500 ft nodes to 10,000 ft, ×10 weight, plus oracles 1, 3
and 6 as bands (`--constrained --pen-step 500 --pen-weight 10`; logs
`harness/out/<F>-c500w10.txt`) **[D]**:

| Family | G RMS carry / height / land (CV) | A\* land (CV) | Band parameters | 9a falls 0–10k, G / A\* (worst) | Oracles 1, 2, 3, 6 |
|---|---|---|---|---|---|
| R0 | 7.34 / 2.07 / 3.20 (7.47 / 2.07 / 3.20) | 3.96 | (none; sL → 1.15 bound) | 4 / 0 (0.22 yd, LPGA 3-wood) | pass |
| R1 | 9.54 / 2.09 / 3.59 (9.74 / 2.16 / 3.65) | 3.34 (3.34) | **ReHi 7.0e4, ReLo 5.5e4, a 0.40, dC 0** | 7 / 5 (0.42 yd) | pass |
| R2 | 7.65 / 1.99 / 3.35 (7.86 / 2.06 / 3.39) | 3.59 (3.59) | **ReHi 7.0e4, ReLo 5.5e4, a 0.40, dC 0** | 6 / 3 (0.43 yd) | pass |
| R3 | 8.23 / 2.01 / 3.36 (8.43 / 2.07 / 3.40) | 3.41 (3.41) | **ReHi 7.0e4, ReLo 5.5e4, a 0.40, dC 0** | 6 / 3 (0.43 yd) | pass |

Asked for a defensible altitude response, every banded fit goes to the
opposite corner of the measured box: the latest onset, the lowest minimum, the
shallowest depth and no crisis drag. Each still fails 9a in both modes. In G
the LPGA 3-wood's carry falls from 8,500–8,750 ft; in A\* the LPGA 4-iron's
carry falls from 9,250–9,500 ft, by up to 0.4 yd per 250 ft. **Inside the
measured bounds no band passes 9a.** At the weakest corner the band is also
worth little: mode A\* land is 3.3–3.6°, barely better than R0's 3.96°, and
mode G is worse than unconstrained R2 on carry and land.

## 5. Altitude, hard oracles and Padjen

Constant 25 °C, so Re falls with ρ (−17 % at 5,280 ft, −31 % at 10,000 ft).
Mode G deltas are against the model's own sea-level flight, mode A\* against
the calibrated one. The hard set is the app's full one: 1 (PGA Driver 7,800 ft
carry +5…+12 %), 2 (apex −28…−8 %), 3 (land −13…−5°), 6 (PGA 7-iron 6,400 ft
carry +7…+16 %) and **9a** (every row monotone 0–10,000 ft on a 250 ft grid:
carry never falls, max height and land never rise). A 9a failure is a
failure. Padjen (soft): +8.5 % carry, −18 % apex, −9° land at 7,800 ft
**[D]** (`harness/summary.mjs`).

| Family, mode | carry % 5,280 ft PGA / LPGA | carry % 10,000 ft PGA / LPGA | 9a falls 0–10k (worst) | Padjen carry / apex / land | Hard oracles failed |
|---|---|---|---|---|---|
| F0 A (shipped app) | 6.4…9.6 / 4.5…8.9 | 10.5…16.9 / 7.0…15.7 | 0 | +8.8 % / −15.6 % / −7.93° | — |
| R0 G | 6.7…11.3 / 2.7…8.9 | 10.6…20.2 / 3.0…15.5 | 6 (0.23 yd, LPGA 3-wood) | +9.1 / −14.9 / −8.11 | 9a |
| R0 A | 7.5…10.2 / 5.4…8.6 | 12.2…17.5 / 8.1…15.2 | 0 | +10.3 / −15.2 / −8.46 | **—** |
| R1 G | 5.9…10.1 / 1.7…7.4 | 8.5…17.1 / 0.2…11.7 | 44 (0.76 yd) | +7.6 / −15.4 / −7.10 | 9a |
| R1 A\* | 6.1…8.0 / 3.3…5.2 | 8.6…11.8 / 1.8…6.5 | 90 (0.91 yd) | +8.2 / −15.4 / −5.98 | 9a |
| R2 G | 5.6…10.4 / 1.4…7.4 | 7.8…18.2 / −0.9…12.1 | 94 (0.97 yd) | +7.1 / −15.4 / −6.35 | 9a |
| R2 A\* | 2.7…9.3 / −1.8…8.5 | 0.4…14.9 / −8.1…14.4 | 287 (1.77 yd) | +6.8 / −15.4 / −4.45 | 3, 9a |
| R3 G | 5.8…9.7 / 1.7…6.7 | 8.4…16.4 / −0.0…10.2 | 50 (0.81 yd) | +7.6 / −15.4 / −6.90 | 9a |
| R3 A\* | 4.7…6.4 / −0.3…6.1 | 4.3…8.8 / −6.0…4.7 | 291 (1.67 yd) | +6.8 / −15.5 / −4.55 | 3, 6, 9a |

Readings:

- **Only the band-free measured surface passes the full hard set, and only
  under the app's calibration** (R0 A, land 3.96°). In mode G, R0 fails 9a on
  one row: the LPGA 3-wood's carry peaks near 8,750 ft and falls by up to
  0.23 yd per 250 ft above it. At 2,595 rpm and 11.6° launch it is the
  lowest-lift shot in the table. The likely reason, not isolated here, is
  that the measured lift at its S (C_L0 ≈ 0.15 at S ≈ 0.1, against 0.21 for
  today's law) is weak enough that thinner air costs it more lift than it
  saves in drag. Today's law shows the same fall, but only above 13,750 ft.
  Even with the lift scale at its 1.15 ceiling and a strict penalty, the fall
  survives (§4.3).
- **Every banded surface fails 9a**, in both modes and at every point of the
  measured box. Because Re falls with ρ, the band is reached earlier in thin
  air. LPGA long irons and the LPGA 3-wood then lose carry with elevation:
  from 4,750–6,500 ft in mode G, and from as low as 750–2,750 ft under R2 and
  R3 A\*, whose LPGA irons' carry *gain* at 10,000 ft falls to −6 to −8 %.
  That repeats round 1's Re-family result, now with every coefficient inside
  the measurements.
- **Padjen:** the band weakens the land-angle response at altitude. R0
  gives −8.1 to −8.5° against Padjen's −9°. The fitted bands give −6.4 to
  −7.1° in G, −6.0° in R1 A\*, and −4.5° in R2/R3 A\*, which fails hard oracle 3. Carry gains at
  7,800 ft stay near Padjen's +8.5 % (6.8–10.3 %).

## 6. Trajectory-shape checks

**PGA Driver against PGA TOUR 2022-23 radar (soft)**: hang time 6.4 s and
apex at 65.5 % of carry, both to ground impact and as ratios of season means
(`provenance.md` §5 **[S]**). The table row (171 mph, 10.4°, 2,545 rpm) as
flown by each law (`harness/driver-shape.mjs`) **[D]**:

| Family, mode | carry yd | apex yd | hang time s | apex at % carry |
|---|---|---|---|---|
| Radar mean (172.85 mph, 10.49°, 2,571 rpm) | 283.8 | 34.0 | **6.4** | **65.5** |
| Today unfitted, G | 280.1 | 41.8 | 7.56 | 66.4 |
| F0 A (shipped app) | 282.0 | 35.0 | 6.93 | 65.3 |
| R0–R3 nominal, G | 276.1 | 28.2 | 6.27 | 64.0 |
| R0 fitted, G | 277.6 | 31.6 | 6.70 | 65.1 |
| R2 fitted, G | 284.0 | 31.3 | 6.68 | 64.7 |
| R3 fitted, G | 284.2 | 31.5 | 6.70 | 64.7 |
| R0 / R1 / R2 / R3, A\* | 282.0 | 35.0 | 7.09 / 7.07 / 7.00 / 7.00 | 65.8 / 66.2 / 66.4 / 66.4 |

The driver touches the band only in its last few metres. Its minimum Re is
7.3–8.0e4, against fitted onsets of 7.8–8.0e4, so this check sees almost only
the supercritical surface. Unfitted, the measured surface gives the radar's
hang time within 0.13 s and the apex position within 1.5 points, but flies 6.8
yd lower than the table's 35 yd. Fitted (sL ≈ 1.08–1.12), it keeps 6.7 s and
64.7–65.1 %, with an apex 3.4–3.7 yd under the table and 2.4–2.7 yd under the
radar. Calibrated to the table's 35 yd apex (mode A), every law keeps the
driver up 7.0–7.1 s. The table's driver apex and the radar's hang time are
hard to satisfy together with any of these surfaces. The radar averages
fairway-ground impact over a slightly different shot set, so this is soft.

**TrackMan 2014 model shots and wind table (informational)** **[D]**
(`harness/tm-table.mjs`):

| Family, mode | 6-iron carry / height / land vs TrackMan model (PGA; LPGA) | max wind land / carry response error |
|---|---|---|
| Today unfitted, G | +24.6 / +6.8 / −2.3; +20.1 / +4.9 / −1.8 | 2.0° / 8.6 yd |
| F0 A (app) | land −1.8; −1.1 | 0.9° / 3.6 yd |
| **R0 nominal, G** | **+2.4 / −0.5 / −1.3; +1.4 / +0.3 / −0.4** | **0.9° / 0.8 yd** |
| R2 nominal, G | −1.2 / −0.7 / +1.2; −1.2 / −0.1 / +1.1 | 2.4° / 0.9 yd |
| R2 fitted, G | +1.6 / +2.2 / +1.4; +1.1 / +1.9 / +1.4 | 1.6° / 3.6 yd |
| R3 fitted, A\* | land +3.8; +2.9 | 1.6° / 8.4 yd |
| R1 nominal, G | −15.3 / −1.1 / +8.9; −14.3 / −0.5 / +8.2 | 4.7° / 4.6 yd |

With nothing fitted, the measured supercritical surface reproduces TrackMan's
2014 model 6-irons and wind responses better than any law in round 1. The
banded surfaces land those shots 1–9° steeper than TrackMan's model does.

**Ballooning** (dt 0.005 s; `harness/balloon-table.mjs`) **[D]**:

| Family, mode | rise above launch | apex at % carry (mean) | PGA Hybrid apex |
|---|---|---|---|
| F0 G | 0.7–6.6° | 60.0–67.1 (64.1) | 66.6 % |
| R0 G | 0.2–6.4° | 60.0–68.3 (64.6) | 68.0 % |
| R2 G | 0.1–5.9° | 59.8–70.7 (65.1) | 70.0 % |
| R3 G | 0.1–6.0° | 59.4–70.0 (64.9) | 69.5 % |
| F0 A (app) | 0.9–5.9° | 60.8–66.7 (63.9) | 65.9 % |
| R1 A\* | 0.7–4.6° | 60.4–70.7 (66.0) | 69.6 % |
| R3 A\* | 0.7–4.2° | 59.3–71.9 (66.2) | 70.7 % |

The band moves the apex of the low-launch, mid-spin clubs downrange (PGA
5-wood, hybrid and 3–4 irons to 69–72 % of carry under R3 A\*) and reduces the
climb above launch. This is the shape the BRIEF predicted, now produced by
measured coefficients rather than a free step.

## 7. What this means

All **[D]** unless tagged.

1. **The measured supercritical surface is a better base than today's law, on
   every count that does not involve the low-Re band.** It reproduces the
   measured coefficients above Re 8e4 to 0.016 / 0.020 RMS (today's law:
   0.037 / 0.057), which is how it was built. Unfitted, it reproduces TrackMan's 2014
   model 6-irons and wind responses within 2.4 yd and 1.3°. Its driver
   hang time is within 0.3 s of the radar. Fitted only with ball-spread scales
   (R0: sD 1.06, sL 1.12) it improves on today in mode G (6.39 / 2.04 / 3.73
   against 7.58 / 2.19 / 4.21). Under the app's calibration it takes land from
   4.65° to 3.96° while passing all five hard oracles. Its one blemish is in
   mode G: the LPGA 3-wood's carry stops rising above ~8,750 ft (≤ 0.23 yd per
   250 ft, a 9a failure).
2. **The measured low-Re band is what the land column wants, and the table
   says which extrapolation it prefers.** Each banded surface improves land:
   mode A from 3.96° (R0) to 1.62–2.27°, mode G from 3.73° to 2.73–3.02°. As a
   predictive model the table prefers R2, the band fading by S 0.6 as Bearman &
   Harvey's ball does; persisting at all S (R1) is worse than no band. Under
   per-row calibration the preference flips to the slow fade (R3, 1.62°)
   because kD, kL absorb the carry cost. Both preferences sit on a guide that
   is one 1970s ball.
3. **But the table wants a different band from the one measured, and no
   measured band survives altitude.** Unconstrained, mode G takes the
   shallowest measured depth (a 0.40, against the nominal 0.9) at the highest
   measured Re. Held to a defensible altitude response, it goes to the opposite
   corner (latest onset, lowest minimum, shallowest depth, no crisis drag) and
   still fails 9a. Every banded surface, anywhere in the measured box, makes
   some LPGA long iron or 3-wood lose carry with elevation below 10,000 ft.
4. **This sharpens round 1's conflict instead of resolving it.** The lift
   collapse below Re ≈ 7e4 is measured on current tour balls up to S 0.36 (Lyu
   2020, Bridgestone via probe 1 **[S]**). Taken at face value, it predicts that
   some slower shots gain little or no carry at altitude. Every altitude
   source collected says otherwise, but those sources are mostly TrackMan-model
   or TrackMan-derived. Either the band does not act this way in real flights
   (ball-specific, softened at the higher spins of real iron descents, or
   unlike lab still-air light-gate conditions), or the altitude evidence and
   the app's 9a oracle encode the Re-free behaviour of TrackMan's own model.
   This round cannot tell which. Measured carries at altitude for slow,
   moderate-spin shots would.
5. **Against the success bar, measured-bounded laws do not get there.** Mode
   G best is R2: 5.39 / 2.04 / 2.73 (CV 5.88 / 2.12 / 2.81), against 2 / 1 / 1.5.
   Mode A best is R3 at 1.62° (CV 1.79°), close to 1.5°, but it fails oracles 3,
   6 and 9a. The residual is still tour-shaped (PGA hybrid −3.9°, LPGA 3-wood
   +4.5° under every banded A\* fit), though the LPGA short irons are no
   longer an outlier group.
6. **Candidate for the app, if one is wanted now:** R0 under the app's
   calibration. That is the measured supercritical C_D(Re, S) and C_L(S) with
   per-row kD, kL as today. It passes the full hard set, improves land 4.65° →
   3.96°, is Re-dependent (k_Re) as the long-term design wants, and every
   coefficient is inside the measurements. The band should wait for
   measurements at S > 0.36 below Re 7e4 and for independent altitude data.
   Leaving it out costs ~2.3° of land against the best unconstrained band, but
   only 0.4–0.6° against a band held to the altitude penalty, which still fails
   9a.

**Not verified / open.** Digitized coefficient values carry probe 1's
uncertainty. The B&H high-S guide is one ball (§2). The lift recovery below
Re_lo (fixed at the measured mid-value) and the drag extrapolation beyond S
0.64 are single choices, and R2f shows the drag one moves mode-G land by 0.4°.
dC was freed although the BRIEF did not list it; with dC fixed at 0 the
constrained fits are unchanged (they drive it to 0 anyway), but the
unconstrained R2 used 0.11.
