# literature.md — verified findings (notes)

Each entry: claim; source (URL or file:line); date verified; P/S/D.
Appended as verified, in the order found.

## N1 — Aero-X/Polara "Low lift golf ball" US 8,202,178 B2 (granted 2012-06-19), inventors David L. Felker, Douglas C. Winfield, Rocky Lee (assignee Aero-X Golf)
Source: https://patents.google.com/patent/US8202178B2/en and PDF
https://patentimages.storage.googleapis.com/a8/fb/69/66235b2cd3b468/US8202178.pdf
(figure sheets D00005–D00009, D00017, D00018). Verified 2026-10-09. PRIMARY (patent
text and figures read directly).

- N1a [P] In-flight coefficients from radar: "a Trackman Net System consisting of 3 radar
  units was used to track the trajectory of a golf ball that was struck by a Golf Labs
  robot ... The Trackman Net System measured trajectory data (x, y, z location vs. time)
  were then used to calculate the lift coefficients (CL) and drag coefficients (CD) as a
  function of measured time-dependent quantities including Reynolds Number, Ball Spin Rate,
  and Dimensionless Spin Parameter." Range 3,000–5,000 rpm, Re 120,000–180,000; 5-term
  regression in Re and W; "Correlation coefficients of >96% were typical."
- N1b [P] Driver robot shots, TopFlite XL Straight vs B2 prototype: "initial spin rates were
  about 3,400-3,500 rpm at a Reynolds Number of about 170,000. The spin rate and Re
  conditions near the end of the trajectory were about 2,900 to 3,200 rpm at a Reynolds
  Number of about 80,000." (3-radar TrackMan Net). FIG 5 plots spin vs Re through flight.
- N1c [P] FIGS 6–9 plot CL and CD vs Re and vs flight time for those shots (smooth curves,
  two per ball; they look like fitted curves, not raw points). Digitized values: CSV rows
  tagged "Polara US8202178 Fig6/7/8/9".
- N1d [P] FIG 9 text: "the CD curve for the B2 ball throughout the flight time actually has
  a negative inflection in the middle"; FIG 8: "At lower Re, the CD for the B2 ball is
  significantly less than that of the TopFlite XL Straight." B2 "impacts the ground at a
  shallower angle" because of lower CL.
- N1e [P] Wind tunnel, spindle 1/16 in, CL vs DSP 0–0.4: FIG 17 (173 prototype, Re 49,300–
  221,700) and FIG 18 (Titleist Pro V1, Re 58,900; 89,400; 109,700; 129,800; 160,100;
  195,200). Text: "as the Reynolds Number drops down to the 60,000 range ... the Pro V1
  golf ball lift remains positive while the 173 golf ball becomes negative." Tunnel
  operator not named in the text.
- N1f [P] Industry convention stated in the patent: "Re of 70,000 and spin of 2000 rpm are
  industry standard parameters for describing the end of flight ... Re ... about 180,000,
  and a spin of 3000 rpm ... the beginning of flight" (citing Ogg US 6,224,499: CL > 0.18
  at Re 70,000/2000 rpm, CD < 0.232 at Re 180,000/3000 rpm).
- N1g [D] FIG 18 digitized from the 1972x1841 sheet image (gridlines detected: S 0 at
  x=211.5, 0.40 at x=1877.5; CL 0.50 at y=181.5, −0.20 at y=1113.5; marker centres by
  connected components after grid erase; ±0.003 in S, ±0.005 in CL). Pro V1 at Re 58,900:
  CL 0.09–0.13 for S 0.04–0.16 (about 0.5–0.67 of the higher-Re cluster), rising steeply
  from S 0.17; equal to the high-Re cluster near S ≈ 0.24; ABOVE it for S ≥ 0.26 (0.40 at
  S 0.278, 0.44 at 0.317, 0.49 at 0.350 vs ≈ 0.32–0.35 for Re ≥ 89,400). Higher-Re
  curves (89,400–195,200) collapse onto one CL(S). CL → −0.05…−0.08 as S → 0 at all Re
  (offset; spindle or asymmetry), so treat absolute tunnel values with caution and use
  the low-Re/high-Re ratio.
- N1h [P/D] FIGS 5–9 read visually from sheet images (D00005–D00009, ±0.005 CL, ±0.003
  CD, ±0.1 s). Two curves per ball (pairing of spin curve to CL curve not stated).
  TopFlite XL Straight: CL 0.185–0.195 at t 0 (Re 170k) rising to a peak 0.327–0.333 at
  t 3.3–3.75 s (Re 70–75k), then FALLING to 0.25 / 0.272 by the end of the curves at
  5.05 / 5.2 s, at nearly constant Re ≈ 69k (FIG 6 shows the CL-vs-Re curves dropping
  vertically at Re 68.5–69k). B2: 0.155–0.157 at t 0, peak 0.248–0.266 at 2.75–3.0 s
  (Re 83–86k), falling to 0.198 / 0.216 at 4.4 / 4.5 s (Re 73–76k). Fall from peak:
  18–24 % (all four curves). The fall is steeper than a parabola through t 0 and the peak
  would give (TopFlite curve 2: parabola 0.311 at 5.2 s vs 0.272 plotted), so it is not
  just a quadratic-in-time fit. CD: TopFlite 0.26 at Re 170k → 0.350–0.367 at Re 80k;
  vs time peaks 0.366–0.371 at 3.2–4.2 s and eases to 0.323–0.350 at the end. B2 0.257
  → 0.320–0.330 at Re 80k; 0.333–0.372 at end. Spin (FIG 5): TopFlite 3,385–3,490 rpm at
  Re 170k → 2,800–3,000 at end; B2 3,420–3,530 → 2,750–2,860.
  [D] With ν 1.55e-5 assumed (air state not given) S = 6.15·rpm/Re: TopFlite S 0.124 →
  0.238 (Re 80k) → ≈0.26 (end); B2 0.126 → 0.227 (Re 80k) → ≈0.235 (end).
  [D] Effective ballistic coefficient m/(CD·A) (m 45.93 g, A 1.4300e-3 m²): 123.5 kg/m² at
  launch (CD 0.26) → 86.8 kg/m² at CD 0.37: −30 % through a driver flight.
  [D] Mean spin decay: TopFlite ≈ 95–115 rpm/s (2.9–3.3 %/s of launch); B2 ≈ 150 rpm/s.
  Caveat [D]: the curves are smoothed/fitted, the shots are robot drivers on a 2-piece
  distance ball and a prototype, the end of each curve is where radar data are weakest,
  and the pairing of curves is unstated. Suggestive, not conclusive, evidence of a
  late-flight lift fall at Re ≈ 7e4, S ≈ 0.23–0.26.

## N2 — Acushnet US 6,729,976 B2 "Golf ball with improved flight performance" (Bissonnette, Dalton, Aoyama; priority 1997-09-03; granted 2004-05-04)
Source: https://patents.google.com/patent/US6729976B2/en (downloaded HTML, grep'd).
Verified 2026-10-09. PRIMARY for the tables.

