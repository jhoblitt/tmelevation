# Probe 1 — aero-data: measured golf-ball aerodynamic data

Status: COMPLETE 2026-10-09. Verified facts live in `aero-data.md.notes.md`;
digitized and tabulated numbers in `aero-data.csv` (source, ball, Re, S, CD,
CL, method, uncertainty). The throwaway extraction and fit scripts are under
`$TMPDIR/aero-data/scripts/`, not in the repo.

Labels: **[P]** primary (read in the source itself), **[S]** secondary (reported
by someone else about a source), **[D]** derived (computed here from [P]/[S]).

## 1 Summary and recommended coefficient laws

**Headline.** Measured data **support a speed-dependent lift loss late in
flight** (§3).
- **Where:** for modern tour balls it sets in below Re ≈ 7.5e4, i.e. below
  ≈ 27.5 m/s in 25 °C sea-level air.
- **How large:** C_L reaches ~0.35–0.85× its supercritical S-value at Re 7e4,
  and roughly zero or negative (reverse Magnus) at Re 6–6.5e4 for
  S ≈ 0.08–0.23.
- **Who measured it:** a university lab (Lyu, Kensrud & Smith 2020: three
  tour balls) and a manufacturer (Bridgestone patents: C_L(70k)/C_L(80k) at
  2000 rpm = 0.65–0.85 against ≈ 1.06–1.10 for an S-only law). The USGA's own ITR
  patent warns that its regression cannot represent this "negative lift".
- **Ball dependence:** where the loss sits follows the ball's drag crisis.
  It was near Re 4e4 for the 1976 Bearman & Harvey ball, and at Re 6–7.5e4
  for current WSU-tested balls.
- **Why it matters here:** in a tour flight the band is reached only at the
  very end of a driver flight, but covers the whole descent of hybrids, irons
  and wedges. That is the "lift strong mid-flight, falling away late" shape
  the brief identified.

**Also new [D]:** the commonly used Smits & Smith lift law,
`C_L = 0.54·S^0.4`, runs on average **+0.058 (≈ 30–50% at S ≤ 0.15)** above the modern
supercritical measurement collected here. The measured-to-S&S ratio is
≈ 0.7–0.77 at driver S (0.09–0.15), consistent with the kL ≈ 0.8 that the
2026-10-08 driver calibration needed (kL and kd were fitted jointly, so this
is consistency, not proof). The measured supercritical lift is closer to linear in S
(`0.065 + 0.85·S`), so on its own it grows even faster late in flight. The
Re-dependent loss is the measured term that bends late-flight lift down.

### Recommended laws (Re = V·D/ν with D = 42.67 mm; S = ω·r/V)

All are **[D]**, fitted or assembled here from the CSV data. Confidence is
stated for each.

**Lift.**

```
C_L(Re, S) = C_L0(S) · f_L(Re, S)

C_L0(S) = 0.065 + 0.85·S                      0.04 ≤ S ≤ 0.30
        = min(0.45, 0.32 + 0.25·(S − 0.30))   0.30 < S ≤ 1.0
```

- C_L0 for S ≤ 0.30 is fitted to n = 81 modern-ball points at Re ≥ 7.5e4
  (USGA ITR, Bridgestone, Lyu 2018/2020), rms 0.024. Ball-to-ball spread is
  ±0.02–0.03. **Medium-high confidence.**
- The S > 0.30 branch follows the shape of Bearman & Harvey's 1976 data
  (their values: 0.35 at S 0.46, 0.40 at 0.64, 0.45 at 1.0). **Low
  confidence**: one old ball, which reads about 0.04 below modern balls at
  S ≈ 0.3.
- f_L = 1 for Re ≥ Re_hi. Below Re_hi lift is lost; the measured envelope is
  the §3 table. As a starting form for the model-fits probe:
  `f_L = 1 − a·w(Re)`, where w is a smooth step from 0 at Re_hi to 1 at
  Re_lo.
  - Re_hi ≈ 7.5e4 (bounds 7.0–8.0e4); Re_lo ≈ 6.2e4 (bounds 5.5–6.5e4).
  - a ≈ 0.8–1.0, with measured bounds 0.4–1.3 (a > 1 means negative lift).
  - Below Re_lo the data show partial recovery: f ≈ 0.2–0.7 at Re 5e4.
  - The Bridgestone ratio pins f(7e4)/f(8e4) ≈ 0.59–0.77 at S ≈ 0.17.
  - The loss appears to fade at S ≳ 0.4–0.6 (B&H only), so `a` may need to
    shrink with S. That is untested for modern balls.
  - **Medium confidence on the existence and location of the loss; low on its
    exact shape.**

**Drag.**

```
C_D(Re, S) = C_D0(S) + k_Re·(Re − 1.5e5) + ΔC_D,crisis(Re, S)

C_D0(S) = 0.220 − 0.27·S + 3.0·S²     0 ≤ S ≤ 0.22    (rms 0.020; modern balls, Re ≥ 7.5e4)
        = 0.30 + 0.38·(S − 0.22)      0.22 < S ≤ 0.46 (B&H shape at Re ≥ 8e4; ±0.02)
```

