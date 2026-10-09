# Physics review — tmelevation design spec (2026-10-08)

Target: `docs/superpowers/specs/2026-10-08-tmelevation-design.md`, sections 1, 3, 5, 6, 8.1, 8.3.
Reviewer mandate: attack the physics. Independent re-implementation at
`/tmp/claude-1000/review-physics/` (throwaway, Node 22).

## Summary

I re-implemented §5.1–5.4 independently and calibrated all 23 rows. The model is sound and the
research numbers reproduce: every row converges in 3 Newton iterations (10 flights), the deltas
are ρ₀-invariant as claimed, and every hard oracle in §8.3 passes except oracle 10's PGA carry
(the closest call among the rest is oracle 8's 7 Iron, 8.88 % against a 10 % ceiling). Against
TrackMan's own fully specified 2014 model shots, including their wind variants, the Re-free
structure is the best of four I tried on land angle and within 3.6 yd on carry. That is new
support for the spec's central physics decision.

The test plan does not match the model, though. Two specified tests fail on day one, and that
is a blocker:

- **P1 (blocker):** oracle 10's hard carry band fails, 188.43 yd against 180–188.
- **P2 (blocker):** the §8.1 0–15,000 ft carry-monotonicity test fails for LPGA 3-wood and
  4 Iron. Carry genuinely peaks near 14,400–14,700 ft, invisibly to the display.
- **P3 (major):** the k envelope is a 15 °C figure, the spec's reference is 25 °C, and ρ₀ is
  never stated.
- **P4 (major):** the 100 ms phone budget is unsupported. The calibration takes 48–98 ms on a
  top-end desktop; dt = 0.05 s fixes it at no accuracy cost.
- **P10 (major):** the tests would pass several broken models, including a reversal of the
  constant-temperature decision and the r/D slip in S. Golden values are supplied.
- **Minor:** the land-angle limitation is misstated and mis-attributed (P5); the land-angle
  delta mapping is uncertain by up to 3.4° at 10,000 ft (P8); the wind tables are an unused
  oracle source (P12).
- **Nits:** P6, P7, P9, P11.

## Findings

### P1 — blocker — §8.3 oracle 10: the spec's own model fails a hard band (CI red on day one)

Claim attacked: oracle 10 "carry ±4 yd, height ±3 yd (hard)" for the TrackMan-model PGA 6 Iron
(130 mph, 14.7°, 6088 rpm → 184 yd) flown with the calibrated 2023 PGA 6 Iron factors.

Evidence (independent re-implementation, `/tmp/claude-1000/review-physics/run_oracles.mjs`):
PGA 6 Iron → carry **188.43 yd** (band 180–188, **FAIL by 0.43 yd**), height 33.16 yd (pass),
land 45.14° (−2.86°, inside the soft band). LPGA 6 Iron passes (153.93 / 27.44 / 43.85).
Not a rounding artefact: calibrating to every corner of the 2023 row's rounding box
(carry 187.55–188.5 yd from the yd and m columns together, apex 31.5–32.26 yd) gives
187.96–188.97 yd (`run_o10.mjs`); the integer targets the spec calibrates to fail. Identical at
ρ₀ = 1.1773 and 1.225 (the deltas and this check are ρ₀-invariant). The research never ran this
oracle: neither `aero-model.md` nor its notes record a result for it. The cause is in the data,
not a bug: the 2023 row (14.0°, 6204 rpm → 188 yd) carries 4 yd farther than TrackMan's 2014
model shot (14.7°, 6088 rpm → 184 yd), and `reference-data.md` (oracle-10 notes) says as much.

Fix: make oracle 10's carry check soft, or widen it to ±6 yd, or drop it as a carry oracle and
keep it only for what it is uniquely good at, the land-angle gap (see P5). Then run every hard
oracle against a reference implementation before the bands are written into the spec.
Also reword §1 criterion 2 ("at altitude ... every hard reference oracle"): oracle 10 is a
sea-level check, not an altitude one.

### P2 — blocker — §8.1 "model" test: carry is not monotone to 15,000 ft for two LPGA rows

Claim attacked: "from 0 to 15,000 ft carry rises and max height and land angle fall,
monotonically, for every row."

Evidence (`run_oracles.mjs`, 25 ft steps; `run_peak.mjs`): carry stops rising for **LPGA 3-wood
at ≈14,440 ft** (peak at ρ/ρ₀ = 0.5775) and **LPGA 4 Iron at ≈14,740 ft** (0.5705). Several more
rows peak just above the range: LPGA Driver ≈15,140 ft, PGA Hybrid ≈15,470, LPGA 5-wood ≈15,580,
LPGA 5 Iron ≈15,740. This is real physics, not a bug: as ρ → 0 carry falls to the vacuum range,
which is *shorter* than the sea-level carry for low-launch, low-spin shots (LPGA 3-wood:
60.4 m/s at 11.6° → 160 yd in vacuum, 200 yd at sea level), so carry(ρ) has an interior maximum.
The drop beyond the peak is tiny (0.027 yd and 0.005 yd at 15,000 ft; displayed integers do
not change), so users never see it, but a strict-inequality unit test does. Max height and land
angle are monotone to 15,000 ft for all 23 rows. Oracle 9 (0–10,000 ft) passes.

Fix: assert raw-carry monotonicity to 10,000 ft only (as oracle 9 already does); to 15,000 ft
assert monotonicity of the *displayed* integers, or non-decrease with a 0.05 yd tolerance; and
state on the methods page that low-spin long clubs approach their maximum carry gain near the
top of the slider.

### P3 — major — §5.3 k envelope comes from a 15 °C calibration; the spec's 25 °C reference gives different k, and ρ₀ is never stated

Claim attacked: "Expected fitted ranges from the research probe: k_D 0.89–1.22, k_L 0.79–1.08.
A row whose fit ... leaves this envelope by a wide margin is a defect, caught by tests."

Evidence: §5.2 defines k = ρA/(2m) but no section states the absolute ρ₀ (or a density formula).
The research probe that produced the envelope used ρ_SL = 1.225 kg/m³, i.e. 15 °C
(`aero-model.md` §7 setup). With that value I reproduce the envelope exactly (k_D 0.889–1.223,
k_L 0.785–1.077). At the spec's stated reference, 25 °C and 50 % RH (ρ₀ = 1.1773 kg/m³,
CIPM-2007 per `atmosphere.md` §5), every k rises by 1.225/1.1773 = 4.05 %: **k_D 0.925–1.273
(LPGA 8 Iron), k_L 0.817–1.120 (LPGA PW)**. An implementer who encodes the quoted envelope as
the test bound gets a red CI; one who sets it loosely enough to pass has a test that catches
little (see P10). Even at 15 °C the printed upper bound is rounded *below* the fitted maximum
(k_D = 1.2230 for the LPGA 8 Iron, against the printed 1.22), so `k_D ≤ 1.22` fails there too.
The deltas are unaffected (ρ·k is what is fitted; verified identical at both ρ₀).

