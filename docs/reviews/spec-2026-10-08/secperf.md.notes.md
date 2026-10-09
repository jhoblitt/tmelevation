# secperf review notes (verified facts, measurements, sources)

## Environment (2026-10-08)
- Host: AMD Ryzen 9 7950X3D (32 threads), Linux 7.2.8 Fedora 43.
- Node v22.22.2 (global WebSocket and fetch available).
- Google Chrome 154.0.8037.97 (headless, driven over CDP from Node).
- Throwaway implementation: /tmp/claude-1000/review-secperf/ (not product code).
- Did NOT read /tmp/claude-1000/aero-probe/ or /tmp/claude-1000/review-physics/.

## M1. Node 22 baseline, spec model as written (dt = 0.01 s, RK4, Hermite apex/landing, damped Newton)
Command: `node /tmp/claude-1000/review-secperf/bench/node-bench.mjs [tuned|naive]` (fresh process each; load avg 1.2 on 32 threads).
- Calibration needs exactly 3 Newton iterations and 10 flights per row (+1 cached sea-level run) = 253 flights for 23 rows; all rows converge from (1,1). Steps per sea-level flight 554-693.
- Sanity: PGA Driver at 7,800 ft (ratio 0.7486): dCarry +24.88 yd, dMaxHt -5.46 yd, dLand -7.93 deg (matches aero-model.md section 7 readings +24.9 / -5.5 / -7.9).
- "tuned" (scalar locals, no allocation, Math.pow): cold calibration 61.5 ms; warm 53.9 ms; recompute of 23 flights p50 4.49 ms, p95 4.74 ms, max 5.15 ms.
- "naive" (array state, new arrays per stage, Math.hypot, **): cold calibration 120.7 ms; warm 106.1 ms; recompute 23 flights p50 8.87 ms, p95 9.43 ms, max 11.0 ms.
- Desktop is a Ryzen 9 7950X3D, i.e. among the fastest single-thread JS hosts available in 2026.
## M2. Microbenchmark: Math.pow(S, 0.4) dominates
Command: `node /tmp/claude-1000/review-secperf/bench/micro.mjs` (2e6 ops, two runs, identical).
- Math.pow(x, 0.4): 36.2 ns/op; Math.exp(0.4*Math.log(x)): 14.3 ns/op; Math.sqrt: 2.7 ns/op.
- One flight = ~650 steps x 4 RK4 stages = ~2,600 pow calls = ~94 us of a ~195 us flight.

## M3. Step-size accuracy of the displayed deltas
Command: `node /tmp/claude-1000/review-secperf/bench/dt-accuracy.mjs`. Each dt calibrated separately (as the app would), deltas at 0..15,000 ft every 500 ft, 23 rows, compared with dt = 0.001 s.
- dt 0.01: max |dDelta| carry 9.9e-10 yd, maxHt 3.2e-10 yd, land 4.7e-5 deg.
- dt 0.02: carry 1.6e-8 yd, maxHt 5.1e-9 yd, land 1.5e-4 deg.
- dt 0.05: carry 6.4e-7 yd, maxHt 2.0e-7 yd, land 1.1e-3 deg.
- dt 0.10: carry 1.1e-5 yd, maxHt 3.4e-6 yd, land 4.6e-3 deg.
- Displayed rounded cells differing from the dt=0.001 reference: 0/2852 at every dt tried.
- Calibration absorbs the sea-level discretisation error, so Delta error is 3-4 orders smaller than absolute error.

## M4. Headless Chrome 154, CDP CPU throttling, spec model (dt 0.01)
Harness: /tmp/claude-1000/review-secperf/site/bench.html + bench.js, driven by bench/cdp.mjs (fresh browser context per run; calibration runs BEFORE table render, i.e. the naive load order; 120 simulated slider frames, one 23-flight recompute + 69 cell DOM writes per rAF). Run unsandboxed (Chrome needs socket()). Raw: /tmp/claude-1000/review-secperf/chrome-run1.jsonl
| impl | CPU | calibration ms | FCP ms | recompute23 p50/p95 ms | DOM write p50 ms | rAF interval p50 | frames >25 ms |
|---|---|---|---|---|---|---|---|
| tuned | 1x | 32.5 | 68 | 2.3/2.7 | 0.2 | 16.7 | 0/120 |
| tuned | 4x | 124.4 | 200 | 8.7/10.0 | 0.7 | 16.7 | 1/120 |
| tuned | 6x | 181.5 | 300 | 13.7/15.2 | 1.5 | 33.3 | 69/120 |
| naive | 1x | 94.7 | 140 | 7.3/8.9 | 0.2 | 16.7 | 0/120 |
| naive | 4x | 364.0 | 460 | 28.1/33.3 | 0.7 | 33.3 | 119/120 |
| naive | 6x | 533.7 | 668 | 43.5/58.0 | 1.1 | 50.0 | 120/120 |
- Calibration is a single long task (longtask entries 145 ms at 4x tuned, 383 ms at 4x naive, 561 ms at 6x naive).
- FCP is pushed out by the calibration long task when calibration runs before the first render.
- Chrome 154's V8 runs this ~1.9x faster than Node 22 at 1x (32.5 vs 61.5 ms).

