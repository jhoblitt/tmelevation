# Land-angle spike, probe 3: provenance of the 2023 tour-average land-angle column

Started 2026-10-09. Question: how much of TrackMan's 2023 PGA/LPGA tour-average
land-angle column is a measurement, and how much is TrackMan model output?

Labels: **primary** = read at the publisher's own page or document;
**secondary** = seen quoted or summarised by someone else; **derived** =
computed here from cited numbers. Verified facts with sources are logged in
`provenance.md.notes.md`.

## 1. Summary

**Best estimate.** Read the 2023 land column as averaged *measured*
trajectories, each completed by TrackMan to the launch plane. The modelled
share is an unpublished tail at the end of the descent. It is probably small on
the driver rows; on the other rows its size is unknown. No row is evidently
model output. Confidence is low to medium, and one condition could overturn
it: if TrackMan normalized the 2023 data (TrackMan never says), every value in
the table, land angle included, would be model output.

Evidence:

- **Definitions** **[primary]**. TrackMan's land angle is taken where the
  trajectory crosses the *launch* elevation ("carry flat"). TrackMan reports
  "Last data", the point where tracking ended. When tracking ends before that
  crossing (an upslope, an elevated green, a lost track), the remainder is
  computed. TrackMan Baseball states the practice outright: "The radar follows
  the ball as long as possible, then physics-based trajectory modeling is
  applied". TrackMan Golf publishes no rule or statistic for this.
- **Driver rows: mostly measured** **[primary data, derived reading;
  medium confidence]**. They are dominated by competition tee shots (PGA TOUR's
  TrackMan system). The 2023 PGA driver row matches PGA TOUR's 2022-23 radar
  season in every shared column within 1–2 units. In that season 94% of tee
  shots with a measured apex also have a measured ground-impact carry. The
  driver rows have the smallest model gaps (−1.1°, −1.5°).
- **Non-driver rows: provenance unknown** **[derived; low confidence]**. They
  are probably range data. Before 2022 TrackMan's competition tracking covered
  tee shots only ("from tee boxes only", PGA TOUR 2022). Par-3 tee shots may
  have been included, which is unverified. No source says how clubs would be
  identified for approach shots. How often their descent was completed by a
  model is not known.
- **Against "the long-shot land column is TrackMan-model output"** **[derived;
  medium confidence]**:
  - The gap is not monotonic in carry. It is smallest on the longest shots
    (drivers) and differs by up to 8° between rows of equal carry.
  - It does not track flight time, which barely varies.
  - It is organised by spin and launch. Rows under 2,600 rpm sit at −1.1 to
    −1.5°; the low-launch, 4,300–4,800 rpm PGA 5-wood, hybrid and long irons
    sit at −6.5 to −9.2°.
  - Calibrated to TrackMan's own 2014 model 6-irons, our model lands within
    1–2° of them (physics-lit L4), yet the table sits up to 9° steeper than our
    model. The 6-iron rows of *both* the 2010 and 2023 editions
    are lower and steeper than TrackMan's 2014 model shot at nearly the same
    launch.
  - Land angles barely changed between the 2010 table (2007–09 data, TrackMan
    Pro) and the 2023 table (TrackMan 4 / PGA TOUR system): +0.9° PGA, −0.1°
    LPGA, uniform across clubs. Nothing there looks like a model step.
