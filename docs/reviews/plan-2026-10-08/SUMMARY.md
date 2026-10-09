# Adversarial review of the implementation plan — dispositions

Target: `docs/superpowers/plans/2026-10-08-tmelevation.md` (first draft).
Three reviewers: `coverage.md` (spec coverage, seams, recomputed values —
every asserted number reproduced independently), `delivery.md` (Tasks 1, 13,
14 against GitHub and semantic-release behaviour), `browser.md` (Tasks 10–12,
every mechanism proved in Chrome 154 driven from Node 22). All findings below
were applied to the plan unless marked otherwise; task numbers refer to the
revised plan.

## Blocker

| ID | Finding | Disposition |
|---|---|---|
| E1 | Smoke asserts `v0.0.0`, so every deploy (stamped with the real tag) fails | `--expect-version`; `run.mjs` smokes `v0.0.0` and `v1.2.3` artifacts; deploy and the live check pass the tag (Tasks 12–14) |

## Major

| ID | Finding | Disposition |
|---|---|---|
| K1 | Cap test `kL: 1000` goes non-finite at step 2 | Replaced by a vacuum lob that reaches the cap at 1,201 steps (Task 4) |
| K3 | `deltasAt` memoised on ratio freezes `…` cells | Memo per entry + freshness unit test (Task 6) |
| K4 = E3 | Tag output lost if a plugin fails after the tag push | `!cancelled()` on the tag step, `git ls-remote` check, status function on deploy (Task 13) |
| E2 | Dry run on `worktree-init` exits before analysing | CI environment variables, pass only on "next release version is 1.0.0", verify loaded plugin versions in the npx cache (Task 13) |
| B1 | CSP check greps "Refused to", which Chrome 154 never prints | Fail on `Log.entryAdded` source `security` / level `error` and console errors/warnings (Task 12) |
| B2 | Watchdog waits for `ready`; background tabs throttle 23 timers | Watchdog checks `data-app="started"`; time-sliced calibration via `MessageChannel`; background-tab e2e (Tasks 10, 12) |
| B3 | Without bfcache Chrome restores stale select/slider values | `autocomplete="off"` on selects and slider, re-render on every `pageshow`, e2e with and without bfcache (Tasks 10, 12) |
| B11 = K5 | "Never overwrite the focused box" contradicts RF-2 and RF-3 | Decided by `state.edit`, not focus (Task 10) |

## Minor and nits

| ID | Disposition |
|---|---|
| K2 | Exponent and lapse factor derived from constants, used both ways (Task 3) |
| K6 | `airPathM` as a sixth RK4 state; tolerance 1e-5 (Task 4) |
| K7 = B8 | RF-3 checks the readout and visible deltas, not a carry change; metres slider example uses 1610 (Tasks 9, 12) |
| K8 | Vacuum-wind test compares trajectory outputs only (Task 4) |
| K9 | `rowStatus` maps failed altitude flights to `—` and the error state (Tasks 8, 10) |
| K10 | Static test for the methods page's sections and key statements (Task 11) |
| K11 | Back/forward e2e asserts agreement in both bfcache modes (Task 12) |
| K12 | DOM contract gains `controls`, `pinned`, `version`, `land-dagger`, `land-footnote`, `data-app` (Task 10) |
| K13 | Live typing accepts boundary display values within half a step (Task 9; Ruling) |
| K14 | Extra `package.json` scripts recorded (Rulings) |
| K15 | Visible delta `aria-hidden`; Δ group labelled (Task 10) |
| K16 | `sources` array; null-band annotation text; `%` escaped (Task 7) |
| K17 | All 8 halvings failing → `diverged` (Task 5) |
| K18 | `createOracleContext(model)` reuses the page's model (Tasks 7, 11) |
| E4 = B13 | `CHROME_NO_SANDBOX` decided at the first CI run, applied to both jobs that launch Chrome (Tasks 13, 14) |
| E5 | `release-notes.sh` mode 100755 + static test (Task 13) |
| E6 | commitlint also required; `strict` false; `integration_id` 15368 (Task 14) |
| E7 | Read existing environment policies first; add only missing ones (Task 1) |
| E8 | Accepted risk, recorded in Rulings: tag pushers can deploy (owner-only repository) |
| E9 | Canon template permissions allowed (Global Constraints) |
| E10 | Tag-push discriminator `startsWith(github.ref, 'refs/tags/')`; guard output gates later steps (Task 13) |
| E11 | `git for-each-ref --count=1` instead of `| head` under pipefail (Task 13, Global Constraints) |
| E12 | Concrete check of loaded plugin versions (Task 13) |
| E13 | Re-show PR title/description if changed (Task 14) |
| E14 | Non-deprecated github-plugin option names (Task 13) |
| B4 | `.scroller` is `position: relative` (Task 10) |
| B5 | Pinned row: one-line assertion, fixed-width readout, stable slider width (Tasks 10, 12) |
| B6 | `boot.js` also catches `window` `error` before start; syntax-error e2e (Tasks 10, 12) |
| B7 | RF-4 measures against `clientWidth` (Task 12) |
| B9 | RF-1 asserts the race actually happened (20× CPU throttle) (Task 12) |
| B10 | Smoke: each URL once, all with `?v=`, unused-preload warning fails; no side-effect or dynamic imports (Tasks 10, 12, Global Constraints) |
| B12 | Safe-area insets emulated and asserted (Task 12) |
| Engine ulp caveat | Node↔page comparisons use rounded text (Global Constraints) |
