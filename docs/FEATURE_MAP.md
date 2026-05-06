# Feature Map

Use this file first when you want to change one isolated behavior.

## Feature To Code Map

| Feature | Primary Code Files | Primary Doc |
| :--- | :--- | :--- |
| Dual-mode home shell and routed views | `src/App.jsx`, `src/PlayLogger.jsx`, `src/CalendarPage.jsx`, `src/WorkoutExecutor.jsx` | `features/home-shell.md` |
| Calendar system load, monthly grid, and day details | `src/CalendarPage.jsx`, `src/trainingDb.js`, `src/trainingState.jsx`, `src/trainingSystem.js` | `features/calendar-page.md` |
| Adaptive workout engine | `src/workoutEngine.js`, `src/actionLibrary.js` | `features/workout-engine.md` |
| Dual-mode training state, persistence, and periodization | `src/trainingSystem.js`, `src/trainingState.jsx`, `src/trainingDb.js`, `src/main.jsx`, `src/workoutEngine.js` | `features/training-state.md` |
| Active session execution view | `src/WorkoutExecutor.jsx`, `src/trainingState.jsx`, `src/trainingSystem.js` | `features/session-execution.md` |
| Top tag filters and refresh behavior | `src/WorkoutExecutor.jsx` | `features/top-tag-filters.md` |
| PWA install, native iOS scaffold, and deployment | `src/main.jsx`, `public/*`, `ios/App/**`, `scripts/patch-rollup-native.cjs`, `package.json` | `features/pwa-and-deployment.md` |
| Native iOS Session, Library, Calendar, SwiftData model, and planner | `ios/App/App/OnlytryApp.swift`, `ios/App/App/ExerciseModel.swift`, `ios/App/App/ExerciseSeedData.swift`, `ios/App/App/WorkoutPlanner.swift`, `ios/App/App/SessionView.swift`, `ios/App/App/ExerciseLibraryView.swift`, `ios/App/App/TrainingCalendarView.swift`, `ios/App/App/Info.plist`, `ios/App/App.xcodeproj/project.pbxproj`, `ios/App/Podfile` | `features/native-ios-app.md` |
| App architecture and state model | `src/App.jsx`, `src/WorkoutExecutor.jsx`, `src/PlayLogger.jsx`, `src/CalendarPage.jsx`, `src/main.jsx`, `src/trainingState.jsx`, `src/trainingSystem.js`, `src/trainingDb.js`, `src/workoutEngine.js`, `src/actionLibrary.js` | `architecture/app-architecture.md` |
| UI rules and interaction language | `src/App.jsx`, `src/WorkoutExecutor.jsx`, `src/PlayLogger.jsx`, `src/CalendarPage.jsx`, `src/index.css` | `design/experience-spec.md` |
| Formal version management | `VERSION`, `package.json`, `package-lock.json`, `scripts/check-version-sync.cjs` | `process/versioning-policy.md` |

## Update Rules

- If a change touches one file in the table, update the linked doc
- If a change affects multiple features, update all linked docs that changed behavior
- If a change alters project workflow, also update `process/doc-sync-workflow.md`
- Every user-visible change should add one short note to `CHANGELOG.md`
