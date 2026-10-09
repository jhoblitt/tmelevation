# Delivery review — tmelevation design spec (2026-10-08)

Target: /home/jhoblitt/github/tmelevation/docs/superpowers/specs/2026-10-08-tmelevation-design.md
Mandate: delivery design — architecture/testability, CI, automatic semver, GitHub Pages deploy, workflow security, repo conventions, licensing.

## Summary

No blockers. There are four majors, and they share a root: the release and deploy chain copies the `*-claude` reference's `@semantic-release/git` commit-back. That makes sense for a Claude plugin marketplace, which reads versions from the tree, but not for a Pages site. Combined with non-blocking CI and a hand-tag trigger, it lets a red model become a published-but-undeployed release (D1), leaves no way to redeploy an existing tag (D2), and gives the hand-tag path ways to skip silently, show the wrong version, or roll the site back (D3). The premise that CI cannot be merge-blocking exists only because of that commit-back (D4). The spec's factual claims about GitHub mostly hold (see Non-findings): GITHUB_TOKEN tags do not trigger workflows, a required check would reject the release push, Chrome is on the runner, and the reference rulesets are deletion plus non-fast-forward.

Recommended shape, which resolves D1–D7 together:

- `release.yml`: a `test` job (unit tests, hard oracles, smoke on both pages), then `release` (semantic-release **without** the git/changelog plugins; the output is the pushed tag, read in an `if: always()` step), then a `deploy` calling job (`contents: read`, `pages: write`, `id-token: write`; no `timeout-minutes`).
- `deploy.yml`: triggered by `workflow_call` and `workflow_dispatch(tag)`, with no tag-push trigger.
  - A `build` job (`contents: read`): validate the tag, check it is reachable from `main`, run the tests, stamp `version.js` from the tag, upload the Pages artifact.
  - A `deploy` job (`pages`/`id-token`, `environment: github-pages`): `deploy-pages` only.
- Repository setup: the ruleset gains `required_status_checks` (ci, commitlint; `do_not_enforce_on_create` or added after `init` merges); merge commits only; Pages `build_type: workflow` enabled before the `init` PR merges; the `init` PR carries a `feat:` commit. The `github-pages` environment keeps its default main-only policy, so §11 risks 4 and 5 disappear.

| ID | Sev | One line |
|---|---|---|
| D1 | major | Release is cut before any test runs; a red model yields a published, never-deployed version |
| D2 | major | No way to deploy an existing tag after a post-tag failure; re-runs cannot recover |
| D3 | major | Hand `v*` tag trigger: skipped by `[skip ci]`, stale `version.js`, fights semantic-release, can roll back, forces a tag env policy |
| D4 | major | "CI can't be required" holds only because of `@semantic-release/git`; drop it, stamp the version at deploy, require checks |
| D5 | minor | Calling job needs explicit `pages`/`id-token` and cannot carry `timeout-minutes` (actionlint error) |
| D6 | minor | Tests run in the job holding `id-token: write`/`pages: write`; split build/deploy |
| D7 | minor | Release version output mechanism undefined; `successCmd` misses the post-tag-failure case; lodash `${}` trap |
| D8 | minor | `--dump-dom` cannot see script errors and exits 0 on failed loads; `methods.html` untested |
| D9 | minor | Soft-oracle warnings invisible under the TAP reporter; bare `node --test` runs helpers |
| D10 | minor | Pages enablement missing from the setup order; the first merge may cut no release |
| D11 | minor | Squash merges let a non-conventional PR title bypass commitlint and mis-version |
| D12 | minor | Calibration costs 56 ms on a top desktop vs a 100 ms phone budget; no cost test |
| D13 | minor | "Every package pinned" overstated; floating graph runs with `contents: write` that reaches prod |
| D14 | nit | Node 22 is in maintenance (EOL 2027-04-30); no single version source |
| D15 | nit | Two OFL notices needed, visible font credit, Lato RFN vs subsetting |
| D16 | nit | TrackMan data carve-out only in README; add to `data.js` header / NOTICE |
| D17 | nit | `pages` group's no-cancel is an undeclared canon exception; never key it on `github.*` |
| D18 | nit | CodeQL scope vs the canon's CI-only Go helper |
| D19 | nit | `.claude/` harness dirs inside `docs/` would be committed |

## Findings

### D1 — major — §9.2, §9.3, §11 risk 5: a release is cut before anything tests it, so a red model produces a published, never-deployed version

**Problem.** `release.yml` runs semantic-release on every push to `main` in parallel with `ci.yml`; nothing in the release job runs the tests first (the reference has no test step: conventions-claude `.github/workflows/release.yml:25-58`). Because CI is deliberately not merge-blocking (§9.1), a red PR can be merged; semantic-release then tags `vX.Y.Z`, commits `CHANGELOG.md`/`version.js`, and publishes a GitHub Release, and only afterwards does the deploy job's test run fail. Result: a public release and tag that never reach the site, a version number the site skips, and a direct violation of §1 criterion 5 ("every tag on `main` deploys the site"). Risk 5 calls the deploy-time test run "the backstop", but by then the release has already happened.

