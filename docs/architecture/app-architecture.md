# App Architecture

## Purpose

`onlytry` is a mobile-first training session web app.
It now routes between structured training, external play logging, and a rolling prescription calendar inside one mobile shell.

## Runtime Layers

### 1. Data Layer

Files:

- `src/actionLibrary.js`
- `src/workoutEngine.js`
- `src/trainingSystem.js`
- `src/trainingDb.js`

Responsibilities:

- store the mock action library
- define movement metadata
- generate a workout plan from user preferences
- preserve CSCS phase ordering
- auto-regress movements under low fatigue conditions
- preserve per-movement rest timing metadata for the executor
- define the shared prescription taxonomy
- define pure TSS and periodization logic
- persist and query train / play logs through Dexie

### 2. Global Training State Layer

Files:

- `src/trainingState.jsx`
- `src/trainingDb.js`
- `src/main.jsx`

Responsibilities:

- track app-wide mode between `TRAIN` and `PLAY`
- track current stress score
- hydrate persisted play and train logs
- store external sport logs
- store completed in-app training logs
- derive a fluid 7-day prescription calendar from TSS
- expose a provider so future screens can share the same state

### 3. Home Shell And View Routing Layer

Files:

- `src/App.jsx`
- `src/PlayLogger.jsx`
- `src/CalendarPage.jsx`

Responsibilities:

- render the dual-mode segmented control
- render bottom tab navigation
- route Home between `TRAIN` and `PLAY`
- route Calendar to the monthly load / history view
- preserve the executor as one routed branch instead of flattening it into a dashboard

### 4. Session UI Layer

Files:

- `src/WorkoutExecutor.jsx`
- `src/PlayLogger.jsx`

Responsibilities:

- render the active session screen
- render the top tag controls
- track current exercise and current set
- track timed work countdown state for time-based movements only
- track a separate rest countdown state for intra-set and inter-exercise recovery
- apply per-exercise manual regression
- advance automatically to the next movement when all sets are done
- show completion state when the last movement ends
- write completed `TRAIN` sessions back into persistent history
- write external `PLAY` sessions back into persistent activity logs

### 5. Shell / Delivery Layer

Files:

- `src/main.jsx`
- `public/manifest.webmanifest`
- `public/sw.js`
- `scripts/patch-rollup-native.cjs`
- `package.json`

Responsibilities:

- boot the React app
- register the service worker
- support iPhone home screen install
- support production build on this machine despite Rollup native binary issues

## Data Flow

### Plan Generation Flow

1. `App.jsx` stores the current planning preferences
2. `generateWorkout()` receives `goal`, `timeLimit`, `fatigue`
3. The engine resolves either a legacy goal quota or a granular prescription quota
4. The engine filters the library and allocates movement slots by phase
5. The engine randomizes movement selection inside each phase
6. The engine returns:
   - `plan`
   - `tags`
   - `summary`

### Global State Flow

1. `TrainingStateProvider` mounts above `App`
2. `currentTSS` starts at `30`
3. External play sessions can be appended as structured logs
4. Each appended log can increase `currentTSS`
5. `calculateFluidCalendar()` derives a 7-day forward prescription array from `currentTSS`
6. `appMode` allows future screens to branch between structured training and sport-play logging
7. `logsVersion` gives screens a cheap re-render trigger when persisted log data changes
8. `CalendarPage` can combine persisted history with pure future projections without mutating the helpers

### Home Shell Flow

1. `App.jsx` reads global `appMode`
2. The top segmented control can switch between `TRAIN` and `PLAY`
3. The bottom tab bar switches between `Home` and `Calendar`
4. `Home + TRAIN` renders the workout executor
5. `Home + PLAY` renders the play logger
6. `Calendar` renders the monthly grid view plus day details

### Calendar Display Flow

1. `CalendarPage` reads `currentTSS` and `logsVersion`
2. `generateMonthData()` queries Dexie through `getMonthLogs(year, month)`
3. Past days map real logs into `COMPLETED` or `MISSED_OR_REST`
4. Today and future days use `buildProjectedCalendarSlots(currentTSS, totalDays)`
5. The page renders a Monday-first month grid plus a separate day-detail surface

### Session Execution Flow

1. The generated plan is immediately available on first render
2. `currentExerciseIndex` points to the visible movement
3. `currentSetIndex` counts completed sets for the visible movement
4. Pressing `CHECK` either starts a work timer or immediately marks the set complete
5. Only time-based movements start a live work countdown after `CHECK`
6. Every completed set enters a rest state using `restIntra` or `restInter`
7. Inter-exercise rest completion advances to the next movement automatically
8. Completing the final movement and final rest enters the completion panel
9. The completion effect persists a `TRAIN` history log and increases `currentTSS`

## Key Local State In `WorkoutExecutor.jsx`

- `preferences`
  - current planning criteria
- `activeMenu`
  - which top tag dropdown is open
- `sessionVersion`
  - forces animated refresh between regenerated plans
- `sessionBundle`
  - generated plan plus metadata
- `currentExerciseIndex`
  - current movement pointer
- `currentSetIndex`
  - set progress within the current movement
- `regressedExerciseIds`
  - manual regressions applied by the user during the session
- `workTimerState`
  - active countdown state for time-based sets
- `restState`
  - active recovery countdown, rest type, and post-rest transition target

## Core Constraints

- The user should not need a separate start or setup screen
- The plan must remain in CSCS phase order after generation
- The app should remain usable one-handed on a phone
- The main metric in the center should remain visually dominant
- Filter changes should reset the session back to the first movement
- Refresh should always reset the session back to the first movement
- Regeneration should clear both work and rest timers
- Historical calendar state should survive refreshes because it comes from Dexie, not component-only memory

## Known Technical Constraint

This machine currently has a Rollup native module signature conflict.
The repository includes `scripts/patch-rollup-native.cjs` to patch Rollup and fall back to the WASM implementation during install and build.
