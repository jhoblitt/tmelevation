# Published altitude-effect reference data for golf-ball flight

Purpose: independent, citable numbers for sanity-checking the tmelevation
trajectory model's altitude predictions (carry, max height, land angle) in
automated tests and on a documentation page. Research started 2026-10-08.

Conventions used below:

- **Primary** = read at the measuring/publishing party's own page.
  **Secondary** = seen only quoted by someone else (marked explicitly).
- "Carry" vs "total" is stated for every number; total distance includes roll
  and is confounded by turf firmness, so it is not a model oracle.
- Percentages are relative to sea level unless stated otherwise.

## Summary

- **The only published case that gives carry, apex and land angle together
  for one shot** is TrackMan's Justin Padjen's model run for a tour driver at
  7,800 ft (PGA TOUR, 2017). Carry 282 → 306 yd (+8.5%), apex 102 → 84 ft
  (−18%), land angle 38° → 29°. That driver closely matches the 2023 PGA
  driver row. Oracles 1–3 come from it.
- TrackMan staff, Titleist and the tour players' own yardage sheets all agree
  the gain is **club-dependent and bell-shaped**. Drivers, woods and wedges
  gain about 0.5–1.6% per 1,000 ft; tour 7–9 irons gain about 1.5–2.3% per
  1,000 ft. Higher launch gains more, slower swing speeds gain less.
- Titleist's widely quoted **0.00116 × feet** rule (1.16% per 1,000 ft) is
  the only rule of thumb with a named scientific author. The popular "2% per
  1,000 ft" / "10% at a mile" has no traceable origin.
- We found **no peer-reviewed study and no LPGA data** with quantitative
  altitude results. No source quantifies apex or land-angle change for irons.
- Tour driving-distance statistics are total distance and too confounded to
  use as oracles.

## 1. TrackMan's own statements

TrackMan publishes very little altitude data under its own name. The most
useful numbers are TrackMan staff's model outputs quoted by the PGA TOUR.

### 1a. Padjen driver simulation for WGC-Mexico (7,800 ft) — best single data point

PGA TOUR long-form "Elevated expectations", 2017-02-28 (no byline).
**Secondary**: a journalist quoting Justin Padjen "from Trackman", who
"has run the numbers for an average TOUR pro at 7,800 feet". Spin, launch ball
speed and temperature are not stated. The numbers are almost certainly
TrackMan's own trajectory model, the same one behind Normalization, not
measurements in Mexico. The article ran before the event.

| Driver, club speed 113 mph | Launch | Apex (ft) | Carry (yd) | Land angle | Land ball speed |
|---|---:|---:|---:|---:|---:|
| High trajectory, sea level | 10.7° | 102 | 282 | 38° | 65 mph |
| High trajectory, 7,800 ft  | 10.7° | 84 (−18%) | 306 (+8.5%) | 29° (−9°) | 75 mph |
| Low trajectory, sea level  | 8.9°  | 76  | 277 | 31° | 67 mph |
| Low trajectory, 7,800 ft   | 8.9°  | 60 (−21%) | 288 (+4.0%) | 22° (−9°) | 81 mph |

Same source: across the bag, high-trajectory players' carry rises "8 to 15
percent depending on the club", low-ball hitters' "4-12 percent". Padjen says
the gain is "more like a bell curve": wedges and long irons gain less than
mid and short irons.

Why it matters: the high-trajectory case is almost exactly the 2023 PGA
driver row (282 yd carry, 35 yd = 105 ft max height, 39° land angle). It is
also the only published source with apex and land-angle changes. Both fall
sharply at altitude: apex about −18 to −21%, land angle about −9°.

Caveats: no spin and no launch ball speed. The pre-2023 TrackMan PGA driver
average was 113 mph club speed, −1.3° attack, 167 mph ball speed and about
10.9° launch (GOLF.com, 2019-04-23, citing TrackMan; that average's spin
is in an image we could not read). Padjen's 113 mph cases were therefore
probably built around about 167 mph ball speed, 4 mph below the 2023 row.
The article uses 7,800 ft, while Chapultepec spans 7,603–7,835 ft.

Suggested test: see oracles 1–3 below. PGA Driver (171 mph, 10.4°, 2545
rpm) at 7,800 ft, same temperature as sea level: carry +5% to +12%, max
height 8–28% lower, land angle 5–13° shallower.

### 1b. TrackMan tour manager on the 2024 BMW Championship (Castle Pines, ~6,200–6,400 ft)

PGA TOUR, Paul Hodowanic, 2024-08-21. **Secondary**: a paraphrase of
TrackMan tour manager Harrison Shih.

- "Trackman's data shows the clubs most affected are the mid- and short-irons
  (6- to 9-irons)". Drivers and woods gain less because the ball flies lower
  and spends less time in the air.
- "For high ball hitters, some clubs may fly upwards of 15% further, and they
  may average over 10% across all clubs. Pros with a low ball flight may have
  no clubs that average over 10%."
- Shih: "The actual rule of thumb is there is no rule of thumb."

Suggested test (shape only): at 6,300 ft, the 7-iron and 8-iron percent carry
gain is at least the driver's, and the PW gain is at most the 7-iron's.

### 1c. TrackMan Support, "VG | Altitude in Course Play" (2026-06-15)

**Primary.** For The Reserve at Moonlight Basin ("2100m or 7000ft"; settings
show 7,198 ft): "the ball will travel roughly 10% further in the air than at
sea level." No club or temperature is given. It is a loose statement, but it is
TrackMan's own wording, and "in the air" means carry.

### 1d. TrackMan Normalization: defaults, plus two sea-level model tables

TrackMan blog "Normalization feature explained", 2014-07-09, **primary**. We
read the full HTML on 2026-10-08.

- "Normalization provides information on the trajectory assuming calm
  conditions at any altitude and temperature input by the user."
- "Normalization assumes the golfer is using a “premium” golf ball."
- "Normalization will always calculate the ball flight based on the launch
  data, initial trajectory, calm conditions, and the altitude and
  temperature listed in TPS. Default values are 77°F and sea level (0 feet
  altitude)."
- TrackMan Support, "Portal (Player) | How to De-Normalise Dynamic
  Reports" (2026-08-06), **primary**: "In the Player portal, all dynamic
  reports have all the distances normalized to 25°C, and sea-level
  altitude."

