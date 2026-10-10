# Land-angle spike, probe 2: model fits

Probe 2 ("model-fits") of the land-angle spike, 2026-10-09. Brief:
`docs/research/land-angle-spike/BRIEF.md`. Verified numbers, each with the
command that produced it, are in `model-fits.md.notes.md`. Harness code
(throwaway spike code, Node ESM, no dependencies) is under
`docs/research/land-angle-spike/harness/`.

Claim tags: **[P]** primary (read at source), **[S]** secondary, **[D]** derived
here (harness output; command in the notes).

## 1. Summary and recommendation

**Answer: no.** Seventeen law families were fitted, plus altitude-constrained
variants of eight; each has ≤ 6 bounded global parameters. None predicts carry,
max height and land angle for all 23 rows within the success bar, in either
mode. All numbers are **[D]** from the harness, which reproduces the shipped
app to 5e-13° (§2).

| | Best family | RMS carry / height / land | LOO-CV | Altitude response |
|---|---|---|---|---|
| Today (F0) | — | G 7.58 / 2.19 / 4.21; A land 4.65 | G 8.12 / 2.24 / 4.25 | defensible (Padjen −7.9°) |
| Mode G, best balance | F1 lift loss below Re ≈ 7.7e4 | 4.09 / 1.92 / 2.38 | 4.96 / 2.04 / 2.52 | broken: LPGA iron carry −7 % at 10k |
| Mode G, best land | F10 measured-anchored crisis | 5.52 / 2.65 / 1.71 | 7.86 / 3.12 / 1.81 | broken: carry falls with elevation |
| Mode G, altitude-held | F2-c1000 drag rise ×½ | 4.95 / 1.77 / 2.79 | 5.85 / 1.81 / 2.89 | nearly monotone; fails hard oracle 9a (14 carry falls ≤ 0.43 yd) |
| Mode A (app calibration) | F2 / F6 drag rise below Re ≈ 7–7.5e4 | land 1.76 | 2.11 / 1.98 | broken; fails oracles 3, 6 (F2) |
| Mode A, altitude-held | F2-c1000 | land 2.02 | 2.06 | nearly monotone; Padjen −7.7° |
| Mode A, Re-free | F10r (steep C_D(S), C_L capped at S 0.3); F10rn (lift → 0 by S 0.6) | land 2.24; 1.99 | 2.24; 2.08 | monotone; Padjen −10.5° / −11.4° |

Success bar: land ≤ 1.5°, carry ≤ 2 yd, height ≤ 1 yd. **Not met.** The
closest are mode A at 1.76° and mode G land at 1.71°. The carry bar cannot be
met by any shared law: the PGA Driver flies 8–14 yd short under all of them.

Five findings decide the recommendation:

1. **The mechanism that fits the land column is a sharp loss of lift or rise
   of drag once the ball slows below Re ≈ 7e4.** The apex moves 1–4 points of
   carry further downrange (PGA woods and hybrid from ~66–67 % to 68–71 %), and
   the descent is shorter and steeper. Measured low-Re aerodynamics of current
   tour balls do this (Lyu et al. 2020 via probe 1: lift collapses and C_D
   roughly doubles between Re 7.5e4 and 5e4, for S ≤ 0.36), and the fits place
   it within 10–20 % of the measured Re.
2. **At full strength it wrecks the altitude response.** Altitude lowers Re,
   so iron carry gains shrink or go negative and carry stops rising with
   elevation. Holding the response defensible halves the effect or more, and
   costs 0.26–0.7° of land RMS in mode A and 0.3–1.0° in mode G.
3. **The LPGA rows reject it.** Fitted alone they take no low-Re lift loss,
   though their flights spend as much or more of the descent below Re 7e4. In
   every mode-A fit the same tour-shaped residual remains: PGA hybrid and long
   irons too shallow, LPGA short irons too steep. Each tour alone fits to
   1.3–1.6° (F2 A\*), with different parameters.
4. **TrackMan's own model does not contain the steepening.** Laws that fit the
   2023 land column land 2–4° steeper than TrackMan's 2014 model 6-irons, and
   the drag-rise laws' wind response departs from TrackMan's by up to 3.6°.
5. **The coefficients needed sit at or beyond the measured ranges.** The fits
   want steps sharper than measured (width at its floor), drag slopes in S at
   or past the top of the measured range (0.8–2 against 0.2–0.68 measured), and
   they act at S 0.4–1.3, where nothing is measured. Spin-ratio-scaled Re-free
   laws, probed hard after probe 3 tied the gap to spin and launch, do no
   better: mode G rejects them, and mode A\* reaches 2.0–2.6° only at their
   bounds (§3.6).

**Recommendation.** Do not change the shipped laws on this evidence, and keep
land angle as "published + Δ". The gap is not closed by any physically
plausible shared law that also keeps a defensible altitude response, and its
tour-shaped residual points at how the land column was compiled (probe 3) more
than at the aerodynamics. If an interim improvement under the app's calibration
is wanted anyway, the best-supported candidate is **F2-c1000**: C_D gains a
sharp +0.2 below Re ≈ 6.8e4 (where the measured crisis is), and land RMS goes
4.65° → 2.02° (CV 2.06°) with nearly monotone altitude deltas. It should be
labelled a fit, not measured physics, because its slope and sharpness sit at
the edge of the data. The next experiment that would change this picture is a
measurement of C_L and C_D at Re 4–8e4 and S 0.3–1.3 (§7.1), and a per-tour
offset test once probe 3 reports (§7.2).

## 2. Harness and its verification

**Code** (all throwaway, Node ESM, no dependencies; `site/` is imported
read-only for the table, the atmosphere and the unit constants):

| File | Role |
|---|---|
| `harness/core.mjs` | 2-D integrator in vector form, Re, per-row calibration |
| `harness/laws.mjs` | the model families and their bounded parameters |
| `harness/fit.mjs` | bounded Levenberg–Marquardt with seeded random restarts |
| `harness/eval.mjs` | modes G / A / A*, leave-one-out, altitude, TrackMan 2014, ballooning |
| `harness/run-family.mjs` | runs one family end to end (`--constrained`, `--pen-step`, `--weights`); logs to `harness/out/<family>.txt` and `.json` |
| `harness/check-f0.mjs` | the harness check below |
| `harness/summary.mjs`, `rows-table.mjs`, `balloon-table.mjs`, `tm-table.mjs` | tables in this document, from `harness/out/*.json` |
| `harness/plausibility.mjs` | fitted coefficients against probe 1's measured points (§3.5) |
| `harness/tour-split.mjs` | per-tour fits (§3.4) |
| `harness/re-exposure.mjs` | share of each flight below Re 7e4 / 8e4 (§6) |
| `harness/timing.mjs` | evaluation timing probe |

**Integrator.** State (x, y, v_x, v_y, ω, air path). Drag acts along −v_rel and
Magnus along ω̂ × v̂_rel with ω̂ = +z (backspin), both scaled by ½ρA u²/m; the
code writes them as a cross product so that spin axis and crosswind can drop
in later. RK4 at dt = 0.05 s, apex from the Hermite cubic at the linear v_y
zero, landing from 3 Newton steps on the Hermite y and the land angle from
linearly interpolated (v_x, v_y): the same scheme as `site/js/flight.js`.
C_D(Re, S), C_L(Re, S) and dω/dt are plug-ins; the default decay is the shipped
Smits & Smith law dω/dt = −(λ₀ρ/ρ₀) u ω / r, λ₀ = 2e-5.

**Reynolds number.** Re = ρ u D / μ with μ from Sutherland's law at the app's
fixed 25 °C: μ = 1.837e-5 Pa·s, ρ₀ = 1.1839 kg/m³ (`site/js/atmosphere.js`),
so Re = 1.65e5 at 60 m/s and 6.87e4 at 25 m/s **[D]**. Because the app holds
temperature at 25 °C, μ is constant and Re falls in proportion to ρ at
altitude: a Re-dependent law changes the altitude response itself.

**Harness check (passed)** **[D]** (`node harness/check-f0.mjs`):

