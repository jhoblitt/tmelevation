# Research ledger

Dispatched 2026-10-08 during brainstorming (read-only research; no product code).

| Agent | Topic | Output | Notes | Status |
|-------|-------|--------|-------|--------|
| aero    | golf-ball aerodynamic model (drag/lift/spin decay), ODE, calibration | docs/research/aero-model.md | docs/research/aero-model.md.notes.md | complete 2026-10-08 |
| atmos   | elevation<->pressure, air density, pressure units, TrackMan normalization conditions | docs/research/atmosphere.md | docs/research/atmosphere.md.notes.md | complete 2026-10-08 |
| refdata | published altitude-effect data for sanity checks | docs/research/reference-data.md | docs/research/reference-data.md.notes.md | complete 2026-10-08 |

## Adversarial review of the spec (dispatched 2026-10-08)

Target: docs/superpowers/specs/2026-10-08-tmelevation-design.md

| Agent | Mandate | Output | Notes | Status |
|-------|---------|--------|-------|--------|
| physics  | re-implement model from spec; attack physics, calibration, oracles | docs/reviews/spec-2026-10-08/physics.md | docs/reviews/spec-2026-10-08/physics.md.notes.md | complete 2026-10-08 |
| claims   | verify every factual claim/citation against primary sources | docs/reviews/spec-2026-10-08/claims.md | docs/reviews/spec-2026-10-08/claims.md.notes.md | complete 2026-10-08 |
| ux       | UI/mobile/a11y/linked inputs; requirements traceability | docs/reviews/spec-2026-10-08/ux.md | docs/reviews/spec-2026-10-08/ux.md.notes.md | complete 2026-10-08 |
| delivery | CI/release/deploy/security/licensing/conventions | docs/reviews/spec-2026-10-08/delivery.md | docs/reviews/spec-2026-10-08/delivery.md.notes.md | complete 2026-10-08 |
| physics-lit | literature attack on Re-free choice and land-angle offset | docs/reviews/spec-2026-10-08/physics-lit.md | docs/reviews/spec-2026-10-08/physics-lit.md.notes.md | complete 2026-10-08 |
| secperf  | site security (CSP) and performance budgets | docs/reviews/spec-2026-10-08/secperf.md | docs/reviews/spec-2026-10-08/secperf.md.notes.md | complete 2026-10-08 |

(User lifted the subagent cap to 6 for this review only, 2026-10-08.)

## Adversarial review of the implementation plan (dispatched 2026-10-08)

Target: docs/superpowers/plans/2026-10-08-tmelevation.md (against the approved spec)

| Agent | Mandate | Output | Notes | Status |
|-------|---------|--------|-------|--------|
| coverage | spec coverage, seam consistency, expected values, executability | docs/reviews/plan-2026-10-08/coverage.md | docs/reviews/plan-2026-10-08/coverage.md.notes.md | complete 2026-10-08 |
| delivery | Tasks 1, 13, 14: GitHub API calls, workflows, release/deploy chain | docs/reviews/plan-2026-10-08/delivery.md | docs/reviews/plan-2026-10-08/delivery.md.notes.md | complete 2026-10-08 |
| browser  | Tasks 10-12: CDP harness, load-failure handling, e2e feasibility | docs/reviews/plan-2026-10-08/browser.md | docs/reviews/plan-2026-10-08/browser.md.notes.md | complete 2026-10-08 |

## Land-angle model spike (dispatched 2026-10-09)

Brief: docs/research/land-angle-spike/BRIEF.md. Research only; no product code.

| Agent | Mandate | Output | Notes | Status |
|-------|---------|--------|-------|--------|
| aero-data  | measured C_D/C_L(Re, S), spin decay, independent trajectories and altitude data | docs/research/land-angle-spike/aero-data.md | docs/research/land-angle-spike/aero-data.md.notes.md | complete 2026-10-09 |
| model-fits | fitting harness; model families fitted to carry, height and land angle | docs/research/land-angle-spike/model-fits.md | docs/research/land-angle-spike/model-fits.md.notes.md | complete 2026-10-09 |
| provenance | how TrackMan's land angle is measured or extrapolated; table provenance | docs/research/land-angle-spike/provenance.md | docs/research/land-angle-spike/provenance.md.notes.md | complete 2026-10-09 |

Synthesis: docs/research/land-angle-spike/SYNTHESIS.md (coordinator, 2026-10-09).
