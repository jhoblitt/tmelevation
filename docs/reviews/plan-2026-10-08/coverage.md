# Plan review — coverage, seams, expected values (2026-10-08)

Target: `docs/superpowers/plans/2026-10-08-tmelevation.md`
Spec: `docs/superpowers/specs/2026-10-08-tmelevation-design.md`
Mandate: spec coverage, seam consistency, expected values, executability.
Independent throwaway implementation of spec §5.1–5.4 exactly as the plan
describes it (RK4 dt = 0.05 s, the plan's apex/landing interpolation, damped
Newton from (1, 1), forward-difference ε = 1e-4, tolerance 1e-4 m):
`/tmp/claude-1000/plan-review-coverage/m.mjs` plus check scripts in the same
directory, Node 22.22.2. Evidence log: `coverage.md.notes.md`.

## Summary

The plan is numerically sound. I re-implemented the model exactly as the plan
describes it, and every exact expected value the plan asserts reproduces:
atmosphere, pressure strings, S, the vacuum shot, the PGA Driver ρ₀k, the 77.7 %
spin ratio, all 30 golden values (worst error 0.0048 against a 0.05
tolerance), the step budgets (29,291 / 50,000 for calibration; ≤ 2,736 /
4,000 per recompute), "≤ 160 steps", "≤ 1201", every hard oracle, and the
present.js and controls examples. The golden values can be reached with the
plan's calibration, whose targets are the published yards. The seams are
consistent in names, fields and units (SI FlightResult → yd/° Delta → yd/°
Cell inputs; `tour:index` keys everywhere). The five Rulings are sound.

Eighteen findings, none a blocker. **Three are major.**
**K1:** the step-cap test (`kL: 1000` → `cap`) cannot pass, because the state
goes non-finite at step 2. **K3:** the `deltasAt` "memoised on rhoRatio"
contract returns stale maps while calibration is still running, and only the
Task 12 e2e would catch it. **K4:** the release workflow drops the D7 fix, so
a tag pushed before a plugin failure is neither output nor deployed, against
spec §9.2.

**Nine are minor.** **K2:** a round-trip tolerance that the printed constants
miss by 4.6 mm. **K5:** focus-based render vs. normalising on Enter. **K6:**
a fragile, under-specified spin-law test. **K7:** an RF-3 assertion that one
slider step changes a cell. **K8:** "identical" vacuum+wind results.
**K9:** the altitude-failure seam. **K10:** no test of the methods page's
content. **K11:** a bfcache-dependent e2e. **K12:** DOM hooks missing from
the Task 10 contract.

**Six are nits** (K13–K18).

## Coverage table

Verdicts: **ok** = a task delivers it and a test would catch its absence;
**weak** = delivered, but no test (or a test that cannot fail) pins it;
**gap** = no task delivers it as the spec states; **conflict** = the plan's
test or text contradicts the behaviour.