- k_Re ≈ +0.01 to +0.017 per 1e5 above Re 1e5 (USGA example ball +0.0165;
  B&H +0.011). Lyu 2020 balls instead show a shallow minimum near 1.3–1.5e5.
- ΔC_D,crisis is **ball-specific**, from 0 to +0.25 at Re 5e4:
  - Lyu 2020 / 2018 balls at S ≈ 0.2–0.27: C_D 0.46–0.53 at Re 5e4 and
    0.32–0.41 at 6.3e4.
  - Bridgestone balls: C_D 0.23 at Re 7e4 / S 0.18, i.e. no rise.
  - Moderate spin lowers crisis drag (B&H: 0.354 → 0.288 at Re 5.9e4 from
    S 0 to 0.11).
  - At low Re and high S (≥ 0.5) B&H measured 0.44–0.54.
  - **Low confidence on the magnitude.** The 2026-10-08 finding that a large
    crisis rise at all S wrecks LPGA short irons is consistent with the
    data's message that the rise is ball-specific and spin-softened.

**Spin decay.**

```
I·dω/dt = −ρ·A·R·C_M·v²,   C_M = β·S,   β = 0.010 (Smits & Smith) to 0.012 (Tavares)
```

- Equivalent to dω/dt = −λ·v·ω/R with λ = 2.0–2.5e-5 at ρ ≈ 1.18; λ ∝ ρ.
- Valid for Re (1.0–2.5)e5 (Smits); elsewhere it is extrapolation.
- One TrackMan-radar measurement of a Pro V1x driver averages ≈ 75 rpm/s,
  at or slightly below this law. **Medium confidence**, and the brief has
  already shown it is a weak lever.

**Validity summary.**

| Range | Status |
|---|---|
| Re 7.5e4–2.0e5, S 0.04–0.30 | well covered (4 independent sources) |
| Re 5e4–7.5e4, S 0.05–0.36 | one lab plus one manufacturer, ball-dependent |
| S > 0.36 at any Re | only the 1976 B&H ball |
| Re < 4.5e4 | none for modern balls |
| Re > 2.0e5 | sparse: B&H to 2.4e5; Lyu 2018 non-spinning to 2.5e5; Smits & Smith (unread) note a compressibility-related C_D drop |

## 2 Source-by-source table

P = I read the source itself; S = known only through another document.
"CSV" = digitized or tabulated rows are in `aero-data.csv` under that source
tag.

| # | Source | Measured | Ball(s) | Re range | S range | P/S | Accessible? / CSV |
|---|---|---|---|---|---|---|---|
| 1 | Lyu, Kensrud & Smith 2020, *Sports Eng.* 23:3, doi:10.1007/s12283-020-0318-1 | C_D, C_L by light gates in still air; reverse Magnus | Pro V1, ChromeSoft, B330-RX | 4.9e4–2.0e5 | 0.05–0.36 | P | open (CC BY); CSV Fig 3/4/5/7a, vector-extracted |
| 2 | Lyu, Kensrud, Smith & Tosaya 2018, *Proceedings* 2:238 | C_D (non-spinning, 13 balls; spinning KK); C_L(S) (13 balls, ≥ 32 m/s only) | 13 production balls | 5e4–2.5e5 | 0–0.33 | P | open; CSV Fig 3a/3b/4a (raster, ±0.01) |
| 3 | USGA ITR patent US 6,186,002 B1 (1998/2001) | ITR method; 42-shot example table (Re, SR, C_D, C_L); regression families; "negative lift" statement | "TEST_BALL" (unidentified, c. 1998) | 8.1e4–2.0e5 | 0.042–0.22 | P | open; CSV (exact) |
| 4 | Bridgestone US 7,175,542; 7,238,121; 7,201,671; 8,021,249 | UBL launched-ball C_L, C_D at Re 7e4 & 8e4 / 2000 rpm and Re 1.8e5 / 2520 rpm; low-speed C_L ratio | patent example and comparative balls (312–432 dimples) | 7e4, 8e4, 1.8e5 | ≈0.09, 0.15, 0.18 | P | open; CSV (absolute values from US 7,238,121) |
| 5 | Bearman & Harvey 1976, *Aeronaut. Q.* 27:112 | wind tunnel, 2.5× model; C_L, C_D vs rpm at 10 speeds | 1970s conventional (also hex) | ≈3.8e4–2.4e5 | 0–1.0 | S | original paywalled; figures reproduced in #6 and #8 and digitized; CSV |
| 6 | Kensrud 2010, WSU MS thesis | golf drag crisis without spin (onset Re 7e4, min C_D 0.17); B&H figures reproduced | one golf ball | not checked (plot axis 1e4–1e6) | 0 | P | open (WSU repository) |
| 7 | Aoki, Muto & Okanaga 2010, *Procedia Eng.* 2:2431 | wind tunnel with rotation, LES, flight simulation | 328 circular-arc dimples | — | — | S | **403 to every fetch**; only non-spinning C_D vs Re via #8 (CSV) |
| 8 | Crabill, Witherden & Jameson 2019 (arXiv 1806.00378) | CFD; replots of B&H, Aoki and Choi data | — | 4e4–2.8e5 | 0–0.31 | P (CFD) / S (replots) | open; CSV Fig 6a/6b |
| 9 | Smits & Smith 1994, *Science and Golf II* | wind tunnel C_D, C_L, spin decay; model | 1990s balls | 4e4–2.5e5 | 0.04–1.4 | S | paywalled; known via Mehta/Nathan text (2026-10-08 notes) |
| 10 | Tavares, Shannon & Melvin 1999, *Science and Golf III* | radar spin decay; C_M = 0.012·S | — | — | — | S | paywalled; via Nathan |
| 11 | Acushnet US 7,591,742 B2 (+ US 8,926,452, US 9,199,129) | TrackMan-radar spin vs time, driver | Pro V1x; Tour Balata; Professional | flight | — | P | open |
| 12 | Acushnet US 6,286,364 B1 | indoor % spin change between camera stations | solid vs wound | 150–200 ft/s | — | P | open; no time base |
| 13 | Sumitomo EP 4 218 964 A1 (2023) | **model**: USGA program + ITR coefficients → max flight-path angle | 19 balls (14 commercial) | — | — | P | open |
| 14 | Li, Tsubokura & Tsunoda 2017 (LES), *Flow Turb. Combust.* | **CFD** rotating golf ball, Γ 0.1 | 392 dimples | 4.3e4–1.1e5 | 0.1 | P (CFD) | open; in 2026-10-08 notes |
| 15 | Kim & Choi 2014, *Proc. IMechE P* 228:233 | wind tunnel; grooved vs dimpled ball | grooved + dimpled | 0.5e5–2.7e5 | 0–0.5 | S (abstract) | paywalled; not read |
| 16 | Moriyama & Okanaga 2023, *Trans. JSME* 89(924) | rotating wind tunnel, 15 model balls | 3-D-printed models | ? | ? | S (abstract) | not read |
| 17 | Naruo & Mizota 2008, *Impact of Technology on Sport II* | wind-tunnel forces **and torque**; log-law wind; measured landing points | — | — | — | S (abstract) | not read |
| 18 | Alam et al. 2011, *Procedia Eng.* 13:226 | non-spinning golf drag | several balls | — | 0 | — | Elsevier 403; not read |
| 19 | Quintavalla 2002, *Science and Golf IV* ch. 30 | USGA model of C_L, C_D(Re, SR) | — | — | — | S | paywalled |
| 20 | Arccos 2026 Driving Distance Report | on-course total driver distance vs elevation (GPS) | amateurs | — | — | P | open (PDF) |