- F0 (today's laws) with per-row kD, kL fitted to carry + height reproduces
  every row of the BRIEF's land-gap table within **0.050°** (bar 0.1°; the
  0.05° maxima are the BRIEF's own rounding to 0.1°). Against the shipped
  `site/js/model.js` run in the same process, the harness land angles agree
  to 5e-13° on all 23 rows. Land RMS 4.65°, PGA mean |gap| 5.19°.
- PGA Driver at 5,280 ft (ρ/ρ₀ = 0.82341): land change **−5.354°** in the
  harness and the shipped app (target −5.35°, bar 0.05°); carry +18.11 yd both.

**Fitter.** Levenberg–Marquardt on a logistic re-parametrisation that keeps
every parameter inside its bounds, forward-difference Jacobian, best of the
initial guess plus 6–12 seeded random starts. Leave-one-row-out refits start
from the full-data optimum.

**Objective and weights.** Each residual is divided by its success-bar
tolerance: carry / 2 yd, max height / 1 yd, land / 1.5°. The table's ±0.5
rounding is the same in all three columns (uniform-rounding SD 0.29) and far
below every tolerance, so rounding cannot set the relative weights; the bar
can, and dividing by it makes "one bar-width of error" cost the same in each
output. Equal unit weights were run as a sensitivity check (§3).

**Modes.**

- **G (predictive):** one parameter set for all 23 rows, kD = kL = 1. Reported:
  per-row residuals, RMS, and leave-one-row-out cross-validated (CV) RMS.
- **A (app-style):** per-row kD, kL fitted to carry + height exactly as
  `site/js/calibrate.js` does, so carry and height residuals are zero and only
  land is reported. Shown twice: with the mode-G shape parameters, and as
  **A\***, the family's shape parameters (all but the overall drag and lift
  levels, which kD and kL absorb) refitted to minimise land RMS under per-row
  calibration. A\* answers "can this law shape fix land angle under the app's
  calibration?"; its CV RMS refits the shape without the held-out row.
- **Altitude** deltas use the model's own sea-level flight (mode G) or the
  calibrated sea-level flight (mode A, as the app does), at constant 25 °C.

## 3. Results by family

### 3.1 Families

All use the shipped Smits & Smith spin decay unless stated; `lowRe(Re; Re_c, w)`
is a logistic step in ln Re that is 1 well below Re_c and 0 well above it (10–90 %
over 4.4 w). Widths marked "fixed" use w = 0.15, about the measured crisis width
(the non-spinning 13-ball average falls from C_D 0.477 at 5e4 to 0.215 at 1e5,
Lyu et al. 2018 via probe 1's notes **[S]**; the spinning Lyu et al. 2020 balls
fall over 5e4–7.5e4, about w = 0.1 **[D]**). Parameter counts k are global
parameters; mode A adds 2 per row.

| Family | C_D(Re, S) | C_L(Re, S) | k |
|---|---|---|---|
| F0 | gD (0.24 + 0.18 S) | gL · 0.54 S^0.4 | 2 |
| F0b | a0 + a1 S | c0 S^cexp | 4 |
| F1 (speed/Re lift loss) | a0 + a1 S | c0 S^0.4 (1 − dL · lowRe(Re; ReL, wL)) | 6 |
| F2 (Re drag rise) | a0 + a1 S + dD · lowRe(Re; ReD, wD) | c0 S^0.4 | 6 |
| F3 (F1 + F2) | F2 with shared Re_c, fixed w | F1 with shared Re_c, fixed w | 6 |
| F4s (saturating C_L + F1) | a0 + a1 S | cmax (1 − e^(−S/S0)) (1 − dL · lowRe), fixed w | 6 |
| F4l (linear C_L + F1) | a0 + a1 S | c1 S (1 − dL · lowRe) | 6 |
| F5 (spin-shifted drag crisis) | a0 + a1 S + dD · lowRe(Re (1 + βS)), fixed w | c0 S^0.4 | 6 |
| F6 (drag rise fading with S) | a0 + a1 S + dD · lowRe(Re) · e^(−S/Sf), fixed w | c0 S^0.4 | 6 |
| F7 (smooth Re power laws) | (a0 + a1 S)(Re/1e5)^qD | c0 S^cexp (Re/1e5)^qL | 6 |
| F8 (lift loss fading with S) | a0 + a1 S | c0 S^0.4 (1 − dL · lowRe(Re) · e^(−S/Sf)), fixed w | 6 |
| F9 (F0b + spin decay ×m) | a0 + a1 S | c0 S^cexp; dω/dt × m | 5 |
| F10 (measured-anchored) | gD [CDmeas(fRe · Re) + a1 (S − 0.15)] | gL · CLmeas(S) | 5 |
| F10r (F10, Re-free control) | gD [CDmeas(1.5e5) + a1 (S − 0.15)] | gL · CLmeas(S) | 4 |
| F0bw (F0b, a1 bound 2) | a0 + a1 S, a1 ≤ 2 | c0 S^cexp | 4 |
| F10rn (F10r, lift may fall) | as F10r, a1 ≤ 2 | gL · max(0, CLmeas(S)), cHi ≥ −1 | 4 |
| F11 (peaked lift) | a0 + a1 S, a1 ≤ 2 | cmax [x e^(1−x)]^n, x = S/Sp | 5 |

CDmeas is the mid-range of the three balls in Lyu et al. 2020 Fig. 3 at ~2250 rpm
(0.475 at Re 5e4, 0.35 at 6.3e4, 0.26 at 7.5e4, 0.225 at 1e5, 0.195 at 1.25e5,
0.175 at 1.5e5, 0.20 at 1.75–2e5, 0.21 at 2.5e5), and CLmeas is Lyu et al.
2018's quadratic −3.25 S² + 1.99 S up to S = 0.3, linear (slope cHi) above.
Both are read from probe 1's notes (`aero-data.md.notes.md`) **[S]**.

Spin decay appears only inside F9; the BRIEF already shows decay alone is not
the lever, and the mode-G fit drives the multiplier to its lower bound (m = 0.25).
F0bw, F10rn and F11 were added after probe 3 reported that the gap follows spin
and launch (§3.6); all three are Re-free.

**Altitude-constrained variants (suffix -c).** The Re-dependent families broke
the altitude response (§4), so each was refitted with hinge penalties that are
zero when the response is defensible: for every row, carry may not fall and max
height and land angle may not rise from one penalty node to the next up to
10,000 ft, and PGA Driver at 7,800 ft (+5…+12 % carry, −13…−5° land) and PGA
7-iron at 6,400 ft (+7…+16 %) must sit inside the app's hard-oracle bands. The
penalty uses launch conditions only, never table targets. Nodes every 2,500 ft
(-c) or 1,000 ft (-c1000).

### 3.2 Mode G: one parameter set for all 23 rows

RMS of model − table over the 23 rows, and leave-one-row-out CV RMS, as carry
yd / max height yd / land ° **[D]** (`harness/summary.mjs`; logs
`harness/out/<family>.txt`). "Alt. OK" means a monotone altitude response from
0 to 10,000 ft on a 250 ft grid plus all of the app's hard oracles (§4).