Fix: state ρ₀ explicitly in §5.1/5.2 (either 1.1773 kg/m³, CIPM-2007 at 25 °C and 50 % RH, or
1.1839 kg/m³ dry), and restate the expected ranges for that ρ₀ (k_D 0.93–1.27 and k_L 0.82–1.12
at 1.1773). Better still, express the envelope ρ₀-free as ρ₀·k_D and ρ₀·k_L.

### P4 — major — §5.3 "under 100 ms on a mid-range phone" is not supported; the desktop alone uses half to all of it

Claim attacked: the calibration budget, and implicitly one 23-flight recompute per animation frame (§5.4).

Evidence: 10 flights per row × 23 rows = 230 flights (confirmed). On an AMD Ryzen 9 7950X3D
(a top-end desktop core), Node 22:
- straightforward array-per-step RK4 (`model.mjs`): full calibration **97–98 ms**; one frame **9 ms**;
- allocation-free scalar RK4 (`fast.mjs`): **48 ms** warm, **55 ms** cold (first call, as at page
  load), 170 ms with the JIT disabled; one frame **4.4 ms**.
A mid-range phone core is several times slower than this desktop core (estimate, not measured
here), so a straightforward implementation lands well over 100 ms at load, and a 23-flight
frame takes a large share of the 16.7 ms frame budget while dragging the slider.
The time step is far smaller than accuracy needs (P6): at **dt = 0.05 s** the worst error over
all 23 rows is 2.4×10⁻⁷ yd carry, 3.4×10⁻⁷ yd height, 1.1×10⁻³° land (`run_dt.mjs`), and
calibration drops to **9.7 ms**, one frame to **0.9 ms** (`fast_dt.mjs`).

