# Spec claims review — 2026-10-08-tmelevation-design.md

Reviewer mandate: verify every factual claim and citation in
`/home/jhoblitt/github/tmelevation/docs/superpowers/specs/2026-10-08-tmelevation-design.md`
against primary sources. Research files under `docs/research/` treated as leads only.
Access date for all sources: 2026-10-08 unless stated.

## Summary

The spec has 68 factual claims and citations. Each was checked against its primary source where one could be reached:
**59 verified** (several with nits or caveats), **8 wrong or partly wrong**, and **1 unverifiable**.
There are no blockers, 2 major findings, 9 minor findings and 14 nits.

- The source data are right. All 207 cells of the transcription match the TrackMan images, and every palette value and every
  contrast ratio (4.85, 6.81, 3.49, 2.26, 3.18) reproduces. TrackMan states no conditions, on the page or on its download posters.
- The atmosphere and units are right. The USSA 1976 equations, r0 and the constants 2.25577e-5, 5.255876 and 0.190263 are verified on
  the scanned NTRS pages. The ICAO equivalence is in the USSA Foreword. The NIST inHg factor is 3.386 389 E+03. The USSA pressure
  columns truncate (18/18 rows tested).
- Penner (2001) eqs 12-16 say exactly what the spec says, and the open author copy exists. The Smits & Smith page range is confirmed
  at secondary level by a USGA patent co-invented by Smits and by Nathan. The coefficient shapes exist only in a patent's
  reproduction of review text. That text restricts the model to **driver shots, 0.08 < S < 0.2**, which the spec omits (C2).
- The oracle numbers match their sources (282 → 306 yd, 102 → 84 ft, 38° → 29°; 184/33.8/48.0 and 152/27.7/45.6; Scheffler and
  McIlroy 7-iron +12.0 % / +13.8 %; Penge 7.5 % / 5 %; TrackMan "roughly 10 %"). Several are mislabelled: Titleist's rule is distance,
  not carry (C3); Crans is not same-temperature (C4); the TrackMan Support note names no PGA or mean (C8).
- An independent re-implementation of §5.2-5.4 reproduces the research probe's fitted factors exactly. It also shows that **hard
  oracle 10 fails** (PGA carry +4.4 yd against a ±4 yd band; C1), that the stated k envelope belongs to ISA 15 °C density rather than
  the spec's 25 °C / 50 % RH reference (C5), and that the land-angle offset range is overstated (C9). Every other hard oracle passes.
- The GitHub and tooling claims hold: GITHUB_TOKEN events do not trigger workflows, the required-check rule would reject the push
  (absent a bypass), and Pages needs pages/id-token permissions and the github-pages environment. Chrome is on ubuntu-latest,
  MathML is native, and Oswald and Lato are OFL. The semantic-release defaults (v${version}, 1.0.0) are confirmed in source, and the
  reference repository's release setup and rulesets match the spec. The exception is "every package pinned": three plugins float (C11).

## Claim checklist