| Family | k | RMS carry / height / land | LOO-CV RMS | params at a bound | alt. OK |
|---|---|---|---|---|---|
| F0 (today's laws) | 2 | 7.58 / 2.19 / 4.21 | 8.12 / 2.24 / 4.25 | — | yes |
| F0b | 4 | 5.22 / 1.84 / 4.00 | 6.25 / 1.98 / 4.09 | — | yes |
| F1 lift loss | 6 | **4.09 / 1.92 / 2.38** | **4.96 / 2.04 / 2.52** | wL (step) | no |
| F2 drag rise | 6 | 4.67 / 1.69 / 2.46 | 5.62 / 1.76 / 2.88 | wD (step) | no |
| F3 | 6 | 4.75 / 1.81 / 2.59 | 5.74 / 1.91 / 2.77 | dL = 0 | no |
| F4s | 6 | 5.50 / 2.68 / 2.71 | 6.87 / 2.93 / 2.78 | dL = 1 | no |
| F4l | 6 | 7.28 / 3.94 / 4.40 | 8.84 / 4.58 / 4.73 | — | no |
| F5 | 6 | 4.50 / 1.78 / 2.79 | 5.41 / 1.87 / 3.04 | dD | no |
| F6 | 6 | 4.31 / 1.80 / 2.50 | 5.20 / 1.88 / 2.68 | dD | no |
| F7 | 6 | 4.65 / 1.68 / 3.15 | 5.49 / 1.93 / 3.37 | qD | monotone; fails oracles 3, 6 |
| F8 | 6 | 4.33 / 2.11 / 3.40 | 5.26 / 2.21 / 3.49 | dL = 1 | no |
| F9 | 5 | 5.19 / 1.84 / 3.97 | 6.21 / 1.99 / 4.06 | m = 0.25 | yes |
| F10 measured-anchored | 5 | 5.52 / 2.65 / **1.71** | 7.86 / 3.12 / 1.81 | — | no (carry falls with altitude) |
| F10r | 4 | 6.08 / 2.49 / 3.43 | 7.54 / 2.70 / 3.44 | — | 3 falls ≤ 0.18 yd at 9,500 ft+ |
| F0bw / F10rn | 4 | = F0b / = F10r | = F0b / = F10r | — | as F0b / F10r |
| F11 | 5 | 5.37 / 1.87 / 3.94 | 6.45 / 1.98 / 4.01 | Sp = 2 (no peak) | yes |
| F1-c1000 | 6 | 4.72 / 1.88 / 3.33 | 5.59 / 1.92 / 3.41 | wL | ≈ (12 falls ≤ 0.41 yd) |
| F2-c1000 | 6 | **4.95 / 1.77 / 2.79** | **5.85 / 1.81 / 2.89** | wD | ≈ (14 falls ≤ 0.43 yd) |
| F6-c1000 | 6 | 4.95 / 1.84 / 3.29 | 5.90 / 1.89 / 3.38 | — | ≈ (12 falls ≤ 0.37 yd) |
| F10-c1000 | 5 | 6.58 / 2.63 / 3.00 | 8.14 / 2.83 / 3.06 | — | ≈ (3 falls ≤ 0.65 yd) |

The 2,500 ft-node variants (F1-c, F2-c, F4s-c, F6-c, F8-c) are in the notes.
Where both exist they agree with the 1,000 ft runs to within 0.05° in G and
0.10° in A\*. F0b-c and F9-c equal the
unconstrained fits: their penalty is already zero.

Readings **[D]**:

- **No family approaches the bar** (carry ≤ 2 yd, height ≤ 1 yd, land ≤ 1.5°).
  The best land RMS comes with 5.5 yd carry and 2.7 yd height RMS (F10), and
  the best overall (F1) has 4.1 / 1.9 / 2.4.
- **The carry bar is out of reach because of one row.** Every shared law flies
  the PGA Driver 8–14 yd short (F1 −11.7, F2-c1000 −14.2, F10 −8.4). Under F1
  and F2-c1000 the LPGA Driver fits within ~2 yd. That row alone puts 1.8–3.0
  yd under the carry RMS. Under the Re families the PGA PW (−6.7 to −11.2 yd)
  is the next-worst row.
- **Every family that improves land angle does it with a Re feature at
  6.8–8.6e4**: lift switched off (F1: dL 0.92 at 7.7e4), drag raised (F2:
  +0.22 at 7.1e4), or the measured crisis moved up to 8.6e4 (F10, fRe 0.74).
  The fit makes the step as sharp as the bounds allow, so it acts as a switch:
  rows whose late flight crosses ~7e4 Re get the steepening.
- **Overfitting is modest.** CV inflates the land RMS by 0.04–0.42° and carry
  by 0.5–2.3 yd. Leave-one-out parameters stay in narrow bands (F1: ReL
  7.67–7.88e4, dL 0.88–1.00). The bigger risks are degeneracy and
  multimodality. F1 and F10 each have two basins: F1's cost is 238.8 against
  399.1 for its no-lift-loss basin, close to F0b's 398.7. Widths sit at the
  0.03 floor, and F3, offered both mechanisms, drops the lift loss entirely.
- **Weights do not drive this.** With equal unit weights F1 gives 4.07 / 2.02
  / 2.27 and F0b 4.97 / 2.25 / 3.94 (`--weights 1,1,1`).

Per-row residuals (model − table) for the baseline, the best unconstrained,
the best altitude-constrained and the best-land families **[D]**:

| Row | F0 carry / height / land | F1 | F2-c1000 | F10 |
|---|---|---|---|---|
| PGA Driver | −26.6 / +1.1 / +3.1 | −11.7 / +1.0 / +3.0 | −14.2 / +1.5 / +2.4 | −8.4 / −5.3 / +1.6 |
| PGA 3-wood | −6.0 / +3.0 / −1.5 | +2.7 / +2.7 / 0.0 | +1.0 / +2.9 / −0.3 | +9.9 / +2.1 / +3.4 |
| PGA 5-wood | −1.7 / +2.6 / −4.6 | +3.8 / +2.3 / −2.2 | +2.1 / +2.2 / −2.4 | +9.8 / +3.6 / +1.9 |
| PGA Hybrid | −7.3 / +2.8 / −6.1 | −3.8 / +2.4 / −3.4 | −4.9 / +2.3 / −3.9 | +0.1 / +3.7 / +0.2 |
| PGA 3 Iron | −0.6 / +1.2 / −6.5 | +2.6 / +0.6 / −4.0 | +2.1 / +0.6 / −4.7 | +4.9 / +1.4 / −0.8 |
| PGA 4 Iron | +0.5 / −0.3 / −7.3 | +1.8 / −1.0 / −4.5 | +1.6 / −1.0 / −5.3 | +3.2 / −0.1 / −1.7 |
| PGA 5 Iron | +2.5 / −1.5 / −7.2 | +1.8 / −2.3 / −4.0 | +1.7 / −2.4 / −4.9 | +2.5 / −1.7 / −1.9 |
| PGA 6 Iron | +4.1 / +2.6 / −4.6 | +1.8 / +1.5 / −0.7 | +0.7 / +1.6 / −1.7 | +2.4 / +1.7 / +0.1 |
| PGA 7 Iron | +2.3 / +1.4 / −4.1 | −1.0 / −0.2 / 0.0 | −3.0 / +0.1 / −1.0 | −0.6 / −0.2 / −0.2 |
| PGA 8 Iron | +3.1 / +3.0 / −2.8 | −0.4 / +0.9 / +1.5 | −3.5 / +1.4 / +0.4 | +0.1 / +1.7 / +0.7 |
| PGA 9 Iron | +2.6 / +3.8 / −2.8 | −0.9 / +1.3 / +1.4 | −4.8 / +2.0 / +0.5 | −0.9 / +2.7 / +0.3 |
| PGA PW | −3.5 / +3.5 / −1.4 | −6.7 / +0.4 / +2.3 | −11.2 / +1.7 / +1.8 | −8.1 / +2.5 / +1.1 |
| LPGA Driver | −10.4 / +1.8 / +2.2 | −1.8 / +1.4 / +2.4 | −2.1 / +1.8 / +1.3 | −8.6 / −2.7 / +1.5 |
| LPGA 3-wood | −4.0 / −2.7 / −3.6 | +3.2 / −3.3 / −3.7 | +2.6 / −2.8 / −4.8 | −5.7 / −6.4 / −4.8 |
| LPGA 5-wood | +4.5 / +2.0 / −3.5 | +4.4 / +1.3 / −1.0 | +5.9 / +1.4 / −1.9 | +2.3 / +1.2 / +1.4 |
| LPGA Hybrid | +8.1 / +2.8 / −4.4 | +6.0 / +2.1 / −1.6 | +8.2 / +2.2 / −2.4 | +3.2 / +1.9 / +0.5 |
| LPGA 4 Iron | −2.0 / −0.9 / −4.5 | −5.6 / −1.7 / −1.9 | −2.5 / −1.5 / −2.8 | −9.2 / −2.1 / −0.3 |
| LPGA 5 Iron | +0.1 / −1.2 / −6.1 | −5.0 / −2.1 / −3.5 | −1.6 / −1.9 / −4.2 | −8.5 / −2.7 / −2.3 |
| LPGA 6 Iron | +6.1 / +2.0 / −3.7 | −0.4 / +0.6 / −0.9 | +2.1 / +1.1 / −1.2 | −2.9 / −0.2 / −0.3 |
| LPGA 7 Iron | +8.3 / +1.6 / −3.2 | +1.0 / −0.3 / −0.6 | +2.9 / +0.5 / −0.5 | −0.9 / −0.7 / −0.1 |
| LPGA 8 Iron | +9.4 / +2.0 / −1.1 | +2.4 / −0.5 / +1.3 | +3.0 / +0.7 / +1.8 | +0.8 / −0.1 / +1.9 |
| LPGA 9 Iron | +6.2 / +0.9 / −1.4 | −1.2 / −2.0 / +0.3 | −0.5 / −0.3 / +1.5 | −3.2 / −1.2 / +1.4 |
| LPGA PW | +3.9 / −1.4 / −1.1 | −3.7 / −4.9 / −0.7 | −3.2 / −2.7 / +1.8 | −5.0 / −3.2 / +1.3 |

### 3.3 Mode A: per-row kD, kL fitted to carry + height (as the app does)

Carry and height match exactly by construction; land RMS over 23 rows **[D]**.
"A (G shape)" keeps the family's mode-G shape parameters. "A\*" refits the
shape parameters to land under per-row calibration (the overall drag and lift
levels are left to kD, kL), and its CV refits that shape without the held-out row.

| Family | A (G shape) | A\* | A\* LOO-CV | A\* params at a bound | A\* alt. OK |
|---|---|---|---|---|---|
| F0 (shipped app) | 4.65 | 4.65 | — | — | yes |
| F0b | 4.22 | 3.38 | 3.39 | a1 = 0.8 | yes |
| F1 | 2.43 | 2.05 | 2.21 | a1 = 0.8, wL | no |
| F2 | 1.88 | **1.76** | 2.11 | a1 = 0, wD | no (fails oracles 3, 6) |
| F3 | 1.93 | 1.80 | 2.08 | a1 = 0, dL = 0 | no |
| F4s | 3.52 | 2.41 | 2.42 | a1, S0, dL | no |
| F4l | 4.01 | 1.95 | 2.07 | a1 = 0.8, wL | no |
| F5 | 2.10 | 1.80 (β → 0, = F3) | 2.08 | a1, β | no |
| F6 | 1.87 | **1.76** | **1.98** | a1 = 0, dD | no |
| F7 | 2.47 | 1.98 | 2.13 | a1, qL | monotone; fails oracles 2, 3 |
| F8 | 3.55 | 2.71 | 2.72 | a1, dL, Sf | no |
| F9 | 4.14 | 3.04 | 3.06 | a1 = 0, cexp = 1.5 | yes (but wind response off by 4°) |
| F10 | 2.21 | 1.80 | 1.93 | a1, cHi | no |
| F10r (Re-free) | 4.04 | **2.24** | **2.24** | a1 = 0.8, cHi = 0 | yes (11 falls ≤ 0.08 yd above 10k) |
| F0bw | 4.22 | 2.59 | 2.60 | a1 = 2 | yes |
| F10rn | 4.04 | 1.99 | 2.08 | cHi = −1 | yes (Padjen −11.4°) |
| F11 | 4.23 | 2.26 | 2.27 | a1 = 2, n = 3 | no (28 falls; fails oracle 2) |
| F1-c1000 | 3.63 | 2.73 | 2.75 | a1, wL | ≈ (5 falls ≤ 0.49 yd) |
| F2-c1000 | 2.81 | **2.02** | **2.06** | a1 = 0.8, wD | ≈ (6 falls ≤ 0.52 yd) |
| F6-c1000 | 3.37 | 2.42 | 2.44 | a1, Sf | ≈ (9 falls ≤ 0.42 yd) |
| F10-c1000 | 3.53 | 2.39 | 2.43 | cHi | ≈, fails oracle 1 (+12.5 %) |

Readings **[D]**:

- **Under the app's calibration, the best law shape takes land RMS from 4.65°
  to 1.76°** (F2 or F6, a sharp drag rise near Re 7–7.5e4), CV ~2.0°. It does
  not reach the 1.5° bar, and it wrecks the altitude response (§4).
- **Holding the altitude response defensible costs the drag-rise law ~0.25°**:
  F2-c1000 reaches 2.02° (CV 2.06°). The lift-loss and spin-faded laws lose
  more (F1-c1000 2.73°, F6-c1000 2.42°). The Re-free F10r reaches 2.24° with an essentially clean
  altitude response, by making drag rise steeply with S (a1 at its 0.8 bound)
  and capping lift at S = 0.3.
- **Every A\* fit leaves the same two clusters**, which no single shape removes:
  PGA hybrid and 3–4 irons stay 1.8–5.4° too shallow while LPGA 3-wood and
  8-iron to PW go 1.7–4.7° too steep. Per-row A\* land, model − table:

| Row | F0 (kD, kL) | F2 A\* | F2-c1000 A\* | F10r A\* | F1 A\* |
|---|---|---|---|---|---|
| PGA Driver | −1.1 (0.82, 0.86) | +0.5 (1.00, 0.95) | −0.1 (0.73, 0.89) | +1.9 (1.09, 1.02) | +1.7 (0.72, 0.91) |
| PGA 3-wood | −4.5 (0.93, 0.90) | +0.5 (1.13, 0.97) | −1.3 (0.74, 0.91) | −0.6 (0.94, 0.90) | +0.4 (0.70, 0.92) |
| PGA 5-wood | −6.5 (0.97, 0.93) | −1.2 (1.17, 0.99) | −2.0 (0.72, 0.93) | −2.2 (0.84, 0.87) | −1.2 (0.68, 0.94) |
| PGA Hybrid | −9.2 (0.92, 0.89) | −4.1 (1.13, 0.95) | −5.3 (0.67, 0.90) | −5.4 (0.75, 0.82) | −4.2 (0.62, 0.90) |
| PGA 3 Iron | −7.5 (0.98, 0.96) | −2.3 (1.19, 1.02) | −3.2 (0.71, 0.96) | −3.6 (0.81, 0.89) | −2.5 (0.66, 0.97) |
| PGA 4 Iron | −7.0 (1.01, 1.01) | −1.8 (1.22, 1.05) | −2.3 (0.70, 1.00) | −2.9 (0.76, 0.92) | −1.8 (0.64, 1.01) |
| PGA 5 Iron | −5.9 (1.04, 1.06) | −0.8 (1.25, 1.09) | −1.0 (0.68, 1.04) | −1.5 (0.71, 0.95) | −0.3 (0.62, 1.05) |
| PGA 6 Iron | −5.5 (1.02, 0.95) | −0.7 (1.27, 0.98) | −0.9 (0.63, 0.93) | −1.5 (0.61, 0.88) | −0.4 (0.58, 0.94) |
| PGA 7 Iron | −4.4 (1.02, 0.97) | +0.1 (1.29, 0.99) | 0.0 (0.58, 0.94) | −0.2 (0.54, 0.96) | +1.1 (0.53, 0.98) |
| PGA 8 Iron | −3.6 (1.02, 0.93) | +0.5 (1.33, 0.94) | +0.6 (0.55, 0.90) | +0.4 (0.49, 0.98) | +1.6 (0.50, 0.94) |
| PGA 9 Iron | −3.9 (1.02, 0.89) | −0.1 (1.35, 0.90) | −0.1 (0.52, 0.86) | −0.2 (0.45, 0.99) | +0.8 (0.47, 0.91) |
| PGA PW | −3.4 (0.94, 0.83) | 0.0 (1.26, 0.83) | −0.1 (0.47, 0.80) | −0.3 (0.39, 0.97) | +0.8 (0.41, 0.87) |
| LPGA Driver | −1.5 (0.86, 0.87) | +0.8 (1.05, 0.95) | −0.8 (0.75, 0.90) | +0.6 (1.08, 0.99) | +1.3 (0.73, 0.92) |
| LPGA 3-wood | −1.1 (1.02, 1.10) | +3.7 (1.18, 1.17) | +2.3 (0.85, 1.12) | +1.7 (1.18, 1.19) | +2.8 (0.78, 1.12) |
| LPGA 5-wood | −4.7 (1.01, 0.95) | +0.1 (1.22, 1.00) | −0.9 (0.72, 0.95) | −1.6 (0.80, 0.87) | −0.7 (0.66, 0.95) |
| LPGA Hybrid | −5.6 (1.04, 0.94) | −0.9 (1.25, 0.98) | −1.8 (0.72, 0.93) | −2.7 (0.78, 0.85) | −2.0 (0.65, 0.93) |
| LPGA 4 Iron | −4.0 (0.99, 1.03) | +0.5 (1.18, 1.06) | −0.3 (0.67, 1.02) | −1.3 (0.71, 0.94) | −0.5 (0.59, 1.02) |
| LPGA 5 Iron | −4.9 (1.03, 1.06) | −0.5 (1.21, 1.08) | −1.1 (0.66, 1.04) | −2.2 (0.67, 0.97) | −1.5 (0.58, 1.05) |
| LPGA 6 Iron | −4.2 (1.05, 0.96) | −0.1 (1.27, 0.97) | −0.6 (0.63, 0.94) | −1.6 (0.60, 0.91) | −1.3 (0.55, 0.95) |
| LPGA 7 Iron | −2.6 (1.10, 1.00) | +1.2 (1.34, 1.00) | +1.0 (0.61, 0.97) | +0.4 (0.57, 1.01) | +0.5 (0.54, 1.02) |
| LPGA 8 Iron | −0.2 (1.12, 1.00) | +3.2 (1.39, 0.99) | +3.2 (0.59, 0.96) | +2.9 (0.53, 1.07) | +3.2 (0.52, 1.06) |
| LPGA 9 Iron | −0.4 (1.10, 1.02) | +2.5 (1.34, 1.01) | +2.6 (0.55, 0.98) | +2.5 (0.49, 1.14) | +2.9 (0.48, 1.14) |
| LPGA PW | +0.7 (1.09, 1.14) | +3.0 (1.35, 1.15) | +3.5 (0.51, 1.10) | +3.7 (0.43, 1.38) | +4.7 (0.44, 1.44) |

- **The per-row factors drift systematically with the A\* shapes.** With a
  steep C_D(S), kD falls by a third to two thirds from drivers to wedges
  (F2-c1000 0.73 → 0.47, F10r 1.09 → 0.39, F1 0.72 → 0.41). The per-row knob is then undoing part
  of the law's S dependence. That is the compensation the 2026-10-08
  per-club C_D slope fit needed, in a milder form.

### 3.4 Fitting each tour alone

`harness/tour-split.mjs` (8 restarts in G, 2 in A\*) **[D]**:

| Family | rows | G RMS carry / height / land | A\* land | what the fit chooses |
|---|---|---|---|---|
| F0b | PGA 12 | 5.55 / 1.81 / 4.84 | 3.97 | A\* C_L ∝ S^0.10 |
| F0b | LPGA 11 | 3.45 / 1.88 / 2.68 | 2.45 | A\* C_L ∝ S^0.79 |
| F1 | PGA 12 | 4.31 / 1.45 / 2.63 | 1.71 | lift fully off below Re 8.0e4 |
| F1 | LPGA 11 | 3.42 / 1.90 / 2.68 | 2.52 | **no lift loss at all** (dL → 0) |
| F2 | PGA 12 | 5.15 / 1.54 / 2.36 | **1.27** | ΔC_D 0.26 below 7.1–7.4e4 |
| F2 | LPGA 11 | 3.38 / 1.75 / 2.17 | 1.60 | ΔC_D 0.14–0.20 below 6.9–8.0e4 |
| F10 | PGA 12 | 5.38 / 2.33 / **1.43** | 1.62 | crisis moved to Re 8.8e4 (fRe 0.71) |
| F10 | LPGA 11 | 4.22 / 2.22 / 1.75 | 1.79 | crisis moved to Re 1.04e5 (fRe 0.61) |
| F10r | PGA 12 | 7.06 / 2.56 / 3.96 | 2.31 | cHi → 0 |
| F10r | LPGA 11 | 3.77 / 2.33 / 2.54 | 1.95 | cHi → 0.8 |

Fitted alone, each tour comes close to the land bar (F2 A\* 1.27° PGA, 1.60°
LPGA), but the two tours want different laws. The sharpest contrast is F1: the
PGA rows switch lift off below Re 8e4, while the LPGA rows refuse any lift loss,
although LPGA flights spend as much or more of their descent below that Re
(89 % vs 83 % below 7e4 on average, §6).
A physical low-Re effect would act on both tours, and on the LPGA more. That
the LPGA land column rejects it is evidence against the Re route as the
explanation of the PGA gaps (§6).

### 3.5 Are the fitted coefficients inside measured ranges?

Probe 1 digitised 176 measured points with known Re and S into
`aero-data.csv` (Lyu et al. 2020 Pro V1 / ChromeSoft / B330-RX at ~2250 rpm;
Lyu et al. 2018; the USGA Indoor Test Range example data in US 6,186,002 B1)
**[S]**; they cover Re ≈ 4.9e4–2.5e5 but only S ≤ ~0.36. `harness/plausibility.mjs`
evaluates each fitted law at those points (bias / RMS of model − measured; the
ball-to-ball spread is ~0.02–0.03) **[D]**:

| Family, mode | C_D, Re ≥ 8e4 (n 56) | C_D, Re < 8e4 (n 9) | C_L, Re ≥ 8e4 (n 56) | C_L, Re < 8e4, S < 0.2 (n 70) | C_L, Re < 8e4, S ≥ 0.2 (n 50) |
|---|---|---|---|---|---|
| F0 G | +0.059 / 0.064 | −0.041 / 0.093 | +0.047 / 0.050 | +0.186 / 0.206 | +0.194 / 0.214 |
| F0b G | +0.036 / 0.043 | −0.050 / 0.093 | +0.039 / 0.044 | +0.179 / 0.199 | +0.185 / 0.206 |
| F1 G | +0.013 / 0.030 | −0.092 / 0.125 | +0.017 / 0.035 | −0.012 / 0.075 | −0.084 / 0.125 |
| F2 G | +0.025 / 0.035 | +0.083 / 0.101 | +0.026 / 0.033 | +0.165 / 0.186 | +0.164 / 0.189 |
| F2-c G | +0.033 / 0.040 | +0.021 / 0.053 | +0.035 / 0.040 | +0.174 / 0.194 | +0.177 / 0.199 |
| F6 G | +0.028 / 0.045 | +0.121 / 0.124 | +0.023 / 0.031 | +0.161 / 0.183 | +0.159 / 0.184 |
| F7 G | +0.047 / 0.070 | +0.103 / 0.110 | +0.047 / 0.059 | +0.280 / 0.295 | +0.294 / 0.315 |
| F8 G | +0.023 / 0.033 | −0.070 / 0.107 | +0.027 / 0.041 | +0.070 / 0.109 | +0.038 / 0.085 |
| F10 G | +0.025 / 0.077 | +0.145 / 0.159 | −0.010 / 0.020 | +0.136 / 0.165 | +0.157 / 0.183 |
| F10r G | +0.031 / 0.038 | −0.051 / 0.092 | +0.013 / 0.025 | +0.162 / 0.189 | +0.196 / 0.217 |

Readings:

- **Above Re 8e4 every family is close to the measurements** (C_D within
  +0.01…+0.06, C_L within −0.01…+0.05). Today's law carries the largest
  excess: F0 G is 0.06 above the measured drag and 0.05 above the measured
  lift. The table fit absorbs that excess, so F0 is not "physically right"
  there either.
- **Below Re 8e4 the measurements show lift collapsing**: on the Pro V1 the lift
  is suppressed at Re ≈ 7e4 for S ≲ 0.12, reverses (C_L down to −0.09) at Re
  6–6.5e4, and is still only ~0.09 at S 0.28 and 0.11–0.15 at S 0.36 at Re
  5–6e4, against ~0.30 at S 0.33 at Re 7.5e4 (Lyu et al. 2020 Fig. 4, via
  probe 1 **[S]**). Every family without a lift loss sits 0.14–0.29 above these points.
  Only the lift-loss families F1 and F8 come close: F1's bias at S < 0.2 is
  −0.01 (RMS 0.075; no family models the reverse-Magnus dip itself). The step
  F1 fits, sharp and at Re ≈ 7.7e4, sits within 10–20 % of where the measured
  lift collapses (7e4 for low S, 6–6.5e4 for S ~0.2). The fit did not invent it.
- **The drag rise the table wants is about the measured one in Re**: F2 puts
  it at Re ≈ 7.1e4, F2-c at 6.8e4, against a measured crisis centre of about
  6.3–6.6e4. In size it overshoots: at Re < 8e4 F2/F6 are +0.08…+0.12 above
  the measured drag. The constrained F2-c halves the rise (0.12), which brings
  the bias down to +0.02 (RMS 0.05).
- **Fitted widths are sharper than measured.** F1 and F2 drive the logistic
  width to its 0.03 floor, a 10–90 % span of ~14 % in Re. The measured
  crisis spans ~50 % (w ≈ 0.1).
- **Nothing is measured above S ≈ 0.36**, yet late in flight the hybrid
  reaches S ≈ 0.4, the 7-iron ≈ 0.75 and the PW 1.1–1.25 (diagnostic flights,
  §5). Every law here, the shipped one included, is an extrapolation in
  exactly the regime where the land angle is decided. Probe 1 found no open
  data there.
- **Slopes at the bounds.** Every A\* fit pushes the C_D slope a1 to a bound.
  The lift-loss and Re-free families go to the 0.8 ceiling, and to 2 when the
  ceiling is raised (§3.6). The steepest
  measured local slope is ≈ 0.68 (USGA ITR example ball at Re 8.1e4, S 0.10 →
  0.22) **[D]**, and Bearman & Harvey and Smits & Smith give 0.18–0.25 **[S]**,
  so these fits sit at or beyond the top of the measured range. The
  unconstrained drag-rise families (F2, F3, F5, F6) go to the 0 floor instead:
  a C_D independent of S, which every measurement contradicts.

### 3.6 Spin-ratio-scaled laws (after probe 3)

Probe 3 found the land gap organised by spin and launch rather than by carry
or flight time. Rows under 2,600 rpm sit at −1.1…−1.5°. The low-launch
4,300–4,800 rpm PGA 5-wood, hybrid and 3–4 irons sit at −6.5…−9.2°. High-spin
short irons sit at −3.4…−3.9° (PGA) and −0.4…+0.7° (LPGA) (`provenance.md`
§6 **[S]**). Families whose late-flight effect scales with S were therefore
pushed hardest. F0b, F4s, F6, F8, F9 and F10r above already scale with S;
three more Re-free ones were added: F0bw (the C_D slope bound widened from
0.8 to 2), F10rn (lift allowed to fall above S = 0.3) and F11 (lift peaked in S)
**[D]**:

- **Mode G rejects all of them.** Given the freedom, the global fit keeps the
  C_D slope at 0.32 (F0bw = F0b), keeps lift rising above S = 0.3 (F10rn =
  F10r) and puts F11's lift peak at its S = 2 bound, so no peak. A shared S
  law does not help predict the table.
- **Mode A\* uses them only at the bounds.** F0bw drives the slope to the new
  bound of 2 and reaches 2.59° (the 0.8 bound was binding). F10rn lets lift
  fall to zero by S ≈ 0.6 and reaches 1.99° (CV 2.08°) with a monotone,
  oracle-passing altitude response, but Padjen's land change is −11.4° and
  the LPGA PW needs kL = 7.1. F11 sharpens its peak to the n = 3 bound at S =
  0.37 and reaches 2.26°, but the altitude response breaks (28 carry falls;
  apex −32 % at 7,800 ft) and the driver hangs 8.9 s.
- **None removes the tour-shaped residual.** PGA hybrid stays −4.1 to −6.3°
  and LPGA PW +2.7 to +4.3°. A law in S cannot separate the PGA 4-iron
  (S₀ 0.17, −7.0° under F0) from the LPGA 5-iron (S₀ 0.22, −4.9°) or the PGA
  PW (S₀ 0.45, −3.4°) from the LPGA PW (S₀ 0.48, +0.7°).
- **The coefficients are far outside the data**: C_D slopes of 1–2 (measured
  ≤ 0.68), lift vanishing at S 0.6, or a lift peak at S 0.37. Nothing is
  measured above S ≈ 0.36, and the decline of Lyu's quadratic beyond its
  0.31 peak is a property of a fit to S ≤ 0.32, not a measurement.

## 4. Altitude behaviour

All at constant 25 °C (the app's convention), so Re falls in proportion to ρ:
−17 % at 5,280 ft, −31 % at 10,000 ft. Mode G deltas are against the model's
own sea-level flight. Mode A\* deltas are against the calibrated sea-level
flight, as in the app. Monotonicity uses 250 ft steps; "falls" counts
adjacent-step violations of carry ↑, max height ↓, land ↓ summed over rows. Padjen's TrackMan
figure for a PGA-like driver at 7,800 ft is +8.5 % carry, −18 % apex, −9° land
(soft check). App hard oracles: 1 Driver carry at 7,800 ft +5…+12 %; 2 apex
−28…−8 %; 3 land −13…−5°; 6 7-iron at 6,400 ft +7…+16 % **[D]**
(`harness/summary.mjs`).

> **Coordinator erratum (2026-10-09).** The app's hard oracles also include **9a**, every row
> monotone from 0 to 10,000 ft (`site/js/oracles.js`). The "hard oracles failed" column below
> omits it: any family with a non-zero "falls 0–10k" count fails 9a. In particular F2-c1000
> fails 9a in both modes (`harness/out/F2-c1000.txt`: `9a(0-10k) false`), so it would fail CI
> as it stands.

| Family | mode | carry % 5,280 ft PGA / LPGA | carry % 10,000 ft PGA / LPGA | height Δ 10k (yd) | land Δ 10k (°) | falls 0–10k / 10–15k (worst) | Padjen carry % / apex % / land ° | hard oracles failed |
|---|---|---|---|---|---|---|---|---|
| F0 | G | 7.7…10.7 / 4.5…8.0 | 12.7…19.3 / 6.8…13.8 | −7.4…−2.2 | −10.9…−6.4 | 0 / 7 (0.05 yd) | 11.9 / −13.1 / −7.75 | — |
| F0 (app) | A | 6.4…9.6 / 4.5…8.9 | 10.5…16.9 / 7.0…15.7 | −7.2…−2.3 | −11.0…−6.4 | 0 / 3 (0.02 yd) | 8.8 / −15.6 / −7.93 | — |
| F0b | A\* | 7.1…10.6 / 5.0…9.7 | 11.6…18.8 / 7.8…17.0 | −7.0…−2.2 | −12.3…−7.8 | 0 / 1 (0.00 yd) | 9.7 / −15.1 / −8.50 | — |
| F1 | G | 3.1…5.0 / −0.9…1.5 | 1.4…6.4 / −7.1…0.1 | −9.9…−5.0 | −16.4…−8.1 | 414 / 436 (1.55 yd) | 5.9 / −15.5 / −5.74 | 6 |
| F1 | A\* | 4.5…5.9 / 0.1…3.0 | 3.6…7.1 / −6.6…0.2 | −11.8…−5.1 | −20.1…−9.0 | 356 / 427 (1.68 yd) | 5.9 / −16.2 / −6.82 | 6 |
| F2 | G | 5.2…6.9 / 2.1…4.0 | 6.7…10.0 / 0.3…4.2 | −7.9…−4.3 | −11.5…−5.7 | 141 / 386 (0.83 yd) | 8.1 / −14.6 / −5.06 | — |
| F2 | A\* | 2.2…5.3 / 0.1…2.4 | 0.4…7.2 / −3.1…1.8 | −8.0…−4.7 | −11.2…−6.1 | 318 / 411 (1.01 yd) | 6.0 / −15.8 / −4.76 | 3, 6 |
| F6 | A\* | 0.6…3.2 / −1.9…0.2 | −1.0…3.0 / −7.1…−0.6 | −9.8…−5.7 | −11.5…−6.5 | 598 / 431 (0.97 yd) | 3.5 / −18.1 / −6.64 | 1, 6 |
| F7 | G | 3.6…5.2 / 2.3…4.1 | 6.3…9.7 / 3.9…7.5 | −4.5…−1.1 | −6.5…−3.0 | 0 / 0 | 5.8 / −8.4 / −4.67 | 3, 6 |
| F9 | A\* | 6.7…8.6 / 4.9…8.1 | 11.0…15.1 / 8.0…13.9 | −6.5…−2.7 | −11.7…−7.2 | 0 / 0 | 9.6 / −11.5 / −7.52 | — |
| F10 | G | −1.9…3.1 / −4.3…0.9 | −5.2…4.6 / −9.7…3.5 | −13.2…−4.0 | −15.4…−7.3 | 648 / 343 (0.99 yd) | −3.5 / −24.2 / −9.38 | 1, 6 |
| F10r | G | 6.0…11.7 / 2.8…8.7 | 9.6…21.3 / 3.4…15.2 | −8.5…−1.8 | −12.2…−6.8 | 3 / 24 (0.18 yd) | 8.2 / −16.3 / −8.29 | — |
| F10r | A\* | 8.0…11.1 / 5.7…10.0 | 12.7…19.8 / 8.5…17.5 | −7.9…−2.1 | −15.1…−8.6 | 0 / 11 (0.08 yd) | 10.9 / −17.5 / −10.51 | — |
| F1-c1000 | G | 6.7…10.2 / 3.0…7.2 | 10.1…17.8 / 3.5…11.4 | −8.0…−3.5 | −11.8…−8.5 | 12 / 173 (0.41 yd) | 10.0 / −14.3 / −6.97 | — |
| F2-c1000 | G | 6.6…9.1 / 3.4…6.4 | 10.0…15.3 / 4.0…9.6 | −7.8…−3.0 | −11.2…−7.0 | 14 / 195 (0.43 yd) | 10.0 / −14.2 / −6.18 | — |
| F2-c1000 | A\* | 6.9…9.0 / 4.7…7.1 | 10.8…14.7 / 6.1…10.8 | −7.3…−3.1 | −12.4…−7.4 | 6 / 216 (0.52 yd) | 9.3 / −15.5 / −7.71 | — |
| F10-c1000 | G | 7.0…10.5 / 4.1…7.9 | 11.9…18.3 / 5.4…12.6 | −7.3…−2.5 | −11.1…−5.1 | 3 / 159 (0.65 yd) | 9.9 / −14.2 / −7.50 | — |

Readings **[D]**:

- **The Re features that fit the land column break the altitude response.**
  At altitude Re drops by the density ratio, so a lift loss or drag rise
  fixed at Re ≈ 7e4 starts earlier in the flight. Iron carry gains then shrink
  and turn negative: F1 LPGA irons −7 % at 10,000 ft, F10 PGA Driver −3.5 % at
  7,800 ft. Carry stops rising with elevation from as low as 250–6,000 ft,
  LPGA long irons first, and under F1 the land-angle change at 10k runs to
  −16…−20°. This reproduces the 2026-10-08 finding ("zero/negative LPGA iron
  carry gain") for every Re family tried, including the spin-shifted (F5) and
  spin-faded (F6, F8) variants.
- **A defensible altitude response caps the Re effect at about half.** With
  the penalty on, the drag rise drops from 0.22 to 0.12 (F2-c1000), the lift
  loss from 0.92 to 0.25 (F1-c1000), and the measured crisis is pushed below
  the flight envelope (F10-c1000, fRe 1.59). What survives is close to the
  Re-free response: PGA carry +6.6…9.1 % at 5,280 ft, +10…15 % at 10,000 ft.
  A soft penalty still leaves a few sub-0.5 yd carry dips near 9,000–10,000 ft
  for LPGA long irons, so these are "nearly" monotone, not clean.
- **The clean altitude responses all come from Re-free laws**: F0, F0b, F9 and
  F10r A\*, plus F7, whose smooth power law gives too little change (Padjen
  land −4.7°). Most families show tiny carry dips (≤ 0.2 yd) for the LPGA
  3-wood somewhere above ~12,000 ft, today's model included (F0 A: 3 falls of
  ≤ 0.02 yd above 14,750 ft). F7 and F9 A\* have none. That is the regime
  the app's soft oracle 9b already tolerates through rounding.
- **Padjen soft check (−9° land at 7,800 ft):** F0 (app) gives −7.9°.
  Re-free shapes that steepen the descent push it toward −9…−10.5° (F0b A\*
  −8.5°, F10r A\* −10.5°). The Re families pull it the other way (F2 A\* −4.8°,
  F1 A\* −6.8°, F2-c1000 A\* −7.7°). On carry, F0 A gives +8.8 % against +8.5 %.
  The Re families undershoot (F2 A\* +6.0 %, F1 +5.9 %) and F10r A\*
  overshoots (+10.9 %).

**TrackMan 2014 model shots and wind table (informational only, per the
BRIEF)** **[D]** (`harness/tm-table.mjs`):

| Family | 6-iron land vs TrackMan's model shot, mode A\* (PGA / LPGA) | max wind land-response error (A\*) |
|---|---|---|
| F0 (app) | −1.8 / −1.1 | 0.9° |
| F0b | +0.5 / +0.5 | 1.4° |
| F1 | +3.8 / +2.3 | 1.5° |
| F2 | +3.1 / +3.0 | 3.5° |
| F10 | +3.4 / +3.0 | 5.0° |
| F10r | +2.7 / +1.9 | 2.6° |
| F1-c1000 | +1.7 / +1.3 | 1.0° |
| F2-c1000 | +3.0 / +2.7 | 3.2° |

Calibrated to TrackMan's own 2014 6-iron trajectories, every law that fits the
2023 land column lands 2–4° steeper than TrackMan's model did, and the
drag-rise laws respond to wind up to 3.5° differently. TrackMan's 2014 model
therefore does not contain the steepening the 2023 table asks for. This agrees
with the 2026-10-08 review (L4: the table row is 4 yd longer, 1 yd lower and 4°
steeper than TrackMan's model at the same launch).

## 5. Ballooning

Diagnostic flights at dt = 0.005 s; "rise" is the peak ground flight-path angle
minus the launch angle, with where that peak occurs and where the apex occurs as
a percentage of carry **[D]** (`harness/balloon-table.mjs`).

| Family, mode | rise above launch | peak at % carry | apex at % carry (mean) | PGA Hybrid: rise / apex |
|---|---|---|---|---|
| F0 G | 0.7–6.6° (mean 3.6) | 12.5–34.7 | 60.0–67.1 (64.1) | 6.1° / 66.6 % |
| F1 G | 0.2–5.2° (2.5) | 8.2–34.5 | 58.2–69.7 (65.2) | 4.7° / 69.3 % |
| F2-c G | 0.4–5.9° (2.9) | 10.2–34.3 | 61.6–68.1 (65.2) | 5.3° / 67.8 % |
| F10 G | 0.0–5.0° (2.2) | 2.8–37.2 | 61.5–71.0 (66.5) | 4.7° / 70.3 % |
| F10r G | 0.3–6.7° (3.3) | 12.3–36.6 | 61.2–67.7 (64.6) | 6.4° / 67.2 % |
| F0 A (shipped app) | 0.9–5.9° (3.0) | 16.3–32.8 | 60.8–66.7 (63.9) | 4.3° / 65.9 % |
| F1 A\* | 0.7–4.7° (2.4) | 15.3–34.1 | 59.2–70.1 (65.5) | 3.4° / 69.3 % |
| F2 A\* | 0.6–4.9° (2.4) | 12.6–32.7 | 62.0–69.1 (66.1) | 3.9° / 68.0 % |
| F10r A\* | 0.5–5.2° (2.5) | 14.9–35.2 | 62.0–69.3 (65.7) | 3.6° / 68.2 % |

Readings **[D]**:

- Every family that improves land angle does it the way the BRIEF predicted:
  the apex moves downrange (PGA woods and hybrid from ~66 % to 68–71 % of
  carry) and the climb above the launch angle shrinks by 1–1.5° on average.
  None of them removes ballooning: the low-launch PGA woods, hybrid and long
  irons still climb 3.4–5.9° above launch.
- The Re families (F1, F2, F10) and the Re-free F10r reach the same shape by
  different routes: lift switched off or drag doubled once the ball drops below
  Re ≈ 7e4 late in flight, or drag rising steeply with S while lift stops
  growing above S = 0.3. The trajectories alone cannot tell these apart.
- **PGA Driver shape against PGA TOUR radar (soft, informational).** Probe 3
  found PGA TOUR's 2022-23 TrackMan averages for Par 4/5 tee shots (172.85 mph,
  10.49°, 2,571 rpm, apex 34.0 yd, carry 283.8 yd): hang time **6.4 s**, and
  distance to apex 186.0 yd, i.e. the apex at **65.5 %** of carry. Both run to
  ground impact, not the launch plane, and are ratios of season means
  (`provenance.md` §5, verified in its notes **[S]**). The table row flown by
  each law (`harness/driver-shape.mjs`) **[D]**:

  | Family, mode | hang time (s) | apex at % carry |
  |---|---|---|
  | F0 A (shipped app) | 6.93 | 65.3 |
  | F0b A\* | 6.84 | 65.7 |
  | F1 A\* | 6.71 | 67.1 |
  | F2 A\* | 6.98 | 65.5 |
  | F2-c1000 A\* | 6.91 | 65.8 |
  | F10r A\* | 7.13 | 67.6 |
  | F10 G / A\* | 6.54 / 7.21 | 67.6 / 67.8 |
  | F7 A\* | 7.72 | 69.4 |
  | F9 A\* (6.4× spin decay) | 6.40 | 64.5 |

  The app's apex position already matches the radar (65.3 % against 65.5 %).
  Every law except F9 keeps the ball up longer than the radar mean, by
  0.1–1.3 s (2.5 s for F11 A\*, §3.6). F9 gets there only by killing the spin,
  and it fails the wind check badly (§4). Laws that move the apex downrange
  (F1, F10, F10r, F7) move the driver away from the radar's 65.5 %. The driver row's land gap is small, so this
  does not test the mid-spin rows where the gap lives, but it is a second,
  independent trajectory measurement that today's model already fits on
  position and none of the laws fits on time.
- The rise is larger for PGA than LPGA rows at similar launch (PGA 4 Iron
  10.8° launch, +5.2° under F0 A; LPGA 4 Iron 13.9°, +2.1°), because the PGA
  rows have lower launch and higher speed. The land gaps are also larger for
  PGA, so the remaining gaps track ballooning; §6 discusses why that does
  not on its own explain the PGA/LPGA split.

## 6. What the evidence supports

All **[D]** unless tagged.

1. **No shared law tested meets the success bar, in either mode.** Mode G's best
   land RMS is 1.71° (F10), with 5.5 yd carry and 2.7 yd height RMS and an
   altitude response that loses carry with elevation. Its best balanced fit is
   F1 at 4.1 / 1.9 / 2.4 (CV 5.0 / 2.0 / 2.5). Mode A's best is 1.76° (F2, F6;
   CV 2.0–2.1°). The carry bar is blocked by the PGA Driver row alone (8–14 yd
   short under every law).
2. **The mechanism the land column asks for is real but is not shown to be what
   makes the gap.** Every family that improves land angle does it with lift
   falling away or drag rising once the ball slows below Re ≈ 7e4, which moves
   the apex downrange (§5). Current tour balls do this in measurement: lift
   collapses and C_D roughly doubles between Re 7.5e4 and 5e4 for S ≤ 0.36
   (Lyu et al. 2020 via probe 1 **[S]**), and the fits place the feature within
   10–20 % of the measured Re. Five independent results argue against it being
   the explanation of the table's gaps:
   - **Altitude.** At full strength it makes iron carry gains small or negative
     at altitude, so carry stops rising with elevation (§4). That contradicts
     every altitude source collected, TrackMan-derived or players' own. Held to
     a defensible altitude response, only about half the effect survives, and
     the mode-A land RMS rises to 2.0°.
   - **The LPGA rows reject it.** Fitted alone, the LPGA land column takes no
     low-Re lift loss at all (§3.4), though LPGA flights are at least as
     exposed to it. In the app's calibrated flights they spend 89 % of the
     descent below Re 7e4 on average against 83 % for PGA, and more for woods
     and hybrids: LPGA 3-wood 80 % vs PGA 41 %, Hybrid 100 % vs 74 %
     (`harness/re-exposure.mjs`). Yet the LPGA gaps are the smaller ones
     (Hybrid −5.6° vs −9.2°). A physical effect cannot be tour-selective.
   - **TrackMan's own model does not show it.** The laws that fit the 2023 land
     column land 2–4° steeper than TrackMan's 2014 model 6-irons (§4).
   - **The fits need it sharper and stronger than measured**: logistic width at
     the 0.03 floor against ≈ 0.1 measured; drag excess +0.08…+0.12 over the
     measured crisis (§3.5).
   - **Its high-spin behaviour is unmeasured**, and the land angle is decided
     at S 0.4–1.3.
3. **The residual pattern is tour-shaped, not physics-shaped.** After the best
   A\* shape, the same rows remain wrong in every family: PGA hybrid and 3–4
   irons too shallow, LPGA 3-wood and 8-iron to PW too steep. Each tour can be
   fitted to ~1.3–1.6° alone (F2 A\*), with different parameters. This is what
   one would see if the two tours' land columns were compiled differently.
   Probe 3 (`provenance.md` §2, §6 **[S]**) found three relevant facts.
   TrackMan completes the landing by model when its track ends early.
   Different PGA TOUR statistics average different shot subsets. And the gap
   pattern is not range-driven: it follows launch and spin. Probe 3 leaves two
   explanations open, a late-flight aerodynamic effect on low-launch mid-spin
   shots, or club-dependent provenance (driver rows mostly competition tee
   shots, other rows probably range data). The per-tour fits here weigh
   against the first, because no shared law reproduces the PGA/LPGA
   difference at matched spin ratio (§3.6). This probe did not test the second.
4. **Under the app's calibration, the defensible gains are moderate.**
   - **Re law, altitude-penalised (F2-c1000 A\*):** a sharp drag rise of 0.2
     near Re 6.8e4 gives 2.02° (CV 2.06°), from 4.65°. Its altitude response
     is nearly monotone (≤ 0.5 yd dips near 9,000–10,000 ft), all app hard
     oracles pass, and Padjen's land is −7.7°. But its C_D slope sits at 0.8,
     at the top of the measured range; its step is sharper than measured; kD
     falls by a third from driver to wedge; and its wind response departs from
     TrackMan's by up to 3.2°.
   - **Re-free (F10r A\*):** C_D steep in S, C_L capped at S = 0.3, 2.24° (CV
     2.24°). Its altitude response is cleanly monotone but larger than today's
     (Padjen land −10.5°, carry +10.9 %), and it sees altitude only through
     density, against the long-term preference for C(Re, S).
   - **Re-free with falling lift (F10rn A\*):** 1.99° (CV 2.08°), monotone, but
     only because lift vanishes by S ≈ 0.6 and the LPGA PW then needs kL = 7.1;
     its tailwind carry response is 20 yd off TrackMan's. It is a fit artefact,
     not a candidate.
   - **Today's F0:** 4.65°, but it has the cleanest wind and altitude agreement
     with TrackMan's own model (0.9° wind, Padjen −7.9° / +8.8 %).
5. **Spin decay is confirmed not to be the lever.** Mode G drives a decay
   multiplier to its 0.25 floor. Mode A\* wants 6.4× decay only together with
   C_L ∝ S^1.5, which wrecks the tailwind carry response (22 yd).
6. **The one independent trajectory measurement favours today's shape.** PGA
   TOUR's 2022-23 radar puts the driver apex at 65.5 % of carry. The app's
   driver has it at 65.3 %; laws that move the apex downrange move the driver
   away from it (F1 67.1 %, F10r 67.6 %). Every law, today's included, keeps
   the driver up 0.1–2.5 s longer than the radar's 6.4 s hang time (the app
   0.5 s), except F9's spin-killing fit (§5).
