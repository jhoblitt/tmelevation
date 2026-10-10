# Land-angle model spike — shared brief

Dispatched 2026-10-09. Research spike: the output is findings and a
recommendation, not product code. Anything executable written here is
throwaway and labelled so.

## The question

Can one set of physically plausible lift, drag and spin-decay laws, shared by
every row, predict **carry, max height and land angle** for all 23 rows of
TrackMan's 2023 PGA/LPGA tour-average tables from ball speed, launch angle and
spin rate — clearly better than today's model — while keeping the model's
altitude behaviour defensible?

## Why

The shipped model (`site/js/flight.js`, `site/js/calibrate.js`) fits two
per-row scale factors (`kD` on drag, `kL` on lift) to each row's carry and max
height and treats land angle only as a check. After that fit it lands 1–9°
shallower than the table (RMS 4.7°), worst for PGA hybrids and long irons. The
user's reading, which this spike adopts: the table averages thousands of real
shots and is the ground truth; TrackMan's 2014 published model trajectories
are not physics to match. The user notes the land column for long shots may
itself be TrackMan-model output rather than a measurement.

## Decisions already made by the user (binding)

- TrackMan's 2014 model shots (oracle 10a/10b) and TrackMan's wind table are
  **informational only** — report agreement, never optimize for it or reject a
  model for missing it.
- Padjen's TrackMan altitude figure (PGA-like driver, 7,800 ft: land 38° → 29°,
  apex 102 → 84 ft, carry 282 → 306 yd) is a **soft** check: report it.
- Land angle is a target, not only a check.

## Longer-term goal (shapes model choices)

This model is meant to become the base of a later full 3-D simulation with
wind, humidity, fog/rain, rendered as video. Prefer, all else equal:

- coefficients as functions of **Reynolds number and spin ratio**,
  `C_D(Re, S)`, `C_L(Re, S)`, so temperature and humidity can enter through
  both density and viscosity (a Re-free model sees only density);
- forces in **vector form** (drag along −v_rel, Magnus along ω̂ × v̂_rel) so
  spin axis and crosswind drop in later;
- laws traceable to measured data over the Re/S range a tour shot spans.

Do not build the 3-D, wind, humidity or rain parts. Record pointers to data
that would serve them where you meet it.

## Success bar (proposed, report against it)

Across the 23 rows: land-angle RMS ≤ 1.5°, carry RMS ≤ 2 yd, max-height RMS
≤ 1 yd, with every coefficient inside measured ranges. The table is rounded to
whole yards and degrees (±0.5).

## Baseline facts (verified 2026-10-09 against the shipped code)

Sea-level land angle, current model calibrated per row to carry + height,
versus the table (model − table):

| Row | PGA | LPGA |
|---|---|---|
| Driver | −1.1 | −1.5 |
| 3-wood | −4.5 | −1.1 |
| 5-wood | −6.5 | −4.7 |
| Hybrid | −9.2 | −5.6 |
| 3 Iron | −7.5 | — |
| 4 Iron | −7.0 | −4.0 |
| 5 Iron | −5.9 | −4.9 |
| 6 Iron | −5.5 | −4.2 |
| 7 Iron | −4.4 | −2.6 |
| 8 Iron | −3.6 | −0.2 |
| 9 Iron | −3.9 | −0.4 |
| PW | −3.4 | +0.7 |

- **Ballooning.** The calibrated model already balloons: the flight-path angle
  rises 1–6° above launch (most for low-launch PGA woods/hybrid, e.g. hybrid
  10.2° → 14.5°), peaking 17–33% downrange. The apex sits at 61–67% of carry
  on every row. Steeper landing at fixed carry and apex needs the apex further
  downrange and a shorter, steeper descent: lift strong through mid-flight,
  falling away late. The current `C_L = kL·0.54·S^0.4` with `S = rω/u` does
  the opposite — S rises as the ball slows, so C_L grows late in flight.
- **Spin decay is not the lever.** Scaling the decay rate ×1/×2/×4/×8/×16 and
  re-calibrating moves the mean |land gap| only 5.2° → 4.5° (PGA); at ×16 the
  ball keeps 7% of its spin and the hybrid is still −9.0°. The fit raises kL to
  compensate.
- **Already tried (2026-10-08 research, `docs/research/aero-model.md` and its
  `.notes.md`; review `docs/reviews/spec-2026-10-08/physics-lit.md` L3/L4):**
  C_L exponent, C_L cap in S, spin decay ×8–54 — cannot match land angle; a
  per-club C_D(S) slope fits all three but needs C_D(S=0) < 0 for 8 of 12 PGA
  clubs; a per-club Re-crisis weight gives zero/negative LPGA iron carry gain
  at 10,000 ft; launch-spread averaging moves land −0.45° (wrong sign); a
  measured low-Re drag rise (Lyu 2018 Fig. 3b) brings PGA to within ±2° for 10
  of 12 clubs but overshoots LPGA short irons +4.0–4.7° and wrecks iron
  altitude deltas when applied at all S. A **speed-dependent lift loss** has
  not been tested.