- **Compilation** **[primary]**:
  - 2023: "40+ different events and 200+ different players" (men), "30+" and
    "150+" (women), "from competition as well as on the range". Non-driver
    tee shots are filtered out, and stat holes run in opposite directions. No
    shot counts, no conditions, no per-column rules.
  - The original 2010 table (TrackMan News #6) says: "a combination of data
    collected from the range along with on course. Location and weather
    conditions are not considered". Its driver row is the PGA TOUR 2008
    competition average.
  - The 2019 edition is the 2010 table with new driver rows. Its non-driver
    rows are 2007–09 data. It carries the same "not been taken into
    consideration" disclaimer, which the 2023 edition drops without replacing.
- **Columns average different shot sets** in TrackMan's PGA TOUR competition
  data **[primary data]**. 2022-23 attempt counts: carry 113,979, apex and hang
  time 121,740, ball speed 121,746, club speed 52,551. This supports
  physics-lit U1's mechanism for the driver data. Whether TrackMan's own
  averaging has the same property is unstated.
- **Model revisions** **[primary]**:
  - 2009: normalization removed wind only.
  - 2014: altitude and temperature added, a "premium" ball baseline, and
    per-ball aerodynamic tables built from TrackMan's own radar tracks of robot
    and air-cannon shots.
  - 2025–26: normalizer and "Shared Calculator" updates. No changelog exists
    for 2014–2024.

**What the gap pattern suggests.** Something tied to spin and launch, that is
to club class, not to radar range: either the lift/drag law late in flight, or
a club-dependent provenance effect between range and competition data. The
second is unquantified.

## 2. How TrackMan measures landing

### The reported land angle is defined on the launch plane

TrackMan defines carry, landing angle, hang time and height against the
elevation the ball was launched from, not the ground where it lands
**[primary, TrackMan Support 2025]**:

- Carry: "The straight-line distance between where the golf ball was launched
  from and where it crosses a point that has the same elevation ... also often
  referred to as "Carry Flat"."
- Landing Angle: "The angle the golf ball lands at relative to the horizon and
  at a point that has the same elevation as where it was launched."
- Hang Time: "Time in seconds to carry flat."

The 2010 glossary (TrackMan News #7) uses the same definitions: landing angle
is the "descent angle of the ball as it lands (carry "flat" landing point)"
**[primary]**. The published land angle is therefore the angle at which the
trajectory crosses the launch plane, not the angle at which the ball strikes
the turf.

### Measured track, "Last data", and the unobserved tail

TrackMan also reports where its track ended. The 2010 glossary says
**[primary]**:

> "Last data: distance at which TrackMan last rec[or]ded data. If the range is
> sloping upwards last data should be shorter than carry "flat," if the range
> is sloping downwards and the TrackMan radar has a line-of-sight to the
> landing area last data should be longer than carry "flat""

The current support page calls it the "Last measurement of ball flight ...
useful in the diagnosis how fo[r] the ball was tracked" **[primary, 2025]**.
Hence, per shot:

- **Ball lands below the launch plane, radar has line of sight:** the
  launch-plane crossing lies on the measured track. The land angle is measured
  (interpolated).
- **Ball lands above the launch plane (upslope, elevated green), or the track
  ends early:** the stretch from Last data down to the launch plane is never
  observed. That stretch, and so the reported land angle, comes from a fit or
  model continued from the measured part **[derived from the definitions]**.

For golf, TrackMan publishes neither how that tail is computed nor how often it
happens. The only TrackMan statement describing the mechanism is for its
baseball product **[primary, TrackMan Baseball Support, 2026]**: "The radar
follows the ball as long as possible, then physics-based trajectory modeling is
applied to estimate the full flight path and determine where the ball would
land." An independent test of TrackMan's baseball radar (Nathan, Kensrud,
Smith and Lang, Baseball Prospectus, 2014) found that 27 of 73 fly balls were
not tracked to the ground. TrackMan "has a proprietary algorithm for extending
the trajectory beyond the last measured point". The extended landing distance
was good to 2.5 ft rms, but the landing angle was not tested **[secondary for
TrackMan internals]**.

### What TrackMan claims about tracking to landing (golf)

All **[primary]** unless marked:

- 2010: carry is "measured"; landing angle is one of the "parameters measured by
  TrackMan" that feed the calculated bounce and roll.
- 2014: "TrackMan measures every shot's actual trajectory from launch until
  landing".
- 2015 TrackMan 4 launch: the ball radar tracks "from launch to landing and
  everything in between" **[secondary, press release reproduced by
  golfrange.org]**.
- 2020: the unit must sit behind the player; "If it is in any other position,
  you will only be able to measure launch data. Full ball flight data will then
  have to be calculated."
- 2025: outdoors "the unit can track the entire flight of the ball". Indoors
  "the ball is only tracked until it hits the screen", and the rest is
  computed.

These are product claims. None states a tracking range or a rate of partial
tracks.

### Evidence that landings are sometimes missed in competition

PGA TOUR radar statistics come from TrackMan. They count attempts per
statistic. In 2022-23, apex height and hang time have 121,740 tee shots, while
carry ("Distance from tee to the point of ground impact") has 113,979
**[primary data]**. About 6% of tee shots with a measured apex have no
reported ground impact. Across 2007–2025 the shortfall ranges from 0.3%
(2020-21) to 18% (2007: 7,551 carries vs 9,245 apexes). It was 13–14% in
2013-14 and 2024. The likely reading is that landing was not captured, or failed
validation, on those shots **[derived]**. The radar data also show
that different statistics average different subsets of shots (section 3).

### Normalized values are wholly model output

TrackMan Normalization "will always calculate the ball flight based on the
launch data, initial trajectory, calm conditions, and the altitude and
temperature listed in TPS. Default values are 77°F and sea level" **[primary,
2014]**. TPS Shot Analysis shows normalized distances by default (77 °F / 25 °C,
sea level, no wind), and the Player portal normalizes "all the distances" to
25 °C and sea level **[primary, Support 2025–26]**. A normalized land angle is
entirely TrackMan-model output. Whether the tour averages are normalized is
covered in section 3.