| # | Claim | Spec § | Verdict | Evidence |
|---|---|---|---|---|
| 1 | TrackMan blog URL shows the 2023 PGA and LPGA Tour Averages tables | §1 | verified | trackman.com page "The 2023 PGA & LPGA Tour Averages", dated May 2, 2024; both table images embedded |
| 2 | Tables are images; PGA 12 rows (Driver…PW), LPGA 11 (no 3 Iron); the 9 data columns as listed | §3 | verified | Both 1920x883 JPEGs read at full size and as 1.5x crops |
| 3 | Transcription in trackman-2023-tour-averages.md matches the images | §3 | verified | All 207 cells (12x9 + 11x9) compared against crops; zero mismatches |
| 4 | Metres not always round(yd x 0.9144): PGA 4 Iron 209 yd / 192 m | §3 | verified | Image cell "209/192"; 209 x 0.9144 = 191.1 |
| 5 | TrackMan states no measurement conditions | §3, §5.5 | verified | No normaliz*/altitude/temperature/sea level/calm on the page; the official download posters (trackman.media) have no conditions note either |
| 6 | Methodology: measured shots from 40+ events | §3 | verified (nit) | "Male data is captured across 40+ different events and 200+ different players" (female: 30+ events). Also "from competition as well as on the range" (C16) |
| 7 | Palette: bg #EC6919, stripe #F3955F on odd rows across the full width, rules #BA571C, no horizontal rules | §4.4 | verified (nit) | Pixel medians match. On stripe rows the rule renders #BE7950, not #BA571C (C13) |
| 8 | Title accent #3D3B3C (YARDS/METERS) | §4.3, §4.4 | verified (nit) | Most common dark pixel is #3C3C3C (4575 px); #3D3B3C 145 px. Within JPEG noise (contrast 3.47 vs 3.49) |
| 9 | Header: white heavy condensed caps title, charcoal YARDS/METERS, "2023" right-aligned, thin condensed | §4.1 | verified | Seen in both images |
| 10 | #262425 contrast 4.85:1 on orange, 6.81:1 on stripe; #3D3B3C 3.49:1 on orange | §4.3 | verified | Computed 4.849, 6.813, 3.494 (WCAG 2.x relative luminance) |
| 11 | White text 2.26:1 on stripe, 3.18:1 on orange | §4.4 | verified | Computed 2.264, 3.181 |
| 12 | USSA 1976 troposphere identical to ICAO ISA in this range | §5.1 | verified | USSA 1976 Foreword p.xiii: "up to 32 km is identical with the ... Manual of the ICAO Standard Atmosphere, as revised in 1964" |
| 13 | H = r0Z/(r0+Z), r0 = 6,356,766 m; Z = r0H/(r0-H) | §5.1 | verified | USSA 1976 p.8 eqs (18), (19) (Γ = 1 m'/m); p.4 r0 = 6356.766 km |
| 14 | P = 101325(1 - 2.25577e-5 H)^5.255876; inverse exponent 0.190263; 288.15/0.0065 | §5.1 | verified | USSA eq (33a) with Table 4 L = -6.5 K/km', T0 = 288.15, g0, R*, M0. Computed g0M0/(R*L) = 5.2558761, L/T0 = 2.255770e-5, 1/n = 0.1902632 |
| 15 | TrackMan Normalization default 77 °F / sea level | §5.1 | verified (nit) | TrackMan blog 2014-07-09: "Default values are 77°F and sea level (0 feet altitude)." Feature name is "Normalization" (C25) |
| 16 | ISA lapse would make air 3.6-3.8 % denser at 5,000 ft | §5.1 | verified (nit) | Computed: dry 15 °C base 3.56 %; dry 25 °C base 3.44 %; 25 °C + 50 % RH 3.78 %. The range mixes bases (C12) |
| 17 | Density ratio ρ/ρ0 = P/P0 (with T fixed at 25 °C and RH fixed at 50 %) | §5.1 | wrong (minor) | With RH held, vapour mole fraction rises with altitude: ρ/ρ0 is 0.12 % below P/P0 at 5,000 ft, 0.27 % at 10,000 ft, 0.46 % at 15,000 ft (C10) |
| 18 | inHg = 3386.389 Pa (conventional, NIST SP 811); mbar = hPa = 100 Pa; kPa 1000 | §5.1 | verified | NIST SP 811 App. B.8: "inch of mercury, conventional (inHg) 3.386 389 E+03" (not exact); millibar 1.0 E+02 (exact) |
| 19 | 1 ft = 0.3048 m, 1 yd = 0.9144 m, 1 mph = 0.44704 m/s | §5.1 | verified | NIST SP 811 App. B.8, all bold (exact) |
| 20 | EOM dvx/dt = -kV(C_D vx + C_L vy), dvy/dt = -kV(C_D vy - C_L vx) - g | §5.2, §6 | verified | Penner 2001 p.565 eqs (12)-(15); algebraically identical with cos φ = vx/V |
| 21 | Spin decay λ0 = 2.0e-5 (Smits & Smith, as given in Penner 2001 eq. 16) | §5.2 | verified | Penner eq (16) α = -(0.000 02)(ω_b v_b / r), "obtained from the results of Smits and Smith" |
| 22 | Penner (2001) Am. J. Phys. 69:563, doi:10.1119/1.1344164; open author copy exists | §6 | verified | Crossref: AJP 69(5) 563-568; VIU repository PDF returns 200 (published version with an AAPT/AIP personal-use notice) |
| 23 | Ball m = 45.93 g, D = 42.67 mm (Rules of Golf limits) | §5.2 | verified (nit) | R&A Equipment Rules Part 4: max weight 1.620 oz (45.93 g); min diameter 1.680 in (42.67 mm). Document is the Equipment Rules (C17) |
| 24 | Smits & Smith (1994), Science and Golf II pp. 340-347 | §6 | verified (secondary) | USGA patent US 6,186,002 (co-inventor A. J. Smits) cites "pages 340-347"; Penner ref 13 confirms the book and editors |
| 25 | C_D = 0.24 + 0.18 S, C_L = 0.54 S^0.4 are the Smits & Smith shapes without the Re term | §5.2, §11 | verified, but scope omitted (major) | Text in patent US 11,230,375 B1: "for driver shots in the operating range, 70,000<Re<210,000, 0.08<S<0.2". The spec applies the shapes to every club (C2) |
| 26 | Coefficient shapes "read only through R. D. Mehta's review text" | §6 | wrong (minor) | Read in a patent (US 11,230,375 B1) that reproduces apparently Mehta & Pallis (2001) text without attributing it to them. Mehta's own text was not read (C6) |
| 27 | Dimpled-ball drag crisis Re ≈ 4e4-1.1e5 | §5.5 | verified | Li, Tsubokura & Tsunoda 2017 Table 1: sub-/critical/supercritical at 4.3e4 / 7.5e4 / 1.1e5 (Cd 0.506 / 0.317 / 0.240) |
| 28 | Oracle 1: PGA Driver at 7,800 ft, carry +8.5 % (TrackMan model, via PGA TOUR 2017) | §8.3 | verified with caveats (minor) | PGA TOUR 2017: 282 → 306 yd carry, 7,800 ft (306/282 = +8.5 %; the article says "an increase of 8 percent"). Inputs are 113 mph club speed and 10.7° launch, not the 2023 row; "TrackMan model" is inferred from "Padjen has run the numbers" (C7) |
| 29 | Oracle 2: max height -18 % | §8.3 | verified | Apex 102 → 84 ft = -17.6 % |
| 30 | Oracle 3: land angle -9° | §8.3 | verified | "38 degrees ... would change to 29 degrees" |
| 31 | Oracle 4: PGA Driver at 5,280 ft, carry +6.1 % (Titleist, 1.16 %/1,000 ft) | §8.3 | wrong label (minor) | Aoyama (GolfWRX quote; PGA TOUR 2017): "the distance gain ... multiplying the elevation (in feet) by .00116", example "drive the ball 250 → 265"; Titleist Learning Lab (Wayback 2026-05-09): "about 6%", "greater roll". Not stated as carry (C3) |
| 32 | Oracle 5: mean PGA carry gain at 7,200 ft ≈ +10 % (TrackMan Support) | §8.3 | verified with caveats (minor) | TrackMan Support VG page: "2100m or 7000ft" (settings 7198 ft), "roughly 10% further in the air". No club, player group, mean, or temperature. A simulator help page (C8) |
| 33 | Oracle 6: PGA 7 Iron at 6,300 ft, carry +12-14 % (tour caddie sheets, Castle Pines 2024) | §8.3 | verified (nit) | TaylorMade 2024-08-22: Scheffler 184 → 206 (+12.0 %), McIlroy 195 → 222 (+13.8 %). The source says "nearly 6,400 feet"; 6,300 ft is the spec's own pick (C14) |
| 34 | Oracle 7 basis: TrackMan says mid/short irons gain most | §8.3 | verified | PGA TOUR 2024: "the clubs most affected are the mid- and short-irons (6- to 9-irons) ... drivers/woods ... less affected"; Padjen 2017 "bell curve" |
| 35 | Oracle 8: Crans 4,920 ft, PGA 7 Iron +7.5 %, Driver +5 % | §8.3 | verified with caveats (minor) | DP World Tour 2026-09-02: 1,500 m; Penge "Seven-and-a-half per cent in the nine, eight, seven and six iron and then five per cent for the rest [wooded clubs]". Same article: his 8-iron gains ~5 % in the cool morning and "upwards of ten per cent" as it warms, so not a same-temperature comparison (C4) |
| 36 | Oracle 10: TrackMan model 6-iron, PGA 130/14.7/6088 → 184/33.8/48.0; LPGA 110/18.6/5950 → 152/27.7/45.6, "at sea level" | §8.3 | verified (nit) | TrackMan Normalization post, "Calm" column of both images matches exactly. Altitude and temperature for these tables are not stated; "at sea level" is inferred from the defaults (C15) |
| 37 | Bands: sources are secondary or planning numbers; none gives iron launch conditions alongside altitude carry | §8.3 | verified | No reviewed source gives iron launch data with altitude carry. Oracle 10 is a primary TrackMan source, but it is sea level only |
| 38 | Spin decay scaled by ρ/ρ0 because the decay torque scales with dynamic pressure | §5.2 | verified | Nathan, spindown-rev1.pdf eqs (7)-(9): Tavares torque I ω̇ = -RρAC_M v², C_M = βS, so λ = βR³ρπ/(Mα) ∝ ρ |
| 39 | g = 9.80665 m/s² | §5.2 | verified | USSA 1976 p.3 g0 = 9.80665 (standard gravity) |
| 40 | RK4 dt = 0.01 s with Hermite interpolation is about 3e-5 yd from converged | §5.2 | verified as a bound (nit) | Independent implementation: ≤ 6e-10 yd at dt = 0.01 (Driver, 7i, PW). The stated figure is conservative (C22) |
| 41 | Expected fitted ranges k_D 0.89-1.22, k_L 0.79-1.08 | §5.3 | wrong under the spec's own ρ0 (minor) | Reproduced exactly at ρ0 = 1.225 (ISA 15 °C). At the spec's 25 °C / 50 % RH reference (ρ0 ≈ 1.177): k_D 0.925-1.273, k_L 0.817-1.120 (C5) |
| 42 | About 10 flights per row; Newton converges | §5.3 | verified | Converges in 3 iterations x 3 flights for all 23 rows (independent implementation) |
| 43 | After calibration the model lands 1-9° shallower than the table, worst for hybrids and long irons | §5.5 | wrong in part (minor) | Residuals -9.2° (PGA Hybrid) to +0.7° (LPGA PW); LPGA 8i -0.2°, 9i -0.4°. Worst rows: PGA Hybrid, 3i, 4i, 5-wood (C9) |
| 44 | All hard oracles pass with this model (success criterion 2) | §1, §8.3 | wrong for oracle 10 (major) | Independent implementation: PGA 6-iron factors at 130/14.7/6088 give carry 188.4 yd vs 184 ±4 (outside). Every other hard oracle passes (C1) |
| 45 | Re-dependent modelling changes iron gains by up to about 2x | §5.5 | unverifiable here | The spec does not specify the crisis model. Research notes give PW +12.8 % vs +5.1 % at 7,800 ft (2.5x) and 7i 1.8x, so "about 2x" understates it (C24) |
| 46 | A tag pushed with the workflow's GITHUB_TOKEN does not trigger other workflows | §9.3 | verified | docs.github.com "When GITHUB_TOKEN triggers workflow runs": events "will not create a new workflow run" except workflow_dispatch / repository_dispatch (and some pull_request) |
| 47 | A required-check ruleset rule would reject the release job's direct push | §9.1 | verified (nuance) | github/docs rulesets: required checks pass "before collaborators can make changes to a branch"; protected branches: commits are pushed elsewhere and merged, or pushed directly "After all required status checks pass". A bypass actor could exempt the push (C23) |
| 48 | Reference rulesets carry only deletion and non-fast-forward | §9.1, §10 | verified | gh api: conventions-claude and rook-claude "protect-default-branch" = [deletion, non_fast_forward], no bypass actors |
| 49 | npx with every package pinned exact + npm_config_ignore_scripts=true | §9.2 | wrong in part (minor) | release.yml pins five named packages exactly. commit-analyzer, release-notes-generator and github come from semantic-release@25.0.8 deps "^13.0.1", "^14.1.0", "^12.0.0" (C11) |
| 50 | .releaserc.yml: conventionalcommits preset; docs/refactor/perf → patch; chore/ci/test/build/style no release; visible-types list | §9.2 | verified | conventions-claude .releaserc.yml (local = remote main except the plugin list) |
| 51 | commitlint enforces the format on every PR | §9.2 | verified | Reference commitlint.yml on pull_request; new-repo canon lands it |
| 52 | Plugins: commit-analyzer, release-notes-generator, changelog (CHANGELOG.md), exec, git, github; git message `chore(release): <version> [skip ci]` | §9.2 | verified | Reference .releaserc.yml. The @semantic-release/git default message also appends the notes; the reference overrides that |
| 53 | release-notes.sh adds GitHub's PR list and the issues those PRs close | §9.2 | verified | POST releases/generate-notes, then GraphQL closingIssuesReferences for each /pull/N, appended as "### Resolved issues" |
| 54 | Default tagFormat v<version>; first release v1.0.0 | §9.2 | verified | semantic-release v25.0.8 lib/get-config.js:74 `v${version}`; constants.js FIRST_RELEASE = "1.0.0" (once a releasable commit exists) |
| 55 | Concurrency group release, cancel-in-progress false (as reference) | §9.2 | verified | Reference release.yml |
| 56 | `style` is Conventional Commits' code-formatting type | §9.2 | wrong (nit) | Conventional Commits 1.0.0 defines only fix/feat/BREAKING CHANGE and lists style: as an example from @commitlint/config-conventional (Angular convention) (C18) |
| 57 | Pages via Actions: pages: write + id-token: write; github-pages environment; policy must admit main and v* | §9.3, §9.4, §11 | verified | github/docs using-custom-workflows-with-github-pages.md:50,52. The auto-created environment blocks tag deploys in practice ("Tag 'v1.0.1' is not allowed to deploy to github-pages"). The spec treats this as a requirement and a risk |
| 58 | Release job grants contents: write, issues: read, pull-requests: read | §9.4 | verified | Reference release.yml job permissions |
| 59 | Hygiene: pinact SHAs, actionlint + shellcheck, top-level contents: read, persist-credentials: false, timeout-minutes | §9.4 | verified | github-conventions references/workflows.md sections Pinning, actionlint, Permissions, Timeouts, Checkout credentials |
| 60 | Google Chrome preinstalled on GitHub's Ubuntu runners | §8.2 | verified | actions/runner-images Ubuntu2404-Readme.md (20260927.320.1): Google Chrome 154.0.8037.57; ubuntu-latest = 24.04 |
| 61 | Node 22 LTS | §8.1 | verified (nit) | nodejs/Release schedule: v22 maintenance LTS since 2025-10-21, EOL 2027-04-30; v24 is the active LTS (C19) |
| 62 | Native MathML works with no script in current Chrome/Safari/Firefox | §6 | verified (nit) | caniuse mathml: Chrome 109+ (MathML Core only), Firefox, Safari, iOS Safari all "y" (C20) |
| 63 | Oswald and Lato are under the SIL OFL | §4.4, §10 | verified (nit) | google/fonts METADATA.pb license "OFL"; OFL.txt "SIL Open Font License, Version 1.1"; Lato has Reserved Font Name "Lato" (C21) |
| 64 | New-repo flow: empty repo, init-branch PR onto an empty root commit, canon ruleset, delete-branch-on-merge, Apache-2.0, README, Dependabot (Actions), workflow-lint, CodeQL, dependency review, Scorecard, commitlint | §10 | verified | github-conventions references/new-repo.md and templates/dependabot.yml (github-actions) |
| 65 | US weather "barometric pressure" is sea-level reduced and shown as the altimeter setting in inHg | §6 | verified | NWS glossary: altimeter setting = "A correction of the station pressure to sea level"; MapClick KBKF (5577 ft): "Barometer 30.13 in (1013.8 mb)" |
| 66 | USSA 1976 tables truncate (table ≤ computed < table + 1 ulp) | §8.1 | verified | Table I (PDF p.69), H 3000-3850 m': truncation matches 18/18, rounding 6/18 |
| 67 | Range 0-15,000 ft = 0-4,572 m | §4.2 | verified | 15000 x 0.3048 = 4572 |
| 68 | Penner is a primary source for the EOM and spin decay; Smits & Smith "primary" for the shapes | §6 | verified, with caveat | Penner read in full. Smits & Smith is listed as a primary source but was never read (see rows 24-26) |

## Findings

Severity: blocker / major / minor / nit. Quotes are from the primary source unless marked.

### C1 — major — §8.3 oracle 10 (and success criterion 2): the spec's model fails its own hard oracle

- **Claim:** oracle 10 is hard on carry ±4 yd: with the calibrated PGA 6-iron factors, the TrackMan model shot 130 mph / 14.7° / 6088 rpm should carry 184 yd. Success criterion 2 needs every hard oracle to pass.
- **Evidence:** the oracle's inputs are right: the TrackMan Normalization post's "Calm" column is 130 / 14.7 / 6088 → 184 yd / 33.8 yd / 48.0°. But an independent implementation of §5.2-5.4 fails it. That implementation reproduces the research probe's fitted factors to three decimals. It gives carry **188.4 yd (+4.4 yd, outside ±4)**, apex 33.2 yd (pass) and land 45.1° (-2.9°, inside the soft ±3°). The result is the same at ρ0 = 1.225 and 1.177 kg/m³. The research file already noted that the 2023 PGA 6-iron row carries 4 yd farther than this 2014 model shot despite lower launch and higher spin. The LPGA half passes (153.9 / 27.4 / 43.9).
- **Correction:** make oracle 10's carry soft, or widen it to ±5 yd and say why. Either way, state that the 2014 model shot and the 2023 averages are not mutually consistent at the 4-yd level. As written, CI goes red on the first commit.

### C2 — major — §5.2 / §6 / §11: the coefficient shapes are applied outside the range their source states

- **Claim:** "C_D = k_D·(0.24 + 0.18 S), C_L = k_L·0.54·S^0.4: the Smits & Smith (1994) shapes without their Reynolds-number term". It is applied to all 23 rows, and the limitations list (§5.5) does not mention range.
- **Source (secondary, patent US 11,230,375 B1 reproducing Mehta & Pallis-style review text):** "Smits and Smith (8) proposed the following model **for driver shots in the operating range, 70,000<Re<210,000, 0.08<S<0.2**".
- **Why it matters:** launch S is 0.074 for the PGA driver, but 0.195 for the PGA 5-iron, 0.289 for the 7-iron and 0.448 for PW (r·ω/V). S then rises through the flight (research probe: PW up to 1.21). Every iron row is therefore an extrapolation of a driver-only fit. Calibration absorbs the level but not the S-dependence that drives the altitude delta.
- **Correction:** in §5.2, after "Smits & Smith (1994) shapes", add "which they proposed for driver shots (70,000 < Re < 210,000, 0.08 < S < 0.2); for irons and wedges the shapes are extrapolated." Add that as a §5.5 limitation and fold it into §11 risk 3.

### C3 — minor — §8.3 oracle 4: the Titleist rule is for distance, not carry

- **Claim:** "PGA Driver at 5,280 ft: carry +6.1 % (Titleist, 1.16 %/1,000 ft)".
- **Source:** Aoyama, quoted verbatim by GolfWRX (2019) and the PGA TOUR (2017): "You can calculate the **distance gain** ... by multiplying the elevation (in feet) by .00116 ... If you normally **drive** the ball 250 yards at sea level, you will likely drive it 265 yards". The Titleist Learning Lab page (primary, Wayback 2026-05-09) says the same, rounded to "about 6%" at a mile, and attributes the extra distance partly to "greater roll". The 0.00116 constant appears only in third-party quotes; titleist.com returns 403.
- **Correction:** "+6.1 % (Aoyama/Titleist rule of thumb for *distance*, incl. roll; applied here to carry as an approximation; secondary quote)". If it includes roll, the carry gain is lower, so the band's lower edge matters more than its centre.

### C4 — minor — §8.3 oracle 8: the Crans figures are not a same-temperature comparison

- **Claim:** "at 4,920 ft: PGA 7 Iron carry; PGA Driver carry +7.5 %; +5 %", under the preamble "Unless stated, sea level and altitude use the same temperature".
- **Source (DP World Tour, 2026-09-02):** Penge: "Seven-and-a-half per cent in the nine, eight, seven and six iron and then five per cent for the rest [wooded clubs]". The same article: his 8-iron goes 180 → 190 ("roughly carrying five per cent extra") in the cool morning, and he expects "upwards of ten per cent more" as the temperature rises. The driver is not named; "wooded clubs" is mapped to Driver.
- **Correction:** label the row "Penge (secondary) launch-monitor planning numbers; temperature varies (5-10 % for an 8-iron through the day); woods → Driver mapping". Keep it hard only if the band is meant to absorb temperature.

### C5 — minor — §5.3: the expected k ranges were computed at a different reference density

- **Claim:** "Expected fitted ranges from the research probe: k_D 0.89-1.22, k_L 0.79-1.08", with tests asserting a plausibility envelope.
- **Evidence:** the independent implementation reproduces exactly these ranges at **ρ0 = 1.225 kg/m³ (ISA 15 °C)**. At the spec's own reference (§5.1: 25 °C, 50 % RH, ρ0 ≈ 1.177) every factor scales by 1.0405: k_D 0.925-1.273, k_L 0.817-1.120. LPGA 8 Iron (k_D 1.273) and LPGA PW (k_L 1.120) fall outside the stated envelope. The deltas are unaffected (the Re-free model depends only on ρ·k). §5.2 also never states ρ0 or how it is computed (dry ideal gas vs CIPM moist air).
- **Correction:** state ρ0 and its formula. Restate the envelope at that ρ0: k_D ≈ 0.93-1.27 and k_L ≈ 0.82-1.12 for 25 °C / 50 % RH, CIPM-2007.

### C6 — minor — §6 item 8: the coefficient shapes were not read in Mehta's text

- **Claim:** "Smits & Smith (1994) ... (coefficient shapes; book chapter, read only through R. D. Mehta's review text, which the page states)".
- **Evidence:** the only text read is Google Patents US 11,230,375 B1, which reproduces a review passage. Its numbered references and the patent's citation of "Rabindra D. Mehta and Jani Macad Pallis, 'Sports Ball Aerodynamics: Effects of Velocity, Spin and Surface Roughness', Materials and Science in Sports, pp. 185-197" make Mehta & Pallis (2001) the likely origin. The patent does not mark the passage as theirs. Five web searches found no copy of the chapter or of Mehta & Pallis.
- **Correction:** "read only in a reproduction (US 11,230,375 B1) of review text apparently from Mehta & Pallis (2001); the chapter itself was not read". The page range 340-347 is independently confirmed by USGA patent US 6,186,002 (co-invented by A. J. Smits) and by Nathan's spin-decay note, so keep it.

### C7 — minor — §8.3 oracles 1-3: attribution and input mismatch

- **Claim:** "+8.5 % (TrackMan model, via PGA TOUR 2017)" applied to the 2023 PGA Driver row.
- **Source (PGA TOUR, 2017-02-28):** "an average TOUR player with a high trajectory (launch angle 10.7 degrees) and 113-mph club speed would typically see an apex of 102 feet at sea level, with a carry of 282-yards. In Mexico, this would change to 84 feet for apex and 306 yards of carry – an increase of 8 percent." Land angle 38° → 29°. The article says only that Padjen "has run the numbers". "TrackMan model" is an inference, and ball speed, spin and temperature are not given.
- **Correction:** "Padjen (TrackMan), quoted by PGA TOUR 2017: 113 mph club speed, 10.7° launch, 282 → 306 yd (+8.5 %; the article rounds to 8 %); applied to the 2023 row (115 mph, 10.4°, 171 mph, 2545 rpm) by analogy".

### C8 — minor — §8.3 oracle 5: the source says neither PGA nor mean

- **Claim:** "mean PGA carry gain at 7,200 ft ≈ +10 % (TrackMan Support)".
- **Source:** TrackMan Support "VG | Altitude in Course Play" (a virtual-golf simulator help page): course altitude "2100m or 7000ft", settings "7198ft"; "the ball will travel roughly 10% further in the air than at sea level." There is no club, player population or temperature. TrackMan's tour manager (PGA TOUR 2024, paraphrased) says high-ball hitters "may average over 10% across all clubs" and low-ball pros "may have no clubs that average over 10%".
- **Correction:** "≈ +10 % carry at ~7,000-7,200 ft (TrackMan Support simulator note; no club or player given), compared with the PGA-bag mean".

### C9 — minor — §5.5 item 2: the land-angle offset range is overstated

- **Claim:** "After calibration the model lands 1-9° shallower than TrackMan's table (worst for hybrids and long irons)".
- **Evidence (independent implementation):** the residuals run from -9.2° (PGA Hybrid) to **+0.7° (LPGA PW, steeper)**. LPGA 8 Iron is -0.2° and LPGA 9 Iron -0.4°. The worst rows are PGA Hybrid -9.2°, 3 Iron -7.5°, 4 Iron -7.0° and 5-wood -6.5°.
- **Correction:** "up to 9° shallower (PGA hybrid); PGA rows 1-9°, LPGA rows from 0.7° steeper to 5.6° shallower".

### C10 — minor — §5.1: ρ/ρ0 = P/P0 does not hold with humidity fixed at 50 %

- **Claim:** temperature fixed at 25 °C "and humidity at 50 % at every elevation ... Consequence used by the model: density ratio ρ/ρ₀ = P/P₀."
- **Evidence:** with RH and T fixed, the vapour pressure is fixed, so the vapour mole fraction e/P rises with altitude. Computed with CIPM-2007, ρ/ρ0 sits below P/P0 by 0.12 % at 5,000 ft, 0.27 % at 10,000 ft and 0.46 % at 15,000 ft. The identity is exact only for dry air.
- **Correction:** either "humidity is ignored (dry air), so ρ/ρ₀ = P/P₀", or "ρ/ρ₀ ≈ P/P₀ (within 0.5 % to 15,000 ft at 50 % RH)".

### C11 — minor — §9.2: not every npx package is pinned exactly

- **Claim:** "`npx` with every package pinned to an exact version".
- **Evidence:** the reference release.yml pins five named packages: semantic-release@25.0.8, changelog@7.0.0, exec@7.1.0, git@11.0.1 and conventional-changelog-conventionalcommits@9.3.1. Three of the six plugins the spec lists come from semantic-release's own dependencies with caret ranges (registry: commit-analyzer "^13.0.1", release-notes-generator "^14.1.0", github "^12.0.0"). The workflow comment itself says "The npx graph below is not lockfile-pinned".
- **Correction:** "every package named on the npx command line is pinned exactly; semantic-release's bundled plugins (commit-analyzer, release-notes-generator, github) and all transitive dependencies float within semver ranges, hence `npm_config_ignore_scripts=true`".

### Nits

- **C12 — §5.1:** "3.6-3.8 % denser at 5,000 ft" mixes bases. Computed at the USSA pressure: dry, 15 °C base (true ISA) +3.56 %; dry, 25 °C base +3.44 %; 25 °C base with 50 % RH +3.78 %. Better: "≈ 3.4-3.8 % denser (3.8 % for the 25 °C / 50 % RH reference)".
- **C13 — §4.4:** over the stripe rows the vertical rules render **#BE7950**, not #BA571C (sampled at x = 320, y = 205/316/540), so an opaque #BA571C rule will look darker there than TrackMan's. The title charcoal's modal pixel is #3C3C3C, of which #3D3B3C is a JPEG variant; the difference is immaterial (contrast 3.47 vs 3.49).
- **C14 — §8.3 oracle 6:** the source says Castle Pines "plays at nearly 6,400 feet". The 6,300 ft is the spec's own choice; say so or use 6,400. The figures are the players' stock and altitude planning yardages, not measurements. McIlroy's are explicitly "would fly", Scheffler's are unlabelled and vary "based off the lie, whether the hole is uphill or downhill".
- **C15 — §8.3 oracle 10:** "at sea level" is not stated by TrackMan. The tables are labelled only "Calm"; sea level and 77 °F are inferred from the Normalization defaults. They are also 2014-era tour shots with -3.1° / -1.5° attack angle.
- **C16 — §3:** "measured shots from 40+ events" covers the men only. TrackMan says women's data come from "30+ different events and 150+ different players", and all data "from competition as well as on the range".
- **C17 — §5.2:** "Rules of Golf limits" should be "R&A/USGA Equipment Rules, Part 4": a maximum mass of 1.620 oz (45.93 g) and a minimum diameter of 1.680 in (42.67 mm).
- **C18 — §9.2:** `style` is not a Conventional Commits type. The spec (1.0.0) defines only fix/feat/BREAKING CHANGE and lists `style:` as an example from @commitlint/config-conventional, which follows the Angular convention.
- **C19 — §8.1:** Node 22 has been maintenance LTS since 2025-10-21 and reaches EOL on 2027-04-30; Node 24 is the active LTS. It is still a true "LTS", but the site will outlive it.
- **C20 — §6:** Chromium (109+) implements MathML Core, not full MathML 3 (caniuse note 4). Author the methods-page equations in the MathML Core subset (no `mfenced`, `menclose`).
- **C21 — §4.4 / §10:** Lato's OFL carries Reserved Font Name "Lato". Under the OFL, self-made subsetting or format conversion produces a Modified Version that may not use the name. Ship the authors' woff2 unmodified, or rename.
- **C22 — §5.2:** "about 3×10⁻⁵ yd from a converged solution" is very conservative. An independent RK4 with Hermite interpolation gives ≤ 6×10⁻¹⁰ yd at dt = 0.01 s.
- **C23 — §9.1:** a required-check rule rejects the release push only for actors not on the ruleset's bypass list. The docs say rulesets allow "certain users to bypass the rules". The decision not to use a required check may still be right, but the stated reason is not unconditional.
- **C24 — §5.5 item 1:** "changes iron gains by up to about 2×" cannot be checked from the spec, which does not specify the crisis model. The research notes give PW +12.8 % vs +5.1 % at 7,800 ft (2.5×) and 7-iron +13.5 % vs +7.5 % (1.8×), so "about 2-2.5×".
- **C25 — §5.1:** TrackMan's feature is "Normalization", not "Normalize".

## Sources

All accessed 2026-10-08. P = read at the primary source; S = secondary; D = derived by reviewer computation.

TrackMan and golf

- P: TrackMan, "Introducing updated tour averages" (2024-05-02) — https://www.trackman.com/blog/introducing-updated-tour-averages ; table images https://a.storyblok.com/f/117513/1920x883/6aefae601d/pga_tour-averages_trackman_blog.jpg , https://a.storyblok.com/f/117513/1920x883/9617e89ecd/lpga_tour-averages_trackman_blog.jpg
- P: TrackMan media kit, tour-average posters — https://www.trackman.media/tour-averages
- P: TrackMan, "The Normalization feature explained" (2014-07-09) — https://www.trackman.com/blog/golf/normalization-feature-explained ; images .../407x210/0ce2fd44b7/pga-tour-6-iron.png , .../410x208/acc893e2e4/lpga-tour-6-iron.png
- P: TrackMan Support, "VG | Altitude in Course Play" (2026-06-15) — https://support.trackmangolf.com/hc/en-us/articles/51714287935387-VG-Altitude-in-Course-Play
- P (article) / S (Padjen, Aoyama quotes): PGA TOUR, "Elevated expectations" (2017-02-28) — https://www.pgatour.com/article/news/long-form/2017/02/28/elevated-expectations-wgc-mexico-championship-altitude
- P (article) / S (Shih paraphrase): PGA TOUR, Hodowanic (2024-08-21) — https://www.pgatour.com/article/news/latest/2024/08/21/altitude-adjustment-colorado-castle-pines-golf-club-elevation-challenge-bmw-championship
- P: TaylorMade Clubhouse, Esse (2024-08-22) — https://taylormadegolf.fr/clubhouse/801423-seen-on-tour-scottie-rory-collin-tommy-prepare-for-altitude-at-the-bmw-championship.html?lang=fr_FR
- P (via WebFetch; curl 403): DP World Tour, "A numbers game..." (2026-09-02) — https://www.europeantour.com/dpworld-tour/news/articles/detail/a-numbers-game-players-tackle-altitude-at-omega-european-masters/
- P (Wayback): Titleist Learning Lab, "Altitude and Ball Flight" — http://web.archive.org/web/20260509230837/https://www.titleist.com/learning-lab/performance/altitude-and-golf-ball-flight (live titleist.com: HTTP 403)
- S: GolfWRX, Barath (Aoyama verbatim) — https://golfwrx.com/545618/tiger-woods-lofting-up-for-thin-air-examining-the-switch-and-what-happens-when-you-play-at-altitude/
- P: R&A, Rules of Equipment Part 4 — https://www.randa.org/roe/the-rules-of-equipment/part-4-conformance-of-balls

Physics

- P: Penner (2001), Am. J. Phys. 69(5) 563-568 — Crossref https://api.crossref.org/works/10.1119/1.1344164 ; author copy https://www.viurrspace.ca/server/api/core/bitstreams/59c73ed3-fece-4b2c-8e96-a14336895139/content
- S: US 11,230,375 B1 (Smits & Smith model text) — https://patents.google.com/patent/US11230375B1/en
- S: US 6,186,002 B1 (USGA; Smits & Smith pp. 340-347) — https://patents.google.com/patent/US6186002B1/en
- S/P: Nathan, "The Spin Decay of a Baseball" — https://baseball.physics.illinois.edu/spindown-rev1.pdf
- S: Crossref record 10.4324/9780203474709-58 (2002 ebook pagination 433-442; landing page mismatched)
- P (via WebFetch): Li, Tsubokura, Tsunoda (2017) — https://pmc.ncbi.nlm.nih.gov/articles/PMC6044256/
- D: reviewer re-implementation of spec §5.2-5.4 (Python, RK4 + Hermite + Newton), /tmp/claude-1000/claims-review/scripts/model.py (scratch, not committed)

Atmosphere and units

- P: U.S. Standard Atmosphere 1976, NTRS 19770009539 — https://ntrs.nasa.gov/api/citations/19770009539/downloads/19770009539.pdf (Foreword p.xiii; pp.3, 4, 8, 12; Table I printed p.54)
- P: NIST SP 811 App. B.8/B.9 — https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8
- P (via WebFetch): NWS glossary and KBKF current conditions — https://forecast.weather.gov/glossary.php?word=altimeter%20setting , https://forecast.weather.gov/MapClick.php?lat=39.7392&lon=-104.9903
- D: CIPM-2007 moist-air density formula, constants as recorded in docs/research/atmosphere.md.notes.md (Picard et al., Metrologia 45 (2008) 149), used for C10/C12

GitHub and tooling

- P: GitHub Docs, GITHUB_TOKEN — https://docs.github.com/en/actions/concepts/security/github_token
- P: github/docs source (main) — content/repositories/.../available-rules-for-rulesets.md, .../about-protected-branches.md, content/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages.md, .../configuring-a-publishing-source-for-your-github-pages-site.md
- S: redis/redis-om-spring PR 660 (tag blocked by github-pages environment), via web search
- P: actions/runner-images images/ubuntu/Ubuntu2404-Readme.md and README.md
- P: nodejs/Release schedule.json
- P: caniuse features-json/mathml.json
- P: google/fonts ofl/oswald and ofl/lato METADATA.pb and OFL.txt
- P: conventionalcommits.org content/v1.0.0/index.md
- P: semantic-release v25.0.8 lib/get-config.js, lib/definitions/constants.js, lib/get-next-version.js; registry https://registry.npmjs.org/semantic-release/25.0.8 ; semantic-release/git v11.0.1 README
- P: jhoblitt/conventions-claude .releaserc.yml, .github/workflows/release.yml, .github/workflows/commitlint.yml, .github/scripts/release-notes.sh (local clone, compared with remote main via gh api); rulesets via gh api (conventions-claude, rook-claude)
- P: github-conventions plugin references/new-repo.md, references/workflows.md, templates/dependabot.yml, templates/workflow-lint.yml
