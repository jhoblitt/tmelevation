# Notes — spec claims review (verification log)

Each entry: claim, primary source URL + location, access date, result.

## Source data — TrackMan images (accessed 2026-10-08)

- Downloaded https://a.storyblok.com/f/117513/1920x883/6aefae601d/pga_tour-averages_trackman_blog.jpg and
  https://a.storyblok.com/f/117513/1920x883/9617e89ecd/lpga_tour-averages_trackman_blog.jpg (1920x883 JPEG each).
  Read at full size and as 1.5x crops (4 quadrants each). Every one of the 12 PGA x 9 and 11 LPGA x 9 cells in
  docs/research/trackman-2023-tour-averages.md matches the image. Row sets: PGA Driver,3-wood,5-wood,Hybrid,3 Iron..9 Iron,PW (12);
  LPGA same minus 3 Iron (11). Column headers: Club Speed (mph), Attack Angle (deg), Ball Speed (mph), Smash Factor,
  Launch Angle (deg), Spin Rate (rpm), Max Height (yards/meters), Land Angle (deg), Carry (yards/meters). Titles:
  "PGA TOUR AVERAGES YARDS/METERS" / "LPGA TOUR AVERAGES YARDS/METERS", "2023" at right. PGA 4 Iron carry 209/192 confirmed.
  VERIFIED.
- Palette (median/mode pixel sampling, scripts/palette*.py in reviewer scratch):
  background #EC6919 (left/right margins, both images) VERIFIED; stripe #F3955F (patch medians) VERIFIED, odd rows
  (Driver, 5-wood, 3 Iron/4 Iron, ...) spanning x=213..1705 incl. Club column VERIFIED; vertical rules #BA571C over the
  orange rows and header VERIFIED, BUT over stripe rows the same rule renders #BE7950 (x=320, y=205/316/540) — spec gives
  only #BA571C. No horizontal rules VERIFIED. Title charcoal: modal dark pixel in "YARDS/METERS" is #3C3C3C (4575 px);
  #3D3B3C occurs in 145 px. Spec's #3D3B3C is within JPEG noise of the mode (contrast 3.49 vs 3.47) — nit.
- WCAG contrast (sRGB relative luminance, WCAG 2.x formula), computed:
  #262425 on #EC6919 4.849 (spec 4.85) OK; on #F3955F 6.813 (spec 6.81) OK; #3D3B3C on #EC6919 3.494 (spec 3.49) OK;
  white on #F3955F 2.264 (spec 2.26) OK; white on #EC6919 3.181 (spec 3.18) OK. Extra: #262425 on the stripe-row rule
  colour #BE7950 is 4.44 (irrelevant unless text overlaps rules). Minimal darkening of #3D3B3C meeting 4.5 on orange
  is #2B292A (4.54); #262425 is darker than the minimum — fine, wording "darkened until it meets" is loose.
## TrackMan "Introducing updated tour averages" page (accessed 2026-10-08)

- https://www.trackman.com/blog/introducing-updated-tour-averages — raw HTML fetched, tags stripped. Dated "May 2, 2024",
  "Trackman Editorial Team"; describes "The 2023 PGA & LPGA Tour Averages". Key insights verbatim: "Male data is captured across
  40+ different events and 200+ different players." "Female data is captured across 30+ different events and 150+ different players."
  "Averages are based on data from competition as well as on the range." "Official stat holes are picked going in opposite
  directions to reduce any effects from wind." No occurrence of normaliz*/altitude/temperature/sea level/calm. VERIFIED: no conditions stated.
- The page's "download here" link -> https://www.trackman.media/tour-averages (poster PDFs/JPGs on Dropbox). Downloaded
  PGA-yards-tour-average.jpg (4500x5625) and Tour-average-PGA-yards.jpg (8000x4500): same PGA values, yards only, Hybrid labelled
  "Hybrid 15-18°"; no conditions footnote. Supports "no conditions stated" also for the official download assets.
## TrackMan "The Normalization feature explained" (accessed 2026-10-08)

- https://www.trackman.com/blog/golf/normalization-feature-explained — raw HTML, dated "July 9, 2014", Trackman Editorial Team.
  Verbatim: "Normalization will always calculate the ball flight based on the launch data, initial trajectory, calm conditions,
  and the altitude and temperature listed in TPS. Default values are 77°F and sea level (0 feet altitude)." VERIFIED (spec §5.1
  "TrackMan's Normalize default"). Note: the feature is called "Normalization" (spec says "Normalize" — wording nit only).
  Humidity: not mentioned.