- N2a [P] Table 1 defines Cmag = √(CL²+CD²) and angle = atan(CL/CD) windows at 8 (Re, SR)
  pairs "that encompass the flight regime for typical golf ball trajectories": (230000,
  0.085) … (69000, 0.284). [D] Every pair has SR·Re ≈ 19,550, i.e. a FIXED spin rate
  (≈ 3,000 rpm at ν ≈ 1.5e-5), not a decaying-spin trajectory; FIG 3–4 text confirms
  "fixed spin rate of 3000 rpm".
- N2b [P] Tables 3 and 4: exact CL, CD (PP and PH orientations) for the invention ball (392
  icosahedral dimples) and an unnamed prior-art ball at those 8 pairs. Measurement method
  in the text: indoor test ranges with ballistic screens (cites US 5,682,230, 6,186,002,
  6,285,445). Rows in CSV tagged "Acushnet US6729976 Tab3/Tab4".
- N2c [P] Prior-art ball PP: CL 0.280 at (92000, 0.213) → 0.270 at (69000, 0.284), i.e. CL
  FALLS while S rises 33 %; PH orientation rises 0.253 → 0.308. Invention PP rises only
  0.264 → 0.278. [D] Against the round-1 supercritical law 0.065+0.85·S (0.246 at S 0.213,
  0.306 at S 0.284) these are ratios 1.07–1.14 at Re 92k and 0.88–1.01 at Re 69k: a low-Re
  lift shortfall of ≈ 10 % at Re 69k / S 0.284, orientation-dependent.
- N2d [P] CD at Re 69k / S 0.284: 0.305–0.337; at Re 230k / S 0.085: 0.217–0.222.
  [D] BC = m/(CD·A) (m 45.6 g for 1.61 oz; A 1.4300e-3 m²) ≈ 146 → 104 kg/m² across the
  sweep.
- N2e [P] Table 5 (carry yd / flight time s / impact angle °), 8.0° launch: 168.4 mph,
  3500 rpm: prior art PP 267.2/7.06/41.4, PH 271.0/6.77/36.2; invention 276.7/7.14/39.9
  and 277.6/7.14/39.2. 145.4 mph, 3000 rpm: prior art 220.8/5.59/31.3 and 216.9/5.18/25.4;
  invention 226.5/5.61/29.3 and 226.5/5.60/28.7. Text: "prior art golf balls exhibit
  large variations in the angle of ball impact ... about 5°, for the two orientations".
  Whether Table 5 is measured or simulated is NOT stated; identical launch conditions for
  every ball suggest simulation from the measured coefficients. [D] Either way: an
  orientation-dependent ±2.5° in land angle and ±0.15 s in flight time for one ball.

## N3 — Naruo, Mizota & Shimozono 2004, Trans. JSME B 70(697):2371–2377, doi:10.1299/kikaib.70.2371
"Aerodynamic Force Measurement of Highly Spinning Golf Ball in Uniform Flow and Trajectory
Experiment". Open access on J-STAGE:
https://www.jstage.jst.go.jp/article/kikaib1979/70/697/70_697_2371/_pdf/-char/en
(downloaded and read in full 2026-10-09). PRIMARY. First author at Mizuno R&D.

- N3a [P] Ball: Bridgestone "Skyway SD432" (commercial, 432 dimples), d 0.0427 m, m 0.0456
  kg, I = 8.10e-6 kg·m². Ball threaded on a 0.5 mm piano wire at 100 N tension, spun by DC
  motor to 167 rps (10,000 rpm); open-jet tunnel 25–44 m/s, turbulence < 0.1 %; air-bearing
  force balance; wire-only forces subtracted. Sp = πdN/U (= ωr/U = S).
- N3b [P] "Sp 0.03–1.13", "Re 7.09×10⁴–1.25×10⁵": CD and CL "fall on almost one curve" —
  independent of Re (Figs 4, 5; Re 7.09e4, 8.51e4, 9.93e4, 1.13e5, 1.25e5). Fits:
  CD(Sp) = 0.7510Sp⁴ − 1.760Sp³ + 1.098Sp² + 0.2148Sp + 0.2049  (eq 12)
  CL(Sp) = −0.2158Sp⁴ + 1.006Sp³ − 1.644Sp² + 1.250Sp + 0.0616  (eq 13)
  [D] evaluated: S 0.1 → CD 0.236, CL 0.171; 0.2 → 0.279, 0.254; 0.3 → 0.327, 0.314;
  0.5 → 0.414, 0.388; 0.76 → 0.480, 0.432; 1.0 → 0.509, 0.458. Measured CL lies ≈ 0.03–0.05
  above Bearman & Harvey's curve at S 0.1–0.3 (Fig 5 overlay).
- N3c [P] Torque: Cm = T/(0.5ρU²Ad), measured from piano-wire twist (no-wind phase
  subtracted), Re 3.8e4–2.29e5, also Re-independent: Cm(Sp) = exp(3.780Sp − 6.707) (eq 14).
  Text: Cm agrees roughly with Tavares et al. and rises with Sp; scatter is large.
  [D] Cm/(0.010·S) = 1.78 (S 0.1), 1.30 (0.2), 1.27 (0.3), 1.62 (0.5), 2.84 (0.76), 5.4
  (1.0): the torque (spin-decay) law is close to Smits & Smith / Tavares at S 0.2–0.3 and
  grows exponentially above S ≈ 0.4 — iron and wedge descents would shed spin 1.6–5× faster
  than the linear law.
- N3d [P] Fig 7 (Salford Univ. tunnel, U 35–80 m/s, Re 1.0–2.3e5, N 30–167 rps): CD and CL
  again one curve vs Sp, but this tunnel's CD read higher at Sp < 0.2 (vibration,
  turbulence 0.5 %); the authors use the §5.1–5.2 data quantitatively.
- N3e [P] Trajectory check: robot (Miyamae Shot Robo 5) launches, initial conditions from
  two CCD cameras (DLT), carry measured; Sp 0.09–0.76; calculated vs measured carry 75–260 m
  "extremely good agreement" (Fig 8; scatter ≈ ±10 m at 250 m by eye). Landing position
  only — no apex or land angle reported.
- N3f [P] Related, not obtained: Naruo & Mizota 2004, Nagare 23:203–211 (aerodynamic force
  measurement and 3-D trajectory); Mizota, Naruo, Shimozono, Zdravkovich & Sato 2002,
  Science and Golf IV pp. 349–358 ("3-Dimensional Trajectory Analysis of Golf Balls");
  Mizota, Park, Naruo & Fukamachi 2008, Proc. Symp. Wind Engineering 18:281–286 (3-D flight
  in the atmospheric boundary layer, with field experiment). Mizota 2015 RIMS Kôkyûroku
  1940:40–58 (read pp. 48–58) reproduces the 3-D landing-point comparison (X 100–210 m).

## N4 — Watanabe, Arakida & Tsuboi 2016, "Estimation of Aerodynamic Coefficients for Balls in Flight with Trajectory Data", Proc. JSME Symp. Sports & Human Dynamics 2016, A-24
https://www.jstage.jst.go.jp/article/jsmeshd/2016/0/2016_A-24/_pdf/-char/en (open; read in
full 2026-10-09). PRIMARY for the method and the plotted values; the golf data were TrackMan
shots supplied by Dunlop Sports (Sumitomo Rubber) R&D.

