# Round 3 — literature: published golf-ball flight research

Status: COMPLETE 2026-10-09. Verified facts live in
`literature.md.notes.md`; extracted numbers in `literature-data.csv`
(source, ball, Re, S, CD, CL, quantity, value, method, uncertainty).

Labels: **[P]** primary (read in the source itself), **[S]** secondary
(reported by someone else about a source), **[D]** derived (computed here).
Scope: extends `aero-data.md` §2 (round 1); sources already there are cited
only where this round adds something new about them.

## 1 Summary — what changes the model

**Sources that most change a descent model, in order** (full entries in §2):

1. **Aero-X/Polara US 8,202,178 (L1).**
   - In-flight C_L and C_D from a three-radar TrackMan Net on robot drives:
     lift peaks at 62–72 % of flight time, then **falls 18–24 %** by landing
     at Re ≈ 7e4.
   - A spindle tunnel on a **Pro V1** at Re 5.9e4: lift is low at S < 0.16,
     recovered by S 0.24, and **1.2–1.4× above** its high-Re curve at
     S 0.28–0.35.
2. **Watanabe, Arakida & Tsuboi 2016 (L2).** TrackMan's *own* C_D/C_L output
   for two Dunlop-supplied shots. Lift **falls 38–52 %** and drag 25–63 %
   through the descent. At the same Re, ascent and descent values differ
   two-fold.
3. **Ferguson, McNally & McPhee 2022 (L3).** S-only laws fitted to FlightScope
   radar carry and apex of 1,040 Pro V1 shots, all clubs. Lift peaks at
   S 0.52 and **falls beyond it**. The spin torque sits at its lower bound,
   0.010·S.
4. **Naruo et al. 2014, Mizuno (L4).** Lift collapses below 28–30 m/s for
   shallow-dimple designs (C_L ≈ 0.03 at S 0.07–0.18). The collapse is gone
   by S ≈ 0.45–0.5. "Below 30 m/s right after the apex" for pro drivers.
5. **Naruo, Mizota & Shimozono 2004 (L5).** A commercial ball (Skyway SD432)
   to **S 1.13**, Re-independent at Re ≥ 7.1e4, with fits for C_L, C_D and
   the spin torque.
6. **Acushnet US 8,016,695 (L6) and US 6,729,976 (L7).**
   - TrackMan spin decay of a Pro V1x for driver, 5-iron and 8-iron.
   - Exact indoor-range C_L/C_D down to Re 6.9e4.
   - Land angle moving 5° with ball orientation alone.

**What they change [D]:**

- **The late lift fall is in every published in-flight coefficient history.**
  It is also implied by the only large radar carry-and-apex fit.
  - That is the "balloon, then drop" shape the spike needed.
  - The trajectories behind the tour land angles are TrackMan's, and
    TrackMan's coefficient histories contain it.
  - Whether a ball in still air does the same is not established. Wind,
    TrackMan's model completion and curve fitting would each produce it
    (§4.1, §9). So the spike's tour-table residual may be partly TrackMan's
    descent physics or artefact, not a missing law.
- **Low-Re lift loss fades with S in every data set that shows it.** It is
  gone by S ≈ 0.24–0.5 depending on the ball. One Pro V1 data set shows a
  **gain** at S 0.28–0.35 (§4.2, §7).
  - This backs round 2's "band fades with S" (R2) over "persists at all S".
  - It says the band cannot steepen high-S short-iron and wedge descents.
    That fits the LPGA short irons rejecting it.
- **Ballistic coefficient is not a constant.** No golf source publishes one.
  Converted from C_D:
  - BC falls 30–40 % from launch (≈ 145–150 kg/m²) to the slowest point
    (≈ 87–107), because C_D grows with S.
  - It halves at wedge S (63–78 kg/m² at S 0.5–1.0).
  - It is ball-specific inside the drag crisis (67–140 kg/m² at Re 5–7e4).
  - Radar C_D also *falls* in the descent, which no C_D(Re, S) law produces
    (§3).
- **Spin decay is at or below Smits & Smith in flight**: Pro V1x radar is
  0.65–0.9×, and the Ferguson fit sits on its lower bound. Naruo's tunnel
  torque says 1.6–5.4× faster at S 0.5–1.0. Prefer the flight data: a torque law
  C_M = β·S with β ≈ 0.0065–0.010 (§5). Still a weak lever.
- **Supercritical laws are corroborated by free-flight data.** Both agree
  with round 1's `C_L ≈ 0.065 + 0.85·S` within 0.00–0.02 at S 0.10–0.26: the
  Polara Pro V1 TrackMan regression and Ferguson's fit at S ≤ 0.2. C_D rises
  to ≈ 0.5 at S ≈ 1 (Naruo; B&H).

**For the model (suggestions, not results):**

- Keep R0's supercritical laws.
- Make the low-Re band fade by S ≈ 0.3–0.5. Test a variant with a small lift
  gain at S 0.25–0.35.
- Test a **descent-phase lift and drag reduction** of 20–40 % as an explicit,
  switchable hypothesis. Label it "TrackMan-consistent, physics unconfirmed"
  and report land angle with and without it.
- Use C_D(Re, S) — never a fixed BC — and the flight-calibrated spin torque.

## 2 Annotated bibliography

Ordered by how much each would change a descent model (most first). "Notes"
points to the entry in `literature.md.notes.md`; "CSV" to the rows tagged with
that source in `literature-data.csv`. Access: **open**, **paywalled**, or
**fetch-refused** (open in principle, but every automated download failed).

**L1. Aero-X Golf ("Polara") US 8,202,178 B2, "Low lift golf ball"** (Felker,
Winfield & Lee; granted 2012).
Notes N1; CSV "Polara US8202178".
- Measured: (a) C_L and C_D *along real flights* — robot drivers tracked by a
  three-radar TrackMan Net; coefficients derived from the x, y, z track
  against Re, spin and time (Figs 5–9). (b) A spindle wind tunnel: C_L vs S at
  six Re for a **Titleist Pro V1** (Fig 18), and seven Re for a prototype (Fig 17).
- Balls: TopFlite XL Straight (two-piece Surlyn) and the B2 prototype in flight;
  Pro V1 (c. 2008–10) and the 173 prototype in the tunnel.
