# R2b-1 — altitude evidence: is there a hard (measured) reference?

Status: COMPLETE 2026-10-09. The throwaway scripts are under
`$TMPDIR/aero-data/scripts/` (pgat_alt.py, pgat_match.py, pgat_dose.py,
pgat_reg.py, venue_density.py); raw JSON is under `$TMPDIR/aero-data/r2b/`.
Verified facts live in
`altitude-evidence.md.notes.md`. Builds on `aero-data.md` §7 and
`docs/research/reference-data.md.notes.md`.

Labels: **[P]** primary (read in the source itself), **[S]** secondary,
**[D]** derived here. **HARD** = a measurement of carry (or apex, land angle)
at altitude against sea level; **NON-HARD** = rule of thumb, simulator output,
vendor model figure, or planning yardage.

## 1 Verdict

- **A hard reference exists for the driver only, and only up to 7,746 ft.**
  It comes from the PGA TOUR's on-site radar (TrackMan). The tee-shot stats
  give carry to the actual point of ground impact, plus ball speed, launch,
  spin and apex. I matched each player at an altitude event to the same
  player's own season elsewhere.
  - **Chapultepec, 7,746 ft** (WGC-Mexico 2017–2020, ρ ≈ 0.78 of 25 °C sea
    level): carry **+16 to +22 yd (+5.7% to +7.8%)** in each of four years.
  - **Castle Pines, 6,234 ft** (BMW 2024, ρ 0.80): **+27.5 yd (+9.5%)**,
    1,401 shots.
  - **Old Greenwood, 5,843 ft** (Barracuda 2024, ρ 0.81): **+23.0 yd
    (+8.1%)**, 1,406 shots.
- **Over 40 near-sea-level events** in 2022-23 (ρ 0.91–1.06) the matched
  carry difference falls on a clean line: **+1.5 yd per 1% drop in air
  density** (≈ +0.53% carry per 1% density).
  - Castle Pines sits on that line.
  - **Chapultepec gains 10–15 yd less than the line predicts**, in all four
    years. That is a measured hint that the driver's gain per unit of thinner
    air shrinks by 7,700 ft. It is confounded by course terrain and by
    players' altitude setups: spin was +138 to +404 rpm there.
- **Carry still rises** at the highest measured altitude.
- **Nothing measured exists**
  - for irons at any altitude,
  - near 10,000 ft for any club,
  - showing carry *falling* with altitude.

  The user's "hard reference that carry should be going up at 10,000 ft"
  therefore does not exist; the highest hard point is 7,746 ft, driver only.
- **Best non-hard iron evidence:** players' on-site planning yardages (oracle
  6), e.g. Scheffler 7-iron +12%, McIlroy +14% at Castle Pines. These are
  launch-monitor and experience numbers, not published measurements. The
  rest of the altitude material is rules of thumb (Aoyama 1.16%/1,000 ft) or
  TrackMan model figures (Padjen).

## 2 Hard (measured) evidence

**PGA TOUR radar (TrackMan), tee shots on par 4 and par 5, player-matched**
— **[P]** data, **[D]** analysis.

How the data were pulled and compared:
- Source: pgatour.com stats 02401–02409 and 101, through the site's own
  anonymous web-client GraphQL (method as in `provenance.md`).
- Carry is "distance from tee to the point of ground impact … where a valid
  radar measurement was taken". It is measured on site; TrackMan completes
  partial tracks with its model.
- Each player at the event is compared with the same player's season
  average excluding that event. The table gives attempts-weighted means of
  the differences, ± SE.
- Air density comes from ERA5 competition-hours weather at the venue's DEM
  elevation (same constants as the app).

