# aero-data notes — verified facts (append-only)

Format: claim — source (URL or file:line) — date verified — P/S/D.

## Lyu, Kensrud & Smith (2020) "The reverse Magnus effect in golf balls", Sports Engineering 23:3

- Source: doi:10.1007/s12283-020-0318-1, CC BY 4.0, PDF https://link.springer.com/content/pdf/10.1007/s12283-020-0318-1.pdf
  (downloaded 2026-10-09, read in full). PRIMARY.
- [P] Method: 3 commercial balls (Titleist Pro V1 352 circular dimples; Callaway ChromeSoft 332 hexagonal; Bridgestone
  B330-RX 330 dual) projected nearly horizontally in still lab air by a pneumatic pitching machine (up to Re 25e4, 3000 rpm);
  speed + position at 3 light-gate stations (gates 2-3 3.81 m apart); spin verified by 2000 fps video (+-15 rpm). (p.2-3)
- [P] Uncertainty (p.4 Sec 3): instrument CD 0.005, CL 0.0005; random (13 balls x 8 speeds x 4 shots = 416 tests, 30-70 m/s,
  2250 rpm) mean SD 0.02 CD and 0.01 CL. Lift zero calibrated with vertical-spin-axis shots to 0.00+-0.01.
- [P] Fig 3 (p.4): CD and CL vs Re for the three balls at 2250+-250 rpm; "S=0.21 when Re=6.5e4". Each point = mean of 4 shots.
- [P] Text p.4: "reverse Magnus effect was observed for all three ball models when Re=6.5e4"; for V1 "When Re>7e4, the lift
  coefficient increased steadily with spin rate. When Re<7e4 ... Positive lift decreased with decreasing speed until becoming
  negative when Re=6e4 and 0.1<S<0.23 (based on the trend line). Positive lift reoccurred when Re<=5e4."
- [P] p.5: at Re 6.5e4 negative CL over 0.09<s<0.15 (V1), 0.07<s<0.19 (BS), 0.08<s<0.21 (CA). Min CL -0.1 (V1, circular) to
  -0.15 (CA, hexagonal) (abstract). V1 CD 0.5 -> 0.2 between Re 5e4 and 7.5e4 (p.5).
- [P] p.6: "Although the reverse Magnus effect is not common in long golf drives (due to the low speed and spin rate where
  it occurs), it may still occur near the green during short chip shots." Summary: "occurred at relatively low speeds for golf
  balls, minimizing its effect on play."
- [D] Digitized by vector extraction (PyMuPDF get_drawings marker centres, axis calibrated from tick-label centres;
  digitization error < 0.002 in CD/CL, far below the 0.01-0.02 shot SD). Rows in aero-data.csv tagged "Lyu2020 ... Fig3/4/5/7a".
- [D] Fig 3 values (CD / CL; S derived as 0.21*6.5e4/Re assuming constant 2250 rpm):
  Re~5.0e4 (S 0.27): CD 0.46-0.49, CL +0.08..+0.14 | Re~6.2-6.3e4 (S 0.22): CD 0.32-0.38, CL -0.02..-0.09 |
  Re~7.5e4 (S 0.18): CD 0.25-0.27, CL 0.14-0.22 | Re 1.0e5 (S 0.14): CD 0.21-0.24, CL 0.14-0.19 |
  Re 1.25e5 (S 0.11): CD 0.18-0.21, CL 0.165-0.18 | Re 1.5e5 (S 0.09): CD 0.16-0.19, CL 0.12-0.16 |
  Re 1.75e5 (S 0.08): CD 0.19-0.21, CL 0.12-0.13 | Re 2.0e5 (S 0.07): CD 0.20, CL 0.13.
  => CD has a shallow minimum ~0.16-0.19 near Re 1.25-1.5e5 then rises slightly to ~0.20 by 2e5.
- [D] Fig 4 (V1, CL vs S by Re class): Re 75k: CL rises ~linearly 0.07 (S 0.06) -> 0.20 (S 0.20) -> 0.31-0.34 (S 0.26-0.34).
  Re 70k: CL suppressed at low S (0.00-0.06 for S 0.05-0.12) then steep rise to 0.17-0.19 at S 0.22 and 0.30 at S 0.33-0.35.
  Re 60k: CL 0.08 at S 0.056 falling to -0.09 at S 0.18, back to +0.09 at S 0.28. Re 50k: CL 0.07-0.15 for S 0.075-0.16,
  dips to ~0 at S 0.24-0.27, back to 0.11-0.15 at S 0.36.
- [D] Fig 7a (crisis-region CD, spin not stated): CD ~0.42-0.44 at Re 5.2-5.6e4 falling to 0.25-0.27 by Re 7.0-7.5e4 for all
  three balls.