- Range: in flight, Re 1.7e5 → 6.9e4 and S ≈ 0.12 → 0.26. In the tunnel,
  Re 4.9e4–2.2e5 and S 0–0.4.
- Status: primary, but a patent. Curves are smoothed fits; the tunnel operator
  is not named; the tunnel C_L reads −0.05 to −0.08 at S = 0.
- Access: open (Google Patents text and figure sheets).
- Why it matters:
  - The only published in-flight C_L(t) for a modern-construction flight.
    Lift peaks at 62–72 % of flight time and falls 18–24 % by the end.
  - The only Pro V1 lift data below Re 6e4 up to S 0.35. Lift there is
    0.5–0.67× the high-Re curve at S < 0.16, equal to it near S 0.24, and
    **1.2–1.4× above it at S 0.28–0.35**.

**L2. Watanabe, Arakida & Tsuboi 2016,** "Estimation of aerodynamic
coefficients for balls in flight with trajectory data", Proc. JSME Symp.
Sports & Human Dynamics 2016, A-24. Notes N4; CSV "Watanabe2016".
- Measured: instantaneous C_D, C_L and C_S along two TrackMan-tracked golf
  shots that Dunlop/Sumitomo R&D supplied. It compares an inverse-problem
  estimate with **TrackMan's own C_D/C_L output**.
- Range: one 250 m drive (apex 27 m) and one 165 m hook (apex 28 m); Re
  1.95e5 → 6.6e4.
- Status: primary for the method; the data are TrackMan's.
- Access: open (J-STAGE).
- Why it matters:
  - TrackMan's coefficient histories have lift **falling 38 % and drag
    25 % through the descent** at Re 0.77–0.8e5.
  - At the same Re they differ between ascent and descent: C_D 0.42 vs 0.175
    and C_L 0.30 vs 0.15 for the hook. That is history dependence, wind, or
    model completion; the paper cannot say which.
  - This is what the trajectories behind the tour land angles contain.

**L3. Ferguson, McNally & McPhee 2022,** "Predicting the flight of a golf
ball: comparing a physics-based aerodynamic model to a neural network", ISEA
2022 (Engineering of Sport 14), doi:10.5703/1288284317493. Notes N11; CSV
"Ferguson2022".
- Measured: 1,040 shots (driver to wedge) with 2021 **Pro V1** balls. Launch
  from a GCQuad camera; carry, apex and offline from a **FlightScope X3
  radar**. Wind under 1.3 m/s; 190 m elevation.
- Fitted: quadratic S-only C_D, C_L and a linear C_M.
- Range: S 0.02–0.75 at launch.
- Status: primary.
- Access: open (Purdue e-Pubs).
- Why it matters:
  - The only open radar data set of carry *and apex* for a modern tour ball
    across all clubs with known launch.
  - The fitted lift **peaks at S 0.52 and falls beyond it**, while the spin
    torque sits at its lower bound, 0.010·S. An S-only law fitted to real
    flights wants less lift at high S, which in iron and wedge descents means
    late. It also wants spin decay no faster than Smits & Smith.
  - Test MAE: carry 2.5 m, apex 1.2 m.

**L4. Naruo, Michishita, Miyata, Uda, Mizota & Takita 2014,** "Effect of golf
ball dimples on aerodynamic characteristics", Proc. JSME SHD 2014, B-29 (Mizuno
R&D). Notes N5; CSV "Naruo2014".
- Measured: C_L vs S in a wind tunnel at 25–44 m/s. The ball spins down
  freely from 200 rps while forces are logged, so S falls with time as it does
  in flight.
- Balls: Mizuno test balls with dimple depth 0.123 vs 0.158 mm, plus a
  tiny-dimple variant.
- Range: Re ≈ 7.1e4–1.25e5, S ≈ 0.03–0.6.
- Status: primary; figures are low-resolution.
- Access: open (J-STAGE).
- Why it matters:
  - A manufacturer's direct statement that lift collapses below 28–30 m/s
    for some dimple designs: C_L ≈ 0.03 at S 0.07–0.18 against 0.20–0.25 above
    30 m/s. The collapse fades with S and is gone by S ≈ 0.45–0.5.
  - "After the apex the ball speed falls below 30 m/s for both male and female
    pro driver launches." The high-lift ball "falls steeply" after the apex.

**L5. Naruo, Mizota & Shimozono 2004,** "Aerodynamic force measurement of
highly spinning golf ball in uniform flow and trajectory experiment", Trans.
JSME B 70(697):2371–2377, doi:10.1299/kikaib.70.2371. Notes N3; CSV
"Naruo2004".
- Measured: C_D, C_L and the **aerodynamic spin-down torque C_m** in a wind
  tunnel, up to 10,000 rpm. Carry was checked against robot shots.
- Ball: Bridgestone Skyway SD432 (commercial).
- Range: S 0.03–1.13 at Re 7.1e4–1.25e5; C_m at Re 3.8e4–2.3e5.
- Status: primary.
- Access: open (J-STAGE).
- Why it matters:
  - The only open data set with a commercial ball to **S = 1.13**, and
    explicit polynomial fits. C_L 0.39 at S 0.5 and 0.46 at S 1.0; C_D 0.41
    and 0.51.
  - C_m = exp(3.78 S − 6.707): close to Smits & Smith at S 0.2–0.3, and 1.6–5×
    faster at S 0.5–1.0.
  - Re-independent above 7e4, so it says nothing about the low-Re band.

**L6. Acushnet US 8,016,695 B2** (Nardacci & Bissonnette, 2011). Notes N7; CSV
"Acushnet US8016695".
- Measured: TrackMan radar spin through the flight of a **Pro V1x** for
  driver, 5-iron and 8-iron (Table 6B; Figs 22–24).
- Status: primary.
- Access: open.
- Why it matters: the only published in-flight spin decay for irons. Spin
  lost at 1/3/5 s is driver 3.1/8.8/12.8 %, 5-iron 3.4/9.7/15.5 % and 8-iron
  3.6/9.0/13.3 %, at or below Smits & Smith.