Fix: specify dt = 0.05 s (or 0.02 s) — the "halving dt changes outputs by < 0.01 yd" test still
passes by four orders of magnitude — and require the implementation to avoid per-step
allocation. Keep the 100 ms budget, but measure it (time the calibration on a real mid-range
phone during development, or in headless Chrome with CPU throttling) instead of asserting it.

### P5 — minor — §5.5 item 2 misstates the land-angle gap, and new evidence locates most of it in the table, not the model

Claim attacked: "After calibration the model lands 1–9° shallower than TrackMan's table ...; the
cause is unresolved."

Evidence: per-row residuals (model − table, `run_cal.mjs`, identical to the research probe) run
from −9.16° (PGA Hybrid) to **+0.68° (LPGA PW, steeper)**, with LPGA 8 Iron −0.25° and 9 Iron
−0.44°: three rows are not "1–9° shallower". Second, calibrating the same model to TrackMan's
*own* fully specified model shot (2014 normalisation blog tables, which I read from the images:
PGA 130 mph / 14.7° / 6088 rpm → 184 yd / 33.8 yd / 48.0°; LPGA 110 / 18.6 / 5950 → 152 / 27.7 /
45.6°) leaves a land gap of only **−1.76° (PGA) and −1.10° (LPGA)** (`run_o10.mjs`), against
−5.47° and −4.23° for the 2023 6 Iron rows. Of four coefficient structures, the spec's Re-free one
is the closest to TrackMan's model on this check (S&S with sin(Re) −3.3°/−2.1°, a Lyu-style
drag crisis +4.2°/+3.9°, C_L ∝ S −3.4°/−2.0°; `run_tm2014.mjs`). The 2023 rows are also
internally inconsistent in a way a single shot cannot be: the smash column is not ball ÷ club
speed even allowing for rounding (LPGA PW 88/72 = 1.222, at most 1.238, published 1.25;
`run_table.mjs`), so the columns are independently averaged.

