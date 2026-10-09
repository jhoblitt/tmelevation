# Notes — browser plan review 2026-10-08

Experiment log: command, environment, output, recorded as each finishes.

## Environment

- Node v22.22.2 (local; no Node 24 binary on this host), Google Chrome 154.0.8037.97, Fedora 43.
- Throwaway harness: `/tmp/claude-1000/plan-review-browser/cdp.mjs` (browser-level WebSocket from
  `DevToolsActivePort`, `Target.createTarget` + `attachToTarget {flatten:true}`), `serve.mjs`
  (strips query string, 404 list, optional extra headers/delays).
- Chrome runs need the Bash sandbox disabled; `TMPDIR=/tmp/claude-1000/plan-review-browser/tmp`.

## E1 — CDP basics on Node 22 (`e1.mjs`, `e1/`, output `e1.out`)

Command: `TMPDIR=… node e1.mjs` (unsandboxed). Page carries the plan's CSP verbatim, an inline
`style=` attribute, an inline `<script>`, a module that does `innerHTML` (TT), `console.error`, and a
deliberate uncaught error in a timer.

Result:
- Global `WebSocket` (Node 22.22.2) connects to the browser endpoint with no flags, no
  `--remote-allow-origins` needed. `--remote-debugging-port=0` writes `DevToolsActivePort`
  (`<port>\n/devtools/browser/<id>`) into `--user-data-dir`. `--headless=new` accepted.
- `Emulation.setDeviceMetricsOverride {320,568,mobile,dpr 2}` → innerWidth 320, dpr 2,
  `(max-width:400px)` true.
- `Runtime.exceptionThrown` fired for the uncaught timer error; `Runtime.consoleAPICalled` type
  `error` for console.error; `Network.responseReceived` for document, script, and **`/favicon.ico`
  (404, type `Other`)** — headless Chrome requests the favicon and CDP reports it.
- **CSP violation console text in Chrome 154 does NOT contain "Refused to"**:
  - `source: security, level: error`: "Applying inline style violates the following Content Security Policy directive 'style-src 'self''…"
  - "Executing inline script violates the following Content Security Policy directive 'script-src 'self''…"
  - TT: "This document requires 'TrustedHTML' assignment. The action has been blocked." (plus a thrown TypeError, caught here, so no `exceptionThrown`).
  - Failed resource: `source: network, level: error` "Failed to load resource: … 404".

## E3 — strict CSP feature set (`e3.mjs`, `e3/`, output `e3.out`)

