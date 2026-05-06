# iOS App Notes

The iOS target is now a native SwiftUI + SwiftData app scaffold.

Current app defaults:

- App name: `Onlytry`
- Bundle ID: `com.sunshiqi.onlytry`
- Marketing version: `0.7.0`
- Minimum iOS: `17.0`

## Native Structure

Primary iOS files:

- `ios/App/App/OnlytryApp.swift`
- `ios/App/App/ExerciseModel.swift`
- `ios/App/App/ExerciseSeedData.swift`
- `ios/App/App/WorkoutPlanner.swift`
- `ios/App/App/SessionView.swift`
- `ios/App/App/ExerciseLibraryView.swift`
- `ios/App/App/TrainingCalendarView.swift`

Current tabs:

- `Session`
  - reads exercises from SwiftData
  - generates a simple today plan
  - logs completed sessions
- `Library`
  - shows the SwiftData exercise library
  - supports adding new tagged exercises
  - displays coaching cues and clinical guardrails
- `Calendar`
  - shows a monthly grid
  - highlights logged training days

## Data Model

The action library uses `SwiftData` with the V4 medical-grade model:

- `Exercise`
- `AnatomyData`
- `BiomechanicsData`
- `ProgrammingData`
- `LogisticsData`
- `ClinicalData`
- `CoachingData`
- `MediaData`
- `SessionLog`

The included seed data inserts several real exercises, including `保加利亚分腿蹲`.

## How To Open

Open the native project:

- `ios/App/App.xcodeproj`

The current native target does not require CocoaPods.

Then in Xcode:

1. Set your Apple Developer team under Signing & Capabilities
2. Choose an iOS 17+ simulator or connected device
3. Build and run
4. Archive for TestFlight when ready

## Important Notes

- The old web app still exists under `src/` and can still deploy to Cloudflare Pages.
- The native iOS app is no longer launched through the Capacitor storyboard bridge.
- The native target no longer includes the old Capacitor `public`, `config.xml`, or `Main.storyboard` files as build resources.
- This Mac currently has an Xcode command-line library issue, so command-line `xcodebuild` validation may fail even when the project files are syntactically valid.

## Maintenance Docs

Native iOS implementation notes:

- `docs/features/native-ios-app.md`
- `docs/handovers/native-ios-app.md`