The model itself is empirical. "Every golf ball has its own aerodynamic model
... the data collected over thousands of shots can be used to generate an
aerodynamic model of a particular golf ball ... A robot or air cannon is used to
slowly change the ball speed and spin rate. Then data is collected for all
possible combinations" **[primary, TrackMan News #10, Jan 2014]**. Normalization
"assumes the golfer is using a "premium" golf ball".

### Hardware generations

| Generation | Introduced | Relevance |
|---|---|---|
| TrackMan (Pro), software release 3.0 | 2007 ("full trajectory") | Collected the 2006/07–2009 data behind the 2010 table |
| TrackMan III / IIIe | end 2011 / 2012 | IIIe: "from 6 foot chip shots to 400 yard drives" |
| TrackMan 4 | Sept 2015 | Dual radar: one for the club, one for the ball |
| PGA TOUR TrackMan system | tee shots from 2006; every shot from 2022 | Source of the competition driver data |
| TrackMan iO | indoor, camera plus radar | Not relevant to tour data |

Sources: TrackMan News #1 (2007), #9 (2013), the 2015 press release and PGA TOUR
2022-02-02 **[primary/secondary as noted in the notes file]**. No document
compares how far each generation tracks the descent, or how each completes a
partial track.

**Bottom line.** For a full outdoor shot with the unit behind the golfer, a
TrackMan land angle is a measured trajectory carried to the launch plane. The
measured share of the descent depends on where the track ended and on terrain.
TrackMan publishes neither the completion rule nor its frequency for golf.

## 3. How the tour averages were compiled

### What TrackMan says about the 2023 edition

The post "Trackman Tour Averages" (dated 2024-05-02, tables titled 2023) says
**[primary, full HTML read]**:

- "Our team has been hard at work collecting data from a wide range of pro
  players, utilizing Trackman technology to capture every swing and shot with
  precision."
- "Male data is captured across 40+ different events and 200+ different
  players." "Data is captured at both PGA TOUR and DP World Tour events with
  majority coming from PGA TOUR events."
- "Female data is captured across 30+ different events and 150+ different
  players." "Data is captured at both LPGA and LET events with majority coming
  from LPGA events."
- "Averages are based on data from competition as well as on the range."
- "There are multiple processes in place to eliminate shots hit with a
  non-driver during competition." "There could be a small number of non-driver
  shots in the dataset (less than 0.5 percent)."
- "Official stat holes are picked going in opposite directions to reduce any
  effects from wind."

The post states no shot counts, date range or temperature, and nothing about
altitude normalization. It does not say whether every column averages the same
shots, or whether the descent is measured or calculated. The downloadable 2023
assets carry no footnote: the blog images, the 8000×4500 info-screen JPG and
the A1 poster PDF **[primary]**.

The non-driver and stat-hole bullets only make sense for **driver tee shots in
competition** **[derived]**. Nothing says how iron, hybrid or wood shots were
chosen, or whether any of them come from competition.

### What TrackMan said about the original edition (2010)

The earliest copy of the full table found is in TrackMan News #6, January 2010.
TrackMan News #5 (July 2009) has no such table **[primary]**:

> "The data listed on the Tour Pro Averages chart is a compilation of thousands
> of shots hit on TrackMan by PGA TOUR, European PGA Tour, LPGA Tour, and
> European LPGA Tour Professionals over the last several years. The data
> represents an average of all Tour Professionals. The data is a combination of
> data collected from the range along with on course. Location and weather
> conditions are not considered with regards to the data, but given the
> numerous amounts of locations and weather conditions involved, it is assumed
> that the overall effects are minor, if not completely neutralized."

The same article explains the sources: since 2006 TrackMan was "setup on at
least one hole each week to collect driving stats for the tour", and "in 2007,
TrackMan began also having a regular presence on the range during practice
rounds of PGA TOUR events". In 2006–09, then, competition data meant
driving-hole tee shots **[primary]**. The 2010 PGA driver row (112 mph /
165 mph / 11.2° / 2685 rpm / 39° / 269 yd) is the "PGA TOUR '08" average in
TrackMan News #4. It
also matches PGA TOUR's own 2008 radar averages (section 5). The 2010 LPGA
driver row (94 / 139 / 14.0°) matches the 2008 Navistar LPGA Classic field:
350+ competition drives "in hot conditions (around 90F)" **[primary]**.

The 2019 edition (linked from the 2023 post as "the last Tour Averages")
repeats the disclaimer: "Please be aware that the location (altitude) and
weather conditions have not been taken into consideration for the above data"
**[primary, image]**.

### Inferences about the 2023 table

All **[derived]**:

1. **Two populations.** The driver rows are dominated by competition tee
   shots. The 2023 PGA driver row agrees with PGA TOUR's 2022-23 radar season
   to within 1–2 units in every shared column (section 5). The non-driver rows
   most likely come mainly from the range. Pre-2022 competition tracking covered
   tee shots only: "from tee boxes only to shots hit from the fairway and around
   the green", PGA TOUR 2022-02-02. Par-3 tee shots, mostly irons, may have been
   among them; PGA TOUR's published radar statistics cover Par 4 and Par 5 tee
   shots only. From 2022 TrackMan traces every PGA TOUR shot, but nothing found
   says how TrackMan would know the club for an approach shot (unverified).
2. **Normalization: probably not, but unconfirmed.** Both earlier editions say
   explicitly that conditions were not taken into account. The 2023 edition is
   silent. Its driver row matches raw PGA TOUR radar data, but at tour-event
   conditions raw and normalized carries differ by about 1%, so this cannot
   decide the question. One argument cuts against pure normalization. If every
   value were normalized TrackMan-model output, each row would be close to one
   TrackMan-model trajectory. The physics-lit review (L4) showed that the
   6-iron rows are not: they carry 4 yd farther, sit 1 yd lower and land 4°
   steeper than TrackMan's own 2014 model shot at nearly the same launch. That
   holds unless TrackMan's model changed after 2014 (U4, section 4).
3. **Columns probably average different shot sets.** TrackMan's competition
   source does. In PGA TOUR's 2022-23 radar data the attempt counts per
   statistic are: club speed 52,551; ball speed 121,746; launch 121,745; spin
   116,974; apex, distance-to-apex and hang time 121,740; carry 113,979
   **[primary data]**. Unless TrackMan restricted its averages to shots with
   every column present (not stated), the 2023 land column averages a different
   subset from the launch columns. Landing is the column most often missing.
4. **The driver competition data are mostly tracked to the ground.** In 2022-23,
   94% of PGA TOUR tee shots with an apex also have a ground-impact carry.

### Shot counts and filters

Beyond "40+ events / 200+ players" (men) and "30+ / 150+" (women), no counts
are published. The 2010 text says "thousands of shots". TrackMan News #10
(2014) says "TrackMan has collected hundreds of thousands of shots from the best
male and female golfers". The only filter TrackMan describes is the removal of
non-driver tee shots, plus the opposite-direction stat holes for wind
**[primary]**.

## 4. Model revisions

What TrackMan has published about its ball-flight model over time
**[primary unless marked]**:

| When | What | Source |
|---|---|---|
| 2007 | Indoor TrackMan Launch "calculates the trajectory and landing data very accurately due to a world class ball flight model"; release 3.0 adds "full trajectory" | TrackMan News #1 |
| Jan 2009 | Normalization exists, but only removes wind ("the distance is simulated by taking out the wind"): a 20–30 mph headwind drive normalizes from 317.8 yd / 49.7° to 342.3 yd / 42.7° | TrackMan News #4 |
| Oct 2010 | Spin "drops during ball flight - typically 4% for each second" | TrackMan News #7 |
| Jan / Jul 2014 | Normalization extended to altitude and temperature (defaults 77 °F, sea level); "premium" ball; Ball Conversion for non-premium balls; per-ball aerodynamic model from robot/air-cannon radar data; Optimizer (non-driver shots optimized on carry and max height) | TrackMan News #10; blog 2014-07-09 |
| Sept 2015 | TrackMan 4, dual radar | press release **[secondary]** |
| 2022 | PGA TOUR every-shot tracing on TrackMan | PGA TOUR 2022-02-02 |
| 2025–26 | TPS release notes: "Made improvements to the Optimizer/Normalizer in TPS" (10.1.250); "Shared Calculator/Physics update ... to align with TPS 10.2" (10.1.255); "Normalization across TPS/VG regardless of radar (TM4/TMiO)" and "Updated Bounce & Roll" (10.2.195) | TrackMan Support, TPS release notes |

Findings:

- **No public changelog covers the aerodynamic model between 2014 and 2025.**
  The TPS release notes on the support site start with TPS 10.0 (early 2025).
  The only normalizer changes they list come after the 2023 table. Years are
  inferred from version order, because the notes give month and day only.
- **The normalizer and the "Shared Calculator" are revised from time to time**,
  so TrackMan's model is not frozen. The 2025–26 entries prove nothing about
  2014–2023.