- N4a [P] Method: inverse problem — instantaneous CD, CL, CS from 3-D position data via
  space-curve geometry (eqs 7, 15, 16), quadratic fits over 2n+1 points (n ≥ 5 needed;
  n = 10 for CL and CS). Position data every 0.01 s.
- N4b [P] "TrackMan ... can measure ball translational velocity and spin by radar tracking,
  obtains trajectory coordinates by integrating the velocity, and can also output the drag
  and lift coefficients in flight" (translated). TrackMan's own CD/CL ("TMN") are plotted.
- N4c [P] Data 1: carry ≈ 250 m, apex ≈ 27 m, nearly planar. TMN CD 0.215 (Re 1.95e5) →
  0.25 (1.0e5) → peak 0.30 at Re ≈ 0.78e5 → 0.225 at the end; TMN CL 0.125 (1.95e5) → 0.20
  (1.2e5) → peak 0.25 at Re ≈ 0.87e5 → 0.155 at the end. After the apex Re rises slightly
  ("due to gravitational acceleration after the apex"), so the final fall happens at Re
  0.77–0.79e5. Independent estimates (n = 5, 10) agree, ending at CL 0.135–0.15. [D]
  fall from peak: CL −38 %, CD −25 %, over the descent.
- N4d [P] Data 2: hook, carry 165 m, ≈ 30 m lateral, apex ≈ 28 m. TMN CD 0.265 (1.6e5) →
  0.42 (0.8e5) → 0.475 (0.68e5) → drops to 0.25 and then 0.175 as Re climbs back to 0.8e5
  in the descent; TMN CL 0.24 → peak 0.31 (0.9e5) → 0.21 (0.66e5) → 0.15 (0.8e5, end).
  Authors: the TMN-vs-estimate gap for Data 2 is beyond parameter differences; TrackMan
  may assume a 2-D trajectory (setting y = 0 reduces the gap, per Sugiyama 2015 MSc).
- N4e [D] At the same Re (0.8e5) and similar S, ascent vs descent values differ: Data 2
  CD 0.42 vs 0.175, CL 0.30 vs 0.15; Data 1 CL ≈ 0.245 vs 0.155. A single-valued
  C(Re, S) cannot produce that. Candidate causes, not separable from the paper: (1) real
  history dependence in the drag-crisis band; (2) wind — coefficients computed from
  ground-relative velocity are biased most at low ball speed (a 3 m/s tailwind at 25 m/s
  lowers the inferred force coefficients by ≈ 23 %); (3) the late trajectory being
  TrackMan's model completion rather than radar data; (4) end-of-window fitting. Either way
  it shows what TrackMan's own trajectories (the source of the tour land angles) contain:
  lift and drag falling 25–40 % through the descent.
- N4f [P] Cites Lieberman, B. B. 1990, "Estimating lift and drag coefficients from golf
  ball trajectories", Science and Golf I, pp. 187–192 (not obtained), and Sugiyama 2015,
  Ibaraki Univ. MSc thesis ch. 4 (not obtained).

## N5 — Naruo, Michishita, Miyata, Uda, Mizota & Takita 2014, "Effect of golf ball dimples on aerodynamic characteristics (Improvement of aerodynamic and flight characteristics by a new dimple design)", Proc. JSME Symp. Sports & Human Dynamics 2014, B-29
https://www.jstage.jst.go.jp/article/jsmeshd/2014/0/2014__B-29-1_/_pdf/-char/en (free; read in
full 2026-10-09). PRIMARY. Mizuno R&D with Fukuoka Inst. Tech.

- N5a [P] Method: ball on 0.3 mm piano wire with internal miniature bearings, spun to
  200 rps by an air jet, then left to spin down in the tunnel at fixed U (44, 40, 35, 30,
  28, 25 m/s) while a 3-component load cell logs forces "continuously" — a CL-vs-Sp sweep
  with spin DECREASING in time, as in flight.
- N5b [P] Balls A and B: same 366-dimple layout, dimple depth 0.158 vs 0.123 mm. "At ≥ 30
  m/s there is almost no speed (Reynolds) dependence and the shallow-dimple Ball B has
  larger CL over the whole Sp range. Below 30 m/s Ball B shows marked speed dependence."
  Abstract: "when the depth of the dimples was much shallower, the lift coefficient was
  extremely little on the slow velocity, i.e. under 28 m/s".
- N5c [P/D] Fig 2b read visually (log Sp axis; ±0.02 CL, ±10 % Sp): Ball B at 25 m/s
  (Re ≈ 7.1e4 at ν 1.51e-5) CL ≈ 0.03–0.04 at Sp 0.07–0.18, then rising steeply (0.10 at
  0.20, 0.18 at 0.25, 0.27 at 0.30) to rejoin the ≥ 30 m/s curve near Sp 0.45–0.5; the
  ≥ 30 m/s curve is ≈ 0.20 (Sp 0.1), 0.25 (0.2), 0.31 (0.3), 0.36 (0.4). The 30 m/s
  points also sit ≈ 0.04–0.05 low at Sp 0.06–0.15.
- N5d [P] Trajectory analysis with representative male- and female-pro driver launches:
  "in both cases the ball speed drops below 30 m/s, about 28 m/s, right after the apex", so
  low-speed lift matters. Ball A vs B (female-pro launch, Fig 4): the higher-lift ball
  climbs higher (apex ≈ 37 vs 30 m) but "after the apex, where speed is below 30 m/s, it
  falls steeply" — carry ends up no longer.
- N5e [P] Balls C/D (278 large dimples 4.81 mm × 0.148 mm; C adds 252 tiny 1.24 mm dimples):
  D "clearly shows a CL drop at the 30 m/s low-speed condition"; C shows almost none. PIV/
  smoke-wire: the low-speed lift-loss ball (Ball E, like A) has an unstable, fluctuating
  wake and an earlier upper-surface separation point (≈ 113–121° vs 114–129° for C).
- N5f [D] Third independent dataset (after WSU/Lyu 2020 and Polara/Pro V1) in which a
  low-Re lift deficit at Re ≈ 7e4 shrinks with S and is gone by a ball-specific S
  (≈ 0.45–0.5 here). Whether it appears at all depends on dimple design.

## N6 — Golf Digest swing-robot driver test (2025/26), reprinted by Australian Golf Digest
https://www.australiangolfdigest.com.au/descent-angle-driver-testing-swing-robot-analysis/
(read 2026-10-09; golfdigest.com original returned 403). SECONDARY (magazine), measurement
by Golf Laboratories robot.

- N6a [S] 47 drivers (10–10.5°), 95 mph club speed, 54 shots per head, "the same Titleist
  ball throughout"; launch monitor and air conditions not named. Ball speed 134.0–138.7
  mph; carry 200.9–223.6 yd; descent 24.6–42.2°.
