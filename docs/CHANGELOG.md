# Changelog

This file tracks human-readable project history by semantic version.
Git remains the detailed source of truth.

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