- Images pga-tour-6-iron.png (407x210) and lpga-tour-6-iron.png (410x208) read at 3x:
  PGA "Calm": Ball Speed 130 mph, Launch 14.7 deg, Spin 6088 rpm, Carry 184 yds, Max Height 33.8 yds, Land Angle 48.0 deg.
  LPGA "Calm": 110 mph, 18.6 deg, 5950 rpm, Carry 152 yds, Max Height 27.7 yds, Land Angle 45.6 deg. VERIFIED (oracle 10 numbers).
  Captions: "PGA TOUR 6 iron (-3.1 deg Attack Angle)", "LPGA Tour 6 iron (-1.5 deg Attack Angle)"; footnote "*Table assumes a
  constant wind throughout the entire ball flight". The article does NOT state altitude/temperature for these tables (spec says
  "at sea level" — inference from the Normalization default, not stated). The text introduces them as "a stock 6 iron on the PGA
  and LPGA Tour" (2014-era) — they are model outputs (wind variants with identical launch data), consistent with "TrackMan model".
## PGA TOUR "Elevated expectations" 2017-02-28 (accessed 2026-10-08) — PRIMARY read of the article

- https://www.pgatour.com/article/news/long-form/2017/02/28/elevated-expectations-wgc-mexico-championship-altitude (raw HTML, <p> text).
  para 74: "Padjen has run the numbers for an average TOUR pro at 7,800 feet but in doing so has separated high trajectory players and low trajectory players."
  para 83: "Using a driver, an average TOUR player with a high trajectory (launch angle 10.7 degrees) and 113-mph club speed would typically
  see an apex of 102 feet at sea level, with a carry of 282-yards. In Mexico, this would change to 84 feet for apex and 306 yards of
  carry – an increase of 8 percent."
  para 84: "The land angle at sea level would typically be 38 degrees with ball speed at 65 mph, but in Mexico that would change to 29 degrees and 75 mph."
  para 85-86: low trajectory 8.9 deg: apex 76 -> 60 ft, carry 277 -> 288 ("Just a 4 percent increase"), land 31 -> 22 deg, 67 -> 81 mph.
  para 77: high-ball carry "increase by a range of 8 to 15 percent depending on the club", low-ball "4-12 percent".
  para 69-70 (Padjen): "this generic notion that it is a straight 10 percent ... doesn't really hold true" ; "more like a bell curve".
  => 282->306 VERIFIED, 102->84 ft VERIFIED, 38->29 deg VERIFIED, 7,800 ft VERIFIED. +8.5% is the reviewer-computed ratio (306/282=1.0851);
  the article itself says "an increase of 8 percent". Apex -17.6% computed (spec "-18 %" OK as rounding).
  NOT stated in the article: that these are TrackMan model outputs (it says Padjen "has run the numbers"), ball speed, spin, temperature.
  Inputs differ from the 2023 row the spec applies them to: 113 mph club speed / 10.7 deg launch vs 2023 row 115 mph / 10.4 deg / 171 mph / 2545 rpm;
  sea-level land 38 deg vs 39 deg in the 2023 table; apex 102 ft = 34.0 yd vs 35 yd.
- Same article para 72 (Aoyama): "has devised a formula for estimating the percentage difference in distances at elevation: Multiple the
  elevation in feet by 0.00116. ... a 300-yard drive at sea level would result in an additional 26.58 yards". para 76 (Aoyama): thinner air ->
  "flatter" shape ... "This produces extra roll, which contributes to the increased distance". => in this source the rule is for
  "distances"/"drive", not explicitly carry.
## Titleist / Aoyama rule (accessed 2026-10-08)

- titleist.com pages return HTTP 403 to curl (both Team Titleist posts and Learning Lab). Wayback has no snapshot of the two Team
  Titleist posts (archive.org/wayback/available returned empty).
- Titleist Learning Lab "Altitude and Ball Flight", Wayback snapshot 2026-05-09:
  http://web.archive.org/web/20260509230837/https://www.titleist.com/learning-lab/performance/altitude-and-golf-ball-flight — PRIMARY (Titleist):
  "You can calculate the distance gain you will experience compared to sea level by multiplying the elevation in feet by about a tenth
  of a percent. For example, if you're playing in Denver at a mile elevation, the increase is about 6%. So, if you normally drive the
  ball 250 yards at sea level, you will likely drive it about 265 yards in Denver." ... "This results in a flatter trajectory on your
  longer shots, a shallower angle of descent, and greater roll." No 0.00116 on this page; no carry/total distinction.
- GolfWRX (Ryan Barath, 2019) https://golfwrx.com/545618/... quotes Aoyama verbatim: "You can calculate the distance gain you will
  experience (compared to sea level) by multiplying the elevation (in feet) by .00116. For example, if you're playing in Reno, at
  1 mile elevation (5,280 ft.) the increase is about 6% (5,280 x .00116 = 6.1248). If you normally drive the ball 250 yards at sea
  level, you will likely drive it 265 yards in Reno." [secondary]
- => 1.16 %/1,000 ft and +6.1 % at 5,280 ft VERIFIED as Aoyama's rule (secondary quotes; Titleist primary gives "about 6%").
  The rule is stated for "distance gain"/"drive", with "greater roll" called out — NOT stated as carry. Spec oracle 4 labels it carry.
## TrackMan Support "VG | Altitude in Course Play" (accessed 2026-10-08) — PRIMARY

