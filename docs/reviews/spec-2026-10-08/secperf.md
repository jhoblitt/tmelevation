# Spec review: site security and runtime performance

Target: docs/superpowers/specs/2026-10-08-tmelevation-design.md
Reviewer mandate: site security and runtime performance only.
Status: COMPLETE (2026-10-08)

## Summary

The site has very little security surface: no URL state, no storage, no third-party requests and no injection delivery vector. On the security side the spec mainly needs a stated CSP and DOM-sink rule. The material problems are runtime robustness and performance, and all of them are measured on a throwaway implementation of sections 5.1-5.4 in headless Chrome 154 with CDP CPU throttling (4x ≈ top of Lighthouse's mid-tier-mobile bracket on this host, 6x ≈ typical mid-tier).

Ranked:
1. **S3 (blocker)** Typing `150000` in the elevation box (one extra zero) sends NaN into an integrator loop with no bound, and the tab hangs: `flight()` never returned and was killed after 10 s. The cause is that live input is unclamped (clamping happens only on commit), 5.1's formula is NaN above ~145,400 ft, and 5.2 has no step cap. Fix: clamp and finite-check on every keystroke, use a strict decimal parser, bound the loop, and make a failing row show published values with "—" deltas.
2. **S1 (major)** At dt = 0.01 s the spec's own budgets fail. Calibration takes 124 / 182 ms at 4x / 6x (tuned) and 364 / 534 ms (naive), against a 100 ms budget. The 23-flight recompute takes 13.7 ms at 6x, so dragging runs at 30 fps. dt = 0.05 s changes 0 of 2,852 displayed cells and makes calibration 36 / 54 ms and the recompute 1.7 / 2.6 ms. State the budget as a step count CI can test.
3. **S2 (major)** The tables wait on calibration, though the page opens at sea level where no model is needed. FCP is 300 ms vs 84 ms (tuned, 6x) and 668 ms vs 76 ms (naive), and calibration is one long task that blocks input. Fix: render from `data.js` first, then calibrate one row per task.
4. **S4 (minor)** No CSP or DOM-sink rule. A strict meta policy (no `'unsafe-inline'`, Trusted Types) runs the design with zero violations, and `smoke.sh` can grep for violations.
5. **S5 (minor)** The unbundled 3-level module graph costs about 190-310 ms on Slow 4G; `modulepreload` (with a drift test) recovers it.
6. **S6 (minor)** The methods page's live oracle 9 sweep blocks the main thread for 1.5 s (100 ft grid) to 13 s (10 ft grid) at 6x. Fix: a stated coarse grid and incremental fill.
7. **S7 (minor)** With `max-age=600` and unversioned module URLs, a deploy can break `methods.html` for a recent visitor (demonstrated SyntaxError).
8. **S8 (nit)** Fonts: set `font-display: swap`; note that Google Fonts' Lato has no semibold; record hashes and provenance for the woff2 binaries.

## Measurements

All numbers come from a throwaway implementation of spec sections 5.1-5.4 (RK4, dt 0.01 s, cubic-Hermite apex and landing, damped 2x2 Newton with forward-difference Jacobian from (1, 1)) under `/tmp/claude-1000/review-secperf/`. It reproduces the research probe (PGA Driver at 7,800 ft: +24.88 yd / -5.46 yd / -7.93 deg). Two implementation styles bracket what an implementer might write: "tuned" (scalar locals, no allocation) and "naive" (array state, fresh arrays per RK4 stage). Full commands and raw output are in `secperf.md.notes.md`.

**Workload.** Every row converges in 3 Newton iterations = 10 flights + 1 cached sea-level run, so load = 253 flights; each flight is 554-693 RK4 steps (2,200-2,800 derivative evaluations).

**What "mid-range phone" means on the test host.** The host (Ryzen 9 7950X3D) scores a Lighthouse benchmarkIndex of 3,494, far above Lighthouse's high-end-desktop bracket (~1,500-2,000). Under CDP CPU throttling it scores 792 at 4x (top edge of Lighthouse's mid-tier-mobile bracket, 125-800), 566 at 6x, 294 at 10x, 146 at 20x (Moto G4 class). So 4x is a generous "mid-range phone", 6x a typical one, 10x+ low end. Source: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md.

**Spec as written (dt 0.01 s), headless Chrome 154:**