Fix: correct the range ("from 9° shallower to 1° steeper; 1° or more shallower for 20 of 23
rows"), and replace "the cause is unresolved" on the methods page with the evidence: against
TrackMan's own single-shot model output the gap is 1–2°, so most of the 4–9° gap belongs to the
averaged table rather than to the aero model. This also strengthens the case for the Re-free
choice (§5.5 item 1).

### P6 — nit — §5.2 integration-accuracy figure is five orders of magnitude pessimistic

Claim attacked: "dt = 0.01 s ... about 3×10⁻⁵ yd from a converged solution."

Evidence (`run_dt.mjs`, worst over 23 rows against dt = 10⁻⁴ s, at sea level and 15,000 ft):
dt = 0.01 s gives carry 3.7×10⁻¹⁰ yd, height 5.4×10⁻¹⁰ yd, land 4.9×10⁻⁵° (the land error is
the linear velocity interpolation, second order). Fourth-order convergence is clean (dt 0.05 →
0.02 ratio 39 ≈ 2.5⁴). Harmless as stated, but it hides the fact that dt can be raised fivefold
(P4).

Fix: quote the measured figures and choose dt = 0.05 s (carry 2.4×10⁻⁷ yd, land 1.1×10⁻³°).

### P7 — nit — §5.1 "humidity at 50 %" contradicts "ρ/ρ₀ = P/P₀"

Claim attacked: temperature held at 25 °C and RH at 50 %, "Consequence used by the model:
density ratio ρ/ρ₀ = P/P₀."

Evidence: at constant T and RH the vapour pressure is constant (1585 Pa at 25 °C, 50 %), so
ρ ∝ P − 0.378·p_v, not P. The ratio is 0.8311 vs 0.8321 at 5,000 ft and 0.5620 vs 0.5646 at
15,000 ft (`run_display.mjs`; `atmosphere.md` §5 gives the same 0.8310). Effect on carry ≤
0.18 yd (PGA 9 Iron at 15,000 ft). The humidity value is otherwise used nowhere: it only feeds the
absolute ρ₀, which cancels.

Fix: say "dry air (or constant mixing ratio), so ρ/ρ₀ = P/P₀", or keep 50 % RH and drop the
"consequence" sentence. Pair this with stating ρ₀ (P3).

### P8 — minor — §5.4 "published + Δ" for land angle is one of two defensible mappings that differ by up to 3.4° at 10,000 ft

Claim attacked: displayed land angle = round(published + Δ), Δ taken from a model whose own
sea-level land angle is up to 9° off (§5.5 item 2 acknowledges extra uncertainty but does not size it).

Evidence (`run_land.mjs`): the additive mapping has the wrong vacuum limit. As ρ → 0 the true
land angle tends to the launch angle, but "published + Δ" tends to published + (launch −
model_SL), e.g. PGA Hybrid 49 + (10.2 − 39.8) = 19.4° instead of 10.2°. A mapping that is
equally exact at sea level and has the correct limit, land = launch + (published − launch) ×
(model(r) − launch)/(model(1) − launch), scales Δ by (published − launch)/(model(1) − launch):
1.31 for the PGA Hybrid, 1.15–1.25 for the PGA woods and long irons, about 1.0 for the PGA and
LPGA drivers and LPGA 8 Iron to PW. At 10,000 ft the two mappings differ by up to **3.37°**
(PGA Hybrid: displays 38° vs 35°), and by about 5° at 15,000 ft. Both pass oracle 3, because the
PGA Driver's residual is only −1°. No source discriminates between them.

Fix: either adopt the launch-anchored mapping (it is exact at sea level and correct in the
limit) or keep the additive one and state on the methods page that the land-angle delta for
hybrids, long irons and woods may be understated by up to about 30 % (the launch-anchored
mapping gives larger magnitudes there). In either case, size the uncertainty instead of only
flagging it.

### P9 — nit — §4.3 near-zero formatting is underspecified

Claim attacked: "An unchanged value shows `±0`" / "unchanged shows `±0.0%`"; absolute delta
= displayed − published, percent = unrounded Δ ÷ published.

Evidence (`run_display.mjs`, 0–15,000 ft in 5 ft steps, 23 rows × 3 columns): since every
published value is an integer, the absolute delta is just round(Δ) per unit. It stays `±0`
up to 130–255 ft for carry, 485–860 ft for land angle and 760–2,480 ft for max height. In 4.5 %
of samples the absolute mode shows `±0` while percent mode shows a non-zero one-decimal value
(e.g. a −0.4 yd height change on 32 yd: `±0` vs `−1.3%`). A literal implementation of
"unchanged" (Δ = 0) prints `+0.0%` or `−0.0%` for tiny non-zero Δ. Displayed integers never
reverse direction anywhere in the range (no sign flips), so the only problem is formatting.

Fix: define "unchanged" on the *rounded* value in each mode (`±0` when round(Δ) = 0,
`±0.0%` when the one-decimal percent is 0.0), and add those cases to the present tests.

### P10 — major — §8.1/§8.3 would pass several broken models; nothing pins the model's actual numbers

Claim attacked: that the unit tests plus the hard oracles "check the model" (§1 criterion 5).

Evidence (`run_variants.mjs`): each mutant below was run through the spec's calibration, every
hard oracle, and the §8.1 model checks.

| Mutant (plausible implementation slip) | Effect on 10,000 ft carry gain | Caught by |
|---|---|---|
| ρ on drag only, or lift only; elevation ft read as m | gross | many hard oracles |
| C_L exponent 2.4 (the OCR ambiguity noted in the research) | — | calibration (no landing) |
| S computed with D instead of r | PGA Dr 10.5 → 10.8 %, 7i 16.6 → 17.4 % | **only the k envelope** (k_L 0.58–0.80) |
| ω left in rpm (no 2π/60) | PGA Dr 10.5 → 12.2 %, 7i 16.6 → 19.3 % | oracle 8a by 0.3 points, and the k envelope |
| density from an ISA lapse from 25 °C instead of constant T | PGA Dr 10.5 → 9.2 %, 7i 16.6 → 14.1 % | **nothing** |
| spin decay not ρ-scaled / removed / using absolute ρ | PGA Dr 10.5 → 9.9 / 10.4 / 10.5 % | **nothing** |

So a deliberate design decision (constant temperature, §5.1) can be silently reversed with
green CI, two unit-conversion slips depend entirely on an envelope whose numbers are wrong for
the spec's own ρ₀ (P3), and no test touches spin decay. Also, the §8.1 present test checks only
the yard line (`172` over `+8`); a wrong Δm conversion would pass, although §4.3's own example
gives the metre line (`157` over `+7`).

Fix: add golden regression values from an independent implementation, with tolerances of
0.05 yd and 0.05°. From this review's implementation (deltas are ρ₀-invariant):

| Row | 5,000 ft ΔC / ΔH / ΔL | 10,000 ft ΔC / ΔH / ΔL |
|---|---|---|
| PGA Driver | +17.28 yd / −3.44 yd / −5.07° | +29.58 / −7.05 / −10.12 |
| PGA 7 Iron | +15.88 / −2.17 / −4.10 | +29.24 / −4.74 / −8.72 |
| PGA PW | +12.02 / −1.09 / −3.35 | +22.48 / −2.41 / −6.90 |
| LPGA Driver | +9.62 / −2.34 / −4.48 | +15.52 / −4.62 / −8.59 |
| LPGA 3-wood | +10.26 / −2.60 / −4.97 | +16.55 / −5.22 / −9.78 |

Add direct unit tests as well: ρ/ρ₀ at 5,000 / 10,000 / 15,000 ft = 0.832085 / 0.687832 /
0.564587; S at launch for the PGA Driver = 0.0744; landing spin of the calibrated PGA Driver =
77.7 % of launch spin; ρ₀·k_D and ρ₀·k_L for one row (PGA Driver 1.0893 and 0.9912 kg/m³).
Add the metre line to the present test.

### P11 — nit — §5.3 calibrates to the integer yards and ignores the information in the metre column

Claim attacked: fit "the published carry and max height (yards)".

Evidence (`run_round.mjs`): moving the apex target by ±0.5 yd (its rounding interval) moves the
10,000 ft carry delta by up to **0.85 yd** (LPGA 3-wood); the carry target ±0.5 yd moves it by
up to 0.17 yd. The yd and m columns together narrow several intervals (PGA 4 Iron carry must
be 209.43–209.50 yd, `run_table.mjs`); calibrating to the midpoint of the yd ∩ m interval
moves deltas by up to 0.38 yd (PGA 4 Iron). Sea-level display is unaffected (Δ = 0 there by
construction).

Fix: calibrate to the midpoint of the yd ∩ m interval for carry and max height (a few lines,
using data already stored), test calibration against that target, and state on the methods
page that rounding in the source table alone makes the carry delta uncertain by up to about
1 yd at 10,000 ft.

### P12 — minor — §8.3 leaves out the best structural oracle available: TrackMan's own wind tables

Claim attacked: the oracle set. §8.3 uses the 2014 TrackMan tables only for a calm sea-level
check (oracle 10), and §5.5 item 1 rests the Re-free choice on second-hand altitude quotes alone
("the Re-free model is the one that matches the published altitude evidence").

Evidence: the same 2014 TrackMan blog tables that oracle 10 uses (I read them from the images)
give the *same* fully specified 6-iron shots in 10 and 20 mph head- and tailwind. Wind changes
the aerodynamic forcing through the same C_D/C_L terms that altitude does (not identical:
it also changes V and S). Calibrated to the calm shot and flown in a constant horizontal wind
(`run_wind.mjs`), the spec's model is within **3.6 yd in carry and 2.0° in land angle** of
TrackMan's model in all eight cases (carry rms 2.9 yd PGA, 2.5 yd LPGA). The S&S sin(Re) model
is worse (rms 5.7 / 4.9 yd). A Lyu-style drag crisis fits carry better (rms 1.4 / 1.7 yd) but
misses land angle by +2° to +8°. The spec's model over-responds slightly: a 20 mph tailwind
adds 26.6 yd against TrackMan's 23 (+16 %), and a 20 mph headwind costs 44.6 yd against 41 (+9 %).

Fix: add the eight wind cases as soft oracles (a test-only wind parameter in `flight.js`:
relative velocity in the force terms, ground velocity for position), show them on the methods
page as the one check against TrackMan's own model with fully specified inputs, and cite them
in §5.5 item 1 alongside the second-hand altitude quotes.


## Reproduction results

Independent implementation of §5.1–5.4 exactly as written (RK4, dt = 0.01 s, cubic-Hermite apex
and landing, damped 2×2 Newton with forward-difference Jacobian ε = 10⁻⁴, start (1, 1), tolerance
10⁻⁴ yd), Node 22.22.2, scripts in `/tmp/claude-1000/review-physics/`. ρ₀ = 1.1773 kg/m³ unless
stated; the spec does not give one (P3).

**Calibration (all 23 rows).** Every row converges in 3 Newton iterations, 10 flights per row
(230 in total); Jacobian condition number 3.2–8.9 (largest: LPGA Driver 8.9, LPGA 3-wood 7.2).
Residuals after the fit are below 3×10⁻⁵ yd.

| Row | k_D | k_L | model land | table | residual |
|---|---|---|---|---|---|
| PGA Driver | 0.925 | 0.842 | 37.95 | 39 | −1.05 |
| PGA 3-wood | 1.053 | 0.884 | 39.51 | 44 | −4.49 |
| PGA 5-wood | 1.095 | 0.913 | 41.48 | 48 | −6.52 |
| PGA Hybrid | 1.039 | 0.877 | 39.84 | 49 | −9.16 |
| PGA 3 Iron | 1.114 | 0.946 | 40.46 | 48 | −7.54 |
| PGA 4 Iron | 1.143 | 0.993 | 41.99 | 49 | −7.01 |
| PGA 5 Iron | 1.175 | 1.039 | 44.14 | 50 | −5.86 |
| PGA 6 Iron | 1.157 | 0.932 | 44.53 | 50 | −5.47 |
| PGA 7 Iron | 1.152 | 0.957 | 46.63 | 51 | −4.37 |
| PGA 8 Iron | 1.156 | 0.913 | 47.44 | 51 | −3.56 |
| PGA 9 Iron | 1.152 | 0.876 | 48.14 | 52 | −3.86 |
| PGA PW | 1.072 | 0.817 | 48.65 | 52 | −3.35 |
| LPGA Driver | 0.979 | 0.851 | 34.48 | 36 | −1.52 |
| LPGA 3-wood | 1.161 | 1.083 | 36.90 | 38 | −1.10 |
| LPGA 5-wood | 1.148 | 0.934 | 38.32 | 43 | −4.68 |
| LPGA Hybrid | 1.182 | 0.922 | 39.39 | 45 | −5.61 |
| LPGA 4 Iron | 1.127 | 1.007 | 39.04 | 43 | −3.96 |
| LPGA 5 Iron | 1.163 | 1.037 | 40.15 | 45 | −4.85 |
| LPGA 6 Iron | 1.188 | 0.939 | 41.77 | 46 | −4.23 |
| LPGA 7 Iron | 1.244 | 0.982 | 44.42 | 47 | −2.58 |
| LPGA 8 Iron | 1.273 | 0.980 | 46.75 | 47 | −0.25 |
| LPGA 9 Iron | 1.243 | 1.002 | 47.56 | 48 | −0.44 |
| LPGA PW | 1.232 | 1.120 | 48.68 | 48 | +0.68 |

Ranges: k_D 0.925–1.273, k_L 0.817–1.120 at ρ₀ = 1.1773; k_D 0.889–1.223, k_L 0.785–1.077 at
ρ₀ = 1.225 (the research's figures, which are therefore 15 °C figures).

**Oracles (§8.3).**

| # | Model | Band | Result |
|---|---|---|---|
| 1 | PGA Driver 7,800 ft carry +8.82 % (+24.88 yd) | +5 … +12 % | pass |
| 2 | max height −15.60 % (−5.46 yd) | −8 … −28 % | pass |
| 3 | land −7.93° | −5 … −13° | pass |
| 4 | PGA Driver 5,280 ft +6.42 % | +3.5 … +8.5 % | pass |
| 5 | mean PGA gain 7,200 ft +10.77 % (rows 8.30–12.75) | +6.5 … +13 % | pass |
| 6 | PGA 7 Iron 6,300 ft +11.16 % | +7 … +16 % | pass |
| 7 | 6,300 ft: 7i 11.16 ≥ Dr 7.45; PW 10.51 ≤ 7i | ordering | pass (soft) |
| 8 | 4,920 ft: 7i +8.88 %; Dr +6.04 % | +4 … +10; +3 … +7.5 | pass |
| 9 | monotone 0–10,000 ft, all rows (25 ft steps) | sign | pass |
| 10 | PGA 6i 188.43 yd / 33.16 yd / 45.14°; LPGA 6i 153.93 / 27.44 / 43.85° | ±4 yd, ±3 yd hard; ±3° soft | **PGA carry FAIL** (P1); rest pass |
| 11 | 5,280 ft: LPGA Dr 4.51 % vs PGA Dr 6.42 % | ≤ PGA + 1 | pass (soft) |
| §8.1 | monotone 0–15,000 ft | sign | **FAIL** for LPGA 3-wood, 4 Iron (P2) |

Density ratios used: 4,920 ft 0.8346; 5,280 ft 0.8234; 6,300 ft 0.7924; 7,200 ft 0.7659;
7,800 ft 0.7486; 10,000 ft 0.6878; 15,000 ft 0.5646.

**Do the research numbers reproduce?** Yes, wherever the research stated its conditions: the k
ranges (at its 1.225 kg/m³), every land residual, the calibrated deltas for PGA Driver, 7 Iron,
PW and LPGA Driver at 5,000 and 10,000 ft (e.g. PGA Driver +17.28 / +29.58 yd, research +17.3 /
+29.6), and the 7,800 ft driver comparison (+24.9 yd, −5.5 yd, −7.9°). Two research figures do
not carry over to the spec: the k envelope (it is for 15 °C, the spec says 25 °C; P3) and the
dt accuracy (3×10⁻⁵ yd claimed, ≤ 4×10⁻¹⁰ yd measured; P6). Neither changes a delta.

**Timing.** AMD Ryzen 9 7950X3D, Node 22: full calibration 97–98 ms (array-allocating RK4),
48 ms warm / 55 ms cold (allocation-free), 9.7 ms at dt = 0.05 s; one 23-flight frame 9 / 4.4 /
0.9 ms respectively (P4).

**Source table.** All 23 rows × 9 columns of the transcription match the two TrackMan images
(downloaded and read); PGA 4 Iron 209/192 is the only yd/m mismatch and is consistent (carry
209.43–209.50 yd). LPGA 3-wood 2595 rpm is as published.


## Non-findings

What I tried to break and could not:

1. **Source data (§3).** Every value of both transcribed tables matches the TrackMan images;
   the only yd/m mismatch (PGA 4 Iron) is internally consistent. LPGA 3-wood's low 2595 rpm is
   as published.
2. **Two multiplicative knobs are well-posed for every row (§5.3).** All 23 rows converge from
   (1, 1) in 3 iterations with condition number ≤ 8.9, including LPGA 3-wood (cond 7.2) and
   LPGA Driver (8.9). "About 10 flights per row" is exactly 10.
3. **"The deltas depend only on P/P₀" (§5.5 item 1).** True for the Re-free model: calibrating
   at ρ₀ = 1.1773 and 1.225 gives deltas that agree to 1.9×10⁻⁵ yd/° (the calibration tolerance)
   over 23 rows at 5, 10 and 15 thousand feet. The reason is structural: ρ enters only as ρ·k_D
   and ρ·k_L, and spin decay uses the ratio.
4. **The hard oracles do discriminate the Re alternatives.** S&S with its sin(Re) term fails
   oracles 1, 4, 5, 8a and 8b; a Lyu-style crisis fails 5, 6 and 9 (`run_variants.mjs`). Against
   TrackMan's own single-shot model output the Re-free structure is also the closest on land
   angle (P5) and good on wind response (P12). The Re-free choice survives every test I put to it,
   though the evidence remains TrackMan-derived rather than measured physics.
5. **C_L = 0.54 S^0.4 at iron and wedge S (0.29–1.17 along the flight).** Immaterial to the
   deltas once calibrated: capping S at 0.3 inside C_L (a saturating lift curve) moves the
   10,000 ft carry gain by at most 0.83 points over all 23 rows (PGA 4 Iron; ≤ 0.3 for the PGA
   Driver, 7 Iron, PW and LPGA Driver), with k_L rising to 1.39 to compensate. C_L ∝ S moves it
   by up to 2.05 points (PGA 3-wood) (`run_clsat.mjs`). Lift shape is worth about 2 points at
   most, well inside the Re uncertainty.
6. **Spin-decay ρ-scaling (§5.2).** Physically right (the decay torque is ∝ ρV², Tavares'
   torque form makes λ ∝ ρ) and small: unscaled decay changes the PGA Driver's 10,000 ft gain from
   10.5 % to 9.9 %; no decay at all, 10.4 %. Landing spin is 78–90 % of launch, consistent with
   Penner's "about 75 %" for a driver.
7. **Holding temperature constant (§5.1).** A defensible, documented decision. The ISA-lapse
   alternative lowers 10,000 ft gains (PGA Driver 10.5 → 9.2 %, 7 Iron 16.6 → 14.1 %); both pass
   every hard oracle, so the oracles cannot arbitrate it and the spec's reasons (TrackMan Normalize
   keeps 77 °F at any altitude) carry the decision.
8. **Equations (§5.2).** The component EOM put lift at +90° to v (up and back on the way up)
   for backspin, consistent with Penner eqs 14–15; Smits & Smith's normalised decay
   (dω/dt)·d²/(4U²) = −R₁S reduces exactly to dω/dt = −λVω/r with λ = R₁.
9. **Display arithmetic (§4.3, §5.4).** Δ = 0 exactly at ρ/ρ₀ = 1; displayed integers never
   reverse direction anywhere from 0 to 15,000 ft (5 ft steps, every row, column and unit), even
   where raw carry peaks (P2), so there are no sign flips or flicker; `172/157` over `+8/+7` for
   the PGA 8 Iron at 171.6 yd follows. Max-height deltas stay `±0` up to 760–2,480 ft, which is
   correct, not noise.
10. **Integration (§5.2).** RK4 at dt = 0.01 s with the specified interpolation is converged far
    below display precision (P6); halving dt changes carry by 3.5×10⁻¹⁰ yd.

## Unverified concerns

1. **Phone timing.** P4 rests on desktop measurements; the phone slow-down factor is an
   estimate. A throttled headless-Chrome run would settle it.
2. **Size of the Re effect.** §5.5 says modelling Re "changes iron gains by up to about 2×".
   That is one parametrisation's result. My crisis variant (Lyu's low-speed fit added below
   Re = 10⁵ at every S) cuts the 10,000 ft gain of the PGA 7 Iron from 16.6 % to 5.7 % and of the
   PW from 15.8 % to 2.0 %, and makes 20 rows non-monotone below 10,000 ft. S&S's sin(Re) term raises the 7 Iron
   to 22.1 %. No source says which crisis form applies to a spinning ball at S = 0.3–1.2, so
   "about 2×" is not a bound. The methods page should say the effect is unquantified, not "2×".
3. **Wind over-response as a proxy for altitude over-response.** The Re-free model over-responds
   to TrackMan's 20 mph tailwind and headwind cases by 16 % and 9 % in carry (P12). If altitude
   behaves similarly, the displayed carry gains could exceed TrackMan-model gains by about 10 %
   of their value. Wind and altitude are different perturbations, so this is not established.
4. **Per-row input noise.** Two nearly identical 6-iron launch sets (the 2023 average and
   TrackMan's 2014 model shot) give 10,000 ft carry gains of 14.9 % vs 16.7 % (PGA) and 11.0 % vs
   13.2 % (LPGA) (`run_land.mjs`). The averaged table's internal inconsistency (P5) probably
   limits per-row deltas to about ±1–2 points, more than the display precision suggests.