- N6b [S] Four heads with launch and spin printed: Callaway Elyte 136.8 mph / 11.2° /
  2,468 rpm → carry 220.9 yd, descent 33.6°; Titleist GT4 137.5 / 10.7 / 2,498 → 220.7,
  32.1°; GT3 136.9 / 10.9 / 2,402 → 219.8, 32.0°; TaylorMade Qi10 Max 137.8 / 9.9 /
  3,182 → 213.9, 34.4°.
- N6c [S] "Below 30 degrees (7 heads) ... average 5.1 yards less carry than ball speed
  predicts"; ≥ 30°: plateau, correlation 0.03.
- N6d [D] Usable as a soft, launch-monitor-derived check on an amateur-speed driver
  (carry and descent from known launch). Not independent of a vendor flight model unless
  the monitor tracked to landing, which is not stated.

## N7 — Acushnet US 8,016,695 B2 (Nardacci & Bissonnette; filed 2008-09-22, granted 2011-09-13) "Golf ball with improved flight performance"
Source: https://patents.google.com/patent/US8016695B2/en and PDF
https://patentimages.storage.googleapis.com/7d/72/be/9692b37b1469a6/US8016695.pdf (sheets 18–19,
FIGS 22–24). Verified 2026-10-09. PRIMARY.

- N7a [P] "Spin decay rates may be determined using a Trackman launch monitor ... which
  measures spin rates throughout the flight of a golf ball. FIGS. 22-24 illustrate spin
  decay results measured during the flight of a conventional golf ball, i.e., Pro V1X®".
- N7b [P] Table 6B, Pro V1x (measured): spin lost at 1 / 3 / 5 s — driver 3.1 / 8.8 /
  12.8 %; 5-iron 3.4 / 9.7 / 15.5 %; 8-iron 3.6 / 9.0 / 13.3 %. ("Anticipated" values for
  the invention ball are not measurements.) "the conventional solid construction golf ball
  yields spin decay rates of less than 4% for the first second of flight."
- N7c [P] FIGS 22–24 (read by eye, rotated plots): Pro V1x launch spin ≈ 3,400 rpm
  (driver), ≈ 6,400 (5-iron), ≈ 8,500 (8-iron); curves end ≈ 5 s (driver, ≈ 3,100 rpm —
  ≈ 9 %, below the table's 12.8 %), ≈ 4 s (5-iron, ≈ 5,600), ≈ 5.3 s (8-iron, ≈ 7,350).
  Launch speed and angle are not given.
- N7d [D] Mean rates over 5 s: ≈ 87, 198, 226 rpm/s. Against Smits & Smith (fractional rate
  λv/R, λ = 2e-5) with assumed flight-mean speeds 45 / 40 / 35 m/s, the measured 5-s
  losses are ≈ 0.65× (driver), ≈ 0.9× (5-iron), ≈ 0.85× (8-iron) of the law. Rough; it
  says the in-flight decay of a modern solid ball is at or below Smits & Smith, never
  faster — including the 8-iron, whose late-flight S (≈ 0.4–0.6) is where Naruo 2004's
  tunnel torque law (N3c) would predict 1.3–2.0× faster decay (S 0.35–0.6). The two conflict.
- N7e [P] Also states that a cover decoupled from the core by a viscous layer raises early
  spin decay — i.e. spin decay depends on construction (moment of inertia, internal
  damping), not only on aerodynamics.

## N1 (continued) — US 8,202,178 FIGS 20–24, Pro V1 in flight
- N1i [P/D] FIGS 20–24 plot the TrackMan-Net-derived 5-term regression CL(Re) at fixed
  spin 3,000/3,500/4,000/4,500/5,000 rpm over Re 120k–180k for "ProV1 random",
  "TopFlite XL Straight random" and the prototypes (read visually from the PDF render,
  ±0.003). Pro V1 at 3,000 rpm: 0.206 (Re 120k) → 0.163 (180k); at 5,000 rpm: 0.294 →
  0.210. [D] With S = πD²·rpm/(60·Re·ν), ν 1.55e-5 assumed: S 0.10–0.26. The Pro V1
  in-flight CL is +0.00 to +0.02 above the round-1 supercritical law 0.065 + 0.85·S
  (aero-data.md §1) over S 0.10–0.26, and at fixed S varies by ≤ ±0.01 across Re
  120–180k. Corroborates the round-1 law from free-flight radar data on a tour ball.
  CSV "Polara US8202178 Fig20-24".

## N8 — Derived ballistic-coefficient table [D] (script $TMPDIR/lit/scripts/bc_table.py, run 2026-10-09)
BC = m/(C_D·A) with m 45.93 g, D 42.67 mm (A 1.4300e-3 m², m/A 32.12 kg/m²);
k = ρ·C_D·A/(2m) at ρ 1.184 kg/m³, so drag deceleration = k·v². C_D inputs from N1–N5 and
aero-data.md §1/§4. Results (BC kg/m²): round-1 law 150 (S 0.05), 144 (0.10), 112 (0.20),
97 (0.30, B&H branch); Acushnet prior art 145 (Re 2.3e5/S 0.085) → 104 (PP) / 95 (PH) at
Re 6.9e4/S 0.284; Naruo 2004 fit 136 (S 0.1), 98 (0.3), 78 (0.5), 63 (1.0); Polara in
flight TopFlite 124 (launch) → 89 (Re 8e4) → 87 (peak C_D), B2 99 at Re 8e4; Watanabe/
TrackMan drive 149 → 107 (peak) → 143 (landing); hook 121 → 68 (peak); Lyu 2020 2250 rpm
69 at Re 5e4; Lyu 2018 13-ball no-spin mean 67 (Re 5e4) and 164 (Re 1.5e5).
Also: Bridgestone US 7,435,089 B2 (Sato & Kasashima, 2008) [P, form only]: CFD-based
simulation with spin decay ω = ω0·exp{−(SRD1 + SRD2·V)·t·β}, β = πρr⁴/I — a decay rate with
a speed-independent term plus one linear in V; no values given. Example inputs 70 m/s,
3,000 rpm → 60 m/s, 2,800 rpm at ≈ 1 s (illustrative). https://patents.google.com/patent/US7435089B2/en

## N9 — Citations verified (Crossref API or publisher landing pages), 2026-10-09
- Davies, J. M. (1949) "The Aerodynamics of Golf Balls", J. Appl. Phys. 20(9):821–828,
  doi:10.1063/1.1698540 [P: Crossref record]. Not read (paywalled).
- Naruo, T. & Mizota, T. (2014) "The Influence of Golf Ball Dimples on Aerodynamic
  Characteristics", Procedia Engineering 72:780–785, doi:10.1016/j.proeng.2014.06.132
  [P: Crossref]. Open access in principle; sciencedirect.com and core.ac.uk returned 403
  (fetch-refused). Moriyama & Okanaga 2023 (N10) summarise it: deep vs shallow dimples,
  low-speed (< 30 m/s) lift loss for shallow dimples, tiny dimples prevent it.
- Naruo, T. & Mizota, T. (2007) "The Influence of Wind upon 3-Dimensional Trajectory of Golf
  Ball under Various Initial Conditions", The Impact of Technology on Sport II, ch. 30,
  doi:10.1201/9781439828427.ch30 [P: Crossref] (round 1 listed it as Naruo & Mizota 2008,
  pp. 223–227).
- Aoki, K., Muto, K. & Okanaga, H. (2010) Procedia Eng. 2(2):2431–2436,
  doi:10.1016/j.proeng.2010.04.011 [P: Crossref]; still fetch-refused.
- Kim, J. & Choi, H. (2014) "Aerodynamics of a golf ball with grooves", Proc. IMechE Part P
  228(4):233–241, doi:10.1177/1754337114543860 [S: search summary of the SAGE/UNIST record;
  DOI not independently resolved]. Abstract: grooved and dimpled balls, spin ratio 0–0.5
  (APS DFD 2009 abstract), Re to the supercritical regime.
- Aoki, K., Ohike, A., Yamaguchi, K. & Nakayama, Y. (2003) "Flying characteristics and flow
  pattern of a sphere with dimples", J. Visualization 6(1):67–76, doi:10.1007/BF03180966
  [P: Unpaywall record — closed access].
- Moriyama, K. & Okanaga, H. (2023) Trans. JSME 89(924) 23-00083, doi:10.1299/transjsme.23-00083
  [P: read]; Sports Engineering 26:10 (2023), doi:10.1007/s12283-023-00400-0 [S: cited
  in the JSME paper; Springer page redirected to a login, not read].
- USGA "ITR test conditions — 2028 ODS" (March 2025) and "Overall Distance and Symmetry Test
  Protocol 4.0 TPX" (1 Oct 2025): URLs on www.usga.org (HTTP 403 to curl) and
  digital-pd.usopen.com (DNS failure). Contents known only from a search summary [S]: 24
  ITR conditions, baseline lift and drag for 17 ball types in two orientations; protocol
  4.0 fits CL, CD, Re and spin parameter for each ball, orientation and condition; 15 ITR
  settings; ball conditioning 75 °F ± 1 °F.

## N10 — Moriyama & Okanaga 2023, Trans. JSME 89(924), doi:10.1299/transjsme.23-00083
https://www.jstage.jst.go.jp/article/transjsme/89/924/89_23-00083/_pdf/-char/en (open, CC BY-NC-ND;
read 2026-10-09). PRIMARY for its own data; SECONDARY for what it reports of Naruo's work.
- [P] 110 mm 3-D-printed model balls on a 3 mm piano wire, 37 m/s, 400–2,000 rpm → Sp
  0.06–0.30 (Re ≈ 2.7e5 for the 110 mm model). Their Fig 2 overlays Aoki et al. 2010 at
  Re 1.27e5 (same dimple pattern; CD "almost identical", CL similar except at high Sp).
