# tmelevation — TrackMan tour averages at elevation: design

Date: 2026-10-08. Status: revised after adversarial review, for user review.
Repository: `jhoblitt/tmelevation` (public), deployed to GitHub Pages.

Evidence lives in `docs/research/` (`trackman-2023-tour-averages.md`,
`atmosphere.md`, `aero-model.md`, `reference-data.md`, each with a
`.notes.md` log). The adversarial review of the first draft is in
`docs/reviews/spec-2026-10-08/` (six reviews and `SUMMARY.md`, which records
the disposition of every finding). This spec states decisions and the reasons
for them; those files hold the evidence.

## 1. Purpose and success criteria

A static web page that reproduces TrackMan's 2023 PGA and LPGA Tour Averages
tables (https://www.trackman.com/blog/introducing-updated-tour-averages) in
TrackMan's colour scheme and shows how the flight columns change with
elevation / air pressure, computed from cited ball-flight physics.

Success means:

1. At sea level every cell shows exactly the published value, in both units.
2. At altitude, Carry, Max Height and Land Angle change by amounts inside the
   band of every hard reference oracle (section 8.3).
3. The page is comfortable on a phone and on a desktop browser.
4. A reader can follow a link to a page stating every equation, constant,
   assumption, limitation and source the numbers come from.
5. CI checks the model on every pull request and must pass before merging;
   every merge to `main` runs semantic-release; every release tag on `main`
   deploys the site.

## 2. Scope

In scope: the two tables, elevation / pressure controls, deltas in absolute
or percent form, a methods page, CI, automatic versioning and deployment.

Out of scope (YAGNI): temperature, humidity and wind inputs; an
altimeter-setting (weather-report pressure) converter; total distance / roll;
side spin; user-entered launch conditions; persisting state in the URL or
storage; any framework, bundler or runtime dependency.

## 3. Source data

The tables are images, transcribed in `docs/research/trackman-2023-tour-averages.md`;
two reviewers independently re-checked all 207 cells against the images.
PGA has 12 rows (Driver … PW), LPGA 11 (no 3 Iron). Columns: club speed
(mph), attack angle (°), ball speed (mph), smash factor, launch angle (°),
spin rate (rpm), max height (yd/m), land angle (°), carry (yd/m).

The published metres are not always `round(yards × 0.9144)` (PGA 4 Iron is
209 yd / 192 m), so both units are stored as published and never derived from
each other.

TrackMan states no measurement conditions. Its post says the averages come
from competition and range data — 40+ events for the men, 30+ for the women —
with stat holes "picked going in opposite directions to reduce any effects
from wind". Treating the tables as calm, sea-level flight at 25 °C is this
project's stated assumption, and the methods page says so.

`data.js` carries a header stating that the figures are TrackMan's,
reproduced with attribution, and are not covered by the repository's licence.

## 4. User interface and interaction

### 4.1 Page structure

1. **Controls.**
   - Elevation slider; elevation text box with a `ft | m` dropdown; pressure
     text box with a `inHg | kPa | mbar (hPa)` dropdown; a delta-mode toggle
     (`Δ` absolute change in the cell's own units, or `Δ %`).
   - Defaults: ft and inHg.
   - The pressure box is labelled "Air pressure at the course (absolute)" and
     carries an inline hint that a weather app's "barometer" value is reduced
     to sea level (≈ 30 inHg everywhere) and is not what this box expects; the
     methods page explains further.
   - Desktop: the whole control bar is one row, sticky at the top.
   - Phones: only a compact row stays pinned — the slider, a one-line readout
     (`5,280 ft · 24.64 inHg`) and the Δ toggle (about 60 px). The text boxes
     and dropdowns sit above the tables and scroll away.
2. **PGA table**, then **LPGA table**, stacked, each with TrackMan's header
   treatment: "PGA TOUR AVERAGES" in white heavy condensed caps, "YARDS/METERS"
   in charcoal, "2023" right-aligned in a thin condensed face. On narrow
   screens the title wraps to two lines; the year stays right-aligned. When
   elevation is above 0 a caption under the title names the conditions
   (`at 5,280 ft · 24.64 inHg`).
3. **Footer**: first, a `Method & sources` link to the methods page; "Data:
   TrackMan 2023 Tour Averages" linking to the blog post; a statement that
   values above sea level are this site's model, not TrackMan's publication,
   and that the site is not affiliated with TrackMan; the deployed version;
   font credits; a GitHub-icon link to the GitHub repository.

### 4.2 Linked inputs

- The single source of truth is the absolute air pressure in pascals. The
  slider and both text boxes are views of it; none is ever the source of
  another, so linked updates cannot drift through rounding.
- Elevation ↔ pressure uses the standard atmosphere (section 5.1).
- Range: elevation 0 – 15,000 ft (0 – 4,572 m); pressure from 101.325 kPa down
  to the 15,000 ft value. The slider starts at 0 and works in the selected
  elevation unit (step 10 ft or 5 m), with an accessible value text such as
  "5,280 feet" and a touch target at least 44 px tall.
- Text boxes are `type="text"` with `inputmode="decimal"`,
  `autocomplete="off"` and a font size of at least 16 px (no iOS zoom).
- Parsing, the same rule in every box: `.` is the decimal point; `,` followed
  by exactly three digits is a thousands separator (`5,280` → 5280); any other
  single `,` is a decimal point (`84,3` → 84.3); surrounding spaces are
  ignored. An empty box or any other text is invalid — never zero.
- While typing, the state follows the box only when its text parses to a
  value inside the range; otherwise the state is left unchanged and the box is
  marked invalid (`aria-invalid`). So intermediate keystrokes (`8` on the way
  to `84.3` kPa, or an extra zero in `150000`) never reach the model.
- On commit (blur or Enter) an out-of-range value clamps to the range and the
  box is normalised; invalid text reverts to the current state. Leaving a box
  whose text was not edited does not re-parse it.
- The box being typed in is not reformatted while it has focus.
- Changing a unit dropdown re-expresses that box's value in the new unit and
  never changes the state.
- Display precision: ft and m integers; inHg and kPa 2 decimals; mbar 1
  decimal.
- When the page is restored from the browser's back/forward cache, every
  control is re-rendered from the state, so a box can never show a value the
  tables are not using.

### 4.3 Table cells

- Only **Max Height, Land Angle and Carry** are recomputed. The other six
  columns are launch conditions fixed at impact and stay as published.
- Every cell in a row has the same two-line structure — value, then a delta
  line — so values stay aligned across the row; in the six unchanged columns
  the delta line is always empty.
- The value is white; the delta line is smaller, bold, centred below it, in
  dark charcoal `#262425`: TrackMan's accent charcoal (`#3D3B3C`) darkened
  until it meets WCAG AA on both row colours (4.85:1 on the orange, 6.81:1 on
  the stripe; `#3D3B3C` itself is 3.49:1 on the orange).
- **Absolute mode** (`Δ`): delta = displayed value − published value, per
  unit, sign always shown: carry `172/157` over `+8/+7`; land angle `35°` over
  `−4°`. When the rounded change is zero the cell shows `±0`.
- **Percent mode** (`Δ %`): one number per cell = unrounded modelled change ÷
  published value (yards for the distance columns, degrees for land angle),
  one decimal, sign always shown: `+4.9%`, `−9.7%`. When the one-decimal value
  is 0.0 the cell shows `±0.0%`; `−0.0%` never appears. Because absolute
  deltas are differences of rounded values and percent deltas are not, the two
  modes can disagree near zero (`±0` beside `−1.3%`); the methods page says
  why.
- When the displayed elevation is 0 the delta lines are hidden but keep their
  space, so rows do not jump when the slider first moves.
- Displayed value = `round(published + Δ)` separately in yards and in metres,
  where Δ is the modelled change in that unit (section 5.4). This keeps quirks
  like `209/192` exact at sea level.
- Each delta has accessible text covering both units ("plus 8 yards, plus 7
  metres versus sea level"), provided by visually hidden text, not by
  `aria-label` on a generic element.
- A row whose model fails (section 5.6) shows its published values with `—` in
  the delta line.

### 4.4 Layout and style

- Desktop: the full ten-column table in TrackMan's column order.
- Phones: the same table in a horizontally scrolling region with the Club
  column pinned. Each table starts scrolled to its right edge, so Max Height,
  Land Angle and Carry — the columns that change — are visible beside the
  pinned Club column without swiping. The scroll region is keyboard-focusable
  and labelled. The pinned column has an opaque background matching its row
  and draws its own column rule, so scrolled cells never show through it.
  Column headers scroll with the table vertically (a sticky header inside a
  horizontal scroller is not attempted).
- Palette, exactly TrackMan's (sampled from the images): background `#EC6919`,
  odd-row stripe `#F3955F` spanning the full table width, title accent
  `#3D3B3C`; column rules are a translucent dark line (about 20 % black), which
  reproduces both the `#BA571C` seen on orange rows and the lighter rule seen
  on striped rows; no horizontal rules.
- Contrast, accepted for fidelity (user decision): TrackMan's white text is
  2.26:1 on the stripe and 3.18:1 on the orange, below WCAG AA. No text shadow
  or palette change is applied; the methods page and README note it. Elements
  this project adds (deltas, the methods link, focus rings, hints) meet AA.
- The footer's methods link uses dark charcoal text, not white, with a tap
  target of at least 44 px. The footer's repository link is GitHub's Octicons
  `mark-github` icon (MIT; its licence text and upstream URL ship in
  `site/icons/`), inlined as an SVG drawn in the same charcoal, hidden from
  assistive technology, with a visually hidden accessible name "Source code
  on GitHub", a matching tooltip and a 44 px tap target. Focus rings are a
  dark outline visible on both row colours.
- Fonts: Oswald (titles, column headers) and Lato 400 / 700 (values, deltas),
  self-hosted woff2 files taken unmodified from Google Fonts (no subsetting, so
  Lato's reserved font name is not an issue), `font-display: swap`. Each file's
  upstream URL and SHA-256 are recorded in `site/fonts/SOURCES.md` and checked
  by a test; both fonts' OFL texts ship beside them.

## 5. Physics

### 5.1 Atmosphere

- U.S. Standard Atmosphere 1976 troposphere (identical to ICAO ISA in this
  range). Geometric elevation Z is converted to geopotential H = r₀Z/(r₀+Z),
  r₀ = 6,356,766 m, then P = 101325 · (1 − 2.25577×10⁻⁵ · H)^5.255876 Pa. The
  inverse is H = (288.15/0.0065) · (1 − (P/101325)^0.190263),
  Z = r₀H/(r₀ − H).
- The air is dry and held at the reference temperature 25 °C / 77 °F (the
  default of TrackMan's Normalization feature) at every elevation; elevation
  changes only the pressure. Hence ρ/ρ₀ = P/P₀ exactly, with
  ρ₀ = P₀M/(R*T₀) = 1.1839 kg/m³ (M = 28.9644 kg/kmol, R* = 8314.32 J/(kmol·K),
  T₀ = 298.15 K). Humidity is neglected: holding 50 % RH instead changes the
  density ratio by 0.1–0.5 % and carry by at most 0.18 yd.
- Letting temperature follow the ISA lapse rate instead would make the air
  about 3.5 % denser at 5,000 ft and understate the effect for warm-season
  golf; the methods page states the choice.
- Pressure units in Pa: inHg 3386.389 (conventional, NIST SP 811); kPa 1000;
  mbar = hPa 100. Length: 1 ft = 0.3048 m, 1 yd = 0.9144 m; speed:
  1 mph = 0.44704 m/s.

### 5.2 Ball-flight model

A 2-D point-mass model with pure backspin. State (x, y, vₓ, v_y, ω);
u = v − w is the velocity relative to the air (w is a horizontal wind used
only by tests; 0 in the app), U = |u|, k = ρA/(2m), A = πD²/4:

    dvₓ/dt = −k U (C_D uₓ + C_L u_y)
    dv_y/dt = −k U (C_D u_y − C_L uₓ) − g
    dω/dt  = −λ₀ (ρ/ρ₀) U ω / r

- Spin parameter S = rω/U (ω in rad/s).
- C_D = k_D · (0.24 + 0.18 S), C_L = k_L · 0.54 · S^0.4: the Smits & Smith
  (1994) shapes without their Reynolds-number term. The only surviving text of
  that model states it was fitted "for driver shots" (70,000 < Re < 210,000,
  0.08 < S < 0.2). S rises as the ball slows, and at sea level with the
  calibrated factors only the two Driver rows stay below 0.2 for the whole
  flight (launch S = 0.074 PGA, 0.088 LPGA; peak ≈ 0.17). The other woods, the
  hybrids, the PGA 3–5 Iron and the LPGA 4 Iron launch inside the range
  (S ≈ 0.096–0.195) but peak at ≈ 0.21–0.51; the PGA 6 Iron to PW and the
  LPGA 5 Iron to PW launch above it (S ≈ 0.22–0.48) and peak at
  ≈ 0.47–1.17. Those rows are an extrapolation, absorbed in part by per-row
  calibration and stated on the methods page.
- Spin decay λ₀ = 2.0×10⁻⁵ (Smits & Smith, as given in Penner 2001 eq. 16),
  scaled by ρ/ρ₀ because the decay torque scales with dynamic pressure.
- Ball m = 45.93 g, D = 42.67 mm (Equipment Rules, Part 4 limits);
  g = 9.80665 m/s².
- Launch from y = 0 at the published ball speed, launch angle and spin.
  Outputs, all measured against the launch elevation as TrackMan does: carry
  (x where the descent crosses y = 0), max height (apex y), land angle
  (atan2(−v_y, vₓ) at landing).
- Integration: fixed-step RK4 with dt = 0.05 s; apex and landing located
  within the step by cubic-Hermite interpolation. Two independent
  implementations measured the error against dt = 0.001 s at ≤ 1×10⁻⁶ yd and
  ≤ 1.1×10⁻³°; no displayed cell changes anywhere in the range.
- A flight is capped at 60 s of simulated time; reaching the cap, or any
  non-finite state, is a model failure (section 5.6).

### 5.3 Calibration

- For every table row, fit k_D and k_L so that the sea-level model reproduces
  the published carry and max height in yards, with a damped 2×2 Newton
  iteration and a finite-difference Jacobian. Two independent implementations
  converge in 3 iterations (about 10 flights) on every row, with Jacobian
  condition numbers 3–9.
- Expressed as density-independent products, the fitted values lie near
  ρ₀k_D ≈ 1.08–1.50 and ρ₀k_L ≈ 0.96–1.32 kg/m³ (k_D ≈ 0.92–1.27,
  k_L ≈ 0.81–1.12 at ρ₀ = 1.1839). A row that fails to converge within 20
  iterations is a model failure (section 5.6).
- Calibration targets the published yards. The metres column could narrow the
  rounding intervals slightly, but the gain is below the other uncertainties;
  the methods page states that the table's rounding alone makes the carry
  delta uncertain by up to about 1 yd at 10,000 ft.
- Land angle is not a calibration target; it is a check (sections 5.5, 8.3).
- Calibration runs in the browser after the tables have been painted from
  the data (section 5.4) and yields between rows, so the page is interactive
  immediately. Budget, as a deterministic count a test can enforce: at most
  50,000 RK4 steps for all 23 rows, and at most 4,000 per recompute
  (23 flights). Measured with the spec's model at dt = 0.05 s in headless
  Chrome: 36 / 54 / 86 ms at 4× / 6× / 10× CPU throttling for calibration and
  1.7 / 2.6 / 4.8 ms per recompute.
- The fitted values are a pure function of the table and the model, so they
  are never stored.

### 5.4 From model to display

- At load the tables are painted directly from `data.js` (sea level needs no
  model), then calibration runs.
- For each calibrated row and the current density ratio ρ/ρ₀ = P/P₀: run
  the model at ρ/ρ₀ and at 1 (the sea-level run is cached);
  Δ = model(ρ/ρ₀) − model(1) for carry, max height and land angle, converted
  to each display unit (Δm = Δyd × 0.9144); displayed = round(published + Δ)
  per unit; absolute delta = displayed − published; percent delta =
  Δ / published.
- A row not yet calibrated when the user moves the controls shows its
  published values with an ellipsis in the delta line until it is ready.
- Input changes are coalesced to one recompute per animation frame.

### 5.5 Limitations, stated on the methods page

1. **No Reynolds-number dependence.** The dimpled-ball drag crisis lies at
   Re ≈ 5×10⁴–10⁵ on current tour balls (Lyu et al. 2018, spinning or not, up
   to S ≈ 0.3), which overlaps the slow end of every flight; spin moves the
   crisis to lower Re (Li et al. 2017), and no open data cover S 0.3–1.2.
   Lower density lowers Re, so a Re term would change the altitude delta, not
   just the sea-level level calibration absorbs. The Re-free model is chosen
   because it is the closest match to TrackMan's own model: TrackMan's 2014
   model trajectories (oracle 10 and the wind cases) and TrackMan-derived
   altitude figures. That evidence is largely TrackMan's model and players'
   TrackMan-derived planning numbers, so it cannot rule out Re effects; drag-
   crisis variants that let spin move the crisis also pass every hard oracle.
   Across physically plausible variants, iron and wedge carry gains are
   uncertain by about −30 % to +25 % of the shown gain.
2. **Land-angle offset.** After calibration the model lands shallower than
   TrackMan's table — about 1–9° for the PGA rows and LPGA woods to 7 Iron
   (worst for hybrids and long irons), within 0.7° for LPGA 8 Iron to PW.
   The gap follows spin combined with low launch, not carry or flight time.
   Against TrackMan's own fully specified model shots it is only 1.1–1.8°, and
   at the same launch the 2023 table rows are longer, lower and steeper than
   TrackMan's model trajectory. The cause is unresolved. Ruled out: the spread
   of launch conditions within a row (−0.45°, the wrong sign), faster spin
   decay, and different air on the two tours' schedules (0.2 % apart).
   Measured tour-ball data show lift collapsing and drag rising below
   Re ≈ 7.5×10⁴, the late-flight steepening this model lacks; at the strength
   the table asks for it closes most of the gap but cuts iron carry gains at
   altitude, which no published iron measurement confirms or refutes
   (`docs/research/land-angle-spike/SYNTHESIS.md`).
   The land-angle column is labelled indicative; its delta carries about ±2°
   of structural uncertainty at 10,000 ft. An alternative, launch-anchored
   mapping (equally exact at sea level) would show larger land-angle changes
   for woods, hybrids and long irons, by up to 3.4° at 10,000 ft; no source
   discriminates between the two.
3. **Low-spin clubs plateau at extreme altitude.** As density falls, carry
   tends to its vacuum value, and for low-spin, low-launch shots that is
   shorter than at moderate density: the LPGA 3-wood and 4 Iron peak near
   14,500 ft (by 0.03 yd, invisible in the displayed integers).
4. Launch conditions are held fixed at altitude; real players may change
   clubs, trajectory or swing.
5. No wind, temperature, humidity, ball-model or roll effects.
6. TrackMan does not state the tables' conditions; calm sea level is assumed.

### 5.6 Failure handling

Input that would reach the model is always finite and inside the range
(section 4.2), but the model still defends itself: a non-finite state, a
flight reaching the 60 s cap, or a row whose calibration does not converge
marks that row failed. A failed row shows published values with `—` deltas
(section 4.3); the other rows are unaffected; the failure is logged to the
console and sets the page's error state used by the smoke test.

## 6. Methods page

A separate static page (`methods.html`), linked from the controls. Single
column; wide equations and tables scroll horizontally within their own
containers on phones. Sections:

1. What the page shows, and the assumptions (sections 3, 5.1).
2. Atmosphere: equations, constants, and why a weather report's "barometric
   pressure" (reduced to sea level; in the US the altimeter setting in inHg)
   cannot be typed into the pressure box.
3. Ball-flight model: equations of motion, coefficient shapes and their stated
   validity range, spin decay, ball constants, integration, and that carry,
   max height and land angle are measured against the launch elevation.
4. Calibration: the procedure, plus a live table of fitted k_D, k_L per row and
   the model's sea-level land angle beside TrackMan's.
5. How displayed values and deltas are computed (sections 4.3, 5.4).
6. Validation: a live table of every reference oracle (section 8.3) — source,
   what it measures, condition, expected band, the model's value, pass /
   soft-fail. The monotonicity sweep uses a 500 ft grid and fills in
   incrementally.
7. Limitations (section 5.5), including the contrast note (section 4.4).
8. Sources, each marked as read at the primary source or seen only second
   hand. Equations: Penner (2001), *Am. J. Phys.* 69:563,
   doi:10.1119/1.1344164 (equations of motion and spin decay; open author
   copy) and Smits & Smith (1994), *Science and Golf II* pp. 340–347
   (coefficient shapes; the chapter was not available — its text was read as
   reproduced in US patent 11,230,375 B1, apparently from Mehta & Pallis
   (2001), which the page states). Atmosphere: U.S. Standard Atmosphere 1976
   (NASA NTRS). Units: NIST SP 811. Reference data: as listed per oracle.

Equations use native MathML, restricted to the MathML Core subset Chromium
implements (no script dependency). The live tables are computed by the same
modules the main page uses, so they cannot drift from the running model.

## 7. Architecture

Plain ES modules, no build step, no runtime dependencies. The deployable site
is the `site/` directory; nothing outside it is published.

| Path | Responsibility |
|---|---|
| `site/index.html`, `site/methods.html` | markup, CSP, `modulepreload` list |
| `site/css/style.css` | palette, layout, sticky bar, pinned column |
| `site/fonts/` | Oswald and Lato woff2, OFL texts, `SOURCES.md` |
| `site/js/data.js` | the two tables as published, both units, data notice |
| `site/js/units.js` | length, speed, pressure conversions |
| `site/js/atmosphere.js` | elevation ↔ pressure, density ratio |
| `site/js/flight.js` | equations of motion, RK4, apex and landing, step cap |
| `site/js/calibrate.js` | per-row k_D, k_L fit |
| `site/js/model.js` | calibrate rows incrementally; Δ per row for a density ratio |
| `site/js/oracles.js` | reference oracles, bands, hard / soft (shared by tests and the methods page) |
| `site/js/present.js` | displayed values, absolute and percent delta strings, accessible text |
| `site/js/controls.js` | linked-input state: parse, validate, clamp, convert, format |
| `site/js/version.js` | version string: `dev` in the tree, stamped from the tag at deploy |
| `site/js/app.js`, `site/js/methods.js` | DOM wiring only |

Seams:

- `flight.js` takes launch conditions, k_D, k_L, a density ratio and an
  optional wind, and returns carry, max height, land angle (SI) and the step
  count, or a failure. It knows nothing about tables or display.
- `model.js` exposes calibration state per row and Δ for a density ratio;
  `present.js` turns published values plus Δ into cell text; neither touches
  the DOM.
- `controls.js` is a pure state module (pressure in Pa plus unit selections →
  the strings each control shows; text → accepted value or invalid); `app.js`
  only binds DOM events to it.
- Every module except `app.js` and `methods.js` imports cleanly in Node, so
  all logic is unit-testable without a browser.
- DOM text is written with `textContent` only; no `innerHTML`.

Security: both pages carry a strict meta Content-Security-Policy —
`default-src 'none'`, `script-src 'self'`, `style-src 'self'`,
`font-src 'self'`, `img-src 'self'`, `base-uri 'none'`, `form-action 'none'`,
and `require-trusted-types-for 'script'` — with no `'unsafe-inline'`; there
are no inline scripts or style attributes. (GitHub Pages cannot set response
headers, so `frame-ancestors` is unavailable.) The page makes no third-party
requests. A reviewer's prototype of this design ran under this policy with no
violations.

Performance: `modulepreload` links for every module of each page (a test
checks the list matches the import graph); fonts preloaded.

## 8. Testing

### 8.1 Unit tests

`node --test` on an explicit `test/*.test.js` list (Node 24, from one
`.nvmrc`; built-in runner, no dependencies):

- **units / atmosphere:** conversions; elevation → pressure against
  USSA 1976 table values (the tables truncate, so assert
  `table ≤ computed < table + 1` in the last printed digit); inverse
  round-trips; ρ/ρ₀ at 5,000 / 10,000 / 15,000 ft = 0.832085 / 0.687832 /
  0.564587; ρ₀ = 1.1839 kg/m³.
- **flight:** with C_D = C_L = 0 the model reproduces the analytic vacuum
  range and apex; halving dt changes outputs by less than 0.001 yd; zero spin
  gives zero lift; launch S for the PGA Driver = 0.0744; spin decay: landing
  spin of the calibrated PGA Driver ≈ 77.7 % of launch spin, and decay scales
  with ρ/ρ₀; the step cap and non-finite states return a failure.
- **calibration:** every row reproduces published carry and max height within
  0.01 yd at sea level; converges within 20 iterations; ρ₀k_D, ρ₀k_L inside
  the section 5.3 envelope with a 10 % margin; PGA Driver ρ₀k_D = 1.0893 and
  ρ₀k_L = 0.9912 kg/m³ (±0.002).
- **golden regression values** (from an independent implementation; deltas
  are ρ₀-independent), tolerance 0.05 yd / 0.05°:

  | Row | 5,000 ft ΔC / ΔH / ΔL | 10,000 ft ΔC / ΔH / ΔL |
  |---|---|---|
  | PGA Driver | +17.28 yd / −3.44 yd / −5.07° | +29.58 / −7.05 / −10.12 |
  | PGA 7 Iron | +15.88 / −2.17 / −4.10 | +29.24 / −4.74 / −8.72 |
  | PGA PW | +12.02 / −1.09 / −3.35 | +22.48 / −2.41 / −6.90 |
  | LPGA Driver | +9.62 / −2.34 / −4.48 | +15.52 / −4.62 / −8.59 |
  | LPGA 3-wood | +10.26 / −2.60 / −4.97 | +16.55 / −5.22 / −9.78 |

  These pin the deliberate choices that no oracle catches: reversing constant
  temperature, dropping or mis-scaling spin decay, or mis-computing S all move
  them by more than the tolerance.
- **model:** density ratio 1 gives Δ = 0 exactly; for every row carry rises
  and max height and land angle fall, monotonically, from 0 to 10,000 ft;
  a failed row does not affect the others.
- **budget:** calibrating all rows takes at most 50,000 RK4 steps; one
  recompute at most 4,000.
- **present:** at sea level every cell equals the published text in both
  units (including `209/192`); a PGA 8 Iron carry Δ of +7.6 yd shows `172/157`
  over `+8/+7`; `±0` when the rounded change is zero; `±0.0%` and never
  `−0.0%`; percent rounding; accessible text for both units; `—` for a failed
  row.
- **controls:** inHg / kPa / mbar / ft / m views of one state agree; unit
  switches leave the state unchanged; `5,280` → 5280, `84,3` → 84.3, empty and
  garbage are invalid; out-of-range text leaves the state unchanged while
  typing and clamps on commit; leaving an unedited box does not move the
  state; `150000` ft never reaches the model.
- **fonts / preload:** every font file matches its recorded SHA-256; each
  page's `modulepreload` list equals its module import graph.

### 8.2 Browser smoke test

`test/smoke.sh` serves the deploy artifact (section 9.3) locally and loads
both `index.html` and `methods.html` in headless Chrome with logging to
stderr. Each page sets `data-state="ready"` on its root element when
rendering and calibration finish, or `data-state="error"` from its error
handlers. The test fails unless every request returned 200, both pages reach
`ready`, the main page shows the published sea-level values, and Chrome's
stderr has no uncaught error or CSP violation. No npm dependency.

Visual checks at phone and desktop sizes during development use Chrome device
emulation through the DevTools protocol; `--window-size` alone does not give a
phone-width layout.

### 8.3 Reference oracles

From `docs/research/reference-data.md`, corrected by the claims review.
Sea level and altitude use the same temperature, so the density ratio is the
pressure ratio. **Hard** oracles fail the build; **soft** ones are reported as
CI warning annotations and shown on the methods page. An oracle is hard only
when its source measures carry (or apex / land angle) for a known shot at a
stated elevation.

| # | Case | Expected (source) | Band | Kind |
|---|---|---|---|---|
| 1 | PGA Driver row at 7,800 ft: carry | +8.5 %: 282 → 306 yd (PGA TOUR 2017: TrackMan's J. Padjen "ran the numbers" for a 113 mph, 10.7° player; secondary) | +5 % … +12 % | hard |
| 2 | same: max height | −18 % (apex 102 → 84 ft, same source) | −8 % … −28 % | hard |
| 3 | same: land angle | −9° (38° → 29°, same source) | −5° … −13° | hard |
| 4 | PGA Driver at 5,280 ft: carry | +6.1 % (Titleist / S. Aoyama, 1.16 % per 1,000 ft — a *total-distance* rule that credits extra roll) | +3.5 % … +8.5 % | soft |
| 5 | mean PGA carry gain at 7,200 ft | ≈ +10 % (TrackMan Support simulator note: "roughly 10 % further in the air" at ~7,000 ft; no club named) | +6.5 % … +13 % | soft |
| 6 | PGA 7 Iron at 6,400 ft: carry | +12–14 % (Scheffler / McIlroy caddie sheets, Castle Pines 2024, "nearly 6,400 feet"; planning numbers) | +7 % … +16 % | hard |
| 7 | at 6,400 ft: gain(7 Iron) ≥ gain(Driver) and gain(PW) ≤ gain(7 Iron) | club-pattern ordering (five sources) | ordering | soft |
| 8 | at 4,920 ft: PGA 7 Iron; PGA Driver carry | +7.5 %; +5 % (Penge at Crans-Montana; the source ties the numbers to temperature) | +4 … +10 %; +3 … +7.5 % | soft |
| 9 | every row, 0 → 10,000 ft; 10,000 → 15,000 ft | carry ↑, max height ↓, land angle ↓, monotone; above 10,000 ft, displayed carry never decreases between adjacent slider steps | sign | hard; soft above 10,000 ft |
| 10 | TrackMan 2014 model 6 Iron shots ("Calm"; PGA 130 mph / 14.7° / 6088 rpm → 184 yd / 33.8 yd / 48.0°; LPGA 110 / 18.6° / 5950 → 152 / 27.7 / 45.6°), calibrated to each shot's carry and max height | land angle (measured gap 1.8° PGA, 1.1° LPGA) | ±3° | hard |
| 11 | LPGA Driver gain at 5,280 ft | ≤ PGA Driver gain + 1 point | ordering | soft |
| 12 | the same TrackMan 2014 shots in constant 10 / 20 mph head- and tailwind (eight cases, wind via section 5.2's test-only w) — PGA: HW10 166 / 38.1 / 58.1, HW20 143 / 42.8 / 69.5, TW10 198 / 29.7 / 39.5, TW20 207 / 26.1 / 32.7; LPGA: HW10 139 / 31.3 / 55.6, HW20 121 / 35.3 / 67.4, TW10 161 / 24.5 / 37.7, TW20 167 / 21.7 / 31.7 | carry, land angle (measured worst: 3.6 yd, 2.0°) | carry ±5 yd, land ±3° | soft |

Oracles 10 and 12 are the only checks against TrackMan's own model with fully
specified inputs (read from the images of TrackMan's "Normalization feature
explained" post, 2014). The bands are deliberately wide: the altitude sources
are secondary quotes or planning numbers, and none gives iron launch
conditions alongside altitude carry.

## 9. CI, versioning and deployment

Versioning follows the semantic-release setup of the `*-claude` repositories
(reference: `jhoblitt/conventions-claude`), except that releases push only a
tag: nothing is committed back to `main` (user decision). The reference needs
its commit-back because the plugin marketplace reads versions from files in
the tree; a Pages site has no such reader, and dropping it is what allows CI
to be a required check and tests to gate every release.

### 9.1 Pull requests

`ci.yml` runs on every pull request and on pushes to `main`: the unit tests
(including every hard oracle), the soft-oracle report (warning annotations),
and the browser smoke test. The ruleset requires its checks to pass before a
pull request can merge.

Merges use merge commits only (squash and rebase disabled), so every commit
semantic-release analyses has passed commitlint; a squash would version from
the unchecked PR title.

### 9.2 Automatic semantic versioning

`release.yml` runs on every push to `main` (every merge):

1. **test** job: the full CI suite. A release is never cut from a red tree.
2. **release** job (needs test): semantic-release, invoked as in the
   reference — `npx` with `npm_config_ignore_scripts=true` — but with every
   plugin it loads named on the `npx` line at an exact version
   (semantic-release, commit-analyzer, release-notes-generator, github, exec,
   conventional-changelog-conventionalcommits), so no plugin floats on a caret
   range while holding a write token. `.releaserc.yml` follows the reference:
   Conventional Commits preset; `feat` → minor, `fix` → patch, `!` /
   `BREAKING CHANGE` → major, and `docs`, `refactor`, `perf` → patch, because
   methods-page and explanatory changes are user-visible content. `chore`,
   `ci`, `test`, `build` and `style` cut no release (`style` is the Angular
   convention's formatting type adopted by commitlint's config; a visual / CSS
   change is a `feat` or `fix`). Plugins: commit-analyzer,
   release-notes-generator (the reference's visible-types list), exec (the
   reference's `release-notes.sh`, adding GitHub's PR list and the issues those
   PRs close), github (publishes the GitHub Release; success and fail comments
   off). No changelog or git plugin: release notes live on GitHub Releases.
   Tags are `v<version>`; the first release is `v1.0.0`. After semantic-release
   the job reads the release tag, if any, with
   `git tag --points-at HEAD --list 'v*'` and exposes it as a job output — this
   holds even if a later plugin step fails after the tag was pushed.
3. **deploy** job (needs release, runs when a tag was output): calls
   `deploy.yml` with the tag. As a calling job it grants `contents: read`,
   `pages: write` and `id-token: write` (a called workflow cannot exceed its
   caller) and carries no `timeout-minutes` (not allowed on a calling job; the
   called jobs set their own).

Concurrency: constant group `release`, `cancel-in-progress: false` — releases
are serialised and never cancelled (the github-conventions release exception).

### 9.3 Deployment

`deploy.yml` publishes a tag to GitHub Pages (Pages source: GitHub Actions):

- Triggers: `workflow_call` (from `release.yml`, with the tag);
  `workflow_dispatch` with a tag input (redeploy or deliberate rollback); and
  `push` of a `v*` tag, so a tag created by hand on `main` also deploys. A tag
  pushed by semantic-release with the workflow's `GITHUB_TOKEN` triggers no
  workflow, which is why the release workflow calls this one.
- **build** job (read-only): checks out the tag; fails unless the tagged
  commit is reachable from `main`; on every push-triggered run (a `v*` tag
  pushed by hand, or the release workflow's `workflow_call`, whose event is
  the caller's push), skips unless the tag is the highest release on `main`,
  counting only tags of the form `vMAJOR.MINOR.PATCH`: a re-run of an old
  release run or an accidental old tag cannot roll the site back, and a tag
  the release just cut is by construction the highest on `main`; only
  `workflow_dispatch` is exempt (redeploy or deliberate rollback); runs the
  tests; builds the
  artifact by copying `site/`, writing the tag into `js/version.js`, and
  appending `?v=<version>` to every module, stylesheet and preload URL so a
  visitor's cache (Pages serves `max-age=600`) can never mix two releases'
  modules; runs the smoke test against that artifact; uploads it with the
  official Pages artifact action.
- **deploy** job (needs build): environment `github-pages`, `pages: write`
  and `id-token: write`, deploys with the official deploy action. No other job
  holds those permissions.
- The `github-pages` environment's deployment policy must admit `main` (the
  workflow_call and dispatch runs) and `v*` tags (hand-pushed tag runs).
- Concurrency: a constant `pages` group (never derived from `github.*`, which
  is the caller's context under `workflow_call`), `cancel-in-progress: false`
  so a deploy is never cancelled mid-run — declared as a second exception
  alongside the release workflow's.

### 9.4 Workflow hygiene

All workflows follow github-conventions: actions pinned to full SHAs with
version comments (pinact), actionlint with shellcheck, top-level
`permissions: contents: read` with job-level grants only where listed above
(`contents: write`, `issues: read`, `pull-requests: read` for the release job;
`pages: write`, `id-token: write` for deploying; `security-events: write` for
CodeQL), `persist-credentials: false` on checkout, and `timeout-minutes` on
every job that runs steps.

## 10. Repository

Setup order (github-conventions new-repo flow, plus what Pages and the
release design need):

1. Create `jhoblitt/tmelevation` empty and public.
2. Apply the canon ruleset (deletion, non-fast-forward); enable
   delete-branch-on-merge; allow merge commits only.
3. Push an empty root commit to `main`. This must precede step 6: a
   required-check rule would reject this direct push.
4. Enable GitHub Pages with source "GitHub Actions" and set the
   `github-pages` environment's deployment policy (section 9.3).
5. Open the pull request from an `init` branch carrying everything else; its
   commits include at least one `feat`, so the first merge releases `v1.0.0`
   and deploys.
6. Once CI has reported on that pull request, add its checks to the ruleset
   as required status checks; then merge.

Contents: Apache-2.0 `LICENSE`; the README skeleton (stating that the
tour-average figures are TrackMan's and outside the licence, crediting the
fonts, and noting the inherited contrast); Dependabot for GitHub Actions; the
standard workflows — workflow-lint, CodeQL (one JavaScript job, build mode
`none`; the commitlint helper's Go is canon tooling, as in the reference
repositories that carry no Go CodeQL job), dependency review, Scorecard,
commitlint; `ci.yml`, `release.yml`, `deploy.yml`, `.releaserc.yml`,
`.nvmrc`, and a `package.json` that declares no dependencies (only
`"type": "module"` and the `test` script). `docs/research/` and
`docs/reviews/` are committed as provenance. Harness directories
(`.claude/` anywhere in the tree) are excluded through `.git/info/exclude`.

## 11. Risks

1. **Reynolds-number physics** (section 5.5 item 1) is the largest modelling
   uncertainty — about −30 % to +25 % on iron and wedge gains — and the
   evidence for the Re-free choice is mostly TrackMan's own model.
2. **Land-angle offset** (section 5.5 item 2): cause unresolved; the one
   measured mechanism that closes it is the low-Re behaviour risk 1 omits;
   the column is labelled indicative.
3. **Coefficient-shape source** rests on a patent's reproduction of review
   text; calibration makes its constants immaterial, but the S^0.4 shape and
   its driver-only fitting range are unverified against the chapter.
4. **Pages environment policy and merge settings** are repository settings
   outside the tree; verified during setup (section 10).
