# Plan review: delivery (Tasks 1, 12, 13, 14) — 2026-10-08

Target: `docs/superpowers/plans/2026-10-08-tmelevation.md`
Mandate: attack the repository, workflow, release and deployment tasks for steps that will fail,
mis-configure the repo, leak privilege, or silently not release/deploy.
Evidence log: `delivery.md.notes.md` beside this file. Plan line numbers refer to the 605-line plan
as read on 2026-10-08.

## Summary

One blocker and one major, both of the same kind: the plan's pre-merge checks do not exercise the release and deploy paths they claim to cover, so the defects surface only after `v1.0.0` is tagged and published.

- **E1 (blocker):** the smoke test asserts footer `v0.0.0`, but `deploy.yml` runs it on a `$TAG`-stamped artifact, so every deploy fails at the smoke step.
- **E2 (major):** the Task 13 dry run, run from the `worktree-init` branch, exits 0 at semantic-release's branch check without analysing a commit. Once that is fixed, it would fail in `release-notes.sh` (`GITHUB_REPOSITORY` unset).

The remaining findings are minor or nit:

- the spec's "tag survives a post-tag failure" guarantee is dropped (E3);
- the Chrome no-sandbox fallback is not carried to the deploy job (E4);
- the notes script's executable bit is unspecified (E5);
- commitlint is not required (E6);
- the environment-policy calls are not idempotent against the `main` policy GitHub creates when Pages is enabled (E7);
- the `v*` tag policy lets any tag push deploy arbitrary content, because the guards run from the tag's own workflow file (E8);
- the permissions constraint contradicts the canon templates (E9);
- smaller plumbing points (E10–E14).

Most of the GitHub mechanics the plan relies on check out (see Verified behaviours):

- the Pages, ruleset and merge calls;
- the environment ref evaluation for each trigger;
- `origin/main` after a tag checkout;
- semantic-release's local tag on the merge commit;
- the pin-dedupe rule;
- the concurrency keys;
- the calling-job permissions;
- the live URL.

| ID | Sev | Task / step | One line |
|---|---|---|---|
| E1 | blocker | 12 smoke × 13 deploy × 14.6 | Smoke hard-codes footer `v0.0.0`; deploy builds `$TAG` → every deploy fails after release |
| E2 | major | 13.3 | Dry run on `worktree-init` exits 0 at the branch check; then `release-notes.sh` needs `GITHUB_REPOSITORY` |
| E3 | minor | 13 release.yml | Tag step and deploy job lack `!cancelled()`; a post-tag failure leaves the tag undeployed (spec §9.2, D7) |
| E4 | minor | 13 ci/deploy | `CHROME_NO_SANDBOX` fallback only in `ci.yml`; `deploy.yml` build runs Chrome too |
| E5 | minor | 13 | `release-notes.sh` must be `100755`; exec runs it by path |
| E6 | minor | 14.4 | commitlint not required; `strict_…_policy`/`integration_id` undecided |
| E7 | minor | 1.3.6 | Pages already creates `github-pages` + `main` policy; duplicate POST → 303 → may stop Step 3 |
| E8 | minor | 1.3.6 × 13 | `v*` tag policy + tag trigger: guards live in the tag's own `deploy.yml`; any tag push can deploy anything |
| E9 | minor | Global Constraints | "Grants only as §9.4" contradicts Scorecard/commitlint canon grants |
| E10 | nit | 13 deploy.yml | `github.event_name` is `push` under `workflow_call`; guard/output plumbing unstated |
| E11 | nit | 13 deploy.yml | `git tag … \| head -n1` → exit 141 under `shell: bash` somewhere between 200 and 1,000 tags; use `for-each-ref --count=1` |
| E12 | nit | 13.3 | "Plugins resolve to pins" is not visible in the log; give a concrete check |
| E13 | nit | 1, 14.3 | New-repo procedure reordered and the PR deferred; re-gate if the description changes |
| E14 | nit | 13 .releaserc | `successComment/failComment/failTitle: false` deprecated in github 12 |

## Findings

### E1 — blocker — Task 12 (smoke contract) × Task 13 (`deploy.yml` build) × Task 14 Step 6: the smoke test hard-asserts footer `v0.0.0`, but deploy runs it on a `$TAG`-stamped artifact, so every deploy fails after the release is published