**L7. Acushnet US 6,729,976 B2** (Bissonnette, Dalton & Aoyama; priority 1997).
Notes N2; CSV "Acushnet US6729976".
- Measured: exact C_L and C_D at eight (Re, S) pairs from Re 2.3e5/S 0.085 to
  6.9e4/S 0.284, a fixed ≈ 3,000 rpm sweep. Two balls, two orientations each.
  Method: indoor test range.
- Also: carry, flight time and **impact angle** for 168.4 mph / 8° / 3,500 rpm
  and 145.4 mph / 8° / 3,000 rpm. The text does not say whether these were
  measured or simulated.
- Status: primary.
- Access: open.
- Why it matters:
  - A prior-art ball loses lift between Re 92k and 69k even though S rises
    (0.280 → 0.270).
  - Ball orientation alone moves impact angle 5° and flight time 0.3 s.

**L8. Golf Digest robot driver test (2025/26)**, via the Australian Golf Digest
reprint. Notes N6; CSV "GolfDigest".
- Measured: carry and descent angle for 47 drivers on a 95 mph robot with one
  Titleist ball, plus launch and spin for four heads.
- Status: secondary; the launch monitor is not named.
- Access: open (golfdigest.com refused).
- Why it matters: a soft amateur-speed check. 136.8 mph / 11.2° / 2,468 rpm →
  220.9 yd and 33.6°.

Lesser entries:

- **L9. Moriyama & Okanaga 2023**, Trans. JSME 89(924), 23-00083,
  doi:10.1299/transjsme.23-00083 (N10).
  - Measured: tunnel C_L and C_D on 15 3-D-printed model balls (110 mm) at
    S 0.06–0.30 and model Re ≈ 2.7e5 (supercritical only). Their Fig 2
    overlays Aoki et al. 2010 at Re 1.27e5.
  - Primary; open. Mainly useful for its summary of Naruo's Mizuno work on
    low-speed lift loss. Its English twin is in Sports Engineering 26:10
    (2023), doi:10.1007/s12283-023-00400-0, not read.
- **L10. Mizota 2015**, "Strange behavior of sports ball flight and its
  aerodynamics", RIMS Kôkyûroku 1940:40–58.
  - Read pp. 40–58; open (Kyoto). It reproduces Mizuno/Fukuoka 3-D flight
    models validated on landing points (X 100–210 m).
  - It cites Naruo & Mizota 2004 (Nagare 23:203–211) and Mizota, Park, Naruo
    & Fukamachi 2008 (Proc. Symp. Wind Eng. 18:281–286). Neither was obtained.
- **L11. Bridgestone US 7,435,089 B2** (Sato & Kasashima, 2008). Open.
  - CFD-based trajectory simulator. Primary for its spin-decay form,
    ω = ω0·exp{−(SRD1 + SRD2·V)·t·β}, which has a speed-independent term.
    It gives no values (N8).
- **L12. Naruo & Mizota 2014**, "The influence of golf ball dimples on
  aerodynamic characteristics", Procedia Eng. 72:780–785,
  doi:10.1016/j.proeng.2014.06.132.
  - Open access but **fetch-refused** (sciencedirect, core.ac.uk 403).
    Probably the journal version of L4 (§8).
- **L13. USGA "ITR test conditions — 2028 ODS"** (March 2025) and **TPX3006
  Overall Distance and Symmetry Test Protocol 4.0** (1 Oct 2025).
  - **Fetch-refused**: usga.org 403; the digital-pd.usopen.com mirror does not
    resolve. Known only from a search summary: 24 ITR conditions, and
    baseline C_L and C_D for 17 ball types in two orientations (§8).

## 3 Ballistic coefficients

**No golf source publishes a ballistic coefficient.** Every source gives C_D,
so a BC is always a conversion. I use BC = m/(C_D·A) in kg/m², with m 45.93 g
and D 42.67 mm, so m/A = 32.12 kg/m². The equivalent deceleration constant is
k = ρ·C_D·A/(2m), with drag deceleration k·v². A golf ball's BC is not a
property of the ball. It moves with Re and S through every flight, and it is
ball-specific inside the drag crisis. **[D]**, notes N8.

| Source / condition | Re | S | C_D | BC, kg/m² | k at ρ 1.184, 1/m |
|---|---|---|---|---|---|
| Round-1 law, minimum (aero-data.md §1) | ≥ 7.5e4 | 0.05 | 0.214 | 150 | 0.00394 |
| Round-1 law | ≥ 7.5e4 | 0.10 | 0.223 | 144 | 0.00411 |
| Round-1 law | ≥ 7.5e4 | 0.20 | 0.286 | 112 | 0.00527 |
| Round-1 law, B&H branch | ≥ 8e4 | 0.30 | 0.330 | 97 | 0.00609 |
| Acushnet prior-art ball (L7), indoor range | 2.3e5 | 0.085 | 0.222 | 145 | 0.00409 |
| same ball, two orientations | 6.9e4 | 0.284 | 0.308 / 0.337 | 104 / 95 | 0.0057 / 0.0062 |
| Naruo 2004 fit, Skyway SD432 (L5), tunnel | 0.7–1.25e5 | 0.1 / 0.3 / 0.5 / 1.0 | 0.236 / 0.327 / 0.414 / 0.509 | 136 / 98 / 78 / 63 | 0.0044–0.0094 |
| Polara, TopFlite in flight (L1), radar | 1.7e5 → 8e4 → ≈ 7e4 | 0.12 → 0.24 → 0.26 | 0.260 → 0.359 → 0.370 | 124 → 89 → 87 | 0.0048 → 0.0068 |
| Polara, B2 in flight | 8e4 | 0.23 | 0.325 | 99 | 0.0060 |
| TrackMan output, 250 m drive (L2 entry) | 1.95e5 → 7.8e4 → landing | — | 0.215 → 0.300 → 0.225 | 149 → 107 → 143 | 0.0040 → 0.0055 |
| TrackMan output, 165 m hook | 1.6e5 → 6.8e4 | — | 0.265 → 0.475 | 121 → 68 | 0.0049 → 0.0088 |
| Lyu 2020, 2250 rpm (round 1) | 5e4 | 0.28 | 0.463 | 69 | 0.0085 |
| Lyu 2018, 13-ball mean, no spin (round 1) | 5e4 / 1.5e5 | 0 | 0.48 / 0.196 | 67 / 164 | 0.0089 / 0.0036 |