So TrackMan's altitude numbers come from its own trajectory model with a
premium ball. If the 2023 averages are normalized to 77 °F (25 °C) rather
than ISA 15 °C, the model's sea-level baseline density should match. The
atmosphere companion doc covers this.

The same post embeds two TrackMan-model tables. They show wind, not
altitude, but they are rare **full-launch-condition TrackMan outputs** at
sea level, calm, and presumably 77 °F. We read the images directly:

| TrackMan model, calm | Ball spd | Launch | Spin | Carry | Max height | Land angle |
|---|---:|---:|---:|---:|---:|---:|
| PGA TOUR 6 iron (−3.1° AoA) | 130 mph | 14.7° | 6088 rpm | 184 yd | 33.8 yd | 48.0° |
| LPGA Tour 6 iron (−1.5° AoA) | 110 mph | 18.6° | 5950 rpm | 152 yd | 27.7 yd | 45.6° |

The tailwind columns show the altitude-like signature of less relative air
force: lower apex and shallower landing. PGA 6-iron with a 20 mph tailwind:
207 yd, 26.1 yd apex, 32.7° land. These rows are good **sea-level**
calibration points for the aero model, independent of the 2023 table.

### 1e. "According to Trackman", 6% at 1,500 m (Golf Digest, 2025)

Luke Kerr-Dineen, Golf Digest, republished by Australian Golf Digest
2025-01-24. **Secondary**: a paraphrase of TrackMan with no link. We could not
find it on trackman.com: the sitemap's 225 blog URLs include no altitude
post.

- "golfers get a 6 percent distance boost from their shots at 1,500 metres
  (5,000 feet)"
- "a 150-metre shot will go about 159 metres"
- "Golfers with faster swings get closer to 10 percent more distance, while
  slower swings get closer to 5 percent."
- "The biggest boost comes with your middle and long irons."

The same piece attributes to TrackMan a temperature sensitivity of about 5 m
per 6 °C on a 160 m shot (~1.6% per 5 °C). That looks too large next to
other sources, so treat the whole article as loose.

### 1f. TrackMan's public blog has no altitude numbers

We filtered the full trackman.com sitemap (2026-10-08) for altitude, weather
and flight terms. The paragraph text of the matching posts (tour averages,
apex height, launch angle, carry) never mentions altitude, temperature or
measurement conditions.

### 1g. Second-hand "TrackMan University" study — low credibility

Golf Alcanada (club website), 2020-05-13: a third-hand summary with no link
and no numbers per club. It compares 0 m with 1,500 m. Amateurs' "flight gain"
never reached 7%, PGA Tour players reached up to 9%, and 7-iron gained the
most. **Unverifiable; do not use as an oracle.**

## 2. Other launch-monitor and ball makers

### 2a. Titleist / Acushnet (Steve Aoyama): the 0.00116 rule

Steve Aoyama is Principal Scientist, Golf Ball R&D, at Acushnet. His rule
appears in Team Titleist posts ("The Effect of Altitude on Golf Ball
Performance", "Golf Ball Aerodynamics and the Effect of Altitude") and in the
Titleist Learning Lab "Altitude and Ball Flight". **Every titleist.\* host
returned HTTP 403 to both WebFetch and curl, so we never read the primary
page.** The content below comes from search-engine excerpts and verbatim quotes
in GolfWRX (2019-02-17), GOLF.com (2018-03-01, 2019-02-19) and PGA TOUR
(2017-02-28). It is **secondary**, but the quotes agree word for word across
outlets.

- "multiplying the elevation (in feet) by .00116" gives the % distance gain
  over sea level, i.e. **1.16% per 1,000 ft, linear**.
- "Reno, at 1 mile elevation (5,280 ft.) the increase is about 6% (5,280 x
  .00116 = 6.1248). If you normally drive the ball 250 yards at sea level,
  you will likely drive it 265 yards in Reno." A search excerpt of the
  aerodynamics post says "carries"; the GolfWRX quote says "drive".
- "At 5,000 feet elevation, the air density is about 14 percent lower than at
  sea level, so the lifting force is also about 14 percent less and the hook
  or slice will curve about 14 percent less."
- Spin is not reduced at altitude, but lift is. The result is "a flatter
  trajectory on your longer shots, a more shallow angle of descent and
  greater roll".
- "The percent increase will be less for players with slower swing speeds
  and/or when hitting a shorter shot." On short approach and greenside shots,
  no adjustment is needed.

No launch conditions or temperature are disclosed. The 250-yd example implies
an amateur-to-average driver (about 150–155 mph ball speed). Credibility:
high-quality author, but a deliberately simplified one-number rule. It is
noticeably lower than TrackMan's and the tour players' numbers for tour-speed
irons (sections 1 and 3).

Suggested test (oracle 4): the PGA driver row at 5,280 ft gains carry of
+6.1% ± 2.5%. Aoyama gives no launch conditions, so applying his rule to a
tour driver is an approximation. The band is wide for that reason.

### 2b. TaylorMade: published caddie yardage sheets at Castle Pines (2024)

The data is in section 3a. TaylorMade is the publisher, but the numbers are
player and caddie planning yardages, not TaylorMade measurements.

### 2c. Foresight Sports, FlightScope, Garmin, Rapsodo, Full Swing, Bridgestone, Callaway

- Foresight blog "How Altitude Affects Golf Ball Distance" (2020-11-25),
  **primary**, no altitude measurements. Its baseline is a 250-yd drive at
  about 150 mph ball speed, about 2 yd per 10 °F, and "you can adjust 6-10%".
  Qualitatively, the ball flies lower and lands flatter. Not an oracle.
- FlightScope "Understanding FlightScope's Environmental Optimizer"
  (2024-06-21), **primary**, no numbers. "FS Normalized" uses FlightScope's
  standard sea-level conditions, whose values are not stated. Custom mode
  takes altitude or air pressure.
- Garmin (R10/R50), Rapsodo, Full Swing, Bridgestone, Callaway: no published
  quantitative altitude data found. User-forum posts confirm only that some
  devices have an altitude setting; the Garmin R50 setting goes up to
  10,000 ft.