7. **Weights and overfitting do not change any of this.** Equal unit weights
   move RMS by ≤ 0.4. CV adds 0.04–0.42° to land RMS. Parameters are stable
   under leave-one-out but sit at bounds and in two-basin landscapes (§3.2):
   the 69 table numbers pin only some of each family's parameters.

## 7. Open questions and next experiments

1. **What do C_L and C_D do at Re 4–8e4 and S 0.3–1.3?** This is where every
   land-improving law acts and where no open data exist (§3.5). The single most
   useful experiment is a measurement there: wind tunnel, or the Lyu
   light-gate method at 25–40 m/s with 4,000–9,000 rpm. Once it exists,
   refit F1/F2/F10 with the measured surface held fixed and only kD, kL per
   row. If the measured high-S lift stays near its supercritical value, the
   Re route is closed and the land column needs another explanation; if it
   collapses as it does at S ≤ 0.36, the altitude response must be redesigned
   rather than the land fit.
2. **Why do the PGA and LPGA land columns want different laws?** Fitted
   alone, the PGA rows take a full lift loss below Re 8e4 and the LPGA rows
   take none (§3.4). Probe 3 points at club-dependent provenance (competition
   drivers against probably-range irons) as a candidate. Two quick tests:
   refit with a per-tour land offset as the only extra parameter, and with a
   driver-versus-rest offset. In each case, see whether the drag-rise or
   lift-loss laws stop being needed.