## Lyu, Kensrud, Smith & Tosaya (2018) "Aerodynamics of Golf Balls in Still Air", Proceedings 2(6):238

- Source: doi:10.3390/proceedings2060238, CC BY 4.0; PDF https://mdpi-res.com/d_attachment/proceedings/proceedings-02-00238/article_deploy/proceedings-02-00238.pdf
  (downloaded 2026-10-09, read in full). PRIMARY. (Prior 2026-10-08 notes in docs/research/aero-model.md.notes.md:31-48 already
  hold its fits; re-verified here.)
- [P] 13 production balls, 18-91 m/s, 1500-4500 rpm, light gates 3.81-5.08 m apart; 2 balls x 3 shots per speed, averages of 6.
- [P] Sec 3.2 p.4: "To avoid the influence of the reverse Magnus effect at low speed [7], balls were projected from 32 m/s to
  91 m/s with spin from 1500 rpm to 4500 rpm" for the lift data. => the published lift fit excludes Re < ~9e4.
- [P] Sec 3.1.1: non-spinning CD ~0.5 at Re 5e4, ~0.2 at Re 1e5; largest ball-to-ball spread at Re < 7.5e4.
- [P] Sec 3.1.2: spinning balls (1500-2500 rpm) show a drag crisis similar to non-rotating.
- [D] Figures are RASTER (194-220 ppi); digitized visually after 2-3x upscaling: Fig 3a 13-ball non-spinning average CD
  0.477 (Re 5e4), 0.302 (7.5e4), 0.215 (1e5), 0.205 (1.26e5), 0.196 (1.5e5), ~0.199 (1.75-2.2e5), 0.21 (2.5e5).
  Fig 3b KK spinning: 0.525 (5.1e4), 0.41 (6.3e4), 0.263 (7.6e4), 0.203 (9.9e4), 0.18 (1.24e5), 0.187 (1.46e5), 0.196 (1.68e5).
  Fig 4a 13-ball CL clusters: S 0.045 -> 0.10; 0.075 -> 0.13; 0.105 -> 0.17; 0.185 -> 0.25; 0.32 -> 0.315 (ball spread +-0.02-0.03).
  Uncertainty: CD +-0.01, CL +-0.015, S +-0.01, Re +-3%.

## USGA Indoor Test Range patent: US 6,186,002 B1 (Lieberman, Smits, Quintavalla, Thomas, Winfield; assignee USGA)

- Source: https://patents.google.com/patent/US6186002B1/en (HTML downloaded 2026-10-09; filed 1998-04-21, granted 2001-02-13). PRIMARY
  for the USGA ITR method and its example dataset.
- [P] ITR ~70 ft long; ballistic light screens; "The angular velocity does not significantly change down the 70 foot ITR".
  Table 2 test conditions: 250 ft/s at 46 and 23 rev/s; 200 ft/s at 36 rev/s; 150 ft/s at 47 and 27 rev/s; 100 ft/s at 43 and
  19 rev/s (7 conditions). Six balls fired once each per condition stated sufficient.
- [P] Regression families (Re in units of 1e5, SR = omega R / V, Re = 2VR/nu):
  CD = A + B*SR^2 + C*Re + D*SR ;  CL = A + B*SR + C*Re^-2 + D*SR^2  (models 1-4 are subsets).
- [P] Patent text (via WebFetch summary, 2026-10-09): R^2 below 0.9 suggests the ball "exhibits negative lift", where drag rises
  greatly and lift drops toward zero or below. (Paraphrase from fetch tool; NOT re-read verbatim — treat as [S] until quoted.)
- [P] Example REG.BAS input: 42 rows "TEST_BALL, Re/1e5 SR CD CL" (extracted verbatim by regex into aero-data.csv). Condition
  means (n=6 each) [D]: Re 8.1e4 SR 0.097: CD 0.223 CL 0.146 | Re 8.1e4 SR 0.218: CD 0.305 CL 0.278 |
  Re 1.23e5 SR 0.153: CD 0.256 CL 0.214 | Re 1.25e5 SR 0.088: CD 0.226 CL 0.146 | Re 1.61e5 SR 0.090: CD 0.234 CL 0.151 |
  Re 2.0e5 SR 0.092: CD 0.241 CL 0.153 | Re 1.98e5 SR 0.044: CD 0.231 CL 0.115. Shot-to-shot SD 0.0003-0.006.
  Ball identity not given ("TEST_BALL", late-1990s). Shot scatter suggests real measurements, but the patent presents them as
  an example input; treat as "example ITR data, ball unknown".