**Evidence.** Reference release job steps: checkout, setup-node, semantic-release, with no test step (release.yml:25-58). semantic-release creates and pushes the tag before the publish/success plugins run (semantic-release v25.0.8 `index.js:204-214`).

**Fix.** Run the full unit suite (hard oracles included) and the smoke test in `release.yml` **before** semantic-release, either as steps in the release job ahead of the `npx` step or as a `test` job that `release` `needs:`. A red `main` then cuts no release. Keep the deploy-time run only if the tree being deployed can differ from the tree tested (see D4). State in §9.2 that no tag is created unless the tests pass on the exact commit being released.

### D2 — major — §9.2, §9.3: no recovery path when a tag is pushed but the run fails afterwards; "Re-run" cannot fix it

**Problem.** semantic-release pushes the tag before `@semantic-release/github` publishes and before `success` runs. If anything after the tag push fails (a GitHub API error in the github plugin, the deploy job, a Pages outage, a mis-set environment policy on the first run), the tag exists and the site is never updated. Re-running the release job does not help: a re-run "will also use the same `GITHUB_SHA` ... and `GITHUB_REF`" as the original event, so it checks out the old `github.sha`, which is now behind the pushed release commit, so semantic-release logs "The local branch main is behind the remote one, therefore a new version won't be published." and exits successfully with no output, and the deploy is skipped again. (Re-running only a failed deploy job may succeed, but re-runs are available only "up to 30 days after its initial run", and they never cover the case where the tag was pushed and then the release job failed.) The only remaining lever in the spec is a hand-pushed `v*` tag, which creates a *new* version (see D3).

**Evidence.** semantic-release v25.0.8 `index.js:88-95` (behind-remote exit), `index.js:204-214` (tag push precedes publish/success), `lib/git.js:296-302` (`isBranchUpToDate`). Re-run semantics: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs (same `GITHUB_SHA`/`GITHUB_REF`; 30-day limit). Tags point at the release commit, not the merge: `git tag --points-at 51b66a2` in conventions-claude gives `v1.6.0` (`chore(release): 1.6.0 [skip ci]`).

**Fix.** Add `workflow_dispatch` with a required `tag` input to `deploy.yml` (dispatched from `main`; the guard still requires the tag to be reachable from `main`). That one trigger covers every "deploy this existing tag" case: a failed run, a Pages outage, a first-run misconfiguration. Make the release job's version output robust to post-tag failures (D7). Pass the `tag` input to `run:` steps through `env:` (never `${{ inputs.tag }}` inline) and reject anything not matching `^v[0-9]+\.[0-9]+\.[0-9]+$` before checkout, in the same spirit as the canon's injection rule (`references/security.md`, "Workflow injection").

### D3 — major — §9.3: the hand-pushed `v*` tag trigger conflicts with semantic-release and can silently not deploy, deploy a wrong version string, or roll the site back

**Problem.** `push: tags: v*` "for tags created by hand" is the wrong recovery and override mechanism here:

1. **Silently skipped.** The obvious hand tag is on `main`'s HEAD, which after every release is the `chore(release): X [skip ci]` commit. GitHub applies skip instructions to `push` events, and a tag push is a `push` event. A reported real case: a tag-triggered publish workflow did not run because the tagged release commit carried `[skip ci]`. Nothing fails; nothing deploys.
2. **Wrong version on the site.** §9.3 says the deploy uses the tree as tagged because "the version is already in `site/js/version.js`". That holds only for semantic-release's tags. A hand tag's tree carries the *previous* release's string (or `dev`).
3. **Version-ownership conflict.** semantic-release derives `lastRelease` from `v*` tags reachable from the branch, so a hand tag becomes a release with no GitHub Release or changelog entry, and the next automatic version continues from it.
4. **Rollback and supersession.** A hand tag on an older `main` commit passes the reachability guard and redeploys old content. In the shared `pages` concurrency group it can also replace a pending release deploy, because by default only one pending run is kept and the older pending run is cancelled.
5. **Extra attack and configuration surface.** It is the only reason the `github-pages` environment must admit `v*` tags (§9.3 bullet 4, §11 risk 4). The default policy GitHub created on this account's workflow-source Pages repos admits `main` only.

**Evidence.** Skip scope: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs ("Skip instructions only apply to the push and pull_request events"; the message checked is "the commit message in a push"). Real-world tag case: https://github.com/parse-community/Parse-SDK-Flutter/pull/1092 (merged 2025-12-03; the fix removed `[skip ci]` from the `@semantic-release/git` message). Pending-run replacement: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency ("By default, any existing pending job or workflow in the same concurrency group will be canceled"). Default env policy: `gh api repos/jhoblitt/{green_maps,putttron}/environments/github-pages/deployment-branch-policies` returns only `{name: main, type: branch}`.

**Fix.** Drop the `push: tags` trigger. Use `workflow_call` (automatic) plus `workflow_dispatch` with a `tag` input (manual redeploy; D2). Both run with `github.ref = refs/heads/main`, so the `github-pages` environment keeps its default main-only policy, and risk 4 and the "admit `v*` tags" setup step disappear. If a hand-cut release is ever wanted, cut it through semantic-release, not by pushing a tag.