- **The current "premium" ball category is still defined by ball lists that
  include long-discontinued balls** (Nike Tour, Maxfli BlackMax, Hogan Tour
  Deep) alongside Pro V1/V1x **[primary, Support "Ball Types for Ball
  Conversion", 2026]**. This weakly suggests the premium-ball baseline has not
  been rebuilt per ball generation, but it is not evidence about the
  aerodynamic tables themselves.
- **Implication for the land column.** Suppose land angles were largely model
  extrapolation. Then the 2010 values (TrackMan Pro hardware, 2007–09 model)
  and the 2023 values (TrackMan 4 and the PGA TOUR system, 2020s model) could
  differ whenever the model changed. Section 5 shows they agree within 0–2°,
  and those small differences follow the players' extra ball speed and apex.
  This is weak evidence: an unchanged model or a short extrapolated tail would
  give the same result.

## 5. Other editions and cross-checks

### There are only two independent editions of the non-driver rows

| Edition | Published | Data | Source |
|---|---|---|---|
| "2010" | TrackMan News #6, Jan 2010; also on trackmangolf.com (GolfWRX 2013: "pulled from the Trackman website in 2010") | 2006/07–2009 range and competition; driver = "PGA TOUR '08" | **[primary]** |
| "2019" | c. April 2019 (GOLF.com 2019-04-23; GolfMagic "this week released") | **Identical to 2010 in every non-driver land, height and carry value.** The other non-driver columns differ only by last-digit edits: PGA hybrid attack −3.3 → −3.5; LPGA 3-wood spin 2705 → 2704; LPGA 5-wood launch 12.2 → 12.1; LPGA PW launch 25.6 → 25.7; and eight changed LPGA smash values, some well away from ball/club speed (PW 1.28 against 86/70 = 1.23). Only the driver rows are new: PGA 113 / −1.3 / 167 / 10.9° / 2686 / 32 yd / 38° / 275; LPGA 94 / 3.0 / 140 / 13.2° / 2611 / 25 / 37° / 218 | **[primary image; dating secondary]** |
| "2023" | blog 2024-05-02 | new data throughout | **[primary]** |

No TrackMan table distinct from these three editions turned up. A "2009"
label most plausibly refers to the 2010 table, whose data run to 2009, but what
the "2009" and "2014" labels refer to is unverified (section 7). Comparing the
2019 and 2023 editions therefore compares 2007–09 data with 2020s data for
every non-driver row.

### Land angle, 2010 table vs 2023 table

**[primary inputs, derived differences]**

| PGA row | ball / launch / spin, 2010 → 2023 | max height (yd) | land (°) | carry (yd) |
|---|---|---|---|---|
| Driver | 165/11.2/2685 → 171/10.4/2545 | 31 → 35 | 39 → 39 | 269 → 282 |
| 3-wood | 158/9.2/3655 → 162/9.3/3663 | 30 → 32 | 43 → 44 | 243 → 249 |
| 5-wood | 152/9.4/4350 → 156/9.7/4322 | 31 → 33 | 47 → 48 | 230 → 236 |
| Hybrid | 146/10.2/4437 → 149/10.2/4587 | 29 → 31 | 47 → 49 | 225 → 231 |
| 3 Iron | 142/10.4/4630 → 145/10.3/4404 | 27 → 30 | 46 → 48 | 212 → 218 |
| 4 Iron | 137/11.0/4836 → 140/10.8/4782 | 28 → 31 | 48 → 49 | 203 → 209 |
| 5 Iron | 132/12.1/5361 → 135/11.9/5280 | 31 → 33 | 49 → 50 | 194 → 199 |
| 6 Iron | 127/14.1/6231 → 130/14.0/6204 | 30 → 32 | 50 → 50 | 183 → 188 |
| 7 Iron | 120/16.3/7097 → 123/16.1/7124 | 32 → 34 | 50 → 51 | 172 → 176 |
| 8 Iron | 115/18.1/7998 → 118/17.8/8078 | 31 → 33 | 50 → 51 | 160 → 164 |
| 9 Iron | 109/20.4/8647 → 112/20.0/8793 | 30 → 32 | 51 → 52 | 148 → 152 |
| PW | 102/24.2/9304 → 104/23.7/9316 | 29 → 32 | 52 → 52 | 136 → 142 |

PGA, 2010 → 2023: ball speed +3.3 mph, max height +2.4 yd, carry +5.9 yd, land
+0.9° on average (range 0 to +2°). Launch and spin are essentially unchanged.
LPGA: ball speed +2.3 mph, height +1.1 yd, carry +3.9 yd, land −0.1° (range
−1 to +1°). The LPGA land column is identical in 8 of 11 rows.

Reading **[derived]**: none of the land-angle changes looks like a model step.
They are small, have the sign expected from faster, higher shots, and are
uniform across clubs. The 2010 data came from TrackMan Pro hardware with the
2007–09 software. The 2023 data came from TrackMan 4 and the PGA TOUR system.
If the land column were dominated by model extrapolation and the model had
changed in between, a club-dependent shift would be expected. None is seen.
This does not rule out an unchanged model, or a model whose share of each
descent is small.

### The table-versus-TrackMan-model inconsistency exists in both editions

TrackMan's own 2014 model 6-irons **[primary]** compared with the two table
editions:

| | ball / launch / spin | carry | max height | land |
|---|---|---|---|---|
| TrackMan model, PGA 6-iron (2014) | 130 / 14.7 / 6088 | 184 | 33.8 | 48.0 |
| Table 2010, PGA 6 Iron | 127 / 14.1 / 6231 | 183 | 30 | 50 |
| Table 2023, PGA 6 Iron | 130 / 14.0 / 6204 | 188 | 32 | 50 |
| TrackMan model, LPGA 6-iron (2014) | 110 / 18.6 / 5950 | 152 | 27.7 | 45.6 |
| Table 2010, LPGA 6 Iron | 109 / 17.1 / 5943 | 152 | 25 | 46 |
| Table 2023, LPGA 6 Iron | 111 / 16.7 / 5904 | 155 | 25 | 46 |

Both editions sit lower and land the same or steeper than TrackMan's model
shot, for nearly equal launch. The 2010 PGA row carries as far with 3 mph
*less* ball speed. So the "longer or equal, lower, steeper" pattern of
physics-lit L4 is not a property of the 2023 data or of TrackMan 4. It
appears in data collected 13+ years apart on different hardware **[derived]**.

### PGA TOUR radar statistics (TrackMan-measured tee shots)

PGA TOUR publishes radar statistics for Par 4 and Par 5 tee shots: club speed,
ball speed, smash, launch, spin, distance to apex, apex height, hang time and
carry. **It publishes no descent or landing angle.** Carry and hang time run
"to the point of ground impact" (not carry flat), and apex is "relative to the
tee" **[primary, pgatour.com; past seasons via the site's own GraphQL
endpoint]**.