## 3 Low-Re lift behaviour

**Answer: yes, measured data show a speed-dependent lift loss, and it sits
where the late part of an iron or hybrid flight is.** In the supercritical
band (Re ≥ 7.5e4) lift depends on S alone, to within the ball-to-ball
scatter. Below Re ≈ 7.5e4 it falls well under that S-law: sometimes to zero,
sometimes negative ("reverse Magnus"), and only partly recovers by Re ≈ 5e4.
The onset is sharp: the losses (from "≈ 0.8× at 7e4" to "≈ 0× at 6e4")
happen over 10–20% in speed.

Evidence, strongest first:

1. **Lyu, Kensrud & Smith 2020, Sports Eng. 23:3** — **[P]**, CC BY, read in
   full. Three tour-type balls (Pro V1, ChromeSoft, B330-RX) were projected
   through still air and measured by light gates. Fig 3, at 2250 ± 250 rpm,
   gives C_L ≈ 0.14–0.22 at Re 7.5e4, then −0.02 to −0.09 at Re 6.2–6.3e4, then
   +0.08 to +0.14 at Re 5e4. Fig 4 (Pro V1, C_L vs S at four Re) shows:
   - Re 75k: C_L rises roughly linearly, from 0.07 (S 0.06) to 0.31–0.34 (S 0.26–0.34).
   - Re 70k: C_L is suppressed at low S (0.00–0.07 for S 0.05–0.12), then rises steeply to 0.30 at S 0.33–0.35.
   - Re 60k: C_L goes negative for S ≈ 0.10–0.22 (minimum about −0.09) and recovers to +0.09 at S 0.28.
   - Re 50k: C_L is 0.07–0.15 at S < 0.16, dips to about 0 at S ≈ 0.24–0.27, and is 0.11–0.15 at S 0.36.

   Fig 5, at Re 6.5e4, gives negative lift over 0.07 < S < 0.21 for all three
   balls, with a minimum of −0.10 for the circular-dimple ball and −0.15 for
   the hexagonal one. The authors read this as reverse Magnus inside the drag
   crisis. They call it rare in long drives but possible "near the green".
   Their own Fig 4 also shows C_L at Re 70k running well below the Re 75k
   values at the same S. I extracted all four figures from the PDF's vector
   paths, so the digitization error is below 0.002; rows are in
   `aero-data.csv`. Measurement SD is 0.01 in C_L and 0.02 in C_D.