| impl | CPU | calibration (one long task) | FCP if calibration runs before render | 23-flight recompute p50 / p95 | rAF frames > 25 ms while dragging |
|---|---|---|---|---|---|
| tuned | 1x | 32 ms | 68 ms | 2.3 / 2.7 ms | 0/120 |
| tuned | 4x | **124 ms** | 200 ms | 8.7 / 10.0 ms | 1/120 |
| tuned | 6x | **182 ms** | 300 ms | **13.7 / 15.2 ms** | **69/120** |
| tuned | 10x | **300 ms** | 500 ms | **23.3 / 25.7 ms** | 120/120 |
| naive | 4x | **364 ms** | 460 ms | **28.1 / 33.3 ms** | **119/120** |
| naive | 6x | **534 ms** | 668 ms | **43.5 / 58.0 ms** | 120/120 |
| naive | 10x | **1,011 ms** | 1,252 ms | **78.8 / 109 ms** | 120/120 |

DOM writes for 69 cells (value, delta text, aria-label) cost 0.7-2.4 ms per frame across these settings; the integrator is the whole problem. Node 22 is ~1.9x slower than Chrome 154 on the same code (61.5 ms cold calibration, 4.5 ms recompute, tuned).

**Larger step, same display (dt 0.05 s):** deltas differ from a dt = 0.001 s reference by at most 6.4e-7 yd (carry), 2.0e-7 yd (max height) and 1.1e-3 deg (land angle) over 23 rows x 31 elevations; 0 of 2,852 displayed cells change. Even dt 0.1 s changes none (max 1.1e-5 yd, 4.6e-3 deg). Calibration absorbs the sea-level discretisation error, so delta error is orders of magnitude below absolute error.

| impl, dt 0.05 | CPU | calibration | recompute p50 / p95 | frames > 25 ms |
|---|---|---|---|---|
| tuned | 4x | 36 ms | 1.7 / 2.6 ms | 1/120 |
| tuned | 6x | 54 ms | 2.6 / 3.8 ms | 1/120 |
| tuned | 10x | 86 ms | 4.8 / 7.0 ms | 59/120 |
| naive | 4x | 89 ms | 6.3 / 7.3 ms | 1/120 |
| naive | 6x | 156 ms | 9.1 / 10.9 ms | 26/120 |

**Paint before calibrating (6x):** rendering the published tables from `data.js` first and calibrating after the first frame moves FCP from 300 ms to 84 ms (tuned) and from 668 ms to 76 ms (naive). The calibration long task still follows (181 ms / 605 ms), during which input is blocked.

Not a fix: replacing `Math.pow(S, 0.4)` with `Math.exp(0.4 * Math.log(S))` is 2.5x faster in Node 22 but ~25 % slower in Chrome 154; engine-specific micro-tuning is not a basis for the budget.

**Cold load over a phone network.** The throwaway site uses section 7's module graph (10 modules, 3 import levels below `app.js`) and the real Oswald and Lato latin woff2. It was loaded under Lighthouse's Slow 4G profile (150 ms request latency, 1.6 Mbps) at 6x CPU, in a fresh browser context each run (times in ms from navigation start; M9):

| variant | `app.js` runs | tables in DOM | LCP | CLS |
|---|---|---|---|---|
| no preload, calibrate then render | 864 | 1,047 | 1,092 | 0.040 |
| no preload, render then calibrate | 867 | 874 | 920 | 0.047 |
| `modulepreload` for all modules, render then calibrate | 677 | 685 | 756 | 0.090 |
| `modulepreload` + font preload, render then calibrate | 557 | 561 | 608 | 0.087 |

Without `modulepreload`, the modules arrive in three sequential discovery waves after `app.js` (≈170 ms each). Preloading fonts too competes with the CSS for bandwidth and delays FCP from ~360 to ~470 ms. CLS stays under 0.1 in every run. It comes from the JS-inserted tables pushing the footer down (~0.04) and from the webfont swap (~0.05); `font-display: block` vs `swap` made no CLS difference.

**Page weight.** Oswald (variable, 200-700, latin) is 28.5 KB as served by Google Fonts. Lato latin is 23.6 KB (400) and 23.0 KB (700). Together that is 75 KB of already-compressed woff2, about 0.4 s at 1.6 Mbps. The ten throwaway modules total ~11 KB uncompressed. The real `present.js` and `controls.js` will be larger than my stubs, but still small. GitHub Pages compresses with gzip only, not brotli, and serves everything with `cache-control: max-age=600` over HTTP/2 (D1).

