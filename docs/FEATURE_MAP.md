# Feature Map

Use this file first when you want to change one isolated behavior.

## Feature To Code Map

| Feature | Primary Code Files | Primary Doc |
| :--- | :--- | :--- |
| Dual-mode home shell and routed views | `src/App.jsx`, `src/PlayLogger.jsx`, `src/CalendarPage.jsx`, `src/WorkoutExecutor.jsx` | `features/home-shell.md` |
| Calendar system load and 7-day timeline | `src/CalendarPage.jsx`, `src/trainingState.jsx`, `src/trainingSystem.js` | `features/calendar-page.md` |
| Adaptive workout engine | `src/workoutEngine.js`, `src/actionLibrary.js` | `features/workout-engine.md` |
| Dual-mode training state and periodization | `src/trainingSystem.js`, `src/trainingState.jsx`, `src/main.jsx`, `src/workoutEngine.js` | `features/training-state.md` |
| Active session execution view | `src/WorkoutExecutor.jsx` | `features/session-execution.md` |
| Top tag filters and refresh behavior | `src/WorkoutExecutor.jsx` | `features/top-tag-filters.md` |
| PWA install and deployment | `src/main.jsx`, `public/*`, `scripts/patch-rollup-native.cjs`, `package.json` | `features/pwa-and-deployment.md` |
| App architecture and state model | `src/App.jsx`, `src/WorkoutExecutor.jsx`, `src/PlayLogger.jsx`, `src/CalendarPage.jsx`, `src/main.jsx`, `src/trainingState.jsx`, `src/trainingSystem.js`, `src/workoutEngine.js`, `src/actionLibrary.js` | `architecture/app-architecture.md` |
| UI rules and interaction language | `src/App.jsx`, `src/WorkoutExecutor.jsx`, `src/PlayLogger.jsx`, `src/CalendarPage.jsx`, `src/index.css` | `design/experience-spec.md` |
| Formal version management | `VERSION`, `package.json`, `package-lock.json`, `scripts/check-version-sync.cjs` | `process/versioning-policy.md` |

## Update Rules

- If a change touches one file in the table, update the linked doc
- If a change affects multiple features, update all linked docs that changed behavior
- If a change alters project workflow, also update `process/doc-sync-workflow.md`
- Every user-visible change should add one short note to `CHANGELOG.md`