| Season | club | ball | launch | spin | apex (yd) | hang (s) | carry | carry / apex attempts |
|---|---|---|---|---|---|---|---|---|
| 2008 | 112.33 | 165.22 | 11.26 | 2670 | 30.2 | 6.2 | 268.8 | 11,595 / 12,246 |
| 2013-14 | 113.02 | 167.18 | 11.01 | 2619 | 32.7 | 6.2 | 272.6 | 10,057 / 11,538 |
| 2017-18 | 113.74 | 169.17 | 11.06 | 2641 | 35.1 | 6.3 | 277.6 | 9,977 / 10,412 |
| 2018-19 | 114.09 | 170.25 | 9.98 | 2637 | 33.1 | 6.35 † | 279.8 | 16,162 / 16,726 |
| 2022-23 | 115.08 | 172.85 | 10.49 | 2571 | 34.0 | 6.4 | 283.8 | 113,979 / 121,740 |

† The published 2018-19 hang-time average reads "1.4", and 2024 reads "2.3".
Both are data errors on pgatour.com. The value shown is the attempt-weighted
mean of the player averages.

Cross-checks **[derived]**:

- **2023 PGA driver row vs PGA TOUR 2022-23**: club 115 vs 115.08; ball 171 vs
  172.85; smash 1.49 vs 1.504; launch 10.4 vs 10.49; spin 2545 vs 2571; max
  height 35 vs 34.0 yd; carry 282 vs 283.8 (ground impact). Every shared column
  agrees within 1–2 units. TrackMan's set adds DP World Tour and range shots.
  Land angle cannot be cross-checked because PGA TOUR does not publish it.
- **2010 PGA driver row vs PGA TOUR 2008**: 112 / 165 / 11.2° / 2685 / 31 yd /
  269 against 112.33 / 165.22 / 11.26° / 2670 / 30.2 yd / 268.8. These are the
  same data.
- **2019 PGA driver row** (113 / 167 / 10.9° / 2686 / 32 yd / 275) lies between
  the 2013-14 and 2017-18 seasons. It is probably a multi-season blend; not
  verified.
- **Extra shape data for the 2023 driver** (not in the TrackMan table): hang time
  6.4 s to ground impact, and distance to apex 186.0 yd. The ratio of means puts
  the apex at 186.0 / 283.8 = 65.5% of carry. These are measured averages of
  PGA TOUR tee shots, usable as soft checks on a driver trajectory **[primary
  data; ratio derived]**.
- TrackMan's own summary for 2021 (YTD May 2021, "each player is represented
  with his avg. number"): club 114.3, ball 170.8, carry 280.3 **[primary,
  Support article images]**. This is consistent with the PGA TOUR series.

No LPGA or LET radar statistics with apex, carry or landing were found.

## 6. Gap-pattern analysis

Inputs: the BRIEF's land gaps (model − table, sea level, model calibrated per
row to carry and max height) and the 2023 rows. The computations are simple
and reproducible from the table below; they were run in a throwaway script
that was not kept. Everything here is **[derived]**.