### D4 — major — §9.1, §9.2, §11 risk 5: the "CI cannot be merge-blocking" premise holds only because of `@semantic-release/git`, which this site does not need

**Problem.** §9.1's claim is correct: a required-status-check rule rejects the release commit push, because a push to a protected ref without passing required checks returns `GH006 ... Required status check ... is failing`. But the only push to `main` that semantic-release makes is the `@semantic-release/git` commit. Core pushes tags only (`git push --tags`), and its auth check is a `--dry-run` of an already up-to-date HEAD. The reference commits back because the Claude Code marketplace reads `plugin.json` versions from the tree (conventions-claude `.releaserc.yml` exec `prepareCmd`, git `assets`). A Pages site has no such consumer: the deploy job can stamp the version from the tag name. Copying the git plugin therefore buys only a `version.js`/`CHANGELOG.md` churn commit, and costs:

- merge-blocking CI (user requirement: "ci to run to check the model on every pr");
- merge-blocking commitlint, which semantic-release's correctness depends on;
- a tag on an untested commit;
- the `[skip ci]` hazard in D3.

A bypass actor does not rescue the git plugin cleanly: the documented bypass actors (admins, roles, teams, GitHub Apps, Dependabot) do not include the workflow `GITHUB_TOKEN`. It would take a GitHub App or deploy-key secret holding ruleset-bypassing write access, which adds privilege for no product benefit.

**Evidence.**
- Push rejection: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks.
- Core push behaviour: semantic-release v25.0.8 `lib/git.js:211` (`git push --dry-run --no-verify -- <url> HEAD:<branch>`) and `lib/git.js:240` (`git push --tags -- <url>`).
- Maintainer advice for exactly this conflict ("the simplest solution to your problem would be to remove the git plugin"): https://github.com/semantic-release/semantic-release/discussions/2557.
- Bypass list: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository.
- Current rulesets: `gh api repos/jhoblitt/<repo>/rulesets` → `[deletion, non_fast_forward]`, `bypass_actors: []` on all five reference repos.

**Fix.** Drop `@semantic-release/git` and `@semantic-release/changelog`. The tag then lands on the merge commit, which D1's pre-release test step has just tested. Release notes live in GitHub Releases, which the github plugin and `release-notes.sh` already produce. Keep `version.js` at `dev` in the tree. The deploy job writes `export const version = "<tag without v>"` into the staged copy of `site/` before uploading the Pages artifact (all deploy paths, D2/D3, then show the right version). Then add a `required_status_checks` rule (the `ci` jobs and `commitlint`) to the ruleset, either after the `init` PR merges or with `do_not_enforce_on_create: true` so the empty root-commit push is not rejected. This is still "the reference adapted only where this site differs": the site differs exactly in having no in-tree version consumer. If the user prefers to keep `CHANGELOG.md` in the tree, say so explicitly as the price of non-blocking CI.

### D5 — minor — §9.2, §9.4: the calling job needs its own `pages`/`id-token` grant and cannot carry `timeout-minutes`, and neither is stated

**Problem.** The deploy runs as a reusable workflow called from `release.yml`, whose top-level permissions are `contents: read` (the canon and the reference both require that). A called workflow can only keep or reduce the caller's token permissions, so the job in `release.yml` that does `uses: ./.github/workflows/deploy.yml` must itself declare `permissions: {contents: read, pages: write, id-token: write}`. Otherwise the nested job's request exceeds what the caller passes down and the run cannot start (exactly which ceiling applies when the calling job declares nothing is listed under Unverified concerns; an explicit grant removes the question). §9.4 assigns `pages`/`id-token` "for deploying" without saying that this applies to the caller job too, and actionlint does not catch the omission. Separately, §9.4 and the canon (`references/workflows.md` "Timeouts") require `timeout-minutes` on every job, but a reusable-workflow calling job is not allowed to have one. Following the spec literally fails actionlint and therefore `workflow-lint`.

**Evidence.**
- Permissions: https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations ("GITHUB_TOKEN permissions can only be the same or more restrictive in nested workflows"; "can be only downgraded (not elevated) by the called workflow").
- Allowed keys on a calling job (no `timeout-minutes`, no `environment`): https://docs.github.com/en/actions/reference/workflows-and-actions/reusable-workflows.
- actionlint v1.7.7 on a throwaway draft: `when a reusable workflow is called with "uses", "timeout-minutes" is not available`. The same draft, whose calling job grants neither `pages` nor `id-token`, passed with no diagnostic.

