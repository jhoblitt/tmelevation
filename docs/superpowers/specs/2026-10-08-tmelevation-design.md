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
- The air viscosity, for the drag's Reynolds number (section 5.2), follows
  Sutherland's law (1.716×10⁻⁵ Pa·s at 273.15 K, Sutherland constant
  110.4 K) at T₀: μ = 1.8371×10⁻⁵ Pa·s, the same at every elevation, since
  viscosity depends on temperature alone.
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

- Spin parameter S = rω/U (ω in rad/s); Reynolds number Re = ρUD/μ
  (section 5.1 for μ).
- C_D = k_D · [C_D0(S) + 1.35×10⁻⁷ · (max(Re, 10⁵) − 1.5×10⁵)] and
  C_L = k_L · C_L0(S), with

      C_D0(S) = 0.22 − 0.27 S + 3.0 S²                    S ≤ 0.22
              = C_D0(0.22) + 0.38 (min(S, 0.64) − 0.22)   S > 0.22
      C_L0(S) = 2.475 S                                   S < 0.04
              = 0.065 + 0.85 S                            0.04 ≤ S ≤ 0.30
              = min(0.45, 0.32 + 0.25 (S − 0.30))         S > 0.30

  the supercritical (Re ≥ 7.5×10⁴) drag and lift of current tour balls. Up
  to S 0.22 (drag) and 0.30 (lift) they are least-squares fits (rms 0.020,
  0.024) to Lyu, Kensrud & Smith (2020), Lyu et al. (2018), the USGA Indoor
  Test Range patent's example data (US 6,186,002 B1) and Bridgestone's
  patents (US 7,175,542 B2, 7,201,671 B2, 7,238,121 B2, 8,021,249 B2). The
  data start at S 0.04; below it lift runs linearly to zero, since a ball
  without spin has none (no tour flight goes below S 0.074). No
  modern ball is measured above S ≈ 0.36; above the fitted ranges the shapes
  follow Bearman & Harvey's (1976) ball (lift to its 0.45 at S 1.0; drag slope
  0.38, measured to S 0.46, continued to S 0.64 and held flat). The Re term is
  the drag rise measured above Re 10⁵ (between B&H's +0.011 and the USGA
  example ball's +0.0165 per 10⁵), frozen below it. The measured low-speed
  lift loss and drag rise below Re ≈ 7.5×10⁴ are left out (section 5.5
  item 1). The laws, their measured basis and the band variants are in
  `docs/research/land-angle-spike/` (law R0 in `harness/laws2.mjs`).
- At sea level with the calibrated factors S rises from 0.074–0.48 at launch
  to 0.17–1.15 on the descent, and Re falls from 1.1–2.1×10⁵ to
  4.2–7.4×10⁴. Only the Drivers and 3-woods stay within the lift fit
  (S ≤ 0.30) for the whole flight; the other woods, the hybrids, the PGA 3–5
  Iron and the LPGA 4–5 Iron peak at S ≈ 0.37–0.52, and the 6 Iron to PW of
  both tours at ≈ 0.58–1.15, where the shapes rest on the 1976 ball and,
  above S 0.46, on extrapolation; per-row calibration absorbs part of that,
  and the methods page states it.
- Spin decay λ₀ = 2.0×10⁻⁵ (Smits & Smith, as given in Penner 2001 eq. 16),
  scaled by ρ/ρ₀ because the decay torque scales with dynamic pressure.
- Ball m = 45.93 g, D = 42.67 mm (Equipment Rules, Part 4 limits);
  g = 9.80665 m/s².
- Launch from y = 0 at the published ball speed, launch angle and spin.
  Outputs, all measured against the launch elevation as TrackMan does: carry
  (x where the descent crosses y = 0), max height (apex y), land angle
  (atan2(−v_y, vₓ) at landing).
- Integration: fixed-step RK4 with dt = 0.05 s; apex and landing located
  within the step by cubic-Hermite interpolation. Against dt = 0.001 s the
  error is ≤ 1×10⁻³ yd and ≤ 1.3×10⁻³° on every row at its calibrated factors
  from 0 to 15,000 ft. The laws' corners (S 0.22, 0.30, 0.64; Re 10⁵) cost
  RK4 its fourth order in the step that crosses one, so the error is larger
  than with smooth laws, but a displayed value differs from the reference only
  where it lies within that error of a rounding boundary.
- A flight is capped at 60 s of simulated time; reaching the cap, or any
  non-finite state, is a model failure (section 5.6).

### 5.3 Calibration

- For every table row, fit k_D and k_L so that the sea-level model reproduces
  the published carry and max height in yards, with a damped 2×2 Newton
  iteration and a finite-difference Jacobian. It converges in 2–4 iterations
  (7–13 flights) on every row, with Jacobian condition numbers 4–9; the
  land-angle spike's harness, an independent implementation, fits the same
  factors to 10⁻¹³.
- Expressed as density-independent products, the fitted values lie near
  ρ₀k_D ≈ 1.03–1.56 and ρ₀k_L ≈ 1.08–1.75 kg/m³ (k_D ≈ 0.87–1.32,
  k_L ≈ 0.92–1.48 at ρ₀ = 1.1839). A row that fails to converge within 20
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
  (23 flights); the measured laws take 26,807 and 2,462 (at 15,000 ft).
  Measured with the first release's laws (29,291 and 2,449 steps) at
  dt = 0.05 s in headless Chrome: 36 / 54 / 86 ms at 4× / 6× / 10× CPU
  throttling for calibration and 1.7 / 2.6 / 4.8 ms per recompute.
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

1. **Only a weak Reynolds-number dependence.** The model's one Re term is
   the small supercritical drag rise above Re 10⁵. Measured tour balls also
   lose most of their lift (some briefly reversing it) and gain drag below
   Re ≈ 7.5×10⁴, about 27 m/s at sea level (Lyu, Kensrud & Smith 2020;
   Bridgestone's patents for the onset), and no modern ball is measured there
   above S ≈ 0.36, where iron and wedge descents end. Thin air lowers Re at a
   given speed, so that band would arrive earlier and cut iron and wedge
   altitude gains. It is left out because no measurement confirms or refutes
   the cut: the only measured altitude carries are PGA TOUR drivers
   (≤ 7,746 ft). The nearest iron evidence is players' planned +12–14 % at
   6,400 ft (oracle 6), plans rather than measurements; this model comes
   close (+11.7 %) and the banded laws do not (+6.0 to +8.7 %)
   (`docs/research/land-angle-spike/SYNTHESIS.md`, Round 2). Uncertainty, by
   this method: the spread of iron and wedge carry gains at 10,000 ft between
   this model (R0) and the spike's three band variants R1–R3 (band persisting
   at every S, fading by S 0.6, fading by S 1.0), each with its band shape
   fitted to land angle under this calibration (the spike's mode A\*), all
   under per-row calibration. Their gains are 3.5 % to 174 % smaller than
   shown (beyond 100 %, for the LPGA 4–7 Iron, carry falls with elevation);
   none is larger. With the band at its nominal measured values instead, the
   range is 3.1 % to 133 % smaller.
2. **Land-angle offset.** After calibration the model lands shallower than
   TrackMan's table — about 2–8° for the PGA 3-wood to PW and the LPGA
   5-wood to 7 Iron (worst for the PGA 5-wood, hybrid and long irons), within
   0.9° for both Drivers, the LPGA 3-wood and the LPGA 8 Iron to PW (land RMS
   3.96° over the 23 rows).
   The gap follows spin combined with low launch, not carry or flight time.
   Against TrackMan's own fully specified model shots it is only 0.3–0.6°, and
   at the same launch the 2023 table rows are longer, lower and steeper than
   TrackMan's model trajectory. The cause is unresolved. Ruled out: the spread
   of launch conditions within a row (−0.45°, the wrong sign), faster spin
   decay, and different air on the two tours' schedules (0.2 % apart).
   The low-speed band of item 1 is the late-flight steepening this model
   leaves out; at the strength the table asks for it closes most of the gap
   (land RMS 1.6–2.3° under per-row calibration) but cuts iron carry gains at
   altitude, which no published iron measurement confirms or refutes
   (`docs/research/land-angle-spike/SYNTHESIS.md`).
   The land-angle column is labelled indicative; at 10,000 ft its delta
   differs by up to 8° between this model and the band variants of item 1.
   An alternative, launch-anchored mapping (equally exact at sea level) would
   show larger land-angle changes for woods, hybrids and long irons, by up to
   3.2° at 10,000 ft; no source discriminates between the two.
3. **Low-spin clubs plateau at extreme altitude.** As density falls, carry
   tends to its vacuum value, and for low-spin, low-launch shots that is
   shorter than at moderate density: the PGA Hybrid, 3 and 4 Iron and the
   LPGA Driver, 3-wood, 5-wood and 4 Iron peak at 13,350–14,930 ft and lose
   at most 0.3 yd by 15,000 ft. Two displayed values show it: PGA Hybrid
   carry 266 → 265 yd near 14,910 ft (soft oracle 9b warns) and LPGA 4 Iron
   178 → 177 m near 14,960 ft.
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
   copy) and Smits & Smith (1994), *Science and Golf II* pp. 340–347 (the
   spin-decay constant; the chapter was not available — the constant was read
   in Penner eq. 16, and US 6,186,002 B1 uses the same value). Drag and lift:
   Lyu, Kensrud & Smith (2020), *Sports Eng.* 23:3,
   doi:10.1007/s12283-020-0318-1; Lyu, Kensrud, Smith & Tosaya (2018),
   *Proceedings* 2:238, doi:10.3390/proceedings2060238; the USGA Indoor Test
   Range patent US 6,186,002 B1; Bridgestone's US 7,175,542 B2, 7,201,671 B2,
   7,238,121 B2 and 8,021,249 B2; Bearman & Harvey (1976), *Aeronautical
   Quarterly* 27:112–122 (second hand, through the reproductions in Kensrud's
   2010 WSU thesis and Crabill, Witherden & Jameson, arXiv:1806.00378);
   checked against Aoki, Muto & Okanaga (2011), *Trans. JSME B* 77:793–802,
   doi:10.1299/kikaib.77.793.
   Atmosphere: U.S. Standard Atmosphere 1976 (NASA NTRS). Units: NIST SP 811.
   Reference data: as listed per oracle.

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
  0.564587; ρ₀ = 1.1839 kg/m³; μ = 1.8371×10⁻⁵ Pa·s.
- **flight:** with C_D = C_L = 0 the model reproduces the analytic vacuum
  range and apex; halving dt changes outputs by less than 0.001 yd; the drag
  and lift laws at a few S and Re points, continuous at S 0.22, 0.30 and 0.64
  and frozen below Re 10⁵; launch S for the PGA Driver = 0.0744; spin decay:
  landing spin of the calibrated PGA Driver ≈ 77.7 % of launch spin, and decay
  scales with ρ/ρ₀; the step cap and non-finite states return a failure.
- **calibration:** every row reproduces published carry and max height within
  0.01 yd at sea level; converges within 20 iterations; ρ₀k_D, ρ₀k_L inside
  the section 5.3 envelope with a 10 % margin; PGA Driver ρ₀k_D = 1.2771 and
  ρ₀k_L = 1.4435 kg/m³ (±0.002).
- **golden regression values** (from the land-angle spike's harness, an
  independent implementation, law R0; deltas are ρ₀-independent), tolerance
  0.05 yd / 0.05°:

  | Row | 5,000 ft ΔC / ΔH / ΔL | 10,000 ft ΔC / ΔH / ΔL |
  |---|---|---|
  | PGA Driver | +20.29 yd / −3.30 yd / −5.44° | +34.35 / −6.90 / −10.76 |
  | PGA 7 Iron | +16.27 / −1.92 / −3.91 | +30.79 / −4.36 / −8.86 |
  | PGA PW | +11.73 / −0.99 / −2.87 | +22.00 / −2.28 / −6.01 |
  | LPGA Driver | +11.46 / −2.30 / −4.93 | +18.12 / −4.60 / −9.32 |
  | LPGA 3-wood | +12.56 / −2.64 / −5.87 | +19.62 / −5.34 / −11.25 |

  These pin the deliberate choices that no oracle catches: reversing constant
  temperature, dropping or mis-scaling spin decay, or mis-computing S or Re
  all move them by more than the tolerance.
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
| 10 | TrackMan 2014 model 6 Iron shots ("Calm"; PGA 130 mph / 14.7° / 6088 rpm → 184 yd / 33.8 yd / 48.0°; LPGA 110 / 18.6° / 5950 → 152 / 27.7 / 45.6°), calibrated to each shot's carry and max height | land angle (measured gap 0.6° PGA, 0.3° LPGA) | ±3° | hard |
| 11 | LPGA Driver gain at 5,280 ft | ≤ PGA Driver gain + 1 point | ordering | soft |
| 12 | the same TrackMan 2014 shots in constant 10 / 20 mph head- and tailwind (eight cases, wind via section 5.2's test-only w) — PGA: HW10 166 / 38.1 / 58.1, HW20 143 / 42.8 / 69.5, TW10 198 / 29.7 / 39.5, TW20 207 / 26.1 / 32.7; LPGA: HW10 139 / 31.3 / 55.6, HW20 121 / 35.3 / 67.4, TW10 161 / 24.5 / 37.7, TW20 167 / 21.7 / 31.7 | carry, land angle (measured worst: 1.4 yd, 0.8°) | carry ±5 yd, land ±3° | soft |

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
   uncertainty: the measured low-speed lift loss and drag rise, left out, would
   make iron and wedge gains at 10,000 ft 3.5 % to 174 % smaller. Leaving it
   out rests on players' planning numbers and the absence of any iron
   altitude measurement, not on a measurement that excludes it.
2. **Land-angle offset** (section 5.5 item 2): cause unresolved; the one
   measured mechanism that closes it is the low-Re behaviour risk 1 omits;
   the column is labelled indicative.
3. **Coefficient shapes at high spin** rest on one 1976 ball (Bearman &
   Harvey), read second hand from reproduced figures, above the modern-ball
   data (S ≈ 0.36); the drag beyond S 0.46 is an extrapolation. Every row but
   the Drivers and 3-woods leaves the lift fit, and the 6 Iron to PW reach
   S 0.58–1.15; calibration absorbs the level but not the shape. Checked
   against Aoki, Muto & Okanaga (2011), a golf-size dimpled sphere spun to
   S 2.0: at supercritical Re (8×10⁴, 1.3×10⁵) and S 0.36–1.0 its drag is
   within −0.023 to +0.014 of this model's (reading uncertainty ±0.02) and
   its lift 0.010–0.045 lower, near its 0.03 offset from tour balls at
   S 0.3 — level, not shape. Above S 1.0 (only the PW rows, at sea level)
   it was measured only at Re ≤ 5×10⁴. Refitting the drag to it moves no
   displayed value by more than one unit
   (`docs/research/land-angle-spike/SYNTHESIS.md`, round 3b).
4. **Pages environment policy and merge settings** are repository settings
   outside the tree; verified during setup (section 10).