| Spec item | Task | Test | Verdict |
|---|---|---|---|
| §1.1 sea level exact, both units | 2, 8 | present sea-level test (all rows, `209/192`); smoke values | ok |
| §1.2 altitude inside hard oracle bands | 7 | oracles.test "every hard oracle passes" | ok (recomputed: all pass) |
| §1.3 phone + desktop | 10, 12, 14 | RF-4 e2e, sticky e2e, screenshots | ok |
| §1.4 methods page link | 10, 11 | RF-3 Tab order includes methods link | ok |
| §1.5 CI / release / deploy | 13, 14 | dry-run; live smoke | see K4 |
| §3 data, both units stored, notice | 2 | data.test vs transcription, notice check | ok |
| §3 calm / sea level / 25 °C assumption stated | 11 | none | weak (K10) |
| §4.1 controls, defaults ft + inHg | 9, 10 | `view(initialState())` | ok |
| §4.1 pressure label + barometer hint | 10 | none | weak |
| §4.1 desktop sticky row / phone pinned row ≤ ~60 px | 10, 12 | sticky e2e, RF-4 height ≤ 64 | ok |
| §4.1 readout / caption `5,280 ft · 24.64 inHg` | 9, 10 | controls readout/caption tests | ok |
| §4.1 footer (source, not-affiliated, version, fonts, repo) | 10 | smoke checks footer version only | weak |
| §4.2 single source of truth in Pa | 9 | "views agree" + unit-switch `Object.is` | ok |
| §4.2 range, slider step/units/value text/44 px | 9, 10 | metres slider test; RF-3 arrow step | ok, see K7 |
| §4.2 text inputs (`inputmode`, 16 px) | 10 | none | weak |
| §4.2 parsing rule | 9 | parseNumber cases | ok |
| §4.2 live typing only in range, `aria-invalid` | 9, 10 | `'150000'` test; RF-2 | ok |
| §4.2 commit clamps and **normalises** (blur or Enter) | 9, 10, 12 | RF-3 `5280`+Enter → `5,280` | conflict (K5) |
| §4.2 unedited box not re-parsed | 9 | unedited-commit `Object.is` | ok |
| §4.2 unit change re-expresses, never moves state | 9 | RF-2 unit test | ok |
| §4.2 display precision | 9 | 5,280 ft strings | ok |
| §4.2 bfcache restore re-renders | 10, 12 | back/forward e2e | see K11 |
| §4.3 only three columns recomputed; two-line cells | 8, 10 | none for the unchanged-column empty delta line | weak |
| §4.3 absolute deltas, `±0`, U+2212 | 8 | present cases | ok (recomputed) |
| §4.3 percent deltas, `±0.0%`, never `−0.0%` | 8 | present cases | ok (recomputed) |
| §4.3 hidden at displayed 0 but keeps space | 8, 10 | `deltaHidden` unit test | ok (layout untested) |
| §4.3 displayed = round(pub + Δ) per unit | 8 | `209/192` + 0.5 → `210/192` | ok |
| §4.3 accessible text, visually hidden, both units | 8, 10 | a11y strings | ok, see K15 |
| §4.3 failed row `—` | 6, 8, 10 | present failed case; model isolation | see K9 |
| §4.4 palette, rules, stripe, fonts, pinned column, right-edge start | 10, 12, 14 | RF-4; screenshots | ok |
| §4.4 fonts unmodified + SHA-256 + OFL texts | 10 | static.test fonts | ok |
| §5.1 atmosphere equations and constants | 3 | USSA table, 5,280 ft, ratios, ρ₀ | ok (recomputed) |
| §5.1 inverse round trip | 3 | round trip ±1e-6 m | conflict (K2) |
| §5.2 equations, S, decay, constants | 4 | vacuum, S, spin law, wind, dt | ok, see K6, K8 |
| §5.2 60 s cap, non-finite → failure | 4 | `kL: 1000` → cap | conflict (K1) |
| §5.3 calibration, ≤ 20 iterations, envelope, PGA Driver ρ₀k | 5 | calibrate.test | ok (recomputed) |
| §5.3 budgets 50,000 / 4,000 steps | 6 | model.test budgets | ok (29,291 / ≤ 2,736) |
| §5.3 paint first, calibrate incrementally, yields | 6, 10 | incremental-order test; RF-1 | ok, see K3 |
| §5.4 Δ = model(r) − model(1), sea run cached | 6 | golden; ratio-1 exact zero | ok (recomputed) |
| §5.4 pending rows show `…` | 6, 8, 10 | present pending; RF-1 | ok, see K3 |
| §5.4 coalesce to one recompute per frame | 10 | none | weak |
| §5.5 limitations stated (methods) | 11 | none | weak (K10) |
| §5.5 land angle labelled indicative | 10 (Ruling †) | none | weak |
| §5.6 failure handling, console log, error state | 4, 5, 6, 10 | model isolation; RF-5 | ok, see K9 |
| §6 methods page sections 1–8 | 11 | MathML allow-list, DOI, back link | weak (K10) |
| §6 live calibration + validation tables | 11, 12 | smoke row counts | ok, see K18 |
| §7 module layout, pure modules import in Node | 2–9 | unit tests import each module | ok |
| §7 CSP, no inline, `textContent` only | 10, 11 | static.test | ok |
| §7 modulepreload = import graph | 10, 11, 12 | static.test; artifact.test | ok |
| §8.1 unit-test list | 2–9 | glob instead of explicit list (Node 22 verified) | ok |
| §8.2 smoke | 12 | smoke.mjs | ok |
| §8.3 oracles hard/soft, annotations | 7, 13 | oracles.test; `npm run oracles` | ok (recomputed), see K16 |
| §9.2 tag output survives a later plugin failure | 13 | none | gap (K4) |
| §9 rest (release, deploy, hygiene) | 13, 14 | delivery reviewer's scope | not re-reviewed |
| §10 setup order, contents | 1, 13, 14 | settings verification | ok (package.json scripts, K14) |

### SUMMARY.md "Fixed" items → plan

