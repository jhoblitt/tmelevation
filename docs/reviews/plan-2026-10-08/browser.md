# Plan review 2026-10-08 — browser-facing tasks (Tasks 10–12)

Adversarial feasibility review of the browser-facing tasks of
`docs/superpowers/plans/2026-10-08-tmelevation.md`, by throwaway experiments under
`/tmp/claude-1000/plan-review-browser/`. Raw commands and outputs are in
`browser.md.notes.md`.

## Summary

Tasks 10–12 are feasible. Every mechanism the plan relies on works in Chrome 154 driven from Node 22
with no dependency. Node's global `WebSocket` drives CDP, the `DevToolsActivePort` launch works,
phone emulation works, the CDP events arrive, a 404 in the module graph fires `error` on the module
script after the `defer` `boot.js` has attached its listener, `<noscript>` renders with scripts
disabled, the strict CSP + Trusted Types policy runs the whole feature set with zero violations,
`?v=` keeps modulepreload single-fetch, bfcache works headless, and every RF-4 geometry assertion can
be measured exactly. No blocker.

Four major findings: a check that cannot fire, a false error shown to real users, an untested path
that breaks spec §4.2, and a rule that contradicts two of the plan's own e2e expectations.

1. **B1 (major)** — The smoke test's CSP check looks for "Refused to"; Chrome 154 phrases every
   violation as "… violates the following Content Security Policy directive …" (and TT as "This
   document requires 'TrustedHTML' assignment"). As written the check never fires.
2. **B2 (major)** — The 10 s watchdog keys on `ready`, which needs 23 chained timers. In a
   background tab those run at 1/s, so a working page showed "did not load" at 10 s and became ready
   at 16 s.
3. **B3 (major)** — Without bfcache, Chrome restores the unit `<select>` and the slider *after*
   `load`, and the plan re-renders only on `persisted` `pageshow`. The controls end up disagreeing
   with the tables. The planned back/forward test passes via bfcache and never sees this.
   `autocomplete="off"` on the select and slider, plus re-rendering on every `pageshow`, fixes it.
4. **B11 (major)** — "Never overwrite the focused box" contradicts RF-2 (only reachable
   programmatically, with focus kept) and RF-3 (Enter keeps focus, yet `5,280` is expected). Render
   from `state.edit`, not from focus.

Minor and nit findings tighten assertions that can pass on broken pages: B5 (pinned row: one-line
check, fixed readout width), B4, B7, B8, B10. They also cover failure paths the watchdog alone
handles slowly (B6), a CI env inconsistency (B13), and two unexercised behaviours (B9 RF-1 race, B12
safe areas). One caveat sits under the non-findings: Node and Chrome results differ by 1 ulp on many
transcendental calls (E9), so RF-1 must compare rounded strings, which it does.

## Experiments

| # | Assumption | Result | Evidence path |
|---|------------|--------|---------------|
| E1 | Node 22 global `WebSocket` drives CDP without flags; `DevToolsActivePort` in `--user-data-dir`; 320×568 emulation; `exceptionThrown` / `Log.entryAdded` / `responseReceived` arrive | Confirmed. But Chrome 154 CSP violation texts do not contain "Refused to" (→ B1); headless Chrome requests `/favicon.ico` and CDP reports the 404 | `/tmp/claude-1000/plan-review-browser/e1.mjs`, `e1.out` |
| E3 | Strict CSP + TT: modulepreload, font preload `crossorigin`, `textContent`, `classList`, `hidden`, `style.setProperty`, MathML, module graph, SVG `rel=icon`, `?v=` on preload and import URLs | Confirmed: zero violations, every URL fetched once, fonts used, MathML lays out, `favicon.svg` loads under `img-src 'self'` and suppresses `/favicon.ico` | `e3.mjs`, `e3/`, `e3.out` |
| E2 | RF-5: a 404 in the module graph fires `error` on the module `<script>`; classic `defer` `boot.js` runs first and its listener is in time; `boot.js` works under TT; `<noscript>` renders with `setScriptExecutionDisabled` | Confirmed for 404s (with/without modulepreload, even with boot.js delayed 1.5 s; deferred-list order holds). Parse/link errors fire only window `error` → 10 s watchdog path (→ B6). `<noscript>` renders | `e2.mjs`, `e2/`, `e2.out` |
| E2b | The 10 s watchdog ("error unless `ready`") cannot fire on a page that is working | **Disproved**: in a background tab chained `setTimeout(0)` runs 1/s; a 23-row load took 16 s, watchdog fired at 10 s and showed the error, page reached `ready` at 16 s; rAF never ran while hidden (→ B2) | `e2b.mjs`, `e2b/`, `e2b.out` |
| E5r | RF-1: a CDP slider sweep started on `DOMContentLoaded` lands before calibration completes | Holds on this host: 30/30 inputs landed while rows were pending in every trial (load stretched to ~85–100 ms by the 4 ms nested-timer clamp). Test cannot tell if it raced (→ B9, minor) | `e5r.mjs`, `e5r/`, `e5r.out` |
| E4 | RF-4: page overflow at 320 px, pinned row ≤ 64 px, `scrollLeft` at right edge after load and rotation, user scroll kept, sticky row/bar at top 0 — all measurable via CDP; emulated rotation fires `resize` | Measurable: exact integer equality held at dpr 2/3/2.625; rotation with `screenOrientation` fires `orientationchange` + `resize`; wheel via `Input.dispatchMouseEvent` scrolls one table; sticky via `display: contents` works. Traps: `.sr` absolute spans escape the scroller (→ B4); page overflow widens `innerWidth` (→ B7); `max-height` makes "≤ 64 px" vacuous (→ B5) | `e4*.mjs`, `e4/`, `e4*.out` |
| E5 | RF-1/RF-3: CDP slider `input`, Tab/Arrow/Space/Enter; focus order and computed `outline-style` observable; ArrowRight = exactly +10 ft | Confirmed: Tab order and `outline-style`/`:focus-visible` observable; ArrowRight +10 from a step multiple; Space clicks; Enter also fires `change`. Metres slider snaps 1609.344 → 1610. One step changes PGA Driver carry by ≈ 0.035 yd, so "carry cell updates" is observable only as the delta line appearing (→ B8) | `e5.mjs`, `e5.out` |
| E6 | Back/forward: headless Chrome over CDP restores from bfcache and the test can observe `pageshow.persisted` | Confirmed (even with `no-store`). But with bfcache unavailable, Chrome restores the `<select>` and range values after `load`, before a `persisted=false` `pageshow` — controls disagree with the state; the planned test passes via bfcache and never sees this; `autocomplete="off"` on select and range prevents it (→ B3) | `e6.mjs`, `e6c.mjs`, `e6/`, `e6*.out` |
| E7 | Builder regex catches every import form; a module imported with and without `?v=` is harmless | A `from`-anchored regex handles multi-line and `export * from` but misses side-effect `import './x.js'` and `import()`; mixed specifiers → double fetch and **two module instances**; a preload/CSS URL mismatch yields only a console *warning* (→ B10) | `e7/rewrite.mjs`, `e7.mjs`, `e7/`, `e7.out` |
| E8 | `viewport-fit=cover` safe areas: any trap under emulation | No trap: `Emulation.setSafeAreaInsetsOverride` drives `env()`; insets are 0 unless overridden, so the plan's e2e never exercises "Safe-area insets padded" (→ B12, nit) | `e8.mjs`, `e8.out` |
| E9 | RF-1 oracle: model output computed in Node equals Chrome's | Not bit-identical: 3–27 % of `pow`/`exp`/`log`/`atan2`/`sin`/`cos` results differ by 1 ulp (Node 22 V8 12.4 vs Chrome 154). Rounded cell strings still agree in practice (non-finding with a caveat) | `e9.mjs`, `e9b.mjs`, `e9/`, `e9*.out` |
| E10 | RF-2 e2e: "type `abc`, switch unit" exercises `setElevationUnit` with a pending edit | Only programmatically: real keyboard/pointer paths blur (commit → revert) before the unit changes; the programmatic path leaves the box focused, where Task 10's "never overwrite the focused box" rule keeps `abc` (→ B11) | `e10.mjs`, `e10.out` |
| E11 | Pinned row at 320 px holds slider + readout + two 44 px buttons on one line | Fits only with a ~62 px slider; a content-sized readout (97–136 px) changes the slider width by 23 px during a drag (→ B5) | `e11.mjs`, `e11.out` |

## Findings

Each finding cites the experiment that proves it (paths are relative to
`/tmp/claude-1000/plan-review-browser/`; raw output in the notes file).

### B1 — major — Task 12 Smoke: the CSP check matches "Refused to", which Chrome 154 never prints

**Assumption.** A CSP violation shows up as a `Log.entryAdded` whose text contains "Refused to".

**Evidence.** E1 and E3 (`e1.out`, `e3.out`). Chrome 154 reports every violation as
`source: "security", level: "error"` with text such as "Applying inline style violates the following
Content Security Policy directive…", "Executing inline script violates…", "Loading the image '…'
violates…", "Loading the script '…' violates…", and, for Trusted Types, "This document requires
'TrustedHTML' assignment. The action has been blocked." None of them contains "Refused to", so the smoke
check as written passes on a page that violates the policy. A TT violation inside a `try` throws no
uncaught exception, so the console log is the only signal.

**Change.** In Task 12 Smoke, fail on any `Log.entryAdded` with `entry.source === 'security'`, and on
any `entry.level === 'error'` (that also catches failed loads). Keep the text match out of the
assertion. Add a negative control to `e2e.mjs`: a page served with one inline `style=` attribute must
make the detector fire.

### B2 — major — Task 10 Load-failure handling: the 10 s watchdog fires on working pages in background tabs

**Assumption.** If `data-state` is not `ready` after 10 s, the module graph failed.

**Evidence.** E2b (`e2b.out`). In a tab opened in the background (`Target.createTarget {background:
true}`, which is what a middle-click or ⌘-click does), chained `setTimeout(…, 0)` runs once per second
after the first ~6 calls. A 23-row load, one row per macrotask, reached `ready` after 16 s. The
watchdog fired at 10 s, set `data-state="error"` and showed `#load-error` on a page that then finished
normally. `requestAnimationFrame` never ran while the tab was hidden (0 callbacks). `methods.html`
carries `boot.js` too and has roughly twice as many macrotasks (23 rows plus every oracle), so it is
hit harder.

**Change.** The watchdog must check whether `app.js` *started*, not whether calibration finished. The
first statement of `app.js` / `methods.js` sets a start marker (for example
`data-state="running"`), and `boot.js` reports an error only while the state is still `loading`. If
the watchdog has already fired when the module starts, the module clears the error and hides
`#load-error`. Do not set `ready` from inside a rAF callback (rAF does not run while hidden). Add an
e2e case: open `index.html` and `methods.html` with `Target.createTarget {background: true}`; after
12 s `#load-error` is hidden and `data-state ≠ error`; after activating the target, `ready`.
Optionally, calibrate several rows per task within a time budget (for example 8 ms) so that hidden
tabs finish sooner.

### B3 — major — Task 10 Events / Task 12 Back/forward: when bfcache is not used, Chrome restores the select and slider after `load`, and nothing re-renders

**Assumption.** Re-rendering on `pageshow` with `persisted` is enough to keep the controls in sync
with the state (spec §4.2), and the back/forward e2e covers it.

**Evidence.** E6 (`e6.out`, `e6b.out`, `e6c.out`). In headless Chrome over CDP, bfcache works: the
same heap and `pageshow persisted=true`, even with `Cache-Control: no-store`. So the planned test
passes, and it would pass with or without a `pageshow` handler, because the frozen DOM is already
consistent. With bfcache unavailable (`--disable-features=BackForwardCache`, standing in for eviction,
memory pressure or a reload in other browsers), the page reloads and `app.js` renders `0 / ft / 0 /
"0 ft"`. Then, **between `load` and a `persisted=false` `pageshow`**, form-state restoration puts the
`<select>` back to `m` and the range back to `5280`. The `autocomplete=off` text box stays at `0`. The
result is a page whose slider says 5,280, whose unit says m, and whose readout and tables say sea
level — exactly what §4.2 forbids. With `autocomplete="off"` also on the select and the range, nothing
is restored (`e6c.out`).

**Change.** Task 10: give both unit selects and the slider `autocomplete="off"` (assert it in
`static.test.js`), and re-render on every `pageshow`, not only when `persisted`. Task 12: run the
back/forward case twice. Once in the default browser, also asserting that `pageshow.persisted === true`
was observed (so the test knows which path it exercised). Once in a browser launched with
`--disable-features=BackForwardCache`, asserting that the box, select, slider, readout and the PGA
Driver carry cell agree with one state (sea level, since state is not persisted).

### B11 — major — Task 10 Render vs Task 12 RF-2 and RF-3: "never overwriting the focused box's text" contradicts two e2e expectations

**Assumption.** The render rule "controls from `view(state)`, never overwriting the focused box's
text" is compatible with RF-2 ("type `abc`, switch unit → box shows the state in metres") and with
RF-3 ("typing `5280` + Enter … commits (`5,280`)").

**Evidence.** E10 (`e10.out`) and E5 (`e5.out`). Through real input, a unit change with a pending
edit never happens. Tabbing to the select or pressing on it fires `change` and `blur` on the box
first, so the commit reverts `abc` before the unit changes. The only path that reaches
`setElevationUnit` with a pending edit is a programmatic change, and there the box **keeps focus**
(`active: elev`). The focus rule then keeps `abc` on screen while `controls.js` has cleared the edit,
so RF-2 fails. Enter in a text box outside a form fires `keydown` and `change` but no `blur` (E5), so
the box still has focus when RF-3 expects it to read `5,280`.

**Change.** Replace the focus-based rule with a state-based one. Each box shows `view().elevText` /
`pressText`, which already returns `edit.text` verbatim for the box under edit, and is assigned only
when it differs from the current `value`, so the caret is never disturbed while typing. RF-2's e2e
then does the programmatic change with the box focused (the only way to reach that state) and
asserts the text and `aria-invalid`. Add a second assertion that the real keyboard path (Tab,
ArrowDown) reverts `abc` on blur.

### B5 — minor — Task 12 RF-4: "pinned row ≤ 64 px" can pass on a broken row; at 320 px the row barely fits and the slider changes width as the readout changes

**Evidence.** E4 §3 and E11 (`e4b.out`, `e11.out`). In a straightforward implementation (slider, a
14 px readout, two 44 px buttons, 12 px padding) the buttons stack at 320 px and the row is 96 px tall.
With `max-height: 64px` (the obvious way to "meet" the budget), `getBoundingClientRect().height` is
exactly 64 while `scrollHeight` is 76 and the children sit on three different lines. The readout's
width runs from 97 px (`0 ft · 29.92 inHg`) to 136 px (`15,000 ft · 572.0 mbar`). With a flexible
slider, the track shrinks by 23 px during a 0 → 15,000 ft drag, so the thumb drifts under the finger.
With the widest readout, the slider gets about 62 px at 320 px.

**Change.** In RF-4, assert one line: every child of the pinned row has the same `top` (± 1 px), and
`scrollHeight ≤ 64` as well as the box height. Run the check with the widest readout (15,000 ft, mbar)
as well as at load. In Task 10, give the readout a fixed width (in `ch`, with `tabular-nums`) sized to
its longest string. Add an e2e assertion that the slider's width is identical at 0 and at 15,000 ft.

### B4 — minor — Task 10 layout: visually hidden `.sr` text escapes the horizontal scroller unless the scroller is a containing block

**Evidence.** E4 §1 (`e4-overflowing.out`, `e4find.mjs`). With the standard visually-hidden recipe
(`position: absolute; width: 1px; …`) on the 69 `.sr` spans, their containing block is the page, not
the `overflow-x: auto` scroller, so they are not clipped. At 320 px `documentElement.scrollWidth` was
709, mobile emulation widened `innerWidth` to 709, and after an emulated rotation
`visualViewport.scale` was 1.775 and the wheel test could no longer scroll the table. Adding
`.scroller { position: relative }` fixed all of it (scrollWidth 320). RF-4's overflow assertion would
catch this, but the DOM contract in Task 10 makes the bug the default outcome.

**Change.** In Task 10 Layout, add: "`.scroller` establishes the containing block for its contents
(`position: relative`) so visually hidden text is clipped with the table."

### B6 — minor — Task 10 Load-failure handling: parse and link errors in the module graph wait the full 10 s

**Evidence.** E2 (`e2.out`). A 404 anywhere in the graph fires `error` on `#app-module` in every
ordering tried: with and without modulepreload, for `app.js` itself, and with `boot.js` delayed
1.5 s, since module scripts wait their turn in the deferred list. A SyntaxError in a dependency, or a
missing named export (the deploy-skew failure the secperf review demonstrated), fires **no** element
`error`, only a window `error` (and `Runtime.exceptionThrown`). `app.js`'s own handlers are never
installed, so the page sits in `loading` until the watchdog.

**Change.** `boot.js` also listens for window `error` until the module signals that it started (see
B2) and treats it as a load failure. Give `serve.mjs` a way to serve a broken body for one path, and
add an e2e case: a dependency with a syntax error → `data-state="error"` within 1 s.

### B7 — minor — Task 12 RF-4: compare the carry cell against 320 px (or `clientWidth`), not `innerWidth`

**Evidence.** E4 (`e4.out` H, `e4-overflowing.out`). When anything overflows at 320 px, mobile
emulation widens the layout viewport to the content: a 400 px element gives `innerWidth` 400
(`clientWidth` 320), and the `.sr` leak gives 709. A "carry cell inside the viewport" check written
against `innerWidth` passes exactly when the layout is broken. After rotation in that state
`visualViewport.scale` ≠ 1, so other geometry is distorted too.

**Change.** In RF-4, "inside the viewport" means `0 ≤ left` and `right ≤ document.documentElement.clientWidth`
(= the emulated width). Run the `scrollWidth ≤ 320` assertion first and stop on failure.

### B8 — minor — Task 12 RF-3: one slider step does not visibly change the PGA Driver carry value

**Evidence.** E5 (`e5.out`). ArrowRight on `step=10` raises the value by exactly one step (0 → 10 → 20),
but by the golden table PGA Driver ΔC ≈ 0.0035 yd/ft, so 10 ft moves carry by ≈ 0.035 yd: `282/258`
stays `282/258`. From 0 ft only the delta line changes (hidden → `±0/±0`). From any other starting
point nothing visible changes. Separately, the metres slider (step 5) snaps a state of 1609.344 m to
**1610** (E5), so in metres the slider never shows the value the box shows, and the Task 9 unit case
`inputSlider(s, 1609)` uses a value a real slider cannot produce.

**Change.** In RF-3, assert after ArrowRight from 0: readout `10 ft · …`, box `10`, `aria-valuetext`
`10 feet`, and the PGA Driver carry cell equal to the expected cell at 10 ft (delta line visible,
`±0/±0`). Change the Task 9 metres example to a step multiple (for example 1610), and record a ruling
that the slider shows the nearest step.

### B10 — minor — Task 12 Artifact builder and Task 10 preload test: shared blind spots, and a missed specifier silently doubles a module

**Evidence.** E7 (`e7.out`). An obvious `from`-anchored rewrite handles multi-line imports and
`export * from` but misses `import './x.js'` (side-effect) and `import('./x.js')`. Task 10's
preload-graph test ("follow `import … from` and `export … from`") has the same blind spot, so both
tests can pass while a module goes unversioned and unpreloaded. In Chrome a module referenced as both
`./state.js?v=…` and `./state.js` is fetched twice and **instantiated twice** (`instances: 2`). A
preload/CSS URL mismatch costs a second font download and produces only a console *warning* ("…preloaded
using link preload but not used…"), which "no console error" does not catch.

**Change.** Either forbid the two forms (a static test fails on a bare `import '…'` and on `import(`
under `site/js/`), or handle them in both the builder and the graph walker. Add a runtime check to
Smoke that is independent of any regex: every same-origin subresource is requested exactly once
(`Network.requestWillBeSent` counts), every `/js/`, `/css/` and `/fonts/` URL carries
`?v=<version>`, and a "preloaded … but not used" `Log.entryAdded` warning fails the run.

### B13 — minor — Task 12 `cdp.mjs` env contract vs Task 13: `CHROME_NO_SANDBOX` is set only for the CI browser job, but `deploy.yml` runs `smoke.mjs` too

**Assumption.** Only `ci.yml`'s `browser` job launches Chrome.

**Evidence.** Plan text: Task 13 `deploy.yml` build job runs `node test/browser/smoke.mjs _site`;
Task 13 tells the executor to add `CHROME_NO_SANDBOX: '1'` only to `ci.yml`'s `browser` job, if
needed. Whether the ubuntu-latest image needs it was not verified (no runner here).

**Change.** State that whatever `env` the CI `browser` job needs for Chrome, the `deploy.yml` build
job needs too. Better: let `cdp.mjs` retry with `--no-sandbox` only when `CHROME_NO_SANDBOX=1`, and set
it in both jobs from one decision.

### B9 — nit — Task 12 RF-1: the race is exercised by accident and never asserted

**Evidence.** E5r (`e5r.out`). On this host all 30 CDP-driven slider inputs landed while rows were
still pending, in every trial (calibration ended at 83–98 ms; inputs at 11–36 ms). That is only
because Chrome clamps chained timers to 4 ms, which stretches ~2–9 ms of work over ~90 ms. The test
asserts only the final cells, so it would keep passing if the race stopped happening (faster batching,
B2's time-budget change).

**Change.** In the first slider `Runtime.evaluate`, also return `data-state` and the number of `…`
cells, and assert `loading` and > 0. Optionally run RF-1 under `Emulation.setCPUThrottlingRate {rate: 4}`
to widen the window.

### B12 — nit — Task 12: "Safe-area insets padded" is never exercised

**Evidence.** E8 (`e8.out`). Without an override every `env(safe-area-inset-*)` is 0 under emulation.
`Emulation.setSafeAreaInsetsOverride` exists in Chrome 154 and drives `env()`: landscape L/R 47 gives
body padding `0 47px 21px` with no overflow. With a top inset, the sticky pinned row at `top: 0` sits
under it unless it pads itself.

**Change.** Add an e2e run at 844×390 with insets L/R 47, B 21: no page overflow, and no control or
pinned Club cell left of 47 px. Decide whether the pinned row pads `env(safe-area-inset-top)`, and
assert accordingly.

## Non-findings

- **CDP from Node with no dependency (assumption 1).** Node 22.22.2's global `WebSocket` connects to
  the browser endpoint with no flags and no `--remote-allow-origins`. `--remote-debugging-port=0`
  writes `DevToolsActivePort` into `--user-data-dir`. `--headless=new` is accepted by Chrome 154.
  `Target.createTarget` + `attachToTarget {flatten: true}` gives per-page sessions.
  `setDeviceMetricsOverride` 320×568 gives `innerWidth` 320 and phone media queries.
  `Runtime.exceptionThrown`, `Runtime.consoleAPICalled`, `Log.entryAdded` and
  `Network.responseReceived` all arrive (E1). Node 24: the Node docs list `WebSocket` as "No longer
  behind `--experimental-websocket`" since v22.0.0 and "No longer experimental" since v22.4.0
  (https://nodejs.org/docs/latest-v24.x/api/globals.html); not run on Node 24 here.
- **RF-5 design (assumption 2).** A 404 anywhere in the graph fires `error` on the module `<script>`.
  The classic `defer` `boot.js` always runs first, even when its own response is 1.5 s late, because
  deferred classic and module scripts share one ordered list, and `#app-module` already exists when it
  runs. `boot.js` touches no Trusted Types sink. `Emulation.setScriptExecutionDisabled`, sent
  **before** `Page.navigate` on a fresh target, makes `<noscript>` parse as elements and render, and
  `Runtime.evaluate` still works for the assertion (E2).
- **Strict CSP feature set (assumption 3).** With the plan's policy verbatim: modulepreload, font
  preload with `crossorigin`, `textContent`, `classList`, `hidden`, `style.setProperty`, MathML
  (`mfrac` lays out 37 px tall, `display: block math`), an `export * from` graph, and an SVG
  `rel="icon"` produced zero violations. Every `?v=` URL was fetched exactly once, so preloads are
  consumed. The favicon link suppresses Chrome's automatic `/favicon.ico` request, which headless
  Chrome does make and CDP does report as a 404 (E1, E3) — the plan's favicon ruling is right.
- **RF-4 is measurable (assumption 4).** With integer layout, and with fractional table widths at
  dpr 2, 3 and 2.625, `scrollLeft` read back as an integer exactly equal to
  `scrollWidth − clientWidth`. A ±1 px tolerance is still cheap insurance. An emulated rotation fires
  `resize` (plus `orientationchange` and `screen.orientation` `change` when `screenOrientation` is
  passed — pass it). `Input.dispatchMouseEvent {type: 'mouseWheel', deltaX}` scrolls one table like a
  user, and that table kept its position across rotations while the other re-pinned. A sticky
  pinned row whose desktop wrapper is `display: contents` on phones sticks at `top: 0`, and the
  desktop bar sticks as a whole (E4). Realistic delta strings in both modes do not change column
  widths. Swapping from the fallback font to Oswald/Lato shrank the table here, so a pinned-right
  scroller stayed right by clamping. Re-pinning on `document.fonts.ready` or a `ResizeObserver` is
  still advisable on platforms whose fallback is narrower.
- **Keyboard (assumption 5).** `Input.dispatchKeyEvent` Tab from `<body>` walks the controls in DOM
  order, and `outline-style` / `:focus-visible` are observable at every stop. ArrowRight on
  `step=10` is exactly +10 and fires `input`. Space (keyDown with `text: ' '`) clicks a button. Enter
  in a text box fires `keydown` and also `change`, a harmless double commit since Task 9's commit is
  idempotent (E5).
- **bfcache in headless Chrome (assumption 6).** It works over CDP and `pageshow.persisted` is
  observable. A test server that sends `no-store` still got bfcache in Chrome 154. The gap is the
  non-bfcache path (B3), not the test mechanism.
- **Double instantiation (assumption 7)** is real only when specifiers are mixed. A fully rewritten
  artifact fetches and instantiates each module once (E3, E7).
- **Fonts and first paint.** Three preloaded fonts hold Chrome's first frame for about 100 ms (first
  rAF 108–115 ms vs 17 ms without preloads), not until the fonts arrive, even with 4 s font delays.
  Paint-first is preserved (E4f).
- **Node as the RF-1 oracle (E9), with a caveat.** Node 22 (V8 12.4) and Chrome 154 disagree by 1 ulp on
  3–27 % of `pow`/`exp`/`log`/`atan2`/`sin`/`cos` results, so model numbers are not bit-identical
  across the two engines. Task 5's "bit-identical" holds per engine only. Comparing **rounded cell
  strings**, as RF-1 does, is safe in practice: a flip needs a value within ~1e-10 of a rounding
  boundary. Never compare unrounded numbers across engines. If an exact oracle is ever wanted,
  compute it in the page with `import()` of the served modules via `Runtime.evaluate`.

### Unverified

- Node 24 itself and the ubuntu-latest Chrome build, including whether Chrome starts there without
  `--no-sandbox` (B13): neither is available on this host.
- Real-device behaviour (iOS Safari bfcache and form restoration, Android Chrome zoom on overflow):
  emulation only.