- [P] Example fit output (Re in 1e5): CL MODEL 3: 0.0860, 0.6463, -0.0122, 1.4789 (R^2 0.9946);
  CD MODEL 3: 0.2028, 2.8466, 0.0165, -0.2159 (R^2 0.9847) in the order (A, B, C, D) of the forms above.
  [D] Check: CL3 at SR 0.218, Re 0.812 = 0.279 (data 0.278); at SR 0.044, Re 1.98 = 0.114 (data 0.115).
- [D] Key reading: at SR ~0.09 CL is flat in Re over 8.1e4-2.0e5 (0.145, 0.146, 0.151, 0.153); CD rises gently with Re
  (0.223 -> 0.241). The CL Re^-2 term (-0.0122) gives -0.019 at Re 8.1e4 and would give -0.034 at 6e4, -0.049 at 5e4 if
  extrapolated (outside data). Lowest ITR test speed 100 ft/s => Re ~8.1e4 (75 F): the USGA protocol does not sample the
  Re 5-7e4 reverse-Magnus band.
- [P] Spin decay used in the patent's trajectory program: domega/dt = SRD*omega*|V|/r with SRD = -0.00002 (same as Smits & Smith).
- [P] VERBATIM (US6186002B1 description, verified by local text search 2026-10-09): "Some balls exhibit a phenomenon at low speeds
  and spin rates called “negative lift.” This phenomenon ... is where the drag coefficient greatly increases and the lift
  coefficient decreases close to zero or even goes negative. The above equations are not adequate to model that behavior."
  and "When the R 2 values for the curve fits are less than 0.9, the ball probably exhibits negative lift."
  "The seven data points as shown in Table 2 represent a variety of speeds and spin rates that occur during a typical trajectory."

## Spin decay sources

- [S] Smits & Smith (1994, wind tunnel) and Tavares, Shannon & Melvin (1999, radar) — both paywalled book chapters (Science and
  Golf II / III); not read. Via Nathan "The Spin Decay of a Baseball" https://baseball.physics.illinois.edu/spindown-rev1.pdf
  (read 2026-10-08 by the previous probe; see docs/research/aero-model.md.notes.md:5-20): SRD = (domega/dt) R^2/v^2 = -lambda*S,
  lambda = 2.0e-5 (Smits & Smith), 2.5e-5 (Tavares). Equivalent: domega/dt = -lambda*v*omega/R; torque form
  I domega/dt = -R rho A C_M v^2 with C_M = beta*S, beta 0.010 (Smits) / 0.012 (Tavares) => lambda scales with rho.
  Smits: SRD independent of Re at fixed S for Re (1.0-2.5)e5 (via Mehta/Nathan text in patent US11230375, previous notes:80-82).
- [D] Implied fractional rate: (1/omega) domega/dt = -lambda v / R = -(2e-5/0.02134) v = -0.094%/s per m/s
  => 6.6 %/s at 70 m/s, 3.7 %/s at 40 m/s, 2.3 %/s at 25 m/s (Smits); x1.25 for Tavares.
- [S] TrackMan "4% per second" spin decay: cited by Lyu et al. 2018 (Proceedings 2:238 Sec 3.3, ref 21 TrackMan Newsletter #7
  p.7, gavlegolf.com link now dead — fetched 2026-10-09, redirects to a golf-club homepage). VENDOR statement, not re-verified.
- [P] Acushnet US 6,286,364 B1 (Aoyama, Gobush, Pelletier, Days, Costa; filed 1999, granted 2001-09-11),
  https://patents.google.com/patent/US6286364B1/en (downloaded 2026-10-09): indoor two/three-station camera spin measurement.
  Tables I/II "spin decay rates in percentages of change of spin rate": VI 200 ft/s, 4000 rpm and VI 150 ft/s, 6000 rpm:
  wound/large liquid centre 1.1% / 2.9%; wound/small liquid centre 0.7% / 2.7%; (other set-up) solid ball 1.8% / 1.4%,
  wound/liquid centre 4.3% / 3.5%. No time base or station spacing given => cannot convert to %/s. Shows ball construction
  (internal friction) changes decay; modern solid balls decay slower than liquid-centre wound balls.

## Bridgestone Sports patents — measured low-speed lift ratio CL(Re 70k)/CL(Re 80k) at 2,000 rpm

- US 7,175,542 B2 "Multi-piece solid golf ball" (Bridgestone Sports), https://patents.google.com/patent/US7175542B2/en
  (HTML downloaded 2026-10-09, text searched locally). PRIMARY for the statements and table values; ball = patent examples.
- [P] VERBATIM: "To increase the distance traveled by a golf ball, it is regarded as desirable for the ball to have a low
  coefficient of drag CD at high velocity and a high coefficient of lift CL at low velocity." Preferred: CL at Re 70,000 and
  2,000 rpm "at least 70% of" CL at Re 80,000 and 2,000 rpm; CD at Re 180,000 and 2,520 rpm "not more than 0.225".
  "the Reynolds numbers of 80,000 and 70,000 correspond respectively to velocities of about 30 m/s and 26 m/s";
  Re 180,000 "corresponds to a ball velocity of about 66 m/s".