## M5. What "mid-range phone" means on this host (Lighthouse benchmarkIndex)
Source: Lighthouse throttling docs https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md -- default mobile profile is 150 ms RTT, 1.6 Mbps down / 750 Kbps up, and a 4x CPU multiplier that "moves a typical run in the high-end desktop bracket somewhere into the mid-tier mobile bracket"; brackets: high-end desktop ~1500-2000, high-end mobile 800-1200, mid-tier mobile 125-800, low-end mobile <125; suggested high-end-desktop -> mid-tier-mobile multiplier 4x (range 2-10), "use a higher multiplier" when the host is at the top of its bracket.
Lighthouse source comment (core/lib/page-functions.js, main, fetched 2026-10-08): "125+ is a mid-tier Android phone, Moto G4"; "800+ is a high-end Android phone, Galaxy S8".
Measured: computeBenchmarkIndex (re-typed into /tmp/claude-1000/review-secperf/site/benchindex.html) in headless Chrome 154 via CDP:
- 1x: 3494 (well above the high-end desktop bracket); 4x: 792.5 (top edge of mid-tier mobile); 6x: 566; 10x: 293.5; 20x: 145.5.
- So on this host, 4x ~ the best "mid-tier" phone and 6x ~ a typical mid-tier phone; 10x-20x ~ low-end.

## M6. Candidate fixes, headless Chrome 154 + CDP throttling (raw: /tmp/claude-1000/review-secperf/chrome-run2.jsonl)
| config | CPU | calibration ms | FCP ms | recompute23 p50/p95 ms | frames >25 ms |
|---|---|---|---|---|---|
| tuned dt 0.05 | 4x | 35.8 | 120 | 1.7/2.6 | 1/120 |
| tuned dt 0.05 | 6x | 53.6 | 160 | 2.6/3.8 | 1/120 |
| tuned dt 0.05 | 10x | 86.0 | 240 | 4.8/7.0 | 59/120 |
| naive dt 0.05 | 4x | 88.9 | 176 | 6.3/7.3 | 1/120 |
| naive dt 0.05 | 6x | 155.6 | 276 | 9.1/10.9 | 26/120 |
| naive dt 0.05 | 10x | 247.2 | 432 | 16.2/22.0 | 120/120 |
| tuned dt 0.01 | 10x | 300.3 | 500 | 23.3/25.7 | 120/120 |
| naive dt 0.01 | 10x | 1011.2 | 1252 | 78.8/109.4 | 120/120 |
| tuned exp(0.4 log S) dt 0.01 | 4x | 155.8 | 244 | 11.0/12.4 | 18/120 |
| tuned exp(0.4 log S) dt 0.01 | 6x | 227.2 | 348 | 16.8/19.3 | 97/120 |
| tuned dt 0.01, paint table BEFORE calibration | 6x | 178.9 | **84** | 13.4/14.8 | 55/120 |
| naive dt 0.01, paint table BEFORE calibration | 6x | 604.2 | **76** | 42.1/48.6 | 120/120 |
- Replacing Math.pow by exp/log is SLOWER in Chrome 154 (opposite of Node 22): engine-specific, not a recommendation.
- dt 0.05 cuts calibration and recompute ~3.5-5x; with M3 it changes no displayed cell.
- Painting the published (sea-level) tables before calibrating cuts FCP from 300 -> 84 ms (tuned, 6x) and 668 -> 76 ms (naive, 6x); the calibration long task then lands after first paint but still blocks input for its duration (181 ms / 605 ms long task).