2. **Bridgestone Sports patents** (US 7,175,542 B2; US 7,238,121 B2;
   US 7,201,671 B2; US 8,021,249 B2) — **[P]** for the statements and
   tabulated measurements. C_L and C_D were measured on a ball launched by an
   Ultra Ball Launcher at Re 7.0e4 / 2000 rpm and at Re 8.0e4 / 2000 rpm
   (≈ 25–26 and 30 m/s). Measured C_L(70k)/C_L(80k) was **65–85%** across 12
   dimple designs (median ≈ 82%). A pure S-law predicts ≈ 106%, because S
   rises from 0.149 to 0.172 **[D]**. Absolute values at Re 70k / S ≈ 0.18
   were C_L 0.154–0.191 and C_D 0.228–0.233. At Re 180k / S ≈ 0.088 the same
   balls gave C_L 0.163–0.173. The patents state the mechanism outright: "in
   the low-velocity region after the highest point, the ball will drop due to
   insufficient lift and thus tend to lose carry". The patents name only
   example and comparative balls, not commercial models.
3. **USGA Indoor Test Range patent US 6,186,002 B1** — **[P]**. The text says
   "Some balls exhibit a phenomenon at low speeds and spin rates called
   'negative lift' … the drag coefficient greatly increases and the lift
   coefficient decreases close to zero or even goes negative. The above
   equations are not adequate to model that behavior." In other words, the
   USGA's own regression (C_L = A + B·SR + C·Re⁻² + D·SR², Re in units of 1e5)
   is known not to cover that regime. Its 42-row example ball has a fitted
   C = −0.0122. That costs −0.019 at Re 8.1e4 and would cost −0.05 at 5e4 if
   extrapolated. The ITR's slowest test speed is 100 ft/s (Re ≈ 8.1e4), so the
   USGA protocol does not sample the band where the loss happens.
4. **Lyu et al. 2018, Proceedings 2:238** — **[P]**. The authors left out
   speeds below 32 m/s from their lift fit specifically "to avoid the
   influence of the reverse Magnus effect at low speed". So the published
   13-ball C_L(S) is valid only for Re ≳ 9e4.
5. **Bearman & Harvey 1976 (wind tunnel, 2.5× scaled 1970s conventional
   ball)** — **[S→digitized]**. Their original C_L and C_D vs rpm figures
   are reproduced in the Kensrud 2010 WSU thesis (Figs 2.13–2.14), for 10
   speeds between 14 and 89 m/s full-scale; I digitized them at 400 dpi.
   - At **U = 14 m/s (Re ≈ 3.8e4)** C_L is **−0.12 at S 0.17**, then 0.21
     (S 0.30), 0.28 (0.45), 0.39 (0.60) and 0.45 (1.0).
   - At U = 21.9 m/s (Re ≈ 5.9e4) and above, C_L rises smoothly with S, with
     no loss.

   So for that deeper-dimpled ball the reverse-Magnus band sits near
   Re 4e4, where the modern WSU balls have it at 6–7e4. **The Re of the lift
   collapse is set by the ball's drag crisis and differs by model and era.**
   These are also the only measured C_L values found at **wedge-like S
   (0.45–1.0) and low Re**: 0.28–0.45 at Re 3.8e4, 0.36–0.40 at Re 5.9e4.
   Lift recovers at high S even below the crisis.
6. **Li, Tsubokura & Tsunoda 2017 (LES)** — this is CFD, not a measurement,
   carried over from the 2026-10-08 notes. At S = 0.1 it gives C_l +0.150
   (Re 4.3e4), −0.137 (7.5e4) and +0.135 (1.1e5). The same sign reversal
   appears at a slightly higher Re for that dimple geometry, which agrees with
   Lyu 2020's statement that the crisis location is specific to the ball.

**Size of the effect against a supercritical S-law [D].** I fitted C_L(S) to
every measured point at Re ≥ 7.5e4 (n = 81, S 0.04–0.34) and got
`C_L ≈ 0.065 + 0.85·S`, rms 0.024. The table below gives measured C_L divided
by that law at the same S:

| Re | S < 0.12 | 0.12–0.20 | 0.20–0.28 | 0.28–0.36 |
|---|---|---|---|---|
| ~7.0e4 | 0.34 | 0.63 | 0.76 | 0.85 |
| ~6.5e4 | −0.20 | −0.13 | 0.32 | 0.63 |
| ~6.0e4 | 0.26 | −0.31 | −0.06 | 0.30 |
| ~5.0e4 | 0.72 | 0.56 | 0.19 | 0.30 |

(The Re 7.0e4 / S 0.12–0.20 cell mixes Lyu 2020 with the four Bridgestone
balls, whose ratio is 0.71–0.88.)

**Where this falls in a tour flight [D].** In 25 °C sea-level air
(ν = 1.5625e-5 m²/s), Re 7.5e4 ↔ 27.5 m/s, 6.0e4 ↔ 22.0 m/s and
5.0e4 ↔ 18.3 m/s. The 2026-10-08 probe found minimum in-flight Re of 73k
(PGA driver), 55k (7-iron) and 46k (PW). So the driver only reaches the edge
of the band at the very end. Irons, hybrids and wedges spend their whole
descent in it, which is exactly the "lift strong mid-flight, falling away
late" shape the brief asks for. Late-flight S for irons and wedges
(0.3–0.76, and up to 1.2 for PW) is beyond the modern-ball low-Re data, which
stops at S ≈ 0.36. Only the 1976 B&H ball has been measured there, and its
lift recovers at S ≳ 0.4. At altitude ν rises as 1/ρ: at 7,800 ft and the same
temperature, Re 7.5e4 is reached at ≈ 36.7 m/s, so more of each flight lies
in the loss band. A Re-dependent lift law therefore changes the altitude
deltas, and how it does so has to be tested, not assumed.

