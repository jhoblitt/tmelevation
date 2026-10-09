# tmelevation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship the static GitHub Pages site the spec describes — TrackMan's 2023 PGA/LPGA tour-average tables recomputed at a chosen elevation, a methods page, CI on every pull request, semantic-release on every merge, and a Pages deploy for every release tag.

**Architecture:** Plain ES modules under `site/`, no build step and no dependencies. Pure modules (data, units, atmosphere, flight, calibrate, model, oracles, present, controls) carry all logic and are unit-tested in Node; two DOM-only modules (`app.js`, `methods.js`) are exercised in headless Chrome driven over the DevTools protocol. GitHub Actions runs the tests, semantic-release tags merges, and a deploy workflow publishes each tag.

**Tech Stack:** JavaScript (ES2022 modules); Node `node:test` (CI on Node 24, must also run on the local Node 22); headless Google Chrome via the Chrome DevTools Protocol using Node's built-in `WebSocket`; GitHub Actions; semantic-release (via pinned `npx`); native MathML.

**Spec:** `docs/superpowers/specs/2026-10-08-tmelevation-design.md` (repo-relative; until Task 1 moves it, `/home/jhoblitt/github/tmelevation/docs/superpowers/specs/2026-10-08-tmelevation-design.md`). Every task implicitly includes the spec section it cites. Evidence: `docs/research/`, `docs/reviews/spec-2026-10-08/`.

## How to read this plan

This plan carries decisions, behaviour, the interfaces at the seams between tasks, the test cases that pin the behaviour (with exact expected values), and the task order. It does not carry implementation bodies. Code blocks are sketches: the behaviour, the seam signatures and the expected values bind; where a sketch does not compile or contradicts another task, follow the behaviour and append a one-line entry to **Rulings** at the end of this file.

Each task follows the same cycle: write the listed tests → run them and see them fail for the stated reason → implement → run the task's tests and the whole unit suite → commit. Steps that repeat that cycle are written once per task.

## Global Constraints

- **Dependencies:** `package.json` declares no `dependencies` or `devDependencies`. Only `node:` built-ins and browser APIs. No CDN, no third-party request from the site.
- **Modules:** ES modules (`"type": "module"`). Every module under `site/js/` except `app.js`, `methods.js` and `boot.js` must import in Node without DOM globals. Imports are static `import … from './x.js'` / `export … from './x.js'` only — no side-effect-only imports and no dynamic `import()` (the preload test and the artifact builder rely on it).
- **Node:** `.nvmrc` contains `24`. All code and tests must also pass on Node 22 (the local toolchain is v22.22).
- **Published tree:** only `site/`. Nothing else is deployed.
- **DOM writes:** `textContent` (or `setAttribute` for non-`style`, non-event attributes) only. Never `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, inline `<script>` bodies, `style="…"` attributes, `on*=` attributes, or `setAttribute('style', …)`. Dynamic styling only through classes, `hidden`, or CSSOM (`el.style.setProperty`).
- **CSP meta, verbatim on both pages:** `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; require-trusted-types-for 'script'`.
- **Constants (spec §5):** P₀ = 101325 Pa; r₀ = 6356766 m; L = 0.0065 K/m; T₀(ISA) = 288.15 K; g₀ = 9.80665 m/s²; M = 28.9644 kg/kmol; R* = 8314.32 J/(kmol·K); T_ref = 298.15 K; ρ₀ = P₀M/(R*T_ref) = 1.18391 kg/m³; inHg = 3386.389 Pa; kPa = 1000 Pa; mbar = hPa = 100 Pa; ft = 0.3048 m; yd = 0.9144 m; mph = 0.44704 m/s; ball m = 0.04593 kg, D = 0.04267 m; λ₀ = 2.0×10⁻⁵; dt = 0.05 s; flight cap 60 s; calibration ≤ 20 iterations; budgets 50,000 RK4 steps (all rows) and 4,000 per recompute.
- **Range:** elevation 0–15,000 ft (0–4,572 m); pressure 101,325 Pa down to P(4,572 m) = 57,206.8 Pa.
- **Text:** deltas use U+2212 `−` for minus; unchanged is `±0` / `±0°` / `±0.0%`, never `−0.0%`; published launch columns print exactly as TrackMan does (`-0.9°` with hyphen-minus, `14.0°`, `1.30`); pending delta `…` (U+2026); failed delta `—` (U+2014). Number grouping uses `,` (`5,280`).
- **Colours:** background `#EC6919`; stripe `#F3955F` on odd rows (Driver, 5-wood, …); title accent `#3D3B3C`; deltas, methods link, focus ring `#262425`; column rules `rgba(0,0,0,0.2)`; values white. No text shadow (user decision).
- **Fonts:** Oswald (titles, headers; weights 300 and 700) and Lato 400/700, woff2 taken unmodified from Google Fonts, `font-display: swap`, provenance in `site/fonts/SOURCES.md`.
- **Commits:** Conventional Commits accepted by commitlint's config-conventional (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style`, `revert`); each a coherent unit; message says what changed and why, never how it was produced; no session links; every commit ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Workflows:** every `uses:` pinned to a full SHA with a `# vX.Y.Z` comment (pinact); actionlint + shellcheck clean; top-level `permissions: contents: read`, job-level grants only as spec §9.4 lists plus those the canon templates carry (Scorecard, commitlint, CodeQL, dependency review keep their template permissions); `persist-credentials: false` on every checkout; `timeout-minutes` on every job that runs steps; untrusted inputs reach `run:` only through `env:`; no `cmd | head` under `bash -o pipefail` (use `git for-each-ref --count=1`).
- **This machine's sandbox:** headless Chrome, `gh` and any download (fonts, npm) need `dangerouslyDisableSandbox: true`; temp files go under `$TMPDIR`; never hardcode `/tmp`; `npm`/`npx` use `npm_config_cache=$TMPDIR/npm-cache`.
- **Engines differ in the last bit:** Node and Chrome disagree by one ulp on some `pow`/`exp`/`atan2` results, so any comparison between a Node computation and the page compares rounded display text, never raw floats.

## Review Focus

Inputs and conditions the spec implies but no unit test exercises, most likely to bite a person first. Each has a test in the owning task (marked **RF-n** there).

1. **RF-1 — Dragging the slider before calibration finishes.** A user grabs the slider the moment the page appears. Expected: no error; uncalibrated rows show `…`; once calibration completes every cell matches the model at the *final* slider position, never a stale frame. (Task 12, e2e.)
2. **RF-2 — Changing a unit while the box holds invalid or half-typed text.** Expected: the box re-renders the current state in the new unit and the invalid mark clears; the state does not move. (Task 9 unit test; Task 12 e2e.)
3. **RF-3 — Keyboard-only use.** Expected: Tab order follows the visual order of the controls; arrow keys move the slider by one step and the tables follow; Enter commits a text box; the Δ toggle works with Space/Enter; focus is always visible. (Task 12, e2e.)
4. **RF-4 — The narrowest phones and rotation (320 px wide; portrait ↔ landscape).** Expected: no page-level horizontal scrolling; the pinned row fits in one line no taller than 64 px; each table starts scrolled so Max Height, Land Angle and Carry are visible, and stays so after rotation unless the user scrolled it. (Task 12, e2e.)
5. **RF-5 — JavaScript disabled, or a module fails to load.** Expected: a visible explanation instead of an empty page, and `data-state="error"` when scripts run but the module graph fails. (Task 10 markup; Task 12 e2e.)

## File structure

| Path | Responsibility | Task |
|---|---|---|
| `package.json`, `.nvmrc` | `"type": "module"`, scripts `test`, `test:browser`, `oracles`; Node 24 | 2 |
| `site/js/data.js` | TrackMan tables as published + data notice + source URL | 2 |
| `site/js/units.js` | length, speed, angular and pressure conversions | 2 |
| `site/js/atmosphere.js` | elevation ↔ pressure, ρ₀, density ratio, range limits | 3 |
| `site/js/flight.js` | RK4 ball-flight model, apex/landing, failures, step count | 4 |
| `site/js/calibrate.js` | damped 2×2 Newton fit of k_D, k_L | 5 |
| `site/js/model.js` | per-row calibration, incremental model, Δ per density ratio | 6 |
| `site/js/oracles.js` | reference oracles (hard/soft), evaluation | 7 |
| `scripts/oracle-report.mjs` | prints oracle table; GitHub annotations for soft failures | 7 |
| `site/js/present.js` | cell text, delta strings, accessible text | 8 |
| `site/js/controls.js` | linked-input state machine (pure) | 9 |
| `site/index.html`, `site/css/style.css`, `site/favicon.svg` | main page markup and style | 10 |
| `site/js/app.js`, `site/js/boot.js`, `site/js/version.js` | DOM wiring; load-failure watchdog; version string | 10 |
| `site/fonts/*` | woff2 files, `OFL-Oswald.txt`, `OFL-Lato.txt`, `SOURCES.md` | 10 |
| `site/methods.html`, `site/js/methods.js` | methods page and its live tables | 11 |
| `scripts/build-artifact.mjs` | deploy artifact: copy `site/`, stamp version, `?v=` URLs | 12 |
| `test/browser/{serve,cdp,smoke,e2e,run}.mjs` | static server, CDP driver, smoke, end-to-end | 12 |
| `scripts/screenshots.mjs` | development screenshots at device sizes | 12 |
| `test/unit/*.test.js` | unit tests, one file per module plus static checks | 2–12 |
| `.github/workflows/{ci,release,deploy}.yml`, `.releaserc.yml`, `.github/scripts/release-notes.sh` | CI, versioning, deployment | 13 |
| `README.md` | project sections on top of the canon skeleton | 13 |

## Task order

1 → 2 → 3 → 4 → 5 → 6 → 7. Tasks 8 and 9 need only 2, 3 and the Δ shape from 6, so they may run in parallel after 6. 10 needs 6, 8, 9. 11 needs 7 and 10. 12 needs 10 and 11. 13 needs 12. 14 is last.