**Problem.** Task 12 binds the smoke behaviour to "the footer shows `v0.0.0`" (plan l.526) with no input that changes it; the only version-related interface is "default: build a `v0.0.0` artifact" (l.522). Task 13's build job builds `node scripts/build-artifact.mjs "$TAG" _site` and then runs `node test/browser/smoke.mjs _site` (l.561), so the served footer is `v1.0.0` and the smoke assertion fails. Task 14 Step 6 then expects the same script to report footer `v1.0.0` against the live URL (l.582), which the Task 12 contract cannot express either. Nothing before the merge runs the smoke on a non-`v0.0.0` artifact (`npm run test:browser` builds `v0.0.0`, l.522), so the first time this bites is the first release: `v1.0.0` is tagged and its GitHub Release published by the `release` job, then `deploy / build` goes red at the smoke step and the site is never published — the D1-class outcome the spec was rewritten to prevent.

**Evidence.** Plan l.522, l.526, l.561, l.582 (quoted in notes, "Plan-text facts").

**Proposed change.** Give the smoke an explicit expected version: `smoke.mjs <artifactDir|baseUrl> [--expect-version vX.Y.Z]` (default `v0.0.0` only when it builds its own artifact). `deploy.yml` passes `--expect-version "$TAG"`; Task 14 Step 6 passes `--expect-version v1.0.0`. Add a Task 12 test case that builds `v1.2.3` into a temp dir and runs the smoke against it with `--expect-version v1.2.3` (and expects failure with `v0.0.0`), so the deploy path is exercised before merge.

### E2 — major — Task 13 Step 3: the semantic-release dry run cannot compute `1.0.0` as written; it exits 0 at the branch check, and would then fail in `release-notes.sh`

**Problem.** The dry run is run locally from the EnterWorktree tree, whose branch is `worktree-init` (plan l.88, l.104), with `--branches init`. Outside CI, semantic-release takes the current branch from env-ci's git service, i.e. `git rev-parse --abbrev-ref HEAD` = `worktree-init`; it then looks that name up among the configured branches, finds none, logs "This test run was triggered on the branch worktree-init, while semantic-release is configured to only publish from init, therefore a new version won't be published." and returns `false` with exit 0 — before `analyzeCommits` and `generateNotes`. So the step "passes" without checking any of what it claims (preset wiring, release rules, the exec notes command, the next version). Once the branch name is fixed, `generateNotes` does run in dry-run mode, and exec's `generateNotesCmd` runs `release-notes.sh`, which aborts on `repo="${GITHUB_REPOSITORY:?…}"`; with `GITHUB_SHA` unset its notes would also be anchored on remote `main` (the empty root commit) rather than the release head. This is the only pre-merge exercise of the release configuration, so any config error (including E5) otherwise surfaces only after the merge.

**Evidence.**
- semantic-release 25.0.8 `index.js:66-78` (branch lookup and early `return false`); `lib/definitions/plugins.js` (`verifyConditions`, `analyzeCommits`, `verifyRelease`, `generateNotes` have `dryRun: true`); `index.js:193-200` (generateNotes runs before the dry-run tag skip).
- env-ci 11.2.0 `index.js` (falls back to the git service when no CI is detected), `lib/git.js:11-31` (`rev-parse --abbrev-ref HEAD`), `services/github.js` (branch from `GITHUB_REF`, detection by `GITHUB_ACTIONS`).
- `release-notes.sh:7` and `:15` (reference copy).

**Proposed change.** Run the dry run with the GitHub Actions identity spelled out, so env-ci and `release-notes.sh` see what CI will see:
`GITHUB_ACTIONS=true GITHUB_EVENT_NAME=push GITHUB_REF=refs/heads/init GITHUB_REPOSITORY=jhoblitt/tmelevation GITHUB_SHA=$(git rev-parse HEAD) GITHUB_TOKEN=$(gh auth token) npx --yes <pins> semantic-release --dry-run --no-ci --branches init` (unsandboxed: npx download, `gh`, SSH remote). Expected log lines: "Run automated release from branch init … in dry-run mode", "There is no previous release, the next release version is 1.0.0", and "Release note for version 1.0.0:" followed by the commit-derived sections plus whatever `release-notes.sh` appends. State that exit 0 without those lines is a failure.