- Andrew Rice (GOLF Top 100 Teacher), a TrackMan field study written up in
  GOLF.com. On 2018-12-14 (Kerr-Dineen) it said "With a driver, you get an
  extra 2.5 yards per 1,000 feet of altitude". On 2019-06-24 (Rice's own
  article) it said "Per every 1,000 feet of elevation change, expect to carry
  the ball an extra 4.5 yards". Both use 155 mph ball speed with "optimal
  launch", about 250 yd carry, i.e. 1.0% or 1.8% per 1,000 ft. **The two
  articles contradict each other.** Rice's own worked example (250 yd at sea
  level and 70 °F → 270 yd at 7,000 ft and 90 °F) matches the 2.5-yd figure,
  not the 4.5-yd one. Low-to-moderate credibility; use only as a loose
  bracket.

## 3. Pro-tour stats at high-altitude events

Correction to the brief: the BMW Championship was played at Castle Pines in
**2024** (Aug 22–25). The 2023 BMW was at Olympia Fields CC, Illinois (won
by Hovland; BMW Group press release), which is not an altitude venue.
Castle Pines is quoted at 6,000–6,400 ft depending on the source.

Three confounders apply to everything in this section:

- **Total vs carry.** ShotLink driving distance is total distance, bounce
  and roll included. At altitude the shallower land angle adds roll that a
  carry model does not predict (Titleist, Padjen), and fairway firmness
  varies by venue.
- **Measurement holes and topography.** Each event's driving distance comes
  from two measured holes, and their slope is unknown. Mountain venues have
  large elevation changes; Schauffele mentions "90-foot drops" at Castle
  Pines. Uphill and downhill shots change the effective gain: Scheffler said
  uphill gives "a smaller percentage" and downhill "a bigger percentage".
- **Weather and strategy.** Temperature matters: Ping's Marty Jertson says a
  round that starts at 75 °F and ends at 90 °F adds about 4 yd, and none of
  the sources state the temperature. Players may also change club off the
  tee when driver would run out of fairway. Fields differ from regular tour
  events (WGC, playoffs). Players deliberately change trajectory: Tiger
  added loft to his fairway wood for Mexico in 2019, and DeChambeau aimed for
  "above 15" degrees of launch in 2025.

### 3a. Castle Pines 2024: caddie yardage sheets (TaylorMade, 2024-08-22) — best tour data

TaylorMade Clubhouse, "Seen on Tour: Scottie, Rory, Collin & Tommy prepare
for altitude at the BMW Championship", Mike Esse, 2024-08-22. **Primary
publication of the players' own planning numbers.** The article does not
say how they were derived. Global Golf Post reported that players spent
that week "checking and rechecking their Trackman numbers". They are not an
independent measurement, and the article does not label them carry or total;
stock iron yardages are conventionally carry. The article says the
course is at "nearly 6,400 feet", and that Rory and his caddie used a "bell
curve" rather than a flat 10%.

| Club | Scheffler stock → altitude | Δ% | McIlroy stock → altitude | Δ% |
|---|---|---:|---|---:|
| Driver | 300 → 330 | +10.0 | 320 → 346 | +8.1 |
| 3-wood | 270 → 292 | +8.1 | 295 → 322 | +9.2 |
| 5-wood | — | — | 270 → 300 | +11.1 |
| 3-iron | 245 → 265 | +8.2 | — | — |
| 4-iron | 226 → 244 | +8.0 | 245 → 267 | +9.0 |
| 5-iron | 212 → 233 | +9.9 | 225 → 247 | +9.8 |
| 6-iron | 198 → 218 | +10.1 | 210 → 233 | +11.0 |
| 7-iron | 184 → 206 | +12.0 | 195 → 222 | +13.8 |
| 8-iron | 169 → 189 | +11.8 | 180 → 205 | +13.9 |
| 9-iron | 156 → 175 | +12.2 | 165 → 185 | +12.1 |
| PW / 46° | 144 → 158 | +9.7 | 150 → 165 | +10.0 |
| 50° | 131 → 142 | +8.4 | 140 → 151 | +7.9 |
| 54°/56° | 118 → 127 | +7.6 | 130 → 141 | +8.5 |
| 60° | 105 → 113 | +7.6 | 107 → 116 | +8.4 |

Two independent teams produce the same **bell curve**: woods and long irons
gain about 8–10%, the 7–9 irons peak at 12–14%, and wedges fall back to
about 8%. This matches TrackMan's description (section 1b). Scheffler's
stock 7-iron (184) and driver (300) are longer than the 2023 PGA averages
(176, 282), and McIlroy's more so. Expect them to sit at the high-speed,
high-gain end.

Suggested shape test: at 6,300 ft, the PGA 7-iron carry gain lies in
[+8%, +15%] and exceeds the PGA driver's gain. The PGA PW gain is below the
PGA 7-iron's.

### 3b. Crans-sur-Sierre, Omega European Masters (1,500 m ≈ 4,920 ft)

DP World Tour, "A numbers game — Players tackle altitude at Omega European
Masters", 2026-09-02. **Secondary**: a journalist quoting Marco Penge, whose
figures come from "a lot of work on the range with monitors". He gives "about
five percent in the wedges", "Seven-and-a-half per cent in the nine, eight,
seven and six iron and then five per cent for the rest" (woods). His stock
8-iron of 180 yd carries 190 (+5.6%). Temperature is not stated. The bell
curve shape appears again. The peak is +7.5% at about 4,900 ft, which is
1.5% per 1,000 ft for mid-irons and higher than Aoyama's 1.16%.

### 3c. WGC-Mexico (Chapultepec, 7,603–7,835 ft; 2017–2020) and LIV Mexico City (2025–26)

All of these are **secondary** or anecdotal:

- Caddie Ted Scott (Bubba Watson), GOLF.com 2019-02-19: "10 percent for
  Watson's 'low shots,' and closer to 15 percent on the ones that get
  launched into the stratosphere." GOLF.com 2018-03-01: "Other caddies and
  players echoed the 15% number, but the average is probably lower."
- LIV 2025 (McAllister): the course yardage book "references the 10%
  increase for ... Denver" and "15% for Club de Golf Chapultepec's nearly
  7,900 feet". Patrick Reed's 7-iron goes 185 → 210 (+13.5%). Dean Burmester:
  "The higher I hit it, I can get anywhere up to 20% ... if I flatten it out,
  it can be 10 to 12%."
