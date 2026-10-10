# Land-angle spike, round 2 (R2-2, fit side): tour conditions diagnostic

Probe 2, 2026-10-09. Mandate: `BRIEF.md` "R2-2 — tour conditions diagnostic".
Verified numbers, each with its command, are in
`round2-conditions.md.notes.md`. Harness changes are additive and
`harness/check-f0.mjs` still passes. Tags: **[P]** primary, **[S]**
secondary, **[D]** derived here.

## 1. Summary

The test: one physics for both tours and every club, plus one effective
air-density ratio per tour as an environment term. It was run on today's laws
(F0) and round 2's R0 and R2. All numbers are **[D]**.

- **Fitted densities.** Every law puts the PGA rows in thinner air than the
  LPGA rows:
  - mode G: ratio 0.935 (F0), 0.963 (R0), 0.961 (R2), i.e. 3.5–6.5 % thinner;
  - R2 in mode A: 0.923 (7.7 % thinner).
  - That is ≈ 1,000–2,200 ft of mean elevation at 25 °C, or 11–25 K of
    sea-level temperature.
  - The absolute levels are poorly identified and vary between fits: rP
    0.92–1.04, rL 0.96–1.12. Only the ratio is robust (leave-one-out
    0.91–0.98).
- **What it removes in mode G.**
  - RMS: carry 3–7 %, height 0–2 %, land 1–8 %. F0: 7.58 / 2.19 / 4.21 →
    7.01 / 2.22 / 4.15. R0: 6.39 / 2.04 / 3.73 → 6.19 / 2.05 / 3.69. R2:
    5.39 / 2.04 / 2.73 → 5.02 / 1.99 / 2.52.
  - Tour-shaped residual: it removes most of the carry tour offset (offset
    share 12–17 % → 0–10 %), none of the land one (47–68 % → 49–68 %), and
    the matched-club PGA − LPGA land gap grows in every law (e.g. F0 −0.8° →
    −2.4°). The density is set by carry, and thinner air lands the PGA rows
    flatter, the wrong way for land.
- **Cross-validation.** R2 improves (5.88 / 2.12 / 2.81 → 5.50 / 2.07 / 2.59).
  F0 improves in carry only (8.12 → 7.86 yd). R0 gets worse (6.69 / 2.10 /
  3.78 → 6.81 / 2.14 / 3.82).
- **Mode A.** F0 and R0 are degenerate with the per-row kD, kL (≤ 0.002° and
  ≤ 0.07° change over ±15 %), so they were not fitted. R2 A\*: land 2.27° →
  2.10° (CV 2.39° → 2.29°), and the matched-club land gap halves (−2.03° →
  −0.98°), but only with the LPGA rows at 1.12× sea-level density
  (≈ −7.6 °C).
- **PGA Driver carry shortfall.** It does not close under today's law: −26.6 →
  −24.1 yd. Under the measured round-2 surfaces it is already gone (R0 −4.4
  → −3.4 yd, R2 +2.0 → +3.6 yd). It was a property of today's C_D(S), not of
  the air.
- **Physical plausibility.** A 3.5–6.5 % schedule density gap between the tours
  needs a mean difference of ~1,000–1,900 ft or 11–21 K, a sizeable gap that
  this probe has not checked against the schedules. Even if it is real, it
  explains only the carry offset, not the land residual. The schedule-side estimate (`conditions.md`) was still a
  skeleton when these fits finished, so the comparison is left to the
  coordinator.

## 2. Method and identifiability

**Model.** Each family keeps its round-1 / round-2 laws and bounded
parameters, shared by every row. Two environment parameters are added: an
effective air-density ratio for the PGA rows, rP, and one for the LPGA rows,
rL (1 = 25 °C sea level, bounds 0.6–1.3). A tour's rows fly at its density,
and in mode A they are also calibrated there. Re follows ρ at the 25 °C
viscosity, which is the elevation reading of a density change. A temperature
reading would also change μ, by ~0.3 %/K, and so Re a little more; that is not
modelled. The densities are diagnostic only and never enter a candidate model
(`harness/eval-cond.mjs`, `harness/run-cond.mjs`) **[D]**.

**"Before"** is the same family fitted without densities: round 1 for F0,
round 2 for R0 and R2 (`harness/out/<F>.json`), with the same weights (carry
/ 2 yd, height / 1 yd, land / 1.5°) and fitter.

**Tour-shaped residual.** Three numbers per output:

- the per-tour mean residuals;
- the **tour-offset share**: the fraction of the residual sum of squares
  carried by those per-tour means, i.e. what a free per-tour constant would
  remove;