What the data say:

- **Spin sets BC more than speed does at supercritical Re [P/D].**
  - Every set shows C_D rising roughly quadratically with S: Naruo's fit,
    Acushnet's tables and the in-flight curves.
  - Through a driver flight S doubles, from about 0.12 to 0.25. Measured C_D
    therefore rises 0.26 → 0.36–0.37 in the Polara radar data, and 0.215 → 0.30
    in TrackMan's own output for a drive. The effective BC falls by **30–40 %
    between launch and the slowest point.** This is not a Reynolds effect:
    Naruo finds no Re dependence at fixed S above 7e4.
- **At wedge-like S the BC halves [P/D].**
  - Naruo's commercial ball gives C_D 0.41 at S 0.5 and 0.51 at S 1.0, i.e.
    BC 78 and 63 kg/m².
  - These are the only open modern-ball values at S > 0.46. Bearman & Harvey's
    0.44–0.54 at low Re and high S (round 1) agree.
- **Inside the drag crisis (Re < 7.5e4) BC is ball-specific [P].**
  - Round 1 found 67–69 kg/m² at Re 5e4 for the WSU balls.
  - Bridgestone balls are still near 140 at Re 7e4 (aero-data.md §4).
  - Polara's in-flight C_D at Re 8e4 is 10 % lower for the B2 ball than for
    the TopFlite.
- **Dimple pattern and orientation move BC by 3–10 % [P].**
  - Acushnet's prior-art ball differs by 0.003–0.03 in C_D between the
    pole-forward and pole-horizontal orientations. The gap is largest at the
    slow end (Re 6.9e4).
  - The USGA symmetry rule now limits this. Ball-to-ball spread is under 0.05
    in C_D above Re 1e5 and over 0.1 below 7.5e4 (Lyu 2018, round 1).
- **In-flight deceleration has been measured only through radar-fitted
  coefficients.** The Polara and TrackMan histories are the closest thing to
  a measured BC along a real trajectory.
  - No source publishes raw radar speed-vs-time for a golf shot from which
    deceleration could be recomputed independently.
  - Both radar histories show C_D peaking near the slowest point and then
    **falling in the descent**: 0.37 → 0.32–0.35 for Polara, 0.30 → 0.225 for
    the TrackMan drive, 0.475 → 0.175 for the hook. A C_D(Re, S) law cannot
    produce that fall (§4).
- **Weather enters through k = ρ·C_D·A/(2m), and through Re.** BC itself is
  independent of ρ, but C_D depends on Re = vD/ν. For a 3-D model, keep
  C_D(Re, S) and do not use a fixed BC. A constant BC would mis-state the
  descent by the 30–40 % swing above.

## 4 Lift as spin decays (history dependence, negative Magnus)

**Along a real flight S rises, not falls.** Spin decays only 9–19 % over a
whole flight (§5), while speed falls by half or more before the descent. So
S = rω/v roughly doubles from launch to the slowest point. "Lift as spin
decays" is therefore "lift as S rises and Re falls". Two kinds of evidence
bear on it.

### 4.1 Lift along measured flights (radar)

- **Ascent: C_L follows the supercritical S-law [P/D].**
  - Polara's in-flight regression for a Pro V1 (TrackMan Net, Re
    1.2–1.8e5, S 0.10–0.26) sits 0.00–0.02 above round 1's
    `0.065 + 0.85·S`. At fixed S it varies by ≤ ±0.01 across Re (N1i).
  - Both TrackMan histories in Watanabe 2016 rise smoothly as S rises:
    0.125 → 0.25 for the drive, 0.24 → 0.31 for the hook.
- **Descent: C_L falls 18–52 % in every published in-flight history [P].**

  | Source | Peak C_L (where) | End C_L | Fall | Re over the fall |
  |---|---|---|---|---|
  | Polara, TopFlite, two curve sets | 0.327 / 0.333 (65–72 % of flight time) | 0.25 / 0.272 | 24 / 18 % | ≈ 6.9e4, nearly constant |
  | Polara, B2, two curve sets | 0.248 / 0.266 (62–67 %) | 0.198 / 0.216 | 20 / 19 % | 7.3–7.6e4 |
  | TrackMan output, 250 m drive | 0.25 (Re 0.87e5) | 0.155 | 38 % | 0.77–0.79e5 |
  | TrackMan output, 165 m hook | 0.31 (Re 0.9e5) | 0.15 | 52 % | 0.66 → 0.80e5 (rising) |

  - In each case the fall happens after the apex, where Re has stopped
    falling or is rising again and S changes by under 10 %. A single-valued
    C_L(Re, S) predicts a roughly flat or slightly falling C_L there, not a
    20–50 % drop.
  - At the same Re of 0.8e5, the hook's TrackMan C_L is 0.30 climbing and
    0.15 descending. Its C_D is 0.42 and 0.175.
  - Four explanations fit, and no published source separates them:
    1. Real history dependence in the drag-crisis band. The descending ball
       has spent ≈ 1 s below Re 8e4.
    2. Wind. All these are outdoor shots, and coefficients are computed from
       ground-relative velocity. A 3 m/s tailwind at 25 m/s ball speed lowers
       inferred force coefficients by ≈ 23 %. **[D]**
    3. The late trajectory is TrackMan's model completion rather than radar.
    4. End-of-track fitting. Polara's curves are smoothed fits, though their
       fall is steeper than a parabola would force.
- **An S-only fit to real radar flights shows the same need [P/D].**
  Ferguson, McNally & McPhee 2022 (L3) fitted a quadratic C_L(S) to carry
  and apex of 1,040 Pro V1 shots, driver to wedge. It peaks at S 0.52 (0.365)
  and falls to 0.31 by S 0.75. In an S-only law, high S means slow and late,
  so this is the same "less lift late in slow descents" signature, absorbed
  into S. At S ≤ 0.2 the same fit matches round 1's law within 0.01.