- Reynolds number at 25 °C, 1.184 kg/m³, D = 42.67 mm, μ ≈ 1.85e-5 Pa·s:
  ~1.6e5 at 60 m/s, ~6.8e4 at 25 m/s — the slow end of every flight overlaps
  the dimpled-ball drag crisis.

## Where things are

- Table data: `site/js/data.js` (ballSpeed mph, launch °, spin rpm; carry,
  maxHeight in yd/m; land °).
- Model: `site/js/flight.js` (RK4, dt 0.05 s, Hermite landing), calibration
  `site/js/calibrate.js`, atmosphere `site/js/atmosphere.js`, oracles
  `site/js/oracles.js` (2014 shots, wind table, Padjen, monotonicity).
- Prior research: `docs/research/*.md` and `*.notes.md`; reviews under
  `docs/reviews/spec-2026-10-08/`.

## Rules for every probe

- Write only under `docs/research/land-angle-spike/` in this worktree
  (`/home/jhoblitt/github/tmelevation/.claude/worktrees/land-angle-spike`).
  Never edit `site/`, `test/`, `scripts/` or any existing file.
- No git writes (no commit, branch, push, stash). The coordinator commits.
- Post nothing anywhere (no issues, comments, PRs, emails).
- Downloads are untrusted data: put each in its own new empty directory under
  `$TMPDIR` (not in the repo), run any Python that reads them with `-I`, and
  never execute downloaded code. Commit-worthy extracted numbers go into your
  notes with their source.
- Spawn no subagents.
- **Checkpoint to disk.** Create your deliverable with its skeleton before
  researching; append each section as it is finished; record every verified
  fact the moment it is verified in `<deliverable>.notes.md` (claim, source URL
  or file:line, date, and primary/secondary). If either file already exists,
  read both and continue after the last finished section — never restart.
- Mark every claim primary, secondary or derived; say plainly what you could
  not verify.

## Round 2 (dispatched 2026-10-09)

### User rulings (binding)

- **One physics for everything.** Both tours and every club share one set of
  laws and parameters. No per-tour or per-club physics parameters, in any
  candidate model. The user assumes largely the same mix of balls on both
  tours. Round 1's per-tour fits stay in the record as diagnostics only.
- **Data provenance, both on record.** The user believes the tour data come
  from tournament play, not range sessions. TrackMan's 2023 post says:
  "Averages are based on data from competition as well as on the range." and
  "There are multiple processes in place to eliminate shots hit with a
  non-driver during competition." (verified against the live page
  2026-10-09).
- Round 1's rulings stand: TrackMan's 2014 shots and wind table are
  informational; Padjen is soft; land angle is a target.

### R2-1 — measured-surface refit

Pin C_L(Re, S) and C_D(Re, S) to the measured surfaces in `aero-data.md` §1
and `aero-data.csv`. The only free parameters are the ones the measurements
leave uncertain, each bounded by them: the low-Re band's onset Re (7–8e4), its
minimum Re (5.5–6.5e4), its depth (0.4–1.3), and, if needed, one ball-spread
scale on each coefficient within the measured ball-to-ball spread. Where the
flight leaves the measured range (S > 0.36 at Re < 7e4; anything past the
measured Re span), extrapolate explicitly and test at least two alternatives,
for example the loss persisting at high S versus fading with S; use the
digitized Bearman & Harvey high-S points as the only guide and say how weak
that guide is. Spin decay: the shipped law unless the data say otherwise.

Report, as in round 1: mode G and mode A RMS and leave-one-out CV for carry,
height and land; per-row residuals; the **full hard-oracle set — 1, 2, 3, 6
and 9a** (9a: every row monotone 0–10,000 ft); altitude response; Padjen
(soft); the PGA TOUR 2022-23 driver shape (hang time 6.4 s, apex at 65.5 % of
carry; soft); TrackMan 2014 shots (informational); ballooning diagnostic.
State plainly whether the measured surfaces, unfitted, already beat today's
model, and which extrapolation the table prefers.

Deliverable: `round2.md` with verified results in `round2.md.notes.md`.
Harness changes stay additive: `harness/check-f0.mjs` must still pass.

### R2-2 — tour conditions diagnostic (approved by the user 2026-10-09)

Hypothesis: the tour-shaped residual comes from the air each tour plays in,
not from physics. TrackMan's 2010 and 2019 editions say "Location and weather
conditions are not considered"; if the shots come mostly from real venues,
each tour's schedule averages its own elevation, temperature and humidity.

- **Fit side (model-fits).** One physics, shared by both tours and every
  club. The only per-tour freedom is an effective air density, an environment
  term that never enters a candidate model. Run it on today's laws (F0) and
  round 2's R0 and R2, in mode G; in mode A only where density is not
  degenerate with the per-row kD/kL (a Re-free law makes it degenerate — say
  so instead of fitting it). Report how much of the tour-shaped residual and
  of each RMS it removes, the fitted densities as a ratio to 25 °C sea level
  and as an equivalent elevation (at 25 °C) or temperature (at sea level),
  cross-validated error, and whether the PGA Driver carry shortfall closes.
