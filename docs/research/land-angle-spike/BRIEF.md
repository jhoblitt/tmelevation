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
