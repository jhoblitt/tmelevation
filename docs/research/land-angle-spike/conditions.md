# Land-angle spike, round 2 (R2-2), schedule side: the air each tour plays in

Started 2026-10-09. Question: if the 2023 tour averages come mostly from
real tournament venues, what effective air density does each tour's schedule
imply, relative to 25 °C at sea level?

Labels: **primary** = read at the publisher's own page, document or data
service; **secondary** = quoted or summarised by someone else; **derived** =
computed here. Per-event data are in `conditions.csv`; verified facts and
sources are in `conditions.md.notes.md`.

## 1. Summary

**Assumption.** Suppose the 2023 averages come from real tournament venues
under actual conditions; TrackMan never says it normalized them. Then the most
likely schedules are:

- **PGA TOUR:** the 40 events with radar data in the 2022-23 season, September
  2022 to November 2023. This is the season whose radar averages match the
  2023 driver row, and its count matches TrackMan's "40+ events".
- **LPGA:** the 32 official events of 2023, matching TrackMan's "30+ events".

DP World Tour and LET events are unidentified and excluded.

**Air density relative to 25 °C at sea level** **[derived]**, from moist air
over competition-day daytime hours, using actual reanalysis weather for each
event week:

| | Mean ratio | Eq. elevation at 25 °C | SD across events | Range |
|---|---|---|---|---|
| PGA TOUR (40, equal weight) | 0.992 | 69 m | 0.033 | 0.906–1.062 |
| LPGA (32, equal weight) | 0.994 | 53 m | 0.026 | 0.911–1.035 |
| **PGA − LPGA** | **−0.002** | 16 m | | |

- **Weighting barely matters.** Across radar-attempt weighting (PGA), rounds
  weighting (LPGA), calendar-2023-only, US-only, no-Asia and
  all-official-events variants, each mean moves by ≤ 0.003. The PGA − LPGA
  difference spans −0.004 to +0.001, so even its sign is not robust. The
  daytime-versus-24-hour choice moves both means by 0.6%, more than any
  weighting.
- **Both tours play in near-reference air on average.** Venues average about
  150 m (pressure −1.3 to −1.5%). They are cooler than 25 °C (+1.25%) and
  humid (−0.6%).
- **The schedules cannot supply a tour-shaped density difference larger than
  about 0.5%.** That holds unless TrackMan's unidentified DP World Tour or LET
  events include high-altitude stops, about −0.004 per such event.