## M7. Spec unit test "halving dt changes outputs by < 0.01 yd" at dt 0.05
Command: `node /tmp/claude-1000/review-secperf/bench/halving.mjs` (23 rows, calibrated k, ratios 1 and 0.55).
- dt 0.01: carry <= 3.5e-10 yd, maxHt <= 5.0e-10 yd, land <= 4.3e-5 deg; 478-693 steps/flight.
- dt 0.05: carry <= 2.2e-7 yd, maxHt <= 3.2e-7 yd, land <= 1.1e-3 deg; 96-139 steps/flight.
- So dt 0.05 passes the spec's own halving test by >4 orders of magnitude and cuts steps ~5x.

## M8. Robustness: hostile / malformed inputs (Node 22)
Commands: `node /tmp/claude-1000/review-secperf/bench/robust.mjs`, `timeout 10 node .../bench/hang.mjs`.
- Spec 5.1 pressure formula on unclamped elevation: P(145,000 ft) = 3.0e-6 Pa; P(145,500 ft) = 3.3e-7 Pa; **P(150,000 ft) = NaN** (base 1 - 2.25577e-5 H goes negative above H = 44,331 m); P(Infinity) = NaN; P(-100,000 ft) = 1.6e6 Pa.
- Inverse: Z(P = 0) = 44,642 m; **Z(P < 0) = NaN**; Z(Infinity) = NaN; Z(1e9 Pa) = -203,983 m.
- JS parsing: Number('') = 0 and Number(' ') = 0 (parseFloat gives NaN); "Infinity", "-Infinity", "1e400" parse to +/-Infinity with both; "0x10" -> 16 with Number; "12abc" -> 12 with parseFloat; "1,5" -> NaN (Number) / 1 (parseFloat).
- flight() with density ratio 0, 1e-6, 50, -0.01, -1 terminates (finite, 96-282 steps). With ratio NaN or Infinity, or k_D / k_L = NaN or Infinity, the state goes NaN; NaN is absorbing and the landing test (y < 0 && v_y < 0) is never true: 2,000,001 steps without terminating (242 ms) under a test cap; **without a cap, `hang.mjs` (elevation typed live as "150000" ft) never returned and was killed by a 10 s timeout (exit 124).**
- calibrate() on a degenerate row (spin 0: zero lift, singular Jacobian) does not converge (resid -133.8 yd / -26.7 yd); my damped Newton rejects the NaN step and stops, but a plain Newton would assign NaN to k_D/k_L and then hang in flight().