| Item(s) | Task / test | Verdict |
|---|---|---|
| P1/C1/L5 oracle 10 on TrackMan 2014 shots, land ±3° | 7 (10a/10b hard) | ok — 46.23° / 44.50° |
| P2 monotone hard to 10k, soft above | 6 model.test, 7 (9a/9b) | ok |
| S3 in-range live state, 60 s cap, isolation | 9 (`150000`), 4 (cap), 6 (isolation) | ok except K1 |
| P3/C5 ρ₀ stated, envelope as ρ₀k | 3 (`RHO0`), 5 (envelope) | ok |
| P4/D12/S1 dt 0.05, step budgets | 4, 6 | ok — 29,291 / 2,736 |
| P6/C22 integration error stated; P5/C9, P8, L1–L4, L6, L7, C2, C24 limitation text | 11 (prose) | weak (K10) |
| P7/C10 dry air, ρ/ρ₀ = P/P₀ | 3 | ok |
| P9/U22 `±0`, `±0.0%`, never `−0.0%` | 8 | ok |
| P10 golden, spin decay, S, ρ₀k tests | 4, 5, 6 | ok (K6 caveat) |
| P12 wind soft oracle, test-only wind | 4 (`windMps`), 7 (12-*) | ok, see K8 |
| C3, C4, C7, C8, C14, C15 oracle kinds, wording, sources | 7 (`source` fields from claims.md) | ok (wording untested) |
| C6, C20, C21, C25 | 11 (sources), 11 (MathML Core list), 10 (fonts unmodified + SHA) | ok / weak for C6 text |
| C11/D13 pinned plugins | 13 | ok (delivery reviewer) |
| C13 translucent column rule | 10 (`rgba(0,0,0,0.2)`), 14 visual | ok |
| C16, C17, C18 | 11 prose, 4 constants, 13 `.releaserc.yml` | ok / weak |
| U1 right-edge start | 10, 12 RF-4 | ok |
| U2, U3, U9, U10 parsing / live / unedited / empty | 9 | ok |
| U4 compact pinned row; U5 hint; U13 slider; U14 caption + footer; U15 link; U17 inputs; U19 methods phone; U20 title wrap; U21 defaults | 9, 10, 11, 12, 14 | ok (U5/U17 markup untested) |
| U6, U7, U11 two-line cells, opaque pinned column, hidden-at-0 | 8, 10, 14 | ok |
| U18 aria-invalid, hidden delta text, focusable scroller, focus ring | 10, 12 RF-3 | ok, see K15 |
| U24 bfcache | 10, 12 | see K11 |
| U25 device emulation | 12 (`page.emulate`) | ok |
| D1–D4 test-gated release, dispatch redeploy, guarded tag push | 13 | ok (delivery reviewer) |
| D5, D6, D17 calling-job perms, read-only build, `pages` group | 13 | ok |
| D7 tag output survives post-tag failure | 13 | **gap (K4)** |
| D8 ready/error state, statuses, both pages | 10, 11, 12 | ok |
| D9 soft-oracle visibility, helpers not run as tests | 7 (`oracle-report.mjs`), 2 (glob) | ok — glob verified on Node 22 |
| D10, D11, D19 Pages setup, first `feat`, merge commits, `.claude/` exclude | 1 | ok |
| D14 `.nvmrc` 24; D15 OFL + credits; D16 `data.js` notice; D18 CodeQL JS | 2, 10, 2, 1 | ok |
| S2 paint first, incremental | 6, 10 | ok, see K3 |
| S4 CSP + TT + `textContent`; S5 modulepreload graph; S7 `?v=`; S8 fonts | 10, 11, 12 | ok |
| S6 500 ft grid, incremental fill | 11 (`gridFt: 500`, one oracle per macrotask) | ok |

## Findings


### K1 — major — Task 4 Step 1: the step-cap test cannot pass; `kL: 1000` fails as `nonfinite`, not `cap`

**Problem.** The test says `kL: 1000` ("the ball never comes down") →
`{ ok: false, reason: 'cap' }` with `steps ≤ 1201`. With the spec's model the
lift radius at launch is 1/(k·C_L) ≈ 0.3 m, so the angular rate U/R ≈ 260 rad/s
and U/R·dt ≈ 13, far outside RK4's stability limit (≈ 2.8). The state blows
up on the second step. A correct implementation fails this test. The executor
then either weakens the non-finite check or reshapes the model to make the
test pass.

**Evidence.** `fl.mjs`: `kL 1000 → {"ok":false,"reason":"nonfinite","steps":2}`
(both time-accumulation variants). `kL: 100` and `kL: 50` do reach the cap at
1,201 steps; `kL: 20 / 10 / 5` land after 795 / 509 / 299 steps.

**Proposed change.** Replace the case with a deterministic one that does not
depend on stiffness: a vacuum lob, `launchFrom({ ballSpeedMph: 1000,
launchDeg: 60, spinRpm: 0 })`, `{ kD: 0, kL: 0 }`, `{ rhoRatio: 0 }` →
`{ ok: false, reason: 'cap' }`, `steps ≤ 1201` (verified: 1,201). Keep
`kL: 1000` as an extra `nonfinite` case if wanted: it shows that a stiff,
unstable input fails instead of hanging.

### K2 — minor — Task 3 Behaviour + Step 1: the ±1e-6 m round-trip test fails with the constants the plan prints

**Problem.** Task 3's Behaviour names "exponent g₀M/(R*L) = 5.255876, inverse
exponent 0.190263 (spec §5.1)", and spec §5.1 prints the forward coefficient as
2.25577×10⁻⁵ and the inverse as 288.15/0.0065 with 0.190263. Those literals are
not exact inverses of each other (1/5.255876 = 0.19026324…, 1/2.25577e-5 ≠
288.15/0.0065). The round-trip test (`±1e-6 m` for z up to 4,572 m) then fails.
Two executors will diverge: one derives both directions from L/T₀ and
g₀M/(R*L), one loosens the tolerance.

**Evidence.** `atm.mjs`: derived constants give a round-trip error ≤ 3e-12 m.
The printed literals give −1.07e-6 m at 1 m, −1.69e-3 m at 1,609 m and
−4.59e-3 m at 4,572 m. Every other Task 3 assertion passes with either set of
constants.