**Strict meta CSP.** The site runs under the policy in S4 with zero violations: modules, modulepreload, external CSS, self-hosted fonts, MathML, render and calibration. Static `style` attributes (HTML and MathML) and `setAttribute('style')` are blocked; `el.style.prop =` is allowed; Trusted Types makes `innerHTML` throw; `frame-ancestors` is ignored in meta (M10). A `--dump-dom` run surfaces every violation on stderr (M11).

**Robustness (M8).** 5.1's pressure formula returns NaN above ~145,400 ft, and its inverse returns NaN for P < 0. `flight()` with a NaN or Infinity density ratio, or NaN k-factors, never terminates (killed after 10 s). Density ratios 0, 1e-6, 50 and -1 all terminate.

## Findings

### S1 (major) — dt = 0.01 s misses both of the spec's own performance budgets on phones

**Sections:** 5.2 (Integration), 5.3 (Budget), 5.4 (per-frame recompute).

**Problem.** The spec sets two budgets: calibration "under 100 ms on a mid-range phone" and, implicitly, a 23-flight recompute that fits in an animation frame while the slider is dragged. With dt = 0.01 s, neither holds on a typical mid-range phone. The research doc (`aero-model.md` section 6, line 265) sized the work as "~23 rows × 3 densities" (69 flights) and called it "trivial in a browser" without a timing. The load workload is actually 253 flights: 10 per row for calibration plus the cached sea-level run.

