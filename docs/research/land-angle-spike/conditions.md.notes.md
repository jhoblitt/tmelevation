# Findings notes for conditions.md

Each entry: claim | source URL + location | accessed date | primary/secondary/derived.
All accessed 2026-10-09 unless stated.

## Inherited from provenance.md (this spike)

- 2023 PGA driver row matches PGA TOUR radar season "2022-2023" (year=2023 in pgatour.com's data) within 1–2 units — provenance.md §5.
- TrackMan 2023 post: men 40+ events / 200+ players, PGA TOUR + DP World Tour, majority PGA TOUR; women 30+ events / 150+ players, LPGA + LET, majority LPGA; "competition as well as on the range" — provenance.md §3.
- 2010/2019 editions: "Location and weather conditions are not considered" — provenance.md §3.

## New findings (R2-2)

### PGA TOUR 2022-23 radar event list — PRIMARY data (pgatour.com anonymous web GraphQL, UNDOCUMENTED endpoint)

- Endpoint: https://orchestrator.pgatour.com/graphql with the public web-client x-api-key embedded in pgatour.com's _app JS chunk (the same call its stat pages make). Undocumented. Queries copied from that JS: StatDetails (tournamentPills; eventQuery {queryType: EVENT_ONLY, tournamentId}) and Tournaments(ids) (name, displayDate, city/state/country, timezone, courses with hostCourse flag). Raw responses saved to $TMPDIR only (/tmp/claude/cond-pgasched/).
- The 2022-23 radar season ("year 2023", displaySeason "2022-2023") has **40 events** in its tournamentPills (identical list for stat 02407 Apex Height and 02402 Ball Speed): fall 2022 (Fortinet, Sanderson Farms, Shriners, CJ Cup SC, Houston, RSM), Jan–Aug 2023 regular season + FedExCup Playoffs, and FedExCup Fall 2023 (Fortinet, Sanderson Farms, Shriners, RSM). [D] "40 events" matches TrackMan's "40+ different events" (men, PGA TOUR + DP World Tour).
- Per-event EVENT_ONLY apex-height attempts (sum of player "Total Attempts") range 725 (AT&T Pebble Beach, 3 courses) to 4,182 (Rocket Mortgage); sum over the 40 events 99,044 vs season total 121,740 (difference unexplained; event-level rows may omit some players). Values in conditions.csv column radar_attempts.
- Official 2022-23 events with **0** event-level radar attempts (probed by id): Masters (R2023014), WGC Match Play (R2023470), Zurich Classic team event (R2023018), Corales Puntacana (R2023522), Puerto Rico Open (R2023483), Barracuda Championship at Tahoe Mountain Club (Old Greenwood), Truckee CA (R2023472), The Open at Royal Liverpool (R2023100), Zozo 2022 (R2023527) and 2023 (R2023546) at Accordia Golf Narashino, WWT 2022 at El Camaleón Mayakoba (R2023457) and 2023 at El Cardonal at Diamante, Los Cabos (R2023547), Butterfield Bermuda 2022 (R2023528) and 2023 (R2023548) at Port Royal. These are used only in a sensitivity variant.

### LPGA 2023 event list — SECONDARY (Wikipedia, MediaWiki API, documented)

- Source: "2023 LPGA Tour" (https://en.wikipedia.org/wiki/2023_LPGA_Tour, schedule table: final-round date, event, state/country) plus each event's article for the 2023 venue (fetched via api.php action=query&prop=revisions, 2026-10-09). 32 official events (Blue Bay and Taiwan Swinging Skirts cancelled); 3 unofficial team events (International Crown, Solheim Cup, Grant Thornton) excluded. [D] "30+ events" matches TrackMan's female "30+ different events" (LPGA + LET).
- Venues confirmed from the event articles' 2023 rows/infobox text: Lake Nona G&CC (Orlando); Siam CC Old Course (Pattaya); Sentosa GC (Singapore); Superstition Mountain G&CC (Gold Canyon AZ; "The first Arizona tournament was held in March 2023 at the Superstition Mountain Golf & Country Club"); Palos Verdes GC (DIO Implant LA Open, "(2023–2024)"); Hoakalei CC (Lotte, 2023 row); The Club at Carlton Woods, Nicklaus course (Chevron, April 20–23); Wilshire CC (JM Eagle); Upper Montclair CC (Founders Cup 2023 row); Shadow Creek (Match-Play, May 24–28); Liberty National GC (Mizuho, "held at Liberty National ... for its first three editions"); Seaview (ShopRite, 3 rounds, 2023 row); Blythefield CC (Meijer); Baltusrol Lower (KPMG, June 22–25); Pebble Beach GL (USWO, July 6–9); Highland Meadows GC (Dana, 2023 row); Midland CC (Dow, team); Evian Resort GC (27–30 July); Dundonald Links (Scottish, 2023 row); Walton Heath (AIG, 10–13 August); Galgorm Castle + Castlerock (ISPS Handa); Shaughnessy G&CC (CPKC, 2023 row); Columbia Edgewater CC (Portland, 2023 row); Kenwood CC (Kroger Queen City: "The Kenwood Country Club ... last welcomed the tournament in 2023"); Pinnacle CC (Walmart NW Arkansas, 3 rounds, "all editions"); Old American GC (The Colony TX); Qizhong Garden GC (Shanghai); Kuala Lumpur G&CC (Maybank); Taiheiyo Club Minori Course (Toto, "(2023)"); Pelican GC (Annika); Tiburón GC Gold (CME).
- BMW Ladies Championship 2023: Seowon Hills, Seowon Valley CC, Paju, Oct 19–22, 78-player no-cut — Korea JoongAng Daily 2023-04-28 (https://www.koreajoongangdaily.com/sports/2023-bmw-ladies-championship-to-be-held-at-seowon-hills-in-october/11575259), via WebSearch summary. SECONDARY.

### Coordinates, elevation, weather — data services

- Coordinates: OSM Nominatim (https://nominatim.openstreetmap.org/search, documented public API, 1 req/s, generic UA) for most venues; Wikipedia article coordinates (MediaWiki API prop=coordinates) for RSM Classic (Sea Island), Mexican Open (Vidanta), Puerto Rico Open, TPC of Louisiana, Lake Nona G&CC, Evian Resort GC, Walton Heath, Shaughnessy G&CC, Pinnacle CC, Buick LPGA Shanghai; city/district centroids (Nominatim) where the course is not in OSM: Barbasol (Nicholasville KY), BMW Ladies (Gwangtan-myeon, Paju), Toto Japan Classic (Omitama). WWT 2023: Diamante Boulevard, Cabo San Lucas (nearby road). Rejected geocoder mismatches: first-pass hits for Sea Island (matched Ontario), Austin CC (matched Minnesota), Pinnacle CC (matched Tampa), Seowon Valley (matched Dongwon Sun Valley, Hoengseong), Evian (mini-golf at lake level), Walton Heath (matched South Africa). Per-event coordinate source is in conditions.csv column coord_source. DERIVED/PRIMARY mix.
- Elevation: Open-Meteo Elevation API (https://api.open-meteo.com/v1/elevation; Copernicus DEM GLO-90). Checks against known venue heights: TPC Summerlin 820 m, Old Greenwood (Barracuda) 1,803 m, Shadow Creek 604 m, Superstition Mountain 574 m, Evian Resort 470 m, TPC Scottsdale 467 m, East Lake 300 m, PGA West −2 m — all plausible. City-level points (Barbasol 291 m, BMW Ladies 81 m, Toto 28 m) carry ±50 m uncertainty (≈ ±0.6% density).
- Weather: Open-Meteo Historical Weather API (https://archive-api.open-meteo.com/v1/archive), hourly temperature_2m, relative_humidity_2m, pressure_msl, surface_pressure, timezone=auto, elevation = the DEM value; competition days (start..end), hours 07:00–18:59 local. Docs (https://open-meteo.com/en/docs/historical-weather-api, WebFetch 2026-10-09): "The default Best Match combines IFS HRES, ERA5 and ERA5-Land seamlessly" (ERA5 0.25°, ERA5-Land 0.1°, IFS 9 km); elevation is "used for statistical downscaling. Per default, a 90 meter digital elevation model is used." Attribution: "Generated using Copernicus Climate Change Service information". These are ACTUAL historical conditions for the event week (reanalysis), not climate normals. Raw responses in /tmp/claude/cond-om/ (not kept).
- Station pressure: p = p_msl · exp(−g z / (R_d · T̄)), T̄ = T_2m + 0.0065·z/2 (K). Agrees with Open-Meteo surface_pressure to ≤ 0.04 hPa at every event (max |diff| over 85 events).

### Density formula and reference — DERIVED

- Moist air: ρ = (p − e)/(R_d T) + e/(R_v T); e = RH/100 · e_s(T); e_s = 6.1121 · exp((18.678 − T/234.5) · T/(257.14 + T)) hPa (Buck 1981, over water); R_d = 8314.32/28.9644 = 287.053 J/(kg·K) (same constants as site/js/atmosphere.js), R_v = 461.495 J/(kg·K).
- Reference ρ0 = 101325/(287.053 · 298.15) = 1.18391 kg/m³ (dry, 25 °C, sea level) = site/js/atmosphere.js RHO0.
- Event value = mean of hourly ρ over the competition-day hours 07–18 local, divided by ρ0.
- Equivalent elevation at 25 °C: invert site/js/atmosphere.js pressureAtElevation (ISA pressure profile, 25 °C held), i.e. ratio = P(z)/P0. Equivalent sea-level temperature: T = 298.15/ratio − 273.15 (dry, 101325 Pa).

### Results — DERIVED (throwaway /tmp/claude/prov-scripts/compute_density.py; summary /tmp/claude/cond-work/summary.txt)

- PGA radar 40, equal: mean 0.9918 (eq. 69 m at 25 °C; eq. 27.5 °C at sea level); SD 0.033; min 0.906 (Shriners 2022, 820 m), max 1.062 (RSM 2022, 10 °C); p/p0 0.9854; mean daytime T 21.5 °C, RH 59%, z 156 m; dry-air ratio 0.9977.
- PGA radar 40, weighted by event radar apex attempts: 0.9904 (81 m). Calendar 2023 only (34 events): 0.9893 (91 m). Jan–Aug 2023 (30): 0.9901 (84 m). All 53 official 2022-23 events incl. non-radar (Barracuda 0.810, Masters, Open, Zozo, WWT, Bermuda, etc.), equal: 0.9899 (85 m), SD 0.039.
- LPGA 32, equal: 0.9937 (eq. 53 m; 26.9 °C), SD 0.026, min 0.911 (Match-Play, Shadow Creek 604 m, 30 °C, RH 13%), max 1.035 (BMW Ladies, 13 °C); p/p0 0.9875; T 21.4 °C, RH 64%, z 125 m; dry 0.9998. Rounds-weighted 0.9934 (56 m); US-only (21) 0.9906 (79 m); excluding Asia (26) 0.9923 (65 m).
- PGA − LPGA: −0.0019 (both equal); −0.0030 (attempts vs rounds); across all listed variants from −0.0044 to +0.0012.
- Decomposition (PGA / LPGA equal): pressure (elevation + weather) 0.9854 / 0.9875; temperature factor (dry ratio ÷ p/p0) 1.0125 / 1.0125; humidity factor (moist ÷ dry) 0.9941 / 0.9939.
- Time-of-day: 24-hour means are 0.9983 (PGA) and 0.9996 (LPGA), i.e. +0.6% vs the 07–18 h window.
- Leave-one-out: no single event moves a tour mean by more than 0.0027 (LPGA Match-Play) / 0.0022 (PGA Shriners 2022); Barracuda moves the all-official PGA mean by 0.0035.

## Status

- conditions.md: sections 1–7 written 2026-10-09; conditions.csv: 85 rows (40 PGA radar, 13 PGA non-radar, 32 LPGA), requested columns first, then event_id, set, start, end, lat, lon, p_station_hPa, density_ratio_dry, pressure_ratio, radar_attempts, rounds, coord_source.
- Process note: the first MediaWiki request (2022–23 PGA Tour wikitext) was sent with a User-Agent containing the user's e-mail address; all later requests used a generic UA. Reported to the coordinator.