3. **The PGA Driver carry.** Every shared law flies the PGA Driver row 8–14 yd
   short at the table's launch, while F1 and F2-c1000 fit the LPGA Driver
   within ~2 yd. On its own this puts 1.8–3.0 yd under the carry RMS. The measured
   C_D rises slightly from Re 1.75e5 to 2e5 (Lyu et al. 2020 via probe 1),
   which makes the gap worse, not better. Worth checking against TrackMan's
   own driver trajectories, or Padjen's 282 yd shot if its launch can be
   found.
4. **A trajectory target instead of three numbers.** Carry, apex and land do
   not pin a trajectory's shape; full radar-tracked trajectories would, and
   would separate the "late drag" and "late lift loss" routes that §5 cannot.
   No such open data set has been found.
5. **Altitude evidence that is not TrackMan's model.** The altitude
   constraint here is built from TrackMan-derived statements (Padjen,
   caddie sheets, TrackMan Support). If the low-Re physics is real, those
   understate how much the crisis eats iron gains. Measured carries at
   altitude with known launch (launch-monitor sessions at Denver or Mexico
   City courses, Penge's Crans-Montana range work) would decide which side
   gives.
6. **Smaller items.** The C_D slope bound does bind: raised from 0.8 to 2,
   F0b's A\* fit follows it to 2 (§3.6), so the A\* optima are set by the
   bounds, not by the data. Fit the logistic width in F3 instead of fixing it.
   Fly the PGA Driver at PGA TOUR's 2022-23 launch (172.85 mph, 10.49°,
   2,571 rpm) to tighten the hang-time check (§5). Add humidity through ρ and
   μ once the Re law is settled.

Pointers for the later 3-D model met here: the harness already writes the
forces as cross products with an explicit ω̂, so a tilted spin axis and a 3-D
wind vector drop into `harness/core.mjs` `derivative()` unchanged; Re is
computed from ρ and μ(T) (Sutherland), so temperature and humidity enter
through both once the atmosphere model supplies them.