- LIV 2026 (Vincenzi): "Most estimates suggest the ball carries anywhere from
  10-18% farther". Caddie Grant Bennett uses "13-17% per shot depending on
  distance and trajectory". Caleb Surratt says a flighted wedge gets "5% to
  8%" against a "normal 15% or 20%".
- Driving distance (total, confounded): DJ averaged 321.8 yd at the 2017
  WGC-Mexico. GOLF.com calls this both "almost 7 yards" and "16 yards" above
  his season average, so the article is self-inconsistent. A ShotLink figure
  quoted in a Titleist forum post makes Chapultepec the longest course for
  driver off the tee at 317.47 yd (season unclear).
- Justin Padjen's TrackMan model numbers for this venue are in section 1a.
- Pablo Larrazabal's Instagram post (2020-02-20, "Sea level VS Mexico City
  (Meter)"), seen via GolfMagic, which converted it to yards: driver 289 →
  322 yd **carry** (+11.4%) and 7-iron 180 → 211 (+17.2%, unlabeled). These
  are planning numbers for 7,600 ft.
- Webb Simpson (Golf Digest / Australian Golf Digest, 2020-02-21): "If I'm
  hitting it lower, we'll [adjust] 10 percent. If I'm hitting it higher,
  we'll play 16 percent." Bryson DeChambeau: "We use the normalised numbers
  we get on two devices on the range", so tour players take their altitude
  numbers from TrackMan Normalization.

### 3d. Reno-Tahoe (Montreux, 5,476–5,952 ft) / Barracuda (Tahoe Mountain Club, ~6,000 ft)

PGA TOUR 2017-02-28: Montreux in 2011 had the longest field driving-distance
average of the season, 314.7 yd, with 21.46% of drives over 320 yd. Waialae
the same year had 284.5 yd and 3.06%. That is +10.6% in **total distance**,
across different courses, fields and fairway conditions. **Unusable as an
oracle**, but directionally consistent. For the Barracuda, only a betting
preview's "around 6% further" turned up.

### 3e. The International (Castle Pines, 1986–2006)

- SI, 2003-08-18 (search excerpt only; the page returned 404): the ball flies
  "up to 15% farther". The PGA Tour excluded International tee shots from
  players' season driving-distance stats because the ball went so far.
- Golf News Net (Ballengee): "players would take 10 percent off of each
  yardage to match what they would normally hit at sea level." This is
  ambiguous between ×0.9 and ÷1.1. It is a rule of thumb, not data.

### 3f. Solheim Cup 2013 (Colorado GC, >6,100 ft) and LPGA at altitude

- Solheim 2013: only promotional "approximately 10% further" copy. No
  measurements or caddie numbers were found.
- 2011 U.S. Women's Open at The Broadmoor (~6,230 ft): the USGA pre-event
  piece says "approximately 15 percent more distance" at over 6,000 ft, and
  Golf Digest says "approximately 10 percent" at 6,500 ft. Both were seen
  only through search excerpts. Players disagreed, and several thought the
  effect was negligible because few shots there are level.
- **No LPGA-specific altitude data with numbers was found.** For the LPGA
  table, use the physics plus the TrackMan and Titleist statement that
  slower ball speeds gain a smaller percentage.

### 3g. Other Castle Pines 2024 color

Global Golf Post (2024-08-22) has Scheffler saying his 8-iron, 165 at home,
would go "like low 180s here" (+9–12%), and the "simple rule of thumb" of
about 10%. Ping (GOLF.com 2024-08-21) says the wind effect at altitude is
"roughly half as much as at sea level".

## 4. Academic and physics sources

**Finding: we found no peer-reviewed paper that publishes quantitative
golf-ball altitude results with stated launch conditions.** Roughly a dozen
targeted searches (Sports Engineering, Am. J. Phys., The Physics Teacher, Eur.
J. Phys., arXiv, Science and Golf proceedings, International Journal of Golf
Science, Penner's 2003 Rep. Prog. Phys. review, Wesson, Jorgensen, Cochran &
Stobbs, Tutelman/TrajectoWare, Spanish-language sources) surfaced only the
following:

- **Alan M. Nathan** (Prof. Emeritus of Physics, U. Illinois), "Baseball At
  High Altitude", c. 2007–2011, **primary physicist analysis, baseball not
  golf**. "The air density in Denver (5280 ft) is about 82% of that at sea
  level (0.0627 vs. 0.0764 lb/cubic ft at 70 deg F)". Fly balls carry "about
  5% farther at Coors than at Fenway". Use: an atmosphere cross-check. The
  82% matches the same-temperature pressure ratio at 5,280 ft (0.823); the
  ISA density ratio there is 0.854.
- **Steve Aoyama** (Acushnet) — industry scientist, not peer-reviewed; see
  2a. "At 5,000 feet ... air density is about 14 percent lower" matches the
  ISA density ratio at 5,000 ft (0.862, i.e. −13.8%).
- **Frank Thomas**, former USGA Technical Director, "Let's Be Frank" Q&A
  (Golf Channel, 2008-12-17), **primary expert estimate, model not
  disclosed**: "At 100 mph head-speed you will gain about 40 yards in total
  distance at 9,000 ft compared to sea level ... if you launch the ball at
  about 16 to 17 degrees compared to 13 degrees at sea level", against a
  240-yd sea-level drive, i.e. about **+17% total, with re-optimized
  launch**. He says the ball "needs to spin a little more and be launched a
  lot higher" at altitude. This is not a same-launch comparison, so it is
  not an oracle. It is useful as an upper bracket and as support for the
  optimal-launch-rises-at-altitude behavior.
- **Andrew Rice** (GOLF.com 2019): optimal driver spin rises "from 2,250
  RPMs at sea level to about 3,000 RPMs at 10,000 feet" (2018 write-up). This
  is the same qualitative claim.
- **Nike patent US 9,339,704 B2** (Yontz & Leech, filed 2012, granted
  2016-05-17), "Methods for selecting golf balls based on environmental
  factors". It reports trajectory simulations at sea level, an intermediate
  elevation and "high desert" for three balls. Its carry values exist only
  in FIG. 27, which is not reproduced in the text, and its elevations are not
  given numerically. **Not usable.**
