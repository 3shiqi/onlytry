# Feature: Training State And Periodization

## Purpose

Create one global source of truth for:

- app mode
- external play load
- dynamic stress tracking
- 7-day forward prescription logic
- granular backend-ready training categories

## Source Files

- `src/trainingSystem.js`
- `src/trainingState.jsx`
- `src/main.jsx`
- `src/workoutEngine.js`

## Global State Contract

The provider exposes these core fields:

- `currentTSS`
  - default `30`
- `externalLogs`
  - default `[]`
  - entry shape: `{ date, sportType, duration, rpe, tssEarned }`
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
- represents a forward-looking week, starting with tomorrow
- if `tss > 80`, tomorrow must be `无痛重启 (Recovery)`
- if `tss > 50`, tomorrow must be `足踝稳定/肩胸功能`

## Do Not Break

- Keep `TRAIN` and `PLAY` enum values exact
- Keep `currentTSS` defaulted to `30`
- Keep `externalLogs` entry keys stable
- Keep `calculateFluidCalendar()` returning exactly `7` strings
- Keep the tomorrow override rules for `tss > 50` and `tss > 80`
- Do not move the provider below `App` in the tree