- the **matched-club difference**: PGA − LPGA residual averaged over the 11
  clubs both tours list.

**Identifiability** **[D]**:

- **F0, mode G.** Forces scale as ρ·C, and today's law has free drag and lift
  levels, so a common density factor is absorbed by gD, gL. Only spin decay
  (λ ∝ ρ) breaks the tie: fitted with both densities free, gD runs to its
  bound and (rP, rL) to (0.69, 0.74). Only the ratio rP/rL is meaningful, so
  F0 is fitted with the LPGA anchored at 1 (`--fixL`).
- **R0, R2, mode G.** Re and the bounded ball-spread scales pin the absolute
  level loosely. R0's leave-one-out rP spans 0.96–1.16, while rP/rL stays
  within 0.953–0.977. The ratio is again the robust quantity. R2's level is
  pinned only because sL and the band sit on their measured bounds.
- **Mode A, F0: degenerate, not fitted.** Per-row kD, kL absorb any density.
  Over ±15 % in either tour the land RMS moves by ≤ 0.002°, which is spin
  decay alone.
- **Mode A, R0: nearly degenerate, not fitted.** Re enters only through the
  small k_Re slope. Over ±15 % the land RMS moves by ≤ 0.07° (3.96° → 3.90° at
  both tours 0.85).
- **Mode A, R2: fitted.** The band ties the flight to Re, so per-row kD and
  kL cannot absorb density. But a common density factor trades against the
  band's fitted location (ReHi, ReLo), so here too the ratio is the robust
  quantity.

## 3. Mode G results

`run-cond.mjs F0 --fixL`, `R0`, `R2` (8 restarts, LOO refits from the
optimum); logs `harness/out/<F>-cond[-fixL].txt` **[D]**.

| Law | Fitted rP / rL (ratio) | RMS carry / height / land before → after | Removed | LOO-CV before → after |
|---|---|---|---|---|
| F0 (LPGA anchored) | 0.9345 / 1 (0.935) | 7.58 / 2.19 / 4.21 → 7.01 / 2.22 / 4.15 | carry 7 %, height −1 %, land 1 % | 8.12 / 2.24 / 4.25 → 7.86 / 2.27 / 4.23 |
| R0 | 1.011 / 1.050 (0.963) | 6.39 / 2.04 / 3.73 → 6.19 / 2.05 / 3.69 | 3 %, 0 %, 1 % | 6.69 / 2.10 / 3.78 → **6.81 / 2.14 / 3.82** (worse) |
| R2 | 0.922 / 0.960 (0.961) | 5.39 / 2.04 / 2.73 → 5.02 / 1.99 / 2.52 | 7 %, 2 %, 8 % | 5.88 / 2.12 / 2.81 → 5.50 / 2.07 / 2.59 |

Anchored variants agree on the ratio: R0 0.965, R2 0.946 with LPGA at 1.

**Tour-shaped residual** (share of each output's residual sum of squares
carried by the per-tour means, before → after; matched-club PGA − LPGA
mean, before → after):

| Law | carry offset share | height | land | matched-club land (°) | matched-club carry (yd) |
|---|---|---|---|---|---|
| F0 | 12 % → 0 % | 45 % → 44 % | 64 % → 63 % | −0.80 → **−2.35** | −5.47 → −0.39 |
| R0 | 17 % → 10 % | 7 % → 6 % | 68 % → 68 % | −1.02 → **−1.90** | −4.82 → −1.86 |
| R2 | 15 % → 5 % | 4 % → 2 % | 47 % → 53 % | −0.33 → **−1.19** | −3.76 → −0.89 |

**PGA Driver carry** (model − table): F0 −26.6 → −24.1 yd, R0 −4.4 → −3.4 yd,
R2 +2.0 → +3.6 yd. The per-tour density does not close F0's shortfall. R0's
was already small, and under R2 there is no shortfall to close: the measured
drag of round 2 had removed it.

Readings:

- **Every law puts the PGA rows in thinner air than the LPGA rows**, by 3.5–6.5 %
  (ratio 0.935–0.965). That is consistent across laws and stable under
  leave-one-out (ratio 0.91–0.98).
- **The density difference is driven by carry, not land.** It removes the
  carry tour offset almost entirely (PGA rows were short relative to LPGA
  rows). It does nothing for land: the land tour-offset share stays at 47–68 %,
  and the matched-club land gap *grows* in every law (F0 −0.8° → −2.4°). Thinner
  air lands the PGA rows flatter still, when the table wants them steeper.