- **A. R. Penner, "The physics of golf"**, Rep. Prog. Phys. 66 (2003)
  131–171. A review covering ball aerodynamics. Paywalled, not read. We
  could not confirm it treats altitude.
- **Lyu, Kensrud, Smith et al., "Aerodynamics of Golf Balls in Still Air"**,
  Proceedings 2(6):238 (ISEA 2018), doi:10.3390/proceedings2060238. It
  measures C_L and C_D for 13 balls at 18–91 m/s and 1,500–4,500 rpm. No
  altitude content, but the aero agent should know it.

Physics expectation, as a sanity check rather than an oracle: lift and drag
both scale with ρ. Lower ρ means less deceleration, which adds carry, and
less lift, which lowers apex, flattens descent and shortens hang time,
which costs carry. TrackMan's stated explanation for the bell curve (Shih,
via PGA TOUR 2024) is the second effect. For drivers and woods the lower
flight means "the ball doesn't stay in the air as long", which offsets much
of the drag benefit. We found no published decomposition of the two effects
by club.

## 5. Rules of thumb and their origins

| Rule | Implied at 5,280 ft | Origin traced to | Verdict |
|---|---|---|---|
| **1.16% per 1,000 ft** ("elevation_ft × 0.00116") | +6.1% | Steve Aoyama, Acushnet/Titleist golf-ball R&D; Team Titleist posts, quoted from 2017 onward | The only rule with a named scientific author. Linear and club-agnostic. Its 250→265 driver example is reasonable for an average-speed driver. It understates tour mid-irons. |
| **"1.2% per 1,000 ft"** | +6.3% | GOLF.com (Dethier, 2020-02-21): "Titleist conducted a study that determined golf balls travel roughly 1.2 percent farther for every 1,000-foot elevation gain ... a 200-yard carry will soar 212 instead". MyGolfSpy 2026 copies it. | A rounded restatement of Aoyama's 1.16%. No separate "study" document was found. |
| **"1.1–1.6% per 1,000 ft"** | +6–8% | MyGolfSpy 2026, no citations | Unsourced range. |
| **"1.7% per 1,000 ft"** | +9% | Golf Monthly 2024 and a travel blog, no citations (seen via search excerpts only) | Unsourced. |
| **"2% per 1,000 ft"** / "10% at a mile" / "loose 10 percent rule used for around 5,000 feet" | +10.6% | Repeated without citation: Golf News Net 2023–25, a Golf Digest designer-columnist 2017 ("subtract 2 percent ... every 1,000 feet"), CaddieHQ. PGA TOUR (2017) calls 10% at ~5,000 ft the historical caddie rule. | **No primary study found.** Probably caddie folklore from Denver-area events (The International, Cherry Hills). Too high for drivers, plausible for tour 7–9 irons. |
| **"10% at altitude"** (flat) | — | Caddie and player lore (The International "take 10 percent off of each yardage"), the TrackMan VG help page (about 7,000 ft), the Castle Pines 2024 coverage | TrackMan staff call it "rudimentary" and "no rule of thumb" (Shih); Padjen: "this generic notion that it is a straight 10 percent ... doesn't really hold true". |
| **"15% at Chapultepec" / "10% Denver"** | — | Chapultepec course yardage book (LIV 2025) and caddie Ted Scott | Tour lore, consistent with high-launch tour irons. |
| **"2.5 yd" or "4.5 yd per 1,000 ft" (driver, 155 mph)** | +5% / +9.5% | Andrew Rice TrackMan study, GOLF.com 2018 and 2019 | The two figures contradict each other; see 2c. |
| **"6% at 1,500 m; fast swings ~10%, slow ~5%"** | — | "According to Trackman", Golf Digest 2025 | Secondary, no primary found. |

Takeaways:

- The defensible "physics-ish" anchor is about 1.1–1.2% per 1,000 ft for an
  average driver (Aoyama), with tour irons running about 1.5–2.2% per
  1,000 ft (sections 3a–3c).
- "2%" is a folk rule with no origin. It roughly fits tour mid-irons but
  overstates drivers and wedges.
- Every source with real data says the gain depends on club and trajectory:
  higher launch and longer hang time gain more.

## 6. Max height, land angle and irons at altitude

### 6a. Max height and land angle

Only one quantified source exists: Padjen's TrackMan-model driver numbers
(section 1a).

| Driver at 7,800 ft vs sea level | Apex | Land angle | Land ball speed |
|---|---|---|---|
| High trajectory (10.7°) | 102 → 84 ft (**−17.6%**) | 38° → 29° (**−9°**) | 65 → 75 mph (+15%) |
| Low trajectory (8.9°) | 76 → 60 ft (**−21.1%**) | 31° → 22° (**−9°**) | 67 → 81 mph (+21%) |

Qualitative statements that all point the same way, though none quantifies
it for irons:

- Titleist/Aoyama: "flatter trajectory on your longer shots, a more shallow
  angle of descent and greater roll".