**Fix.** In §9.4, state that the `deploy` calling job in `release.yml` declares exactly `contents: read`, `pages: write` and `id-token: write`; that it is the one job without `timeout-minutes` (the called workflow's jobs carry the timeouts); and that `environment: github-pages` goes on the called job, never the caller.

### D6 — minor — §9.3, §9.4: tests and checkout run in the job that holds `pages: write` + `id-token: write`

**Problem.** §9.3 has one deploy job that checks out the tag, re-runs the tests (executing repository code), and deploys. Under the spec's own grant list that job holds an OIDC-minting `id-token: write` and `pages: write` while running `node --test`, `test/smoke.sh`, a local HTTP server and headless Chrome. The canon's least-privilege rule ("declares exactly that scope at job level") is better met by the shape GitHub documents for Pages.

**Evidence.** https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages: separate `build` and `deploy` jobs are the documented shape (single-job is allowed only as a simplification), and the deploy job "must have a minimum of `pages: write` and `id-token: write`". Canon: github-conventions 1.8.0 `references/workflows.md:36-41`.

**Fix.** Two jobs in `deploy.yml`:
- `build`: `contents: read`; checkout the tag; reachability guard; tests and smoke; stamp `version.js` (D4); `actions/upload-pages-artifact` of `site/`.
- `deploy`: `needs: build`; `pages: write` and `id-token: write`; `environment: github-pages`; `actions/deploy-pages` only, with no checkout and no repository code.

### D7 — minor — §9.2: the "version it published" output has no defined mechanism, and the obvious one misses the failure case that matters

**Problem.** semantic-release run through `npx` (not a marketplace action) has no built-in job output. The natural mechanism, `@semantic-release/exec` `successCmd` appending to `$GITHUB_OUTPUT`, runs only after every publish plugin succeeds. If the github plugin fails after the tag has been pushed, there is no output, so no deploy (D2). There is also a quoting trap: exec renders commands as lodash templates, which evaluate `${...}`, so `"${GITHUB_OUTPUT}"` fails at template time and must be written `"$GITHUB_OUTPUT"`.

**Evidence.**
- `@semantic-release/exec` v7.1.0 `lib/exec.js`: lodash `template(config[cmd])`, then `execa(script, {shell: true, env})`; its README says `successCmd` is the success step.
- semantic-release v25.0.8 `index.js:204-216`: tag push, then `plugins.publish`, then `plugins.success`.

**Fix.** Define the output as a separate step after semantic-release with `if: always()`: read the tag that points at the post-run HEAD (`git tag --points-at HEAD --list 'v*'`) and confirm it exists on the remote (`git ls-remote --tags origin`). Then any pushed tag deploys even if a later plugin failed. Spec the output as the tag name (`v1.2.3`), not the bare version, so the deploy input and the checkout ref are the same string.

### D8 — minor — §8.2: the smoke test as specified cannot observe "no script error", ignores Chrome's exit status semantics, and never loads `methods.html`

**Problem.** §8.2 asserts "both tables rendered ... and no script error" from `--dump-dom`. Measured with local Google Chrome:
- an uncaught error thrown after the table renders leaves the dumped DOM looking healthy and appears nowhere in stdout or stderr, unless `--enable-logging=stderr --v=0` is passed (then it appears as `INFO:CONSOLE ... "Uncaught Error: ..."`);
- Chrome exits 0 even for a 404 page or a failed page load, so only content assertions mean anything.

`methods.html`/`methods.js` are excluded from Node import (§7) and not loaded by the smoke test, so the page carrying the live calibration and oracle tables (§6 items 4 and 6) is exercised by nothing in CI.

**Evidence.**
- Local experiment (notes file, "Local Chrome experiment"): `--headless --virtual-time-budget=5000 --dump-dom` printed the rendered rows with 0 grep hits for the thrown error and exit 0. Adding the logging flags printed `"Uncaught Error: late failure in methods wiring", source: http://127.0.0.1:8766/js/app.js (5)`. A missing page gave exit 0 with a 456-byte error-page DOM.
- Chrome is present on the runner: actions/runner-images `Ubuntu2404-Readme.md` lists Google Chrome 154.0.8037.57 (`ubuntu-latest` = 24.04); `Ubuntu2604-Readme.md` lists it too.

**Fix.** Specify the smoke contract:
1. Each page sets a completion sentinel only after its wiring finishes (e.g. `document.documentElement.dataset.ready = "1"`), and records `error` and `unhandledrejection` events into a DOM attribute.
2. Load **both** `index.html` and `methods.html`, with `--enable-logging=stderr --v=0`; fail on any `Uncaught` or `CONSOLE` error line, on a missing sentinel, or on missing published values.
3. Ignore Chrome's exit code.

A sturdier alternative that still needs no npm dependency: drive Chrome via `--remote-debugging-port` from a Node 22 script using the global `WebSocket` (verified present in Node v22.22.2), subscribing to `Runtime.exceptionThrown`. Note the reference's own runner observation (conventions-claude `.github/workflows/validate.yml:94-96`) that bundled Chrome needs `--no-sandbox` on the runner; see Unverified concerns.

### D9 — minor — §8.1, §8.3: soft-oracle "warnings" are invisible in CI, and bare `node --test` runs every `.js` under `test/`

**Problem.** §8.3 says soft oracles "are reported as warnings". `node:test` has no warning status. In CI (non-TTY), Node 22's default reporter is TAP, which prefixes every line a test writes with `# `, so a `::warning::` workflow command printed from a test never becomes an annotation. `t.diagnostic()` likewise appears only as a `#` comment. Separately, a bare `node --test` (the obvious `npm test` script) treats every `.js` file under `test/` as a test file, helpers included. A helper for the smoke test's server or CDP driver would be executed as a "test".

**Evidence.** Local experiment with node v22.22.2 (notes file, "Local experiments"):
- the default reporter printed `# ::warning title=oracle 7::soft oracle out of band`;
- `--test-reporter=spec` printed it unprefixed;
- `test/helper.js` ran as `ok 1 - test/helper.js`;
- `node --test 'test/**/*.test.js'` did not run it.

**Fix.** Make the test command `node --test --test-reporter=spec 'test/**/*.test.js'`. Have the soft-oracle suite emit `::warning::` lines (visible with the spec reporter) and/or append a table to `$GITHUB_STEP_SUMMARY`. State in §8.3 that a soft failure is a passing test plus a visible warning.

### D10 — minor — §10, §9.2, §9.3: the setup order omits enabling Pages, and the first merge may cut no release at all

**Problem.** The new-repo flow the spec cites has no Pages step, and §10 lists none. If the `init` PR merges before Pages is set to "GitHub Actions" (`build_type: workflow`), the first release's deploy fails with `deploy-pages`' 404 "Ensure GitHub Pages has been enabled". Without D2's dispatch trigger there is then no way to deploy `v1.0.0`. Separately, "the first release is `v1.0.0`" holds only if the merge contains a releasable commit. The canon's root commit is `chore: repository root`, and scaffolding commits are naturally `chore:`/`ci:`/`build:`, which release nothing, so the site would not exist until the first `feat`/`fix`.

**Evidence.**
- github-conventions 1.8.0 `references/new-repo.md:17-45`: create, ruleset, delete-branch-on-merge, root commit, `init` PR; no Pages step.
- actions/deploy-pages `src/internal/deployment.js:117-119` (404 message).
- semantic-release v25.0.8 `index.js:180` ("There are no relevant changes, so no new version is released."); `lib/definitions/constants.js:3` (`FIRST_RELEASE = "1.0.0"`).

**Fix.** Add to §10, in order, after the ruleset step and before the `init` PR is merged:
1. `gh api -X POST repos/jhoblitt/tmelevation/pages -f build_type=workflow`.
2. Confirm that the `github-pages` environment's deployment policy is main-only (or add `v*` only if D3 is rejected).

Require the `init` PR to carry at least one `feat:` commit (e.g. `feat: tour-average tables at elevation`) so that its merge cuts `v1.0.0` and deploys.

### D11 — minor — §9.2, §10: merge method unspecified; a squash merge bypasses commitlint and silently mis-versions

**Problem.** semantic-release reads the commits on `main`. With a squash merge of a multi-commit PR, GitHub's default squash commit subject is the **PR title**, which commitlint never checks: it lints the PR's commits. A non-conventional title releases nothing (silently, no deploy). A mistyped one releases the wrong bump. GitHub enables squash by default, and 4 of the 5 reference repos leave it on; only rook-claude is merge-commit-only.

**Evidence.**
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests: the default uses "the pull request title and list of commits if the pull request contains 2 or more commits".
- `gh api repos/jhoblitt/<repo>`: `allow_squash_merge: true` on conventions-, go-conventions-, skill-review- and mine-directives-claude; rook-claude has squash and rebase off.
- github-conventions `templates/commitlint.yml:30-33` lints commits only.
- The reference history uses merge commits ("Merge pull request #26 ...").

**Fix.** In §10, set `gh repo edit --enable-merge-commit --enable-squash-merge=false --enable-rebase-merge=false` alongside `--delete-branch-on-merge`. Alternatively, keep squash and add a PR-title lint, but merge-commit-only matches how the reference repos actually merge and needs no extra workflow.

### D12 — minor — §5.3, §8.1, §9.2: the calibration-at-load budget is not met even on a fast desktop by a straightforward implementation, and nothing tests it

**Problem.** §5.3 budgets the per-row fit at "under 100 ms on a mid-range phone" (about 230 flights), and §5.4 recomputes 23 flights per animation frame. Implementing §5.2 exactly (RK4, dt = 0.01 s) and timing it in Node 22 (V8, as in Chrome) on an AMD Ryzen 9 7950X3D, a top-end desktop CPU:
- 230 flights take **55.7 ms** with an allocation-free implementation and 112 ms with an array-per-step one;
- 192.6 ms under `--jitless` (JIT-less engines, e.g. iOS Lockdown Mode);
- a single 23-flight pass (the per-frame cost) takes 5.85 ms.

A mid-range phone is several times slower than this host (multiplier not measured), so 100 ms is very unlikely, and the per-frame recompute risks exceeding a 16 ms frame. The calibration also runs again on every `methods.html` load. No test bounds either cost.

**Evidence.** Benchmark scripts `/tmp/claude-1000/review-delivery/bench/bench.mjs` and `bench2.mjs` (throwaway; numbers logged in the notes file), mean 721 RK4 steps per flight.

**Fix.** Pick one:
- (a) Keep "computed, never stored", but take calibration off the critical path. At elevation 0 the page needs no model (cells equal the published values and the delta line is hidden, §4.3), so render immediately and calibrate after first paint or in a module Worker. Coalesce slider recomputes and, if needed, compute only the dragged state at the end of a gesture.
- (b) Store the fitted `k_D`/`k_L` in a generated module, with a unit test that refits and asserts equality. That removes the staleness argument in §5.3, because CI fails on a stale copy, and it needs D4's merge-blocking CI to be a real guard.

Either way, add a deterministic cost test (e.g. at most N flights per row to converge) rather than a wall-clock one.

### D13 — minor — §9.2: "every package pinned to an exact version" overstates the npx pin; the unpinned graph runs with `contents: write`

**Problem.** The `npx` line pins the five named packages, but the plugins the spec relies on, `@semantic-release/commit-analyzer`, `release-notes-generator` and `github`, are semantic-release's own dependencies and resolve through caret ranges, as does every transitive package. `npm_config_ignore_scripts` stops install scripts only. The floating code still executes at run time inside semantic-release with a `contents: write` token, and in this design `contents: write` reaches production: whoever can push a tag to `main`'s history gets it deployed. The reference accepts the same risk knowingly (its comment: "The npx graph below is not lockfile-pinned"). Scorecard does not flag this line, so no tool will raise it.

**Evidence.**
- semantic-release v25.0.8 `package.json`: `@semantic-release/commit-analyzer ^13.0.1`, `@semantic-release/github ^12.0.0`, `@semantic-release/release-notes-generator ^14.1.0`.
- conventions-claude `.github/workflows/release.yml:47-50`.
- Scorecard for jhoblitt/conventions-claude (2026-10-07): Pinned-Dependencies flags only `validate.yml:32` (`npm install -g`), not the `npx` line.

**Fix.** Reword §9.2 to "the top-level packages are pinned; the transitive graph is not". Optionally close the gap with a committed `release/package.json` plus lockfile used only by the release job (`npm ci --ignore-scripts --prefix release`, then run `release/node_modules/.bin/semantic-release`). Dependabot's `npm` ecosystem would then bump it, replacing the reference's "bump by hand" comment. If the reference's posture is kept deliberately, say so.

### D14 — nit — §8.1, §9.2: Node 22 is in maintenance with seven months left, and the version has no single source

**Problem.** Node 22 entered maintenance on 2025-10-21 and reaches end of life on 2027-04-30. Node 24 is LTS until 2028-04-30, and semantic-release 25 supports it (`engines: ^22.14.0 || >= 24.10.0`). Three workflows (ci, release, deploy) would each hard-code a version. Runner defaults also differ: `ubuntu-24.04` ships Node 22 by default and `ubuntu-26.04` ships Node 24, so a job that forgets `setup-node` changes Node when `ubuntu-latest` moves.

**Evidence.** nodejs/Release `schedule.json` (v22 maintenance 2025-10-21, end 2027-04-30; v24 end 2028-04-30). actions/runner-images `Ubuntu2404-Readme.md` (Node.js 22.23.3 default) and `Ubuntu2604-Readme.md` (Node.js 24.21.0 default). semantic-release v25.0.8 `package.json` engines.

**Fix.** Put `"engines": {"node": ">=24"}` in `package.json` and a `.nvmrc` containing `24`. Every `setup-node` step uses `node-version-file: .nvmrc`, mirroring the canon's "go-version comes from go.mod" rule.

### D15 — nit — §4.4, §7, §10: font licensing needs two notices, visible credit, and care with Lato's Reserved Font Name

**Problem.** The spec has one "OFL text" under `site/fonts/`. Oswald and Lato carry different copyright lines, and OFL §2 requires each copy to contain "the above copyright notice and this license", so two licence files are needed. Lato's licence reserves the font name "Lato". The OFL FAQ treats subsetting a webfont as modification (no RFN use), and treats format conversion as modification unless the WOFF2 holds unchanged font data with absent or matching metadata. Downloading Google Fonts' unicode-range subsets, or running `pyftsubset`, yields a Modified Version. The FAQ also asks that credit and licence information be "sufficiently visible to your users", but the footer (§4.1 item 3) and the methods page (§6) list no font credit.

**Evidence.** google/fonts `ofl/lato/OFL.txt:1` ("with Reserved Font Name "Lato""), `ofl/oswald/OFL.txt:1` (no RFN), `OFL.txt:56-66` (conditions 2 and 3). https://openfontlicense.org/ofl-faq/ entries 2.2, 2.2.1, 2.4 and 2.6.

**Fix.** Ship `site/fonts/Lato-OFL.txt` and `site/fonts/Oswald-OFL.txt`. Use full, unsubsetted fonts converted losslessly (or upstream WOFF2), or, if subsetting, keep the Lato copy's internal name free of "Lato". Add a "Fonts: Oswald, Lato (SIL OFL 1.1)" credit with links in the methods page's Sources section.

### D16 — nit — §10: the TrackMan carve-out from Apache-2.0 lives only in the README

**Problem.** `LICENSE` (Apache-2.0) at the root reads as covering every file. The README sentence that the tour-average figures "are not covered by the repository's licence" is easy to lose when `site/js/data.js` is copied or the site is mirrored, and `data.js` is also the file that ships to every visitor.

**Evidence.** §10 bullet 3. github-conventions `references/new-repo.md:68-72` (verbatim Apache-2.0 at the root).

**Fix.** Put the same statement, with the source URL, in a header comment in `site/js/data.js` and at the top of `docs/research/trackman-2023-tour-averages.md`, and optionally in a `NOTICE` file.

### D17 — nit — §9.3, §9.4: the `pages` group's `cancel-in-progress: false` is a canon exception the spec does not declare, and the group key must not use `github.workflow`

**Problem.** The canon allows a constant, never-cancelled group only for "a release workflow". `deploy.yml` uses one too, which is right for a Pages deploy but should be stated as a second named exception, so that `github-converge` does not later "fix" it. Under `workflow_call`, `github.*` in the called workflow is the caller's context, so a canon-style key (`${{ github.workflow }}-…`) would evaluate to `release-…`. The docs warn against reusing a group value across caller and called workflows (it cancels runs). The spec's constant `pages` is safe, but nothing records why.

**Evidence.** github-conventions `references/workflows.md:43-59`. https://docs.github.com/en/actions/reference/workflows-and-actions/reusable-workflows ("the github context is always associated with the caller workflow"; "don't use the same value for jobs.<job_id>.concurrency.group in the called and caller workflows").

**Fix.** In §9.4, state: "`deploy.yml` uses the constant group `pages`, `cancel-in-progress: false` (a deploy must not be cut off mid-publish); it never derives the key from `github.*`, because under `workflow_call` that is the caller's context."

### D18 — nit — §10: CodeQL scope and the canon's CI-only Go helper

**Problem.** The canon's commitlint lands `.github/tools/breaking-footer/main.go` and runs it with `go run`, so the repository contains Go. The canon's CodeQL rule is "one language per job; a second language is a second job". Read literally, that asks for a Go job, which `autobuild` cannot build here: there is no `go.mod`, just one file run as a script.

**Evidence.** github-conventions `templates/commitlint.yml:35-40`; `references/security.md:15-21`.

**Fix.** In §10, state "CodeQL: `javascript-typescript`, `build-mode: none`, one job; the CI-only `breaking-footer` Go file is out of scope". Consider an `actions` job as well, since workflows here hold `pages`/`id-token` grants (not verified against GitHub's docs in this review).

### D19 — nit — §10: `docs/` currently contains harness artifacts that a wholesale "commit `docs/research/`" would publish

**Problem.** `docs/research/.claude/.cc-writes` and `docs/superpowers/specs/.claude/.cc-writes` exist alongside the research files. The root `.claude/` also holds local settings and session state.

**Evidence.** `find /home/jhoblitt/github/tmelevation/docs -name .claude` (notes file).

**Fix.** Land a `.gitignore` with `.claude/` (matching at any depth) in the `init` branch, or state which `.claude` files, if any, are intentionally committed.

## Unverified concerns

- **Chrome's sandbox on the runner.** The reference observes that "the runner blocks unprivileged user namespaces, so the bundled Chrome cannot start its own sandbox" (conventions-claude `.github/workflows/validate.yml:94-96`) and passes `--no-sandbox` to puppeteer's Chrome. Whether the preinstalled `/usr/bin/google-chrome` (with its setuid helper) starts sandboxed on `ubuntu-24.04` was not tested; locally it ran sandboxed outside the review sandbox. Plan for `--no-sandbox` with the reference's justification (the browser renders only this repo's own pages in a throwaway job) if the first CI run fails.
- **`[skip ci]` and tag pushes.** GitHub's docs say only that skip instructions apply to `push` events and check "the commit message in a push". The tag-specific behaviour (D3 item 1) rests on a merged third-party fix (parse-community/Parse-SDK-Flutter#1092) and was not reproduced here (that would mean pushing to a real repository). D3's fix makes the question moot.
- **Phone performance multiplier (D12).** Only desktop timings were measured. How far a mid-range phone's JS falls short of a Ryzen 9 7950X3D was not measured.
- **TrackMan trade dress.** The site deliberately reproduces TrackMan's palette and table header treatment, and quotes the "PGA TOUR AVERAGES" titling. Whether that goes beyond nominative use is a legal question outside this review. The non-affiliation line (§4.1) is the right mitigation; avoid TrackMan logos.
- **Called-workflow permissions when the calling job declares none.** The docs say the called workflow then gets "the default permissions for the GITHUB_TOKEN". Whether that means the caller's top-level `contents: read` or the repository default was not tested; D5's explicit grant avoids depending on it.

## Non-findings

Claims in the spec that were checked and hold:

- **§9.3: semantic-release's tag cannot trigger `deploy.yml`, so `workflow_call` is needed.** True: "events triggered by the GITHUB_TOKEN will not create a new workflow run" except `workflow_dispatch`/`repository_dispatch` (https://docs.github.com/en/actions/concepts/security/github_token).
- **§9.1: a required-check rule would reject the release-commit push.** True (GH006 on push; https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks; the REST rule text is "must pass before the ref is updated"). D4 argues the premise is avoidable, not false.
- **§9.1: the reference rulesets carry only deletion and non-fast-forward.** True for all five `*-claude` repos (`gh api .../rulesets`; `bypass_actors: []`).
- **§9.2: tags are `v<version>` and the first is `v1.0.0`.** True (`FIRST_RELEASE = "1.0.0"`), conditional on a releasable commit (D10).
- **§9.3 guard: "tagged commit reachable from `main`" is correct for semantic-release's tags.** The tag points at the release commit that the git plugin pushed to `main` (`git tag --points-at 51b66a2` gives `v1.6.0` in conventions-claude). The deploy checkout needs `fetch-depth: 0` (or an explicit fetch of `main`) for `git merge-base --is-ancestor` to work. With D4, the tag sits on the merge commit itself.
- **`[skip ci]` does not break the `workflow_call` path.** The deploy runs inside the push-to-`main` run of the merge commit; the `[skip ci]` release commit is pushed by `GITHUB_TOKEN`, which triggers nothing anyway.
- **Concurrency: no caller/called deadlock.** Constant groups `release` (caller) and `pages` (called) differ, and the docs warn only about identical values. The release group's "only one pending run" replacement is harmless for semantic-release, because the surviving later run releases every commit since the last tag, and an earlier run that finds itself behind `main` exits without releasing (`index.js:88-95`).
- **§9.3: environment and ref for the `workflow_call` deploy.** `environment:` is allowed on the called job (not the caller), and the run's `github.ref` is the caller's `refs/heads/main`, which the default `github-pages` policy admits (`{name: main, type: branch}` on this account's workflow-source Pages repos). Side note: `deploy-pages` records the Pages deployment against `GITHUB_SHA` (`src/internal/context.js:8`), i.e. the merge commit, not the tagged release commit. With D4 the two coincide.
- **§8.2: Chrome is preinstalled on GitHub's Ubuntu runners.** True: Google Chrome 154 on `ubuntu-24.04` (= `ubuntu-latest`) and `ubuntu-26.04` (actions/runner-images readmes, image 20260927).
- **§7: modules import in Node with `"type": "module"`.** A root `package.json` with `"type": "module"` let `node --test` import `../site/js/units.js` with browser-style relative specifiers (local experiment). No conflict between browser and Node module resolution.
- **§10: Dependabot for GitHub Actions only.** Correct; there is no npm manifest. The `npx` pins are invisible to Dependabot, as the reference's comment already says.
- **§10: Scorecard and the `npx` line.** Scorecard's Pinned-Dependencies does not flag the reference's `npx --package x@y` invocation (2026-10-07 result), so copying it costs no score. Branch-Protection does warn "no status checks found to merge onto branch 'main'", which D4 would clear.
- **Licensing: no TrackMan images are committed.** `docs/research/` holds only Markdown transcriptions that link to the source JPGs.

## Sources

GitHub docs (fetched 2026-10-08):
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs
- https://docs.github.com/en/actions/reference/workflows-and-actions/reusable-workflows
- https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency
- https://docs.github.com/en/actions/concepts/security/github_token
- https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/troubleshooting-rules
- https://docs.github.com/en/rest/repos/rules
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs

Upstream source (raw.githubusercontent.com):
- semantic-release v25.0.8: `index.js`, `lib/git.js`, `lib/definitions/plugins.js`, `lib/definitions/constants.js`, `lib/get-next-version.js`, `package.json`
- @semantic-release/exec v7.1.0: `lib/exec.js`, `README.md`
- actions/deploy-pages main: `src/internal/deployment.js`, `src/internal/context.js`
- actions/runner-images main: `README.md`, `images/ubuntu/Ubuntu2404-Readme.md`, `images/ubuntu/Ubuntu2604-Readme.md`
- nodejs/Release main: `schedule.json`
- google/fonts main: `ofl/lato/OFL.txt`, `ofl/oswald/OFL.txt`

Other:
- https://github.com/semantic-release/semantic-release/discussions/2557
- https://github.com/parse-community/Parse-SDK-Flutter/pull/1092
- https://openfontlicense.org/ofl-faq/
- https://api.scorecard.dev/projects/github.com/jhoblitt/conventions-claude

Local, read-only:
- /home/jhoblitt/github/conventions-claude: `.github/workflows/{release,validate,codeql,commitlint,workflow-lint,scorecard}.yml`, `.releaserc.yml`, `.github/scripts/release-notes.sh`, `git log`, `git tag --points-at`
- /home/jhoblitt/github/{go-conventions,rook,skill-review,mine-directives}-claude: `release.yml`, `.releaserc.yml` diffs
- github-conventions 1.8.0: `SKILL.md`, `references/{new-repo,workflows,security,commits}.md`, `templates/*`
- `gh api` (read-only): rulesets and merge settings of the five `*-claude` repos; Pages and `github-pages` environment policies of jhoblitt/green_maps and jhoblitt/putttron

Throwaway experiments (not part of the project): `/tmp/claude-1000/review-delivery/{nodetest,smoke,wf,bench}`