---

### Task 1: Create the repository, Pages settings and the `init` worktree

Spec: §10, §9.1 (merge method), §9.3 (Pages environment). Canon: github-conventions `references/new-repo.md` and the `github-conventions:github-new-repo` skill, whose procedure this task runs with three project additions (merge-commit-only, Pages, worktree).

**Files:**
- Create: `/home/jhoblitt/github/tmelevation/.git` (local repo), `.git/info/exclude` entry `.claude/`
- Create on `init`: `LICENSE`, `README.md`, `.github/dependabot.yml`, `.github/workflows/{workflow-lint,codeql,dependency-review,scorecard,commitlint}.yml`, `.commitlintrc.yml`, `.github/tools/breaking-footer/main.go` (all from the canon templates)
- Move into the worktree: `docs/research/`, `docs/reviews/`, `docs/superpowers/`

**Interfaces:**
- Produces: GitHub repo `jhoblitt/tmelevation` (public) with `main` = one empty root commit; Pages enabled with source "GitHub Actions"; environment `github-pages` admitting `main` and `v*` tags; a worktree on branch `worktree-init` (pushed later as `init`) containing the canon files and `docs/`.

- [ ] **Step 1: Prepare the local tree.** In `/home/jhoblitt/github/tmelevation`: `git init -b main`; append `.claude/` to `.git/info/exclude`; confirm `git status --porcelain` lists only `docs/`; create the root commit `git commit --allow-empty -m "chore: repository root"` (with the trailer). Run git commands with `dangerouslyDisableSandbox: true` (the sandbox can serve a stale `.git/` view).

- [ ] **Step 2: Gate — show the batch and wait for one approval.** Per `github-new-repo` step 2, in one message: slug `jhoblitt/tmelevation`; `--public`; `templates/ruleset.json` verbatim; the merge-setting line (below); Pages + environment policy calls (below); branch `init` onto `main`; the PR title `feat: TrackMan tour averages at elevation` and a ≤ 100-word description. The description's motivation must come from the user — ask for it in this gate if it has not been given. Nothing in Step 3 runs before approval.

- [ ] **Step 3: Execute, stopping at the first failure** (all `gh` calls with `dangerouslyDisableSandbox: true`):
  1. `gh repo create jhoblitt/tmelevation --public`
  2. `gh api -X POST repos/jhoblitt/tmelevation/rulesets --input <canon>/templates/ruleset.json`
  3. `gh repo edit jhoblitt/tmelevation --delete-branch-on-merge --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false` (check the flag names with `gh repo edit --help` first)
  4. `git remote add origin` using the URL form of the user's other clones (`git -C /home/jhoblitt/github/conventions-claude remote get-url origin`), then `git push origin main`
  5. Pages: `gh api -X POST repos/jhoblitt/tmelevation/pages -f build_type=workflow`
  6. Environment: enabling Pages already creates `github-pages` with a `main` branch policy. `GET …/environments/github-pages` and `GET …/environments/github-pages/deployment-branch-policies` first; ensure `custom_branch_policies: true` (`PUT …/environments/github-pages` with `{"deployment_branch_policy":{"protected_branches":false,"custom_branch_policies":true}}` only if needed); then `POST …/deployment-branch-policies` only for what is missing — `{"name":"main","type":"branch"}`, `{"name":"v*","type":"tag"}` (a duplicate POST answers 303). Confirm the request shapes against the current REST docs before running.

- [ ] **Step 4: Verify the settings.** Expected: `gh repo view --json visibility` → `PUBLIC`; one ruleset with rules `deletion`, `non_fast_forward`; `gh api repos/jhoblitt/tmelevation --jq '{allow_merge_commit,allow_squash_merge,allow_rebase_merge,delete_branch_on_merge}'` → `true,false,false,true`; `gh api repos/jhoblitt/tmelevation/pages --jq .build_type` → `workflow`; the environment lists both policies.

- [ ] **Step 5: Enter the worktree.** `EnterWorktree` with name `init` (branches from `origin/main`). A clone initialised this session may lack `origin/HEAD`: if `EnterWorktree` cannot resolve the upstream default branch, run `git remote set-head origin --auto` and retry; only if it is unavailable fall back to `git worktree add` off `origin/main` (CLAUDE.md). Move — not copy — `docs/research`, `docs/reviews` and `docs/superpowers` from the main clone into the worktree's `docs/`, so the main clone is left with nothing untracked.

- [ ] **Step 6: Land the canon files** per `references/new-repo.md` "What lands where", placeholders filled per `references/workflows.md`: `{{OWNER}}` jhoblitt, `{{REPO}}` tmelevation, `{{CI_WORKFLOW}}` ci, `{{DESCRIPTION}}` one paragraph (TrackMan 2023 tour averages recomputed at elevation, with cited physics), `{{INSTALL}}` "Nothing to install: the site is https://jhoblitt.github.io/tmelevation/", `{{USAGE}}` one sentence (move the slider or type an elevation or course pressure), `{{CODEQL_LANGUAGES}}` `javascript-typescript`, `{{CODEQL_BUILD_MODE}}` `none`. Then `GITHUB_TOKEN=$(gh auth token) pinact run` and `actionlint .github/workflows/*.yml` — both clean.

- [ ] **Step 7: Commit as a logical series** (with the trailer):
  - `docs: add design spec, research, reviews and implementation plan` — `docs/`
  - `chore: add license, readme and dependabot configuration`
  - `ci: add workflow lint, CodeQL, dependency review, Scorecard and commitlint`

---

### Task 2: Project skeleton, source data and units

Spec: §3, §5.1 (units), §7, §8.1.

**Files:**
- Create: `package.json`, `.nvmrc`, `site/js/data.js`, `site/js/units.js`
- Test: `test/unit/data.test.js`, `test/unit/units.test.js`

**Interfaces:**
- Produces (`data.js`):
  ```js
  export const SOURCE_URL = 'https://www.trackman.com/blog/introducing-updated-tour-averages';
  export const TOURS; // [{ id: 'pga', label: 'PGA TOUR', title: 'PGA TOUR AVERAGES', year: 2023, rows: Row[] },
                      //  { id: 'lpga', label: 'LPGA TOUR', title: 'LPGA TOUR AVERAGES', year: 2023, rows: Row[] }]
  // Row = { club: 'Driver', clubSpeed: 115, attack: -0.9, ballSpeed: 171, smash: 1.49, launch: 10.4,
  //         spin: 2545, maxHeight: { yd: 35, m: 32 }, land: 39, carry: { yd: 282, m: 258 } }
  ```
- Produces (`units.js`): `M_PER_FT = 0.3048`, `M_PER_YD = 0.9144`, `MPS_PER_MPH = 0.44704`, `PA_PER = { inHg: 3386.389, kPa: 1000, mbar: 100 }`, `M_PER = { ft: 0.3048, m: 1 }`, `rpmToRadPerS(rpm)`, `degToRad(d)`, `radToDeg(r)`.

**Behaviour:** `data.js` opens with a comment block stating that the figures are TrackMan's 2023 Tour Averages, reproduced with attribution from `SOURCE_URL`, and are not covered by the repository's Apache-2.0 licence. Rows are in TrackMan's order; numbers are stored as published, both units, never derived from each other. `package.json`: `{"name":"tmelevation","private":true,"type":"module","scripts":{"test":"node --test \"test/unit/*.test.js\""}}` (later tasks add `oracles` and `test:browser`).