- **This is the shape the spike's fits asked for:** lift strong through
  mid-flight, falling away late (BRIEF.md "Ballooning"). Whatever its cause,
  TrackMan's own coefficient histories contain it. If the tour land angles
  come from such trajectories, a model needs the late fall to reproduce them.
  The radar data cannot say whether a real ball in still air would fall that
  steeply. **[D]**

### 4.2 Lift at low Re as a function of S (tunnels and ranges)

| Ball (source) | Re | Deficit at low S | Where it fades | High-S behaviour |
|---|---|---|---|---|
| Titleist Pro V1, c. 2008–10 (Polara Fig 18, tunnel) | 5.9e4 | C_L 0.09–0.13 at S 0.04–0.16, 0.5–0.67× the high-Re curve; positive | equal near S 0.24 | **1.2–1.4× above** the high-Re curve at S 0.28–0.35 (0.40–0.49 vs 0.31–0.35) |
| Aero-X 173 prototype (Polara Fig 17) | 4.9e4 | **−0.14 to −0.17** at S 0.04–0.15 (reverse Magnus) | crosses zero at S 0.17 | 0.68× at S 0.25, 0.77× at 0.30, 0.93× at 0.39 |
| same ball | 5.9e4 | −0.08 at S < 0.07 | recovered by S 0.08 | — |
| Mizuno test ball B, shallow dimples (Naruo 2014, tunnel spin-down) | ≈ 7.1e4 (25 m/s) | C_L ≈ 0.03 at S 0.07–0.18, ≈ 0.15× | rejoins near S 0.45–0.5 | — |
| Mizuno ball D (Naruo 2014) | ≈ 8.5e4 (30 m/s) | "clear" C_L drop, modest | — | — |
| Acushnet prior-art ball (US 6,729,976, indoor range) | 6.9e4 | — | — | ≈ 0.88× at S 0.284 in one orientation; ≈ 1.0 in the other |
| Bridgestone Skyway SD432 (Naruo 2004, tunnel) | 7.1e4–1.25e5 | none | — | Re-independent to S 1.13 |
| Three WSU balls (Lyu 2020, round 1) | 6.0–6.5e4 | negative at S 0.07–0.22 | recovering by S 0.28–0.36 | — |
| 1970s ball (Bearman & Harvey, round 1) | 3.8e4 | −0.12 at S 0.17 | recovered by S 0.3 | 0.28–0.45 at S 0.45–1.0 |

- **One pattern in every data set that shows a deficit [P/D].** Where a
  low-Re lift deficit exists, it is deepest at low S (0.05–0.2) and shrinks as
  S rises.
  - It is gone by a ball-specific S of 0.24 (Pro V1), 0.3 (B&H), 0.45–0.5
    (Mizuno ball B), and later than 0.39 (the 173 prototype).
  - One ball (Pro V1) overshoots to well above its supercritical lift.
  - This supports round 2's "band fades with S" over "band persists at
    every S". The Pro V1 data say the fade can be faster than R2's default
    (gone by S ≈ 0.6) and can turn into a lift **gain**.
- **The mechanism makes the S-dependence expected [P, Lyu 2020 §5 via round
  1].** Backspin gives the top of the ball local speed v − rω and the bottom
  v + rω. At low S both sides sit inside the crisis, and the asymmetric
  transition (bottom turbulent, top laminar) makes the deficit or reverse
  Magnus. At high S the top-side flow is slow relative to the surface and the
  bottom is well past transition, so the asymmetry favours ordinary Magnus
  lift. That reading is consistent with the data; the papers do not test it.
- **Negative Magnus is ball-specific and confined to S ≲ 0.2 [P].** It is seen
  for the 173 prototype, the three WSU balls and the B&H ball. Mizuno ball B
  comes close, at C_L ≈ 0.03. The c. 2008 Pro V1 in Polara's tunnel stayed
  positive at Re 5.9e4. The later Pro V1 in WSU's free-flight test went
  negative at Re 6e4. Ball generation and method differ, so this is unresolved.
- **History dependence (hysteresis): no direct golf measurement exists.**
  - The boundary layer adjusts in a few D/v (≈ 1–2 ms). Spin and speed
    change over seconds. So quasi-steady C(Re, S) is the default expectation,
    except where the transition is bistable. **[D]**
  - Smooth-sphere work near the critical Re reports unsteady, random or
    bistable lift and side forces. Example: a 2019 J. JSASS study, seen only
    as a search summary **[S]**.
  - The two tunnel methods agree above 30 m/s: a ball spinning down during
    the measurement (Naruo 2014; Polara Fig 18 looks like a sweep too) and a
    ball held at fixed spin (Naruo 2004).
  - The only hint of path dependence is §4.1's ascent/descent mismatch, which
    wind or model completion explain equally well.
  - Verdict: treat lift as a function of instantaneous Re and S. Keep the
    ascent/descent mismatch as an open question that only a still-air
    full-flight measurement can settle (§9).

## 5 Spin-decay laws

Round 1 (aero-data.md §5) had Smits & Smith (λ = 2e-5, C_M = 0.010·S),
Tavares (C_M = 0.012·S) and one radar summary for a Pro V1x driver
(≈ 75 rpm/s). This round adds:

