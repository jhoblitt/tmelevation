# Notes log — UX review of 2026-10-08 design spec

Each entry: fact, source (file:line / URL / prototype path), date verified 2026-10-08.

## Palette contrast (scripts/contrast.py under /tmp/claude-1000/review-ux/scripts, WCAG 2.x relative luminance)
- white on #EC6919 = 3.18:1; white on #F3955F = 2.26:1; #262425 on orange 4.85, on stripe 6.81; #3D3B3C on orange 3.49, stripe 4.91. Spec §4.3/§4.4 numbers confirmed.
- WCAG AA large-text threshold is 3:1 (large = ≥18pt/24px regular or ≥14pt/18.66px bold): white-on-stripe 2.26 fails it at ANY size; white-on-orange 3.18 passes only if text is large.
- A base orange scaled ×0.8 (#BD5414) would give white 4.73:1; ×0.95 (#E06418) 3.5:1.

## JS parsing traps (node 22, scripts/jsparse.mjs)
- Number("") = 0, Number(" ") = 0 (empty field would parse as 0 → sea level / 0 Pa); parseFloat("5,280") = 5; "5,280" with ","→"." = 5.28; Number("1e3") = 1000; Number("0x10") = 16; Number("Infinity") = Infinity; parseFloat("29,92") = 29.
- (-0.04).toFixed(1) = "-0.0" (the ±0.0% case needs explicit handling); Math.round(-0.4) = -0.
- (101.325).toFixed(2) = "101.33" (V8), (1013.25).toFixed(1) = "1013.3"; both re-parse above P0 and clamp to sea level → stable.
- Intl en-US formats 5280 as "5,280", de-DE "5.280", fr-FR "5 280" (narrow nbsp).

## Atmosphere / round trip (scripts/atmo.mjs, spec §5.1 formulas)
- P(15,000 ft) = 57,206.8 Pa → valid typed ranges kPa 57.21–101.325, mbar 572.1–1013.25, inHg 16.89–29.92. Every first keystroke of any in-range pressure is out of range (kPa "5".."9" < 57.21; mbar "5".."99" < 572.1; inHg "1","2" < 16.89).
- 29.92 inHg → 1.16 ft (displays "1 ft", not sea level); 101.32 kPa → 1.37 ft; 101.324 kPa → 0.27 ft (displays "0 ft" but state ≠ P0).
- Display step: kPa/mbar 10 Pa = 2.7 ft (sea level) … 4.3 ft (15 kft); inHg 33.86 Pa = 9.2 ft … 14.7 ft.
- If a commit re-parses unchanged displayed text: kPa/mbar re-commit changes the elevation for 10,588/15,001 integer-ft states (max 2 ft); inHg 13,698/15,001 (max 7 ft); m box 10,428/15,001 (max 2 ft). Example: type 5280 ft → inHg shows 24.64 → focus+Enter on inHg → 5277 ft.
## Phone-layout prototype (throwaway, /tmp/claude-1000/review-ux/proto; Chrome 154 headless via CDP, Emulation.setDeviceMetricsOverride mobile:true, DPR 2; real Lato/Oswald TTFs from google/fonts)
Prototype choices kept deliberately compact: inputs/selects 16px font (iOS no-zoom floor), 36px tall; labels shortened to "Elev"/"Pressure" (shorter than the spec's "absolute (station) pressure"); values 18px Lato, deltas 13px semibold; cell padding 6px 10px.
- 375x667: control bar wraps to THREE rows (slider / Elev+ft+Pressure box / unit select+Δ toggle+link), 129 px = 19 % of 667 (more of Safari's real, smaller viewport). With 44 px controls: 157 px = 24 %. The pressure unit <select> is 103 px wide because its widest option is "mbar (hPa)". Spec §4.1 says "two rows". Screenshot shots/base_375_load.png, shots/base_375_44px.png.
- 320x568: same three rows, 129 px = 23 %.
- 667x375 landscape: bar 87 px (one row of inputs + slider row) = 23 % of 375; ~4.8 rows visible with header. shots/base_667x375_land.png.
- Table natural width 883 px (cols 82,86,95,82,99,98,76,90,84,92). At 375 (scrollLeft 0) the fully visible columns are Club(pinned) + Club Speed | Attack Angle | Ball Speed; at 320 only Club Speed | Attack Angle; at 667 landscape up to Spin Rate. Max Height / Land Angle / Carry — the only columns that change — are off-screen at load on every phone size tested. Scrolled to the end (scrollLeft = scrollWidth) at 375 the visible columns are exactly Max Height | Land Angle | Carry (shots/alt_375_scrolled_end.png).
- Title "PGA TOUR AVERAGES YARDS/METERS 2023" at 26 px Oswald 700 nowrap is 454 px wide → cannot stay on one line at 375; with nowrap it overflowed and pushed Chrome's mobile viewport (innerHeight became 733 instead of 667 — page zoomed out). With wrapping it takes 94 px (2 lines).
- Sea level, delta line hidden with visibility:hidden (space reserved), default vertical-align: middle: values in Max Height/Land/Carry sit 8.0 px higher than values in the other columns of the same row (row 50 px). shots/sea_375_scrolled_end.png.
- Pinned Club column (position: sticky; left: 0) with `background: inherit` from the striped <tr>: on even (non-striped) rows the tr background is transparent, so the pinned cell is transparent and scrolled values show through ("3-wood3663", "Hybrid4587"); with no background at all every row bleeds. With border-collapse: collapse the scrolled column rule is drawn through the pinned cell. shots/sea_375_scrolled_end.png, shots/collapse_375_sx150.png, shots/nobg_375_sx150.png.
- thead th { position: sticky; top: 129px } inside the overflow-x:auto wrapper does NOT stick under the page's sticky bar: after window.scrollTo(0,520) the PGA thead top is at −168 px (scrolled away), and the LPGA header is rendered 129 px down INSIDE its own wrapper, overlapping data rows. shots/stickyhead_375_sy520.png. Cause: overflow-x:auto makes overflow-y compute to auto (CSS Overflow 3), so the wrapper is the sticky element's scroll container.
- At 375x667 with the header at the top of the viewport, (667−129−49)/50 = 9.8 data rows fit; the PGA table (title 94 + header 49 + 12×50) is 743 px tall, taller than the whole screen.
## Browser behaviour checks (Chrome 154 headless via CDP; pages under /tmp/claude-1000/review-ux/proto2)
- <input type=range min=0 max=15000 step=1>: ArrowRight → 1; PageUp → 1501 (Chrome big step = (max−min)/10 when larger than step). step=50: ArrowRight → 50; programmatic value "5280" reads back "5300" (value sanitised to the step grid).
- Native range box is 129×16 CSS px in both desktop and mobile emulation (track/thumb height 16 px < WCAG 2.5.8's 24 px minimum target).
- <input type=number step=any>: Input.insertText "5,2" → value "52" (comma silently dropped, 10× error for a comma-decimal user); "84." → value "84" (raw text not observable); "5280" → "5280". <input type=text inputmode=decimal> keeps "5,2" verbatim.
- Back navigation from a linked page (served over http://127.0.0.1, bfcache not used in headless: pageshow.persisted=false): the page re-runs from scratch (JS state back to 101325) but Chrome restores the typed text "5280" into the box and "m" into the <select> — even overriding values a module script set during initial execution; the restored value is already visible at `pageshow`. With autocomplete="off" on the controls, no restoration (box "0", select "ft"). Jobs: proto2/jobs6.json, jobs7.json.
- NWS glossary: altimeter setting = "A correction of the station pressure to sea level used by aviation" (https://forecast.weather.gov/glossary.php?word=altimeter%20setting, fetched 2026-10-08).
## Per-frame cost (stand-in for spec §5.2, allocation-free RK4 dt 0.01, scripts/flightperf2.mjs; in-page proto2/perf.html)
- Not a physics check: rough C_D/C_L shapes with k=1, ~650 RK4 steps per flight.
- Node 22 on Ryzen 9 7950X3D: 23 flights 4.9 ms; calibration stand-in 15 flights × 23 rows 74 ms. (Array-allocating version: 10.4 ms / 159 ms.)
- Chrome 154 page, no throttle: 23 flights 2.15 ms; calibration stand-in 32 ms. With CDP Emulation.setCPUThrottlingRate 4 (the CPU slowdown Lighthouse applies for mobile): 8.7 ms per frame; calibration 131 ms for 15 flights/row (≈ 88 ms at the spec's ~10 flights/row).

## Headless Chrome window size (proto3/)
- `google-chrome --headless --window-size=375,667` → innerWidth 500, innerHeight 524, (max-width: 400px) false; 320,568 → 500 × 425; 800,600 → 800 × 457. Headless clamps the window width to ≥ 500 px and the height excludes window UI, so phone-width screenshots taken this way are not phone layouts.
- An iframe harness (`<iframe style="width:375px;height:667px">` around the page) gives innerWidth 375, innerHeight 667, phone media query true, at window 800×700.
## Sign-coloured delta alternatives (contrast)
- Red/green on the palette: #008000 1.61 (orange) / 2.27 (stripe); #006400 2.34 / 3.29; #8B0000 3.15 / 4.42; only near-black greens/reds pass (#0B3D0B 3.91/5.50, #4A0000 5.11/7.18), and those read as charcoal anyway. Supports §4.3's single charcoal.
## Safe area
- WebKit, "Designing Websites for iPhone X": with the default viewport-fit, "Content is automatically inset within the display's safe area" and "The inset area is filled with the page's background-color" (https://webkit.org/blog/7929/designing-websites-for-iphone-x/).
- Weather-report-like pressures through spec §5.1 inverse: 29.90 inHg → 20 ft, 29.80 → 112 ft, 29.60 → 298 ft, 29.50 → 392 ft.