**Caveats.**
- Every low-Re lift point comes from one laboratory (WSU, three balls, spin
  near 2250 rpm) plus one manufacturer's launcher (Bridgestone, 2000 rpm
  only).
- The negative-lift trough is narrow and differs from ball to ball. It
  depends on the slope of the drag crisis (Lyu 2020 Fig 7–8, r² = 0.87).
- For modern balls nothing measured covers Re < 7e4 at S > 0.36. B&H 1976
  covers it for a different, older ball, and there lift recovers by S ≈ 0.4–0.6.
  If modern balls behave the same, the lift loss hits mid-S (≈ 0.1–0.3) hardest,
  i.e. hybrids, long irons and drivers late in flight, more than wedges,
  whose S keeps rising as they slow. That is consistent with the brief's
  pattern: largest land-angle gaps for PGA hybrid and long irons, smallest for
  LPGA short irons. **[D] — inference, not tested.**
- The decline is Re-driven (laminar-to-turbulent transition), so in a 3-D
  model it should sit in C_L(Re, S), not in a time- or height-based fudge.

## 4 Drag crisis and spin

**Measured drag crisis of modern balls.** Values are digitized; all rows are
in `aero-data.csv`.

| Re | 13-ball mean, no spin (Lyu 2018 Fig 3a) | KK ball, 1500–2500 rpm (Lyu 2018 Fig 3b) | 3 balls, 2250 rpm (Lyu 2020 Fig 3) | USGA ITR ex. ball, S≈0.09 |
|---|---|---|---|---|
| 5.0e4 | 0.48 (range 0.39–0.53) | 0.53 | 0.46–0.49 | — |
| 6.3e4 | — | 0.41 | 0.32–0.38 | — |
| 7.5e4 | 0.30 (0.23–0.35) | 0.26 | 0.25–0.27 | — |
| 8.1e4 | — | — | — | 0.223 |
| 1.0e5 | 0.215 | 0.20 | 0.21–0.24 | — |
| 1.25e5 | 0.205 | 0.18 | 0.18–0.21 | 0.226 |
| 1.5e5 | 0.196 | 0.187 | 0.16–0.19 | — |
| 1.6e5 | — | — | — | 0.234 |
| 1.75e5 | 0.199 | 0.196 | 0.19–0.21 | — |
| 2.0e5 | 0.199 | — | 0.20 | 0.241 |
| 2.5e5 | 0.21 | — | — | — |

Findings:

- **The crisis lies at Re ≈ 5e4–1e5 and spin does not remove it [P].** Lyu
  2018 says spinning balls show "a drag crisis similar to non-rotating balls".
  In Lyu 2020 C_D falls from 0.5 to 0.2 between Re 5e4 and 7.5e4, and Fig 7a
  resolves the fall at 0.42–0.44 (Re 5.2–5.6e4) → 0.25–0.27 (Re 7.0–7.5e4) for
  all three balls. Ball-to-ball spread exceeds 0.1 below Re 7.5e4 and is under
  0.05 above 1e5 (Lyu 2018).
- **Where the crisis falls depends on the ball [P].** The Bridgestone UBL
  balls measure C_D 0.228–0.233 at Re 7.0e4 / S 0.18, i.e. already
  supercritical, where the WSU balls read 0.25–0.31. In the 2026-10-08 notes
  ([S] via Crabill 2019 and Li 2016), Choi 2006 puts the critical Re near 8e4
  and Bearman & Harvey near 5e4, which tracks dimple depth.
- **Supercritical C_D rises slowly with Re and strongly with S [P/D].** The
  USGA example ball at S ≈ 0.09 goes from 0.223 (8.1e4) to 0.241 (2.0e5).
  The WSU balls reach a shallow minimum of 0.16–0.19 near Re 1.25–1.5e5 and
  climb back to about 0.20 by 2e5. Spin enters roughly quadratically:
  - At Re 8.1e4 the USGA ball has C_D 0.223 at S 0.097 and 0.305 at S 0.218.
  - At 1.23e5 it has 0.226 at S 0.088 and 0.256 at S 0.153.
  - The USGA fit (model 3, Re in 1e5) is
    `C_D = 0.2028 + 2.8466·S² + 0.0165·Re − 0.2159·S`.
  - My pooled fit over every Re ≥ 7.5e4 point [D] is
    `C_D ≈ 0.220 − 0.27·S + 3.0·S²` (S ≤ 0.22, rms 0.020). The minimum is
    near S 0.045 and C_D reaches about 0.30 by S 0.22.
- **Spin's effect on the crisis itself, as a mechanism [P, Lyu 2020 §5].**
  With backspin the top of the ball meets local speed V − rω and the bottom
  V + rω. Inside the crisis the top can therefore stay laminar while the bottom
  is turbulent, which flips the Magnus direction. The size of the lift deficit
  correlates with the local slope ∂C_D/∂Re (r² = 0.87). The Kensrud 2010 WSU
  thesis is reported to find that "orientation and rotation of the ball
  reduced the drag crisis" for golf balls. That claim is [S], from the
  repository abstract via search; I did not read the thesis.