| Event (venue, elevation) | ρ/ρ₂₅ | Players / carry shots | Δ carry | Δ ball speed | Δ launch | Δ spin | Δ apex |
|---|---|---|---|---|---|---|---|
| WGC-Mexico 2017 (Chapultepec, 7,746 ft) | 0.783 | 45 / 138 | **+21.9 ± 1.0 yd (+7.8%)** | +0.0 mph | +3.1° | +369 | +23.8 ft |
| WGC-Mexico 2018 | 0.775 | 39 / 123 | **+21.5 ± 1.2 (+7.7%)** | +0.1 | +3.0° | +404 | +15.1 ft |
| WGC-Mexico 2019 | 0.776 | 28 / 57 | **+19.0 ± 1.8 (+6.7%)** | +1.7 | +0.9° | +353 | +7.5 ft |
| WGC-Mexico 2020 | 0.780 | 47 / 705 | **+16.2 ± 2.8 (+5.7%)** | +2.4 | +1.2° | +138 | +2.4 ft |
| BMW 2024 (Castle Pines, 6,234 ft) | 0.804 | 48 / 1,401 | **+27.5 ± 0.9 (+9.5%)** | +1.5 | +1.2° | −21 | **−11.1 ft (−10.5%)** |
| Barracuda 2024 (Old Greenwood, 5,843 ft) | 0.812 | 39 / 1,406 | **+23.0 ± 1.3 (+8.1%)** | +1.8 | +1.9° | −16 | **−5.9 ft (−5.8%)** |
| *Control:* Mexico Open 2024 (Vidanta, 56 ft) | 0.994 | 57 / 2,619 | −3.3 ± 0.4 (−1.1%) | +0.0 | −0.3° | +83 | +0.5 ft |

**Removing the launch-condition shifts [D].** I used the slopes of a
cross-player season regression: 1.83 yd/mph, 2.95 yd/° and 0.0019 yd/rpm
(2024: rms 1.9 yd). After that the gains are:
- Mexico +2.8% to +4.4%;
- Castle Pines +7.4%;
- Old Greenwood +5.0%.

The launch slope comes from a sea-level cross-section in which players
choose their own launch, so treat these as a lower bracket, not a
correction. The truth for a fixed launch likely lies between the raw and
adjusted values.

**Dose-response [D] from 40 near-sea-level events (2022-23).** The fit is
`Δcarry = 148.8 − 150.1·ρ` yd (rms 2.9 yd). It crosses zero at ρ 0.992, the
season mean, as it should. The highest of these events is Las Vegas, 820 m:
+11.9 yd (+4.2%) at ρ 0.906. Extrapolated to the altitude events:

| Event | Predicted | Measured |
|---|---|---|
| Castle Pines | +28 yd | +27.5 |
| Old Greenwood | +27 yd | +23 |
| Chapultepec | +31 to +32 yd | +16 to +22 |

Adjusted for launch, the fit is +1.09 yd per 0.01 of ρ, and Chapultepec is
again 10–14 yd below it.

**What these numbers are, and are not:**
- They **are** on-site measurements of real tour driver flights at altitude,
  same players against themselves, with launch conditions measured too.
- They **are not** a fixed-launch experiment. The confounds:
  - Ground impact is terrain-dependent (Castle Pines has big downhill tee
    shots).
  - In 2017–2019 radar covered only a few holes. In 2017–18 the field
    launched 3° higher, apexed 15–24 ft higher and landed 1.2–1.5 s sooner,
    which points to hole geometry.
  - Players re-optimise at altitude: +138 to +404 rpm at Mexico, consistent
    with TrackMan-style advice to add spin.
  - Wind is uncontrolled, and some tee shots are 3-woods or irons.
- **Apex:** at the two 2024 altitude events, where every tee was tracked,
  apex is clearly lower (−6% to −11%) despite +1.2° to +1.9° more launch.
  That is the expected thin-air signature.
- **Hang time:** the PGA TOUR's 2024 hang-time field is corrupt (reads 0),
  so it cannot be compared.

**Arccos 2026** — **[P]**, measured, but TOTAL distance. Amateur GPS shot
data, about 10 M drives: a 10-handicap averages 220.5 yd at sea level and
239.7 yd at 5,000+ ft (+8.7%). It is measured, but it is total distance
(roll included), uncontrolled, and has no carry. Detail is in `aero-data.md`
§7.

## 3 Measured evidence of carry falling with altitude

**None found.** Every measured comparison has carry rising with altitude or
with lower density:
- the six altitude events in §2;
- the 40-event density line;
- Arccos;
- baseball (§5).

The closest thing to a turnover signal is a **shrinking rate**: at 7,746 ft
the driver gains less per unit of density than at ≤ 6,234 ft, in all four
Chapultepec years. Course and setup confounds cannot be removed from public
data, so this is a hint, not a measurement of physics.

Nothing measured exists for irons or wedges at altitude. Those are exactly
the shots where the low-Re lift loss in `aero-data.md` §3 would act, and so
the shots where a turnover would show first.

## 4 Non-hard evidence (listed, not used as a reference)