- [P] Cites Naruo's results (Naruo & Mizota 2014; Naruo et al. 2014): "at low speed and
  high spin, shallow dimples give a smaller CL than deep ones, speed dependence appears in
  the low-speed region below 30 m/s, and placing tiny dimples ... raises occupancy and
  prevents the CL drop in the low-speed region" (translated).
- [P] "Naruo et al. and Mizota et al. reported no Reynolds dependence above 35 m/s, so
  CD and CL can be expressed by the spin parameter" (translated).

## N11 — Ferguson, McNally & McPhee 2022, "Predicting the Flight of a Golf Ball: Comparing a Physics-Based Aerodynamic Model to a Neural Network", ISEA 2022 (Engineering of Sport 14), Purdue, doi:10.5703/1288284317493
PDF https://docs.lib.purdue.edu/cgi/viewcontent.cgi?article=1023&context=resec-isea (open; read
in full 2026-10-09). PRIMARY. Univ. of Waterloo.
- [P] 1,040 shots (521 driver, 519 woods/irons/wedges), golfers of mixed skill, 2021
  Titleist Pro V1. Launch from a GCQuad camera monitor; carry, offline and apex from a
  FlightScope X3 radar; wind < 1.3 m/s at ground level; 190 m above sea level. Median carry
  166 m. 80/20 train/test split. Launch S 0.02 (driver) to 0.75 (wedge).
- [P] S-only laws fitted (fmincon) to carry, apex and offline: CD = a + bS + cS²,
  CL = d + eS + fS², C_M = gS; g bounded 0.010–0.015. Constants {a…g} = {0.1304, 0.9287,
  −0.8259, 0.0504, 1.2031, −1.1490, 0.01}. Test MAE: carry 2.51 m (1.52 %), offline 1.54 m,
  apex 1.17 m (5.08 %).
- [D] g landed on its lower bound (0.010 = Smits & Smith): the data want spin decay no
  faster than S&S — consistent with N7. The fitted CL peaks at S = 0.524 (CL 0.365) and
  FALLS beyond (0.306 at S 0.75); CD likewise peaks near S 0.56 (0.391). In an S-only law
  fitted to whole-flight outcomes, a falling CL at high S stands in for lift lost late in
  slow, high-S iron and wedge descents — the same signature as a low-Re loss, absorbed
  into S. Evaluated: CL 0.159/0.245/0.308/0.365/0.306 and CD 0.215/0.283/0.335/0.388/0.362
  at S 0.1/0.2/0.3/0.5/0.75. CSV "Ferguson2022".
- [D] Low-S end: CL 0.159 at S 0.1 matches the round-1 law (0.150) within 0.01; CD 0.215 at
  S 0.1 matches round 1's C_D0 (0.223).

## N12 — Searches that found nothing usable (2026-10-09), recorded so they are not repeated
- "golf ball" + "ballistic coefficient": no golf source publishes a BC; only C_D.
- Direct golf hysteresis / sweep-direction tests of lift or drag: none found. Smooth-sphere
  critical-Re bistability exists ([S], J. JSASS 2019 per search summary; not read).
- In-flight golf deceleration or landing ball speed from radar, raw: none published.
- Wedge-specific (S > 0.6) lift/drag at Re < 7e4 for modern balls: none open.
- Spin at landing for approach shots: only magazine wet/dry spin tests (launch monitor),
  not landing spin.
- Lyu PhD dissertation (WSU): not found; WSU repository lists Lyu only on pickleball (2026).
- Davies 1949, Smits & Smith 1994, Tavares 1999, Lieberman 1990, Quintavalla 2002,
  Kim & Choi 2014, Aoki 2003: paywalled/closed (citations in N9 and literature.md §8).
- Golf Digest original robot article (golfdigest.com) and APS abstracts
  (meetings-archive.aps.org): HTTP 403.
- Nike US 8,550,940 B2 (golf-ball design evaluation): indoor-range method, no CL/CD values.
- Callaway/Ogg US 6,464,601 B2: averaging definitions (CL at Re 70k/80k × 2000/3000 rpm;
  CD at Re 120–180k) and "Re 70,000 ... approximately corresponds to a golf ball at its apex";
  no per-ball values.
- Acushnet US 8,956,249 B2 (Sullivan et al.): CL > 0.20, CD < 0.22 at Re 145,000 / 3,100
  rpm design targets with MOI ≥ 0.46 oz·in²; no measured flight data.