- **Spin first lowers, then raises, low-Re drag [S→digitized, B&H 1976 via
  Kensrud Fig 2.14].**
  - At Re ≈ 5.9e4 C_D goes 0.354 (S 0) → 0.288 (S 0.11): spin trips
    transition. It then climbs back through 0.298 (S 0.19), 0.347 (0.29) and
    0.363 (0.38) to 0.439–0.455 (S 0.48–0.64).
  - At Re ≈ 3.8e4 C_D goes 0.50 (S 0) → 0.37 (S 0.30), then rises to 0.52–0.54
    at S 0.75–1.0.
  - At Re ≥ 8e4 C_D is 0.25–0.27 at S 0 and 0.30–0.39 at S 0.2–0.46.

  So at low Re and high S (wedge late flight) the one measured ball has
  C_D ≈ 0.4–0.55, well above any supercritical law.
- **Above Re 2e5:** Smits & Smith report a second fall in C_D for
  Re > 2e5, which they attribute to compressibility (local Mach up to 0.5).
  This is [S], via Mehta's text in the 2026-10-08 notes.

**Implication [D].** Applied at all S, the previous probe's Lyu 2018 Fig 3b
drag rise "overshoots LPGA short irons +4.0–4.7° and wrecks iron altitude
deltas". The data above suggest why. That curve is one ball (KK) whose crisis
lies at the high end. The Bridgestone balls are already supercritical at
Re 7e4 with spin, so a drag rise this large is not universal. The lift
collapse in the same Re band (§3) is the more consistent signal across the
WSU balls and the Bridgestone ratios.

## 5 Spin decay

| Source | What was measured | Law / numbers | Status |
|---|---|---|---|
| Smits & Smith 1994 (wind tunnel, spindle) | spin-down of a golf ball, Re (1.0–2.5)e5 | SRD = ω̇R²/v² = −λS, λ = 2.0e-5, i.e. dω/dt = −λ·v·ω/R; independent of Re at fixed S | [S] via Nathan's spindown note and Mehta's text (paywalled chapter not read) |
| Tavares, Shannon & Melvin 1999 (radar gun) | time-resolved spin in flight | torque form I·ω̇ = −RρA·C_M·v², C_M ≈ 0.012·S ⇒ λ = 2.5e-5 | [S] via Nathan |
| Acushnet US 7,591,742 B2 (TrackMan radar, skilled golfer, driver) | spin vs time through the whole flight | regression slope over the whole flight: **Pro V1x −75 (rpm/s presumably)**; first 0.4 s −65. Wound balls −87 to −131 for the whole flight and −187 to −340 early | [P] patent text; initial spins only in figures |
| Acushnet US 6,286,364 B1 (indoor camera stations) | % spin change between stations | solid ball 1.8% (200 ft/s, 4000 rpm) and 1.4% (150 ft/s, 6000 rpm); wound balls 0.7–4.3% | [P]; no time base given, so not convertible |
| USGA ITR patent US 6,186,002 B1 | (trajectory program) | uses SRD = −0.00002, i.e. Smits & Smith | [P] (model choice, not data) |
| TrackMan Newsletter #7 via Lyu 2018 | — | "4% per second" | [S], vendor statement; link dead |
| Penner 2001 (citing Smits & Smith) | — | landing spin ≈ 75% of initial for a driver shot | [P] Penner, [S] for the data |

Reading the table **[D]**:

- With λ = 2e-5 the fractional rate is −0.094 %/s per m/s of ball speed.
  That gives 6.6 %/s at 70 m/s, 3.7 %/s at 40 m/s and 2.3 %/s at 25 m/s,
  about 4 %/s averaged over a driver flight. That squares with TrackMan's
  "4%/s".
- The one modern solid ball with radar data (Pro V1x) loses about 75 rpm/s
  averaged over the flight. For 2,500–3,000 rpm that is ≈ 2.5–3 %/s, at or
  slightly below Smits & Smith.
- The torque form makes λ ∝ ρ. That is a physical reason for spin to decay
  more slowly at altitude.
- Spin decay is a weak lever, which the brief already shows with its ×1–×16
  sweep. The measured rates sit inside the range swept. Nothing measured
  suggests decay 2–10× faster than Smits & Smith for modern solid balls; if
  anything it is slower.

**Recommended law [D]:**

```
I·dω/dt = −ρ·A·R·C_M·v²,   C_M = β·S,   β ≈ 0.010 (Smits & Smith; 0.012 Tavares)
```

This is equivalent to dω/dt = −λ(ρ)·v·ω/R with λ = 2e-5 at ρ ≈ 1.18 kg/m³.
It is valid for Re (1.0–2.5)e5 per Smits. Its use below Re 1e5 and above
S 0.3 is extrapolation.

## 6 Independent trajectories

**Bottom line: I found no public dataset that measures descent angle, apex
and carry together and is independent of a vendor's flight model.** Six
targeted searches covered academic radar and stereo-camera tracking, theses,
launch-monitor validation against surveyed landing points, and ShotLink
landing angle. What does exist:

| Item | What it is | Measurement or model? |
|---|---|---|
| TrackMan tour tables (the ground truth here) | radar tracking of real shots | Mixed. TrackMan's own docs say "the radar follows the ball as long as possible, then physics-based trajectory modeling is applied to estimate the full flight path and determine where the ball would land" (the TrackMan **Baseball** support page [P]; the golf page only defines "Last Data: Last measurement of ball flight"). Land angle and carry are defined "at a point that has the same elevation as where it was launched" [P], so on non-flat ground they are necessarily model-completed. The split between tracked and modelled flight for golf is not documented publicly. |
| Acushnet US 7,591,742 (TrackMan, driver, skilled golfer) | spin vs time through the flight | Radar **measurement** of spin (§5); no trajectory geometry published. |
| USGA trajectory program + ITR coefficients (Sumitomo EP 4 218 964) | max flight-path angle Amax for 260 ft/s, 15°, 3000 rpm: **18.9–20.6°** for 19 balls, 14 of them commercial | **Model** output using measured coefficients. The USGA model balloons 3.9–5.6° above a 15° launch, so ballooning is not peculiar to the shipped model. |
| Bridgestone/Sumitomo robot tests in patents | carry and total for a robot driver (e.g. 45 m/s head speed, 9° loft) | Measured carry/total; no apex or land angle; launch conditions incomplete. Not usable for land angle. |
| Lyu 2018 Fig 6; Penner 2001; Bearman & Harvey 1976 | simulated trajectories, some compared to driving-machine **carry** | Model, or carry-only checks. |
| KTH MSc 2017 (Jansson) | stereo-camera 3-D positions of range shots, 5 sites, 19k shots per site | Real camera **measurement**, but proprietary and with no carry/apex/land summaries or aero fits published. |
| Launch-monitor studies (e.g. Bishop et al. 2023, J Sports Sci 41:2138) | TrackMan 4 reliability; Mevo+ validity against TrackMan | TrackMan is the *reference*; nothing validates TrackMan's land angle. |

Consequence for the spike: there is no independent measurement to check
whether the tour-table land angles for long clubs are model-completed values.
The user's suspicion that they are cannot be confirmed or refuted from public
sources. The physics in §3, a measured late-flight lift collapse, does supply
a mechanism by which real balls land steeper than an S-only model predicts.

## 7 Independent altitude data

New in this probe (earlier sources are in `docs/research/reference-data.md.notes.md`):

- **Arccos 2026 Driving Distance Report** — **[P]**, a measured dataset
  independent of any launch-monitor model. It covers about 10 million
  on-course amateur driver tee shots by GPS shot detection. Distance is TOTAL
  (carry + rollout) and is "not normalized for … weather, altitude, or turf".
  For a 10-handicap the average is 220.5 yd at sea level and 239.7 yd at
  5,000+ ft, i.e. **+8.7%** total by my arithmetic (the report says ≈8.3%).
  It is uncontrolled for course, roll and player mix. Total distance gains
  more than carry at altitude, because the ball lands shallower and rolls
  further. Arccos 2021 is reported as "13 to 30 yards", larger for longer
  hitters ([S], search excerpt).
- **USGA "Golf Course Effects on Hitting Distance" (2023)** — **[S],
  unverified.** usga.org returned 403. A search summary reports a ShotLink
  2015–2020 "course elevation coefficient of 0.00427", units unknown. If that
  is yards per foot of driving distance it would be about 4.3 yd per
  1,000 ft (≈ 1.4%/1,000 ft). That reading is a guess.
- **Already gathered (2026-10-08):**
  - Player planning yardages: Scheffler and McIlroy at Castle Pines +8–14%
    with irons gaining most; Larrazabal driver carry +11.4% at Chapultepec.
  - Penge at Crans (1,500 m): wedges ≈+5%, mid irons +7.5%, woods +5%.
  - ShotLink Montreux 2011.
  - Aoyama's 1.16%/1,000 ft.

  The player numbers are launch-monitor carries measured on site, i.e.
  radar-tracked flight with the landing model-completed. They are
  independent of TrackMan's *altitude normalisation*, but not of its
  trajectory completion.

No source found measures **apex or land-angle** change at altitude other than
TrackMan's own model (Padjen). That soft check stays soft. **[D]** Under the
§3 lift-loss mechanism, lower ρ raises ν and lowers Re at a given speed:
Re 7.5e4 moves from 27.5 m/s at sea level to about 36.7 m/s at 7,800 ft.
More of each flight then sits in the lift-loss band, which by itself steepens
the late descent. Whether that offsets the familiar "flatter at altitude"
trend is for the model-fits probe to test, not something the data settle.

## 8 Future-3-D pointers

These are pointers only; I did not research them in depth.

- **Humid-air density:** CIPM-2007 (Picard et al., *Metrologia* 45:149,
  2008) is already implemented and characterised in
  `docs/research/atmosphere.md.notes.md:60-78`. At 25 °C, 50% RH lowers ρ by
  ≈0.6%.
