# altitude-evidence notes — verified facts (append-only)

Format: claim — source (URL or file:line) — date verified — P/S/D. HARD/NON-HARD tag where relevant.

Inherited (not re-verified here; see aero-data.md.notes.md "Altitude evidence" and reference-data.md.notes.md):
- Arccos 2026 report: 10-handicap total driver distance 220.5 yd sea level vs 239.7 yd at 5,000+ ft (GPS, total incl. roll).
- USGA 2023 "Golf Course Effects on Hitting Distance": ShotLink elevation coefficient 0.00427 (search summary only; 403).
- Player planning yardages (Scheffler/McIlroy Castle Pines, Larrazabal, Penge), Padjen/TrackMan model, Aoyama 0.00116/ft.


## HARD: PGA TOUR radar (TrackMan) tee-shot stats at altitude events, player-matched (retrieved 2026-10-09) — PRIMARY data

- Source: pgatour.com stats 02401-02409 + 101 via the site's own anonymous web-client GraphQL https://orchestrator.pgatour.com/graphql
  (production web-client key embedded in the site's _app JS chunk, same method as provenance.md.notes.md:117), query
  StatDetails with eventQuery {queryType: EVENT_ONLY, tournamentId} for the event and without it for the season.
  Definitions (provenance.md.notes.md:119-121): Carry Distance (02409) = "Distance from tee to the point of ground impact on Par 4
  and Par 5 tee shots where a valid radar measurement was taken"; Apex Height relative to the tee. => tee shots (mostly driver),
  carry to ACTUAL ground impact (terrain-dependent), measured on site by radar (TrackMan completes partial tracks with a model —
  provenance notes; so "measured" = radar measurement, landing possibly model-completed).
- Raw JSON: $TMPDIR/aero-data/r2b/pgat/{e2017_473,e2018_473,e2019_473,e2020_473,e2024_028,e2024_472}.json and s{2017,2018,2019,2020,2024}.json.
- Method [D] (THROWAWAY $TMPDIR/aero-data/scripts/pgat_match.py): for every player with >=1 radar attempt at the event and >=20
  in the rest of the season, season-excluding-event mean = (season_avg*N_s - event_avg*N_e)/(N_s - N_e); report the
  attempts-weighted mean of (event - season-excl) and its SE over players.
- Venues/air (THROWAWAY $TMPDIR/aero-data/scripts/venue_density.py: Nominatim geocode, Open-Meteo DEM elevation, ERA5 hourly
  T/RH/MSL pressure 07-18 h on competition days, moist density vs dry 25 C/101325 Pa, constants as site/js/atmosphere.js):
  Club de Golf Chapultepec 2,361 m (7,746 ft): 2017 T 18.1 C rho 0.783; 2018 21.1 C 0.775; 2019 20.2 C 0.776; 2020 19.9 C 0.780.
  Castle Pines GC 1,900 m (6,234 ft), BMW 2024-08-22..25: 25.1 C, rho 0.804.
  Old Greenwood (Tahoe Mountain Club), Truckee 1,781 m (5,843 ft), Barracuda 2024-07-18..21: 27.9 C, rho 0.812.
  Season comparison air: PGA TOUR radar season mean ~0.99 (2022-23: 0.992, conditions.md); assumed similar other seasons.
- RESULTS (event - same players' season-excl; carry yd, %):
  | event | players | carry shots | carry | ball mph | launch deg | spin rpm | apex ft | hang s | drive dist (laser, total) |
  | WGC-Mexico 2017 R2017473 | 45 | 138 | +21.86+-0.96 (+7.8%) | +0.00 | +3.13 | +369 | +23.8 (+22.6%) | -1.46 (-22.8%) | +4.5 (+1.5%) |
  | WGC-Mexico 2018 R2018473 | 39 | 123 | +21.53+-1.24 (+7.7%) | +0.07 | +3.03 | +404 | +15.1 (+14.1%) | -1.16 (-17.8%) | +7.0 (+2.3%) |
  | WGC-Mexico 2019 R2019473 | 28 | 57 | +19.02+-1.78 (+6.7%) | +1.69 | +0.90 | +353 | +7.5 (+7.3%) | -0.08 | +27.6 (+9.3%) |
  | WGC-Mexico 2020 R2020473 | 47 | 705 | +16.19+-2.75 (+5.7%) | +2.35 | +1.24 | +138 | +2.4 (+2.4%) | -0.68 (-10.8%) | +29.4 (+9.8%) |
  | BMW 2024 Castle Pines R2024028 | 48 | 1,401 | +27.51+-0.94 (+9.5%) | +1.45 | +1.23 | -21 | -11.1 (-10.5%) | n/a (data 0) | +13.1 (+4.3%) |
  | Barracuda 2024 Old Greenwood R2024472 | 39 | 1,406 | +23.03+-1.25 (+8.1%) | +1.79 | +1.89 | -16 | -5.9 (-5.8%) | n/a | n/a |
  Raw field averages (tourAvg): Mexico 2017 carry 298.1 apex 124'8" launch 13.64 hang 5.1; 2018 301.1/122'2"/13.76/5.3;
  2019 299.4/106'2"/10.20/6.2; 2020 295.8/102'6"/11.45/5.6; BMW 2024 316.0/94'4"/11.54; Barracuda 2024 306.2/97'3"/12.28.
- Adjustment for launch-condition differences [D] (THROWAWAY pgat_reg.py, attempts-weighted cross-player regression of season
  means, players >=100 attempts): 2024: carry = -58.3 + 1.783 ball + 2.968 launch + 0.00201 spin (rms 1.9 yd, 184 players);
  2020: -76.0 + 1.885 ball + 2.934 launch + 0.00180 spin. Using 1.83 yd/mph, 2.95 yd/deg, 0.0019 yd/rpm:
  adjusted gains Mexico 2017 +11.9 yd (+4.3%), 2018 +11.7 (+4.2%), 2019 +12.6 (+4.4%), 2020 +8.0 (+2.8%);
  BMW 2024 +21.3 (+7.4%); Barracuda 2024 +14.2 (+5.0%). The launch slope is a sea-level cross-section (players choose launch),
  so the adjusted values are a lower bracket, not a correction.
- Caveats: (1) carry is to actual ground impact: landing terrain above/below the tee biases carry (Castle Pines has big
  downhill drives; the 2017-18 Mexico radar holes show +3 deg launch, +15-24 ft apex and -1.2..-1.5 s hang time, i.e. a
  landing area well above the tee or hole-specific shot shapes). (2) 2017-2019 radar covered few holes (57-154 shots);
  2024 covers every tee (1,400 shots). (3) tee shots on par 4/5 only — mostly driver, some 3-wood/irons; NO iron carries.
  (4) Mexico spin +138..+404 rpm vs season (possible equipment/loft changes for altitude, or measurement); 2024 events show none.
  (5) weather/wind not controlled; temperature at all altitude events 18-28 C.

## HARD (dose-response): 2022-23 PGA TOUR radar events, matched carry difference vs event air density [D from P data]

- THROWAWAY $TMPDIR/aero-data/scripts/pgat_dose.py (run 2026-10-09): 40 radar events of the 2022-23 season (event ids, venue
  elevation, competition-hours T/RH and moist density ratio vs dry 25 C SL taken from conditions.csv, produced by the R2-2 probe);
  per event, players' attempts-weighted mean of (event - own season-excl) for carry (02409), ball speed, launch, spin, apex;
  cached raw event rows in $TMPDIR/aero-data/r2b/pgat/ev2023/.
- Range: rho 0.906 (Shriners, Las Vegas 820 m, 26.9 C) .. 1.062 (RSM, 10.1 C). Highest-altitude events: Shriners x2 (820 m):
  dcarry +11.9 yd (+4.2%, rho 0.906) and +8.3 yd (+2.9%, rho 0.923); Phoenix (467 m, 16.5 C, rho 0.977) +4.9; cold sea-level
  events: Pebble Beach (rho 1.048) -13.9 yd (-4.9%), RSM Nov (1.062) -11.8 (-4.2%).
- Weighted LS over 40 events (weights = event carry shots):
  raw: dcarry = +148.81 - 150.06*rho yd  => +1.50 yd per 0.01 drop in rho (~+0.53% carry per 1% density drop), rms 2.90 yd;
  ball/launch/spin-adjusted (1.83 yd/mph, 2.95 yd/deg, 0.0019 yd/rpm): +107.58 - 108.60*rho => +1.09 yd per 0.01, rms 2.40 yd.
  Zero crossing at rho 0.992 (= season mean), as it must be.
- Extrapolated to the altitude events vs measured (raw): BMW 2024 rho 0.804 -> +28.2 predicted / +27.5 measured;
  Barracuda 2024 0.812 -> +27.0 / +23.0; Mexico 0.776-0.783 -> +31.4..+32.4 / +16.2..+21.9. Adjusted: BMW +20.3 / +21.3;
  Barracuda +19.4 / +14.2; Mexico +22.3..+23.0 / +8.0..+12.6.
  => Castle Pines (6,234 ft) sits on the low-altitude trend line; Chapultepec (7,746 ft) gains clearly LESS than linear
  extrapolation in density predicts (by ~10-15 yd), in every one of 4 years. Not separable from course/terrain or players'
  altitude setups (Mexico spin +138..+404 rpm) with public data.

## Weak analog: baseball (WebFetch 2026-10-09)

- [P] A. M. Nathan, "Going Deep on Goin' Deep", The Hardball Times (FanGraphs), 2016-04-06, https://tht.fangraphs.com/going-deep-on-goin-deep/ :
  Statcast "approximately 80,000 batted balls from the 2015 season"; for exit speed 101-105 mph and launch angle 25-30 deg,
  "Denver clear winner at 430 feet, compared with 401 feet for the average of the other stadiums" ([D] +7.2%); "The Denver
  effect is huge!"; model table: "1000 ft increase in elevation" -> flyball distance +5.9 ft. (Statcast 2015 distances were
  TrackMan radar with projection for incomplete tracks — measured-ish; the per-1000-ft number is model.)
- [P earlier, reference-data.md.notes.md:70] Nathan "Baseball At High Altitude": fly balls ~5% farther at Coors than Fenway
  ("380 ft drive at Fenway will travel nearly 400 ft at Coors"); Denver density ~82% of sea level at 70 F.
- [S] Search summary of Nathan's 2009 HITf/x + HitTracker home-run study: Coors normalized "carry" ~7.5% above all-park average.
  Not re-read.

## Control and negative checks (2026-10-09)

- Sea-level control, Mexico Open at Vidanta 2024 (R2024540; Vidanta Vallarta 17 m, 24.1 C, rho 0.994): 57 players, 2,619 carry
  shots: dcarry -3.30 +- 0.43 yd (-1.1%), dball +0.02, dlaunch -0.25, dspin +83, dapex +0.5 ft => method noise ~1%.
- Korn Ferry Tour (tourCode H) 2023: stat 02409 returns no events/players (no radar); stat 101 (laser driving distance) lists 21
  US events only (no Bogota). PGA TOUR Americas not checked.
- Robot/launch-monitor tests at altitude, Toptracer/Topgolf altitude data, Spanish-language Bogota/Quito/La Paz measurements,
  wedge/"shorter at altitude" evidence: 5 web searches, nothing measured found (search summaries only; no primary hits).
- USGA Course Rating altitude adjustment (effective playing length, courses > 2,000 ft): confirmed to exist via usga.org
  handicap-manual search excerpts; coefficient not retrieved. NON-HARD (rating rule).
- Andrew Rice / Golf.com 2018 (reference-data.md.notes.md:29): optimal driver spin 2,250 rpm SL -> ~3,000 rpm at 10,000 ft
  (TrackMan model, NON-HARD) — consistent in direction with the +138..+404 rpm measured at Chapultepec.