| Source | Ball | Method | Result |
|---|---|---|---|
| Acushnet US 8,016,695 Table 6B, Figs 22–24 (L6) **[P]** | Pro V1x | TrackMan radar, spin through the flight | Spin lost at 1/3/5 s: driver 3.1/8.8/12.8 % (launch ≈ 3,400 rpm); 5-iron 3.4/9.7/15.5 % (≈ 6,400); 8-iron 3.6/9.0/13.3 % (≈ 8,500). "< 4 % in the first second" for a solid ball |
| same, derived **[D]** | | | ≈ 87 / 198 / 226 rpm/s over 5 s. Roughly 0.65× (driver), 0.9× (5-iron) and 0.85× (8-iron) of Smits & Smith, assuming flight-mean speeds of 45/40/35 m/s |
| Polara US 8,202,178 Fig 5 (L1) **[P/D]** | TopFlite XL Straight; B2 | TrackMan Net, robot driver | 3,385–3,490 → 2,800–3,000 rpm over 5.05–5.2 s, ≈ 95–115 rpm/s (2.9–3.3 %/s). B2 ≈ 150 rpm/s |
| Naruo, Mizota & Shimozono 2004 (L5) **[P]** | Skyway SD432 | tunnel torque from piano-wire twist, Re 3.8e4–2.3e5, Re-independent | C_m = exp(3.780·S − 6.707). Equals 1.3× the Smits & Smith torque at S 0.2–0.3, 1.6× at 0.5, 2.8× at 0.76, 5.4× at 1.0; 1.8–3× at S ≤ 0.1 |
| Ferguson, McNally & McPhee 2022 (L3) **[P]** | 2021 Pro V1 | C_M = g·S fitted jointly with C_D, C_L to 832 radar carry/apex/offline shots, g bounded 0.010–0.015 | g = 0.010, at the lower bound. The data want decay no faster than Smits & Smith |
| Bridgestone US 7,435,089 **[P, form only]** | — | CFD-based simulator | ω = ω0·exp{−(SRD1 + SRD2·V)·t·β}, β = πρr⁴/I: a speed-independent term plus a term linear in V. No values |
| Acushnet US 8,016,695 text **[P]** | multi-layer designs | — | A cover decoupled from the core by a viscous layer raises early spin decay, so decay depends on construction as well as aerodynamics |

Reading **[D]**:

- **Measured in-flight decay of modern solid balls is at or below Smits &
  Smith, never faster.** That covers 8-iron flights, whose S runs from about
  0.35 at launch to about 0.6 near the apex at typical 8-iron speeds; the
  patent gives no launch speed, so that range is an estimate.
- **This conflicts with Naruo's tunnel torque law,** which predicts 1.3–2.0×
  faster decay at those S. The tunnel law includes the wire-supported ball and
  scatters by about ×1.5. The radar measurement is the better guide for
  flight.
- **Use the torque form for a Re/ρ-aware model:** I·dω/dt = −ρ·A·R·C_M·v²,
  with C_M = β·S and β ≈ 0.0065–0.010, scaled down from Smits & Smith to match
  the radar.
  - The form makes decay proportional to ρ, so spin decays more slowly at
    altitude.
  - Wedge S of 0.6–1.3 has no in-flight measurement. Naruo's steep rise there
    is the only datum, and it is unconfirmed.
- **Spin decay stays a weak lever for land angle** (BRIEF.md). The new data
  narrow its range; they do not enlarge it.

## 6 Full-trajectory measurements

**Still no independent, still-air measurement of carry, apex and land angle
together for a known launch.** Round 1 (aero-data.md §6) reached the same
conclusion. What this round adds:

