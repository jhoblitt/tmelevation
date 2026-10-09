# UX / mobile / accessibility / requirements review — 2026-10-08 design spec

Target: `docs/superpowers/specs/2026-10-08-tmelevation-design.md` (draft of 2026-10-08).
Reviewer mandate: user experience, phone and desktop behaviour, accessibility,
requirements coverage. Notes log: `ux.md.notes.md` (same directory).

## Summary

The spec covers every one of the user's stated requirements on paper (21 traced:
17 covered, 4 partial, 0 missing). The weak spots are where a requirement meets a
phone or a keyboard. The mechanisms the spec picks are right, but several defaults it
leaves open are wrong in ways a user hits in the first minute.

Most consequential:

- **On a phone nothing visible changes when the slider moves (U1).** The only
  recomputed columns are the last three, and they start off-screen at every phone size
  tested. Fix: start the scroller right-anchored.
- **Linked inputs.** "`,` is a decimal" makes `5,280` ft mean 5.28 ft (U2); typing any
  pressure passes through out-of-range prefixes with no rule for the live state (U3);
  the weather-report pressure a US golfer actually has is silently clamped to sea level
  (U5).
- **The phone control bar** needs three rows, not two, and takes 19–24 % of an iPhone SE
  screen (U4).
- **Contrast.** The spec's "large size softens it" mitigation cannot work for the
  stripe rows (2.26:1 is below 3:1 at any size), and no high-contrast variant is
  offered (U16).
- **Phone verification.** The §8.2 headless-screenshot method renders 500 px wide when
  asked for 375, so it would catch none of the above (U25).

Counts: 6 major (U1–U5, U16), 13 minor, 6 nits; 4 unverified concerns; 11 non-findings.

## Requirements traceability

