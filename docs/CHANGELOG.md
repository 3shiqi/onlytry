# Changelog

This file tracks human-readable project history by semantic version.
Git remains the detailed source of truth.

## [0.5.0] - 2026-04-24

### Added

- a dedicated `CalendarPage` with a de-UI system-load header and 7-day timeline
- same-day play-log rendering on `Day 1` with a checked logged-state row

### Changed

- the Calendar tab now forces `Day 2` into recovery after a same-day play log
- future calendar days now shift behind the recovery slot to make the timeline visibly more conservative

## [0.4.0] - 2026-04-24

### Added

- dual-mode home shell with a segmented `Train / Play` switch
- global bottom tab navigation for `Home` and `Calendar`
- a minimalist `PlayLogger` flow with sport pills, sliders, TSS logging, and success toast
- a calendar screen for rolling 7-day prescriptions and recent play logs

### Changed

- the training executor now lives inside `TRAIN` mode while preserving its existing movement-first layout

## [0.3.0] - 2026-04-24

### Added

- global training state provider with `currentTSS`, `externalLogs`, and `appMode`
- pure TSS and dynamic periodization helpers for play load and 7-day calendar generation
- granular `PRESCRIPTIONS` taxonomy for ankle, mobility, upper/lower structure, power, and ESD goals

### Changed

- app boot now mounts through `TrainingStateProvider`
- workout quota resolution now supports both legacy goals and prescription-driven CSCS quotas

## [0.2.1] - 2026-04-24

### Changed

- added a canonical-host redirect so `www.onlytry.cc` immediately redirects to `onlytry.cc`
- linked `www.onlytry.cc` to the Cloudflare Pages project so both hostnames can resolve to the app

## [0.2.0] - 2026-04-24

### Added

- explicit rest-state execution flow driven by per-action `restIntra` and `restInter` values
- circular bottom rest countdown with a `Skip Rest` escape hatch
- pale blue recovery surface shift during rest

### Changed

- only time-based movements now run a work countdown after pressing `CHECK`
- rep-based movements now mark the set complete first, then enter intra-set or inter-exercise rest automatically
- finishing the last set of an exercise now waits through inter-exercise rest before sliding forward
- refresh and top-tag regeneration now clear both work and rest timers before returning to exercise 1

## [0.1.0] - 2026-04-24

### Added

- Formal version management with a root `VERSION` file, synced package version, release notes, and a version policy
- Structured documentation system under `docs/`
- Feature-level documents for workout generation, session execution, top tag filters, and deployment
- Direct timer mode for time-based exercises

### Changed

- App opens directly into the first programmed exercise
- Refresh always returns the user to the first exercise in the regenerated plan
- Same exercise across different sets now has a visible UI transition
- Time-based exercises now start a live countdown immediately after pressing `CHECK`
- Top tag filters continue to drive plan generation from the active session screen
- Build workflow includes a persistent Rollup WASM fallback patch through `scripts/patch-rollup-native.cjs`