- [P] Method: CL, CD "from the ball on its trajectory just after it has been launched with an Ultra Ball Launcher (UBL)"
  (Automated Design Corporation) — i.e. ITR-style launched-ball measurement, not wind tunnel.
- [P] Table (examples + comparatives): "Low-velocity CL ratio" = 82 (%) for the 330-dimple pattern (all rows but one),
  65 for Comparative Example 5 (432 dimples, volume ratio 1.25); high-velocity CD 0.214 (330) / 0.215 (432).
- [D] At 2,000 rpm: S = 0.149 at 30 m/s (Re 80k), 0.172 at 26 m/s (Re 70k). A pure S-law (C_L = k S^0.4) predicts CL(70k)/CL(80k)
  = (0.172/0.149)^0.4 = 1.06; measured 0.82 and 0.65 => a speed-dependent lift loss of ~23-39% relative to an S-only law over a
  13% speed drop at ~26-30 m/s. Matches Lyu 2020 (CL collapses between Re 7.5e4 and 6.3e4) in location.
- US 7,238,121 B2 "Solid golf ball" (Bridgestone Sports), https://patents.google.com/patent/US7238121B2/en (downloaded 2026-10-09).
  [P] VERBATIM: "Making only the drag coefficient small will extend the position of the ball at the highest point of its
  trajectory, but in the low-velocity region after the highest point, the ball will drop due to insufficient lift and thus tend
  to lose carry." Claims CL >= 0.165 (pref. >= 0.170, >= 0.180) at Re 70,000 / 2,000 rpm and CD <= 0.230 at Re 180,000 /
  2,520 rpm, measured "from the ball's trajectory just after being launched with an Ultra Ball Launcher (UBL)".
  "A Reynolds number of 180,000 ... corresponds to a ball velocity of about 64 m/s, and a Reynolds number of 70,000 corresponds
  to a ball velocity of about 25 m/s."
  [P] Examples table (10 balls; 3 dimple patterns, 330/432/420/312 dimples), MEASURED:
  low-velocity (Re 70k, 2000 rpm): CD 0.228-0.233; CL 0.191 (330-dimple type I), 0.154 (432, type II), 0.159 (420, type III),
  0.161 (312); high-velocity (Re 180k, 2520 rpm): CD 0.216-0.221; CL 0.163-0.173.
  Same values repeated in US 7,201,671 B2 table (Bridgestone), https://patents.google.com/patent/US7201671B2/en.
  [D] S at 2000 rpm, 25 m/s = 0.179; at 2520 rpm, 64 m/s = 0.088. An S^0.4 law from the 180k point (CL 0.166 at S 0.088)
  predicts 0.221 at S 0.179; measured 0.154-0.191 => 14-30% below the S-only law at Re 70k.
  Note CD at Re 70k with 2000 rpm is only 0.23 (no drag-crisis rise for these balls at 25 m/s with spin).
- US 8,021,249 B2 "Two-piece solid golf ball" (Bridgestone), https://patents.google.com/patent/US8021249B2/en (downloaded
  2026-10-09). [P] CL(Re 70k, 2000 rpm)/CL(Re 80k, 2000 rpm) measured with UBL: 85, 85, 85, 80, 78, 65, 75, 85 (%) for 8 balls
  (392/344/330/368/360 dimples). Prefers >= 60%.
- Summary [D]: across 3 Bridgestone patents, measured low-velocity CL ratio (70k/80k at 2000 rpm) = 65-85% (median ~82%).
  The S-only expectation is ~106%. So between ~30 and ~26 m/s at ~2000 rpm, lift falls 20-40% below an S-only law.

## Sumitomo EP 4 218 964 A1 (2023) — USGA model with ITR coefficients balloons

- https://data.epo.org/publication-server/rest/v1.2/patents/EP4218964NWA1/document.html (downloaded 2026-10-09). PRIMARY.
- [P] [0036] CD, CL "measured under 15 conditions specified in an indoor test range (ITR)" (USGA); trajectory by the USGA program
  (Quintavalla 2002 model) at 260 ft/s, 15.0 deg, 3000 rpm. [0037] vector angle A = atan(Vy/Vx) per 0.1 s; Amax = max over flight.