- PGA TOUR 2024 (TrackMan's Shih): the ball "flies lower" at altitude.
  Drivers and woods gain less because the ball "doesn't stay in the air as
  long".
- GOLF.com 2019: "more distance with a lower apex and extra rollout".
- Foresight 2020: "apex lower and land flatter".
- Padjen 2017: greens at Cherry Hills played firm "because of how shallow the
  ball was coming into the green because of the thin air".
- Ping (GOLF.com 2024): wind effect at altitude is "roughly half as much as
  at sea level".

**No published source quantifies apex or land-angle change for irons.** The
tests should therefore check only the sign and an envelope for irons: max
height lower than at sea level, land angle shallower, carry longer.
Exact-value assertions should be limited to the Padjen driver case.

No source says whether an iron's apex falls by a larger or smaller fraction
than a driver's. The docs page should present the model's prediction for
this as a prediction, and no test should assert it.

### 6b. Irons: carry gains (7-iron focus)

| Source | Elevation | 7-iron | Other irons | Type |
|---|---|---|---|---|
| Scheffler (TaylorMade 2024) | ~6,300 ft | 184 → 206 (+12.0%) | 5i +9.9, 6i +10.1, 8i +11.8, 9i +12.2, PW +9.7 | caddie planning sheet |
| McIlroy (TaylorMade 2024) | ~6,300 ft | 195 → 222 (+13.8%) | 5i +9.8, 6i +11.0, 8i +13.9, 9i +12.1 | caddie planning sheet |
| Marco Penge (DP World 2026) | 4,920 ft (1,500 m) | "7.5%" (6–9 irons) | wedges 5%, woods 5%; 8i 180 → 190 | launch-monitor range work |
| Patrick Reed (LIV 2025) | ~7,800 ft | 185 → 210 (+13.5%) | — | player quote |
| Larrazabal (Instagram 2020) | ~7,600 ft | 180 → 211 (+17.2%) | driver carry +11.4% | player planning sheet |
| TrackMan (Shih, 2024) | ~6,300 ft | "most affected" with the 6–9 irons; high-ball players "upwards of 15%" on some clubs | — | TrackMan staff, paraphrased |
| TrackMan (Padjen, 2017) | 7,800 ft | high trajectory 8–15% across the bag; low 4–12% | — | TrackMan model, paraphrased |

Converted to a per-1,000-ft rate, taking Castle Pines as 6,300 ft, tour
7-irons run **+1.5% to +2.3% per 1,000 ft**: Penge 1.52, Reed 1.73,
Scheffler 1.90, McIlroy 2.19, Larrazabal 2.26. Drivers and woods run +0.5%
to +1.6% per 1,000 ft: Padjen low 0.51, Penge woods 1.02, Padjen high 1.09,
Aoyama 1.16, McIlroy 1.29, TrackMan VG ~1.4 (not club-specific), Larrazabal
1.50, Scheffler 1.59.

**No LPGA iron data at altitude exists in what we found.** For the LPGA
table, the best available guidance is TrackMan's "slower swings get closer
to 5 percent" (secondary) and Aoyama's "less for players with slower swing
speeds".

## 7. Online altitude calculators with disclosed models

**None found that disclose a physics model and accept altitude.**

- **FlightScope Trajectory Optimizer** (trajectory.flightscope.com): a
  JavaScript app that says it is "based on scientific algorithms". The
  model is not disclosed, and its inputs were not readable without a
  browser. A human could run it in a browser and record outputs as an extra,
  independent-vendor cross-check. Not done here.
- **TrackMan Normalization / Optimizer**: inside TrackMan software (TPS,
  Shot Analysis, Portal). There is no public web calculator. The model is
  proprietary but is the one behind the target data.
- **Ping Ballnamic** (ballfitting.com): ball-fitting simulations that take
  "Typical Altitude" and temperature (by ZIP code) and run driver and
  7-iron trajectories. Its altitude article is a JavaScript single-page app
  whose text comes from a CMS. We did not retrieve the text, and the site's
  meta description is qualitative ("reduces air density, decreasing lift and
  drag ... longer carry").
- **Cornell SimScience golf applet**: no altitude input.
- Generic "golf altitude calculator" pages apply 1.1–2% per 1,000 ft with no
  physics disclosed, and many are SEO spam. **Unusable.**

## Recommended test oracles

Atmosphere convention for every oracle below: TrackMan Normalization changes
altitude and temperature independently and defaults to 77 °F. Unless a row
says otherwise, evaluate both the sea-level and the altitude case at the
**same temperature (77 °F / 25 °C)**, so the density ratio equals the
pressure ratio: 0.835 at 4,920 ft, 0.823 at 5,280 ft, 0.792 at 6,300 ft,
0.766 at 7,200 ft, 0.749 at 7,800 ft. Under ISA lapse-rate temperatures
the ratios are about 3–4% higher (0.791 at 7,800 ft). The bands below are
wide enough to absorb that choice, but each test should state which one it
uses.

| # | Oracle (input → expected) | Source & credibility | Band | Kind |
|---|---|---|---|---|
| 1 | **PGA Driver** (171 mph, 10.4°, 2545 rpm; 282 yd SL) at **7,800 ft** → carry **+8.5%** (≈306 yd) | TrackMan model via Padjen, PGA TOUR 2017 (secondary quote of TrackMan's own model; same carry and apex as our row; spin and ball speed unstated) | **+5% … +12%** (296–316 yd) | hard |
| 2 | Same shot → **max height falls ~18%** (35 → ~29 yd) | Padjen 2017 (only quantified apex source) | **−8% … −28%** | hard |
| 3 | Same shot → **land angle falls ~9°** (39° → ~30°) | Padjen 2017 (both trajectories −9°) | **−5° … −13°** | hard |
| 4 | PGA Driver at **5,280 ft** → carry **+6.1%** | Aoyama 0.00116/ft (Titleist, secondary-read but consistent quotes); Padjen scaled linearly ≈ +5.8% | **+3.5% … +8.5%** | hard |
| 5 | **Mean carry gain over the PGA bag** at **7,200 ft** ≈ **+10%** | TrackMan Support VG page (primary, "roughly 10% further in the air"); Castle Pines "standard assumption ... add 10 percent" | **+6.5% … +13%** | hard |
| 6 | **PGA 7-iron** (123 mph, 16.1°, 7124 rpm; 176 yd) at **6,300 ft** → carry **+12–14%** | Scheffler +12.0%, McIlroy +13.8% (TaylorMade-published caddie sheets; planning, not measured) + TrackMan's "mid/short irons most affected" | **+7% … +16%** | hard (wide) |
| 7 | **Bell-curve shape** at 6,300 ft: gain(7-iron) ≥ gain(Driver), and gain(PW) ≤ gain(7-iron) | TrackMan (Shih 2024, Padjen 2017) + both TaylorMade sheets + Penge (Crans) — five independent sources agree | ordering only | soft (warn, don't fail) |
| 8 | PGA 7-iron at **4,920 ft** (1,500 m) → **+7.5%**; PGA Driver → **+5%** | Marco Penge launch-monitor numbers at Crans (DP World Tour 2026, secondary); TrackMan-via-Golf-Digest "6% at 1,500 m" | 7-iron **+4% … +10%**; Driver **+3% … +7.5%** | hard (wide) |
| 9 | Sign/monotonicity, every club, both tours, 0 → 10,000 ft: carry ↑, max height ↓, land angle ↓, each monotone in elevation; elevation 0 reproduces the table | All qualitative sources (TrackMan, Titleist, Foresight, GOLF.com) + Padjen | exact sign | hard |
| 10 | **Sea-level calibration** (not altitude): TrackMan-model PGA 6 iron 130 mph / 14.7° / 6088 rpm → 184 yd, 33.8 yd height, 48.0° land; LPGA 6 iron 110 / 18.6° / 5950 → 152 yd, 27.7 yd, 45.6° | TrackMan blog tables (primary, read from images), calm, presumably 77 °F | carry ±4 yd, height ±3 yd, land ±3° | hard |

Notes on the bands:

- Oracles 1–3 are the only ones that tie carry, apex and land angle together
  for one shot from TrackMan's own model. The bands are wide because Padjen's
  spin and launch ball speed are unknown (about 167 mph at 113 mph club speed
  in that era vs 171 now) and the temperature is unstated.
- Oracle 6 comes from player planning numbers. Those may include habitual
  extras (warm weather, uphill and downhill expectations, trajectory
  changes), so the band is generous on the low side.
- If the model lands below the band for irons but inside it for drivers,
  that is a known-unknown, not proof of a bug. No source gives iron launch
  conditions alongside altitude carry.
- Oracle 10 is included because it tests the aero model at sea level against
  TrackMan's own model with fully specified inputs, independent of the 2023
  table. The 2023 PGA 6-iron row (130 mph, 14.0°, 6204 rpm → 188 yd, 32 yd,
  50°) carries 4 yd farther than the 2014 TrackMan model shot (130 mph,
  14.7°, 6088 rpm → 184 yd), despite lower launch and higher spin. The 2023
  table is an average of shots, not one model run of the average launch
  conditions, so the model cannot be expected to hit every row exactly.
- LPGA oracle: none is reliable. Use a **soft** check that the LPGA driver's
  percent gain at 5,280 ft is at most the PGA driver's plus 1 point.
  TrackMan, via Golf Digest, says "slower swings get closer to 5 percent",
  and Aoyama says "less for players with slower swing speeds". The LPGA
  driver's higher launch (12.6°) pushes the other way, so do not make this a
  hard test.

### Unusable as oracles, and why

- **Tour driving-distance stats** (Montreux 314.7 vs Waialae 284.5;
  Chapultepec 317.47 driver-off-tee; DJ 321.8). These are total distance
  with roll, measured on selected and often downhill holes, across different
  courses, fields, weather and firmness. Shallower landing at altitude also
  adds roll that a carry model omits.
- **Andrew Rice 2.5 vs 4.5 yd per 1,000 ft.** His two articles contradict
  each other, and the worked example matches only one of them.
- **"TrackMan University" study via Golf Alcanada.** Third-hand, no numbers
  per club, no link.
- **Frank Thomas +40 yd at 9,000 ft.** Total distance, with launch
  re-optimized (16–17° vs 13°), so it is not a same-launch comparison.
- **"2% per 1,000 ft", "10% at a mile", "15% at Chapultepec", LIV "up to
  20–25%".** Folklore with no traceable origin, mixing carry, total,
  trajectory changes and uphill/downhill.
- **USGA "approximately 15 percent" (Broadmoor 2011), the Solheim 2013
  "approximately 10%", the Barracuda "around 6%".** Pre-event or promotional
  estimates, no measurements.
- **Nike patent US 9,339,704.** Its numbers appear only in an unreproduced
  figure, and its elevations are unspecified.
- **Online "altitude calculators".** No disclosed model; they restate the
  rules of thumb.

## Sources

All accessed 2026-10-08. P = we read it at the primary source. S = we read
a secondary report or quote. X = only a search-engine excerpt, because the
page was blocked or missing.

TrackMan

- P: TrackMan blog, "Normalization feature explained", 2014-07-09 (full HTML
  and table images) — https://www.trackman.com/blog/golf/normalization-feature-explained
- P: TrackMan Support, "VG | Altitude in Course Play", 2026-06-15 — https://support.trackmangolf.com/hc/en-us/articles/51714287935387-VG-Altitude-in-Course-Play
- P: TrackMan Support, "Portal (Player) | How to De-Normalise Dynamic
  Reports", 2026-08-06 — https://support.trackmangolf.com/hc/en-us/articles/29414570963868-Portal-Player-How-to-De-Normalise-Dynamic-Reports
- P: TrackMan sitemap (no altitude posts) — https://www.trackman.com/sitemap.xml
- S: PGA TOUR, "Elevated expectations" (Padjen/TrackMan, Aoyama), 2017-02-28 — https://www.pgatour.com/article/news/long-form/2017/02/28/elevated-expectations-wgc-mexico-championship-altitude
- S: PGA TOUR, Paul Hodowanic, "Altitude adjustment ... BMW Championship"
  (Shih/TrackMan), 2024-08-21 — https://pgatour.com/article/news/latest/2024/08/21/altitude-adjustment-colorado-castle-pines-golf-club-elevation-challenge-bmw-championship
- S: Australian Golf Digest / Golf Digest, Luke Kerr-Dineen, "According to
  Trackman ... 6 percent at 1,500 metres", 2025-01-24 — https://www.australiangolfdigest.com.au/pro-golfers-calculate-their-yardages-golf-course-strategy-game-plan-golf-digest/
- S (low): Golf Alcanada, "How altitude affects your golf distance"
  ("Trackman University"), 2020-05-13 — https://www.golf-alcanada.com/news/current-news/how-altitude-affects-your-golf-distance/
- S: GOLF.com, "This is how far PGA and LPGA Tour players hit it with every
  club" (pre-2023 TrackMan averages), 2019-04-23 — https://golf.com/instruction/driving/this-is-how-far-pga-and-lpga-tour-players-hit-it-with-every-club/

Makers

- X/S: Titleist / Steve Aoyama, "The Effect of Altitude on Golf Ball
  Performance" and "Golf Ball Aerodynamics and the Effect of Altitude"
  (titleist.\* returned 403) — https://www.titleist.com/teamtitleist/b/tourblog/posts/the-effect-of-altitude-golf-ball-aerodynamics ,
  https://www.titleist.com/teamtitleist/gb/b/weblog/posts/the-effect-of-altitude-on-golf-ball-performance ,
  https://www.titleist.com/learning-lab/performance/altitude-and-golf-ball-flight
- S: GolfWRX, Ryan Barath (verbatim Aoyama quotes), 2019-02-17 — https://golfwrx.com/545618/tiger-woods-lofting-up-for-thin-air-examining-the-switch-and-what-happens-when-you-play-at-altitude/
- P (publisher) / planning data: TaylorMade Clubhouse, Mike Esse, "Seen on
  Tour: ... prepare for altitude at the BMW Championship", 2024-08-22 — https://taylormadegolf.fr/clubhouse/801423-seen-on-tour-scottie-rory-collin-tommy-prepare-for-altitude-at-the-bmw-championship.html?lang=fr_FR
- P: Foresight Sports, "How Altitude Affects Golf Ball Distance",
  2020-11-25 — https://www.foresightsports.com/how-altitude-affects-golf-ball-distance
- P: FlightScope, "Understanding FlightScope's Environmental Optimizer",
  2024-06-21 — https://flightscope.com/blogs/blogs/understanding-flightscopes-environmental-optimizer
- P: FlightScope Trajectory Optimizer (model undisclosed) — https://trajectory.flightscope.com/
- P (bundle and meta only): Ping Ballnamic altitude article — https://ballfitting.com/library/articles/altitude
- S: GOLF.com, Jonathan Wall, "Ping staffers have a genius cheat sheet at
  the BMW Championship", 2024-08-21 — https://golf.com/gear/ping-staffers-bmw-championship-yardage/

Tour events and players

- S: DP World Tour, "A numbers game - Players tackle altitude at Omega
  European Masters", 2026-09-02 — https://app.europeantour.com/dpworld-tour/news/articles/detail/a-numbers-game-players-tackle-altitude-at-omega-european-masters/
- S: GOLF.com, Jonathan Wall, "How elevation changes at the WGC-Mexico
  Championship...", 2019-02-19 — https://golf.com/news/wgc-mexico-championship-elevation-club-selection-bag-setup/
- S: GOLF.com, Kiley Bense, "Why the pros will be flying their irons 300
  yards this week", 2018-03-01 — https://golf.com/news/why-the-pros-will-be-flying-their-irons-300-yards-this-week/
- S: Australian Golf Digest / Golf Digest, Brian Wacker, "Here's what tour
  pros are doing in Mexico City...", 2020-02-21 — https://www.australiangolfdigest.com.au/heres-what-tour-pros-are-doing-in-mexico-city-to-adjust-to-playing-at-altitude/
- S: GolfMagic, Larrazabal sea level vs Mexico City (Instagram 2020-02-20) — https://www.golfmagic.com/golf-news/pablo-larrazabal-reveals-huge-carry-distances-ahead-wgc-mexico
- S: LIV Golf, Mike McAllister, "400-yard drives? It's likely in Mexico
  City's thin air", 2025 — https://www.livgolf.com/news/400-yard-drives-likely-mexico-city-thin-air
- S: LIV Golf, Matt Vincenzi, "Mastering the Thin Air...", 2026 — https://www.livgolf.com/news/mastering-the-thin-air-liv-golf-players-must-adjust-to-chapultepec-high-altitude-2026
- S: Global Golf Post, Ron Green Jr., "Playing percentages at mile-high
  Castle Pines", 2024-08-22 — https://www.globalgolfpost.com/featured/playing-percentages-at-mile-high-castle-pines/
- S: Arccos, "altitude impact decisions WGC Mexico", 2020-02-18 — https://uk.arccosgolf.com/blogs/community/altitude-impact-decisions-wgc-mexico
- S: Golf News Net, Ryan Ballengee, "How much farther does the golf ball fly
  at LIV Golf Mexico City?" — https://thegolfnewsnet.com/ryan_ballengee/2020/02/20/how-much-farther-golf-ball-flies-wgc-mexico-championship-103470/
- X: Sports Illustrated Vault, "Peak Performance ... 6,400 feet",
  2003-08-18 (404) — https://vault.si.com/vault/2003/08/18/peak-performance-as-the-tour-pros-are-reminded-every-year-during-the-international-golf-is-a-different-game-at-6400-feet
- X: USGA, "Altitude will play key factor at The Broadmoor", 2011-07
  (403) — https://www.usga.org/articles/2011/07/altitude-will-play-key-factor-at-the-broadmoor-21474838216.html

Physics and experts

- P: Alan M. Nathan, "Baseball At High Altitude" — https://baseball.physics.illinois.edu/Denver.html
- P: Frank Thomas, "Let's Be Frank" Q&A, Golf Channel/NBC Sports,
  2008-12-17 — https://www.nbcsports.com/golf/news/article-frank-thomas-lets-be-frank-5
- P: Nike patent US 9,339,704 B2 — https://patents.google.com/patent/US9339704
- S: Lyu et al., "Aerodynamics of Golf Balls in Still Air", Proceedings
  2(6):238 (2018) — https://doi.org/10.3390/proceedings2060238 (abstract via
  search only)

Rules of thumb

- S: GOLF.com, Dylan Dethier, "Titleist ... 1.2 percent", 2020-02-21 — https://golf.com/instruction/4-keys-playing-when-playing-at-elevation/
- S: GOLF.com, Luke Kerr-Dineen (Andrew Rice study), 2018-12-14 — https://www.golf.com/instruction/2018/12/14/how-hot-weather-elevation-change-affect-golf-shots-study
- S: GOLF.com, Andrew Rice, "Check the weather!", 2019-06-24 — https://www.golf.com/instruction/2019/06/24/weather-conditions-effect-golf-ball/
- S: MyGolfSpy, Brittany Olizarowicz, "Golf Distance Chart For Altitude",
  2026-04-21 — https://mygolfspy.com/news-opinion/instruction/golf-distance-chart-for-altitude-how-to-adjust-your-yardages/
- S: Golf News Net, Ryan Ballengee, 2025-04-25 — https://thegolfnewsnet.com/ryan_ballengee/2025/04/25/how-much-temperature-humidity-elevation-affect-how-far-golf-ball-flies-103715/
- X: Golf Digest, "Picking the Right Club at Elevation", 2017-12-29 (403) — https://www.golfdigest.com/story/picking-the-right-club-at-elevation