- [ ] **Step 1: Write the failing tests.**
  - `data.test.js`: parse the two markdown tables in `docs/research/trackman-2023-tour-averages.md` and assert `TOURS` matches them cell for cell (that file was verified twice against TrackMan's images). Also: PGA has 12 rows Driver…PW, LPGA 11 with no `3 Iron`; PGA 4 Iron carry is `{ yd: 209, m: 192 }`; the source file of `data.js` contains the licence notice and `SOURCE_URL`.
  - `units.test.js`: `rpmToRadPerS(2545)` = 266.51178 (±1e-5); `3386.389 Pa` per inHg; `5280 * M_PER_FT` = 1609.344; `M_PER_YD` 0.9144; `MPS_PER_MPH` 0.44704; deg/rad round-trip.
- [ ] **Step 2: Run** `npm test` — expected FAIL: modules not found.
- [ ] **Step 3: Implement** `package.json`, `.nvmrc` (`24`), `data.js`, `units.js`.
- [ ] **Step 4: Run** `npm test` — expected PASS.
- [ ] **Step 5: Commit** `feat: add TrackMan 2023 tour-average data and unit conversions`.

---

### Task 3: Atmosphere

Spec: §5.1, §4.2 (range).

**Files:**
- Create: `site/js/atmosphere.js`
- Test: `test/unit/atmosphere.test.js`

**Interfaces:**
- Consumes: `units.js`.
- Produces:
  ```js
  export const P0_PA = 101325;
  export const T_REF_K = 298.15;
  export const RHO0;                 // P0·M/(R*·T_REF) ≈ 1.18391 kg/m³
  export const MAX_ELEVATION_M = 4572;   // 15,000 ft
  export const MIN_PRESSURE_PA;      // pressureAtElevation(MAX_ELEVATION_M) ≈ 57206.8
  export function pressureAtElevation(zMeters) → number   // Pa
  export function elevationAtPressure(pa) → number        // m
  export function densityRatio(pa) → number               // pa / P0_PA (dry air, constant T)
  ```

**Behaviour:** USSA 1976 troposphere with geometric → geopotential conversion (spec §5.1). Derive the exponent g₀M/(R*L) (= 5.255876…) and the lapse factor L/T₀ from the constants in code, and use the same derived values in both directions — the spec's printed roundings (5.255876, 0.190263, 2.25577×10⁻⁵) are for reading, and mixing them breaks the round trip by millimetres. The ISA temperature T₀ = 288.15 K belongs only to the pressure formula; density uses T_ref = 298.15 K and cancels in the ratio.

- [ ] **Step 1: Write the failing tests.**
  - USSA 1976 table values (pressure column is truncated, so assert `table ≤ computed/100 < table + 0.01`): Z = 0 m → 1013.25; 1000 → 898.76; 1584.96 → 836.82; 1600 → 835.27; 1615.44 → 833.69; 2000 → 795.01; 3000 → 701.21; 4500 → 577.52 hPa.
  - 5,280 ft (1609.344 m) → 834.318 hPa (±0.001).
  - `densityRatio(pressureAtElevation(ft·0.3048))` for 5,000 / 10,000 / 15,000 ft = 0.832085 / 0.687832 / 0.564587 (±1e-6).
  - `RHO0` = 1.18391 (±1e-5); `MIN_PRESSURE_PA` = 57206.8 (±0.1).
  - Inverse: `elevationAtPressure(pressureAtElevation(z))` = z (±1e-6 m) for z in 0, 1, 500, 1609.344, 3048, 4572.
- [ ] **Step 2: Run** — expected FAIL: module not found.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat: add standard-atmosphere elevation and pressure conversion`.

---

### Task 4: Ball-flight model

Spec: §5.2, §5.6.

**Files:**
- Create: `site/js/flight.js`
- Test: `test/unit/flight.test.js`

**Interfaces:**
- Consumes: `units.js`, `atmosphere.js` (`RHO0`).
- Produces:
  ```js
  export const BALL_MASS_KG = 0.04593, BALL_DIAMETER_M = 0.04267, G = 9.80665,
               LAMBDA0 = 2e-5, DT_S = 0.05, MAX_FLIGHT_S = 60;
  export function launchFrom({ ballSpeedMph, launchDeg, spinRpm }) → Launch   // { speedMps, angleRad, spinRadS }
  export function spinParameter(spinRadS, airSpeedMps) → number               // r·ω/U
  export function fly(launch, { kD = 1, kL = 1 } = {}, { rhoRatio = 1, windMps = 0 } = {}, { dt = DT_S } = {}) → FlightResult
  // FlightResult = { ok: true, carryM, maxHeightM, landRad, landSpinRadS, airPathM, timeS, steps }
  //              | { ok: false, reason: 'nonfinite' | 'cap', steps }
  ```
  `windMps` is the along-track horizontal air velocity (positive = tailwind); it enters only the air-relative velocity `u = v − w`; position integrates ground velocity. `airPathM` = ∫|u| dt, integrated as a sixth RK4 state and interpolated at landing like x (it lets a test check spin decay against the closed form).

**Behaviour:** Spec §5.2 equations with C_D = k_D(0.24 + 0.18S), C_L = k_L·0.54·S^0.4, spin decay dω/dt = −λ₀(ρ/ρ₀)Uω/r, ρ = rhoRatio·RHO0. Fixed-step RK4 on (x, y, vₓ, v_y, ω). Apex: the step where v_y goes from + to −; t* by linear interpolation of v_y; y(t*) by cubic Hermite on (y, v_y). Landing: the first step after launch where y < 0 with v_y < 0; solve the Hermite cubic y(t) = 0 by up to 3 Newton iterations from the linear guess; x(t*) by Hermite on (x, vₓ); vₓ, v_y, ω linear at t*; land angle atan2(−v_y, vₓ). Any non-finite state value → `{ ok: false, reason: 'nonfinite' }`; simulated time beyond 60 s (1,200 steps) without landing → `{ ok: false, reason: 'cap' }`. Never throws for numeric input.

- [ ] **Step 1: Write the failing tests.**
  - Vacuum (`kD: 0, kL: 0`), speed 50 m/s, 30°: carry 220.775036 m, max height 31.866132 m, land angle 30° (all ±1e-6).
  - Wind has no effect on the trajectory in vacuum: same vacuum shot with `windMps: 10` → identical carry, max height and land angle (spin and air path differ, by design).
  - Zero spin ⇒ zero lift: PGA Driver launch with spin 0 gives identical results for `kL: 1` and `kL: 5`.
  - `spinParameter(rpmToRadPerS(2545), 171·0.44704)` = 0.07438 (±1e-5).
  - dt convergence: PGA Driver launch (`launchFrom` of the table row), `kD = kL = 1`, sea level: |fly(dt 0.05) − fly(dt 0.025)| < 0.001 yd in carry and max height, < 0.01° in land angle.
  - Spin decay follows the law: for the PGA Driver at rhoRatio 1 and 0.5, `ln(ω₀/landSpin) = LAMBDA0·rhoRatio·airPathM / r` (relative error < 1e-5), and landing spin is higher at 0.5.
  - Tailwind 4.4704 m/s (10 mph) lengthens the PGA Driver carry and headwind shortens it.
  - Failures: `rhoRatio: NaN` → `{ ok: false, reason: 'nonfinite' }`; a vacuum lob that cannot land within 60 s (1,000 mph at 60°, `kD: 0, kL: 0`, `rhoRatio: 0`) → `{ ok: false, reason: 'cap' }` with `steps ≤ 1201`; neither throws.
  - Step counts: the PGA Driver at rhoRatio 1 and 0.564587 each takes ≤ 160 steps.
- [ ] **Step 2: Run** — expected FAIL: module not found.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat: add golf-ball flight model`.

---

### Task 5: Calibration

Spec: §5.3.

**Files:**
- Create: `site/js/calibrate.js`
- Test: `test/unit/calibrate.test.js`

**Interfaces:**
- Consumes: `fly`, `launchFrom` (Task 4), `RHO0` (Task 3).
- Produces:
  ```js
  export const MAX_ITERATIONS = 20;
  export function calibrate(launch, { carryM, maxHeightM }) → Calibration
  // Calibration = { ok: true, kD, kL, iterations, steps, sea: FlightResult }
  //             | { ok: false, reason: 'diverged' | 'flight', iterations, steps }
  ```

**Behaviour:** Damped Newton on F(k_D, k_L) = (carry − target, maxHeight − target) at rhoRatio 1, starting at (1, 1). Jacobian by forward differences with relative step 1e-4. Each step is halved (up to 8 times) until the residual norm decreases and both factors stay positive; if all 8 halvings fail, stop with `reason: 'diverged'`. Converged when both residuals are below 1e-4 m. A failed flight → `reason: 'flight'`; no convergence within 20 iterations → `reason: 'diverged'`. `steps` totals every RK4 step taken, including Jacobian probes. Deterministic: identical inputs give bit-identical outputs.

- [ ] **Step 1: Write the failing tests.**
  - All 23 rows (targets = published yards × 0.9144): `ok`, |carry − target| ≤ 0.01 yd, |max height − target| ≤ 0.01 yd, `iterations ≤ 20`.
  - Envelope with 10 % margin: `RHO0·kD` in [0.981, 1.650], `RHO0·kL` in [0.864, 1.463] for every row.
  - PGA Driver: `RHO0·kD` = 1.0893 ± 0.002, `RHO0·kL` = 0.9912 ± 0.002; landing spin / launch spin = 0.777 ± 0.005.
  - LPGA 3-wood (2595 rpm) converges.
  - Unreachable target (carry 1000 yd, max height 1 yd on the PGA Driver launch) → `{ ok: false }` without throwing, `iterations ≤ 20`.
  - Calling twice with the same input returns identical `kD`, `kL` (`Object.is`; within one engine — Node and Chrome may differ in the last bit).
- [ ] **Step 2: Run** — expected FAIL: module not found.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat: add per-row drag and lift calibration`.

---

### Task 6: Calibrated model, golden values and budgets

Spec: §5.3, §5.4, §5.6, §8.1 (golden, model, budget).

**Files:**
- Create: `site/js/model.js`
- Test: `test/unit/model.test.js`, `test/unit/golden.test.js`

**Interfaces:**
- Consumes: `TOURS` (2), `M_PER_YD`, `radToDeg` (2), `fly`, `launchFrom` (4), `calibrate` (5).
- Produces:
  ```js
  export function launchOfRow(row) → Launch          // launchFrom({ ballSpeedMph: row.ballSpeed, launchDeg: row.launch, spinRpm: row.spin })
  export function calibrateRow(row) → Calibration    // targets row.carry.yd and row.maxHeight.yd in metres
  export function rowDelta(cal, row, rhoRatio) → Delta
  // Delta = { ok: true, carryYd, maxHeightYd, landDeg, steps } | { ok: false, reason, steps }
  // rhoRatio === 1 → { ok: true, carryYd: 0, maxHeightYd: 0, landDeg: 0, steps: 0 } without flying
  export function createModel(tours = TOURS) → Model
  // Model = {
  //   entries: Array<{ key: 'pga:0', tourId, index, row, status: 'pending'|'ready'|'failed', cal }>,
  //   calibrateNext() → boolean,       // calibrates the next pending entry; false when none remain
  //   isComplete() → boolean,
  //   deltasAt(rhoRatio) → Map<key, { status, delta: Delta | null }>,   // memoised per entry and rhoRatio
  //   stepsUsed() → number              // all RK4 steps so far (calibration + deltas)
  // }
  ```

**Behaviour:** Δ = model(r) − model(1) using the cached sea-level flight in `cal.sea`; carry and max height in yards, land angle in degrees. Entries calibrate in order — PGA rows, then LPGA rows. A failed calibration or a failed altitude flight marks only that entry (`status: 'failed'` / `delta.ok === false`); other entries are unaffected. `deltasAt` returns `delta: null` for pending entries. The memo is per entry: an entry that becomes ready after an earlier `deltasAt(r)` gets its Δ on the next `deltasAt(r)` — the whole map is never cached as one value (that would freeze `…` cells, RF-1).

- [ ] **Step 1: Write the failing tests.**
  - `golden.test.js` — calibrate, then Δ at 5,000 and 10,000 ft (pressure via `pressureAtElevation`, ratio via `densityRatio`), tolerance 0.05 yd / 0.05°:

    | Row | 5,000 ft ΔC / ΔH / ΔL | 10,000 ft ΔC / ΔH / ΔL |
    |---|---|---|
    | PGA Driver | +17.28 / −3.44 / −5.07 | +29.58 / −7.05 / −10.12 |
    | PGA 7 Iron | +15.88 / −2.17 / −4.10 | +29.24 / −4.74 / −8.72 |
    | PGA PW | +12.02 / −1.09 / −3.35 | +22.48 / −2.41 / −6.90 |
    | LPGA Driver | +9.62 / −2.34 / −4.48 | +15.52 / −4.62 / −8.59 |
    | LPGA 3-wood | +10.26 / −2.60 / −4.97 | +16.55 / −5.22 / −9.78 |

  - `model.test.js`:
    - `rowDelta(cal, row, 1)` is exactly zero in all three quantities for every row.
    - Monotonic from 0 to 10,000 ft in 250 ft steps, every row: carry Δ non-decreasing, max-height Δ and land Δ non-increasing.
    - Incremental order: after one `calibrateNext()` exactly `pga:0` is non-pending; after 23 calls `isComplete()` and the 24th returns `false`.
    - Failure isolation: `createModel([{ id: 'x', rows: [badRow, goodRow] }])` where `badRow` has `ballSpeed: NaN` → `x:0` failed, `x:1` ready, `deltasAt(0.8)` returns a valid Δ for `x:1`.
    - Budgets: calibrating all 23 rows uses ≤ 50,000 steps (measured 29,291); one `deltasAt(0.564587)` adds ≤ 4,000 (measured ≤ 2,736); a repeated `deltasAt` with the same ratio adds 0.
    - Memo freshness: with only `pga:0` calibrated, `deltasAt(0.8)` reports `pga:1` pending; after `calibrateNext()`, `deltasAt(0.8)` reports `pga:1` ready with a Δ.
- [ ] **Step 2: Run** — expected FAIL: module not found.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS. If a golden value misses, do not edit the table: find the defect (unit slips in S, spin decay scaling, density) — the values come from an independent implementation of the same spec.
- [ ] **Step 5: Commit** `feat: add calibrated per-row model with golden regression tests`.

---

### Task 7: Reference oracles and the soft-oracle report

Spec: §8.3, §6 item 6, §9.1.

**Files:**
- Create: `site/js/oracles.js`, `scripts/oracle-report.mjs`
- Modify: `package.json` (script `"oracles": "node scripts/oracle-report.mjs"`)
- Test: `test/unit/oracles.test.js`

**Interfaces:**
- Consumes: `createModel`, `rowDelta`, `calibrate`, `fly`, `launchFrom`, `pressureAtElevation`, `densityRatio`, `TOURS`.
- Produces:
  ```js
  export const ORACLES;  // Array<Oracle>
  // Oracle = { id: '1' | '8a' | '10b' | '12-pga-hw20' …, kind: 'hard' | 'soft', title, measures,
  //            condition, expected, band: { min, max, unit: '%' | 'deg' | 'yd' } | null,
  //            sources: Array<{ label, url, note }>,   // one or more
  //            evaluate(ctx, opts?) → { value: number | boolean, display: string, pass: boolean } }
  export function createOracleContext(model = null) → ctx   // reuses a calibrated Model when given (methods page), else builds one
  export function evaluateOracles(ctx, { gridFt } = {}) → Array<{ oracle, value, display, pass }>
  export function formatAnnotation(result) → string   // '::warning title=Soft oracle <id>::<title>: <display> outside <band>' — or '… <display>, expected <expected>' when band is null; '%' escaped as '%25' per the workflow-command rules
  ```

**Behaviour:** One entry per row of spec §8.3, split where a row has parts: 1, 2, 3 (hard); 4, 5 (soft); 6 (hard); 7 (soft); 8a, 8b (soft); 9a (hard: every row, 0 → 10,000 ft, `gridFt` default 250, carry ↑ / max height ↓ / land ↓); 9b (soft: 10,000 → 15,000 ft, `gridFt` default 10, displayed carry yards `round(pub + Δ)` never decreases); 10a, 10b (hard); 11 (soft); and eight soft wind entries `12-{pga,lpga}-{hw,tw}{10,20}`, each passing only when carry is within ±5 yd and land angle within ±3° of TrackMan.
- Percent gains are Δ/published × 100 for the named row; oracle 5 is the mean of the 12 PGA rows' carry percent gains at 7,200 ft; oracle 7 and 11 values are booleans.
- Oracles 10/12 calibrate `launchFrom` of TrackMan's 2014 "Calm" 6-iron shot to its published carry and max height (PGA 130 mph / 14.7° / 6088 rpm → 184 yd / 33.8 yd, land 48.0°; LPGA 110 / 18.6° / 5950 → 152 / 27.7 yd, land 45.6°), then fly at sea level with `windMps` = ±10 or ±20 mph × 0.44704 (headwind negative). TrackMan values (carry yd / max height yd / land °): PGA HW10 166 / 38.1 / 58.1, HW20 143 / 42.8 / 69.5, TW10 198 / 29.7 / 39.5, TW20 207 / 26.1 / 32.7; LPGA HW10 139 / 31.3 / 55.6, HW20 121 / 35.3 / 67.4, TW10 161 / 24.5 / 37.7, TW20 167 / 21.7 / 31.7.
- `sources`: copy each label, URL and caveat from `docs/research/reference-data.md` ("Sources") as corrected by `docs/reviews/spec-2026-10-08/claims.md` (C3, C4, C7, C8, C14, C15). TrackMan 2014 post: https://www.trackman.com/blog/golf/normalization-feature-explained.
- `oracle-report.mjs` prints one line per oracle (id, kind, value, band, PASS / FAIL / WARN); when `GITHUB_ACTIONS === 'true'` it also prints `formatAnnotation` for each failing soft oracle; exit status 1 only if a hard oracle fails.

- [ ] **Step 1: Write the failing tests.**
  - Every hard oracle passes. Reviewer-measured values for orientation (not asserted): 1 ≈ +8.8 %, 2 ≈ −15.6 %, 3 ≈ −7.9°, 6 ≈ +11.3 %, 10a land ≈ 46.2°, 10b ≈ 44.5°.
  - Every soft oracle evaluates to a finite number or a boolean without throwing.
  - `formatAnnotation` of a synthetic failing soft result produces exactly `::warning title=Soft oracle 4::<title>: +9.0%25 outside +3.5%25…+8.5%25` (take `<title>` from the oracle definition); a null-band result reads `…, expected <expected>`.
  - `ORACLES` ids are unique; every entry has at least one source with a non-empty URL.
  - `createOracleContext(model)` with an already calibrated model performs no further row calibrations (its `stepsUsed()` grows only by oracle flights).
- [ ] **Step 2: Run** — expected FAIL: module not found.
- [ ] **Step 3: Implement** `oracles.js`, `oracle-report.mjs`, the `package.json` script.
- [ ] **Step 4: Run** `npm test` and `npm run oracles` — expected PASS; the report lists every oracle.
- [ ] **Step 5: Commit** `feat: add reference oracles shared by tests and the methods page`.

---

### Task 8: Cell presentation

Spec: §4.3, §5.4.

**Files:**
- Create: `site/js/present.js`
- Test: `test/unit/present.test.js`

**Interfaces:**
- Consumes: `M_PER_YD` (2); the Δ shape from Task 6.
- Produces:
  ```js
  export const MINUS = '−', ELLIPSIS = '…', EM_DASH = '—';
  export function launchCells(row) → { clubSpeed, attack, ballSpeed, smash, launch, spin }   // strings as TrackMan prints them
  export function distanceCell({ yd, m }, dYd, opts) → Cell
  export function angleCell(deg, dDeg, opts) → Cell
  export function rowStatus(entryStatus, delta) → 'pending' | 'ready' | 'failed'   // entry 'pending' → pending; entry 'failed' or delta.ok === false → failed; else ready
  // opts = { mode: 'abs' | 'pct', showDelta: boolean, status: 'ready' | 'pending' | 'failed', label: 'carry' | 'max height' | 'land angle' }
  // Cell = { value: string, delta: string, deltaHidden: boolean, a11y: string }
  ```

**Behaviour:**
- `launchCells`: club and ball speed and spin as integers; attack and launch with one decimal and `°` (`-0.9°`, `14.0°`, `2.8°`); smash with two decimals (`1.30`).
- `showDelta: false` (displayed elevation 0) → published value, `delta: ''`, `deltaHidden: true`, `a11y: ''`.
- `status: 'pending'` → published value, delta `…`, a11y "calculating"; `'failed'` → published value, delta `—`, a11y "model unavailable for this row".
- Ready, distance: value `${round(yd + dYd)}/${round(m + dYd·0.9144)}`; absolute delta per unit = displayed − published, formatted `+n`, `−n` (U+2212) or `±0`, joined with `/` (`+8/+7`, `+1/±0`, `±0/±0`).
- Ready, angle: value `${round(deg + dDeg)}°`; absolute delta `+n°`, `−n°`, `±0°`.
- Percent: p = Δ / published × 100 (yards for distance cells); rounded half away from zero to one decimal; 0.0 → `±0.0%`; otherwise sign + `abs.toFixed(1)` + `%`. `−0.0%` never appears.
- Rounding of values is half away from zero (all published values are positive, so `Math.round` of a positive number is acceptable; deltas use the symmetric rule).
- a11y (absolute): "plus 8 yards, plus 7 metres versus sea level"; singulars "1 yard", "1 metre", "1 degree"; a zero part reads "no change in yards" etc.; all-zero reads "no change versus sea level". Percent: "plus 4.9 percent versus sea level" / "no change versus sea level".

- [ ] **Step 1: Write the failing tests.**
  - Sea level: for every row of both tours, `distanceCell(row.carry, 0, {showDelta: false,…}).value` = `${yd}/${m}` (includes `209/192`, `111/101`); land `39°`; `launchCells` reproduces the transcription strings (`-0.9°`, `10.4°`, `14.0°`, `20.0°`, `1.30`, `2545`).
  - PGA 8 Iron carry `{164, 150}`, dYd 7.6 → value `172/157`, delta `+8/+7`, a11y `plus 8 yards, plus 7 metres versus sea level`.
  - Max height `{33, 30}`, dYd −1.1 → `32/29`, `−1/−1`.
  - `{209, 192}`, dYd 0.5 → `210/192`, `+1/±0`.
  - dYd 0.3 on `{164,150}` → `164/150`, `±0/±0`, a11y `no change versus sea level`.
  - Angle 51°, dDeg −4.1 → `47°`, `−4°`; dDeg 0.4 → `51°`, `±0°`.
  - Percent: `{164,150}`, dYd 8.036 → `+4.9%`; dYd −0.04 → `±0.0%`; angle 39°, dDeg −3.78 → `−9.7%`; −1.25 % → `−1.3%`.
  - Pending → published value + `…`; failed → published value + `—`.
  - `rowStatus('pending', null)` → pending; `rowStatus('ready', { ok: false })` → failed; `rowStatus('failed', null)` → failed; `rowStatus('ready', { ok: true, … })` → ready.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat: add table-cell presentation for values and deltas`.

---

### Task 9: Linked-control state

Spec: §4.1 (defaults, readout), §4.2.

**Files:**
- Create: `site/js/controls.js`
- Test: `test/unit/controls.test.js`

**Interfaces:**
- Consumes: `PA_PER`, `M_PER` (2); `P0_PA`, `MIN_PRESSURE_PA`, `MAX_ELEVATION_M`, `pressureAtElevation`, `elevationAtPressure`, `densityRatio` (3).
- Produces (pure; every function returns a new state):
  ```js
  export function parseNumber(text) → number | null
  export function initialState() → State   // { pa: P0_PA, elevUnit: 'ft', pressUnit: 'inHg', mode: 'abs', edit: null }
  // edit = { field: 'elev' | 'press', text, valid } while a box is being typed in
  export function view(state) → {
    elevText, pressText, elevInvalid, pressInvalid,
    slider: { min, max, step, value, valueText },
    readout, atSeaLevel, rhoRatio, captionText }
  export function inputElevation(state, text), commitElevation(state),
               inputPressure(state, text),  commitPressure(state),
               inputSlider(state, value), setElevationUnit(state, unit),
               setPressureUnit(state, unit), setMode(state, mode)
  ```

**Behaviour:**
- `parseNumber` grammar: optional surrounding spaces; optional leading `-`; digits, where a `,` followed by exactly three digits is a thousands separator; then optionally one decimal separator (`.`, or a single `,` not followed by exactly three digits) and digits. Anything else → `null`. `Infinity`, exponents, `+`, Unicode minus → `null`.
- Live input: parsed and in range → `pa` follows, `edit.valid = true`; otherwise `pa` unchanged, `edit.valid = false`. "In range" includes values within half a display step outside a limit, which are clamped (so the boundary text the box itself shows — `16.89` inHg, `101.33` kPa, `1,013.3` mbar, `15,000` ft — is accepted while typing).
- Commit: no `edit` (box not edited) → state unchanged; valid → `edit` cleared; parsed but out of range → clamp to the range; unparseable → `edit` cleared (box reverts).
- `inputSlider` and either unit change clear a pending `edit` in the affected box; unit changes never change `pa`.
- `view`: the box being edited shows `edit.text` verbatim; otherwise elevation is a grouped integer in its unit (`5,280`, `1,609`), pressure has inHg/kPa 2 and mbar 1 decimals, grouped (`1,013.3`). `slider` = ft: 0–15,000 step 10; m: 0–4,572 step 5; `valueText` `5,280 feet` / `1,609 metres`. `readout` `5,280 ft · 24.64 inHg`. `atSeaLevel` is true exactly when the displayed elevation integer is 0. `captionText` `at 5,280 ft · 24.64 inHg` (empty at sea level). `rhoRatio` = `densityRatio(pa)`.

- [ ] **Step 1: Write the failing tests.**
  - `parseNumber`: `'5280'`→5280; `'5,280'`→5280; `'84,3'`→84.3; `' 29.92 '`→29.92; `'1,013.2'`→1013.2; `'1,013'`→1013; `'5,2'`→5.2; `'84.'`→84; `'-5'`→−5; `''`, `'-'`, `'abc'`, `'12a'`, `'1,2,3'`, `'1e5'`, `'Infinity'`, `'−5'` → `null`.
  - `view(initialState())`: elevText `0`, pressText `29.92`, atSeaLevel `true`, readout `0 ft · 29.92 inHg`, captionText `''`.
  - `inputElevation(s, '5280')`: pressText `24.64`; with kPa `83.43`; with mbar `834.3`; slider value 5280, valueText `5,280 feet`; rhoRatio 0.823408 (±1e-6).
  - Views agree: for 0, 1000, 5280, 10000, 15000 ft set via the slider, switching units in either box never changes `pa` (`Object.is`).
  - Round trip: typing the displayed pressure text back and committing moves the displayed elevation by ≤ 15 ft.
  - `inputElevation(s, '150000')` → `pa` unchanged, elevInvalid; `commitElevation` → elevation 15,000 ft, `pa` = `MIN_PRESSURE_PA`.
  - `inputPressure(s, '30.10')` (inHg, above sea level) → unchanged; commit → `pa` = P0, atSeaLevel.
  - Empty and garbage input → invalid, `pa` unchanged; commit reverts the text.
  - Unedited commit after a unit switch leaves `pa` bit-identical (no drift through rounded text).
  - **RF-2:** `inputElevation(s, 'abc')` then `setElevationUnit(s, 'm')` → elevInvalid `false`, elevText is the state in metres, `pa` unchanged.
  - Metres slider: `setElevationUnit(s, 'm')`, `inputSlider(s, 1610)` (a value a step-5 slider can produce) → elevText `1,610`, slider max 4572, step 5, valueText `1,610 metres`.
  - Boundary text accepted live: `inputPressure(s, '16.89')` (inHg) → valid, `pa` = `MIN_PRESSURE_PA`; `inputPressure(s, '29.92')` → valid, elevation `1` ft (not sea level); kPa `101.33` → valid, `pa` = P0.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat: add linked elevation and pressure control state`.

---

### Task 10: Main page

Spec: §4 (all), §5.4 (paint first, incremental calibration), §5.6, §7 (CSP, `textContent`, preload).

**Files:**
- Create: `site/index.html`, `site/css/style.css`, `site/favicon.svg`, `site/js/app.js`, `site/js/boot.js`, `site/js/version.js`, `site/fonts/` (`oswald-latin.woff2`, `lato-400-latin.woff2`, `lato-700-latin.woff2`, `OFL-Oswald.txt`, `OFL-Lato.txt`, `SOURCES.md`)
- Test: `test/unit/static.test.js` (CSP, forbidden APIs, preload graph, fonts)

**Interfaces:**
- Consumes: everything in Tasks 2–9. `version.js` exports `VERSION = 'dev'`.
- Produces: DOM contract used by Task 12's browser tests — `<html data-state="loading|ready|error">` and `data-app="started"` (set by the first line `app.js` executes); ids `controls` (the whole control bar), `pinned` (the row pinned on phones), `elev`, `elev-unit`, `press`, `press-unit`, `slider`, `mode-abs`, `mode-pct`, `readout`, `methods-link`, `load-error`, `version`, `land-dagger`, `land-footnote`; one `<section data-tour="pga|lpga">` per tour containing `.caption`, a `.scroller` (`role="region"`, `tabindex="0"`, `aria-label`) and the table; each recomputed cell has `data-col="maxHeight|land|carry"` and `data-key="pga:0"`, with children `.v` (value), `.d` (delta) and `.sr` (visually hidden accessible text).

**Behaviour:**
- **Head:** charset; `viewport` `width=device-width, initial-scale=1, viewport-fit=cover`; the CSP meta (Global Constraints); title "TrackMan Tour Averages at Elevation"; meta description; `<link rel="icon" href="favicon.svg">` (prevents a 404 on `/favicon.ico`); stylesheet; `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the three fonts; `<link rel="modulepreload">` for every module in `app.js`'s import graph; `<script src="js/boot.js" defer>` then `<script type="module" src="js/app.js" id="app-module">`.
- **Load-failure handling (RF-5):** `<noscript>` explains that JavaScript is needed and links to TrackMan's post. `#load-error` (hidden by default) says the calculator did not load and links to TrackMan's post. `boot.js` (classic script, runs before the module) shows `#load-error` and sets `data-state="error"` when (a) `error` fires on `#app-module` (a module in the graph failed to fetch), (b) a `window` `error` fires before `data-app="started"` (a syntax or missing-export error in the graph), or (c) 10 s pass without `data-app="started"`. The watchdog checks that `app.js` *started*, not that calibration finished, because a background tab throttles timers. `app.js` sets `data-state="error"` and unhides `#load-error` from `window` `error` / `unhandledrejection` handlers and when any row fails (calibration, or an altitude flight via `rowStatus`).
- **Controls (§4.1):** DOM order = Tab order: elevation box, its unit select, pressure box (label "Air pressure at the course (absolute)", hint text below it), its unit select, methods link, slider, readout, Δ toggle (`Δ` / `Δ %`, two buttons with `aria-pressed`). Desktop (≥ 768 px): one sticky row. Narrow (< 768 px): the boxes, selects, hint and link scroll away; the slider, readout and toggle form a pinned row ≤ 64 px tall. Inputs `type="text"`, `inputmode="decimal"`, font size ≥ 16 px; `autocomplete="off"` on both text boxes, both selects and the slider (so a non-bfcache back navigation cannot restore stale control values); slider and buttons ≥ 44 px tall; slider `aria-valuetext` from `view().slider.valueText`; the Δ buttons sit in a `role="group"` labelled "Show change as". The pinned row's readout has a fixed width (in `ch`) so the slider's width does not change while dragging; at 320 px all pinned-row children sit on one line.
- **Events:** `input` on a box → `input*`; `blur`, `change`, and Enter → `commit*`; slider `input` → `inputSlider`; selects → `set*Unit`; toggle → `setMode`. Each event updates the state and schedules one render with `requestAnimationFrame` (one pending frame at most). Every `pageshow` (persisted or not) re-renders all controls from the state (spec §4.2 back/forward restore).
- **Render:** controls from `view(state)`; the box with a pending `state.edit` keeps its text (decided by `state.edit`, not by focus — after Enter commits, the still-focused box shows the normalised value); `aria-invalid` on invalid boxes; caption text; for each row and recomputed column, `present.js` (status from `rowStatus`) → `.v`, `.d`, `.sr` via `textContent`; `.d` is `aria-hidden="true"` (the `.sr` text speaks for it) and gets class `hidden` (visibility, keeps its line) when `deltaHidden`. When not at sea level the Land Angle header shows `†`, and a footnote below the tables reads "† Land-angle changes are indicative — see Method & sources." (spec §5.5 item 2).
- **Load sequence:** set `data-app="started"`; render both tables at sea level synchronously from `TOURS`; on narrow screens set each scroller to its right edge after layout; create the model and calibrate in time slices — call `calibrateNext()` repeatedly until about 8 ms have passed, then yield through a `MessageChannel` message (not `setTimeout`, which background tabs throttle to once a second) — rendering after each slice; when complete set `data-state` to `ready`, or `error` if any row failed. A row still pending renders `…`.
- **Scroll position (RF-4):** a scroller counts as "pinned right" until the user scrolls it; on `resize` / `orientationchange` a pinned-right scroller is moved back to its right edge.
- **Layout and style:** spec §4.4 exactly — palette, stripe on odd rows across the full width, translucent column rules, no horizontal rules, two-line cells in every column, pinned Club column with an opaque row-coloured background and its own rule (each `.scroller` is `position: relative` so the visually hidden `.sr` text cannot widen the page), title block ("PGA TOUR AVERAGES" white Oswald 700 caps, "YARDS/METERS" `#3D3B3C`, "2023" Oswald 300 right-aligned; wraps on narrow screens), values white, deltas bold `#262425`, focus outline `3px solid #262425`. Safe-area insets padded.
- **Footer:** "Data: TrackMan 2023 Tour Averages" → `SOURCE_URL`; "Values above sea level are this site's model, not TrackMan's publication. Not affiliated with TrackMan."; "Version " + `VERSION`; "Fonts: Oswald and Lato, SIL Open Font License"; link to https://github.com/jhoblitt/tmelevation.
- **Fonts:** fetch `https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Oswald:wght@300..700&display=swap` with a current Chrome user agent; take the `/* latin */` woff2 URLs (Oswald is one variable file covering 300–700); download unmodified; record file, URL, SHA-256 in `SOURCES.md`; OFL texts from `https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/OFL.txt` and `…/ofl/lato/OFL.txt`. `@font-face` with `font-display: swap`.

- [ ] **Step 1: Write the failing static tests** (`static.test.js`):
  - Each HTML page has exactly one CSP meta whose content equals the Global Constraints string; every `<script>` has a `src` and no body; no `style=` or `on*=` attributes.
  - No file under `site/js/` contains `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval(`, `new Function`, or `setAttribute('style'`.
  - For each HTML page, the set of `modulepreload` hrefs equals the static import graph of its entry module (follow `import … from './x.js'` and `export … from` recursively).
  - Every file listed in `site/fonts/SOURCES.md` exists and matches its SHA-256; every `.woff2` in the directory is listed; both OFL texts exist.
  - `index.html` contains `<noscript>` and `#load-error` (RF-5); the selects and slider carry `autocomplete="off"`.
  - No `import(` and no side-effect-only `import './…'` anywhere under `site/js/`.
- [ ] **Step 2: Run** — expected FAIL: files missing.
- [ ] **Step 3: Implement** the page, styles, fonts, `boot.js`, `app.js`, `version.js`, favicon.
- [ ] **Step 4: Run** `npm test` — expected PASS. Open the page once through a local server (`python3 -m http.server -d site` with `dangerouslyDisableSandbox`) in headless Chrome to confirm it renders; full browser checks come in Task 12.
- [ ] **Step 5: Commit** `feat: add the elevation tables page` (the font files in the same commit).

---

### Task 11: Methods page

Spec: §6, §5.5, §4.4 (contrast note).

**Files:**
- Create: `site/methods.html`, `site/js/methods.js`
- Modify: `site/css/style.css` (methods layout), `test/unit/static.test.js` (MathML Core allow-list)

**Interfaces:**
- Consumes: `createModel` (6), `createOracleContext(model)`, `evaluateOracles`, `ORACLES` (7), atmosphere and flight constants, `SOURCE_URL`, `VERSION`. The page calibrates once (time-sliced, as on the main page) and hands that model to `createOracleContext`.
- Produces: `methods.html` with the same head conventions as `index.html` (CSP, favicon, fonts, `modulepreload`, `boot.js`), `data-state` contract, ids `calibration-table`, `validation-table`.

**Behaviour:** Sections in spec §6 order, single column, wide equations and tables in their own horizontal scrollers on phones. Equations in MathML Core only: the barometric formula, geometric → geopotential conversion and its inverse; ρ/ρ₀ = P/P₀ and ρ₀; the three equations of motion; S, k, A; C_D and C_L; spin decay; displayed = round(published + Δ); percent = Δ/published. Text states: every assumption (calm, sea level, dry air at 25 °C, launch conditions fixed); why a weather report's barometer reading cannot be entered; outputs measured against the launch elevation; the Smits & Smith fit's stated driver-only range; the table's rounding uncertainty (about 1 yd at 10,000 ft); why absolute and percent deltas can disagree near zero; every limitation in spec §5.5 with its numbers; the inherited contrast. **Calibration table** (live): tour, club, k_D, k_L, ρ₀k_D, ρ₀k_L, model sea-level land angle, TrackMan land angle, difference. **Validation table** (live): every oracle — id, kind, what it measures, condition, source link, expected band, model value, PASS / soft-fail — evaluated one oracle per macrotask with `gridFt: 500` for 9a/9b. **Sources** list with read-at-primary / second-hand marks (from `docs/research/*.md` and `docs/reviews/spec-2026-10-08/claims.md`): Penner 2001 (doi:10.1119/1.1344164, open author copy URL), Smits & Smith 1994 (read via US 11,230,375 B1, apparently Mehta & Pallis 2001), USSA 1976 (NASA NTRS), NIST SP 811, each oracle source. Back link to the main page. `data-state="ready"` once both live tables are complete.

- [ ] **Step 1: Write the failing tests:** extend `static.test.js` — `methods.html` passes the CSP, script, attribute and preload checks of Task 10; it has sections with ids `assumptions`, `atmosphere`, `model`, `calibration`, `display`, `validation`, `limitations`, `sources`, in that order; its text contains each of `25 °C`, `dry air`, `barometer`, `launch elevation`, `for driver shots`, `about 1 yd`, `indicative`, `−30 %`, `+25 %`, `contrast`, `Mehta & Pallis`; it contains `<math` elements; every MathML element name is in the MathML Core allow-list (`math, mrow, mi, mn, mo, ms, mtext, mspace, msup, msub, msubsup, mfrac, msqrt, mroot, mover, munder, munderover, mmultiscripts, mprescripts, none, mtable, mtr, mtd, mpadded, mphantom, mstyle, merror, semantics, annotation, annotation-xml`); it links `index.html` and contains the Penner DOI.
- [ ] **Step 2: Run** — expected FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — expected PASS.
- [ ] **Step 5: Commit** `feat: add the methods and sources page`.

---

### Task 12: Deploy artifact, browser smoke and end-to-end tests

Spec: §8.2, §9.3 (artifact), §4.2–§4.4 behaviour in a real browser; Review Focus RF-1…RF-5.

**Files:**
- Create: `scripts/build-artifact.mjs`, `test/browser/serve.mjs`, `test/browser/cdp.mjs`, `test/browser/smoke.mjs`, `test/browser/e2e.mjs`, `test/browser/run.mjs`, `scripts/screenshots.mjs`
- Modify: `package.json` (script `"test:browser": "node test/browser/run.mjs"`)
- Test: `test/unit/artifact.test.js`

**Interfaces:**
- Produces:
  - `node scripts/build-artifact.mjs <version> <outDir>` — `<version>` must match `^v\d+\.\d+\.\d+$` (else exit 2); copies `site/` to `<outDir>`; writes `export const VERSION = '<version>';` to `js/version.js`; appends `?v=<version>` to every relative module specifier in `js/*.js`, every `<script src>`, `<link href>` (stylesheet, preload, modulepreload, icon) in HTML, and every `url(…)` in CSS. Never modifies `site/`.
  - `serve.mjs`: `serve(dir, { fail404 = [], override = {} }) → Promise<{ url, requests: Array<{ path, status }>, close() }>` — 127.0.0.1, ephemeral port, MIME types for html, js (`text/javascript`), css, woff2, svg; paths in `fail404` return 404; `override` maps a path to replacement body text (used to inject a syntax error).
  - `cdp.mjs`: `launch({ extraArgs = [] } = {}) → Promise<Browser>`; `browser.newPage() → Page`; `page.send(method, params)`, `page.on(event, fn)`, `page.goto(url)`, `page.eval(expr)`, `page.emulate({ width, height, mobile, deviceScaleFactor })`, `page.key(key)`, `page.waitFor(expr, timeoutMs)`, `browser.close()`. Uses Node's global `WebSocket`; Chrome from `CHROME_BIN` or `google-chrome`; flags `--headless=new --remote-debugging-port=0 --user-data-dir=<tmp> --no-first-run --no-default-browser-check`, plus `--no-sandbox` only when `CHROME_NO_SANDBOX=1`; reads `DevToolsActivePort` from the profile directory.
  - `smoke.mjs [artifactDir | baseUrl] [--expect-version <v>]` (default expectation: `v0.0.0`) — a directory is served with `serve.mjs` (default: build a `v0.0.0` artifact into `$TMPDIR`); an `https://` base URL is loaded directly (Task 14's live check). Request statuses come from CDP `Network.responseReceived` / `Network.loadingFailed`, so both modes check them the same way. `e2e.mjs`; `run.mjs` (builds `v0.0.0` and `v1.2.3` artifacts, runs smoke on each with the matching `--expect-version`, then e2e; exit status non-zero on any failure).

**Behaviour and test cases:**
- `artifact.test.js` (unit): building `v1.2.3` into a temp dir yields `VERSION = 'v1.2.3'`; every import specifier in the output carries `?v=v1.2.3`; each page's modulepreload hrefs equal the output import URLs exactly (no double fetch); `site/` is byte-identical before and after; `v1.2` is rejected.
- **Smoke** (both pages, desktop 1440×900): `data-state` reaches `ready` within 20 s; every request the page made returned 200; each URL was requested once and, for an artifact, every same-origin js/css/font URL carries `?v=<version>`; no `Runtime.exceptionThrown`; no `Runtime.consoleAPICalled` of level `error` or `warning`; no `Log.entryAdded` with source `security` or level `error` (this is how Chrome reports CSP and Trusted Types violations — their text does not contain "Refused to"), and no warning about a preloaded resource left unused; `index.html` shows PGA Driver carry `282/258`, PGA 4 Iron carry `209/192`, LPGA PW carry `111/101`; `#version` shows the expected version; `methods.html` shows 23 calibration rows and every oracle row.
- **e2e** (emulated 390×844 mobile unless stated):
  - **RF-1:** with CPU throttling at 20× (`Emulation.setCPUThrottlingRate`), right after `data-app="started"`, in one evaluation: record that `data-state` is `loading` and at least one `…` cell exists (the race really happens), then set the slider to 30 values from 0 to 15,000 ft dispatching `input` events, ending at 5,280; wait for `ready`; every recomputed cell's text equals `present.js` applied to `model.js` output computed in Node for 5,280 ft (import the same modules in the test process; compare text, not floats); no errors.
  - **RF-2:** type `abc` in the elevation box, switch the unit to `m`: box shows the state in metres, `aria-invalid` is `false`.
  - **RF-3:** from the top of the page, Tab moves through elevation box → unit → pressure box → unit → methods link → slider → Δ → Δ % in that order, each with a visible outline (computed `outline-style` ≠ `none`); `ArrowRight` on the slider raises the elevation box and readout to `10` ft and the deltas become visible (`±0…` — a 10 ft step moves carry by about 0.04 yd, so values do not change); typing `5280` + Enter in the elevation box shows `5,280` while the box keeps focus, and the PGA Driver carry cell changes from `282/258`; Space on Δ % switches deltas to percent.
  - **RF-4:** at 320×568 after load: `document.documentElement.scrollWidth ≤ document.documentElement.clientWidth` (= 320; do not use `innerWidth`, which emulation widens when the page overflows); `#pinned` height ≤ 64 px and all its children's tops within 2 px of each other (one line); the slider's width is the same (±1 px) at 0 and 15,000 ft; each scroller's `scrollLeft` = `scrollWidth − clientWidth`; the PGA Driver carry cell's bounding box lies within 0…320 horizontally. Emulate 568×320 (rotation): scrollers still at their right edge. Scroll one table left manually, rotate back: that table keeps the user's position. With safe-area insets emulated (`Emulation.setSafeAreaInsetsOverride`, 40 px left/right), `#pinned` and the footer are padded by at least the inset.
  - **RF-5:** with `Emulation.setScriptExecutionDisabled` (set before navigating) the `<noscript>` text is visible; serving with `fail404: ['/js/flight.js']` makes `#load-error` visible and `data-state="error"` within 2 s; serving with `override: { '/js/units.js': 'export const = ;' }` (a syntax error) does the same within 2 s.
  - **Background tab:** load the page, immediately activate a second target so the first is backgrounded; after 12 s `#load-error` is still hidden, and the page reaches `ready` within 30 s.
  - **Back/forward**, run twice — default flags (bfcache) and a second browser launched with `--disable-features=BackForwardCache`: set 5,280 ft, change the elevation unit to `m`, navigate to `methods.html`, go back. In both runs the elevation box, unit select, slider, readout and PGA Driver carry cell agree with each other (with bfcache: 1,609 m state; without: a fresh page at sea level with the default units, not the restored select value).
  - Sticky: after scrolling to the LPGA table, the pinned row's top is 0 on mobile and the whole control bar's top is 0 at 1440×900.
- `screenshots.mjs` (development only, not in CI): PNGs at 320×568, 375×667, 390×844, 844×390 and 1440×900, for elevation 0 and 5,280 ft and both delta modes, plus `methods.html`, written to `$TMPDIR/tmelevation-shots/`.

- [ ] **Step 1: Write** `artifact.test.js` and the browser scripts' assertions as listed.
- [ ] **Step 2: Run** `npm test` (artifact test FAIL: builder missing) and `npm run test:browser` (FAIL: harness missing). Chrome runs need `dangerouslyDisableSandbox: true` here.
- [ ] **Step 3: Implement** builder, server, CDP driver, smoke, e2e, runner, screenshots.
- [ ] **Step 4: Run** both — expected PASS. Fix the page (Tasks 10–11 files) for any behaviour the e2e exposes, amending the owning commit per the branch-history rule rather than adding a fixup commit.
- [ ] **Step 5: Commit** `build: add deploy artifact builder` (builder + its unit test) and `test: add browser smoke and end-to-end tests` (harness, smoke, e2e, runner, screenshots).

---

### Task 13: CI, release and deploy workflows; README

Spec: §9 (all), §10 (README contents). Reference: `/home/jhoblitt/github/conventions-claude/.github/workflows/release.yml`, `.releaserc.yml`, `.github/scripts/release-notes.sh`.

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.github/workflows/deploy.yml`, `.releaserc.yml`, `.github/scripts/release-notes.sh` (verbatim copy of the reference)
- Modify: `README.md`

**Behaviour:**
- **`ci.yml`** — triggers `pull_request`, `push` to `main`, and `workflow_call`; canon concurrency (`${{ github.workflow }}-${{ github.event.pull_request.number || github.sha }}`, cancel in progress); jobs `unit` (checkout, `actions/setup-node` with `node-version-file: .nvmrc`, `npm test`, `npm run oracles`) and `browser` (checkout, setup-node, `npm run test:browser`), `timeout-minutes: 10` each. Whether Chrome needs `CHROME_NO_SANDBOX: '1'` on `ubuntu-latest` is settled by the first CI run (Task 14 Step 3); if it does, set it with an explaining comment in both this job and `deploy.yml`'s build job. The job names `unit` and `browser` become the required checks (Task 14).
- **`release.yml`** — `push` to `main`; concurrency group `release`, `cancel-in-progress: false`; jobs:
  1. `test`: `uses: ./.github/workflows/ci.yml` (no `timeout-minutes` on a calling job).
  2. `release` (needs `test`, `timeout-minutes: 15`, permissions `contents: write`, `issues: read`, `pull-requests: read`): checkout with `fetch-depth: 0`; setup-node; `npx --yes` with exact pins for `semantic-release@25.0.8`, `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/github`, `@semantic-release/exec@7.1.0`, `conventional-changelog-conventionalcommits@9.3.1`, env `GITHUB_TOKEN` and `npm_config_ignore_scripts: "true"`. Choose the three unpinned-in-the-reference versions with `npm view semantic-release@25.0.8 dependencies` (the highest published version inside each declared range, so npm dedupes them into the copy semantic-release loads; on 2026-10-08 that was commit-analyzer 13.0.1, release-notes-generator 14.1.1, github 12.0.10 — re-check) and record the ranges in a comment beside the reference's preset-9 comment. Then a step with `if: ${{ !cancelled() }}` reads `tag=$(git tag --points-at HEAD --list 'v*')`, confirms it exists on the remote (`git ls-remote --exit-code --tags origin "refs/tags/$tag"`), and writes it to `$GITHUB_OUTPUT`; job output `tag`. This runs even when a plugin step failed after the tag was pushed (spec §9.2).
  3. `deploy` (needs `release`, `if: ${{ !cancelled() && needs.release.outputs.tag != '' }}` — a status function is required, or a failed `release` job would skip it): `uses: ./.github/workflows/deploy.yml`, `with: { tag: ${{ needs.release.outputs.tag }} }`, permissions `contents: read`, `pages: write`, `id-token: write`, no `timeout-minutes`.
- **`.releaserc.yml`** — `branches: [main]`; plugins: commit-analyzer (preset `conventionalcommits`, the reference's `releaseRules`: docs, refactor, perf → patch); release-notes-generator (preset `conventionalcommits`, the reference's `presetConfig.types` list verbatim); exec (`generateNotesCmd` running `release-notes.sh` exactly as the reference does; no `prepareCmd`); github with success and failure comments and issues turned off, using the option names documented for the pinned `@semantic-release/github` version (the reference's `successComment` / `failComment` / `failTitle: false` are deprecated in v12). No changelog, git or npm plugin.
- **`deploy.yml`** — triggers `workflow_call` (input `tag`, required string), `workflow_dispatch` (input `tag`, required), `push` of tags `v*`; concurrency group `pages` (literal string), `cancel-in-progress: false`, with a comment declaring it the second exception to the canon alongside the release workflow; jobs:
  1. `build` (`timeout-minutes: 15`, read-only): `TAG` = `inputs.tag` or `github.ref_name`, passed through `env:`; reject unless it matches `^v[0-9]+\.[0-9]+\.[0-9]+$`; checkout that tag with `fetch-depth: 0`; `git merge-base --is-ancestor "$TAG^{commit}" origin/main` or fail; when the run was triggered by a tag push — `startsWith(github.ref, 'refs/tags/')` (under `workflow_call` `github.event_name` is the caller's `push`, so it cannot discriminate) — compare `TAG` with `git for-each-ref --merged origin/main --sort=-v:refname --count=1 --format='%(refname:short)' 'refs/tags/v*'` and, if they differ, set step output `deploy=false` and skip the remaining steps (each later step carries `if: steps.guard.outputs.deploy == 'true'`); setup-node; `npm test`; `node scripts/build-artifact.mjs "$TAG" _site`; `node test/browser/smoke.mjs _site --expect-version "$TAG"`; `actions/upload-pages-artifact` with `path: _site`; job output `deploy` from the guard step.
  2. `deploy` (needs `build`, `if: needs.build.outputs.deploy == 'true'`, `timeout-minutes: 10`, environment `github-pages` with `url: ${{ steps.deployment.outputs.page_url }}`, permissions `pages: write`, `id-token: write`): `actions/deploy-pages`.
- **README** — keep the canon skeleton; Description: what the site does and its URL; add: "Data" (TrackMan's figures, reproduced with attribution, not covered by the Apache-2.0 licence; link), "Method" (link to the methods page; physics in one paragraph), "Fonts" (Oswald and Lato, SIL OFL, files in `site/fonts/`), "Accessibility" (TrackMan's palette reproduced exactly; its white-on-stripe contrast is below WCAG AA), "Development" (`npm test`; `npm run test:browser` needs Google Chrome; `npm run oracles`), "Releases" (Conventional Commits → semantic-release on merge → tag → Pages; redeploy or roll back with the deploy workflow's manual run).

- [ ] **Step 1: Write the workflows and config.**
- [ ] **Step 2: Verify:** `GITHUB_TOKEN=$(gh auth token) pinact run` then `pinact run --check --verify`; `actionlint` on all workflows with `shellcheck` on `PATH` — both clean. `release-notes.sh` is committed with mode 100755 (`git ls-files -s` shows `100755`; a static unit test asserts the executable bit). Re-read each job against spec §9 and the canon checklist (permissions, concurrency, timeouts, `persist-credentials: false`, inputs via `env:`, status functions on `needs`-dependent jobs).
- [ ] **Step 3: Dry-run semantic-release.** Push the branch without opening a pull request (`git push origin HEAD:init`; semantic-release needs it on the remote). Outside CI semantic-release takes the branch from `git rev-parse` (`worktree-init`), so present a CI environment: `GITHUB_ACTIONS=true GITHUB_EVENT_NAME=push GITHUB_REF=refs/heads/init GITHUB_REPOSITORY=jhoblitt/tmelevation GITHUB_SHA=$(git rev-parse HEAD) GITHUB_TOKEN=$(gh auth token) npm_config_cache=$TMPDIR/npm-cache npx --yes <same pinned packages> semantic-release --dry-run --branches init` (sandbox disabled). Pass only if the log contains `The next release version is 1.0.0` and the notes from `release-notes.sh` print; a run that logs "won't be published" or exits early is a failure. Then confirm the plugin versions actually loaded: under `$TMPDIR/npm-cache/_npx/*/node_modules`, each `@semantic-release/*` package's `package.json` shows the pinned version and no nested `semantic-release/node_modules/@semantic-release/*` copy exists. Nothing is published in a dry run.
- [ ] **Step 4: Update the README** and run `npm test` and `npm run test:browser` once more.
- [ ] **Step 5: Commit** `ci: add test, release and deploy workflows` and `docs: describe the site, data licensing and release process in the README`.

---

### Task 14: Visual verification, pull request, first release

Spec: §1 (success criteria), §4.4, §10 steps 5–6.

- [ ] **Step 1: Screenshots.** `node scripts/screenshots.mjs`; download TrackMan's two table images into `$TMPDIR` for comparison; read every PNG. Check against spec §4.4 and the TrackMan images: palette, odd-row stripe across the full width, title block, translucent column rules, no horizontal rules, fonts, white values, charcoal deltas centred below values, pinned Club column opaque, compact pinned row on phones, tables starting at the right edge on phones, methods page equations rendered and tables scrolling inside their containers. Fix defects in the owning task's commit.
- [ ] **Step 2: Branch history.** Per github-conventions `references/commits.md`: a logical series, no fixups; any rewrite proves `git diff <old-head> HEAD` empty.
- [ ] **Step 3: Push and open the PR.** `git push origin HEAD:init` (`--force-with-lease` if Step 2 rewrote history); `gh pr create --draft --assignee @me` with the title and description approved in Task 1 (re-show them for approval first if anything changed); start the CI watcher in the same turn (github-conventions `references/pull-requests.md`, "Watching CI"); all checks green (retry a plausible flake up to 3 times). If the `browser` job fails because Chrome cannot start sandboxed, set `CHROME_NO_SANDBOX: '1'` in `ci.yml`'s `browser` job and `deploy.yml`'s `build` job (Task 13), amending that commit.
- [ ] **Step 4: Require the checks.** Add `unit`, `browser` and the commitlint workflow's job (exact check-run names as reported on the PR) to the ruleset as required status checks: `gh api -X PUT repos/jhoblitt/tmelevation/rulesets/<id>` with the existing rules plus a `required_status_checks` rule — `strict_required_status_checks_policy: false`, each check with `integration_id: 15368` (GitHub Actions) so only Actions can satisfy it; verify with `gh api`.
- [ ] **Step 5: Merge — only on the user's explicit go-ahead** (it publishes `v1.0.0` and deploys). Mark ready, then `gh pr merge --merge`.
- [ ] **Step 6: Watch the release.** `release` → `test`, `release` (tag `v1.0.0`, GitHub Release with notes), `deploy` (build, deploy) all green. Then `node test/browser/smoke.mjs https://jhoblitt.github.io/tmelevation/ --expect-version v1.0.0` — expected PASS.
- [ ] **Step 7: Clean up.** `ExitWorktree`; report the site URL, the release URL and anything skipped.

---

## Self-review

**Spec coverage** (spec section → task): §1 → 14; §2 → scope enforced by Global Constraints; §3 → 2 (data, notice), 11 (assumption text); §4.1 → 9 (state, readout, caption), 10 (DOM, hint, layout, footer), 12 (sticky, narrow); §4.2 → 9, 10, 12 (RF-1–RF-3, back/forward); §4.3 → 8, 10; §4.4 → 10, 12 (RF-4), 14 (visual); §5.1 → 3; §5.2 → 4; §5.3 → 5, 6; §5.4 → 6, 10; §5.5 → 10 (indicative footnote), 11 (text); §5.6 → 4, 6, 10, 12 (RF-5); §6 → 11; §7 → 10, 11 (CSP, preload, `textContent` static tests), 12 (artifact); §8.1 → 2–9; §8.2 → 12; §8.3 → 7; §9 → 13, 14; §10 → 1, 13, 14; §11 → documented in 11.

**Placeholders:** none; the three semantic-release plugin versions are chosen by a stated rule at execution time (Task 13) because they must match `semantic-release@25.0.8`'s declared ranges on the day.

**Seam consistency:** `Launch`, `FlightResult`, `Calibration`, `Delta`, `Model`, `Cell`, `State` are defined once (Tasks 4, 4, 5, 6, 6, 8, 9) and consumed under the same names in 6–12.

**Review Focus:** RF-1 → Task 12; RF-2 → Tasks 9, 12; RF-3 → Task 12; RF-4 → Tasks 10, 12; RF-5 → Tasks 10, 12.

## Rulings

Decisions made in this plan where the spec was silent, and rulings recorded by implementers (append below):

- `site/js/boot.js` (a classic script) is added to the spec's file table: a failed module graph never runs `app.js`, so only a non-module script can report it (RF-5).
- `site/favicon.svg` is added so the browser's automatic `/favicon.ico` request cannot 404 under the smoke test.
- Dual-unit deltas format each unit independently (`+1/±0`, `±0/±0`); angle deltas carry the degree sign (`±0°`).
- The Land Angle header shows `†` with a footnote at elevation > 0 to label the column indicative without changing TrackMan's header text.
- The smoke test drives Chrome over the DevTools protocol instead of `--dump-dom`; the spec's checks (200s, ready state, values, no errors or CSP violations) are unchanged.
- `package.json` gains `oracles` and `test:browser` scripts alongside `test`; it still declares no dependencies.
- Calibration yields in ~8 ms time slices through `MessageChannel` rather than one timer per row (spec §5.3 "yields between rows"): background tabs throttle timers to once a second, which made a working page look broken.
- Live typing accepts values within half a display step outside the range and clamps them, so the boundary values a box itself displays (`16.89` inHg, `101.33` kPa) are not rejected (spec §4.2 otherwise unchanged).
- `data-app="started"` marks that `app.js` began executing, for `boot.js`'s watchdog.
- Accepted risk: the hand-pushed-tag deploy trigger the user asked for (spec §9.3) runs `deploy.yml` as it exists at the tagged commit, so its guards are a safety net, not a security boundary — anyone able to push a tag can deploy. In this personal repository that is the owner, who can already change the workflows; recorded rather than mitigated.