- **What a free per-tour land offset could do, for scale:** it would cut land
  RMS to 2.53° (F0), 2.11° (R0) and 1.99° (R2). The density reaches 4.15°,
  3.69° and 2.52°. The tour-shaped land residual is not an air-density
  effect.
- **Cross-validation:** R2 improves (land 2.81° → 2.59°), F0 a little in carry,
  and R0 gets worse. The two density parameters are only weakly supported.

## 4. Mode A

- **F0 and R0: degenerate, not fitted (§2).** Per-row kD, kL absorb any
  density. Over ±15 % the land RMS moves by ≤ 0.002° (F0) and ≤ 0.07° (R0).
- **R2 A\*: fitted** with the band parameters and both densities free, from
  the round-2 A\* shape **[D]**:

| | before | with per-tour density |
|---|---|---|
| rP / rL (ratio) | 1 / 1 | 1.036 / 1.123 (0.923) |
| land RMS (LOO-CV) | 2.27° (2.39°) | 2.10° (2.29°), 8 % removed |
| land tour-offset share | 37 % | 28 % |
| PGA / LPGA mean land | −1.90° / +0.09° | −1.42° / −0.56° |
| matched-club land PGA − LPGA | −2.03° | −0.98° |
| PGA Hybrid / LPGA 3-wood | −3.9° / +4.5° | −3.1° / +3.1° |

With carry and height calibrated out per row, density can act on land alone.
It then halves the matched-club land gap, but only by putting the LPGA rows
in air 12 % denser than 25 °C sea level (−3,236 ft, or −7.6 °C) and the PGA
rows 3.6 % denser. The absolute level here trades against the band location,
so only the ratio (0.923, PGA 7.7 % thinner) is robust. The direction agrees
with mode G.

## 5. Fitted densities as conditions

Ratio to 25 °C sea level, and the elevation at 25 °C or the sea-level
temperature giving the same density (`equivalents()`; dry air; humidity
would lower density a little further) **[D]**:

| Fit | PGA rP | LPGA rL | PGA thinner than LPGA by |
|---|---|---|---|
| F0 G (anchored) | — | — | 6.5 % ≈ 1,860 ft at 25 °C, or +21 K at sea level |
| R0 G | 1.011 (−310 ft / 21.6 °C) | 1.050 (−1,360 ft / 10.7 °C) | 3.7 % ≈ 1,040 ft, or +11.5 K |
| R2 G | 0.922 (2,240 ft / 50.3 °C) | 0.960 (1,140 ft / 37.6 °C) | 3.9 % ≈ 1,110 ft, or +12.2 K |
| R2 A\* | 1.036 (−990 ft / 14.6 °C) | 1.123 (−3,240 ft / −7.6 °C) | 7.7 % ≈ 2,200 ft, or +24.9 K |

The absolute levels move from 0.92 to 1.12 between fits because they are
poorly identified (§2). They should not be read as venue conditions. The
robust output is the ratio: the table's PGA rows behave as if flown in air
3.5–7.7 % thinner than the LPGA rows (3.5–6.5 % in mode G). As a schedule
difference that is 1,000–2,200 ft of mean elevation, or 11–25 K of mean
temperature, or a mix. Each
1 % of density is about 280 ft or 3 K. Whether two tours' schedules differ
that much is the schedule side's question (`conditions.md`, in progress when
these fits finished; the comparison is left to the coordinator).

## 6. Reading

1. **Air density does not explain the tour-shaped land residual.** In mode G
   the fitted density difference is set by carry, and it makes the
   matched-club land gap larger in every law. In mode A, where only land is
   left, density can halve that gap, but only with a 7.7 % PGA/LPGA
   difference and an absolute LPGA density no venue has.
2. **It does explain part of the carry pattern.** The PGA rows carry short
   relative to the LPGA rows under one physics, and 3.7–6.5 % thinner PGA air
   removes that tour offset. That fits a schedule-weighted density gap if the
   schedule side finds one of roughly 1,000–1,900 ft or 11–21 K.
3. **Gains are small and only partly survive cross-validation.** At best (R2
   in mode G) the density removes 7 % of carry RMS, 2 % of height and 8 % of
   land, with CV land 2.81° → 2.59°. For R0, CV gets worse.
4. **The PGA Driver shortfall does not close under today's law** (−26.6 →
   −24.1 yd). It is already gone under the measured round-2 drag (R2 +2.0 yd).
   The round-1 shortfall was a property of today's C_D(S), not of the air.