**Evidence** (Measurements; headless Chrome 154, CDP CPU throttling; 4x = benchmarkIndex 792, the top edge of Lighthouse's mid-tier-mobile bracket):
- Calibration: 124 ms at 4x and 182 ms at 6x for the tuned implementation; 364 ms and 534 ms for the naive one; 300 ms and 1,011 ms at 10x (low end).
- Dragging: the 23-flight recompute is 13.7 ms p50 at 6x even when tuned, and frames fall to 30 fps (69 of 120 frames over 25 ms). Naive at 4x takes 28 ms, i.e. 30 fps for 119 of 120 frames.
- Whether the budget holds depends on how the integrator happens to be written (a 3x spread between the two styles). The spec does not constrain that.

**Proposed fix (cheapest first).**
1. Set dt = 0.05 s. At 0.05 s the halving-dt change is <= 2.2e-7 yd carry and <= 1.1e-3 deg land angle (M7). Displayed deltas differ from a dt = 0.001 s reference by <= 6.4e-7 yd, and 0 of 2,852 displayed cells change (M3). This is a 5x cut in steps (96-139 per flight). The tuned implementation then calibrates in 36 / 54 / 86 ms at 4x / 6x / 10x and recomputes in 1.7 / 2.6 / 4.8 ms. Update the 5.2 accuracy sentence to match.
2. State the budget in a form CI can check without wall-clock flakiness: a step counter in `flight.js` and a unit test asserting, say, calibration <= 253 flights x 140 steps and recompute <= 23 x 140 steps. That pins the workload; the wall-clock budget then follows from the measurements above.
3. Only if (1) proves insufficient: move the model into a module Worker. That costs a second entry point and message plumbing for no gain once (1) is in, so do not add it pre-emptively.

### S2 (major) — the tables wait on calibration, though the page opens at sea level and needs no model

**Sections:** 4.3 (sea-level cells and hidden delta line), 5.3 (calibration at page load), 7 (`app.js`), 8.2 (smoke test).

**Problem.** The spec never says when the tables appear relative to calibration. The page opens at elevation 0, where every cell is the published value and every delta line is hidden (4.3), so the first view needs no model at all. Yet the obvious wiring (`model.js` "calibrate all rows once" → `present.js` → render) puts all 253 flights in front of first paint, as one uninterruptible task. Two consequences:
- **First paint is late.** FCP is 300 ms at 6x (tuned) and 668 ms (naive), against 76-84 ms when the tables are painted from `data.js` first (M6).
- **Input is blocked.** Calibration is one long task: 145-356 ms tuned and 383-1,057 ms naive at 4x-10x (M4, M6). A tap on the slider or a text box during that task is not handled until it ends.

Rendering the tables in JavaScript (which 8.2's "both tables rendered" implies) also means a single module that fails to load leaves the page with no tables at all, because the whole module graph then fails to evaluate. The failure can come from a 404, a CSP mistake (S4), a thrown exception in calibration (S3) or a browser without module support.

**Proposed fix.** Specify the load order in 7 / 5.3:
1. Render both tables from `data.js` as the first thing `app.js` does. The present path at density ratio 1 needs no model: Δ = 0 exactly, which 8.1 already tests.
2. Calibrate after the first frame, one row per task: yield via `setTimeout(0)` or `scheduler.yield()` where available, so no task exceeds one row (~8 ms tuned / ~23 ms naive at 6x with dt 0.01; ~2 ms with dt 0.05).
3. Coalesce any input that arrives before calibration finishes, and apply the latest value when it does.

Optionally, ship the sea-level tables as static HTML in `index.html` so the page degrades to the published tables with JS off. Guard it with a unit test that the static cells equal `data.js`, the same pattern `version.js` already relies on.

Add to 8.2: the smoke test asserts that the tables exist and a slider change updates a cell. It cannot catch ordering regressions, so state the order as a requirement rather than relying on the test.

### S3 (blocker) — a one-keystroke typo can hang the tab: unclamped live input reaches an unbounded integrator loop

**Sections:** 4.2 (linked inputs), 5.1 (atmosphere), 5.2 (integration), 5.3 (non-convergence), 7 (`controls.js`, `flight.js`, `model.js`).

**Problem.** Three gaps in the spec combine into a freeze:
1. **Live values are unclamped.** 4.2 says "Typing updates the other controls and the tables live" and that out-of-range values "clamp … when the field is committed (blur / Enter)". Taken literally, every keystroke pushes the raw value into the model, and clamping happens only later.
2. **The atmosphere formula has a real domain.** Above about 145,400 ft (H > 44,331 m), 5.1's pressure formula takes a non-integer power of a negative number and returns NaN. Typing `150000` (one extra zero on the 15,000 ft maximum) gives density ratio NaN. Negative pressure makes the inverse formula return NaN. `Infinity` and `1e400` parse to Infinity with both `Number()` and `parseFloat()`.
3. **The integrator loop has no bound.** 5.2 integrates until landing. Once any input is NaN or Infinity (density ratio, or k_D / k_L from a failed Newton step), the state becomes NaN. NaN is absorbing, and the landing test is never true.

Measured (M8): `flight()` for the PGA Driver at the density ratio produced by typing "150000" ft never returned and was killed after 10 s. Under a 2-million-step cap it hit the cap in 242 ms; without a cap it is an infinite loop on the main thread ("Page unresponsive"). Even short of a hang, a NaN state would make 4.2's "reverts to the current state on blur" restore NaN into every control.

Related parsing traps the spec does not rule out: `Number('')` is 0, so clearing the box sets sea level, or P = 0 for the pressure box, rather than "unparseable"; `Number('0x10')` is 16; `parseFloat('12abc')` is 12.

5.3 says a non-converging row "is a defect, caught by tests" but specifies no runtime behaviour. Floating-point results can differ in the last bits across JS engines (V8 in CI vs JavaScriptCore in iOS Safari), so a passing Node test does not prove convergence in every visitor's browser. A plain Newton step through a singular Jacobian yields NaN factors and the same hang at page load (M8, degenerate-row probe).

**Proposed fix (spec text).**
- **4.2: the state is always in range and finite.** On every keystroke: parse, reject non-finite values, then clamp into [P(15,000 ft), 101,325 Pa] before the value reaches the state. Committing only normalises the box's text. The box may show `150000` while focused, but the state and the tables use 15,000 ft.
- **4.2 / 7: a strict parser.** Accept `^\s*[+-]?(\d+([.,]\d*)?|[.,]\d+)\s*$` only: no exponent, hex, `Infinity`, or thousands separators; empty is unparseable.
- **5.2: the loop is bounded.** Integrate until landing or a flight-time cap (for example 20 s = 400 steps at dt 0.05), and return a non-finite sentinel if the state goes non-finite or the cap is hit. Add a unit test that NaN, Infinity and negative inputs return within the cap.
- **5.3 / 5.4: a row fails alone.** Cap Newton iterations (for example 20) and reject non-finite steps. A row that fails to converge, or whose flight returns the sentinel, renders its published values with the delta line replaced by an em dash and an accessible "model unavailable" label. The methods page marks the row failed, and the other 22 rows still update. The render loop never throws.

### S4 (minor) — no Content-Security-Policy and no DOM-sink rule; a strict meta policy costs nothing and makes "no third-party requests" checkable

**Sections:** 4.4 ("the page makes no third-party requests"), 6 (MathML), 7 (`app.js` / `methods.js` DOM wiring), 8.2 (smoke test).

**Problem.** The spec claims the page makes no third-party requests but gives nothing that enforces the claim. It is also silent on how cell text, control text and validation feedback reach the DOM (`textContent` vs `innerHTML`). The injection risk today is low: there is no URL state, no storage and no third-party input, so anything a visitor types can only reach their own page (self-XSS). Nothing guards against an `innerHTML` added later, or a future font or analytics URL, either.

GitHub Pages cannot send response headers: measured responses carry no CSP, X-Frame-Options, nosniff or Referrer-Policy (D1). So the only available policy is a `<meta http-equiv>`, which per CSP3 section 3.3 cannot carry `frame-ancestors`, `report-uri` or `sandbox` and does not cover content before it.

**Evidence.** I loaded the throwaway site under the strict meta policy below in Chrome 154 (M10). The module graph, modulepreload, external CSS, self-hosted woff2, native MathML, table rendering and calibration all ran with zero violations. The policy blocked static `style="…"` attributes, including on MathML elements, and `setAttribute('style', …)`. It allowed `el.style.visibility = …`. Trusted Types made `innerHTML` throw. Chrome logged that `frame-ancestors` is ignored in meta. So the design as specified needs no `'unsafe-inline'`, provided the implementation avoids style attributes and inline scripts.

**Proposed fix.** Add to 7: both HTML files start with

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; require-trusted-types-for 'script'; trusted-types 'none'">
```

placed immediately after `<meta charset>`. The `img-src 'self'` term is only needed if a favicon or image ships; otherwise drop it and `default-src 'none'` covers images.

The rules that keep this policy satisfiable:
- No inline `<script>` and no `on*=` attributes.
- No `style` attributes in HTML or MathML (use classes).
- The hidden-but-space-keeping delta line (4.3) is a CSS class (`visibility: hidden`), not an inline style.
- All DOM text goes through `textContent`, `value` or `setAttribute` on non-style attributes. No `innerHTML`, `outerHTML`, `insertAdjacentHTML` or `document.write`. Trusted Types enforces this in Chromium; elsewhere the policy degrades to the CSP alone.

Extend 8.2 so the smoke test fails on any CSP console error. That turns the "no third-party requests" claim into a CI check. Run with `--dump-dom --enable-logging=stderr --v=0`, Chrome prints every violation as an `INFO:CONSOLE` line on stderr (M11), so `smoke.sh` can grep for it with no new dependency.

Do not add `frame-ancestors` (ignored in meta). Clickjacking is not a meaningful threat for a page with no authenticated or state-changing actions; see Non-findings.

### S5 (minor) — the unbundled module graph costs three serial round trips on a cold phone load; add `modulepreload`

**Sections:** 7 (plain ES modules, no build step).

**Problem.** With no bundler, the browser learns of each module only after parsing its importer. Section 7's graph (`app.js` → `model.js`/`controls.js`/`present.js`/… → `calibrate.js`/`flight.js`/`atmosphere.js`/`units.js`) is three levels deep below `app.js`, so a cold load pays three extra sequential request latencies before any of the app runs. The spec is silent on this.

**Evidence (M9).** Under Slow 4G at 6x CPU, `app.js` starts executing at 864 ms without preload and at 677 ms with `<link rel="modulepreload">` for every module (557 ms with fonts preloaded too). With render-before-calibrate (S2), tables reach the DOM at 685 ms instead of 874 ms. GitHub Pages' `max-age=600` (D1) means a repeat visit more than 10 minutes later revalidates every module, and without preload those revalidations follow the same serial chain.

**Proposed fix.** In 7, require `<link rel="modulepreload">` in `index.html` and `methods.html` for every module in that page's static graph. Add a unit test that parses the `import` statements from the entry module and asserts that the preload list equals the transitive closure, so the list cannot drift. A missing preload only costs time, but a stale one fetches dead code. Do not preload the fonts by default: on a 1.6 Mbps link this delayed FCP by ~110 ms and only improved LCP. Keep `font-display: swap` (S8).

### S6 (minor) — the methods page's live oracle table can freeze a phone for seconds; the monotonicity sweep has no stated resolution

**Sections:** 6 (items 4 and 6: live calibration and oracle tables), 8.3 (oracle 9: "every row, 0 → 10,000 ft … monotone").

**Problem.** Oracle 9 is the only expensive oracle: it needs a sweep of elevations for all 23 rows. The other oracles together need about 25 flights. The spec does not say how finely the live methods-page table samples 0-10,000 ft. The natural choice is to reuse whatever grid the unit test uses, and a test wants a fine grid to be convincing.

**Evidence (M12, Chrome 154, 6x CPU, synchronous on the main thread):** a 100 ft grid (2,323 flights) blocks for 1.5 s (tuned) or 5.1 s (naive) at dt 0.01. A 10 ft grid blocks for 13.4 s. A 500 ft grid takes 0.46 s. With dt 0.05 (S1), the 100 ft grid takes 0.33 s (tuned) or 1.0 s (naive).

**Proposed fix.** In 6, specify that the methods page:
- renders its static text and equations first;
- fills tables 4 and 6 incrementally, one row or one oracle per task, with a visible "computing…" placeholder per cell;
- uses a stated, coarse live grid for oracle 9 (for example 500 ft, 21 points), with the fine-grid check left to the Node unit test.

The page states the grid it used, so the live table remains computed by the same modules (the spec's no-drift goal) without a multi-second block.

### S7 (minor) — unversioned module URLs plus GitHub Pages' 10-minute caching let one deploy break the other page for a recent visitor

**Sections:** 7 (plain ES modules, two entry pages sharing modules), 9.2-9.3 (a deploy for every feat / fix / docs / refactor / perf merge).

**Problem.** GitHub Pages serves every file with `cache-control: max-age=600` (D1), and module URLs carry no version. A visitor who loaded `index.html` shortly before a deploy holds fresh v1 copies of the shared modules. If they then open `methods.html`, which they have not cached, they get v2 HTML and a v2 entry module that import cached v1 modules. When a release changes any cross-module export, that mixed graph fails to link and the page shows nothing. semantic-release deploys on every user-visible merge, so this window recurs often.

**Evidence (M13).** A local server with GitHub Pages' cache headers ran this exact sequence. After the "deploy", `methods.html` failed with `SyntaxError: The requested module './model.js' does not provide an export named 'deltasFor'`, because the server log shows `model.js` was never re-requested. `index.html` kept working on v1.

**Proposed fix (pick one and state it in 7).**
1. **Accept and degrade gracefully** (cheapest): state the ≤10-minute skew window as an accepted risk, and ship the sea-level tables as static HTML (S2's optional step). A failed module graph then still shows the published tables.
2. **Eliminate it:** the deploy job (not the release commit, to keep source diffs clean) stamps `?v=<version>` onto both entry `<script src>` URLs and every relative `import` specifier in the Pages artifact. This is a mechanical rewrite in the step that already handles the version, and it gives every release a disjoint cache key set. It is a small build step, so it conflicts with "no build step" in letter. If chosen, record that trade-off.

### S8 (nit) — fonts: unspecified `font-display`, a Lato weight Google Fonts does not ship, and no recorded provenance for committed binaries

**Sections:** 4.3 ("semibold" delta line), 4.4 (self-hosted Oswald and Lato woff2), 7 (`site/fonts/`), 10 (OFL).

- **`font-display`.** The spec does not set it. The default (`auto`) behaves like `block` in current browsers, which hide text for up to 3 s while a webfont loads (CSS Fonts 4, section 3.1 table; D3). On a slow link the published numbers would be invisible for that time. Specify `font-display: swap`. Measured CLS from the swap is ~0.05 (M9), inside "good". If even that matters, add `size-adjust` / `ascent-override` metric overrides on a local fallback face.
- **Weights and weight-per-byte.** Oswald ships as one variable latin woff2 (28.5 KB) covering both the heavy title and the thin "2023". Lato latin is ~23 KB per weight (D2). Google Fonts' Lato has no 600: a request for `wght@600` returns HTTP 400 (D2). So 4.3's "semibold" delta line either renders in Lato 700 (`font-weight: 600` matches the 700 face) or needs a Lato 2.x file from a different upstream (latofonts.com). State which, so the font set and its provenance are decided rather than discovered. Ship latin subsets only: three files, ~75 KB.
- **Provenance and integrity.** The woff2 files are opaque binaries that no reviewer can diff. Record each file's upstream URL, font version and SHA-256 in `site/fonts/` next to the OFL text, and add a unit test that recomputes the hashes. A swapped binary is then a visible diff in a reviewed file. A same-origin SRI attribute would add nothing, because the HTML that carries the hash comes from the same origin.

## Unverified concerns

- **Real devices and other engines.** All timings are headless Chrome 154 under CDP CPU throttling, calibrated against Lighthouse's benchmarkIndex brackets. No real phone was measured, and neither was Safari/JavaScriptCore or Firefox/SpiderMonkey. Node 22's V8 was ~1.9x slower than Chrome 154's on identical code, so engine variance is material; the step-count budget proposed in S1 is engine-independent for that reason.
- **Trusted Types outside Chromium.** S4 relies on `require-trusted-types-for` only as a Chromium backstop. Support in Safari and Firefox was not checked, but unknown directives are ignored, so the policy cannot break those browsers.
- **CDN purge on deploy.** S7's window assumes the browser's own `max-age=600`. Whether GitHub Pages' Fastly edge (`x-proxy-cache`, `via: varnish`) also serves pre-deploy files for a while after a deploy was not measured; that could lengthen the window.
- **Network realism.** The module-waterfall runs used a local HTTP/1.1 server with request-level latency emulation; GitHub Pages serves HTTP/2 (D1). The number of serial discovery levels is a property of the graph, but the absolute milliseconds are approximate.
- **"Page Unresponsive" threshold.** S3's infinite loop is certain (NaN is absorbing). How each browser surfaces it (dialog timing, tab kill) was not measured.

## Non-findings

- **rAF coalescing (5.4) is the right design.** When a recompute overruns the frame, the frame rate drops to 30 or 20 fps (rAF intervals of 33-50 ms), and the queue does not pile up (M4). Only the cost per frame needs fixing (S1).
- **DOM write cost is negligible.** Writing value, delta and aria-label for 69 cells costs 0.2-2.4 ms per frame from 1x to 10x CPU (M4, M6).
- **No third-party requests are implied by the design.** Fonts are self-hosted, equations use native MathML (no MathJax or KaTeX CDN), the tables are HTML rather than hotlinked TrackMan images, and the footer and Sources entries are links (navigations), not fetches. The throwaway site ran under `default-src 'none'; connect-src 'none'` with zero violations (M10).
- **No injection delivery vector today.** There is no URL state, storage, postMessage or third-party input, so typed text can only reach the typist's own page (self-XSS). S4 hardens this for the future; it is not an open hole.
- **No `'unsafe-inline'` or `'unsafe-eval'` needed.** Verified empirically (M10). `version.js` is a module, not an inline script, so the release rewrite does not interact with CSP hashes.
- **Clickjacking.** `frame-ancestors` and `X-Frame-Options` cannot be set on GitHub Pages: no headers (D1), and `frame-ancestors` is ignored in meta (CSP3 section 3.3, M10). The page has no authenticated or state-changing action to hijack, so this is not a meaningful risk.
- **Shared origin `https://jhoblitt.github.io`.** As a project site, `'self'` also matches every other `jhoblitt` Pages project. The app sets no cookies and uses no storage (scope section 2), so there is nothing cross-project to read. Keep `'self'` rather than a path-restricted source: a path source tied to `jhoblitt.github.io` would block the local `smoke.sh` origin.
- **MIME and transport.** GitHub Pages serves `.js` as `application/javascript; charset=utf-8` (valid for module scripts) over HTTP/2, gzip-compressed, and redirects `http://` to `https://` with a 301 (D1).
- **Subresource Integrity.** It adds nothing for same-origin files, because the hash would come from the same origin as the file; see S8 for the provenance control that does help.
- **Finite but extreme densities terminate.** Density ratio 0 (vacuum), 1e-6, 50 and -1 all land within 96-282 steps (M8). The hang in S3 is specific to NaN and Infinity.
- **Page weight.** About 12 KB of modules plus ~75 KB of latin woff2 plus HTML and CSS. Nothing to cut beyond subsetting (S8).

## Out-of-lane observation (not a finding; for the physics reviewer)

With ρ₀ = 1.184 kg/m³ (25 °C, the spec's 5.1 reference), my throwaway calibration fits k_D 0.920-1.265 and k_L 0.813-1.114. That is about 3.5 % above 5.3's quoted envelope (0.89-1.22 / 0.79-1.08), which `aero-model.md` section 5 says was fitted at 1.225 kg/m³. The deltas are unaffected, but the envelope test in 8.1 should use the spec's own reference density.