### What "long shots extrapolated by a model" would predict

Suppose the radar loses the ball more often, and earlier, the farther away it
lands, and the missing tail is filled in by a model that lands steeper than
ours. Then the gap should grow with carry distance (radar range) and with
flight time, whatever the club. The driver rows, the longest carries in each
tour, should be the worst.

There is a second consequence. Physics-lit L4 found that our model, calibrated
to TrackMan's own model shot, lands within 1–2° of TrackMan's model. So rows
whose land angles were mostly TrackMan-model output should show *small* gaps,
not large ones.

### What the numbers show

| Row | carry | max H | land | gap | | Row | carry | max H | land | gap |
|---|---|---|---|---|---|---|---|---|---|---|
| PGA Driver | 282 | 35 | 39 | −1.1 | | LPGA Driver | 223 | 26 | 36 | −1.5 |
| PGA 3-wood | 249 | 32 | 44 | −4.5 | | LPGA 3-wood | 200 | 25 | 38 | −1.1 |
| PGA 5-wood | 236 | 33 | 48 | −6.5 | | LPGA 5-wood | 189 | 25 | 43 | −4.7 |
| PGA Hybrid | 231 | 31 | 49 | −9.2 | | LPGA Hybrid | 178 | 25 | 45 | −5.6 |
| PGA 3 Iron | 218 | 30 | 48 | −7.5 | | — | | | | |
| PGA 4 Iron | 209 | 31 | 49 | −7.0 | | LPGA 4 Iron | 175 | 25 | 43 | −4.0 |
| PGA 5 Iron | 199 | 33 | 50 | −5.9 | | LPGA 5 Iron | 166 | 25 | 45 | −4.9 |
| PGA 6 Iron | 188 | 32 | 50 | −5.5 | | LPGA 6 Iron | 155 | 25 | 46 | −4.2 |
| PGA 7 Iron | 176 | 34 | 51 | −4.4 | | LPGA 7 Iron | 143 | 26 | 47 | −2.6 |
| PGA 8 Iron | 164 | 33 | 51 | −3.6 | | LPGA 8 Iron | 133 | 27 | 47 | −0.2 |
| PGA 9 Iron | 152 | 32 | 52 | −3.9 | | LPGA 9 Iron | 123 | 27 | 48 | −0.4 |
| PGA PW | 142 | 32 | 52 | −3.4 | | LPGA PW | 111 | 27 | 48 | +0.7 |

1. **Not monotonic in carry.** Mean gap by carry bin, both tours: 100–150 yd
   −1.2° (n = 5); 150–180 −4.4° (7); 180–210 −4.8° (5); 210–240 −6.2° (4);
   240–290 −2.8° (2). The longest shots have among the smallest gaps. Correlation
   with carry over all 23 rows is weak (Pearson −0.43, Spearman −0.54). It
   becomes strong (−0.76 / −0.80) only when the two driver rows are removed.
   That is the opposite of what a range-driven explanation needs: the driver is
   the row it predicts to be worst.
2. **Matched carry, very different gaps.** LPGA driver 223 yd −1.5° vs PGA
   3-iron 218 yd −7.5° vs PGA hybrid 231 yd −9.2°. LPGA 3-wood 200 yd −1.1° vs
   PGA 5-iron 199 yd −5.9° vs PGA 4-iron 209 yd −7.0°. At equal radar range the
   gap differs by up to 8°.
3. **Flight time barely varies.** Apex heights are nearly constant within a
   tour (PGA 30–35 yd, LPGA 25–27 yd). A drag-free flight-time proxy,
   2·√(2H/g), spans only 4.7–5.1 s (PGA) and 4.3–4.5 s (LPGA). Flight time
   cannot drive a 1–9° spread between rows.
4. **The gap tracks spin and club class.** The three rows with spin below
   2,600 rpm (PGA driver, LPGA driver, LPGA 3-wood) have gaps of −1.1, −1.5 and
   −1.1°. Inside one class and one tour: LPGA 3-wood (2,595 rpm, 200 yd)
   −1.1° vs LPGA 5-wood (4,320 rpm, 189 yd) −4.7°. The worst rows are the
   low-launch, mid-spin clubs: PGA 5-wood, hybrid and 3–4 irons, launched at
   9.7–10.8° with 4,300–4,800 rpm (−6.5 to −9.2°). High-spin short irons are
   moderate (PGA −3.4 to −3.9°) or nil (LPGA −0.4 to +0.7°). Mean gap by class:
   PGA wood −5.5, hybrid −9.2, long iron −7.2, mid iron −5.3, short iron −3.6;
   LPGA wood −2.9, hybrid −5.6, long iron −4.0, mid iron −3.9, short iron 0.0.