- **Events that pull the means:**
  - thin: Las Vegas (PGA Shriners ×2 at TPC Summerlin, 820 m, 0.906 and
    0.923; LPGA Match-Play at Shadow Creek, 604 m, 0.911), hot weeks (TOUR
    Championship 0.940), Walmart NW Arkansas and Evian (0.95);
  - dense: cold late-season and winter events (RSM 2022 1.062; AmEx, Pebble
    Beach, Genesis, BMW Ladies, U.S. Women's Open 1.03–1.05).

  No single event moves a tour mean by more than 0.003. The Barracuda (1,803 m,
  0.810) is the only truly high PGA event, and it has no radar data.

## 2. Which seasons and events

**PGA TOUR: the 40 events of the 2022-23 radar season** **[primary data;
choice derived]**. This choice rests on three findings:

- The 2023 table's PGA driver row matches PGA TOUR's 2022-23 radar season
  (pgatour.com "year 2023", displaySeason "2022-2023") within 1–2 units in
  every shared column (provenance.md §5). That season's competition tee shots
  are the most likely source of the driver row.
- The radar season lists exactly **40 events** with radar data, the same list
  for apex height and ball speed. TrackMan's post says men's data come from
  "40+ different events", mostly PGA TOUR, the rest DP World Tour. The DP World
  Tour events are not identified and are left out (section 7).
- The 40 run from September 2022 to November 2023:
  - fall 2022: Fortinet, Sanderson Farms, Shriners, CJ Cup South Carolina,
    Houston, RSM;
  - January–August 2023: regular season and FedExCup Playoffs;
  - FedExCup Fall 2023: Fortinet, Sanderson Farms, Shriners, RSM.

  Shriners, Fortinet, Sanderson Farms and RSM therefore each appear twice, in
  different weather.

**Thirteen official 2022-23 events have no event-level radar data** **[primary
data]**: Masters, The Open, WGC Match Play, Zurich (team), Corales, Puerto
Rico, Barracuda, Zozo ×2, WWT ×2 and Bermuda ×2. They enter only a sensitivity
variant. The Barracuda is the one that matters: Old Greenwood, Truckee,
1,803 m.

**LPGA: the 32 official events of the 2023 season** **[secondary, Wikipedia;
choice derived]**. LPGA seasons are calendar years, and the table is titled
2023. TrackMan says women's data come from "30+ different events", mostly LPGA,
the rest LET. The LET events are not identified and are left out. The three
unofficial team events (International Crown, Solheim Cup, Grant Thornton) are
excluded. The LPGA publishes no radar statistics, so whether TrackMan was
present at every event is unknown.

**Shot counts per event are unknown for both tours**, and so is the split
between range and competition. For the PGA TOUR, the only per-event count is
pgatour.com's radar apex attempts on Par 4 and Par 5 tee shots: 725 to 4,182
per event, 99,044 in total. That counts *competition driver-hole* shots. It is
a proxy for how the driver row might be weighted, not for the iron rows. No
equivalent exists for the LPGA. Range shots at a tour event share the venue's
air, but they are hit on practice days and often early, so their weather can
differ (section 7).

## 3. Method: elevation, weather, density

1. **Venue and dates.**
   - PGA: host course and competition dates from pgatour.com's own tournament
     data, read through the site's anonymous web GraphQL endpoint. That
     endpoint is **undocumented**: the same call its pages make, recorded in
     the notes.
   - LPGA: 2023 venue from each event's Wikipedia article (MediaWiki API),
     final-round date from the "2023 LPGA Tour" schedule. Three-round events:
     ShopRite and Walmart NW Arkansas. The Match-Play runs five days.
2. **Coordinates.**
   - Mostly OSM Nominatim, otherwise Wikipedia article coordinates.
   - Three venues missing from OSM use a city or district centroid: Barbasol
     (Nicholasville KY), BMW Ladies (Paju) and Toto Japan Classic (Omitama),
     each ±50 m in elevation.
   - Six wrong geocoder matches were rejected and replaced (notes).
3. **Elevation.** Open-Meteo Elevation API: Copernicus GLO-90 DEM at the
   course point.
4. **Weather: actual conditions for the tournament week, not climate normals.**
   - Open-Meteo Historical Weather API: hourly 2 m temperature, 2 m relative
     humidity and mean-sea-level pressure. Its "Best Match" blends ERA5
     (0.25°), ERA5-Land (0.1°) and IFS. It is statistically downscaled to the
     DEM elevation.
   - Only the competition days are used, hours 07:00–18:59 local, when tour
     shots are hit.
5. **Station pressure.** p = p_msl · exp(−g z / (R_d T̄)), with T̄ = T₂ₘ +
   0.0065·z/2. This agrees with Open-Meteo's own surface pressure to ≤ 0.04 hPa
   at every event.
6. **Density, moist air:**

   ρ = (p − e) / (R_d T) + e / (R_v T),
   e = (RH/100) · e_s(T),
   e_s = 6.1121 · exp((18.678 − T/234.5) · T/(257.14 + T)) hPa (Buck 1981).

   R_d = 287.053 J/(kg·K), the constants of `site/js/atmosphere.js`.
   R_v = 461.495 J/(kg·K). Each event's value is the mean of the hourly ρ over
   its daytime hours, divided by **ρ₀ = 1.18391 kg/m³**: dry air at 25 °C and
   101,325 Pa, the shipped model's `RHO0`.
7. **Equivalents.**
   - Equivalent elevation at 25 °C: the elevation at which the shipped
     model's pressure profile, with air held at 25 °C, gives the same ratio.
   - Equivalent sea-level temperature: 298.15/ratio − 273.15 °C (dry).

Per-event results are in `conditions.csv`. The requested columns come first.
Extra columns give dates, coordinates, station pressure, dry-air and
pressure-only ratios, radar attempts, rounds and coordinate source.

## 4. Results per tour

All **[derived]**. "Ratio" is ρ / ρ₀ (moist air, daytime, competition days).

| | PGA TOUR (40 radar events, equal weight) | LPGA (32 events, equal weight) |
|---|---|---|
| Mean density ratio | **0.9918** | **0.9937** |
| Equivalent elevation at 25 °C | 69 m | 53 m |
| Equivalent sea-level temperature | 27.5 °C | 26.9 °C |
| SD across events | 0.033 | 0.026 |
| 10th–90th percentile | 0.959 – 1.031 | 0.971 – 1.027 |
| Range | 0.906 – 1.062 | 0.911 – 1.035 |
| Mean venue elevation | 156 m | 125 m |
| Mean daytime temperature / RH | 21.5 °C / 59% | 21.4 °C / 64% |

**PGA − LPGA = −0.0019** (equal weights), about 0.2%, or 16 m of
equivalent elevation.

Where the departure from 1 comes from (PGA / LPGA):

| Factor | PGA | LPGA |
|---|---|---|
| Pressure, p/p₀ (elevation and weather) | 0.9854 | 0.9875 |
| Temperature, venues cooler than 25 °C (dry ratio ÷ p/p₀) | ×1.0125 | ×1.0125 |
| Humidity, moist ÷ dry | ×0.9941 | ×0.9939 |
| **Net** | **0.9918** | **0.9937** |

The two tours' schedules differ by less than any single factor. Neither tour's
air is far from the 25 °C sea-level reference on average. The mean is a
cool-and-moist sea-level majority partly offset by a few high or hot venues.

## 5. Sensitivity to weighting

**[derived]**

| Variant | n | Mean ratio | Eq. elevation at 25 °C |
|---|---|---|---|
| PGA radar events, equal | 40 | 0.9918 | 69 m |
| PGA radar events, weighted by radar apex attempts | 40 | 0.9904 | 81 m |
| PGA radar events, calendar 2023 only | 34 | 0.9893 | 91 m |
| PGA radar events, Jan–Aug 2023 only | 30 | 0.9901 | 84 m |
| PGA all official 2022-23 events (radar and non-radar), equal | 53 | 0.9899 | 85 m |
| LPGA, equal | 32 | 0.9937 | 53 m |
| LPGA, weighted by rounds (3 / 4 / 5) | 32 | 0.9934 | 56 m |
| LPGA, US events only | 21 | 0.9906 | 79 m |
| LPGA, excluding the Asia swing | 26 | 0.9923 | 65 m |

- Each tour's mean moves by at most 0.0025 (PGA) and 0.0031 (LPGA) across
  these weightings and subsets, about ±0.15–0.2%.
- The PGA − LPGA difference runs from −0.0044 to +0.0012 depending on the
  pairing of variants. **Even its sign is not robust.**
- Leave-one-out, no single event moves a mean by more than 0.0027 (LPGA
  Match-Play) or 0.0022 (PGA Shriners 2022). Barracuda moves the all-events PGA
  mean by 0.0035.
- **The time-of-day window matters more than the weighting.** 24-hour means
  are 0.9983 (PGA) and 0.9996 (LPGA), 0.6% denser than the 07–18 h window,
  because nights are cooler. Using Open-Meteo's own surface pressure instead
  of my reduction changes nothing (≤ 0.0001). Dry air instead of moist raises
  both means by 0.6%.

## 6. Events that dominate

**[derived; inputs per conditions.csv]**

Thin-air events (ratio < 0.95):

| Tour | Event (dates) | Elevation | Daytime T / RH | Ratio |
|---|---|---|---|---|
| PGA (non-radar) | Barracuda, Old Greenwood, Truckee (Jul 20–23, 2023) | 1,803 m | 27.7 °C / 23% | 0.810 |
| PGA | Shriners, TPC Summerlin (Oct 6–9, 2022) | 820 m | 26.9 °C / 24% | 0.906 |
| PGA | Shriners, TPC Summerlin (Oct 12–15, 2023) | 820 m | 21.0 °C / 16% | 0.923 |
| PGA | TOUR Championship, East Lake (Aug 24–27, 2023) | 300 m | 30.7 °C / 59% | 0.940 |
| LPGA | Bank of Hope Match-Play, Shadow Creek (May 24–28, 2023) | 604 m | 29.8 °C / 13% | 0.911 |

Dense-air events (ratio > 1.03):

| Tour | Event | Elevation | Daytime T | Ratio |
|---|---|---|---|---|
| PGA | RSM Classic, Sea Island (Nov 2022) | 6 m | 10.1 °C | 1.062 |
| PGA | The American Express, PGA West | −2 m | 12.8 °C | 1.048 |
| PGA | AT&T Pebble Beach | 24 m | 12.1 °C | 1.048 |
| PGA | Genesis, Riviera | 82 m | 13.4 °C | 1.035 |
| LPGA | BMW Ladies, Paju | 81 m | 12.9 °C | 1.035 |
| LPGA | U.S. Women's Open, Pebble Beach | 24 m | 14.4 °C | 1.031 |

The next LPGA thin-air events are Walmart NW Arkansas (384 m, 26.7 °C, 0.951)
and Evian (470 m, 0.951).

- Las Vegas is the only high venue in the PGA radar set, played twice. The
  LPGA's only high venue is also in Las Vegas (Shadow Creek), once. That event
  is match play, so its shots are not comparable stroke-play rounds.
- No event above 900 m is in either tour's likely set. The PGA's highest
  official event, the Barracuda at 1,803 m, has no radar data.
- Heat matters about as much as height. TOUR Championship week in Atlanta
  (31 °C, ratio 0.940) is as thin as a 520 m venue at 25 °C. Hot, dry desert
  weeks at TPC Summerlin and Shadow Creek (0.906–0.923) equal 670–830 m at
  25 °C. Late-season and West Coast winter events are 3.5–6% denser than the
  reference.

## 7. Unknowns and caveats

- **Shot counts per event and the range/competition split are unknown.**
  TrackMan publishes neither. PGA radar attempts weight only the competition
  driver data. The LPGA has no proxy beyond rounds.
- **Range sessions.** Range shots at a tour venue share its elevation, but
  they are hit on practice days (Mon–Wed) and often in the morning. Morning
  air is cooler and denser. The 24-hour means, 0.6% denser than the daytime
  window, bound that effect from above.
- **DP World Tour and LET events are excluded.** They are not identified. If
  TrackMan's minority included high-altitude stops, the means would drop.
  Each such event among about 40 lowers a tour mean by about 0.004. Candidates
  in the 2022-23 window include the Kenya Open (Muthaiga, about 1,650 m),
  Johannesburg events (about 1,600–1,750 m) and Crans-Montana (about
  1,500 m). These elevations are approximate and unverified here.
- **Whether TrackMan normalized the data.** If the tour averages are normalized
  (77 °F, sea level, calm), every figure here is moot: ratio = 1 by
  construction. Provenance found no statement either way for 2023. The 2010
  and 2019 editions said conditions were not considered.
- **Accuracy of reanalysis weather.** ERA5's 25 km grid and ERA5-Land's 11 km
  grid smooth coastal and valley sites. Open-Meteo downscales only for
  elevation. Errors of 1–2 °C or 10% RH at a single site are plausible; each
  is about ±0.5% in density for that event, and they shrink in a 30–40-event
  mean if random.
- **Coordinate precision.** Courses span tens of metres of relief. Three
  venues are city or district centroids (±50 m, ±0.6% for that event).
- **Undocumented endpoint.** The PGA event list, dates, venues and radar counts
  come from pgatour.com's anonymous web GraphQL, as in provenance.md. All other
  services used are documented public APIs: MediaWiki, Nominatim, Open-Meteo
  Elevation and Open-Meteo Historical Weather.
- **Wind is not represented.** TrackMan's averages pick stat holes "going in
  opposite directions" for the driver. Wind's second-order effect is covered
  in physics-lit L4.
