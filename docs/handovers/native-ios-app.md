# Handover: Native iOS App

## Current State

`onlytry` now has a native SwiftUI + SwiftData scaffold under `ios/App`.

The native app is separate from the deployed web/PWA app:

- web production remains `https://onlytry.cc`
- native iOS is opened from `ios/App/App.xcodeproj`

## What Exists

The native app has three tabs:

- `Session`: reads local `Exercise` records and builds today's training session
- `Library`: browses and adds exercises with professional tags
- `Calendar`: shows a month grid and completed native training logs

The native app seeds a starter action library at app launch if SwiftData has no exercises.

## Key Files

- `ios/App/App/OnlytryApp.swift`: SwiftUI app entry, SwiftData container, root tabs, seed trigger
- `ios/App/App/ExerciseModel.swift`: V4 medical-grade SwiftData exercise model plus `SessionLog`
- `ios/App/App/ExerciseSeedData.swift`: starter exercise library
- `ios/App/App/WorkoutPlanner.swift`: CSCS order and quota-based workout generation
- `ios/App/App/SessionView.swift`: active training execution UI
- `ios/App/App/ExerciseLibraryView.swift`: library browsing, detail, and add flow
- `ios/App/App/TrainingCalendarView.swift`: native month grid and history list
- `ios/App/App.xcodeproj/project.pbxproj`: Xcode target wiring
- `IOS_SETUP.md`: user-facing open/build notes

## Current Native Data Shape

`Exercise` is the master model.

It contains:

- `id`
- `name`
- `aliases`
- `tags`
- `anatomy`
- `biomechanics`
- `programming`
- `logistics`
- `clinical`
- `coaching`
- `media`

Nested module structs are `Codable` value types stored inside SwiftData.

`SessionLog` stores:

- completed date
- session theme
- exercise names
- completed set count

## Current Planner Behavior

`WorkoutPlanner.todayPlan(from:)` creates today's training session by:

1. walking fixed phase order: `Warm-up`, `Power`, `Strength`, `Core`, `ESD`, `Hypertrophy`
2. applying default quota: Warm-up 2, Power 1, Strength 3, Core 1
3. filtering exercises whose `programming.phaseCompatibility` contains the phase
4. sorting by lower `programming.cnsCost`
5. using exercise name as a tie-breaker
6. assigning default set and prescription values from phase and tracking metrics

There is no randomness yet. This is intentional for the first native scaffold so that behavior is easy to verify.

## Current Seed Library

Seeded exercises:

- `翻书 (Open Book)`
- `90/90 髋转换`
- `药球侧抛`
- `单腿硬拉`
- `保加利亚分腿蹲`
- `单臂划船`
- `死虫抗阻`

These cover the current default CSCS quota.

## Known Gaps

- Native planner does not yet support the web app's dynamic tag filters, TSS, Play mode, rest timers, or regression toggle.
- Native Calendar only reads `SessionLog`; it does not yet merge Play logs or future projections.
- Native add-exercise form captures the most important fields but not every V4 model field.
- Command-line `xcodebuild` cannot be trusted on this Mac until Xcode tooling is repaired.

## Recommended Next Native Milestones

1. Add regression support by storing `regressionIds` relationships and resolving them in `SessionView`.
2. Add timer/rest-state parity with the web executor.
3. Port dynamic periodization/TSS from the web state layer into native Swift.
4. Add `PlayLog` SwiftData model and merge it into Calendar.
5. Expand `AddExerciseView` to cover full anatomy, clinical, coaching, and media fields.

## Build And Verification

Open:

- `ios/App/App.xcodeproj`

In Xcode:

1. choose the `App` target
2. set Apple Developer Team if needed
3. select an iOS 17+ simulator or connected iPhone
4. build and run

Validated without Xcode build:

- plist/project syntax via `plutil`
- web build via `npm run build`
- version sync via `npm run version:check`

Blocked:

- CLI `xcodebuild` fails on this machine because Xcode's local libraries are broken

## Maintenance Rule

Any future native iOS code change should update:

- `docs/features/native-ios-app.md`
- `docs/CHANGELOG.md`
- release note if version changes

For algorithm changes, also update:

- `docs/handovers/native-ios-app.md`