- https://support.trackmangolf.com/hc/en-us/articles/51714287935387-VG-Altitude-in-Course-Play (Created/Updated June 15, 2026):
  "at The Reserve at Moonlight Basin (image below), the altitude is 2100m or 7000ft above sea level." ... "In our example the
  elevation is 7198ft above sea level." "This means the ball will travel roughly 10% further in the air than at sea level."
  => "roughly 10 %", ~7,000-7,200 ft, "in the air" VERIFIED. Context: TrackMan Virtual Golf (simulator) course setting. No club, no
  player population (PGA or otherwise), no temperature, no "mean over the bag". Spec's "mean PGA carry gain" is an interpretation.
## TaylorMade Clubhouse, Castle Pines 2024 (accessed 2026-10-08) — PRIMARY publication

- https://taylormadegolf.fr/clubhouse/801423-seen-on-tour-scottie-rory-collin-tommy-prepare-for-altitude-at-the-bmw-championship.html?lang=fr_FR
  Mike Esse, August 22, 2024. "Castle Pines plays at nearly 6,400 feet of elevation, thus most golfers entered Castle Pines this week
  with the mindset that yardages would adjust by an increase of around 10 percent."
  Scheffler ("stock yardages vs. altitude yardages", percentages vary "based off the lie, whether the hole is uphill or downhill and
  where the wind direction is coming from"): driver 300/330, 3-wood 270/292, 3-iron 245/265, 4-iron 226/244, 5-iron 212/233,
  6-iron 198/218, 7-iron 184/206, 8-iron 169/189, 9-iron 156/175, PW 144/158, 50 131/142, 56 118/127, 60 105/113.
  McIlroy ("what ... Rory's TP5x MySymbol would fly in altitude (bold) vs. stock", "bell curve", developed "over his two days of
  practice"): driver 320/346, 3-wood 295/322, 5-wood 270/300, 4-iron 245/267, 5-iron 225/247, 6-iron 210/233, 7-iron 195/222,
  8-iron 180/205, 9-iron 165/185, 46 150/165, 50 140/151, 54 130/141, 60 107/116.
  => 7-iron +11.96 % (Scheffler) and +13.85 % (McIlroy): "+12–14 %" VERIFIED. Elevation per source "nearly 6,400 feet"; spec uses
  6,300 ft (not this source's figure). Scheffler's are not labelled carry; McIlroy's are "would fly" (carry). Planning yardages, not
  measurements; they are players' own stock numbers (Scheffler 7i 184, McIlroy 195), not PGA-average launch conditions.
  Same article: McIlroy TrackMan drives carried 363 and 371 yd at 185/186 mph ball speed.
## DP World Tour, Crans-sur-Sierre (accessed 2026-10-08) — read via WebFetch (curl got HTTP 403 on all three hosts)

- https://www.europeantour.com/dpworld-tour/news/articles/detail/a-numbers-game-players-tackle-altitude-at-omega-european-masters/
  dated Wednesday 2 September 2026, no author. "Crans-sur-Sierre Golf Club is notable for being 1,500m above sea level." (= 4,921 ft)
  Penge: "At the moment, it is about five percent in the wedges." "Seven-and-a-half per cent in the nine, eight, seven and six iron
  and then five per cent for the rest [wooded clubs]." "[There's] a lot of work on the range with monitors".
  8-iron: "his stock yardage for an eight iron is 180 yards but when factoring in altitude the club is carrying 190 yards." "So, the
  ball is roughly carrying five per cent extra..." (per WebFetch summary: in cooler morning conditions) "...Penge believes it will carry
  upwards of ten per cent more" (as the temperature rises through the day).
  => 7.5 % (6–9 irons) and 5 % (woods) VERIFIED as Penge's figures; driver not named (spec maps "wooded clubs" -> Driver, reasonable).
  The article itself ties the numbers to temperature (cool morning ~5 %, warm afternoon "upwards of ten per cent" for the 8-iron),
  i.e. the figures are NOT a same-temperature comparison; spec §8.3 preamble says oracles use same temperature "unless stated".
## R&A Rules of Equipment Part 4 (accessed 2026-10-08) — PRIMARY
- https://www.randa.org/roe/the-rules-of-equipment/part-4-conformance-of-balls: "The weight of the ball must not be greater than 1.620
  ounces avoirdupois (45.93 g)." "The diameter of the ball must not be less than 1.680 inches (42.67 mm)." VERIFIED. Document is the
  Equipment Rules (Rules of Equipment), a maximum mass and minimum diameter — spec's "Rules of Golf limits" is loose naming (nit).

## Penner (2001) (accessed 2026-10-08) — PRIMARY

- Crossref https://api.crossref.org/works/10.1119/1.1344164: "The physics of golf: The optimum loft of a driver", American Journal of
  Physics 69(5) 563-568, 2001-05, author Penner. Citation "Am. J. Phys. 69:563, doi:10.1119/1.1344164" VERIFIED.
- Open author copy https://www.viurrspace.ca/server/api/core/bitstreams/59c73ed3-fece-4b2c-8e96-a14336895139/content — HTTP 200 PDF,
  cover note "Copyright 2001 American Association of Physics Teachers (AIP Publishing). This article may be downloaded for personal use
  only." VERIFIED real (it is the published typeset version with an AAPT/AIP personal-use notice).
- p.565: eq (12) F_D = 1/2 rho (pi r^2) C_D v_b^2; eq (13) F_L = 1/2 rho (pi r^2) C_L v_b^2; rho "1.204 kg/m3 for dry air at 20 °C";
  eq (14) a_x = (-F_D cos phi - F_L sin phi)/m; eq (15) a_y = (-F_D sin phi + F_L cos phi)/m - g, g = 9.81 m/s^2.
  Spin decay: "approximately exponential with the spin rate on landing for a driver shot estimated to be approximately 75% of the
  initial spin rate. The following empirical equation for the angular acceleration, alpha, of a golf ball, obtained from the results of
  Smits and Smith,13 will be used": eq (16) alpha = -(0.000 02)(omega_b v_b / r). VERIFIED (spec: lambda0 = 2.0e-5, "as given in Penner eq. 16").
- Spec §5.2 EOM dvx/dt = -kV(C_D vx + C_L vy), dvy/dt = -kV(C_D vy - C_L vx) - g with k = rho A/(2m): algebraically identical to
  eqs (14)-(15) with cos phi = vx/V, sin phi = vy/V. VERIFIED.
- Penner's C_D, C_L are "interpolated C_D and C_L values from Bearman and Harvey" — Penner is NOT a source for the coefficient shapes.
- Penner ref 13: A. J. Smits and D. R. Smith, "A new aerodynamic model of a golf ball in flight," in Proceedings of the 1994 World
  Scientific Congress of Golf, edited by A. J. Cochran and M. R. Farrally (E & FN Spon, London, 1994). No page numbers given.
## Smits & Smith (1994) bibliography and coefficient forms (accessed 2026-10-08)

- Primary chapter NOT obtained. Searches (WebSearch x5: title, "0.24" "0.18" "0.54", "proposed the following model for driver shots",
  Mehta & Pallis PDF, Taylor & Francis) found no open copy of the chapter nor of Mehta & Pallis (2001).
- USGA patent US 6,186,002 B1 (Lieberman, A. J. Smits, Quintavalla, F. W. Thomas, Winfield; assignee USGA)
  https://patents.google.com/patent/US6186002B1/en: "A. J. Smits (1994) A New Aerodynamic Model of a Golf Ball in Flight, Science and
  Golf II, (Ed. A. J. Cochran) E&FN SPON, pages 340-347"; ref [2] "Smits, A. J. and Smith, D. R., ... Science and Golf II, E & FN Spon,
  New York, 1994". => pp. 340-347 VERIFIED at secondary level (a patent co-invented by Smits). Penner ref 13 gives the same book
  (Proceedings of the 1994 WSCG, eds Cochran & Farrally, E & FN Spon, London) without pages.
- Crossref: 10.4324/9780203474709-58 "A new aerodynamic model of a golf ball in flight", Science and Golf II (Taylor & Francis 2002
  ebook), pages 433-442 — the reissue's pagination; landing page on taylorfrancis.com shows a different chapter ("The golf equipment
  market 1984–1994") — metadata unreliable, not usable as a citation.
- Coefficient text: Google Patents US 11,230,375 B1 https://patents.google.com/patent/US11230375B1/en (clean HTML):
  "Smits and Smith (8) proposed the following model for driver shots in the operating range, 70,000<Re<210,000, 0.08<S<0.2: ...
  C_D = C_D1 + C_D2 S + C_D3 sin{pi(Re-A1)/A2}, C_L = C_L1 S^0.4, Spin Rate Decay = dω/dt [d^2/(4U^2)] = R1 S. Suggested values for the
  constants are: C_D1=0.24, C_D2=0.18, C_D3=0.06, C_L1=0.54, R1=0.00002, A1=90,000 and A2=200,000." VERIFIED as text of that patent.
  The surrounding passage uses numbered refs (3) Alaways, (5) Bearman & Harvey, (8) Smits & Smith matching the patent's embedded
  reference list "1. R.D. Mehta, 'Aerodynamics of Sports Balls' ... 2. E. Achenbach ... 3. L. W. Alaways ...", and the patent cites
  "Rabindra D. Mehta and Jani Macad Pallis, 'Sports Ball Aerodynamics: Effects of Velocity, Spin and Surface Roughness', Materials And
  Science In Sports, eds Froes and Haake, pp. 185-197" — so the passage is very likely Mehta & Pallis (2001) text reproduced in the patent.
  The patent does not itself label the passage as a quotation of Mehta & Pallis; attribution is inferred.
  IMPORTANT: the model is stated "for driver shots in the operating range 70,000<Re<210,000, 0.08<S<0.2" — the spec applies the
  C_D/C_L shapes to every club (irons/wedges reach S 0.3-1.2 per the research probe), outside the stated validity range.
  Spin decay in this text: dω/dt·d²/(4U²) = R1·S → dω/dt = R1·ω·U/r (since d²/4 = r², S = rω/U): magnitude identical to Penner eq 16.
## Drag crisis Re range (accessed 2026-10-08)
- Li, Tsubokura, Tsunoda (2017) Flow Turbul. Combust., PMC6044256 (via WebFetch): Table 1 rotating golf ball Re 4.3e4 / 7.5e4 / 1.1e5:
  Cd 0.5059 / 0.3168 / 0.2397 (subcritical / critical / supercritical); text: crisis 'around 5 x 10^4 in the experiment' (Bearman & Harvey).
  => spec 'Re ≈ 4e4–1.1e5' VERIFIED as a reasonable span (ball-specific; LES of one ball design).

## USSA 1976 (accessed 2026-10-08) — PRIMARY, NTRS 19770009539 PDF (243 pp., scanned; doc page N = PDF page N+16), rendered pages read

- Foreword p.xiii (PDF 14): "That portion of the 1962 and 1976 U.S. Standard Atmospheres up to 32 km is identical with the
  International Civil Aviation Organization (ICAO) "Manual of the ICAO Standard Atmosphere," as revised in 1964". VERIFIED (spec "identical to ICAO ISA in this range").
- p.3 (PDF 19): R* = 8.31432e3 N·m/(kmol·K); g0 = 9.80665 m/s^2; Table 4 layer 0: H_b = 0 km', L_M,b = -6.5 K/km'; P0 = 1.013250e5 Pa.
- p.4 (PDF 20): "The value of r0 (= 6356.766 km)"; T0 = 288.15 K. p.8 (PDF 24): eq (18) H = Γ·r0·Z/(r0+Z); eq (19) Z = r0·H/(Γ·r0 − H),
  Γ = 1 m'/m; "the value of r0 is taken as 6,356,766 m". VERIFIED (spec H = r0Z/(r0+Z), Z = r0H/(r0−H), r0 = 6,356,766 m).
- p.12 (PDF 28): eq (33a) P = P_b [T_M,b/(T_M,b + L_M,b (H − H_b))]^(g0'·M0/(R*·L_M,b)); P0 = 101325.0 N/m^2.
- Computed (scripts/atmos.py; M0 = 28.9644 per research notes p.9 eq 21 — not re-read): g0·M0/(R*·L) = 5.2558761; 1/that = 0.1902632;
  L/T0 = 2.255770e-5. Spec constants 5.255876, 0.190263, 2.25577e-5 VERIFIED. Spec formula reproduces exact eq (33a) to <0.001 hPa
  over 0–15,000 ft; inverse with rounded 0.190263 round-trips Z within 5 mm at 15,000 ft.
  P/P0: 5,000 ft 0.83209; 5,280 ft 0.82341; 6,300 ft 0.79241; 7,200 ft 0.76586; 7,800 ft 0.74856; 10,000 ft 0.68783; 15,000 ft 0.56459.
- Lapse-rate claim (spec §5.1 "3.6–3.8 % denser at 5,000 ft"), computed at the same (USSA) pressure:
  dry, 15 °C base (true ISA): +3.559 %; dry, 25 °C base: +3.436 %; 25 °C base with 50 % RH (CIPM-2007 vapour formula): +3.78 %.
  => range is right only by mixing bases; under the spec's own 25 °C / 50 % RH reference it is 3.8 %; dry-air 25 °C gives 3.4 %. Nit.
- "density ratio ρ/ρ0 = P/P0" with T fixed at 25 °C AND RH fixed at 50 % (spec's own statement) is NOT exact: vapour mole fraction
  e/P rises as P falls. Computed ρ/ρ0 − P/P0: −0.12 % at 5,000 ft, −0.20 % at 7,800 ft, −0.27 % at 10,000 ft, −0.46 % at 15,000 ft.
  Exact only for dry air (or constant vapour mole fraction). Minor internal inconsistency.
## NIST SP 811 Appendix B.8/B.9 (accessed 2026-10-08) — PRIMARY, raw HTML tables
- https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8 (and b9):
  "inch of mercury, conventional (inHg) 12 | pascal (Pa) | 3.386 389 | E+03" (not bold = not exact); "inch of mercury (32 °F) 3.386 38 E+03";
  "millibar (mbar) | pascal (Pa) | 1.0 | E+02" BOLD (exact); "foot (ft) | meter (m) | 3.048 E-01" BOLD; "yard (yd) | meter (m) | 9.144 E-01"
  BOLD; "mile per hour (mi/h) | meter per second (m/s) | 4.4704 E-01" BOLD. VERIFIED all spec §5.1 unit factors. (hPa = 100 Pa is SI by definition.)
## PGA TOUR 2024-08-21 (Hodowanic), Castle Pines (accessed 2026-10-08)
- https://www.pgatour.com/article/news/latest/2024/08/21/altitude-adjustment-colorado-castle-pines-golf-club-elevation-challenge-bmw-championship
  "Trackman's data shows the clubs most affected are the mid- and short-irons (6- to 9-irons), while the top end of the bag
  (drivers/woods) is less affected." "For high ball hitters, some clubs may fly upwards of 15% further, and they may average over 10%
  across all clubs. Pros with a low ball flight may have no clubs that average over 10%." Shih: "The actual rule of thumb is there is
  no rule of thumb." "The time of the day and temperature plays a role, too." => supports soft oracle 7 ordering (paraphrase of
  TrackMan, secondary). Also bears on oracle 5: TrackMan's own staff say bag-average >10 % only for high-ball hitters.
## Reference repo jhoblitt/conventions-claude (accessed 2026-10-08)

- Local clone /home/jhoblitt/github/conventions-claude at 51b66a2 (2026-10-02); remote main 7d158be (2026-10-07, via gh api).
  release.yml and release-notes.sh identical on remote main; .releaserc.yml differs only in the plugin list (ceph-conventions added).
- .releaserc.yml: branches [main]; plugins commit-analyzer (preset conventionalcommits; releaseRules docs/refactor/perf -> patch;
  comment "only chore/ci/test/build/style merges release nothing"), release-notes-generator (preset conventionalcommits,
  presetConfig.types: feat, fix, perf, refactor, docs, revert visible; chore, ci, build, test, style hidden), changelog
  (changelogFile CHANGELOG.md), exec (generateNotesCmd .github/scripts/release-notes.sh "${nextRelease.gitTag}" "${lastRelease.gitTag || ''}";
  prepareCmd jq version bump of plugin.json files), git (assets CHANGELOG.md + plugin.json files; message
  "chore(release): ${nextRelease.version} [skip ci]"), github (successComment/failComment/failTitle false). VERIFIED vs spec §9.2.
- release.yml: on push branches [main]; concurrency group "release", cancel-in-progress false; top-level permissions contents: read;
  job permissions contents: write, issues: read, pull-requests: read; timeout-minutes 15; checkout fetch-depth 0, persist-credentials
  false; setup-node node-version 22; env GITHUB_TOKEN, npm_config_ignore_scripts "true"; run: npx --yes --package semantic-release@25.0.8
  --package @semantic-release/changelog@7.0.0 --package @semantic-release/exec@7.1.0 --package @semantic-release/git@11.0.1
  --package conventional-changelog-conventionalcommits@9.3.1 semantic-release. VERIFIED.
  BUT: commit-analyzer, release-notes-generator and github are NOT named/pinned; they come from semantic-release@25.0.8's own deps
  (registry.npmjs.org/semantic-release/25.0.8: "@semantic-release/commit-analyzer ^13.0.1", "@semantic-release/release-notes-generator ^14.1.0",
  "@semantic-release/github ^12.0.0", "@semantic-release/npm ^13.1.1"). The workflow comment itself: "The npx graph below is not lockfile-pinned".
  => spec "npx with every package pinned to an exact version" true only for the five named packages.
- release-notes.sh: POST repos/{repo}/releases/generate-notes (tag_name, target_commitish=GITHUB_SHA, previous_tag_name), drops the
  "**Full Changelog**" line, extracts /pull/N, GraphQL closingIssuesReferences for those PRs, appends "### Resolved issues". VERIFIED
  ("GitHub's PR list and the issues those PRs close").
- commitlint.yml runs on pull_request (wagoid/commitlint-github-action, .commitlintrc.yml). VERIFIED "commitlint enforces the format on every PR".
- Rulesets (gh api, unsandboxed): conventions-claude ruleset "protect-default-branch" target branch ~DEFAULT_BRANCH, rules [deletion,
  non_fast_forward], bypass_actors []; rook-claude same two rules. VERIFIED "rulesets carry only deletion and non-fast-forward".
## semantic-release source v25.0.8 (accessed 2026-10-08, gh api contents)
- lib/get-config.js:74 `tagFormat: \`v\${version}\``; lib/definitions/constants.js:3 `FIRST_RELEASE = "1.0.0"`; get-next-version.js:30
  version = FIRST_RELEASE when no previous release (non-prerelease branch). VERIFIED (first release only when a releasable commit exists).
- @semantic-release/git v11.0.1 README: default message `chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}`;
  reference overrides with notes dropped. Spec's stated message matches the reference.
## GitHub/tooling behaviour (accessed 2026-10-08)
- GITHUB_TOKEN: https://docs.github.com/en/actions/concepts/security/github_token, section "When GITHUB_TOKEN triggers workflow runs"
  (WebFetch): "events triggered by the GITHUB_TOKEN will not create a new workflow run, with the following exceptions:" workflow_dispatch,
  repository_dispatch (and pull_request opened/synchronize/reopened in approval-required state); "a new workflow will not run even when the
  repository contains a workflow configured to run when push events occur." A tag push is a push event. VERIFIED (spec §9.3).
- Required status checks: github/docs main content/.../managing-rulesets/available-rules-for-rulesets.md:172 "Required status checks ensure
  that all required CI tests are passing before collaborators can make changes to a branch or tag targeted by your ruleset."
  about-protected-branches.md:99 "After all required status checks pass, any commits must either be pushed to another branch and then merged
  or pushed directly to the protected branch." => a fresh release commit with no passing checks is rejected unless the pusher is a bypass
  actor. VERIFIED (spec §9.1) — nuance: a ruleset bypass actor would allow it; the spec presents rejection as unconditional.
- Pages: using-custom-workflows-with-github-pages.md:50,52 "The job must have a minimum of pages: write and id-token: write permissions."
  "An environment must be established to enforce branch/deployment protection rules. The default environment is github-pages."
  configuring-a-publishing-source...md:78 "If your repository does not already include an environment called github-pages, the environment
  will be created automatically. We recommend that you add a deployment protection rule so that only the default branch can deploy".
  Field reports (redis/redis-om-spring PR 660 via search): "Tag 'v1.0.1' is not allowed to deploy to github-pages" => tag deploys are
  blocked in practice by the auto-created environment. Spec states it only as a requirement + risk 4 — consistent. VERIFIED.
- Runner images: actions/runner-images images/ubuntu/Ubuntu2404-Readme.md (Image Version 20260927.320.1): "Google Chrome 154.0.8037.57",
  ChromeDriver, Chromium; README: ubuntu-latest = Ubuntu 24.04. VERIFIED. Node.js 22.23.3 preinstalled.
- Node.js schedule (nodejs/Release schedule.json): v22 lts 2024-10-29, maintenance 2025-10-21, end 2027-04-30; v24 lts 2025-10-28,
  maintenance 2026-10-20; v26 lts 2026-10-28. On 2026-10-08 Node 22 is maintenance LTS (EOL in ~7 months). "Node 22 LTS" true; nit.
- MathML: caniuse features-json/mathml.json: Chrome y from 109 (note 4: Chromium 109+ supports MathML Core only), Firefox y, Safari y,
  iOS Safari y. VERIFIED native support; nit: author to the MathML Core subset.
- Fonts: google/fonts ofl/oswald/METADATA.pb license "OFL", OFL.txt "SIL Open Font License, Version 1.1"; ofl/lato same, with
  'Reserved Font Name "Lato"'. VERIFIED. Nit: RFN means self-made subsetting/conversion of Lato is a Modified Version that may not
  carry the name; ship unmodified woff2 or rename.
## Nathan, "The Spin Decay of a Baseball" (spindown-rev1.pdf) (accessed 2026-10-08)
- https://baseball.physics.illinois.edu/spindown-rev1.pdf (pdftotext): eq (1) SRD = ω̇R²/v² = −λS; eq (2) λ = 2.0e-5 Smits, 2.5e-5 Tavares;
  eq (7) Tavares torque I ω̇ = −RρAC_M v²; eq (8) C_M = βS; eq (9) λ = βR³ρπ/(Mα) => λ ∝ ρ. VERIFIED physics basis of spec §5.2
  "scaled by ρ/ρ0 because the decay torque scales with dynamic pressure" (holds under the Tavares C_M = βS model; Smits & Smith's
  λ is a sea-level wind-tunnel constant, not itself density-scaled).
  Ref [2]: "Science and Golf II, Proceedings of the 1994 World Scientific Congress on Golf, edited by A. J. Cochran and M. R. Farraly
  (E&FN Spon., London, 1994), pp. 340-347." => second independent secondary confirmation of the page range.
## github-conventions canon (local clone, unchanged on remote main per compare) (accessed 2026-10-08)
- plugins/github-conventions/skills/github-conventions/references/new-repo.md: gh repo create empty; ruleset templates/ruleset.json
  (~DEFAULT_BRANCH, active, deletion + non_fast_forward); --delete-branch-on-merge; populate through a PR from `init` onto one empty root
  commit on main; LICENSE Apache-2.0; README skeleton; dependabot.yml (package-ecosystem github-actions), workflow-lint, codeql (when a
  supported language is present), dependency-review, scorecard, commitlint (+ .commitlintrc.yml and .github/tools/breaking-footer/main.go,
  a Go tool run by the commitlint workflow). VERIFIED spec §10 (spec omits the commitlintrc/breaking-footer files; not a factual error).
- references/workflows.md: Pinning (pinact), actionlint with shellcheck on PATH, top-level permissions contents: read, timeout-minutes on
  every job, persist-credentials: false. VERIFIED spec §9.4.
## Conventional Commits `style` type (accessed 2026-10-08)
- conventionalcommits.org v1.0.0 (content/v1.0.0/index.md:37-38): only fix/feat/BREAKING CHANGE are defined; "types other than fix: and feat:
  are allowed, for example @commitlint/config-conventional (based on the Angular convention) recommends build:, chore:, ci:, docs:, style:,
  refactor:, perf:, test:, and others." => `style` is not defined by Conventional Commits; its formatting meaning is the Angular convention's.
  Spec §9.2 "(style is Conventional Commits' code-formatting type ...)" — loose. Nit.
## NWS (accessed 2026-10-08, WebFetch)
- forecast.weather.gov glossary: Altimeter Setting = "A correction of the station pressure to sea level used by aviation."
- MapClick lat 39.7392 lon -104.9903: "Buckley Space Force Base (KBKF)", "Elev: 5577ft.", "Barometer 30.13 in (1013.8 mb)" — sea-level-reduced,
  inHg first (30.13 inHg = 1020.3 hPa, so the mb figure is a different reduction, SLP). VERIFIED spec §6 item 2.

## USSA 1976 Table I truncation (accessed 2026-10-08)
- NTRS PDF page 69 (printed page 54), Table I Geopotential Altitude, Metric: H 3000..3850 m' P(mb) column read from 200 dpi render
  (701.08, 696.63, 692.21, 687.81, 683.43, 679.08, 674.74, 670.43, 666.15, 661.88, 657.64, 653.41, 649.21, 645.04, 640.88, 636.75, 632.63, 628.54).
  Exact eq (33a): truncation to 5 s.f. matches 18/18, rounding 6/18. VERIFIED spec §8.1 'the tables truncate'.

## Independent re-implementation of spec §5.2–5.4 (reviewer script scripts/model.py, run 2026-10-08) [derived]
- Model exactly as spec: 2-D point mass, C_D = kD(0.24+0.18S), C_L = kL·0.54·S^0.4, dω/dt = −λ0(ρ/ρ0)Vω/r, λ0 = 2e-5, m 45.93 g,
  D 42.67 mm, g 9.80665, RK4 dt 0.01, cubic-Hermite apex/landing (bisection on the Hermite cubic), Newton 2x2 with FD Jacobian on
  (carry, apex) in yards.
- Integration error (vs dt = 1e-4): dt 0.01 → ≤ 6e-10 yd carry/apex, ≤ 2e-10 deg land (Driver, 7i, PW); dt 0.05 → ≤ 4e-7 yd.
  Spec "about 3×10⁻⁵ yd" is a conservative upper bound (nit).
- Calibration at ρ0 = 1.225 (ISA 15 °C): kD 0.889–1.223, kL 0.785–1.077 — reproduces the spec's "k_D 0.89–1.22, k_L 0.79–1.08" and the
  research probe (PGA Dr .889/.809, 7i 1.108/.920, PW 1.030/.785, LPGA Dr .941/.818). Newton converges in 3 iterations (≈10 flights/row OK).
  At ρ0 = 1.17732 (25 °C, 50 % RH, CIPM-2007 — the spec §5.1 reference): kD 0.925–1.273, kL 0.817–1.120 (every k × 1.0405). Altitude
  deltas identical at both ρ0. => the spec's envelope was computed at ISA 15 °C density, not at the spec's own 25 °C/50 % RH reference;
  LPGA 8 Iron kD 1.273 and LPGA PW kL 1.120 fall outside it. Spec never states the numeric ρ0 or how it is computed.
- Sea-level land-angle residual (model − table): PGA −1.1 Dr, −4.5 3W, −6.5 5W, −9.2 Hy, −7.5 3i, −7.0 4i, −5.9 5i, −5.5 6i, −4.4 7i,
  −3.6 8i, −3.9 9i, −3.3 PW; LPGA −1.5, −1.1, −4.7, −5.6, −4.0, −4.9, −4.2, −2.6, −0.2 (8i), −0.4 (9i), +0.7 (PW).
  => spec "1–9° shallower" wrong for LPGA 8i/9i (<0.5°) and LPGA PW (0.7° steeper); "worst for hybrids and long irons" OK.
- Oracles with this model (deltas, same-T): O1 PGA Dr 7,800 ft carry +8.8 % (band +5..+12 pass); O2 apex −15.6 % (pass); O3 land −7.9° (pass);
  O4 5,280 ft +6.4 % (pass); O5 PGA mean at 7,200 ft ≈ +10.8 % (pass); O6 7i 6,300 ft +11.2 % (pass); O8 4,920 ft 7i +8.9 %, Dr +6.0 % (pass);
  O11 LPGA Dr +4.5 % vs PGA +6.4 % at 5,280 ft (pass).
  O10 (hard on carry ±4 yd): PGA 6-iron factors flown at 130 mph/14.7°/6088 rpm → carry 188.4 yd vs 184 (+4.4 yd, FAILS the hard ±4 yd band),
  apex 33.2 vs 33.8 (pass), land 45.1 vs 48.0 (−2.9°, inside soft ±3°). LPGA → 153.9/27.4/43.9 vs 152/27.7/45.6 (pass). Same at both ρ0.
