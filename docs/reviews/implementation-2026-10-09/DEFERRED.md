# Deferred review notes from the implementation

The per-task reviews and the final whole-branch review of the first release
(v1.0.0) raised these minor findings and left them open: none affects the
displayed numbers, the security posture or the release and deploy path.
Items that were fixed before the merge, or that later work resolved, are not
listed. Files are named rather than line numbers, which drift.

## Source data

1. `test/unit/data.test.js` — the transcription parser accepts an empty cell
   as `0` and a three-part `yd/m` pair as its first two parts; reject `''` and
   require exactly two parts.
2. `test/unit/data.test.js` — the transcription is parsed at module load, so a
   renamed heading in the research file surfaces as a file-level load error
   rather than a named failing test.
3. `site/js/data.js` — `TOURS` is mutable; a deep `Object.freeze` would
   enforce "stored as published" at runtime.

## Atmosphere and flight model

4. `site/js/atmosphere.js` — the constants for M, R* and L carry no unit
   suffix, unlike the others; a kg/mol vs kg/kmol slip would be a 1000×
   error (the ρ₀ test would catch it).
5. `test/unit/flight.test.js` — the `launchFrom` test recomputes its expected
   values with the implementation's own expressions; literal numbers
   (`speedMps` ≈ 76.44384 for the PGA Driver) would make it independent.
6. `site/js/flight.js` — the landing solver returns carry 0 for a flight
   shorter than one step (its chord guess starts at s = 0), and an `ok: true`
   result is never finiteness-checked; both are unreachable for tour rows.

## Calibration and model

7. `test/unit/calibrate.test.js` — all 23 rows are calibrated three times
   across separate tests; computing them once at module scope removes the
   repetition.
8. **Resolved** by the change to the measured drag and lift laws, which
   writes the test's envelope as spec §5.3's ranges times 0.9 and 1.1.
   `test/unit/calibrate.test.js` — the factor envelope (0.981–1.65,
   0.864–1.463) derives from the pre-amendment spec; spec §5.3's amended
   envelope with the stated 10 % margin is 0.972–1.65 and 0.864–1.452. The
   test still passes.
9. `site/js/calibrate.js` — the forward difference divides by `hD` rather
   than the representable step `(kD + hD) − kD`; the error is about 1e-12
   relative.
10. `test/unit/model.test.js` — the failed-altitude-flight test deep-equals
    `{ ok: false, reason: 'nonfinite', steps: 1 }`, coupling it to when
    `flight.js` detects a NaN; asserting `ok` and `reason` would pin the shape
    without the coupling.

## Reference oracles

11. `site/js/oracles.js` — oracle 9 cites Padjen, Shih and Foresight but not
    the Titleist/Aoyama descent-angle note or GOLF.com 2019 that
    `docs/research/reference-data.md` also names.
12. `scripts/oracle-report.mjs` — the exit-status rule (1 only when a hard
    oracle fails) is only hand-tested; an extracted `exitStatus(results)` with
    a unit test would pin the CI-gate contract.
13. `site/js/oracles.js` — oracle 5 looks each row up again by club name
    (quadratic, and it assumes club names are unique).

## Presentation and controls

14. `test/unit/present.test.js` — the glyph test compares `MINUS`,
    `ELLIPSIS` and `EM_DASH` with identical literal characters; `−`,
    `…` and `—` escapes would make it catch a look-alike.
15. `test/unit/present.test.js` — `rowStatus('pending', { ok: false })`
    precedence is untested, and `rowStatus('ready', null)` returns `'ready'`
    (a caller pairing them would render `NaN`; the model never does).
16. `site/js/controls.js` — `inputSlider(s, NaN)` breaks the
    `MIN_PRESSURE_PA ≤ pa ≤ P0_PA` invariant and an unknown unit throws in
    `view()`; neither is reachable from a range input and fixed selects
    (`app.js` passes `valueAsNumber`).

## Pages

17. `site/js/app.js` — a single row's model failure shows "The calculator did
    not load", which overstates a one-row failure (the plan mandated the
    notice; the path is practically unreachable).
18. `site/js/app.js` — the scroll handler relies on `Math.abs(x − undefined)
    <= 1` being false when there is no written-position record; an explicit
    `written.has(scroller)` would say what it means.
19. `test/unit/static.test.js` — the CSP-position test assumes the page has a
    `<link>`; a page without one would fail with a misleading message.
20. `site/css/style.css` — on phones a doubled vertical rule shows beside the
    pinned Club column (cosmetic).
21. `site/js/methods.js` — repeats `oracles.js`'s sweep-grid layout and
    density-ratio helper to key its cache; exporting a grid helper from
    `oracles.js` would remove the coupling (a mismatch only costs a
    recompute).
22. No unit test pins the per-row launch and peak spin-parameter groupings
    that spec §5.2 and the methods page state; if the data or the model
    changes, that prose can go stale silently.

## Browser harness and deploy artifact

23. `scripts/build-artifact.mjs` — `codeOnly()` misses an `import()` inside a
    template literal's `${…}`, and treats a `/` after `++` or `--` as the
    start of a regex; the backstop is the independent literal scan in
    `test/unit/artifact.test.js`, not `build()` itself.
24. `scripts/build-artifact.mjs` — the exported `build()` removes a populated
    output directory on failure; only the command-line entry refuses a
    non-empty output directory first.
25. `test/browser/e2e.mjs` — the back/forward case keeps one fixed
    `sleep(200)`.

## CI, release and deploy

26. `.github/workflows/release.yml` — the tag step's `git ls-remote` runs
    without credentials (`persist-credentials: false`); it works only while
    the repository is public.
27. Spec §9.2 says releases are "never cancelled": a running release is not,
    but a queued one can be superseded by a newer push (nothing is lost — the
    newer run releases every commit). The comment in `release.yml` is
    accurate; the spec sentence is loose.
28. The release job's transitive npm graph is not lockfile-pinned while the
    job holds `contents: write`; `npm_config_ignore_scripts` stops install
    scripts, not code that runs on import. A committed lockfile for the
    release tooling (`npm ci` from a `release/` directory) would close the
    gap.

## Repository

29. `README.md` — the Development paragraph keeps the github-conventions
    template's `Makefile` sentence although the repository has no
    `Makefile` (canon text, and conditional).