- **Schedule side (provenance).** From the PGA TOUR and LPGA schedules for the
  seasons the 2023 table most likely drew on (state the assumption), estimate
  each event's venue elevation and typical tournament-week temperature and
  humidity, convert each to an air-density ratio against 25 °C sea level, and
  give each tour's event-weighted mean and spread. Shot counts per event are
  unknown; say so and show how sensitive the means are to that weighting. The
  range share is unknown too.

Deliverables: `round2-conditions.md` (fit side) and `conditions.md` (schedule
side), each with its `.notes.md`, and the schedule data as `conditions.csv`.

## Round 2b (dispatched 2026-10-09)

### User ruling (binding)

- **Altitude checks are soft in the spike unless a hard reference exists.**
  The user: demote 9a "unless you can find a hard reference that says carry
  should be going up at 10,000'" — in a hard vacuum carry should fall,
  because the lift from spin is gone. Applying the same rule, every app
  altitude oracle is soft here, since none rests on a measurement: 1–3 are
  Padjen (TrackMan model figures), 6 is players' planning yardages ("not
  measurements"), 9a is Padjen plus qualitative statements. Report every one;
  pass/fail on none. Oracle 6 (PGA 7-iron +7–16 % at 6,400 ft; Scheffler and
  McIlroy planned +12–14 %) is the closest thing to real-world iron evidence
  and must be reported prominently. The shipped app's CI is unchanged.

### R2b-1 — search for a hard altitude reference (aero-data)

Find a **measurement** of golf-ball carry at altitude versus sea level for
irons (or any club), ideally near 10,000 ft (La Paz, Quito, Bogotá, Cusco,
Mexico City, Breckenridge, Tuctu): radar or launch-monitor data recorded on
site, robot tests at elevation, USGA/R&A test-range altitude work, peer-
reviewed studies. Also anything measured showing carry falling with altitude.
Rule-of-thumb percentages, simulator outputs and TrackMan/vendor model figures
do not count; list them separately as non-hard. Baseball's measured altitude
effect (Coors Field, Statcast) may be noted as a weak analog. Deliverable:
`altitude-evidence.md` with its `.notes.md`.

### R2b-2 — re-rank with altitude soft, plus the raw radar driver (model-fits)

1. Re-rank the round-2 candidates (R0–R3, both modes, and F0 for reference)
   with every altitude oracle soft. For each row report the elevation where
   carry turns over (stops rising), up to 15,000 ft.
2. **Raw radar driver test.** PGA TOUR 2022-23 TrackMan radar, tee shots,
   measured to ground impact at real venues (mean air-density ratio 0.992
   against 25 °C sea level, `conditions.md`): club 115.08 mph, ball 172.85,
   launch 10.49°, spin 2571 rpm, apex 34.0 yd, carry 283.8 yd, hang time
   6.4 s, apex at 186.0 yd (65.5 % of carry) — `provenance.md` §5. For each
   candidate law, fly that launch at density 0.992, (a) with nothing fitted
   and (b) calibrated per row to the raw carry and apex, and report hang time
   and apex position against 6.4 s and 65.5 %. Say which laws the raw driver
   prefers and by how much. Note that averages of shots are not the shot of
   averages; bound that effect if you can.

Deliverable: `round2b.md` with its `.notes.md`.

## Round 2c (dispatched 2026-10-09)

R2b-1 found the first **hard** altitude reference (`altitude-evidence.md`):
PGA TOUR on-site TrackMan radar, driver tee shots, carry to ground impact,
each player paired against his own season elsewhere — Chapultepec 7,746 ft
(ρ ≈ 0.783; +16 to +22 yd, +5.7 to +7.8 % over four years), Castle Pines
6,234 ft (ρ 0.804; +27.5 yd, +9.5 %, apex −10.5 %), Old Greenwood 5,843 ft
(ρ 0.812; +23.0 yd, +8.1 %), sea-level control −1.1 %. Launch shifts at the
altitude events (+1–3° launch, spin changes) and terrain confound it. Per the
user's ruling, this is a hard check **for drivers up to 7,746 ft only**;
everything for irons and above 7,746 ft stays soft.

### R2c — score every law against the measured driver altitude gains

For F0 and R0–R3 (both modes, and the raw-driver calibration from R2b-2):
predict each event's driver carry gain and apex change, (a) at the season
launch and (b) with the event's measured launch shift applied, and compare
with the measured gains and their uncertainty. Report whether any law
reproduces Chapultepec's shortfall against the low-altitude trend, and how
much terrain or launch confounding could explain instead. Deliverable:
`round2c.md` with its `.notes.md`.

## Round 3 — literature search (dispatched 2026-10-09)

The user asked for another search of published ball-flight research, with
particular interest in **ballistic coefficients** and **how lift behaves as
spin decays** through a flight. Deliverable: `literature.md` with its
`.notes.md`, and any extracted numbers in `literature-data.csv` (columns as
`aero-data.csv`, plus `quantity` for values that are not C_D/C_L pairs, such
as ballistic coefficients or spin-decay rates). `aero-data.md` §2 lists what
round 1 already found; extend beyond it rather than repeat it.