- Mizuno US 11,135,481 B2: CL/CD only in figures at 44 m/s; simulated carry only.

Status: research complete 2026-10-09; literature.md sections 1–9 written.

## Round 3b retrieval log (2026-10-10)
Each entry: source; route(s) tried; outcome; extracted facts (P/S/D).

## N13 — NEW: Aoki, K. (2004) "Flying characteristics and flow pattern around a ball on dimple structure of a golf ball", Wind Engineers (J. Japan Assoc. Wind Eng., JAWE) 29(3) no. 100:61–67, doi:10.5359/jawe.2004.100_61
Route: OpenAlex title search → J-STAGE open PDF
https://www.jstage.jst.go.jp/article/jawe1982/2004/100/2004_100_61/_pdf (curl, browser UA; 200 OK;
read in full 2026-10-10). PRIMARY. Tokai University.
- [P] Test balls: PVC spheres of golf-ball size (D 42.6 mm) with regular circular dimples,
  ND = 104, 184, 328, 504, depth/width k/c ≈ 0.096 (Table 1). Not commercial balls.
  Open-jet tunnel 400×400 mm, 15–60 m/s, turbulence ≈ 0.3 %. Ball on a piano wire under
  tension, motor-driven spin, 3-component load cell; wire forces subtracted. α = ball
  surface speed / flow speed (= S). Fig 3: non-spinning CD vs Re 0.4–1.6e5 — more dimples
  move the crisis to lower Re; ND 328/504 supercritical above ≈ 0.6e5 (CD ≈ 0.25–0.28).
- [P/D] Fig 4(a), Re = 0.43e5 (15 m/s), α 0.15–0.6, read visually from a 400-dpi render
  (±0.02): ND 328 CL −0.18 (α 0.18), −0.12 (0.22), −0.01 (0.26), 0.11 (0.30), 0.19
  (0.33), 0.27 (0.37), 0.32 (0.41), 0.36 (0.45), 0.38 (0.48), 0.39 (0.52), 0.40 (0.56),
  0.46 (0.59); CD 0.41 → minimum 0.33 at α 0.33 → 0.37–0.41 at α 0.41–0.6. ND 504 similar:
  CL −0.23 (0.18) → 0.20 (0.33) → 0.45–0.52 (0.52–0.60), CD 0.41–0.47. Subcritical ND 104/184
  give positive CL 0.28–0.40 at α 0.15–0.45 and then FALL to 0.24–0.28 at α 0.5–0.56.
  Text: "for ND 328 and 504 (critical region) the values change greatly ... CL takes negative
  values ... the separation-point asymmetry reverses" (translated).
- [P/D] Fig 4(b), Re = 0.85e5 (30 m/s), α 0.08–0.30: ND 328/504 supercritical, CL 0.16 →
  0.31, CD 0.23 → 0.31. ND 184 (still in its crisis) CL 0.01 at α 0.09 rising to 0.28 at
  0.30; ND 104 goes negative (−0.03 at α 0.20).
- [P] Text values (Figs 9–10, ND 328): Re 0.423e5, 2000 rpm, α 0.30: "CD=0.11, CL=−0.04";
  4000 rpm, α 0.59: "CD=0.23, CL=0.23"; Re 1.27e5, 2000 rpm, α 0.10: CD 0.23, CL 0.17;
  4000 rpm, α 0.20: CD 0.25, CL 0.24. The Re 0.423e5 printed values do not match Fig 4(a)
  (which reads CL 0.11 / CD 0.345 at α 0.30 and CL 0.46 / CD 0.40 at α 0.59) — unresolved;
  the figure is used in the CSV.
- [D] First data found in the empty box of literature.md §7 at Re < 5e4 and S 0.36–0.6 for
  a golf-like (328-dimple) sphere: at Re 4.3e4 the lift deficit (reverse Magnus at
  α ≤ 0.26) is gone by α ≈ 0.4 and lift then exceeds the Re 8.5e4 curve's trend (0.38–0.46
  at α 0.5–0.6). Drag at α 0.4–0.6 is 0.37–0.41 (328) and 0.41–0.47 (504).
- [P] References: Aoki & Nonaka 2002, The Engineering of Sport 4, pp. 330–336; Aoki 2004,
  J. Visualization Soc. Japan 24(93):25–31.

## N14 — NEW: Miller, R. (2009) "A System for Measuring the Lift and Drag Forces of a Spinning Golf Ball Held Fixed Within a Wind Tunnel", MS thesis, California Polytechnic State University, doi:10.15368/theses.2009.13
Route: OpenAlex → Cal Poly Digital Commons PDF
https://digitalcommons.calpoly.edu/cgi/viewcontent.cgi?article=1048&context=theses (curl, browser UA;
200 OK; text extracted and read in the relevant sections 2026-10-10). PRIMARY for its own
statements; its TrackMan data are a faculty member's (T. Mase, "Radar data", ref [19]).
- [P] Own tunnel rig (to 160 ft/s, 8,600 rpm) "was not able to produce useful results for
  measuring lift"; no usable C_L/C_D. Not a data source.
- [P] Motivation (§1.1): "The radar unit (ISG Trackman) used to obtain the trajectory data
  was placed near the initial position of the ball. Therefore, the second half of the
  trajectory—the descent—is far from the radar and the data is less accurate. It is in
  this region where the Reynolds number falls, and some interesting changes occur in the
  correlation between drag and lift coefficients ... Our data indicates that around the
  apex of the balls trajectory a change in the flow regime over the ball may occur."
- [P] "after the ball reaches its highest altitude ... as the ball begins to speed up its
  state does not follow the same curve as it was slowing. Instead, both the drag and lift
  coefficients continue to decrease as the ball accelerates. This finding has been
  confirmed independently by others who have studied golf ball trajectories." And of the
  USGA Indoor Test Range: "The non-functionality of the flight coefficients is also present
  in their data. It is typically truncated [27]" ([27] = USGA ITR Technical Description and
  Operation Manual, 2001; not public). [S] for the ITR claim.
- [P] Spin: "Enough information was captured to accurately measure the spin rate of the
  ball throughout the first quarter of its flight. The data indicates that a ball's speed
  of rotation will decrease linearly with time."
- [P] Reproduces Quintavalla's (2002) USGA model form, eqs 1.8–1.9 (as typeset, partly
  garbled in the text layer): C_L = a1 + a2/Re⁵ + a3/Re⁷ + (b1 + b2·ln(Re)/Re² + b3/Re²)·α and
  C_D = c1 + c2/Re³ + c3/Re⁵ + c4/Re⁷ + (d1 + d2·ln(Re)/Re²)·α², and the USGA-recommended fitting
  terms ln(Re)/Re², e^−Re, 1/Re, 1/Re², 1/Re³, Re, (Re·Sp)²; "a drive differed from the
  test data by 0.3 meters" with Quintavalla's model.
- [D] A third, independent account (Cal Poly/TrackMan, c. 2008) of the same post-apex fall
  in radar-derived C_L and C_D (cf. N1h Polara, N4 Watanabe), with the authors' own caveat
  that the descent is the least accurate part of the radar track, and a [S] claim that the
  USGA ITR sees non-unique coefficients too and truncates them.