| # | Requirement (user's words, condensed) | Spec § | Status | Note |
|---|---|---|---|---|
| R1 | JavaScript app hosted on GitHub Pages | §7, §9.3 | covered | Plain ES modules, `site/` deployed by tag. |
| R2 | Reproduce the PGA and LPGA tables from the TrackMan blog post | §3, §1.1, §8.1 present | covered | Transcribed (the source tables are images); sea-level exactness is a success criterion and a test. |
| R3 | Same colour scheme | §4.4 | covered | Palette sampled; the delta colour is a deliberate addition. Fidelity gaps on phones: U7, U20. |
| R4 | Slider to change the elevation, range starting at 0 | §4.1, §4.2 | partial | Range given; step, unit behaviour under ft/m, keyboard step, value text unspecified (U13). |
| R5 | Input boxes, all linked, updating together | §4.2 | partial | Pressure-as-truth design is sound; defects in parsing and live update: U2, U3, U9, U10. |
| R6 | Elevation box in ft with a dropdown ft / m | §4.1, §4.2 | covered | Default unit ft implied, not stated (U21). |
| R7 | Pressure box with a unit dropdown: at least kPa and millibar, plus the common US unit | §4.1, §5.1 | covered | kPa, mbar (hPa), inHg. Usability trap with weather-report pressures: U5. |
| R8 | Changing elevation/pressure updates all relevant columns (carry, max height, land angle, etc.) | §4.3, §5.4 | covered | Only the three flight-outcome columns change; the other six are launch conditions, explained on the methods page (§5.5.3). |
| R9 | Small clickable link to a page documenting the equations and their primary sources | §4.1, §6 | covered | Link target size / contrast unspecified (U15). Methods-page phone layout unspecified (U19). |
| R10 | Clickable link and attribution to the TrackMan blog at the bottom | §4.1 item 3 | covered | Wording does not separate TrackMan's data from this site's modelled values (U14). |
| R11 | Above sea level, every updated cell shows a centred `+/- delta` below the primary value | §4.3 | covered | Baseline misalignment from the reserved line (U6); hide condition vs displayed elevation (U11). |
| R12 | Example: PGA 8 Iron at 172 yd carry shows +8 | §4.3, §8.1 present | covered | Test pins 171.6 yd → `172` over `+8`. |
| R13 | Delta colour other than white | §4.3 | covered | Charcoal `#262425`. If "colour coded" was meant as sign-dependent colour, confirm with the user (non-finding N4). |
| R14 | Works well on desktop browsers | §4.4 | covered | Full ten-column table. |
| R15 | Well optimised for phones | §4.1, §4.4 | partial | Changing columns off-screen at load (U1); control bar does not fit two rows and eats 19–24 % of the screen (U4); pinned-column and header pitfalls (U7, U8). |
| R16 | Repository `jhoblitt/tmelevation`, public | header, §10 | covered | |
| R17 | Phones: sideways scroll, Club column pinned, all ten columns in original order | §4.4 | partial | Stated, but the mechanism's pitfalls are unaddressed (U1, U7, U8). |
| R18 | Toggle to show the delta in % | §4.1, §4.3 | covered | Label and land-angle semantics: U12. |
| R19 | CI checks the model on every PR | §9.1, §8 | covered | (Not merge-blocking — outside this review's mandate.) |
| R20 | Semantic versioning on merges to main | §9.2 | covered | |
| R21 | Every tag on main deploys | §9.3 | covered | |

## Findings

Evidence paths below are throwaway prototype artefacts under `/tmp/claude-1000/review-ux/`
(prototype: `proto/base.html` etc., built from the spec's §4 with the real Lato and
Oswald fonts; screenshots: `proto/shots/`; scripts: `scripts/`). Phone sizes were
emulated in headless Chrome 154 via the DevTools protocol (`mobile: true`, DPR 2).

### U1 — major — §4.4, §4.1: on a phone the only columns that change are off-screen, so moving the slider changes nothing the user can see

**Problem.** The three recomputed columns (Max Height, Land Angle, Carry) are the
last three of ten. With the table scrolling horizontally and starting at
`scrollLeft = 0`, a phone shows Club (pinned) plus the first two or three launch-condition
columns — values that never change. A first-time user drags the slider, watches the
numbers on screen stay put, and concludes the app is broken. The delta lines (the
headline requirement) are also off-screen.

**Evidence.** Prototype table natural width 883 px. Fully visible columns at load:
375×667 → Club Speed | Attack Angle | Ball Speed; 320×568 → Club Speed | Attack Angle;
667×375 landscape → Club Speed … Spin Rate. Screenshot `proto/shots/base_375_load.png`.
Scrolled to the end the same 375 px viewport shows exactly Max Height | Land Angle |
Carry with their deltas (`proto/shots/alt_375_scrolled_end.png`).

**Fix.** Keep the original column order (the user's decision) but start each
overflowing table scrolled to its right edge (`scroller.scrollLeft = scroller.scrollWidth`
after first layout, and again when the table first starts to overflow on resize /
rotation), so a phone opens on Club | Max Height | Land Angle | Carry. Add a
horizontal-scroll affordance (an edge shadow on the pinned column when content is
scrolled under it, and a fade on the side that has more content) because mobile
browsers hide scrollbars until the user scrolls. Add a smoke-test screenshot at 375 px
that asserts the Carry header cell's bounding box is inside the viewport.

### U2 — major — §4.2: "`,` is a decimal separator" turns the most iconic golf elevation, "5,280", into 5.28 ft

**Problem.** §4.2 accepts both `.` and `,` as the decimal separator. A US user
typing Denver's mile-high elevation the way it is normally written, `5,280`, gets
5.28 ft — live, so the tables snap to sea level while they type, and on blur the box
normalises to `5`. The spec itself writes thousands with commas (`0 – 15,000 ft`,
`5,280 ft`, `7,800 ft` in §4.2 and §8.3), as will every golf article a user copies a
number from. The rule exists for comma-decimal locales, where the inverse ambiguity
holds (`5.280` means 5280 in de-DE). The conflict is real, not theoretical.

**Evidence.** Node 22: `Number("5,280".replace(",", "."))` = 5.28; `parseFloat("5,280")`
= 5; `new Intl.NumberFormat('en-US').format(5280)` = `5,280`, `de-DE` = `5.280`,
`fr-FR` = `5 280` (narrow no-break space) — `scripts/jsparse.mjs`, notes log.

**Fix.** Specify the grammar per field, not one global rule:
(a) ft and m are integers, so treat a `,`, `.`, space or U+202F followed by exactly three
digits as a group separator (`5,280`, `5.280`, `5 280` → 5280) and reject other
separators in the elevation box (a decimal elevation adds nothing at 1 ft precision);
(b) in the pressure box, take the decimal separator from the user's locale
(`Intl.NumberFormat(navigator.language).formatToParts(1.1)`), strip that locale's
group separator, and also accept the other of `.`/`,` as a decimal only when it is not
followed by exactly three digits. Never put a group separator in a box's normalised
display text (otherwise the field cannot re-parse its own output). Add tests:
`5,280` ft → 5280, `5.280` ft → 5280, `1.013,2` mbar and `1,013.2` mbar → 1013.2,
`29,92` inHg → 29.92.

### U3 — major — §4.2: live typing of a pressure always passes through out-of-range values, and the spec does not say what the state does meanwhile

**Problem.** §4.2 says typing updates everything live, but clamping happens only on
commit. Every realistic pressure is reached through prefixes far below the 15,000 ft
floor: typing `83.43` kPa goes 8 → 83 → 83.4 → 83.43, typing `834` mbar goes 8 → 83 → 834,
typing `24.64` inHg goes 2 → 24 → …. The spec leaves two readings, both bad: (a) the
live state follows the raw value — the model runs at a density ratio of 0.08
(8 kPa is stratospheric, above 50,000 ft), the slider pins to its end, and the tables flash absurd numbers
on every keystroke; or (b) live clamping — the slider and tables jump to 15,000 ft
and back on the first keystroke of every pressure entry. Elevation typing does not
have this problem (every prefix of an in-range elevation is in range), so it is
pressure-specific — and pressure is the box the user explicitly asked for.

**Evidence.** Valid typed ranges from the spec's §5.1 formulas
(`scripts/atmo.mjs`): kPa 57.21–101.325, mbar 572.1–1013.25, inHg 16.89–29.92.
Every first keystroke `5`–`9` kPa, every first and second keystroke in mbar, and the
first keystroke in inHg are below the floor.

**Fix.** Add to §4.2: "While a box has focus, a parsed value updates the state only
if it lies inside the range; an out-of-range or incomplete value leaves the state
unchanged and shows a non-error 'out of range' hint (not the invalid style). Commit
(blur / Enter) clamps an out-of-range value into the range and updates the state."
Add the controls test: typing `8`, `83`, `83.4` in kPa leaves the state unchanged until
`83.4`.

### U4 — major — §4.1: the phone control bar does not fit in "two rows", and as specified it takes a fifth of an iPhone SE screen before any table appears

**Problem.** §4.1 puts slider, elevation box + unit, pressure box + unit, the Δ
toggle and the methods link in a sticky bar that "compresses to two rows" on phones.
With inputs at the 16 px font iOS needs to avoid focus-zoom (U17) and the pressure
dropdown sized by its widest option, `mbar (hPa)`, it needs three rows even with
labels cut to "Elev" / "Pressure" — the spec's required "absolute (station)
pressure" wording is longer still. The spec gives no height budget, no breakpoint,
and no behaviour for landscape or for the on-screen keyboard (which covers a large
part of the viewport while a box is focused; not measured here).

**Evidence.** Prototype at 375×667: three rows, 129 px (19 % of 667 CSS px — a
larger share of Safari's real viewport, which also loses its own toolbars); with
44 px controls (Apple's touch-target guidance) 157 px (24 %); 320×568: 129 px (23 %);
667×375 landscape: 87 px (23 %), leaving room for about 4.8 table rows below the
column header. Pressure `<select>` alone is 103 px wide. Screenshots
`proto/shots/base_375_load.png`, `proto/shots/base_375_44px.png`,
`proto/shots/base_667x375_land.png`.

**Fix.** Specify the phone bar explicitly: only one row is sticky — slider plus the
elevation box and its unit (≈ 52 px) — and the pressure box, its unit, the Δ toggle
and the methods link sit in a second, non-sticky row that scrolls away with the page.
Label the pressure unit options compactly (`kPa`, `hPa`, `inHg`, with "mbar" in
the option's accessible name or a `<label>`), and move "absolute (station)" into the
helper text of U5. In landscape or short viewports (`@media (max-height: 500px)`)
make the bar non-sticky altogether. State a budget: sticky bar ≤ 60 px on a 375 px
wide phone.

### U5 — major — §4.1, §6: the pressure a US user actually has (the weather-report value) is silently clamped to sea level; the only explanation is on another page

**Problem.** The pressure every weather app and airport report shows a US golfer is
the altimeter setting / sea-level-reduced pressure, close to 29.92 inHg everywhere,
including Denver. Typed into this box it is either above the sea-level standard
(clamped to sea level without comment, per §4.2) or somewhat below it (a
plausible-looking 0–400 ft: 29.80 → 112 ft, 29.50 → 392 ft). The UI reaction to the most likely input is "no
effect", with no feedback. §4.1 relies on the word "station" in a label and §6.2
explains the trap only on the methods page, which a user who believes the page
works will never open. A legitimate station pressure above standard (a 1020 hPa
day at a sea-level course) is clamped silently too.

**Evidence.** §4.2: "a pressure above sea-level standard clamps to sea level";
§2 puts an altimeter converter out of scope. From §5.1: 29.92 inHg → 1.16 ft, 29.80 → 112 ft,
29.50 → 392 ft (`scripts/atmo.mjs` and the same formula inline). NWS defines the altimeter setting as pressure reduced to
sea level, distinct from station pressure (NWS glossary,
https://forecast.weather.gov/glossary.php?word=altimeter%20setting).

**Fix.** Keep the converter out of scope but add two cheap UI elements to §4.1 /
§4.2: (1) one line of helper text under the pressure box (or an expandable ⓘ on
phones): "Absolute pressure at the course — not the weather-report value, which is
corrected to sea level (≈ 29.9 inHg everywhere)", linking to the methods section;
(2) when a commit clamps a value above standard, show a visible, `aria-live="polite"`
message: "Above sea-level standard — treated as sea level. A weather-report pressure
is corrected to sea level; see Method." Add the message to the controls tests.

### U6 — minor — §4.3: the reserved-but-hidden delta line knocks the three recomputed columns off the row's baseline

**Problem.** At sea level the delta line is hidden but keeps its space (§4.3) so
rows do not jump. With the default `vertical-align: middle`, the recomputed cells
(two lines, the second invisible) centre a taller box, so their visible value sits
higher than the single-line values in the other seven columns. Every row of both
tables shows a step at the Spin Rate | Max Height boundary — at sea level, the state
the page loads in and the one that must look like TrackMan's image.

**Evidence.** Prototype at 375×667, sea level, delta `visibility: hidden`: Driver-row
value tops are 285.8 px (Spin Rate) vs 277.8 px (Carry), an 8.0 px step in a 50 px
row. Screenshot `proto/shots/sea_375_scrolled_end.png`.

**Fix.** Specify in §4.3 / §4.4 that every body cell has the same two-line structure
(the six fixed columns get an empty, `aria-hidden` delta line too) or that body cells
use `vertical-align: top` with identical padding, so all primary values share one
baseline in both states. Add it to the development screenshot checklist (§8.2).

### U7 — minor — §4.4: the pinned Club column as described will show scrolled values through it and lose its column rule

**Problem.** §4.4 pins the Club column and paints the stripe on odd rows "spanning
the full table width". The obvious implementation (stripe on `<tr>`,
`position: sticky; left: 0` on the row header) leaves the pinned cell transparent on
the unstriped rows and on the header row, because their orange comes from the page
background, not from the cell: scrolled values slide visibly underneath the club
names. With `border-collapse: collapse` the scrolled column rules are also drawn
through the pinned cell, and with `separate` the pinned cell has no rule on its right
edge at all (TrackMan has one there).

**Evidence.** Prototype, 375 px, `scrollLeft = 150`: `proto/shots/sea_375_scrolled_end.png`
(`background: inherit` — even rows read "3-wood3663", "Hybrid4587"),
`proto/shots/nobg_375_sx150.png` (no background — every row bleeds),
`proto/shots/collapse_375_sx150.png` (`border-collapse: collapse` — rule crosses the
pinned cells).

**Fix.** State the constraint in §4.4: the pinned cells (row headers and the empty
top-left header cell) carry their own opaque background in both row colours
(`#F3955F` odd, `#EC6919` even and header), a `z-index` above the scrolled cells, and
draw the `#BA571C` rule on their right edge themselves (`border-right` with
`border-collapse: separate; border-spacing: 0`, or an inset `box-shadow`). Add a
scrolled-state screenshot at 375 px to the development checks.

### U8 — minor — §4.4: column headers scroll away on phones, and the natural fix (`position: sticky` on `<thead>`) breaks inside the horizontal scroller

**Problem.** On a 375 px phone each table is taller than the screen, so when the
user reads the iron rows (where the altitude effect is largest) the column header is
gone — while the horizontally scrolled view has also hidden which column is which.
§4.4 says nothing about headers. An implementer who adds `thead th { position:
sticky; top: <bar height> }` gets something worse than nothing: the wrapper with
`overflow-x: auto` is the sticky element's scroll container, so the header does not
stick under the page bar and instead renders offset *inside* the table, on top of
data rows.

**Evidence.** PGA table at 375 px: title 94 + header 49 + 12 rows × 50 = 743 px vs a
667 px screen with a 129 px sticky bar. Prototype after `scrollTo(0, 520)`: PGA thead
top at −168 px (gone); the LPGA header drawn 129 px down inside its own table over
the 3-wood and 5-wood rows — `proto/shots/stickyhead_375_sy520.png`. CSS Overflow 3
§3.1: "The visible/clip values of overflow compute to auto/hidden (respectively) if
one of overflow-x or overflow-y is neither visible nor clip"
(https://www.w3.org/TR/css-overflow-3/#overflow-control), so an `overflow-x: auto`
wrapper is also a vertical scroll container.

**Fix.** Decide it in the spec. Either (a) accept scrolled-away headers on phones
and say so, mitigated by U1 (the right-anchored view puts the three changing
columns, distinguishable by their `°` and `/` formats, beside the club names); or
(b) make each table wrapper scroll in both axes with
`max-height: calc(100dvh − <sticky bar height>)` so `thead` can stick to the wrapper
(top-left corner cell gets the highest `z-index`). Either way, forbid sticky `thead`
in a horizontally-only scrolling wrapper.

### U9 — minor — §4.2: "linked updates cannot drift through rounding" holds only if committing an unedited box is a no-op, which the spec does not say

**Problem.** Pressure-as-truth prevents drift between views, but §4.2 also says a
box is "normalised on blur" and that values are committed on blur / Enter. If commit
re-parses the box's displayed (rounded) text, merely tapping into a box and out
again — or pressing Enter in it — replaces the state with the rounded value. A user
who typed 5280 ft, then tapped the inHg box (24.64) and tapped away, sees the
elevation box change to 5277 ft. It also makes the hidden-delta state unstable at sea
level for inHg (U11).

**Evidence.** From the §5.1 formulas (`scripts/atmo.mjs`): re-committing unchanged
display text moves the integer elevation for 13,698 of 15,001 integer-ft states in
inHg (max 7 ft), 10,588 in kPa and mbar (max 2 ft), and 10,428 in the m box (max 2 ft).
5280 ft → `24.64` inHg → re-commit → 5277 ft; → `83.43` kPa → re-commit → 5281 ft.

**Fix.** Add to §4.2: "A box commits only if its text has changed since the state was
last rendered into it; blur or Enter on an unedited box only re-renders." Add the
controls test: render 5280 ft, commit each other view unedited, assert the state is
bit-identical.

### U10 — minor — §4.2: "unparseable" is undefined, and JavaScript's parsers make the empty box mean zero

**Problem.** §4.2 promises that unparseable input leaves the state unchanged, but
does not define the accepted grammar. The common parsers disagree with that promise
in exactly the states a user passes through while editing: `Number("")` and
`Number(" ")` are 0, so clearing the box to retype sends the state to 0 ft (or, in
the pressure box, 0 Pa → the 15,000 ft clamp); `parseFloat("5,")` is 5;
`Number("1e3")` is 1000; `Number("0x10")` is 16; `Number("Infinity")` is Infinity.
Separately, marking `""`, `"."`, `","` or `"-"` with the invalid style while the user
is mid-edit flashes an error on every clear-and-retype.

**Evidence.** Node 22 (`scripts/jsparse.mjs`, notes log).

**Fix.** Specify the grammar in §4.2 (with U2's separator rules), e.g. digits with
at most one decimal separator, optional surrounding whitespace, nothing else; treat
empty or a lone separator as *incomplete* (no state change, no invalid style) and
anything else that fails the grammar as *invalid*. Extend the §8.1 controls tests
with `""`, `" "`, `"."`, `"84."`, `"5,"`, `"1e3"`, `"0x10"`, `"-"`, `"Infinity"`.

### U11 — minor — §4.3: "hidden at exactly sea level" does not match what the boxes display; typing 29.92 inHg shows a full table of ±0

**Problem.** The delta line hides only when the state is exactly sea level. With
pressure as the truth, the standard US value `29.92` inHg is 101,320.8 Pa, 1.16 ft
above sea level: the elevation box reads `1 ft` and every one of the 69 recomputed
cells grows a `±0/±0` (or `±0°`) line. Typing `101.324` kPa gives 0.27 ft: the box
reads `0 ft` — sea level, as far as the user can tell — yet the deltas are shown,
contradicting the requirement's "when the elevation is > sea level".

**Evidence.** `scripts/atmo.mjs`: 29.92 inHg → 1.16 ft; 101.32 kPa → 1.37 ft;
101.324 kPa → 0.27 ft.

**Fix.** Define the hide condition on what the user sees: hide the delta line when
the displayed elevation (in the current unit) rounds to 0. Optionally treat a typed
pressure within half a display step of 101.325 kPa (e.g. 29.92 inHg, 1013.2–1013.3 hPa,
101.32–101.33 kPa) as sea level on commit. Add both cases to the present / controls
tests.

### U12 — nit — §4.1, §4.3: the `Δ | Δ %` toggle is cryptic, and "percent of land angle" is not a quantity golfers use

**Problem.** "Δ" is a mathematician's symbol; the target audience reads golf
tables. Screen readers announce it as "delta" or "Greek capital letter delta". In
percent mode the land-angle cell shows e.g. `−7.8%` for a 4° change — a percent of
an angle whose value depends on measuring from horizontal; a golfer reasons about
descent angle in degrees.

**Evidence.** Spec text §4.1 ("a delta-mode toggle `Δ | Δ %`") and §4.3 ("one number
per cell … for the distance columns" — land angle included). The requirement only
asks for "a toggle to show the delta in %".

**Fix.** Make it a two-option radio group with visible text such as
`Change: yd/m · %` (accessible name "Show change as"), and in percent mode keep land
angle as a signed degree change (or label the column's percent explicitly). Confirm
the land-angle choice with the user.

### U13 — minor — §4.1, §4.2: the slider — the control the user asked for first — is specified only by its range

**Problem.** The spec never states the slider's step, whether it follows the ft / m
dropdown, what it announces to assistive technology, whether it shows its value, or
its touch size. Each default is wrong for this page: (a) a 1 ft step means each arrow
key press changes no table value (only the elevation box moves by 1) and only
`PageUp`/`PageDown` (1,500 ft) or Home/End make progress; (b) a fixed ft step shown in
metres gives uneven 15.24 m increments in the elevation box; (c) a bare
`<input type=range>` exposes only the number (5280) to assistive technology, with no unit; (d) the native control is 16 px
tall — under WCAG 2.5.8's 24 px unless the spacing exception holds, and far under the
44 pt Apple recommends for touch.

**Evidence.** Chrome 154, `min=0 max=15000 step=1`: ArrowRight → 1, PageUp → 1501;
`step=50`: ArrowRight → 50, and a programmatic value of 5280 reads back 5300 (the
browser snaps a typed value onto the step grid when written to the slider). Native
range box 129×16 CSS px in desktop and mobile emulation (`proto2/jobs.json`, notes
log). WCAG 2.2 SC 2.5.8: "at least 24 by 24 CSS pixels", with spacing and inline
exceptions (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

**Fix.** Add to §4.2: the slider's scale follows the elevation unit (0–15,000 ft step
50; 0–4,572 m step 10 or 25), so a typed off-grid elevation positions the thumb at the
nearest step while the state stays exact (the slider is written, never read back,
except on its own `input` events); `aria-valuetext` carries the unit and pressure
("5,280 feet, 83.4 kilopascals"); a thumb and track hit area at least 44 px tall on
touch (`@media (pointer: coarse)`); a visible min / max label pair. Add the
`aria-valuetext` string to the controls tests.

### U14 — minor — §4.1, §4.4: at altitude the page shows TrackMan-branded tables of numbers TrackMan never published, with no elevation in the table itself

**Problem.** The tables keep TrackMan's exact header ("PGA TOUR AVERAGES
YARDS/METERS 2023") while their values are this site's model output. The footer
reads "Data: TrackMan 2023 Tour Averages", which is true only at sea level. A phone
screenshot of the table — the most likely way it gets shared — usually excludes the
sticky bar, so the elevation that produced the numbers is lost and the image reads
as an official TrackMan table. This is a requirements point (the user asked for
attribution) and an honesty-of-presentation point.

**Evidence.** §4.1 item 2 (header text unchanged at any elevation) and item 3
(footer wording); §4.3 (values replaced in place).

**Fix.** At non-zero elevation, add the condition to each table's header line —
e.g. "PGA TOUR AVERAGES YARDS/METERS · at 5,280 ft (83.4 kPa), modelled" — and word the
footer "Sea-level data: TrackMan 2023 Tour Averages (link). Altitude values are this
site's model, not TrackMan's. Not affiliated with TrackMan."

### U15 — minor — §4.1: a "small" white link on orange fails text contrast, and its hit area is unspecified

**Problem.** The `Method & sources` link is "small" (as the user asked) and, by the
palette, white on `#EC6919`: 3.18:1, which fails WCAG 1.4.3's 4.5:1 for normal-size
text. Small text also tempts a small hit area in a dense bar. The footer links have the
same problem.

**Evidence.** Contrast computed (`scripts/contrast.py`): white on `#EC6919` 3.18:1;
`#262425` on `#EC6919` 4.85:1. WCAG 2.2 SC 2.5.8 requires a 24×24 CSS px target for
a control that is not inline in a sentence.

**Fix.** Render the link (and footer links) in `#262425` with an underline, or in
white at ≥ 18.66 px bold; pad its hit area to ≥ 24×24 px (44 px on coarse pointers)
without enlarging the text. "Small" then stays visually true.

### U16 — major — §4.4: the stated mitigation for the inherited low contrast does not work for half the rows, and no opt-out is offered

**Problem.** §4.4 accepts TrackMan's white-on-stripe (2.26:1) and white-on-orange
(3.18:1) for fidelity, "rendered at a large size to soften this". WCAG's large-text
threshold relaxes the requirement to 3:1, which the stripe misses at any size: six
of twelve PGA rows (Driver, 5-wood, 3 Iron, 5 Iron, 7 Iron, 9 Iron) and six of
eleven LPGA rows are below even the large-text minimum. The orange rows reach
AA-large only if values are ≥ 24 px regular or ≥ 18.66 px bold, a size the spec does
not state. The unit sub-labels ("(mph)", "(yards/meters)") and the footer are small
white text on orange and fail outright. Fidelity is the user's call, but the spec
presents a mitigation that, for the stripe, does not exist, and gives low-vision
users no way to get readable numbers.

**Evidence.** `scripts/contrast.py`: white/`#F3955F` 2.26:1, white/`#EC6919` 3.18:1;
WCAG 2.2 SC 1.4.3 large scale = "at least 18 point or 14 point bold" (24 px / 18.66 px),
requiring 3:1 (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Any stripe lighter than the base orange cannot reach 3:1 with white, because the
base itself is only 3.18:1. 24 px values are feasible width-wise: the prototype
table grows from 883 to 928 px wide, 57 px rows (`proto/shots/large24_375.png`).

**Fix.** Keep the TrackMan palette as the default, and (1) state the value size
that makes the orange rows AA-large (≥ 24 px, or ≥ 18.66 px bold); (2) add a
`@media (prefers-contrast: more)` (and `forced-colors: active`) variant that keeps the
layout but darkens both row colours enough for white to pass: e.g. base `#BD5414`
(white 4.73:1) with a stripe of `#C95915` (4.27:1, AA-large) or swap the stripe to a
darker band; (3) delete "to soften this" and record the stripe rows as a known WCAG
failure on the methods page. Optional: a visible "High contrast" toggle, since few
users know the OS setting exists.

### U17 — minor — §4.2, §4.4: the input element type, keyboard and font size are unspecified, and the obvious choices break the spec's own parsing rules

**Problem.** Nothing fixes the boxes' markup. `<input type="number">` — the natural
choice for a number — cannot implement §4.2: in Chrome it silently turns `5,2` into
`52` (a 10× error for exactly the comma-decimal user the `,` rule exists for), and
it exposes `84.` as `84`, so the code cannot see the raw text to judge
"unparseable". iOS Safari also zooms the page when a focused input's font is under
16 px, and does not zoom back on blur — a likely outcome in a compact phone bar.

**Evidence.** Chrome 154 via CDP `Input.insertText`: `type=number` "5,2" → value
`"52"`, "84." → `"84"`; `type=text inputmode=decimal` keeps `"5,2"` (`proto2/jobs2.json`,
notes log). iOS focus-zoom below 16 px: widely documented by practitioners, e.g.
https://weblog.west-wind.com/posts/2023/Apr/17/Preventing-iOS-Textbox-Auto-Zooming-and-ViewPort-Sizing
(not Apple documentation; verify on a device).

**Fix.** Add to §4.2: boxes are `<input type="text" inputmode="decimal"
autocomplete="off" spellcheck="false">` (see U24 for `autocomplete`), with
`font-size` ≥ 16 px on every input and `<select>`; never suppress zoom with
`maximum-scale=1`.

### U18 — minor — §4.4: the accessibility sentence needs four more details to be implementable

**Problem / evidence / fix**, item by item:

1. **Delta text covers one unit only.** §4.4's example "plus 8 yards versus sea level"
   omits the metres half of `+8/+7`. If an implementer attaches it as `aria-label` on
   a `<span>`, it is ignored or non-conformant: ARIA 1.2 lists `generic` among roles
   whose name is prohibited — "Authors MUST NOT use the aria-label or aria-labelledby
   attributes to name the element" (https://www.w3.org/TR/wai-aria-1.2/, §5.2.8.6).
   *Fix:* visually-hidden text in the cell ("plus 8 yards, plus 7 metres versus sea
   level"; percent mode "plus 4.9 percent") with the visible `+8/+7` `aria-hidden`.
2. **Invalid state.** §4.2 "marks the field invalid" with no non-colour cue; a red
   border on orange is barely distinguishable. *Fix:* `aria-invalid="true"`, an
   `aria-describedby` message, and a non-colour cue (icon or thicker outline in
   `#262425`).
3. **Keyboard access to the horizontal scroller.** A scroll wrapper with no focusable
   content is reachable by keyboard only where the browser makes scrollers focusable:
   Chrome does so only since 132, and only when the scroller has no focusable children
   (https://developer.chrome.com/blog/keyboard-focusable-scrollers). *Fix:*
   `tabindex="0"`, `role="region"` and `aria-label="PGA table, scrolls sideways"` on
   each wrapper (axe rule `scrollable-region-focusable`).
4. **Focus indicator on orange.** Unspecified; a custom outline in the palette's
   white has 3.18:1 against orange and 2.26:1 against the stripe. *Fix:* a 2 px
   `#262425` `:focus-visible` outline with a 2 px offset (4.85:1 on orange).

### U19 — nit — §6: the methods page's phone layout is unspecified

**Problem.** The methods page carries two wide live tables (per-row k_D, k_L and land
angles; the oracle table with six columns) and block MathML equations. At 375 px
both overflow; MathML blocks do not wrap.

**Evidence.** §6 items 4 and 6 (table columns as listed); prototype table of ten
columns needs 883 px.

**Fix.** One sentence in §6: wide tables and display equations sit in their own
`overflow-x: auto` wrappers (focusable, per U18.3); the page's text column has a
readable `max-width`.

### U20 — nit — §4.1, §4.4: the TrackMan title line does not fit a phone, and its alignment to the table is unspecified

**Problem.** "PGA TOUR AVERAGES YARDS/METERS … 2023" in heavy Oswald at the prototype's
26 px is 454 px wide; with `white-space: nowrap` it overflowed a 375 px phone and
made Chrome zoom the page out (`innerHeight` 733 instead of 667). In TrackMan's
image the title starts at the table's left edge and "2023" ends at its right edge,
which a free-floating title does not reproduce on desktop (prototype at 1280 px:
"2023" at the window edge, table ending at 883 px — `proto/shots/desktop_1280.png`).

**Evidence.** Measured title width 454 px (`proto/jobs2.json`); TrackMan image:
title x = 212 px = table left, "2023" right edge ≈ 1,705 px = table right.

**Fix.** §4.1: the title row shares the table's width container; on narrow screens
"YARDS/METERS" wraps to a second line beside "2023" (as the prototype's wrapped
version, `proto/shots/base_375_load.png`), and the title stays outside the
horizontal scroller.

### U21 — nit — §4.1, §4.2: default units are unspecified

**Problem.** The requirement implies ft as the elevation default; the pressure
default is not stated (kPa is listed first; inHg is "the US unit"). Without
persistence (§2), a metric user re-selects m and hPa on every visit.

**Fix.** State defaults: ft and inHg when `navigator.language` is `en-US`, otherwise m
and hPa — or simply ft and kPa, but say which.

### U22 — nit — §4.3: absolute and percent deltas visibly disagree, and "±0.0%" needs a rounding rule

**Problem.** Absolute delta is computed from rounded values, percent from the
unrounded Δ. A user who toggles and checks will find mismatches, largest on Max
Height (published 25–35 yd): a Δ of −1.4 yd on a 33 yd height shows `32` / `−1`
but `−4.2%`, while `−1/33` = −3.0 %. The gap is up to 0.5 / published — ±2 percentage
points on LPGA heights. Separately, "unchanged shows ±0.0%" does not say whether
"unchanged" means exactly zero or rounds to zero; JavaScript's `(-0.04).toFixed(1)` is
`"-0.0"`.

**Evidence.** §4.3 and §5.4 definitions; Node 22 `(-0.04).toFixed(1)` → `-0.0`
(`scripts/jsparse.mjs`).

**Fix.** Keep the unrounded percent (it is more accurate) but say so in one line on
the methods page (§6 item 5), and define: "a percent that rounds to 0.0 at one decimal
shows `±0.0%`; an absolute delta of 0 shows `±0`". Add `−0.04 %` to the present tests.

### U23 — nit — §4.4: the two tables scroll sideways independently

**Problem.** PGA and LPGA share identical columns. A phone user who scrolls the PGA
table to Carry and then scrolls down finds the LPGA table back at Club Speed, so
comparing tours means scrolling twice. (U1's initial right-anchoring hides this at
load, but not after the user scrolls one table.)

**Fix.** Mirror `scrollLeft` between the two wrappers on `scroll` (guarding against
the echo event).

### U24 — minor — §4.1, §2: coming Back from the methods page can show the user's typed elevation over sea-level tables

**Problem.** The methods link navigates away in the same tab and §2 rules out
persisting state. When the browser does not restore the page from its back-forward
cache, the page re-runs from scratch (state = sea level) but the browser's own form
restoration puts the user's last typed text, unit choices and slider position back
into the controls. Result: the box says `5280` ft (or `m`) while the tables and the
other views show sea level.

**Evidence.** Chrome 154 headless, page served over HTTP, Back after following a
link: `pageshow.persisted` false, JS state reset to 101325, input restored to `5280`
and `<select>` to `m` — overriding values a module script wrote during start-up; the
restored text is already present at `pageshow`. With `autocomplete="off"` on the
controls, nothing is restored (`proto2/jobs6.json`, `proto2/jobs7.json`, notes log).
Whether a real-world Back hits the back-forward cache varies by browser and
conditions; headless did not use it.

**Fix.** Either `autocomplete="off"` on every control (consistent, loses the user's
elevation), or on `pageshow` treat any restored control value as user input and
commit it into the state (keeps the elevation without URL or storage persistence,
so §2 still holds). Mention the choice in §4.2.

### U25 — minor — §8.2: headless-Chrome "screenshots at phone width" do not render a phone width

**Problem.** §8.2 relies on headless-Chrome screenshots for the phone and desktop
visual checks. With `--window-size=375,667` headless Chrome lays the page out 500 px
wide (and shorter than requested), so phone media queries never match and every
phone-layout defect above (U1, U4, U7, U8, U20) would pass a visual check that
believes it ran at 375 px.

**Evidence.** Probe page (`proto3/vw.html`): `--window-size=375,667` →
`innerWidth=500 innerHeight=524`, `(max-width: 400px)` false; `320,568` → 500 × 425.
The same page inside a 375×667 `<iframe>` reports 375 × 667 with the media query
true (`proto3/frame.html`). The prototype measurements in this review used the
DevTools protocol's `Emulation.setDeviceMetricsOverride` instead.

**Fix.** In §8.2, take phone screenshots through a tiny harness page that iframes
the site at 320×568, 375×667 and 390×844 (no dependency; the window itself stays
≥ 500 px), or through `Emulation.setDeviceMetricsOverride` over the DevTools
protocol from a short Node script (Node 22 has a built-in `WebSocket`). Assert in
the harness, not only by eye: Carry header visible at load (U1), sticky bar height
(U4), no horizontal page overflow (U20).

## Unverified concerns

1. **iOS: dragging the slider while a box has focus.** §4.2 does not reformat the
   focused box. If touching an `<input type=range>` on iOS Safari does not blur the
   focused text box (not tested; no device), the box keeps showing its stale text
   while the slider, the other box and the tables move. *Suggested rule:* any change
   from another control re-renders every box except the event's own source, focused or
   not, or blurs the focused box first.
2. **Real iPhone SE share of the sticky bar.** The 19–24 % figures in U4 are of the full
   667 CSS px screen; Safari's toolbars make the real visible height smaller, so the
   real share is larger. Not measured on a device.
3. **On-screen keyboard in landscape.** With a box focused in landscape, the keyboard
   plus a sticky bar may leave no table visible. Not measured; U4's non-sticky
   landscape rule would cover it.
4. **Safari's native range thumb size** on iOS was not measured (Chrome's control is
   16 px tall); U13's coarse-pointer rule covers either case.

## Non-findings

- **N1 — Pressure-as-truth with three views is the right model** (§4.2). Unit switches
  re-render from the unrounded state, so ft → m → ft returns the same digits; the
  only drift path is re-committing unedited text (U9).
- **N2 — inHg is the right US unit.** US weather and aviation report pressure in inHg
  (the NWS altimeter setting); psi is not used for weather.
- **N3 — The delta colour works.** `#262425` measures 4.85:1 on orange and 6.81:1 on
  the stripe, as the spec says; sign and position carry the meaning, so colour is not
  the only cue (colour-blind users are unaffected); at desktop size it does not
  overpower the white values (`proto/shots/desktop_1280.png`).
- **N4 — Sign-dependent red/green deltas would be worse.** Mid greens and reds score
  1.3–3.3:1 on the palette; only near-black shades pass, and those look like the chosen
  charcoal (notes log). If the user's "color coded" meant gain/loss colours, this is
  the answer to give them (traceability R13).
- **N5 — Delta strings fit.** Column widths are set by the two-line headers (76–99 px
  in the prototype); `+8/+7`, `−2/−2`, `−3°` fit with room for two-digit deltas
  (`proto/shots/alt_375_scrolled_end.png`).
- **N6 — Per-frame recompute fits.** An allocation-free stand-in of §5.2 (RK4,
  dt = 0.01 s, ~650 steps per flight) runs 23 flights in 2.15 ms in Chrome and 8.7 ms
  under a 4× CPU throttle (the slowdown Lighthouse applies for mobile);
  requestAnimationFrame coalescing (§5.4) is the right design. Calibration at the
  spec's ~10 flights per row is ≈ 88 ms under the same throttle, close to the 100 ms
  budget, so render the published values before calibrating rather than after.
- **N7 — Safe-area insets need nothing.** With the default `viewport-fit`, Safari insets
  content and fills the inset with the page background (orange); only
  `viewport-fit=cover` would require `env(safe-area-inset-*)` padding.
- **N8 — No `aria-live` on the tables is correct.** Announcing 69 cells per slider step
  would flood a screen reader; U13's `aria-valuetext` gives the slider its own feedback.
- **N9 — Reduced motion.** The spec specifies no animation; nothing to do unless
  transitions are added.
- **N10 — The PGA 8 Iron example is pinned by a test** (§8.1 present: 171.6 yd →
  `172` over `+8`), and every contrast number quoted in §4.3 / §4.4 is accurate.
- **N11 — Desktop layout.** The ten-column table's natural width is ~883 px, so it fits
  any desktop window without scrolling.