- [P] Tables: Amax 18.93-20.60 deg for 19 balls incl. "Commercially available golf balls" (Comparative Examples 3-16:
  Amax 18.93-20.20). Flight distance column is a separate robot test (H#3 hybrid, 41.5 m/s head speed, total distance).
- [D] i.e. the USGA trajectory model fed with USGA-ITR-measured coefficients makes the flight-path angle rise 3.9-5.6 deg above
  a 15 deg launch for commercial balls — ballooning is standard in that model too (MODEL output, not a measured trajectory).

## TrackMan parameter definitions (vendor, primary)

- https://support.trackmangolf.com/hc/en-us/articles/5089892383515-TrackMan-Data-Parameter-Definitions (WebFetch 2026-10-09):
  Landing Angle "The angle the golf ball lands at relative to the horizon and at a point that has the same elevation as where it
  was launched." Height "measured relative to the elevation at which the golf ball was launched." Total: "its calculated resting
  position". "Last Data": "Last measurement of ball flight." Page does not say whether Carry/Landing Angle/Height are measured
  or modelled. [D] Because land angle and carry are defined at launch elevation, any shot landing above/below the tee must be
  extrapolated or interpolated by TrackMan's trajectory model for those two numbers.

## Camera-tracked range trajectories (pointer)

- Jansson, A. (2017) "Predicting trajectories of golf balls using recurrent neural networks", MSc KTH,
  https://www.diva-portal.org/smash/get/diva2:1118598/FULLTEXT01.pdf (read 2026-10-09, sections 2.2, 4.2-4.3): stereo-camera
  3-D positions from 5 outdoor driving ranges (25-29.97 fps), 15,000/1,000/3,000 train/val/test per site, filtered to >=85%
  tracked; company not named. Physical model fitted per shot (C_D, C_L, spin, v0 by RANSAC) but NO fitted values reported.
  Pointer only: commercial camera tracking can measure full trajectories; no public aero results.

## Derived fits over the digitized/tabulated data (THROWAWAY script $TMPDIR/aero-data/scripts/fit_cl.py, run 2026-10-09) [D]

- Supercritical band Re >= 7.5e4 (USGA ITR example 42 rows, Bridgestone 180k rows, Lyu 2020 Fig 3/4 incl. Re-75k class,
  Lyu 2018 Fig 4a clusters): n=81, S 0.042-0.335:
  CL = 0.0650 + 0.8524 S + 0.0180 S^2 (rms 0.024)  ~=  0.065 + 0.85 S ; power law CL = 0.580 S^0.580 (rms 0.026).
  Smits & Smith CL = 0.54 S^0.4 against the same points: mean bias +0.058, rms 0.064 (too high at low S: 0.206 vs 0.142 at S 0.09).
  CD = 0.2204 - 0.2706 S + 2.9971 S^2 (rms 0.020, n=69, S 0-0.22).
- Low-Re points (Lyu 2020 Fig 3/4/5 + Bridgestone 70k), ratio of measured CL to the supercritical fit at the same S:
  Re~50k: 0.72 (S<0.12), 0.56 (0.12-0.2), 0.19 (0.2-0.28), 0.30 (0.28-0.36);
  Re~60k: 0.26, -0.31, -0.06, 0.30;  Re~65k: -0.20, -0.13, 0.32, 0.63;  Re~70k: 0.34, 0.63, 0.76, 0.85; Re~74.5k: 0.71.
- Speed of Re 7.5e4 at sea level, 25 C (nu = 1.85e-5/1.184 = 1.5625e-5 m^2/s, D 42.67 mm): 27.5 m/s; Re 6.0e4 at 22.0 m/s;
  Re 5.0e4 at 18.3 m/s. At 7,800 ft with the same temperature (rho ratio ~0.75 by pressure), nu x1.33 => Re 7.5e4 at ~36.6 m/s.
- [P] Acushnet US 7,591,742 B2 "Multilayer golf ball" (Sullivan, Ladd, Hebert, Boehm; filed 2008-11-21, published
  2009-09-22), https://patents.google.com/patent/US7591742B2/en (downloaded 2026-10-09). VERBATIM: "Golf ball spin rate decay
  measurements were taken on shots hit by a skilled human golfer ... Data was acquired by means of a “Trackman”, a proprietary
  phased array radar golf ball tracking device ... Trackman provides continual real-time measurements of golf ball spin rate
  throughout the ball's flight." Driver shots; regression slopes of spin vs time (units not stated; presumably rpm/s):
  Titleist Professional (wound, liquid centre): first 0.4 s -186.83, whole flight -87.304;
  Titleist Tour Balata (wound): -340.18 / -131.15;  Titleist Pro V1x (solid): -65.108 / -75.11.
  Initial spins only in figures (not read). Same text in sibling patents US 8,926,452 / 9,199,129.
  [D] For a ~2,500-3,000 rpm driver, -75 rpm/s over the whole flight = ~2.5-3.0 %/s average; a ~6 s flight loses ~15-18%.
  Smits & Smith lambda=2e-5 gives 6.6 %/s at 70 m/s falling to ~2.5 %/s at 27 m/s => ~4 %/s average, ~100+ rpm/s for 2,700 rpm.
  => radar-measured decay of a modern solid ball is at or below the Smits law (one ball, one golfer, no uncertainty stated).
  The radar spin measurement is a vendor MEASUREMENT (not TrackMan's flight model).

## Bearman & Harvey 1976 and Aoki 2010 — via Crabill, Witherden & Jameson (arXiv 1806.00378, Sports Eng. 2019) Fig 6

- PDF https://arxiv.org/pdf/1806.00378 (downloaded 2026-10-09). Fig 6 is a raster (640x480); rendered page 10 at 300 dpi,
  digitized by colour-blob centroids (6a) and colour-trace of curves (6b), axes calibrated on gridlines. SECONDARY
  (Crabill's replot of the original data; replot fidelity unknown).
- [S] Fig 6b "Bearman & Harvey" conventional ball vs spin rate (Re not stated on the figure; B&H report Re-independence for
  1.26e5-2.38e5): CL 0.081 (S 0.02), 0.111 (0.05), 0.144 (0.10), 0.177 (0.15), 0.211 (0.20), 0.2465 (0.25), 0.2755 (0.30),
  0.281 (0.31); CD 0.265 (0.02), 0.264 (0.05), 0.267 (0.10), 0.283 (0.15), 0.299 (0.20), 0.3125 (0.25), 0.320 (0.28).
  Crabill text p.11 confirms: "estimated CD for a conventional golf ball at a nondimensional spin rate of .15 would be about .28,
  or 8% higher than that of a static golf ball, with a lift coefficient of about .18".
  [D] B&H CL(S) is close to the modern-ball supercritical fit 0.065+0.85S at S 0.1-0.2 (0.144 vs 0.150; 0.211 vs 0.235) and
  B&H CD is ~0.04-0.05 higher than modern balls at low S (scaled 1970s model, deeper dimples k/d 9e-3).
- [S] Fig 6a B&H CD vs Re (spin condition not stated): 0.491 (4.1e4), 0.353 (4.8e4), 0.249 (6.1e4), 0.248-0.251 (0.8-0.96e5),
  0.255-0.258 (1.24-1.78e5), 0.262 (2.06e5), 0.266 (2.39e5) — crisis complete by ~6e4.
- [S] Fig 6a Aoki 2010 (Exp., 328 circular-arc dimples; presumably non-rotating): 0.45 (3.6-4.2e4), 0.416 (4.9e4), 0.333 (5.2e4),
  0.285 (5.5e4), 0.273 (5.9e4), ~0.24 (0.65-1.3e5, min ~0.233 near 0.95e5), then rising 0.249 (1.41e5) -> 0.28-0.30 (1.56-1.6e5).
  Aoki 2010 itself NOT read (ScienceDirect 403 to curl and WebFetch, 2026-10-09); its lift data unseen.

## Independent trajectory measurements — search log (2026-10-09)

- [P] TrackMan Baseball support "Basics | How the Unit Calculates Carry Distance"
  https://support.trackmanbaseball.com/hc/en-us/articles/47858440769435-Basics-How-the-Unit-Calculates-Carry-Distance
  (WebFetch 2026-10-09): "The radar follows the ball as long as possible, then physics-based trajectory modeling is applied to
  estimate the full flight path and determine where the ball would land." (baseball product of the same company; golf support
  page "Parameters | Last Data (Tee to Green)" https://support.trackmangolf.com/hc/en-us/articles/39727222647963 says only
  "Last measurement of ball flight" and indoors the ball "is only tracked until it hits the screen".) => for golf the
  tracked-vs-modelled split for land angle is NOT documented publicly; [D] the launch-elevation definition forces modelling
  whenever terrain differs.
- Searches (6 queries: radar/stereo-camera full-flight measurement, TrackMan carry validation vs surveyed landing, ShotLink
  landing angle, academic theses): found NO peer-reviewed or academic dataset of measured golf-ball descent angle, apex and
  carry independent of a vendor model. Found only: launch-monitor reliability studies using TrackMan as reference (e.g. Bishop
  et al. 2023 J Sports Sci 41(23):2138, indoor TrackMan 4 reliability; Mevo+ validity vs TrackMan 4) — not trajectory truth;
  KTH 2017 MSc (commercial stereo-camera range data, no aero/land-angle results); Brno thesis (indoor stereo simulator).
- PGA Tour/TrackMan agreement (golfbusinessnews.com, 2011 extension, via search excerpt): TrackMan data collected at events
  include "Shot Trajectory, Carry Distance, Ball Landing Position, Ball Speed, Launch Angle, Spin Rate..." [S].

## Altitude evidence independent of TrackMan's model (2026-10-09)

- [P] Arccos "Annual Driving Distance Report 2026 Edition" (released 2026-05), PDF
  https://uploads.mygolfspy.com/uploads/2026/05/ArccosDrivingDistanceReport_2026Edition.pdf (downloaded 2026-10-09, text read).
  Method p.5: random sample of 37,000+ golfers (>=100 driver tee shots each), ~10,000,000 on-course driver tee shots on par 4/5,
  "Driving distance reflects total yardage (carry plus rollout)", "not normalized for external factors such as weather, altitude,
  or turf conditions". p.16: "Using a 10-handicap golfer as a representative data point, Arccos data shows an average of 220.5
  yards at sea level and 239.7 yards at 5,000+ feet – a difference of 19.2 yards, or approximately 8.3%."
  [D] 239.7/220.5 = +8.7% (the report's 8.3% is 19.2/~231). Measured by GPS shot detection (sensor + GPS), TOTAL distance,
  amateurs (~95 mph club speed implied), uncontrolled for course/weather/player mix. Independent of any launch-monitor model.
  The 2021 Arccos report (via MyGolfSpy search excerpt, [S]): "13 to 30 yards" sea level -> 5,000+ ft, more for longer hitters.
- [S] USGA "Golf Course Effects on Hitting Distance" (2023, Distance Insights research), https://digital-pd.usga.org/content/dam/
  usga/pdf/2023/Golf-Course-Distance-Effects-Final.pdf — 403 to curl and WebFetch (2026-10-09). A search-engine summary says it
  used PGA TOUR ShotLink 2015-2020 and reports "a course elevation coefficient of 0.00427" (units not seen). NOT VERIFIED.
  If it is yards of driving distance per foot, that is ~4.3 yd/1,000 ft (~1.4%/1,000 ft of ~295 yd) — unverified guess.
- [S] USGA R22-09 "Impact of Course Setup on Scoring and Driving Distance on the PGA TOUR" (2022) — 403; search summary says it
  covers rough height / fairway width; no altitude result seen.
- Earlier altitude sources (player planning yardages, Padjen/TrackMan, Aoyama formula, ShotLink Montreux 2011) are already in
  docs/research/reference-data.md.notes.md (lines ~8-107); not repeated here.

## Future-3-D pointers (search-level only, 2026-10-09) [S]

- Tsilingiris, P.T. (2008) "Thermophysical and transport properties of humid air at temperature range between 0 and 100 C",
  Energy Conversion and Management 49(5):1098-1110, doi:10.1016/j.enconman.2007.09.015 (citation via search results; not read).
  Same author 2018 reassessment, Renewable and Sustainable Energy Reviews 83:50-63 (IDEAS record), RH-step correlations.
- Naruo, T. & Mizota, T. (2008) "The influence of wind trajectory of golf ball under various initial conditions", The Impact of
  Technology on Sport II, Taylor & Francis, pp. 223-227 (record https://lida.sport-iat.de/twm/Record/3044663, abstract via
  WebFetch summary): wind-tunnel forces AND torque on golf balls; log-law ABL wind verified by field measurement; predicted vs
  measured landing points of a professional's shots "agreed". Not read.
- US 11,361,132 "System and method for using weather applied metrics for predicting the flight of a ball" (search excerpt):
  canopy layer, effective canopy height where wind ~0 at 0.5-0.8 of canopy height. Not read.
- Wet-ball aerodynamics: search found no study (only US 8,393,979 hydrophilic coating patent). Gap.

## Kensrud (2010) WSU MS thesis — and its reproduction of Bearman & Harvey's CL/CD-vs-rpm figures

- Source: J. R. Kensrud, "Determining aerodynamic properties of sports balls in situ", MS thesis, Washington State Univ., 2010
  (supervisor L. V. Smith). Record https://rex.libraries.wsu.edu/esploro/outputs/graduate/Determining-aerodynamic-properties-of-sports-balls/99900525114301842 ;
  PDF https://rex.libraries.wsu.edu/view/pdfCoverPage?instCode=01ALLIANCE_WSU&filePid=13338217210001842&download=true
  (downloaded 2026-10-09, open access). PRIMARY for Kensrud's own results.
- [P] Sec 4.8.7 (p.87): golf ball "analyzed with no spin. Of all sports balls the golf ball produced the most severe drag crisis
  ... The drag crisis onset is far lower than any other sports ball occurring at Reynolds number 70,000. The minimum drag observed
  was 0.17. Bearman and Harvey (17) found their minimum drag on dimpled balls to be 0.23". (Golf lift NOT measured in the thesis.)
  The abstract's "Orientation and rotation of the ball reduced the drag crisis" is a general statement, not golf-specific data.
- [P] Kensrud p.30: "Davies (10) found a pronounced reverse Magnus effect during his study of golf balls" but then says Davies
  "only found this for smooth spheres" (thesis text is self-contradictory on Davies).
- [S->digitized] Kensrud Figs 2.13/2.14 (p.23) reproduce Bearman & Harvey's original figures: CL and CD of the conventional
  ball vs R.P.M. for U = 14, 21.9, 30.5, 39, 47.2, 55.5, 64, 72.8, 81.1, 89 m/s (full-scale equivalents; markers at ~0, 1050,
  1870, 2800, 3750, 4670, 6280 rpm; U = 14 drawn with open circles). Rendered at 400 dpi; gridlines located automatically
  (CL: 0 at y=1287, 0.1 per 140.5 px; CD: 0 at y=3094, 0.6 at 2279.5; rpm gridlines piecewise-linear); values read from
  vertical darkness profiles at the marker columns ($TMPDIR/aero-data/scripts/colprofile.py), curves identified by monotonic
  order in U at fixed rpm (merged runs for U >= 55.5 at low rpm left blank). Converted with r = 21.34 mm,
  Re = U*D/1.58e-5 (nu chosen so U 14..89 maps onto B&H's stated Re 0.38e5..2.38e5). Rows in aero-data.csv
  "BearmanHarvey1976 via Kensrud2010". Digitization +-0.008.
- [D] Key readings: U=14 m/s (Re ~3.8e4): CL -0.115 at S 0.17 (reverse Magnus), 0.205 (S 0.30), 0.277 (0.45), 0.392 (0.60),
  0.421 (0.75), 0.452 (1.00); CD 0.498 (S 0), 0.464, 0.366 (S 0.30), 0.40-0.41 (0.45-0.60), 0.517 (0.75), 0.544 (1.00).
  U=21.9 (Re ~5.9e4): CL 0.159 (S 0.11), 0.231 (0.19), 0.265 (0.29), 0.339 (0.38), 0.363 (0.48), 0.404 (0.64);
  CD 0.354 (S 0) -> 0.288 (0.11) -> 0.298 (0.19) -> 0.347 (0.29) -> 0.363 (0.38) -> 0.439 (0.48) -> 0.455 (0.64).
  U >= 30.5 (Re >= 8.2e4): CD at S 0 ~0.25-0.27; CL rises smoothly with S; U=39 (Re 1.05e5): CL 0.123 (S 0.06) .. 0.301 (S 0.36).
  => For this (deeper-dimpled, 1976) ball the lift-loss/reverse-Magnus band sits at Re ~4e4 (vs 6-7e4 for modern WSU balls);
  modest spin LOWERS CD at Re 5.9e4 (0.354 -> 0.288: spin trips transition); at low Re and high S (0.5-1.0) CD rises to
  0.44-0.54 and CL reaches 0.36-0.45 — the only measured data found for wedge-like S at low Re.
- [D] Discrepancy: Crabill's Fig 6a B&H CD-vs-Re points place 0.353 at Re 4.79e4 and 0.249 at 6.11e4, whereas the reproduced
  original figure gives 0.354 at U=21.9 (Re ~5.9e4 by B&H's stated range). The B&H crisis location is therefore uncertain by
  ~1e4 in Re between the two secondary renderings.

## Derived checks for section 1 (2026-10-09) [D]

- With C_L0 = 0.065 + 0.85 S: C_L0(0.172)/C_L0(0.149) = 1.102 (S^0.4 law: 1.06). Bridgestone measured 0.65 / 0.82 / 0.85
  => implied f_L(7e4)/f_L(8e4) = 0.59 / 0.74 / 0.77.
- Measured/S&S ratio: S 0.09: 0.142/0.206 = 0.69; S 0.15: 0.193/0.253 = 0.76 (cf. 2026-10-08 driver kL 0.81-0.82).
- High-S lift branch 0.32 + 0.25 (S - 0.30), cap 0.45, vs B&H: S 0.46 0.360 (B&H 0.352), 0.64 0.405 (0.404),
  0.75 0.432 (0.421), 1.0 0.45 (0.452).
- Drag branch 0.30 + 0.38 (S - 0.22) vs B&H (Re >= 8.2e4): S 0.275 0.321 (0.313), 0.297 0.329 (0.323), 0.342 0.346 (0.366),
  0.36 0.353 (0.353), 0.46 0.391 (0.391). Modern quadratic at S 0.22 = 0.306 (continuous).
- CSV validated 2026-10-09: 302 data rows, all 8 columns (Lyu2020 162, USGA 42, B&H via Kensrud 34, B&H via Crabill 22,
  Lyu2018 21, Aoki via Crabill 13, Bridgestone 8).