5. **What the table rows imply about apex position.** Treat the descent as a
   parabola from the apex: tan θ_land ≈ 2H / ((1 − f)·C). Solving for the apex
   fraction f from the table's own H, C and land gives a driver f of 0.69. The
   measured PGA TOUR ratio is 0.655, so the formula overstates f by about 0.04.
   For the PGA 5-wood, hybrid and 3-iron, f is 0.75–0.77; for the PGA PW 0.65;
   for the LPGA PW 0.56. Across all rows, gap vs f has Pearson −0.88. The
   largest gaps are on exactly the rows whose table triples imply the latest
   apex, while our model puts the apex at 61–67% of carry on every row. This is
   close to a restatement of the gap, but it locates the problem: the table
   asks for a late apex and a short, steep descent on low-launch, mid-spin
   shots.

### Reading

The gap pattern does **not** look like long shots extrapolated by a model. It
is non-monotonic in distance, smallest on the longest shots, unrelated to
flight time, and organised by launch and spin, that is, by club class. Two
explanations fit this shape **[derived; the two are not exclusive]**:

- **Aerodynamics.** A lift/drag law that misbehaves late in flight for
  moderate-spin, low-launch shots, consistent with the BRIEF's own diagnosis.
- **Club-dependent provenance.** The driver rows (smallest gaps) are mostly
  competition tee shots. The other rows are probably range data (section 3).
  A range-specific effect could produce a club-dependent pattern. Candidates:
  terrain-dependent completion to the launch plane, selection of fully tracked
  shots, or column-wise averaging over different subsets. Its size is not
  established. The physics-lit review bounded dispersion averaging at −0.45°
  (wrong sign) and wind at ≤ 0.5°. The other candidates are unquantified.

What argues against "the land column is TrackMan-model output" for the
large-gap rows is point 2 of the prediction above. Model output would sit
within 1–2° of our model, but the table sits 4–9° steeper. And the 6-iron rows
of both editions are steeper than TrackMan's own model shot at the same launch
(section 5).

## 7. Unverified

- **How TrackMan golf completes a partial track** (fit to the measured points,
  or its aerodynamic model), and how often outdoor full shots end before the
  launch plane. No golf document found; the only explicit statement is for
  baseball.
- **Whether the 2023 table is normalized** (77 °F / 25 °C, sea level, calm).
  The 2023 post and assets are silent. Both earlier editions say conditions
  were not considered. If the table is normalized, every land angle in it is
  model output computed from launch data.
- **Whether each 2023 column averages the same shots.** It is not stated. The
  PGA TOUR radar data TrackMan draws on have different attempt counts per
  statistic.
- **The range/competition split by club**, shot counts, date range and event
  list for 2023. Only "40+ events / 200+ players" (men) and "30+ / 150+"
  (women) are published. That non-driver rows are mainly range data is an
  inference.
- **How TrackMan would identify the club** for competition approach shots
  (2022+ every-shot tracing). Not found.
- **What the 6% of 2022-23 PGA TOUR tee shots without a carry are.** Untracked
  landings and failed validation both fit. The pgatour.com definitions say only
  "where a valid radar measurement was taken".
- **TrackMan ball-model changes 2014–2024.** No public changelog was found. The
  support-site release notes start in 2025.
- **What the "2009" and "2014" tour-average labels used elsewhere refer to.**
  Only the 2010 (TrackMan News #6), 2019 and 2023 editions were found. The
  2013 TrackMan newsletter PDF returned 404 from the Wayback Machine.
- **The 2019 driver rows' data window.** They fall between the PGA TOUR
  2013-14 and 2017-18 seasons; this is not documented.
- **The generation comparison for landing** (TrackMan Pro vs III/IIIe vs 4):
  tracking reach and how each completes a track are undocumented.
- **Radar physics** (derived, not TrackMan-documented): a ground-level Doppler
  radar measures elevation worst at grazing angles near the end of a long
  flight (multipath). The last part of the descent is therefore the part most
  likely to be fitted rather than observed. Plausible, unquantified for
  TrackMan.
- **LPGA/LET radar statistics.** None found, so the LPGA rows have no external
  cross-check.
- **pgatour.com data errors.** The published 2018-19 (1.4 s) and 2024 (2.3 s)
  hang-time averages are wrong. The attempt-weighted 2018-19 mean is used
  instead.

### Method notes

- Primary TrackMan sources were read from TrackMan's own pages, newsletter PDFs
  (TrackMan News #1–#10, 2007–2014, via the Wayback Machine) and its Zendesk
  help-center API.
- PGA TOUR radar seasons were read from the site's own page data and from its
  anonymous web GraphQL endpoint (the one its stat pages call).
- All verified facts, with URLs, are in `provenance.md.notes.md`.