- **Humid-air viscosity** (needed for Re):
  - Tsilingiris 2008, "Thermophysical and transport properties of humid air at
    temperature range between 0 and 100 °C", *Energy Conversion and
    Management* 49(5):1098–1110, doi:10.1016/j.enconman.2007.09.015.
  - The same author's 2018 reassessment in *Renew. Sust. Energy Rev.* 83:50–63
    gives algebraic correlations per 10% RH step.
  - Measured basis: Kestin & Whitelaw 1964. Mixing rule: Wilke 1950.
  - Dry-air μ(T) (Sutherland, β = 1.458e-6, S = 110.4 K) is in
    `atmosphere.md.notes.md:28,53`.
  - Effect size is not checked here. Water vapour has lower viscosity than
    air, so μ falls slightly with humidity.
- **Wet ball / rain:** a search found **no** aerodynamic study of wet golf
  balls or rain-film effects on lift and drag; only a hydrophilic-coating
  patent (US 8,393,979). The better-known wet effect is at impact (water on
  the face lowers spin, "flyers"), which is a launch condition rather than
  aerodynamics. This is an open gap for the 3-D project.
- **Near-ground wind profile:**
  - Naruo & Mizota 2008, "The influence of wind trajectory of golf ball under
    various initial conditions", *The Impact of Technology on Sport II*
    (Taylor & Francis), pp. 223–227. They measured forces **and torque** in a
    wind tunnel, used a log-law boundary-layer wind profile verified by field
    measurement, and compared predicted with measured landing points of a
    professional's shots. Abstract only, [S]. This is also a lead for spin
    decay (§5) and independent landings (§6).
  - Standard log-law / roughness-length references, e.g. Stull 1988.
  - A canopy-height treatment for tree lines appears in patent US 11,361,132
    ("weather applied metrics for predicting the flight of a ball").
- **Spin axis / crosswind:** the vector form (drag along −v_rel, Magnus along
  ω̂ × v̂_rel) is standard. The Kensrud 2010 thesis abstract ([S]) reports
  that drag depends on ball orientation. That matters for knuckle-type
  effects at low spin.

## 9 Gaps and what could not be verified

**Not obtained or not read:**
- Aoki, Muto & Okanaga 2010. Every fetch got 403, including curl,
  WebFetch, ScienceDirect PDF variants, CORE and Wayback (429). Its rotating
  C_L(Re) data, likely relevant to §3, remain unseen; only a secondary replot
  of its non-spinning C_D is in the CSV.
- Smits & Smith 1994, Tavares et al. 1999, Quintavalla 2002 and the
  Bearman & Harvey 1976 original are paywalled book chapters or journal
  papers. B&H was digitized from two secondary reproductions, which disagree
  on where its drag crisis sits by about 1e4 in Re.
- Not read: Kim & Choi 2014 (grooved and dimpled balls, S to 0.5), Naruo &
  Mizota 2008, Alam et al. 2011, Moriyama & Okanaga 2023.
- USGA "Golf Course Effects on Hitting Distance" (2023) and R22-09:
  usga.org returned 403. The ShotLink elevation coefficient 0.00427 is
  unverified and its units are unknown.
- TrackMan Newsletter #7 ("4%/s" spin decay): dead link.

**Gaps in the data themselves:**
1. **Modern-ball C_L at Re < 7e4 and S > 0.36** (late-flight wedges and
   short irons) is not measured anywhere public. Only the 1976 B&H ball
   covers it.
2. **Ball-to-ball variation in the low-Re loss is large**, and every modern
   low-Re point comes from WSU (three balls, ~2250 rpm) and Bridgestone (two
   conditions). No tour-average ball exists, so the loss's location and
   depth are fit parameters within the measured bounds, not constants.
3. **No independent measurement of tour land angle, apex and carry**: no
   academic radar or camera dataset, and no published validation of
   TrackMan's land angle. Whether the long-club land angles are
   model-completed cannot be settled from public sources.
4. **No independent apex or land-angle altitude data.** The only measured
   altitude datasets are total-distance (Arccos, ShotLink) and player
   launch-monitor carries.
5. **Spin decay for modern balls**: one radar trace summary (Pro V1x) with no
   uncertainty, and no Re or S dependence measured below Re 1e5.
6. **Ball and era mismatch**: the TrackMan 2023 table averages unknown balls
   (mostly premium urethane). The aero data cover 1970s, 1990s and 2017–2020
   balls.

**Method caveats on my numbers:**
- **Lyu 2020** values are vector-extracted, so digitization error is below
  0.002. S for its Fig 3 is derived from the nominal 2250 rpm, and that rpm
  is ±250.
- **Lyu 2018** and the Crabill replot are raster digitizations, ±0.01. The
  Lyu 2018 Fig 4a clusters have no Re attached; the Re ≥ ~9e4 placement is
  inferred from the speed and spin ranges.
- **B&H via Kensrud**: curves are identified by monotonic order in U, and Re
  is mapped with ν = 1.58e-5, chosen to match B&H's stated Re range.
- **The USGA example table is a patent example.** The ball is unknown and
  real measurement is inferred from shot scatter, not stated.
- **The §1 fits are least squares over pooled sources** with unequal
  weights. They are starting points for the model-fits probe, not results.