## D1. Documented browser / host behaviour
- CSP3 section 3.3 "The <meta> element" (https://www.w3.org/TR/CSP3/): "Neither are the report-uri, frame-ancestors, and sandbox directives." [supported in meta]; "policies in meta elements are not applied to content which precedes them."
- MDN style-src (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src): without 'unsafe-inline', `<div style=...>` attributes, `setAttribute("style", ...)` and `style.cssText = ...` are blocked; "styles properties that are set directly on the element's style property will not be blocked" (`el.style.display = "none"`).
- GitHub Pages response headers, measured 2026-10-08 with curl (unsandboxed) against https://mdn.github.io/js-examples/module-examples/basic-modules/{index.html,main.js} (a GitHub Pages project site):
  - HTTP/2; `server: GitHub.com`; `cache-control: max-age=600` plus `expires` (+10 min) and weak `etag` on both HTML and JS; `access-control-allow-origin: *`.
  - JS served as `content-type: application/javascript; charset=utf-8` (valid JavaScript MIME, so module scripts load).
  - Compression: gzip only. With `Accept-Encoding: br` alone the 503-byte main.js came back uncompressed (no content-encoding); with `gzip, br` it came back gzip (258 bytes).
  - No `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy` or `strict-transport-security` header on 200 responses. (GitHub's own 404 page carries `content-security-policy: default-src 'none'; style-src 'unsafe-inline'; img-src data:; connect-src 'self'`.)
  - Plain http:// returns `301 Moved Permanently` (to https).
- Third-party summary (search result, not GitHub docs): GitHub Pages cannot set custom response headers; meta CSP is the workaround (htmhell.dev/adventcalendar/2023/7/, scotthelme.co.uk/launching-report-uri-js/). Consistent with the measured headers above.

## D2. Fonts (downloaded 2026-10-08 unsandboxed into /tmp/claude-1000/review-secperf/dl-fonts/, untrusted data, only measured)
- Google Fonts CSS2 API with a Chrome 154 UA: Oswald is served as ONE variable woff2 per subset covering wght 200-700; latin subset `fonts.gstatic.com/s/oswald/v57/TK3iWkUHHAIjg752GT8G.woff2` = 28,488 bytes (sha256 bd73278e...6ea5).
- Lato latin subsets (v25): 300 = 23,236 B; 400 = 23,580 B (sha256 918b7dc3...e537); 700 = 23,040 B (sha256 c447dd76...0e49).
- Requesting `family=Lato:wght@600` returns HTTP 400: Google Fonts' Lato has no semibold. (Lato 2.x from latofonts.com does; not fetched.)
- So Oswald variable + Lato 400 + Lato 700 latin = 75,108 bytes (woff2 is already compressed; gzip does not apply). At Lighthouse Slow 4G (1.6 Mbps) that is ~0.38 s of transfer.

## M9. Cold load waterfall, Lighthouse Slow 4G (CDP request-level: 150 ms latency, 200,000 B/s down, 93,750 B/s up) + 6x CPU
Harness: /tmp/claude-1000/review-secperf/site2/ (module graph per spec section 7: app -> {data, model, present, controls, version}; model -> {calibrate, flight}; controls -> atmosphere -> units; present -> units; flight -> units), real Oswald/Lato latin woff2, local Node HTTP/1.1 server on 127.0.0.1:18766 (port 8766 was taken by another process -- not touched). Fresh browser context per run. Raw: /tmp/claude-1000/review-secperf/net-run1.jsonl, net-run2.jsonl. Times in ms from navigation start.
| variant | app.js starts | tables in DOM | LCP | calibration done | fonts ready | CLS | FCP |
|---|---|---|---|---|---|---|---|
| no preload, calibrate first | 864 | 1047 | 1092 | 1089 | 1089 | 0.040 | 356 |
| no preload, paint first | 867 | 874 | 920 | 1098 | 1100 | 0.047 | 360 |
| modulepreload only, calibrate first | 677 | 884 | 936 | 931 | 931 | 0.045 | 368 |
| modulepreload only, paint first | 677 | 685 | 756 | 950 | 984 | 0.090 | 364 |
| modulepreload + font preload, calibrate first | 556 | 744 | 796 | 793 | 930 | 0.087 | 488 |
| modulepreload + font preload, paint first | 557 | 561 | 608 | 786 | 937 | 0.087 | 464 |
| same, font-display: block instead of swap | 556 | 563 | 932 | 781 | 929 | 0.087 | 456 |
- Without modulepreload the graph resolves in 3 sequential levels after app.js: app.js 168-351 -> L2 352-696 -> L3 533-861 (resource timing), i.e. ~3 x 170 ms of pure discovery latency.
- Font preload competes with CSS for the 1.6 Mbps link: FCP 356-368 -> 456-488 ms; it brings LCP forward only with paint-first.
- CLS sources: a ~0.037-0.047 shift when JS inserts the tables (footer pushed down) and ~0.05 when the webfonts replace the fallback. font-display block vs swap made no CLS difference (text is laid out in fallback metrics either way). All runs < 0.1 (web.dev "good").
- Local HTTP/1.1 (6 connections/host) queues some L2 requests; GitHub Pages serves HTTP/2 (D1), so the no-preload numbers are slightly pessimistic on queueing but the 3-level dependency chain is inherent.

## M10. Strict meta CSP, empirical (headless Chrome 154). Raw: /tmp/claude-1000/review-secperf/csp-run1.json; page /tmp/claude-1000/review-secperf/site2/csp.html
Policy (meta, first element after charset): `default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; require-trusted-types-for 'script'; trusted-types 'none'; frame-ancestors 'none'`
- Works with NO violation: the whole ES-module graph (modulepreload + type=module), external stylesheet, self-hosted woff2 (document.fonts.check true for Oswald 700 and Lato 400), native MathML (`MathMLElement`, mfrac laid out 20 px tall), table render + calibration (tables at 32 ms, calibration done 69 ms at 1x, dt 0.05).
- Blocked (securitypolicyviolation `style-src-attr`): static `style="..."` on an HTML element, `style="..."` on a MathML `<mi>`, and `el.setAttribute('style', ...)`.
- Allowed: `el.style.visibility = 'hidden'` (CSSOM property set), consistent with MDN (D1).
- `el.innerHTML = '<b>x</b>'` threw TypeError with violation `require-trusted-types-for | trusted-types-sink` and console "This document requires 'TrustedHTML' assignment." -> Trusted Types enforcement works from a meta CSP in Chrome. `textContent` with markup stays text.
- Console: "The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element." (matches CSP3 section 3.3).

## M11. Smoke-test channel for CSP violations
Command: `google-chrome --headless=new --enable-logging=stderr --v=0 --virtual-time-budget=5000 --dump-dom http://127.0.0.1:18766/csp.html?...` (unsandboxed, separate profile). stdout had the rendered tables; stderr carried every CSP message as `INFO:CONSOLE` lines ("Applying inline style violates ... 'style-src 'self''", "This document requires 'TrustedHTML' assignment", the frame-ancestors-ignored notice). So a `--dump-dom` smoke script can fail on CSP violations by grepping stderr; no CDP or npm dependency needed.

## M12. Methods page: live oracle table cost, dominated by oracle 9 (every row, 0 -> 10,000 ft, monotone)
Harness: /tmp/claude-1000/review-secperf/site/methods-bench.html (calibrate 23 rows, then sweep N evenly spaced elevations per row, one flight each). Chrome 154, 6x CPU. Raw: /tmp/claude-1000/review-secperf/methods-run1.jsonl
| impl | dt | N per row (spacing) | sweep flights | calibration ms | sweep ms | total main-thread block ms |
|---|---|---|---|---|---|---|
| tuned | 0.01 | 21 (500 ft) | 483 | 174 | 283 | 457 |
| tuned | 0.01 | 101 (100 ft) | 2,323 | 171 | 1,341 | 1,512 |
| naive | 0.01 | 101 (100 ft) | 2,323 | 519 | 4,564 | 5,082 |
| tuned | 0.01 | 1,001 (10 ft) | 23,023 | 177 | 13,194 | 13,371 |
| tuned | 0.05 | 101 (100 ft) | 2,323 | 50 | 275 | 325 |
| naive | 0.05 | 101 (100 ft) | 2,323 | 113 | 902 | 1,015 |
- All other oracles together are ~25 flights (negligible). The spec does not fix the sweep spacing for the live table.

## M13. Version skew across a deploy with GitHub Pages caching (demonstrated)
Harness: /tmp/claude-1000/review-secperf/site3/{v1,v2} + bench/skewserve.mjs (127.0.0.1:18767, `cache-control: max-age=600` and weak etag as measured on GitHub Pages, D1) + bench/skew.mjs (one browser context, normal navigations). v2 renames an export of model.js and updates both importers.
- Visit /index.html under v1: "index ok: v1 deltas".
- "Deploy" v2. Visit /methods.html: server log shows v2 methods.html and v2 methods.js fetched, model.js NOT re-requested (served fresh from HTTP cache = v1). Result: `SyntaxError: The requested module './model.js' does not provide an export named 'deltasFor'`; the page stayed at its no-JS content.
- Visit /index.html again: still v1 from cache, consistent, no error.
- So any release that changes a cross-module export can break the other page for a visitor for up to 10 minutes after a deploy (the max-age window), and with JS-rendered tables the failure is a blank page, not stale numbers.

## D3. font-display
- MDN @font-face/font-display (https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display): initial value `auto` = "defined by the user agent"; `block` = "short block period and an infinite swap period"; `swap` = "extremely small block period and an infinite swap period"; `optional` = "extremely small block period and no swap period".
- CSS Fonts 4 (https://www.w3.org/TR/css-fonts-4/) section 3.1 table: existing browsers hide text up to a 3-second timeout (Chrome, Opera, Firefox, Safari) before falling back. So `auto` / `block` can leave table text invisible for up to ~3 s on a slow link.

- (D1 addendum) `curl -I http://mdn.github.io/...` -> `301 Moved Permanently`, `Location: https://mdn.github.io/...` (same path).
- (M6 addendum) tuned dt 0.01 at 10x: calibration long task 356 ms (chrome-run2.jsonl), so tuned long tasks span 145-356 ms over 4x-10x.

## Status
Review COMPLETE 2026-10-08. Findings doc: secperf.md (S1-S8). Background processes started for this review: node serve.mjs on 127.0.0.1:8765 and 18766, node skewserve.mjs on 18767, headless Chrome on 9333 (profile /tmp/claude-1000/review-secperf/chrome-prof) -- stopped at the end of the review.