## N15 — NEW (supersedes the unobtainable Aoki 2010 for data): Aoki, K., Muto, K. & Okanaga, H. (2011) "Effects of dimples for drag and lift on a sphere with rotation", Trans. JSME B 77(775):793–802, doi:10.1299/kikaib.77.793
Route: OpenAlex search → J-STAGE open PDF https://www.jstage.jst.go.jp/article/kikaib/77/775/77_775_793/_pdf
(curl, browser UA; 200 OK; read pp. 1–5 and conclusions 2026-10-10). PRIMARY. Same authors and
same 328-arc-dimple ball as Aoki, Muto & Okanaga 2010 (Procedia Eng. 2:2431), which stays
fetch-refused; this journal paper carries the force data.
- [P] Ball: PVC sphere d = 42.6 mm (and 100 mm for pressure/flow work) with 328 circular-arc
  dimples, b/d 0.0152, c/d 0.0828, k/d 0.0079 (slightly shallower than B&H's k/d 0.009).
  Open-jet tunnel 400×400 mm, U 10–50 m/s, turbulence 0.3 %, Re 0.3–1.4e5. Ball on a 1.58 mm
  piano wire (dp/d 0.037), motor-spun; 3-component load cell; wire forces measured
  separately and subtracted. α = πd(N/60)/U (= S).
- [P] Fig 5 (no spin): dimpled-sphere critical Re ≈ 0.5e5; post-critical CD ≈ 0.25.
- [P] Text on Fig 7 (dimpled sphere, CD and CL vs α 0–2.0): "Re = 0.4e5 is subcritical,
  0.5e5 near critical, 0.8e5 and 1.3e5 supercritical. At Re 0.4e5, as α increases CD
  increases monotonically and CL increases approaching CL = 0.5. At Re 0.5e5, for α
  0.15–0.25 CD decreases as α increases; at α 0.15 CL is negative; above α 0.3 CD and CL
  increase and CL changes from negative to positive. At Re 0.8e5 and 1.3e5, CD and CL
  increase monotonically with α." Same trends as Bearman & Harvey (overlaid at 0.4e5 and
  1.3e5). (Translated.)
- [P/D] Fig 7 read visually from a 400-dpi render (±0.02): Re 0.5e5 CL −0.165 (α 0.15),
  0.00 (0.2), 0.16–0.17 (0.25–0.3), 0.375 (0.4), 0.36–0.38 (0.5–0.6), 0.41–0.43 (0.7–1.0),
  0.45–0.48 (1.1–1.6). Re 0.4e5 CL 0.35 (α 0.5), 0.40 (0.7), 0.47 (1.0), 0.49–0.50
  (1.2–2.0). Re 1.3e5 CL 0.12 (0.1), 0.24 (0.2), 0.29 (0.3), 0.33 (0.4), 0.36 (0.5), 0.41
  (0.7). CD: Re 0.4e5 0.465 (α 0.6), 0.515 (1.0), 0.57 (1.4), 0.645 (1.8); Re 0.5e5 0.295
  minimum at α 0.25, 0.39 (0.4–0.6), 0.50 (0.9–1.0), 0.595 (1.4–1.6); Re 0.8e5 0.42 (0.6),
  0.47 (1.0); Re 1.3e5 0.27 (0), 0.34 (0.3), 0.41 (0.5), 0.455 (0.7).
- [D] For α ≥ 0.4 the CL curves for Re 0.4, 0.5, 0.8 and 1.3e5 collapse within ±0.03: no
  low-Re lift deficit above S ≈ 0.4 for this ball, and CL saturates at ≈ 0.45–0.50 for
  S ≥ 1. CD at high S is Re-dependent: at S ≈ 1.0, 0.515 (Re 0.4e5), 0.50 (0.5e5), 0.47
  (0.8e5). Agrees with Naruo 2004's commercial ball (CL 0.46, CD 0.51 at S 1.0) and with
  B&H (C_L 0.425–0.455 at α 0.77–0.92, Re 0.4e5, as Aoki overlays it — matching round 1's
  digitization of B&H).
- [P] Introduction: "for dimpled spheres the drag and lift characteristics have been
  clarified over Re 0.4–2.4e5 and spin rate ratio 0.0–1.4 (refs 4, 8, 11, 12)" — i.e. the
  Smits & Smith range; ref 12 not checked.

## N16 — Retrieval attempts and outcomes (round 3b, 2026-10-10)
- Bearman & Harvey 1976 DOI ERRATUM [P, Crossref + OpenAlex]: 10.1017/S0001925900007575 resolves
  to "AEQ volume 27 issue 2 Cover and Front matter". The paper "Golf Ball Aerodynamics",
  P. W. Bearman & J. K. Harvey, Aeronautical Quarterly 27(2):112–122 (1976) is
  doi:10.1017/S0001925900007617 (Crossref query.bibliographic, item 1). OpenAlex: closed, no OA
  location. Not obtained. The wrong DOI appears in docs/research/aero-model.md and in this
  spike's aero-data.md (not edited — not this probe's files) and was repeated in
  literature.md §8 item 10 (corrected there). Coordinator check, 2026-10-10:
  `git grep` finds it only in aero-model.md (twice, now corrected) and
  literature.md, not in aero-data.md.
- Aoki, Muto & Okanaga 2010 (Procedia Eng. 2:2431): OpenAlex OA URL
  https://www.sciencedirect.com/science/article/pii/S1877705810002651/pdf → captcha page (not
  bypassed); CiteSeerX 10.1.1.611.3647 → redirected to a Wayback 404; Wayback CDX shows HTML
  captures of /pdf (2024-04-15/16) but fetching them returned HTTP 429. Not obtained.
- Naruo & Mizota 2014 (Procedia Eng. 72:780): OpenAlex/Semantic Scholar OA URL
  .../pii/S1877705814006481/pdf → HTTP 403 captcha ("robot", "captcha", "challenge" in the
  page). Wayback snapshot 20210218231440 of the article page fetched (200): abstract only
  [P]: "when the depth of the dimples was much shallower, the lift coefficient was
  extremely-little on the slow velocity, i.e. under 30m/s. When the golf ball trajectory which
  was launched with a driver was calculated under various initial conditions, the ball
  velocity became under 30 m/s over the vertex of the trajectory in many cases, including
  professional male golfers and female golfers. Therefore, if the lift coefficient of the
  velocity of 30m/s becomes smaller, distances will become shorter." Full text not obtained.
- Penner 2003 (Rep. Prog. Phys. 66:131): OpenAlex lists OA PDF at iopscience; fetch returned a
  "Radware Bot Manager Captcha" page. Not bypassed; not obtained.
- USGA "ITR test conditions — 2028 ODS" and "Overall Distance and Symmetry Test Protocol 4.0":
  Wayback availability API → no snapshot for the usga.org or digital-pd.usopen.com URLs;
  usga.org direct → 403. Not obtained.
