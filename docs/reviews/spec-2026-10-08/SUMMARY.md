# Adversarial review of the design spec — dispositions

Target: `docs/superpowers/specs/2026-10-08-tmelevation-design.md` (first draft).
Six reviewers, one mandate each: `physics.md` (numeric re-implementation),
`physics-lit.md` (literature), `claims.md` (68 claims checked against primary
sources), `ux.md` (UX, mobile, accessibility, requirements traceability),
`delivery.md` (CI, release, deploy, conventions, licensing), `secperf.md`
(security and performance). Section numbers below refer to the revised spec.

User decisions taken during triage (2026-10-08): tag-only releases instead of
the reference's commit-back (D1–D4); exact TrackMan palette with no text
shadow (U16); a compact pinned control row on phones (U4).

## Blockers

| ID | Finding | Disposition |
|---|---|---|
| P1 = C1 = L5 | Oracle 10 fails: 188.4 yd vs 184 ± 4 | Fixed: oracle 10 now calibrates to TrackMan's own 2014 model shots and checks land angle ±3° (§8.3); the table-vs-TrackMan-model gap is documented (§5.5 item 2) |
| P2 | Carry not monotone to 15,000 ft for LPGA 3-wood / 4 Iron | Fixed: hard to 10,000 ft, soft above (§8.3 #9); physics explained (§5.5 item 3) |
| S3 | `150000` ft hangs the tab (NaN, unbounded loop) | Fixed: live state accepts only in-range values (§4.2); 60 s flight cap and failure isolation (§5.2, §5.6) |

## Physics (numeric) — physics.md

| ID | Sev | Disposition |
|---|---|---|
| P3 | major | Fixed: ρ₀ stated (dry, 25 °C, 1.1839 kg/m³); envelope restated as ρ₀k (§5.1, §5.3) |
| P4 | major | Fixed: dt = 0.05 s; budget as a step count (§5.2, §5.3, §8.1) |
| P5 | minor | Fixed: land-angle wording per row group (§5.5 item 2) |
| P6 | nit | Fixed: measured integration error stated (§5.2) |
| P7 | nit | Fixed: dry air, so ρ/ρ₀ = P/P₀ exactly (§5.1) |
| P8 | minor | Kept additive mapping; alternative and its size documented (§5.5 item 2) |
| P9 | nit | Fixed: `±0` / `±0.0%` on rounded values, never `−0.0%` (§4.3, §8.1) |
| P10 | major | Fixed: golden values, direct spin-decay / S / ρ₀k tests, metres line (§8.1) |
| P11 | nit | Declined: ≤ 0.38 yd effect; rounding uncertainty documented instead (§5.3) |
| P12 | minor | Fixed: eight TrackMan wind cases as soft oracle 12; test-only wind (§5.2, §8.3) |

## Physics (literature) — physics-lit.md

| ID | Sev | Disposition |
|---|---|---|
| L1 | minor | Fixed: critical-Re band and spin effect restated with sources (§5.5 item 1) |
| L2 | minor | Fixed: outputs measured against launch elevation, as TrackMan does (§5.2, §6) |
| L3 | major | Fixed: Re-free justified as closest match to TrackMan's model; −30 % … +25 % range (§5.5 item 1, §11) |
| L4 | major | Fixed: land-angle gap attributed mostly to table averaging, rest coupled to Re (§5.5 item 2) |
| L5 | major | = P1 |
| L6 | minor | Fixed: land-angle column labelled indicative, ±2° at 10,000 ft (§5.5 item 2) |
| L7 | nit | Fixed: temperature cancellation no longer used as a reason (§5.5 item 1) |

## Claims — claims.md (59 verified, 8 wrong or partly wrong, 1 unverifiable)

| ID | Disposition |
|---|---|
| C2 | Fixed: Smits & Smith fit stated as driver-range; irons extrapolate (§5.2) |
| C3 | Oracle 4 made soft; described as a total-distance rule (§8.3) |
| C4 | Oracle 8 made soft; temperature confound noted (§8.3) |
| C5 | = P3 |
| C6 | Fixed: source read via US 11,230,375 B1, apparently Mehta & Pallis (2001) text (§6) |
| C7 | Fixed: Padjen wording and inputs (§8.3 #1) |
| C8 | Oracle 5 made soft; described as a simulator note naming no club (§8.3) |
| C9 | = P5 |
| C10 | = P7 |
| C11 | Fixed: every semantic-release plugin pinned on the npx line (§9.2) |
| C12 | Fixed: "about 3.5 %" (§5.1) |
| C13 | Fixed: translucent column rule (§4.4) |
| C14 | Fixed: oracles 6–7 at 6,400 ft (§8.3) |
| C15 | Fixed: oracle 10 shots labelled "Calm" (§8.3) |
| C16 | Fixed: 40+ events men, 30+ women (§3) |
| C17 | Fixed: Equipment Rules, Part 4 (§5.2) |
| C18 | Fixed: `style` attributed to the Angular convention via commitlint (§9.2) |
| C19 | = D14 |
| C20 | Fixed: MathML Core subset (§6) |
| C21 | Fixed: fonts used unmodified (§4.4) |
| C22 | = P6 |
| C23 | Moot: no commit-back, so no push to `main` to reject (§9) |
| C24 | Fixed: "about 2×" replaced by the −30 % … +25 % range (§5.5 item 1) |
| C25 | Fixed: "Normalization" (§5.1) |

## UX — ux.md (21 requirements: 17 covered, 4 partial, 0 missing)

| ID | Sev | Disposition |
|---|---|---|
| U1 | major | Fixed: phone tables start scrolled to the right edge (§4.4) |
| U2 | major | Fixed: parsing rule, `5,280` → 5280 (§4.2) |
| U3 | major | Fixed: out-of-range keystrokes never reach the state (§4.2) |
| U4 | major | Fixed (user decision): compact pinned row on phones (§4.1) |
| U5 | major | Fixed: inline weather-barometer hint (§4.1) |
| U16 | major | User decision: exact palette, documented (§4.4) |
| U6 | minor | Fixed: two-line structure in every cell (§4.3) |
| U7 | minor | Fixed: opaque pinned column with its own rule (§4.4) |
| U8 | minor | Accepted: headers scroll with the table; documented (§4.4) |
| U9 | minor | Fixed: unedited boxes are not re-parsed (§4.2) |
| U10 | minor | Fixed: empty is invalid, never zero (§4.2) |
| U11 | minor | Fixed: deltas hidden exactly when displayed elevation is 0 (§4.3) |
| U13 | minor | Fixed: slider step, unit, value text, touch target (§4.2) |
| U14 | minor | Fixed: conditions caption and footer statement (§4.1) |
| U15 | minor | Fixed: charcoal methods link, 44 px target (§4.4) |
| U17 | minor | Fixed: text inputs, inputmode, 16 px (§4.2) |
| U18 | minor | Fixed: aria-invalid, hidden delta text, focusable scroller, focus rings (§4.2–4.4) |
| U24 | minor | Fixed: controls re-rendered on back/forward restore (§4.2) |
| U25 | minor | Fixed: device emulation for phone checks (§8.2) |
| U12 | nit | Partly: toggle meaning spelled out; land angle keeps % (user's literal requirement) (§4.1, §4.3) |
| U19 | nit | Fixed: methods page phone layout (§6) |
| U20 | nit | Fixed: title wrap rule (§4.1) |
| U21 | nit | Fixed: defaults ft and inHg (§4.1) |
| U22 | nit | Fixed: disagreement explained; no `−0.0%` (§4.3) |
| U23 | nit | Accepted: tables scroll independently |

## Delivery — delivery.md

| ID | Sev | Disposition |
|---|---|---|
| D1–D4 | major | Fixed (user decision): tag-only releases, tests gate release, required CI, dispatch redeploy, guarded tag-push deploy (§9) |
| D5 | minor | Fixed: calling-job permissions, no timeout on it (§9.2) |
| D6 | minor | Fixed: read-only build job, separate deploy job (§9.3) |
| D7 | minor | Fixed: tag output via `git tag --points-at HEAD` (§9.2) |
| D8 | minor | Fixed: ready/error state, request statuses, stderr, both pages (§8.2) |
| D9 | minor | Fixed: explicit test list; soft oracles as annotations (§8.1, §9.1) |
| D10 | minor | Fixed: setup order incl. Pages and first `feat` (§10) |
| D11 | minor | Fixed: merge commits only (§9.1) |
| D12 | minor | = P4 |
| D13 | minor | = C11 |
| D14 | nit | Fixed: Node 24 via `.nvmrc` (§8.1) |
| D15 | nit | Fixed: OFL texts, font credits (§4.4, §10) |
| D16 | nit | Fixed: data notice in `data.js` (§3) |
| D17 | nit | Fixed: `pages` concurrency declared as an exception, constant key (§9.3) |
| D18 | nit | Fixed: CodeQL JavaScript only, reasoned (§10) |
| D19 | nit | Fixed: `.claude/` excluded via `.git/info/exclude` (§10) |

## Security and performance — secperf.md

| ID | Sev | Disposition |
|---|---|---|
| S1 | major | = P4 |
| S2 | major | Fixed: paint from data first, calibrate incrementally (§5.3, §5.4) |
| S4 | minor | Fixed: strict meta CSP with Trusted Types; `textContent` only (§7) |
| S5 | minor | Fixed: `modulepreload` with a graph-match test (§7, §8.1) |
| S6 | minor | Fixed: 500 ft grid, incremental fill (§6) |
| S7 | minor | Fixed: `?v=<version>` stamped into the deploy artifact (§9.3) |
| S8 | nit | Fixed: `font-display: swap`, Lato 400/700, SHA-256 provenance (§4.4) |