### E3 — minor — Task 13 `release.yml`: the tag output does not survive a post-tag failure, contrary to spec §9.2 and the D7 fix

**Problem.** Spec §9.2 (l.545-547) says the tag output "holds even if a later plugin step fails after the tag was pushed". semantic-release creates the tag locally and pushes it before `publish`/`success` (so a GitHub-API failure in `@semantic-release/github` leaves a pushed tag and a failed step). The plan's step is "Then a step writes `tag=$(git tag --points-at HEAD --list 'v*')`" (l.557) with no status condition, so it is skipped when the semantic-release step fails; and the `deploy` calling job is `if: needs.release.outputs.tag != ''` (l.558) with no status function, so it is skipped whenever `release` fails, even if the output were set. Result: a pushed, undeployed tag and a red run. (Recovery exists — by the code paths cited, "Re-run failed jobs" finds the tag on HEAD, releases nothing, exits 0 and then outputs it (not run); and the dispatch trigger works — so this is not silent, but it is the case the spec promised to handle automatically.)

**Evidence.** semantic-release 25.0.8 `index.js:202-214` (tag, push, notes push, then `publish`, then `success`); `lib/git.js:227-241`. Plan l.557-558; spec l.545-547; prior review D7 fix ("a separate step after semantic-release with `if: always()` … confirm it exists on the remote").

**Proposed change.** Tag step: `if: ${{ !cancelled() }}`; output the tag only if `git ls-remote --exit-code --tags origin "refs/tags/$tag"` succeeds (a tag created locally whose push failed must not be deployed). Deploy calling job: `if: ${{ !cancelled() && needs.release.outputs.tag != '' }}`.

### E4 — minor — Task 13: the `CHROME_NO_SANDBOX` fallback is scoped to `ci.yml`'s `browser` job, but `deploy.yml`'s build job runs Chrome too

**Problem.** The plan says "if Chrome cannot start sandboxed on the runner, set `CHROME_NO_SANDBOX: '1'` in this job's `env`" for `ci.yml` `browser` only (l.554). `deploy.yml`'s `build` job runs `node test/browser/smoke.mjs _site` (l.561), which launches the same Chrome through the same `cdp.mjs`. If the fallback is needed, the PR is fixed and goes green, the merge cuts `v1.0.0`, and the deploy's build job then fails at Chrome launch — again post-release.

**Evidence.** Plan l.521 (`--no-sandbox` only when `CHROME_NO_SANDBOX=1`), l.554, l.561. Whether the runner needs it is unverified (see Unverified concerns).

**Proposed change.** State the fallback once and apply it to every job that launches Chrome: `ci.yml` `browser` and `deploy.yml` `build` (the `release.yml` `test` job inherits it through `ci.yml`). Simplest: decide it once in the PR's first CI run and carry the same `env:` line and comment in both workflows.

### E5 — minor — Task 13: `.github/scripts/release-notes.sh` "verbatim copy" does not say the file must be executable

**Problem.** `@semantic-release/exec` renders `generateNotesCmd` and runs it through a shell; the command starts with the path `.github/scripts/release-notes.sh`, which needs the executable bit. The reference is committed as `100755`. A file created with an editor/Write tool is `0644`, so `generateNotes` fails with "Permission denied" (exit 126) on the first real release (before tagging — red, nothing published), and with E2 nothing catches it before merge.

**Evidence.** `@semantic-release/exec@7.1.0` `lib/exec.js:11-16` (`template(...)`, `execa(script, {shell: true})`); `git ls-files -s .github/scripts/release-notes.sh` in conventions-claude → `100755`.

**Proposed change.** "Copy with `cp` (preserving mode) and verify `git ls-files -s .github/scripts/release-notes.sh` shows `100755` before committing."

### E6 — minor — Task 14 Step 4: only `unit` and `browser` become required; commitlint, on which §9.1's merge-commit rationale depends, stays advisory, and the ruleset body is under-specified