Command: `TMPDIR=… node e3.mjs` (unsandboxed). `e3/index.html` = plan's CSP verbatim (first in head),
`rel=icon favicon.svg?v=`, stylesheet, two font `preload … crossorigin` (real Oswald/Lato woff2 from
Google Fonts, copied from the secperf review's download), `modulepreload` for app/a/b all with
`?v=v1.2.3`, classic `boot.js` defer, module `app.js` (imports `a.js`, which does `export * from
'./b.js?v=…'`), `textContent`, `classList`, `hidden`, `style.setProperty`, two MathML formulas.
390×844 mobile, dpr 3; 4 s wait for preload-unused warnings.

Result (index.html): **zero** Log/console/exception entries; every URL requested exactly once
(`Network.requestWillBeSent` count 1 for each `?v=` module, font, css, favicon) → modulepreload and
font preload are consumed with `?v=` URLs; both fonts `loaded`; MathML `mfrac` height 37 px, display
`block math`; `style.setProperty('color',…)` applied (rgb(38,36,37)); `favicon.svg?v=` 200 type
`Other`, and **no `/favicon.ico` request** once `rel=icon` exists; boot.js ran before app.js and found
`#app-module`.

bad.html (control): CSP violation texts in Chrome 154:
- "Loading the stylesheet 'data:…' violates the following Content Security Policy directive: "style-src 'self'"…"
- "Loading the image 'https://example.invalid/x.png' violates … "img-src 'self'". The action has been blocked."
- "Loading the script '…' violates … "script-src 'self'"…"
All `source: security, level: error`. None contains "Refused to". Without `rel=icon`, `/favicon.ico` 404 is
reported by CDP (`Other`).

## E2 — load-failure design, RF-5 (`e2.mjs`, `e2/`, output `e2.out`)

Command: `TMPDIR=… node e2.mjs` (unsandboxed). Page: plan's CSP, `boot.js` (classic, `defer`) before
`<script type=module id=app-module>`; boot.js listens for `error` on `#app-module`, logs window
`error`, 10 s watchdog; app → model → flight graph; variants via `serve.mjs` `fail404`/`delayMs`.

| Variant | boot.js ran | element `error` | data-state after 1.5 s |
|---|---|---|---|
| control | 14 ms, before app (15 ms) | — | ready |
| 404 `flight.js` with modulepreload | yes | yes, 7 ms | error |
| 404 `flight.js` without modulepreload | yes | yes, 8 ms | error |
| 404 `flight.js`, boot.js response delayed 1500 ms | 1507 ms | yes, 1507 ms (module waits its turn) | error |
| 404 `app.js` itself | yes | yes | error |
| SyntaxError in a dependency | yes | **no** — only window `error` (SyntaxError) | loading (watchdog only) |
| missing named export (link error) | yes | **no** — only window `error` | loading (watchdog only) |
| `Emulation.setScriptExecutionDisabled` before navigate | no | — | `<noscript>` parsed as elements, `#ns` box 18 px tall (rendered); `Runtime.evaluate` still works |

Conclusion: the plan's mechanism works for fetch failures (404) in every ordering tried; parse and link
errors in the graph surface only as a window `error` that boot.js could catch but the plan does not
listen for, so those wait the full 10 s watchdog.

## E2b — hidden-tab throttling vs the 10 s watchdog (`e2b.mjs`, `e2b/`, output `e2b.out`)

Command: `TMPDIR=… node e2b.mjs` (unsandboxed). `app.js` stands in for the load sequence: 23 "rows",
one per `setTimeout(…, 0)` macrotask, 2 ms busy work each, a `requestAnimationFrame` per row, then
`data-state=ready`. `boot.js` = the plan's watchdog (10 s; error unless `ready`). Second tab opened with
`Target.createTarget {background: true, newWindow: false}` (what a middle-click / ⌘-click does).

Output:
```
foreground: {"vis":"visible","state":"ready","readyAt":132,"raf":23}
background @1000ms: {"vis":"hidden",…,"state":"loading","rows":7,"lastRowAt":234,"raf":0}
background @5000ms: {…,"rows":11,"lastRowAt":4234,…}
background @12000ms: {…,"state":"error","rows":18,…,"watchdogFired":true,"watchdogAt":10234}
background @26000ms: {…,"state":"ready","rows":23,"readyAt":16234,"raf":0,"watchdogFired":true}
```
Chained timers in a hidden tab run at 1 per second after the first ~6 (nesting-level throttling): the
23-row load takes 16 s, the watchdog fires at 10 s and shows `#load-error` on a page that then
completes normally; `requestAnimationFrame` never runs while hidden (0 callbacks).

## E5r — does the RF-1 sweep actually race calibration? (`e5r.mjs`, `e5r/`, output `e5r.out`)

Command: `TMPDIR=… node e5r.mjs` (unsandboxed). Stand-in app: 23 rows, one per chained
`setTimeout(…,0)`, 0.1–0.4 ms busy each (secperf measured ~9 ms for all 23 at 1x on this host). Test does
what the plan says: await CDP `Page.domContentEventFired`, then 30 `Runtime.evaluate` calls each setting
the slider value and dispatching `input`, ending at 5,280. In-page log records pending rows per input.

```
row=0.4ms cpu=1x: calibration done at 98.3 ms; first input at 21.4 ms (pending rows 18); inputs while rows pending: 30/30
row=0.4ms cpu=1x: calibration done at 91.5 ms; first input at 12.8 ms (pending rows 21); inputs while rows pending: 30/30
row=0.4ms cpu=1x: calibration done at 90.4 ms; … 30/30
row=0.1ms cpu=1x: calibration done at 82.7 ms; … 30/30
row=0.1ms cpu=1x: calibration done at 84 ms; … 30/30
row=0.4ms cpu=6x: calibration done at 136.3 ms; … 30/30
```
The chained-timer 4 ms clamp (nesting ≥ 5) stretches the load to ~80–100 ms even when the work is ~2–9 ms,
and a CDP round trip is ~0.5 ms, so the sweep lands entirely inside the window on this host. The race IS
exercised — but only because of the clamp, and nothing in the test as written would notice if it stopped
being exercised (it asserts only the final state).

## E4 — RF-4 layout measurability (`e4.mjs`, `e4b.mjs`, `e4find.mjs`, `e4f.mjs`; pages `e4/`, `e4f/`; outputs `e4.out`, `e4-overflowing.out`, `e4b.out`, `e4f.out`)

Prototype (`e4/`, generated by `e4/gen.py`): plan's DOM contract — `header.controls` > `.boxes`
(elev, unit, press, unit, hint, methods link) + `#pinned` (slider, readout, two toggle buttons);
two `section[data-tour]` with `.scroller` (`overflow-x:auto`, role region, tabindex 0) around a
10-column table, first column `position:sticky; left:0`, cells with `.v`, `.d`, `.sr`
(standard visually-hidden: `position:absolute; width:1px; height:1px; clip-path…`). Narrow
(< 768 px): `.controls {display: contents}`, `#pinned {position: sticky; top: 0; max-height: 64px}`.
Real Oswald/Lato woff2. app.js pins scrollers right in rAF, tracks user scroll, re-pins on `resize`.

1. **First run (`e4-overflowing.out`)**: at 320×568 `documentElement.scrollWidth` = 709,
   `innerWidth` = 709 (mobile emulation widened the layout viewport to the content),
   `clientWidth` 320, `visualViewport.width` 320. Cause (`e4find.mjs`): the 69 `.sr` spans are
   absolutely positioned with `offsetParent` BODY, so they escape the non-positioned `.scroller`'s
   clip (rights 555/632/709). Adding `.scroller { position: relative }` → scrollWidth 320, innerWidth
   320. After rotation in the overflowing state, `visualViewport.scale` = 1.775 and the wheel test
   could not scroll the table.
2. **Fixed prototype (`e4.out`)**, dpr 2 and 3 identical:
   - 320×568: docSW 320; scrollers `scrollLeft` 427 = `scrollWidth − clientWidth` exactly; PGA Driver
     carry cell 241.5–319.7.
   - `setDeviceMetricsOverride` 568×320 with `screenOrientation {landscapePrimary, 90}` fires
     `orientationchange`, `screen.orientation` `change` and `resize` (568,320); without
     `screenOrientation` only `resize` (seen at load). Re-pin → 179 = max.
   - `Input.dispatchMouseEvent {type: mouseWheel, deltaX: −150}` over the PGA scroller → PGA
     `scrollLeft` 29 (user scroll), LPGA untouched; rotate back → PGA stays 29, LPGA re-pinned 427.
   - Sticky with `display: contents` parent: after `scrollIntoView` of LPGA, `#pinned` top = 0.
     Desktop 1440×900 (`mobile:false`): whole `.controls` top = 0.
   - Overflow probe: a 400 px element at 320 mobile → docSW 400, **innerWidth 400**, clientWidth 320.
   - `Emulation.setSafeAreaInsetsOverride` exists in Chrome 154 (returns ok).
   - Realistic delta strings (abs `−8/−7`, `−13°`, `+35/+32`; pct `−22.9%`, `−26.4%`, `+12.4%`) do not
     change column widths (`e4b.out`); exaggerated text (`1,888/1,888`) widens the table 747 → 827 and a
     resize-only re-pin leaves the scroller 80 px off the right edge (G2).
   - Fractional geometry (table 747.4 / 747.33 / 801.7 px; dpr 2, 3, 2.625): `scrollLeft` reported as an
     integer equal to `scrollWidth − clientWidth` in every case (`e4b.out`).
3. **Pinned row at 320 (`e4b.out`)**: slider 108 + readout 97 (14 px) + toggle 2×44 + gaps + 12 px
   side padding does not fit: the toggle buttons stack (toggle box 74×88). With the prototype's
   `max-height: 64px`, `getBoundingClientRect().height` = **64** (assertion "≤ 64" passes) while
   `scrollHeight` = 76 and children tops are 298/312/276 (three different lines); without max-height
   the row is 96 px.
4. **Fonts (`e4f.out`)**: with the three font `preload`s and font responses delayed 1.2 s / 4 s, first
   rAF at 108–115 ms and FCP 128–136 ms vs 17 ms / 24 ms without preloads: preloaded fonts hold the
   first frame ~100 ms (bounded), not until the fonts arrive. Fallback font (Linux) made the table wider
   (924 px) than Lato/Oswald (747 px); the swap shrinks the table, so a pinned-right scroller stays right
   by clamping.

## E5 — RF-3 keyboard over CDP (`e5.mjs` on the `e4/` page, output `e5.out`)

Command: `TMPDIR=… node e5.mjs` (unsandboxed). 390×844 mobile dpr 3, with and without
`Emulation.setFocusEmulationEnabled`; listeners injected via `Runtime.evaluate`.

- `document.hasFocus()` true in both; first `Input.dispatchKeyEvent` Tab from BODY focuses `#elev`.
- Tab order: elev → elev-unit → press → press-unit → methods-link → slider → mode-abs → mode-pct →
  scroller → scroller; every stop computed `outline-style: solid 3px`, `:focus-visible` true.
- ArrowRight ×2 on `step=10` range from 0: `input`+`change` each, values 10, 20 (exactly one step).
- Space (keyDown with text ' ' + keyUp) on `#mode-pct` → `click`.
- `Input.insertText('5280')` then Enter in `#elev` → `input "5280"`, `keydown Enter`, **and `change`**
  (Chrome fires `change` on Enter in a text input, so Enter reaches commit twice — harmless if commit
  is idempotent, as Task 9 specifies).
- Snapping: metres slider (step 5) given 1609.344 reads back **1610**; ArrowRight → 1615. Ft slider
  given 5279.999999 → 5280; 14995 + ArrowRight → 15000 (clamped).
- Arithmetic (golden table, Task 6): PGA Driver ΔC = +17.28 yd at 5,000 ft ≈ 0.0035 yd/ft, so one
  10 ft step moves carry ≈ 0.035 yd — the displayed `282/258` does not change; from 0 ft only the delta
  line changes (hidden → `±0/±0`).

## E6 — back/forward in headless Chrome over CDP (`e6.mjs`, `e6c.mjs`, `e6/`, outputs `e6.out`, `e6b.out`, `e6c.out`)

Page: elevation box (`autocomplete=off`), unit `<select>`, range slider, readout; module app renders
controls from an in-memory state at start, logs control values at module start, after render,
DOMContentLoaded, load and every `pageshow`. Test sets slider 5280 + unit m via dispatched events,
navigates to `methods.html` (link click or `Page.navigate`), then
`Page.navigateToHistoryEntry` back.

1. Default (`e6.out`): bfcache **is** used in `--headless=new` with CDP attached — same JS heap,
   `pageshow persisted=true`, controls `5280 / m / 5280 / "5280 ft"`; no `Page.backForwardCacheNotUsed`.
   Same with `Cache-Control: no-store` on every response, and with a CDP-initiated navigation away.
2. bfcache disabled (`--disable-features=BackForwardCache`, `e6b.out`): page reloads; app renders
   `0 / ft / 0 / "0 ft"` at module start, DOMContentLoaded and load; then **between `load` and
   `pageshow` (persisted=false) Chrome's form-state restoration sets the `<select>` back to `m` and
   the range to `5280`**, the text box (autocomplete=off) stays `0`. Final: box `0`, unit `m`,
   slider `5280`, readout `0 ft` — controls disagree with the state and with each other.
3. Same as 2 with `autocomplete="off"` also on the `<select>` and the range (`e6c.out`,
   `E6PAGE=index-ac.html`): nothing restored; final `0 / ft / 0 / "0 ft"` — consistent.

## E7 — artifact `?v=` rewriting (`e7/rewrite.mjs`, `e7.mjs`, `e7/`, output `e7.out`)

1. `node e7/rewrite.mjs e7/src/js/forms.js` — the obvious regex
   `/(\bfrom\s*)(['"])(\.{1,2}\/[^'"]+?\.js)\2/g` on a file with every import form: handles named,
   namespace, `export * from`, `export {…} from`, and multi-line `import {\n…\n} from`; **misses**
   `import './side.js'` (side-effect) and `import('./dyn.js')`; also rewrites look-alikes inside a string
   literal and a comment (harmless here).
2. Chrome (`e7.mjs`, unsandboxed): `app.js` imports `./state.js?v=v1.2.3` and `./other.js?v=…`, which
   imports `./state.js` (unversioned) → `state.js` fetched twice (`/js/state.js?v=v1.2.3` and
   `/js/state.js`), **two module instances** (`instances: 2`, `sameCache: false`).
3. Font preload `fonts/lato.woff2?v=…` with CSS `url(../fonts/lato.woff2)` (CSS not rewritten) → font
   fetched twice and only a **warning** (`javascript/warning`: "…was preloaded using link preload but not
   used within a few seconds…") — not a console error.
4. Aside: `<link rel=icon href="data:,">` is itself a CSP violation under `img-src 'self'` (logged
   `security/error`); the plan's `favicon.svg` file avoids this.

## E8 — safe-area insets under emulation (`e8.mjs` on `e4/`, output `e8.out`)

`Emulation.setSafeAreaInsetsOverride` (Chrome 154) feeds `env(safe-area-inset-*)` with
`viewport-fit=cover`: landscape 844×390 with L/R 47, B 21 → body padding `0 47px 21px`, no page
overflow (docSW 844), pinned row left 59. Portrait with top 47 (standalone-like) → `.boxes`
padding-top 47 px, sticky `#pinned` top 0 (i.e., under the inset unless it pads itself). So safe-area
padding is testable; the plan's e2e does not test it.

## E9 — is Node's model output a bit-exact oracle for Chrome's? (`e9.mjs`, `e9b.mjs`, `e9/`, outputs `e9.out`, `e9b.out`)

Same module (`e9/fp.js`, `fp2.js`) run in Node 22.22.2 (V8 12.4.254.21) and in Chrome 154 (headless)
over identical input sequences (inputs produced by exact IEEE ops). 20,000 inputs per function:
```
pow (^5.255876) differ 2033/20000, max 1 ulp     pow (^0.190263) differ 1402, max 1 ulp
pow (^0.4)      differ 2390, max 1 ulp           exp   differ 1953, max 1 ulp
log             differ 1720, max 1 ulp           atan2 differ 5428, max 1 ulp
sin             differ 619,  max 1 ulp           cos   differ 615,  max 1 ulp
hypot, sqrt     identical
```
So the flight model is not bit-identical between Node and Chrome (it uses pow for C_L and the
atmosphere, exp for spin decay, atan2 for land angle). Rounded display strings will agree except when
an unrounded value sits within ~1e-10 of a rounding boundary — vanishingly rare, but the plan's
"bit-identical" determinism (Task 5) is per engine only.

## E10 — RF-2 event order (`e10.mjs` on `e4/`, output `e10.out`)

`#elev` focused, `Input.insertText('abc')`, then the unit is changed three ways:
- keyboard (Tab, ArrowDown on the select): `elev change`, `elev blur (value "abc")`, then
  `unit change -> m (active: elev-unit)` — the box commits (reverts) before the unit changes.
- pointer press on the select: `elev change`, `elev blur` (focus moves to the select first).
- programmatic (`select.value='m'` + dispatched `change`): `unit change -> m (active: elev)` — the
  only path where a unit change meets a pending edit, and the box still has focus.

## E11 — readout width vs slider width at 320 px (`e11.mjs` on `e4/`, output `e11.out`)

Pinned row without the height cap, 8 px side padding, 6 px gaps, readout 14 px Lato with
`tabular-nums`, slider `flex: 1`:
```
"0 ft · 29.92 inHg"       readout  97 px, slider 116 px
"5,280 ft · 24.64 inHg"   readout 125 px, slider  99 px
"15,000 ft · 16.89 inHg"  readout 133 px, slider  94 px
"15,000 ft · 572.0 mbar"  readout 136 px, slider  93 px
"4,572 m · 57.21 kPa"     readout 120 px, slider 102 px
```
A content-sized readout makes the slider track 23 px shorter as the user drags from 0 to 15,000 ft,
so the thumb drifts under the finger. Budget at 320 px with the widest readout and two 44 px buttons:
320 − 16 − 3×6 − 136 − 88 ≈ 62 px of slider.

