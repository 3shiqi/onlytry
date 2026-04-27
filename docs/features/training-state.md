# Feature: Training State And Periodization

## Purpose

Create one global source of truth for:

- app mode
- external play load
- completed train load
- dynamic stress tracking
- projected calendar logic
- granular backend-ready training categories

## Source Files

- `src/trainingSystem.js`
- `src/trainingState.jsx`
- `src/trainingDb.js`
- `src/main.jsx`
- `src/workoutEngine.js`
- `src/WorkoutExecutor.jsx`
- `src/PlayLogger.jsx`

## Global State Contract

The provider exposes these core fields:

- `currentTSS`
  - default `30`
- `activityLogs`
  - default `[]`
  - entry shape: `{ date, sportType, duration, rpe, tssEarned }`
- `historyLogs`
  - default `[]`
  - entry shape: `{ date, theme, goal, difficultyStr, estimatedTime, totalSets, tssEarned }`
- `logsVersion`
  - increments whenever persisted logs change
- `appMode`
  - `TRAIN`
  - `PLAY`
  - default `TRAIN`

## Provider Contract

`TrainingStateProvider` wraps the app root in `src/main.jsx`.

`useTrainingState()` returns:

- raw state values
- setters for `currentTSS`, `externalLogs`, `appMode`
- `appendExternalLog()`
- `appendHistoryLog()`
- `resetTrainingState()`
- derived `fluidCalendar`
- `trainingPrescriptions`

## Prescriptions Taxonomy

`PRESCRIPTIONS` maps human-readable goals to backend parameters:

- `足踝稳定 (Ankle Stability)` -> `Stability`, quota `warmup 3 / strength 2 / core 1`
- `肩胸功能 (Upper Mobility)` -> `Mobility`, quota `warmup 3 / strength 2 / core 1`
- `上肢力量 (Upper Strength)` -> `Push/Pull`, quota `warmup 2 / strength 4 / core 1`
- `下肢结构 (Lower Structure)` -> `Squat/Hinge`, quota `warmup 2 / strength 4 / core 1`
- `动力链爆发 (Power)` -> `Plyo/Rotation`, quota `warmup 2 / power 3 / strength 1`
- `心肺引擎 (ESD)` -> `Locomotion`, quota `warmup 2 / esd 4`

The engine can already consume these goals for quota resolution even before the UI exposes them.

## Pure Logic Functions

### `calculatePlayTSS(durationMins, rpe)`

- returns `(durationMins * rpe) / 5`
- accepts numeric or numeric-like input
- normalizes invalid input to `0`

### `calculateFluidCalendar(tss)`

- returns an array of `7` strings
- represents the base 7-slot prescription band used by projected calendar views
- if `tss > 80`, tomorrow must be `无痛重启 (Recovery)`
- if `tss > 50`, tomorrow must be `足踝稳定/肩胸功能`
- inserts automatic rest cadence so the system does not schedule training every day

### `buildProjectedCalendarSlots(tss, totalDays)`

- expands the 7-slot base cadence into as many future days as the calendar screen needs
- repeats the cadence safely for longer month tails

### `calculateTrainTSS(sessionSummary)`

- derives a training-load estimate from session duration, sets, and difficulty label
- is used when a completed `TRAIN` session is written into history

## Persistence Contract

Persisted logs live in Dexie:

- `history`
  - completed in-app training sessions
- `activityLogs`
  - system-external play sessions

`currentTSS` remains mirrored in `localStorage` so the load bar is immediately available on boot.

Hydration rules:

- provider mount reads both Dexie tables through `getAllLogs()`
- hydrated logs update `historyLogs`, `activityLogs`, and `logsVersion`
- append helpers write to Dexie first, then sync React state

Compatibility rule:

- `externalLogs` remains exposed as an alias of `activityLogs` so existing consumers do not break

## Calendar Consumer Rule

`CalendarPage` consumes `currentTSS`, `logsVersion`, and projected calendar helpers together.

The page is responsible for:

- reading month-specific historical logs from Dexie
- deciding whether a date is `COMPLETED`, `MISSED_OR_REST`, `PLANNED`, or `REST_OR_EMPTY`
- keeping historical state in the calendar layer rather than polluting the pure engine

## Do Not Break

- Keep `TRAIN` and `PLAY` enum values exact
- Keep `currentTSS` defaulted to `30`
- Keep `activityLogs` / `externalLogs` entry keys stable
- Keep `historyLogs` entry keys stable
- Keep `calculateFluidCalendar()` returning exactly `7` strings
- Keep the tomorrow override rules for `tss > 50` and `tss > 80`
- Keep Dexie table names `history` and `activityLogs`
- Do not move the provider below `App` in the tree