**Problem.** Spec §9.1 (l.519-521) justifies merge-commit-only by "every commit semantic-release analyses has passed commitlint"; that is only enforced if the commitlint check is required (the prior review's D4 fix named "the `ci` jobs and `commitlint`"). The plan requires `unit` and `browser` only (l.580). A non-conventional commit then merges silently and releases nothing (or a typo'd type mis-versions). Separately, the `required_status_checks` rule has a required `strict_required_status_checks_policy` field the plan does not decide, and without `integration_id` any status/check named `unit` from any source satisfies the rule.

**Evidence.** REST "Update a repository ruleset" (https://docs.github.com/en/rest/repos/rules): `required_status_checks[]` {`context`, optional `integration_id`}, `strict_required_status_checks_policy` required. GitHub Actions app id 15368 (`gh api repos/jhoblitt/conventions-claude/commits/51b66a2/check-runs`). Canon `templates/commitlint.yml` runs on every `pull_request`, so its check exists on every PR.

**Proposed change.** Require `unit`, `browser` and `commitlint` (exact names as reported), each with `"integration_id": 15368`; set `strict_required_status_checks_policy` explicitly (`false` is enough here; `true` forces branch updates on every stale PR). Do the PUT as GET → add the rule → PUT the full `rules` array, and verify with `gh api repos/jhoblitt/tmelevation/rulesets/<id>`.

### E7 — minor — Task 1 Step 3.6: the environment-policy calls are not idempotent; Pages enablement already creates `github-pages` with a `main` policy

**Problem.** On this account, enabling Pages with the Actions source creates the `github-pages` environment immediately, with `custom_branch_policies: true` and one policy `{name: main, type: branch}`. Step 3.6 then POSTs `{"name":"main","type":"branch"}` again; the documented response to a duplicate pattern is **303**, not 2xx. `gh api` exits 1 for a final status > 299 unless the client follows a redirect, so under "stopping at the first failure" Step 3 may halt before the `v*` tag policy is added, leaving the tag-push trigger unable to deploy (rejected by the environment), with nothing in Step 4's wording that distinguishes "already there" from "failed".

**Evidence.** `gh api repos/jhoblitt/{green_maps,putttron}/environments/github-pages` → created 4 s / 3 s before each repo's first Pages workflow run, policies `[{main, branch}]`. https://docs.github.com/en/rest/deployments/branch-policies: 303 "Response if the same branch name pattern already exists". deploy-pages README: "we will configure it by default for you". gh 2.87.3 `pkg/cmd/api/api.go:522-523`.

**Proposed change.** After Step 3.5: GET `…/environments/github-pages` and `…/deployment-branch-policies`; PUT the environment only if it is absent or not on custom policies; POST only the patterns that are missing (normally just `{"name":"v*","type":"tag"}`). Step 4 asserts the exact set `{main/branch, v*/tag}`.

### E8 — minor — Task 1 Step 3.6 × Task 13 `deploy.yml` tag trigger: the `v*` environment policy makes production deployable by any tag push, and the in-workflow guards are not a control

**Problem.** A tag-push run executes `deploy.yml` as it exists at the tagged commit. The reachability check and the highest-tag check live in that file, so they protect only against accidents, not against a principal who can push tags: a `v*` tag on any commit whose `deploy.yml` drops the guards (e.g. on an unmerged branch) runs that workflow, the environment admits `refs/tags/v*`, and the tree is deployed without review or required checks. Anyone with write access can push tags; the branch ruleset covers only `main`. The same mechanism means an old tag runs the old guard logic. The plan presents the guards as the safety story (l.561) and the spec's §11 risk 4 does not mention this.

**Evidence.** https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows: "Each workflow run will use the version of the workflow that is present in the associated commit SHA or Git ref of the event." Environment rules are "matched against the `GITHUB_REF` of the workflow run" (https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments). Branch ruleset target `branch` only (canon `templates/ruleset.json`).

**Proposed change.** Either drop the `push: tags` trigger and the `v*` policy (the prior review's D3 fix; `workflow_dispatch` already covers redeploy and rollback, and runs `main`'s copy of the guards), or keep it and record in spec §11/README that the guard is advisory: write access to the repository is sufficient to publish arbitrary content to the site. A tag ruleset restricting `v*` creation is not an obvious fix: semantic-release creates the tags with `GITHUB_TOKEN`, and the documented bypass actor types (admins/owners, maintain or write role, teams, GitHub Apps, Dependabot — https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository) do not name GitHub Actions or `GITHUB_TOKEN` (not tested).

### E9 — minor — Global Constraints (l.33): "job-level grants only as spec §9.4 lists" contradicts the canon templates Task 1 lands

**Problem.** Spec §9.4 lists grants for the release job, deploying, and CodeQL only. The canon Scorecard job requires `security-events: write` and `id-token: write`, and commitlint requires `pull-requests: read`; the canon says the Scorecard template is copied unedited because scorecard-action v2 rejects other shapes. An executor applying the Global Constraint literally would strip them (Scorecard publishing fails), or treat the canon files as violations in the Task 13 re-read.

**Evidence.** github-conventions 1.8.0 `references/security.md:39-49`, `templates/scorecard.yml:22-25`, `templates/commitlint.yml:18-20`; spec l.589-591.

**Proposed change.** "…job-level grants only as spec §9.4 lists, plus those the canon templates carry unchanged (Scorecard: `security-events: write`, `id-token: write`; commitlint: `pull-requests: read`; CodeQL: `security-events: write`)."

### E10 — nit — Task 13 `deploy.yml` build: "for the `push` event" is the wrong discriminator, and "stop with a notice" needs explicit plumbing

**Problem.** Under `workflow_call` the `github` context is the caller's, so `github.event_name` is `push` in the release path too; a guard keyed on `github.event_name == 'push'` also runs on every automatic deploy. It is benign today (the just-released tag is the highest on `main` while the `release` group serialises runs), but the condition does not express the intent and a future change to it would bite both paths. Also, a step cannot end a job successfully mid-way: "set output `deploy=false` and stop" needs every later step gated, and the job output must come from the guard step, not from a final "output `deploy=true`" step that is skipped on the `false` path.

**Evidence.** Reusable-workflows reference: "the `github` context is always associated with the caller workflow". actionlint-clean draft with this plumbing: `/tmp/claude-1000/plan-review-delivery/wf/.github/workflows/deploy.yml`.

**Proposed change.** Key the highest-tag check on `startsWith(github.ref, 'refs/tags/')` (tag-push runs only); the guard step writes `deploy=true|false`; later steps carry `if: steps.guard.outputs.deploy == 'true'`; job output `deploy: ${{ steps.guard.outputs.deploy }}`.

### E11 — nit — Task 13 `deploy.yml`: `git tag … --sort=-v:refname | head -n1` dies with SIGPIPE under `shell: bash` once the tag list passes a few KB

**Problem.** If the step (or `defaults.run`) uses `shell: bash`, GitHub runs it with `-o pipefail`; when `head` exits early, `git tag` takes SIGPIPE and the pipeline returns 141, failing the step. Measured: fine at 200 tags (1.7 KB), fails 20/20 at 1,000 tags (8.9 KB). With the unspecified default shell (`bash -e`, no pipefail) it does not fail.

**Evidence.** `/tmp/claude-1000/plan-review-delivery/sigpipe` experiment (notes); workflow-syntax `defaults.run.shell` table.

**Proposed change.** `git for-each-ref --count=1 --sort=-v:refname --merged origin/main --format='%(refname:short)' 'refs/tags/v*'` — one process, no pipe (verified correct and exit 0 at 3,000 tags).

### E12 — nit — Task 13 Step 3: "every plugin resolves to the pinned version" is not observable from semantic-release's output

**Problem.** semantic-release logs `Loaded plugin "<step>" from "<name>"` without versions, and it resolves plugins from its own directory first, so a nested copy under `semantic-release/node_modules` would win silently. The expected outcome has no stated check.

**Evidence.** semantic-release 25.0.8 `lib/plugins/normalize.js:62-64`, `lib/plugins/utils.js:50-60`.

**Proposed change.** Run the dry run with `npm_config_cache=$TMPDIR/npm-cache` and assert that `find "$TMPDIR/npm-cache/_npx" -path '*/semantic-release/node_modules/@semantic-release/*' -name package.json` is empty and that the top-level `@semantic-release/{commit-analyzer,release-notes-generator,github,exec}` and `conventional-changelog-conventionalcommits` `package.json` versions equal the pins. (Today's highest in-range versions: commit-analyzer 13.0.1, release-notes-generator 14.1.1, github 12.0.10.)

### E13 — nit — Task 1 Steps 2-6 and Task 14 Step 3: the plan reorders the `github-new-repo` procedure and defers the PR the gate approved

**Problem.** The skill lands the canon files on `init`, runs pinact and actionlint, and only then shows the gate; its execute step pushes `init` and opens the PR. The plan gates and creates the repository first, lands the files afterwards (Step 6), and opens the PR in Task 14 "with the title and description approved in Task 1". A description drafted before any code exists is likely to change, and the skill says "a change to any item re-shows the batch". Nothing breaks, but the plan should not claim it "runs" the skill's procedure unchanged.

**Evidence.** github-new-repo `SKILL.md:40-81`; plan l.80, l.92, l.106, l.579.

**Proposed change.** Say so in Task 1 ("procedure reordered: repository first, files after; PR deferred to Task 14") and in Task 14 Step 3 re-show the title and description for approval if either changed.

### E14 — nit — `.releaserc.yml`: `successComment: false` / `failComment: false` / `failTitle: false` are deprecated in `@semantic-release/github` 12

**Problem.** Copying the reference keeps working on 12.x but logs DEPRECATION warnings on every release and will break at the next major; the forward-compatible forms exist today.

**Evidence.** `@semantic-release/github@12.0.10` `lib/success.js:60-67`, `:264-269`.

**Proposed change.** Optional: `successCommentCondition: false`, `failCommentCondition: false` (or keep the reference's form deliberately and note it beside the pin).

## Unverified concerns

- **EnterWorktree on a repository created mid-session (Task 1 Step 5).** The session was launched in `/home/jhoblitt/github/tmelevation` before it was a git repository, and `git remote add` + `git push` leave no `refs/remotes/origin/HEAD`. The tool's description says `fresh` "branches from origin/<default-branch>" but not how it finds the default branch. Cheap insurance before Step 5: `git remote set-head origin main` (writes the symbolic ref locally, no network). Not tested.
- **Chrome's sandbox on `ubuntu-latest`.** Ubuntu ships an AppArmor profile for `/opt/google/chrome/chrome` that allows user namespaces, and Google Chrome's package has a setuid helper, so the runner's preinstalled Chrome probably starts sandboxed; the reference's `--no-sandbox` note concerned Puppeteer's bundled Chrome at another path. Not run on a runner. E4 matters only if the fallback turns out to be needed.
- **How `gh api` handles the 303 in E7.** Go's client follows a 303 only when a `Location` header is present; whether GitHub sends one for this endpoint was not tested (it would need a write call).
- **Hand-pushed tags and `git push --tags`.** GitHub creates no push events "for tags when more than three tags are pushed at once" (events-that-trigger-workflows, `push`). A maintainer who hand-tags with `git push --tags` from a clone holding several unpushed tags gets no deploy and no error. Relevant only if E8's trigger is kept.

## Verified behaviours

- **`gh repo edit` flags (Task 1 Step 3.3).** `--delete-branch-on-merge`, `--enable-merge-commit`, `--enable-squash-merge`, `--enable-rebase-merge` all exist in gh 2.87.3; `=false` is valid boolean-flag syntax.
- **`POST /repos/{o}/{r}/pages -f build_type=workflow` (Step 3.5).** `source` is not required by the REST schema; the two existing Pages repos on this account are `build_type: workflow` with no source branch. Running it after the root-commit push (as the plan orders) is safe.
- **Environment policy evaluation.** Rules match `GITHUB_REF`; under `workflow_call` the `github` context is the caller's, so the automatic deploy is evaluated as `refs/heads/main`; a dispatch as the ref it was dispatched from; a tag push as `refs/tags/vX.Y.Z`. The REST body for a tag rule is `{"name":"v*","type":"tag"}` (`type` ∈ `branch|tag`), and `v*` matches `v1.2.3` (no `/`).
- **`origin/main` after checking out a tag.** actions/checkout v7.0.1 with `fetch-depth: 0` fetches `+refs/heads/*:refs/remotes/origin/*` and `+refs/tags/*:refs/tags/*` (`src/ref-helper.ts:69-70`) and resolves an unqualified `ref` branch-first, then tag (`:52-63`), so `git merge-base --is-ancestor "$TAG^{commit}" origin/main` works.
- **semantic-release without git/changelog plugins.** It still needs `contents: write`: it creates the tag locally (`git tag <tag> <HEAD sha>`) and pushes it with `git push --tags`, then pushes a `refs/notes/semantic-release-<tag>` ref, then `@semantic-release/github` creates the Release. With no git plugin HEAD does not move, and HEAD is the checked-out `GITHUB_SHA`, i.e. the merge commit the `test` job tested, so `git tag --points-at HEAD --list 'v*'` sees the new tag.
- **Required checks and the tag push.** The canon ruleset targets `branch` (`~DEFAULT_BRANCH`); semantic-release's only interaction with `main` is `git push --dry-run … HEAD:main` (no ref update). Tags and notes refs are outside the ruleset, so adding required checks cannot block a release.
- **Plugin pins and dedupe.** semantic-release resolves plugins from its own directory first, then `cwd` (`lib/plugins/utils.js:50-60`), so a pin outside semantic-release's declared range would be shadowed by a nested copy; the plan's "highest published version inside each declared range" rule is correct. Ranges in 25.0.8: commit-analyzer `^13.0.1`, release-notes-generator `^14.1.0`, github `^12.0.0`; today's highest in range: 13.0.1, 14.1.1, 12.0.10. release-notes-generator 14.1.1 still depends on `conventional-changelog-writer ^8.0.0`, so the reference's "stay on preset 9" comment still applies. `@semantic-release/npm` is installed (floating) but never loaded, because `plugins:` replaces the default list.
- **Permissions of the `release` job.** `@semantic-release/github` with `successComment: false` skips both comments and "released" labels, and with `failComment`/`failTitle: false` skips closing failure issues, so `issues: read` and `pull-requests: read` (for `release-notes.sh`) suffice, as in the reference.
- **`release-notes.sh` in CI.** `GITHUB_REPOSITORY` and `GITHUB_SHA` are set by Actions; `GITHUB_SHA` is the merge commit, which here is also the tagged commit (in the reference it is not); `gh` authenticates from `GITHUB_TOKEN`.
- **Concurrency.** A called workflow's `${{ github.workflow }}` is the caller's name, so `ci.yml`'s canon key evaluates to `release-<sha>` under `release.yml`, `ci-<sha>` on its own push run, and `ci-<PR>` on PRs; none equals the caller's constant `release`, so there is no caller cancellation (the docs warn only about identical values). `deploy.yml`'s constant `pages` group is distinct from `release`.
- **Calling-job rules.** Calling jobs accept `permissions` and `if` but not `timeout-minutes` or `environment`; the called workflow can only reduce the caller's grant. An actionlint 1.7.7 + shellcheck run on drafts that follow Task 13 (`workflow_call` + `workflow_dispatch` inputs of the same name, `push: tags`, calling-job grants, `environment` with `url` on the called job, `TAG` from `inputs.tag || github.ref_name` via `env:`) reported nothing.
- **Pages actions.** `deploy-pages` needs at least `pages: write` and `id-token: write` on its job and should target `github-pages`; `upload-pages-artifact` defaults the artifact name to `github-pages` (matching `deploy-pages`' default) and excludes dotfiles (the site has none).
- **Live URL (Task 14 Step 6).** `jhoblitt.github.io` has no Pages site (`gh api repos/jhoblitt/jhoblitt.github.io/pages` → 404) and the account's project sites report `cname: null`, so `https://jhoblitt.github.io/tmelevation/` is served directly, with no custom-domain redirect to break "every request returned 200". The version assertion is E1.
- **Merge commits and analysis.** `Merge pull request #N from …` does not parse as a Conventional Commit and is ignored; the PR's own commits are reachable from the merge and are analysed.

## Non-findings

Fixes from the spec's delivery review (`docs/reviews/spec-2026-10-08/delivery.md`) that the plan does implement:

- D1 (test before release): `release` needs a `test` job that calls `ci.yml`.
- D2 (redeploy): `workflow_dispatch` with a `tag` input, validated against `^v[0-9]+\.[0-9]+\.[0-9]+$` and passed through `env:`.
- D4 (no commit-back): no git/changelog plugins; required checks are added after CI reports (but see E6 for commitlint).
- D5, D6: the calling job grants `contents: read`, `pages: write`, `id-token: write` with no `timeout-minutes`; read-only `build` and `pages`/`id-token`-only `deploy` jobs; `environment` on the called job.
- D7: the tag is read with `git tag --points-at HEAD` (but see E3 for the failure case).
- D10, D11: Pages is enabled before the PR; the PR carries `feat` commits; merge-commit-only.
- D14, D17, D18, D19: `.nvmrc` 24 with `node-version-file`; `pages` group declared as a second exception and kept constant; CodeQL JavaScript only; `.claude/` in `.git/info/exclude`.

Other items checked that hold:

- The ruleset, merge-setting and Pages calls are ordered correctly relative to the empty root commit: the ruleset (deletion, non-fast-forward) does not block creating `main`, and required checks are added only after `main` exists and the PR has reported (spec §10 step 3 before step 6).
- The new tag created with `GITHUB_TOKEN` cannot also trigger `deploy.yml`'s tag-push path, so there is no double deploy.
- `ci.yml` running both on `push` to `main` and inside `release.yml` duplicates runner time but causes no conflict (separate concurrency groups; check runs inside the release run are named `test / …`).
- The account's default workflow token permission is `read` (`jhoblitt/putttron`), so even a job without a `permissions` block would not get write.

## Sources

GitHub documentation (fetched 2026-10-08):
- https://docs.github.com/en/rest/deployments/branch-policies
- https://docs.github.com/en/rest/pages/pages
- https://docs.github.com/en/rest/repos/rules
- https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments
- https://docs.github.com/en/actions/reference/workflows-and-actions/reusable-workflows
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax (`defaults.run.shell`)
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository

Upstream source:
- npm registry tarballs: semantic-release 25.0.8 (`index.js`, `lib/git.js`, `lib/get-git-auth-url.js`, `lib/plugins/{utils,normalize}.js`, `lib/definitions/plugins.js`, `lib/get-next-version.js`), env-ci 11.2.0 (`index.js`, `lib/git.js`, `services/{git,github}.js`), @semantic-release/github 12.0.10 (`lib/success.js`, `lib/verify.js`), @semantic-release/exec 7.1.0 (`lib/exec.js`), @semantic-release/commit-analyzer 13.0.1 (`lib/load-parser-config.js`); registry metadata for release-notes-generator, npm, conventional-changelog-conventionalcommits.
- raw.githubusercontent.com: actions/checkout main = v7.0.1 (`src/ref-helper.ts`, `src/git-source-provider.ts`, `src/input-helper.ts`); actions/deploy-pages main `README.md`; actions/upload-pages-artifact main `README.md`, `action.yml`; cli/cli v2.87.3 `pkg/cmd/api/api.go`.
- https://chromium.googlesource.com/chromium/src/+/main/docs/security/apparmor-userns-restrictions.md; https://documentation.ubuntu.com/release-notes/24.04/

Read-only `gh api` (2026-10-08): `repos/jhoblitt/{green_maps,putttron}/{pages,environments/github-pages,environments/github-pages/deployment-branch-policies,deployments,actions/runs,actions/permissions/workflow}`; `repos/jhoblitt/jhoblitt.github.io/pages`; `repos/jhoblitt/conventions-claude/{rulesets,commits/51b66a2…/check-runs}`.

Local, read-only: conventions-claude `.github/workflows/release.yml`, `.releaserc.yml`, `.github/scripts/release-notes.sh` (`git ls-files -s`), `git remote get-url origin`; github-conventions 1.8.0 `SKILL.md`, `references/{new-repo,workflows,security}.md`, `templates/*`, `skills/github-new-repo/SKILL.md`; `gh repo edit --help`.

Throwaway (not part of the project): `/tmp/claude-1000/plan-review-delivery/{wf,sigpipe,npm,src}`.