| Source | What was measured | Launch known? | Apex / land / hang? | Independent of a vendor flight model? |
|---|---|---|---|---|
| Polara US 8,202,178 (L1) | Robot drivers, 3-radar TrackMan Net: spin, C_L and C_D vs time | Partly: spin ≈ 3,400–3,500 rpm, Re ≈ 1.7e5; angle not given | Flight time 4.4–5.2 s by curve end; no apex or land angle | Radar-tracked; whether the end is model-completed is not stated |
| Watanabe 2016 (L2) | Two TrackMan 3-D tracks, 0.01 s positions | No | Carry ≈ 250 m / apex ≈ 27 m; 165 m / 28 m (hook) | TrackMan positions integrated from radar velocity; late flight may be modelled |
| Acushnet US 6,729,976 Table 5 (L7) | Carry, flight time, impact angle | Yes: 168.4 mph / 8° / 3,500 rpm and 145.4 / 8 / 3,000 | 7.06–7.14 s, impact 36.2–41.4°; 5.18–5.61 s, impact 25.4–31.3° | Unknown whether measured or simulated (probably simulated) |
| Naruo, Mizota & Shimozono 2004 (L5) | Robot launches (two-camera DLT), carry vs computed | Yes (in the paper's data) | Carry only, 75–260 m, S 0.09–0.76 | Yes. Carry agrees "extremely well"; no apex or land angle |
| Mizota 2015 / Mizota et al. 2008 | 3-D landing points vs computation | Yes | Landing X and Z only | Yes |
| Ferguson, McNally & McPhee 2022 (L3) | 1,040 shots, 2021 Pro V1, all clubs: carry, apex, offline by FlightScope X3 radar | Yes, from a GCQuad camera | Carry and apex, no land angle or hang time published; per-shot data not published | Radar-tracked carry and apex; wind < 1.3 m/s |
| Golf Digest robot test (L8) | 47 drivers, one Titleist ball | Yes for 4 heads (e.g. 136.8 mph, 11.2°, 2,468 rpm) | Carry 200.9–223.6 yd, descent 24.6–42.2° | No: launch monitor unnamed, so descent is probably modelled |
| PGA TOUR 2022-23 radar driver (round 2, provenance.md §5) | Season means to ground impact | Yes (means) | Apex 34.0 yd, 65.5 % of carry, hang 6.4 s | Mostly measured to ground impact |

Notes:

- **The Acushnet Table 5 impact angles are a useful soft check**, if
  simulated with measured coefficients. At 168.4 mph / 8° / 3,500 rpm they
  give 36–41°, close to the PGA driver table's 38°.
  - The same ball differs by 5.2° in land angle between orientations
    (41.4 vs 36.2°), with 0.29 s of hang time and 3.8 yd of carry. That bounds
    how much ball design alone, with a launch fixed, can move land angle in
    older, less symmetric balls.
- **The two TrackMan coefficient histories (§4.1) are the nearest thing to a
  measured descent.** Both contain the late lift fall that the spike's fits
  needed (SYNTHESIS.md, "What the spike established", items 2–3).
- **Physics papers keep validating carry, not apex or land angle.** Naruo
  2004, Mizota 2008/2015, Penner 2001 and Lyu 2018 all do this. A carry
  check cannot separate the late-flight lift law, because carry is set mostly
  before the descent.

## 7 High-S, low-Re data

Iron and wedge descents end at S 0.36–1.3 and Re 4–8e4: minimum in-flight Re
is ≈ 5.5e4 for a 7-iron and 4.6e4 for a PW (aero-data.md §3). Coverage of that
box, by source:

| Re band | S ≤ 0.36 | S 0.36–0.6 | S 0.6–1.3 |
|---|---|---|---|
| 3.8–5e4 | B&H 1976; Lyu 2020 (5e4); Polara 173 prototype (4.9e4, to S 0.39) | B&H only (0.28 at S 0.45) | B&H only (0.39–0.45 at S 0.6–1.0) |
| 5–6.5e4 | Lyu 2020; **Pro V1, Polara Fig 18 (5.9e4, to S 0.35)**; 173 (5.9e4) | B&H only (5.9e4: C_L 0.36–0.40 at S 0.46–0.64; C_D 0.44–0.46) | none |
| 6.5–8e4 | Lyu 2020; Bridgestone patents; Acushnet (6.9e4, S 0.284); Polara in flight (to S ≈ 0.26) | **Mizuno ball B (7.1e4, to S ≈ 0.5)**; **Skyway SD432 (Naruo 2004, 7.1e4)** | **Skyway SD432 (7.1e4, to S ≈ 0.9)** |

New this round, in bold:

1. **Titleist Pro V1 at Re 5.9e4, S 0.04–0.35** (Polara Fig 18, spindle
   tunnel; CSV).
   - Lift is low at S < 0.16, recovered by S 0.24, and **0.40–0.49 at
     S 0.28–0.35** — above the ball's own supercritical curve (0.31–0.35) and
     above round 1's linear law (0.30–0.36).
   - If a modern tour ball behaves like this at higher S, a mid- and
     short-iron descent at Re ≈ 6e4 gets **more** lift than an S-only model
     gives, not less.
   - Caveats:
     - One ball generation (c. 2008–10).
     - The tunnel shows an offset of −0.05 to −0.08 at S = 0.
     - WSU's free-flight Pro V1 (Lyu 2020) is much lower at Re 6e4 / S 0.28:
       C_L ≈ 0.09 against 0.40.
     - The two disagree by 0.3 in C_L at the same nominal condition. That is
       the size of today's uncertainty in this box.
2. **Bridgestone Skyway SD432 at Re ≥ 7.1e4, S to ≈ 0.9–1.13** (Naruo 2004).
   C_L(S) and C_D(S) are independent of Re from 7.1e4 to 1.25e5. Fits:
   C_L 0.39 / 0.43 / 0.46 and C_D 0.41 / 0.48 / 0.51 at S 0.5 / 0.76 / 1.0.
   This is the first modern-ball C_L and C_D at wedge S; it sits at the top
   edge of the box.
3. **Mizuno test ball B at 25 m/s (Re ≈ 7.1e4), S to ≈ 0.5** (Naruo 2014).
   A deep lift collapse at S 0.07–0.18 that is gone by S 0.45–0.5.

Reading **[D]**:

- **Above S ≈ 0.4, no data set shows a low-Re lift deficit** for any ball, old
  or new.
  - B&H recovers by 0.3–0.45. Pro V1 overshoots by 0.28. Mizuno B rejoins by
    0.45–0.5. Skyway shows none at 7.1e4.
  - Hence: a low-Re band that **fades with S and is gone by S ≈ 0.3–0.5** is
    the best-supported extrapolation.
  - A modest lift *gain* at S 0.25–0.35 / Re 5.5–6.5e4 cannot be excluded.
- **Drag at high S and low Re is high and ball-independent enough to model:**
  C_D 0.41–0.51 at S 0.5–1.0 (Skyway) and 0.44–0.54 at S 0.5–1.0, Re 3.8–5.9e4
  (B&H). A C_D rising to ≈ 0.5 at S 1 is well supported.
- **Still empty:** any modern ball at Re < 7e4 with S > 0.39. That is where
  wedge and short-iron descents end. Smits & Smith 1994 (S to 1.4 from Re 4e4)
  is the one source known to cover it, and it is paywalled (§8).

## 8 Sources worth obtaining by hand

Ranked by how much each could change a descent model. DOIs were checked
against Crossref unless marked otherwise (notes N9).

1. **Smits, A. J. & Smith, D. R. (1994).** "A new aerodynamic model of a golf
   ball in flight." In Cochran & Farrally (eds.), *Science and Golf II*, E & FN
   Spon, pp. 340–347. E-book reissue doi:10.4324/9780203474709-58 (Taylor &
   Francis, 2002, pp. 433–442). Paywalled.
   - Why: the only known golf data set spanning **Re 4e4–2.5e5 and S 0.04–1.4**,
     with spin-down measured. It fills the empty modern-era box in §7 and
     settles whether the low-Re deficit fades with S.
2. **Tavares, G., Shannon, K. & Melvin, T. (1999).** "Golf ball spin decay
   model based on radar measurements." In Farrally & Cochran (eds.), *Science
   and Golf III*, Human Kinetics, pp. 464–472. No DOI found. Paywalled.
   - Why: the only radar-derived spin-decay law. Compare it with the Pro V1x
     iron data (L6) and Naruo's tunnel torque (L5).
3. **USGA (2025).** "ITR test conditions — 2028 ODS" (March 2025) and "Overall
   Distance and Symmetry Test Protocol 4.0 TPX" (1 Oct 2025). URLs under
   usga.org/content/dam/usga/…/equipment-standards/. **Fetch-refused** (403;
   the mirror host does not resolve).
   - Why: 24 ITR conditions and baseline C_L and C_D for 17 current balls in
     two orientations **[S]**. The most current multi-ball coefficient set in
     existence, and it shows whether any condition reaches Re < 8e4.
4. **Lieberman, B. B. (1990).** "Estimating lift and drag coefficients from
   golf ball trajectories." *Science and Golf I* (Cochran ed.), E & FN Spon,
   pp. 187–192. **Zagarola, M. V., Lieberman, B. B. & Smits, A. J. (1994).**
   "An indoor testing range to measure the aerodynamic performance of golf
   balls." *Science and Golf II*, pp. 348–354. Paywalled; titles **[S]** via
   Watanabe 2016 and the USGA ITR patent.
   - Why: trajectory-derived coefficients and the ITR's low-speed limits.
5. **Naruo, T. & Mizota, T. (2014).** "The influence of golf ball dimples on
   aerodynamic characteristics." *Procedia Engineering* 72:780–785,
   doi:10.1016/j.proeng.2014.06.132. Open access; **fetch-refused**.
   - Why: probably the full version of L4's low-speed lift collapse, with
     better figures.
6. **Aoki, K., Muto, K. & Okanaga, H. (2010).** *Procedia Eng.*
   2(2):2431–2436, doi:10.1016/j.proeng.2010.04.011. Open access;
   **fetch-refused** (round 1 too).
   - Why: rotating-ball C_L and C_D and a flight simulation. Moriyama 2023
     shows it at Re 1.27e5; its low-Re content is unknown.
7. **Mizota, T., Naruo, T., Shimozono, H., Zdravkovich, M. & Sato, F. (2002).**
   "3-dimensional trajectory analysis of golf balls." *Science and Golf IV*,
   pp. 349–358. Plus **Mizota, Park, Naruo & Fukamachi (2008)**, Proc. Symp.
   Wind Engineering 18:281–286, and **Naruo & Mizota (2007)**, *Impact of
   Technology on Sport II*, doi:10.1201/9781439828427.ch30. Paywalled or
   Japanese society proceedings.
   - Why: full 3-D flights with measured landing points and a field wind
     profile — the nearest academic full-trajectory checks.
8. **Kim, J. & Choi, H. (2014).** "Aerodynamics of a golf ball with grooves."
   *Proc. IMechE P* 228(4):233–241, doi:10.1177/1754337114543860 (DOI from a
   search summary, not resolved). Paywalled.
   - Why: tunnel C_L and C_D for dimpled reference balls to spin ratio 0.5,
     with the low-Re end of the drag crisis.
9. **Aoki, K., Ohike, A., Yamaguchi, K. & Nakayama, Y. (2003).** "Flying
   characteristics and flow pattern of a sphere with dimples." *J.
   Visualization* 6(1):67–76, doi:10.1007/BF03180966. Closed.
   - Why: a load-cell spin sweep versus dimple depth and number.
10. **Bearman, P. W. & Harvey, J. K. (1976).** "Golf ball aerodynamics."
    *Aeronaut. Q.* 27:112–122, doi:10.1017/S0001925900007575. Paywalled.
    - Why: the original tables. Round 1 digitised two reproductions, which
      disagree by ≈ 1e4 in Re; the originals are the only high-S/low-Re lift
      data until (1) is read.
11. **Davies, J. M. (1949).** "The aerodynamics of golf balls." *J. Appl.
    Phys.* 20(9):821–828, doi:10.1063/1.1698540. Paywalled.
    - Why: lift inferred from the drift of spinning balls dropped through a
      tunnel (method **[S]**, Li 2017 via search). The speeds and spins are
      unverified here; recalled as ≈ 105 ft/s and up to ≈ 8,000 rpm, which
      would be Re ≈ 9e4 and S to ≈ 0.55. Old, but a direct high-S measurement.
12. **Quintavalla, S. J. (2002).** "A generally applicable model for the
    aerodynamic behavior of golf balls." *Science and Golf IV*, pp. 341–348
    (pages per Ferguson 2022). Paywalled.
    - Why: the USGA model form, with its stated limits.
13. Theses, existence unverified:
    - Spencer Ferguson's MASc (Univ. of Waterloo, c. 2023): the L3 data set in
      full, possibly per-shot.
    - Sugiyama (2015), Ibaraki Univ. MSc, ch. 4: Dunlop TrackMan coefficient
      histories (L2).

Not worth chasing: Robinson & Robinson 2013 (dimensionally wrong, round 1),
and Nike US 8,550,940 (no values).

## 9 Gaps

1. **Is the late-flight lift fall in radar data physical?** No still-air
   full-flight measurement exists. Polara and TrackMan show C_L falling
   18–52 % in the descent (§4.1). It could be physics (history dependence in
   the crisis band), wind, model completion, or fitting. Settling it would
   take:
   - a calm-air or indoor long-range radar or camera track with raw positions
     published; or
   - a tunnel run that decelerates the airspeed through Re 9e4 → 6e4 at
     fixed spin, compared with fixed-speed runs (hysteresis).

   Nothing like either was found.
2. **Modern balls at Re < 7e4 and S > 0.39** are still unmeasured in public
   (§7), and that is where short-iron and wedge descents end.
   - The two data sets nearest the box disagree by 0.3 in C_L at Re 6e4 /
     S 0.28, both on a Pro V1: Polara's c. 2008 tunnel ball and WSU's
     2017-era free-flight ball.
   - Smits & Smith 1994 is the one known source to cover it (§8 item 1).
3. **No raw in-flight deceleration.** BC histories exist only as
   radar-fitted coefficient curves (§3). No source publishes speed vs time
   for a golf shot, or a landing speed.
4. **Spin decay at wedge S (0.6–1.3) in flight.** The highest-S in-flight
   data are the Pro V1x 8-iron (S to ≈ 0.6, estimated). Naruo's tunnel torque
   law predicts 2.8–5.4× faster decay at S 0.76–1.0, which no flight data confirm
   or refute.
5. **Land angle with known launch, independent of a vendor model** —
   unchanged from round 1.
   - Ferguson 2022 has radar carry and apex but no land angle.
   - Acushnet's impact angles are probably simulated.
   - Golf Digest's descent angles come from an unnamed launch monitor.
6. **Ball generation.** The new low-Re lift data are all for c. 2005–2014
   designs (Pro V1 2008–10, Skyway SD432, Mizuno and Aero-X prototypes),
   except WSU's 2017–2020 balls. How current urethane tour balls behave at
   Re 5–7e4 and high S is not public. The USGA 2028 ITR set (§8 item 3)
   might help, if its conditions reach low enough Re.
7. **What I could not verify:**
   - The Polara tunnel's operator, air state and ν. I derived S for the
     in-flight curves with ν 1.55e-5 assumed.
   - Whether Acushnet's Table 5 is measured.
   - The launch conditions behind the Pro V1x spin-decay figures.
   - The Kim & Choi DOI, taken from a search summary.
   - Everything listed in §8.
   - All Polara and Watanabe numbers are visual reads of figures: ±0.005 in
     C_L and C_D for the patent curves, ±0.01–0.02 for the JSME figures.