| Item | What it is | Says |
|---|---|---|
| Padjen / TrackMan (PGA TOUR 2017) — oracles 1–3 | TrackMan **model** run for an average tour pro | 7,800 ft driver: high trajectory 282 → 306 yd (+8.5%), apex 102 → 84 ft, land 38° → 29°; low trajectory 277 → 288 (+4%) |
| Player planning yardages — **oracle 6** | players' and caddies' altitude plans from range launch monitors and experience; **not published measurements** | Castle Pines (~6,400 ft): Scheffler driver +10%, 7-iron +12%, 8i +12%, PW +10%; McIlroy driver +8%, 7i +14%, 8i +14%. Penge at Crans (1,500 m): wedges +5%, 6–9 iron +7.5%, woods +5%. Larrazabal at Chapultepec: driver carry +11%, 7-iron +17%. LIV caddies at Chapultepec: 10–18% |
| Aoyama (Titleist/Acushnet) | rule of thumb, derivation undisclosed | +1.16% per 1,000 ft (7,746 ft → +9.0%); "less for slower swing speeds and/or … shorter shot[s]"; spin is not reduced by altitude |
| Andrew Rice (Golf.com 2018/2019) | TrackMan study, method unpublished (probably Normalize) | driver +2.5 yd/1,000 ft (2018) or +4.5 yd/1,000 ft (2019, inconsistent); optimal driver spin 2,250 → ~3,000 rpm at 10,000 ft |
| TrackMan Support "Altitude in Course Play" | vendor statement | ~7,000 ft: "roughly 10% further in the air" |
| USGA Course Rating | handicap-system rule: effective playing length is adjusted for courses above 2,000 ft | coefficient not retrieved |
| USGA "Golf Course Effects on Hitting Distance" (2023) | ShotLink regression; **unverified** (403) | "course elevation coefficient 0.00427", units unknown |
| MyGolfSpy, GolfNewsNet, Foresight, FlightScope | rules of thumb and simulators | 1.1–2%/1,000 ft; 6–10% |
| Frank Thomas (ex-USGA) | estimate | 9,000 ft: +40 yd total with re-optimised launch |

The table is compiled from `docs/research/reference-data.md.notes.md`
(2026-10-08) and `aero-data.md` §7. Aoyama's and the players' "more for long
irons than wedges" pattern is consistent in every source. No source supports
iron carry *falling* below about 8,000 ft.

## 5 Weak analog: baseball at Coors Field

- **Nathan 2016 (THT), [P]:** 2015 Statcast data, about 80,000 batted balls.
  For exit speed 101–105 mph and launch 25–30° the average distance is
  **430 ft at Denver against 401 ft at the other parks (+7.2%)** at about
  5,200 ft. His model gives +5.9 ft of fly-ball distance per 1,000 ft of
  elevation.
- **Nathan, "Baseball at High Altitude":** about 5% farther than at Fenway.

These are measured radar distances, some projected. A baseball has a
different S, Re and drag crisis from a golf ball, so this shows only that
measured carry rises at ~5,000 ft in another dimpled-ish, spinning-ball
sport. It is a weak analog.

## 6 Search log and what is missing

**Searched (2026-10-09):**
- On-site launch-monitor tests at altitude (Denver, Bogotá, Quito, La Paz,
  Mexico City; English and Spanish).
- Robot tests at elevation (Golf Laboratories, Iron Byron, magazine robot
  tests).
- Toptracer/Topgolf altitude data.
- USGA/R&A altitude work: the 2023 Distance Insights report and R22-09 both
  return 403.
- Peer-reviewed golf altitude studies: none, as in 2026-10-08.
- "Carry falling" at altitude; Korn Ferry radar (none: that tour has
  driving distance only, and its Bogotá event has no ShotLink).
- PGA TOUR radar per event: the source of §2.

**Missing:**
1. **Iron and wedge carries at any altitude.** The PGA TOUR's public radar
   stats are par-4/5 tee shots only. TrackMan has tracked approach shots
   since 2022, but they are not published. Getting them from TrackMan or the
   PGA TOUR, e.g. 2024 Castle Pines approach data, would be the single best
   addition.
2. **Anything above 7,746 ft.** There are no radar-tracked pro events at
   Bogotá, Quito or La Paz. LIV Mexico City (2024–25, same course) publishes
   no radar data that I found.
3. **A fixed-launch altitude experiment** (robot or ITR at elevation): none
   public.
4. **Separating terrain from air** at Chapultepec and Castle Pines needs
   hole-level radar data with landing elevations, which is not public.
5. **Land angle at altitude:** the PGA TOUR publishes no descent-angle stat,
   so nothing measured exists.
