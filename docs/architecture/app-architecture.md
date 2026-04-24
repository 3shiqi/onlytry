# App Architecture

## Purpose

`onlytry` is a mobile-first training session web app.
It generates a safe, structured workout plan and immediately drops the user into the current movement.

## Runtime Layers

### 1. Data Layer

Files:

- `src/actionLibrary.js`
- `src/workoutEngine.js`

Responsibilities:

- store the mock action library
- define movement metadata
- generate a workout plan from user preferences
- preserve CSCS phase ordering
- auto-regress movements under low fatigue conditions
- preserve per-movement rest timing metadata for the executor

### 2. Session UI Layer

Files:

- `src/App.jsx`

Responsibilities:

- render the active session screen
- render the top tag controls
- track current exercise and current set
- track timed work countdown state for time-based movements only
- track a separate rest countdown state for intra-set and inter-exercise recovery
- apply per-exercise manual regression
- advance automatically to the next movement when all sets are done
- show completion state when the last movement ends

### 3. Shell / Delivery Layer

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
3. The engine filters the library and allocates movement slots by phase
4. The engine randomizes movement selection inside each phase
5. The engine returns:
   - `plan`
   - `tags`
   - `summary`

### Session Execution Flow

1. The generated plan is immediately available on first render
2. `currentExerciseIndex` points to the visible movement
3. `currentSetIndex` counts completed sets for the visible movement
4. Pressing `CHECK` either starts a work timer or immediately marks the set complete
5. Only time-based movements start a live work countdown after `CHECK`
6. Every completed set enters a rest state using `restIntra` or `restInter`
7. Inter-exercise rest completion advances to the next movement automatically
8. Completing the final movement and final rest enters the completion panel

## Key Local State In `App.jsx`

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

## Known Technical Constraint

This machine currently has a Rollup native module signature conflict.
The repository includes `scripts/patch-rollup-native.cjs` to patch Rollup and fall back to the WASM implementation during install and build.