**Proposed change.** In Task 3's Behaviour, state: "compute the coefficient
as L/T₀ and the exponent as g₀M/(R*L) from the Global Constraints constants,
and the inverse with exactly the same values (exponent 1/that), so the round
trip is exact to floating point. The spec's 5.255876 and 0.190263 are those
values rounded for display."

### K3 — major — Task 6 Interfaces: "`deltasAt` memoised on rhoRatio" returns stale maps while calibration is running, and no unit test catches it

**Problem.** The Model contract memoises `deltasAt(rhoRatio)` on the ratio
alone. During load, Task 10 calls `calibrateNext()` once per macrotask and
renders after each row at the same ratio. With a ratio-only memo, the second
and later renders return the first map, so rows that calibrated afterwards
keep showing `…` until the ratio changes. That is the stale frame RF-1
forbids. Task 6's only memo test ("a repeated `deltasAt` with the same ratio
adds 0") runs after calibration has finished, so it pins the buggy behaviour
rather than catching it. The defect first shows up in Task 12's RF-1 e2e, and
the fix then lands in Task 6's module.

**Evidence.** Plan Task 6 Interfaces (`deltasAt(rhoRatio) → Map …   //
memoised on rhoRatio`); Task 10 Load sequence ("call `calibrateNext()` once
per macrotask …, rendering after each row"); RF-1 ("once calibration
completes every cell matches the model at the *final* slider position").

**Proposed change.** Contract: "memoised per entry: a repeat call at the same
ratio flies only entries that became ready since the previous call at that
ratio (or memo key = ratio + number of settled entries)". Add to
`model.test.js`: `calibrateNext()`, `deltasAt(0.8)`, `calibrateNext()`,
`deltasAt(0.8)` → `pga:1` is `ready` with a non-null Δ, and the second call
adds only `pga:1`'s flight steps.

### K4 — major — Task 13 `release.yml`: the tag output and the deploy job do not survive a post-tag plugin failure, as spec §9.2 requires (the D7 fix is dropped)

**Problem.** Spec §9.2 item 2 says that the tag read with `git tag --points-at
HEAD --list 'v*'` is exposed as a job output, and that "this holds even if a
later plugin step fails after the tag was pushed". Item 3 adds that the
deploy job "runs when a tag was output". SUMMARY marks D7 Fixed. D7's fix
(delivery.md:121) is a separate step **with `if: always()`** that also
confirms the tag exists on the remote. Task 13 writes "Then a step writes
`tag=…`" with no status condition, and gives the deploy job
`if: needs.release.outputs.tag != ''`. If `@semantic-release/github` fails
after the tag push, the tag step is skipped, so no output is written. The
deploy job is skipped as well: a job whose `needs` failed is skipped unless
its `if` contains a status function. The pushed tag never deploys, which is
the case D7 exists for.

**Evidence.** Plan Task 13 `release.yml` items 2–3; spec §9.2 items 2–3;
delivery.md:113-121 (D7 and its fix); semantic-release pushes the tag before
the publish/success plugins run (delivery.md:54, v25.0.8 `index.js:204-214`).

**Proposed change.** In Task 13: give the tag step `if: ${{ !cancelled() }}`
and have it confirm the tag with `git ls-remote --exit-code --tags origin
"refs/tags/$tag"` before writing it. Change the deploy job's condition to
`if: ${{ !cancelled() && needs.release.outputs.tag != '' }}`. Add to Step 2's
re-read checklist: "the tag output and deploy survive a failing github
plugin".

### K5 — minor — Task 10 Render vs Task 12 RF-3: "never overwriting the focused box's text" contradicts normalising on Enter

**Problem.** Spec §4.2 says that on commit (blur **or Enter**) the box is
normalised, and Task 9 implements commit by clearing `edit`, so `view()`
then returns the formatted text. Task 10's Render rule is "never overwriting
the focused box's text". After Enter the box still has focus, so that rule
leaves `5280` (or a clamped `150000`) in it. Task 12 RF-3 asserts that
`5280` + Enter shows `5,280`. An executor who follows Task 10 fails RF-3 and
must choose which text to override. One rule keys on focus, the other on
`edit`.

**Evidence.** Plan Task 10 Render ("never overwriting the focused box's
text"); Task 9 Behaviour (commit clears `edit`; "the box being edited shows
`edit.text` verbatim"); Task 12 RF-3; spec §4.2 bullets 6–7.

**Proposed change.** Task 10 Render: "write each box's text from `view()`
whenever that box has no pending `edit`; while `edit` is set for a box, leave
its text alone. Focus alone never blocks a write." `view()` already returns
`edit.text` verbatim for the edited box, so this one rule covers typing,
Enter, blur and unit changes. Add an RF-3 e2e assertion that `150000` + Enter
shows `15,000` with `aria-invalid="false"`.

### K6 — minor — Task 4 Step 1: the "spin decay is exact to the law" test (rel. error < 1e-6) passes only for one undocumented way of computing `airPathM`, and only by a small margin

**Problem.** The test asserts `ln(ω₀/landSpin) = LAMBDA0·rhoRatio·airPathM/r`
to a relative error of 1e-6. The plan defines `airPathM` only as "∫|u| dt". It
does not say whether the path is a sixth RK4 state, a trapezoid sum, or
whether it is interpolated to the landing time like ω ("vₓ, v_y, ω linear at
t*"). The identity holds to 1e-6 only when `airPathM` is an RK4 state that is
linearly interpolated at landing. Even then the residual is 65–96 % of the
tolerance, because linearly interpolating an exponential ω inside the landing
step leaves an O(θ(1−θ)(Δln ω)²) error. A correct but differently integrated
path fails by three orders of magnitude.

**Evidence.** `fl.mjs` / `misc.mjs`. With the RK4 state, linearly
interpolated: PGA Driver k = 1 gives −7.0e-7 (ρ 1) and −6.5e-7 (ρ 0.5). The
calibrated PGA Driver gives −9.6e-7 and −8.9e-7. The worst case over 23 rows ×
4 densities is 1.05e-6, which fails. With the path taken at the end of the
step: −3.9e-3 and −2.1e-3, which fail.

**Proposed change.** In Task 4's Interfaces, define `airPathM` as a sixth RK4
state (dP/dt = U) that is linearly interpolated at landing like ω. Set the
test tolerance to 1e-5 relative. That still catches a missing ρ/ρ₀ factor or
an r-vs-D slip by five orders of magnitude.

### K7 — minor — Task 12 RF-3: "`ArrowRight` … and the PGA Driver carry cell updates" asserts a change that does not happen

**Problem.** One slider step is 10 ft. The calibrated PGA Driver's carry Δ
over 10 ft is about 0.04 yd, so the displayed value and the absolute and
percent delta strings stay the same. From sea level the only change in the
cell is the delta line un-hiding to `±0/±0`. From any other elevation
nothing in the cell changes. A test that compares the cell's text before and
after the key press fails, and two executors will write different
assertions.

**Evidence.** `arrow.mjs`: Δ at 10 ft = 0.0384 yd (`282/258`, 0.0 %); the
first visible change is at 140 ft (`283/258`). 5,280 → 5,290 ft gives 18.112 →
18.142 yd, `300/275` / `+18/+17` / `+6.4%` both times.

**Proposed change.** RF-3: "from sea level, `ArrowRight` sets the elevation
box to `10`, the readout to `10 ft · …`, the slider's `aria-valuetext` to
`10 feet`, and un-hides the PGA Driver carry delta line showing `±0/±0`".
To check that the tables follow the slider, use ten presses from 5,280 ft
and compare every recomputed cell with the Node-computed cells at 5,380 ft,
as RF-1 does.

### K8 — minor — Task 4 Step 1: "wind has no effect in vacuum … identical results" is false for two of the result's fields

**Problem.** With `kD: 0, kL: 0` at `rhoRatio` 1, the trajectory ignores the
air, but spin decay still runs. It uses U = |v − w|, and the plan does not
scale it by k_D. So `landSpinRadS` and `airPathM` change with wind. A test
that compares whole `FlightResult` objects (`deepStrictEqual`) fails on a
correct model.

**Evidence.** `fl.mjs`: carry, max height and land angle are bit-identical;
`landSpinRadS` 241.25 vs 252.33 and `airPathM` 232.49 vs 184.60 differ.

**Proposed change.** "→ identical `carryM`, `maxHeightM`, `landRad`
(`Object.is`)".

### K9 — minor — Tasks 6 / 8 / 10 seam: a ready row whose altitude flight fails has two failure signals and no stated mapping to `present.js`'s `status`; nothing tests it

**Problem.** Task 6 represents failure two ways: `status: 'failed'` for a
calibration failure, and `status: 'ready'` with `delta.ok === false` for a
failed altitude flight. Task 8's `opts.status` accepts
`'ready' | 'pending' | 'failed'`. Task 10 says only "present.js → .v, .d, .sr".
It does not say that a ready entry with `delta.ok === false` renders as
`'failed'`, or whether that path sets `data-state="error"` (spec §5.6: logged
to the console, sets the page's error state). An executor who passes
`entry.status` straight through hands `present.js` a `'ready'` status with an
unusable Δ. Task 6's isolation test covers only the calibration-failure path.

**Evidence.** Plan Task 6 Behaviour ("`status: 'failed'` / `delta.ok ===
false`"); Task 8 `opts.status`; Task 10 Render and Load-failure handling;
spec §4.3 last bullet and §5.6.

**Proposed change.** Add a pure helper to `model.js` or `present.js`,
`cellStatus({ status, delta }) → 'pending' | 'failed' | 'ready'`, where
`ready && !delta.ok → 'failed'`, and unit-test it. Task 10: "any `failed`
cell status logs once to the console and sets `data-state="error"`". In Task
6, also test that a stubbed altitude failure (for example `deltasAt(NaN)`)
yields `delta.ok === false` for every ready entry without throwing.

### K10 — minor — Task 11 Step 1: the methods page's required content has no test that could fail

**Problem.** Spec §6 lists eight sections, and §§3, 4.4, 5.1, 5.3, 5.5 and 11
push specific statements onto the methods page: the calm / sea-level / dry /
25 °C assumption; the constant-temperature choice versus the ISA lapse rate
(≈ 3.5 %); the humidity bound (≤ 0.18 yd); the barometer explanation; outputs
relative to launch elevation; the driver-only fit range; the ≈ 1 yd rounding
uncertainty at 10,000 ft; why absolute and percent deltas disagree; the six
§5.5 limitations with their numbers (−30 % … +25 %, ±2°, 3.4°, 14,500 ft); the
contrast note; and read-at-primary / second-hand marks on sources. Task 11's
test checks only CSP, MathML element names, the back link and the Penner DOI.
A page that omits any of these passes every check. Most of the
"Fixed (§5.5…)" dispositions in SUMMARY (L1–L7, P5, P6, P8, C2, C6, U22) are
delivered only as methods-page prose.

**Evidence.** Plan Task 11 Step 1; spec §6 items 1–8; SUMMARY.md rows L1–L7,
P5, P6, P8, C2, C6, U22.

**Proposed change.** Give each §6 section a fixed `id` (for example
`assumptions`, `atmosphere`, `model`, `calibration`, `display`, `validation`,
`limitations`, `sources`). Extend `static.test.js` so that all eight appear in
order, `#limitations` has six items, and a short list of load-bearing tokens
is present: `25 °C`, `3.5 %`, `−30 %`, `+25 %`, `14,500 ft`, `11,230,375`,
`Mehta`, `NIST SP 811`, `doi:10.1119/1.1344164`. Each source carries a
`data-provenance="primary|secondary"` attribute.

### K11 — minor — Task 12 back/forward e2e asserts more than the spec, so it fails whenever Chrome does not use the bfcache

**Problem.** The e2e test sets 5,280 ft, navigates to `methods.html`, goes
back, and expects the box, the readout and the PGA Driver carry to "agree
with 5,280 ft". Spec §4.2 requires only that a page *restored from the
bfcache* re-renders from its state, so that controls and tables agree. If the
back navigation is a fresh load (for example a page that is not
bfcache-eligible), the page correctly comes back at sea level, because the
spec has no persisted state and `autocomplete="off"` stops form restoration.
The test then fails on correct behaviour. Whether headless Chrome under CDP
serves this navigation from the bfcache is not established in the plan.

**Evidence.** Plan Task 12 e2e "Back/forward"; spec §2 (no persisted
state) and §4.2 last bullet.

**Proposed change.** Assert that the three agree with each other in all
cases. Assert the 5,280 ft value only when the restore was a bfcache hit:
the page records `pageshow.persisted` (for example `data-restored="1"`), or
the test listens for CDP `Page.backForwardCacheNotUsed`. If the hit cannot be
made reliable, record that as a Ruling rather than weakening the agreement
check.

### K12 — minor — Task 10 → Task 12 seam: the DOM contract omits the elements Task 12 measures

**Problem.** Task 10's "Produces: DOM contract used by Task 12" lists the
control ids, sections, scrollers and cells. Task 12 also locates "the pinned
row" (RF-4 height ≤ 64 px; sticky top 0), "the whole control bar" (sticky at
1440×900), "the footer shows `v0.0.0`", the noscript text, and, implicitly,
the Land Angle header `†` and footnote. None of these has an id, class or
data attribute in the contract. Task 12's author has to invent selectors and
edit Task 10's markup, and two executors will choose differently.

**Evidence.** Plan Task 10 Interfaces vs Task 12 Smoke, RF-4, Sticky and
RF-5 bullets.

**Proposed change.** Add to Task 10's contract: `#controls` (the whole bar),
`#pinned` (the phone-pinned row), `#version` (footer version text),
`th[data-col="land"] .dagger` and `#land-footnote`.

### K13 — nit — Task 9: re-typing the box's own displayed value at the range ends is "out of range"

**Problem.** At 15,000 ft the inHg box shows `16.89`, which is 57,196.1 Pa,
below `MIN_PRESSURE_PA` (57,206.8). At sea level the kPa box shows `101.33`
and the mbar box `1,013.3`, both 101,330 Pa, above P₀. A user who types the
value the box itself shows sees `aria-invalid` until commit, when it clamps
back. This is consistent with the spec, but surprising, and no test
mentions it.

**Evidence.** `atm.mjs` and Node `toFixed`: MIN_P = 16.8932 inHg → `16.89`;
`(101.325).toFixed(2)` = `101.33`; `(1013.25).toFixed(1)` = `1013.3`.

**Proposed change.** Either accept live values within half a display step
outside the range and clamp them (recorded as a Ruling), or add the three
cases to Task 9's tests as the intended invalid-then-clamp behaviour, so the
choice is deliberate.

### K14 — nit — Task 2 / 7 / 12: `package.json` carries more than the spec allows, and no Ruling records it

Spec §10 says the `package.json` declares no dependencies, "only `"type":
"module"` and the `test` script". The plan adds `name`, `private`, `oracles`
and `test:browser`. This is harmless and keeps the no-dependency intent.
**Proposed change:** add a one-line Ruling.

### K15 — nit — Task 10: the visible delta is not `aria-hidden`, and the Δ toggle has no accessible name

The fix for U18 item 1 (ux.md:457-458) pairs the visually hidden `.sr` text
with an `aria-hidden` visible delta. Without it, screen readers announce both
"+8/+7" and "plus 8 yards, plus 7 metres…". U12 (disposition "Partly: toggle
meaning spelled out") asked for an accessible group name. Task 10 says
neither. **Proposed change:** `.d` gets `aria-hidden="true"`. The toggle is a
`role="group"` with an accessible name such as "Show change as". Its
buttons' accessible names are "absolute change" and "percent change".

### K16 — nit — Task 7: the `Oracle` shape does not fit multi-source or two-dimensional oracles

`source: { label, url, note }` holds one URL, but oracle 7 cites "five
sources" and 9a/9b cite "all qualitative sources … + Padjen"
(reference-data.md:569). Yet the test requires "every entry has a non-empty
`source.url`". `formatAnnotation`'s `outside <band>` is undefined for
`band: null` (oracles 7, 11 and the eight wind cases). **Proposed change:**
`sources: Array<{ label, url, note }>` (non-empty), plus a `bandText` string
on every oracle that `formatAnnotation` and the methods page both print.

### K17 — nit — Task 5 Behaviour: the outcome when all 8 halvings fail is unstated

"Each step is halved (up to 8 times) until the residual norm decreases"
leaves open what happens after the eighth failure: take the step anyway,
stop with `'diverged'`, or count it as an iteration and continue. All three
terminate within 20 iterations, but iteration and step counts differ between
executors. Only the failure path is affected: every table row accepts the
full step (`cal.mjs`: 3 iterations, 10 flights each).
**Proposed change:** "If no halving is accepted, return `{ ok: false,
reason: 'diverged' }`" (the unreachable-target case then fails after 5
iterations, 15 flights).

### K18 — nit — Task 7 / 11 seam: the methods page calibrates the table twice, synchronously the second time

Task 11 consumes `createModel` (for the calibration table) and
`createOracleContext()` ("one calibrated model shared by all oracles"), which
builds its own model. That is about 29,300 more RK4 steps plus the two
oracle-10 calibrations, and the signature gives no way to calibrate
incrementally. **Proposed change:** `createOracleContext(model = null)`
reuses a passed, fully calibrated model. Task 11 calibrates once,
incrementally (as the main page does), then builds the context from it.

## Recomputed values

All from `/tmp/claude-1000/plan-review-coverage/` (Node 22.22.2); plan value
and tolerance in brackets.

**Atmosphere (atm.mjs).** ρ₀ = 1.1839125 [1.18391 ± 1e-5 ok]. All eight
USSA-1976 table rows satisfy `table ≤ computed < table + 0.01` hPa [ok].
5,280 ft = 834.317691 hPa [834.318 ± 0.001 ok]. ρ/ρ₀ at 5,000 / 10,000 /
15,000 ft = 0.8320854 / 0.6878324 / 0.5645873 [± 1e-6 ok].
`MIN_PRESSURE_PA` = 57,206.808 [57,206.8 ± 0.1 ok]. 5,280 ft displays
24.6374 → `24.64` inHg, 83.4318 → `83.43` kPa, 834.3177 → `834.3` mbar,
ratio 0.8234075 [0.823408 ± 1e-6 ok]. Sea level 29.9213 → `29.92` inHg.
Round trip with derived constants ≤ 3e-12 m; with the spec's printed
literals up to 4.6e-3 m (K2).

**Flight (fl.mjs).** Vacuum 50 m/s, 30°: carry 220.7750363 m, apex
31.8661317 m, land 30.000000000° [± 1e-6 ok]. `rpmToRadPerS(2545)` =
266.5117768 [ok]. S(PGA Driver) = 0.074382 [0.07438 ± 1e-5 ok]. dt 0.05 vs
0.025: 2.6e-7 yd carry, 3.1e-7 yd apex, 3.1e-4° land [ok]. Tailwind lengthens
(273.69 m), headwind shortens (234.69 m) vs 256.12 m [ok]. NaN ratio →
nonfinite at step 1 [ok]. `kL: 1000` → **nonfinite at step 2**, not cap (K1);
`kL: 100` → cap at 1,201 steps. Steps for the PGA Driver: 152 / 130 at
ρ/ρ₀ = 1 / 0.564587 with k = 1, 139 / 117 calibrated [≤ 160 ok either way].
1,200 additions of 0.05 sum to 59.99999999999873, so the cap fires on step
1,201 [≤ 1,201 ok].

**Calibration and budgets (cal.mjs).** Every row converges in 3 iterations /
10 flights, residual ≤ 2.9e-5 yd [≤ 0.01 yd, ≤ 20 iterations ok].
ρ₀k_D 1.0893–1.4982, ρ₀k_L 0.9622–1.3190 [envelope 0.981–1.650 /
0.864–1.463 ok]; PGA Driver 1.0893 / 0.9912 [± 0.002 ok]; Jacobian condition
2.74–8.92. Landing/launch spin, calibrated PGA Driver 0.7774 [0.777 ± 0.005
ok]. Calibration total 29,291 steps [≤ 50,000 ok]; one recompute 2,736 /
2,609 / 2,449 steps at 5,000 / 10,000 / 15,000 ft [≤ 4,000 ok]; at most 139
steps per flight anywhere in range.

**Golden (cal.mjs).** All 30 golden values reproduce within 0.0048 yd/°
[tolerance 0.05 ok] — the golden values are reachable with the plan's
calibration (targets = published yards).

**Oracles (orc.mjs).** 1: +8.82 % (band +5…+12) · 2: −15.60 % (−8…−28) ·
3: −7.93° (−5…−13) · 4: +6.42 % · 5: mean +10.77 % (rows 8.30–12.75) ·
6: +11.32 % (+7…+16) · 7: Driver 7.55 / 7 Iron 11.32 / PW 10.66, ordering
true · 8a: 8.88 % · 8b: 6.04 % · 9a: no violation on a 250 ft grid ·
9b: displayed carry never decreases on 10 ft (11,523 flights) and 500 ft grids ·
10a: land 46.23° (gap −1.77) · 10b: 44.50° (gap −1.10) · 11: 4.51 ≤ 6.42 + 1 ·
12: all eight within ±5 yd / ±3° (worst −3.63 yd PGA HW20, −1.95° PGA HW10).
Every hard oracle passes; the plan's orientation values (8.8, −15.6, −7.9,
11.3, 46.2, 44.5) match.

**Presentation (misc.mjs).** `172/157` `+8/+7`; `32/29` `−1/−1`;
`210/192` `+1/±0`; `164/150` `±0/±0`; `47°` `−4°`; `51°` `±0°`;
8.036/164 → 4.8999999999999995 → `+4.9%`; −0.04/164 → `±0.0%`;
−3.78/39 → `−9.7%`; −1.25 % (e.g. −2.5/200, exactly representable) → `−1.3%`.
All match.

**Controls.** parseNumber cases are consistent with the stated grammar
(including `84.` → 84 and `1,2,3` → null). Display → retype → commit moves
the displayed elevation by at most 7 ft (11,760 ft, inHg) [≤ 15 ft ok].

## Non-findings

- Every number in "Recomputed values" matches the plan within its tolerance.
  The golden table is reachable, and the hard oracles pass with margin (the
  closest is 10a: a land gap of −1.77° against ±3°).
- Budgets have large margins, and "≤ 160 steps" holds whether or not the
  Driver is calibrated (152 / 130 vs 139 / 117), so that ambiguity is
  harmless.
- `steps ≤ 1201` is the right bound for a 60 s cap at dt 0.05: 1,200
  additions of 0.05 sum to 59.99999999999873.
- The `node --test "test/unit/*.test.js"` glob replaces the spec's "explicit
  list" safely. Node 22.22.2 expands it itself and skips a non-`.test.js`
  helper, which settles D9's concern.
- Seams: `Row` fields match `launchOfRow`, `calibrateRow` and `launchCells`.
  `FlightResult` is SI, `Delta` is yd/°, and present.js takes yd/°.
  `PA_PER` / `M_PER` keys match the unit selections. `mode` is
  `'abs' | 'pct'` in both State and Cell opts. Keys are `tour:index` in the
  Model, in `data-key` and in RF-1. Task order has no forward dependency:
  data.test reads `docs/research/`, which Task 1 moves in first.
- The parseNumber cases agree with the stated grammar. The present.js
  absolute and percent examples are arithmetically right in IEEE doubles
  (for example 8.036/164 = 4.8999999999999995 → `+4.9%`).
- Rulings: (1) `boot.js`. A failed module-graph fetch fires `error` on the
  `<script type="module">` element and never runs `app.js`, so only a classic
  script can report it. Sound. (2) favicon. Sound. (3) independent per-unit
  deltas. This is the spec's "per unit". (4) The `†` label appears only at
  elevation > 0, which keeps TrackMan's header text and labels the column
  indicative exactly when it shows model values. This is within §5.5 item 2.
  (5) The CDP smoke keeps every check in spec §8.2. Sound.
- The TrackMan image prints `°` on attack, launch and land cells, so
  `launchCells`' `-0.9°` / `10.4°` and the `39°` land value match the
  publication.
- `rowDelta(cal, row, 1)` "exactly zero" cannot fail given the short-circuit.
  It is spec-mandated (§8.1) and cheap, so it is not a finding.
- RF-1's final-state comparison would catch K3. It does not sample the
  intermediate `…` state, but present.js's pending unit test covers the
  text.

## Unverified concerns

- Whether headless Chrome driven over CDP serves the RF back/forward
  navigation from the bfcache (K11). Not run.
- `formatAnnotation` does not escape `%`. GitHub's workflow-command parser
  is believed to unescape only `%25`, `%0D` and `%0A` in data (plus `%3A` and
  `%2C` in properties), so `+9.0% outside …` should render verbatim. Not
  checked on a runner.
- RF-1 compares Chrome-rendered cells with values computed in Node 24.
  Both use V8's fdlibm-derived `Math.pow` / `hypot` / `atan2`, so the results
  are expected to be bit-identical. An ulp difference could flip a cell only
  at an exact `.5` rounding boundary. Not verified across the two V8
  versions.