- Smits & Smith 1994 (doi:10.4324/9780203474709-58), Tavares et al. 1999, Lieberman 1990,
  Zagarola et al. 1994, Quintavalla 2002, Mizota et al. 2002 (Science and Golf I–IV), Davies
  1949 (doi:10.1063/1.1698540), Kim & Choi 2014 (doi:10.1177/1754337114543860), Aoki et al. 2003
  (doi:10.1007/BF03180966), Naruo & Mizota 2007 (doi:10.1201/9781439828427-40 per OpenAlex),
  Moriyama & Okanaga 2023 Sports Eng. (doi:10.1007/s12283-023-00400-0): OpenAlex "closed", no
  OA location; web searches found no author or repository copy. Not obtained.

## N17 — USGA-TPX3006 "Actual Launch Conditions Overall Distance and Symmetry Test Procedure (Phase II)", Revision 2.0.0, 28 Feb 2011
Route: Wayback availability API → snapshot
http://web.archive.org/web/20260316203434id_/https://www.usga.org/content/dam/usga/pdf/Equipment/TPX3006-overall-distance-and-symmetry-test-procedure.pdf
(200, application/pdf; read in full). PRIMARY.
- [P] Mechanical-golfer calibration (Table 5.5): launch angle 10° ± 0.5°, spin 42 rps ± 2.0,
  swing speed 120 mph ± 0.5, ball speed 256 fps (reference after ageing).
- [P] ITR: CL and CD measured for 12 balls in PH and PP orientations at "the full set of test
  settings (i.e. launch velocity and spin rate) described in the ITR Manual"; change record:
  "Number of ITR test settings set to 15" (2004); calibration-ball CL, CD nominal ± 5 %; room
  75 ± 3 °F.
- [P] Conformance: carry, overall distance and flight time computed at 75 °F, 30.0 inHg, 50 %
  RH; overall distance ≤ 317.0 yd (tolerance 3.0 yd). Symmetry: mean PP–PH difference must not
  exceed 4.0 yd carry or 0.40 s flight time (if statistically significant).
- [P] Control ball: Bridgestone "USGA/R&A Calibration", 2-piece Surlyn, 42.72 mm, 45.2 g,
  quasi-icosahedral 432 dimples.
- [D] The Acushnet prior-art ball of US 6,729,976 Table 5 (PP vs PH: 3.8 yd, 0.29 s, 5.2° land
  angle) is inside these symmetry limits.
- A 2019-path snapshot (20250908220319) exists but returned HTTP 429; not read.

## N18 — NEW: Naruo, T. & Mizota, T. (2009) "The influence of wind upon 3-dimensional trajectory of golf ball", Proc. JSME Joint Symp. Sports Eng./Human Dynamics 2009, A-29, pp. 152–156, doi:10.1299/jsmesports.2009.0_152
Route: OpenAlex → J-STAGE open PDF https://www.jstage.jst.go.jp/article/jsmesports/2009/0/2009_152/_pdf
(200; read in full 2026-10-10). PRIMARY. The open counterpart of the closed Naruo & Mizota 2007
(Impact of Technology on Sport II) chapter; also cites Naruo & Mizota 2006, Engineering of
Sport 6 vol. 1 pp. 149–154 (experimental verification under the atmospheric boundary layer).
- [P] Coefficients from the Naruo 2004 tunnel (Sp 0.03–1.13, to 44 m/s and 10,000 rpm);
  wind by a log law V_Y = (V*/κ)·ln((Y−H)/Y′) with κ 0.4 and Y′ = 0.09 m (dense grassland);
  aerodynamic force from the ball–air relative velocity.
- [P] Field check of the log law at Shingu beach (Fukuoka): anemometers at 1.5–5.5 m; wind
  4–6 m/s; direction steady over ≈ 3 h and uniform over 6 stations 50 m apart; "the ball flies
  about 6 s, during which wind speed and direction hardly change".
- [P] Validation: 45 shots by a pro (driver, 3-wood, 5-iron, 9-iron), launch measured by the
  "Pythagoras" launch analyser, wind measured at four 5.5 m masts 60 m apart, landing point
  measured. Least-squares slope of computed vs measured distance: 0.948 without wind, 0.981
  with wind (Fig 7; distances ≈ 70–260 m). Example driver: 66.3 m/s, launch 18.9° (lateral
  6.1°), spin 2,293 rpm, axis tilt 12.3°, wind 5.17 m/s from 157° (nearly a tailwind): wind
  added ≈ 5 m of distance, and the windy calculation matched the landing point.
- [D] Two points for this spike: (1) outdoor flights need the measured wind to close carry
  to ≈ 2 %, so outdoor radar-derived late-flight coefficients (N1h, N4, N14) are exposed to
  wind of this size; (2) only landing points were checked — no apex or land angle.

## N19 — Other round-3b checks (2026-10-10)
- Kim & Choi 2014 / SNU thesis "Characteristics of flow over a rotating sphere with smooth or
  grooved surface" (2015), hdl:10371/118425 (OpenAlex: OA): s-space.snu.ac.kr returns a
  JavaScript bot challenge ("js-challenge" cookie page); not bypassed; not obtained.
- Sakib, N. & Smith, B. L. (2020) "Study of the reverse Magnus effect on a golf ball and a
  smooth ball moving through still air", Exp. Fluids 61(5):115, doi:10.1007/s00348-020-02946-2
  — NEW lead found in the reference list of Elliott, Smith, Lyu & Smith 2024 (Exp. Fluids 65:60,
  open, read pp. 1–2: macro-roughness spheres, not golf). OpenAlex: closed. Not obtained.
- USGA "Golf Course Effects on Hitting Distance" (2023): digital-pd.usga.org → 403 "Access
  Denied"; Wayback snapshot 20230914113927 of the usga.org path exists but returned HTTP 429
  repeatedly (background retry script, see N20 for the outcome).
- Alam et al. 2011 (Procedia Eng. 13:226): OpenAlex lists a Figshare record (27378999) with no
  files and a Swinburne handle; the Elsevier PDF serves the same captcha. Not obtained
  (non-spinning drag only; low priority).
- Ferguson MASc thesis (Waterloo): no record found in OpenAlex or by web search.
- TrackMan Newsletter #7: original gavlegolf.com URL unknown/dead (aero-data.md.notes.md:95);
  not recoverable through Wayback without the URL.
- Naruo & Mizota 2004, Nagare 23(3):203–211: not found online.
- Aoki, Muto & Okanaga 2007 (JSME Sports Symp. A15, open, read): non-spinning only (328
  dimples, arc/cone/trapezoid; critical Re ≈ 0.5e5, supercritical CD ≈ 0.25). Nothing for
  the descent model.

## N20 — Wayback retry outcome (2026-10-10)
- Background retry (scripts/wb_retry.py, generic UA, 75 s spacing) of the USGA 2023 report snapshot 20230914113927: HTTP 429 on attempts 0-3; stopped after ~5 min. The TPX3006 2019-path snapshot and the Aoki 2010 sciencedirect /pdf snapshot were not reached. All three remain unread; the Aoki 2010 force data are covered by Aoki 2011 (N15).

Status: round 3b complete 2026-10-10.
