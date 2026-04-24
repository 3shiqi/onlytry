# Feature: Workout Engine

## Purpose

Generate a single workout plan that is:

- structured
- safe
- variable across refreshes
- still aligned with training intent

## Source Files

- `src/workoutEngine.js`
- `src/actionLibrary.js`

## Inputs

### Preferences

- `goal`
  - `strength`
  - `esd`
  - `mobility`
- `timeLimit`
  - `30`
  - `45`
  - `60`
- `fatigue`
  - `1` to `5`

### Library Metadata

Each exercise can carry:

- `phase`
- `pattern`
- `plane`
- `isNew`
- `difficulty`
- `reg`
- `sets`
- `reps`
- `weight`
- `restIntra`
- `restInter`

## Output Contract

`generateWorkout()` returns:

- `plan`
  - array of exercise objects in final order
- `tags`
  - theme
  - estimatedTime
  - difficultyStr
  - totalSets
- `summary`
  - goal
  - fatigue
  - timeLimit
  - phaseBreakdown

## Rules

### Phase Order

The returned plan must preserve this order:

1. `Warm-up`
2. `Power`
3. `Strength`
4. `Core`
5. `ESD`

### Slot Allocation

Current quota rules:

- `strength`
  - Warm-up 2
  - Power 1
  - Strength 3
  - Core 1
  - ESD 0
- `esd`
  - Warm-up 2
  - Power 1
  - Strength 1
  - Core 1
  - ESD 2
- `mobility`
  - Warm-up 4
  - Power 0
  - Strength 1
  - Core 2
  - ESD 0

### Fatigue Safety

If `fatigue <= 2`:

- remove `isNew === true`
- remove movements with `difficulty > 3`
- if a surviving movement has `reg`, mark it as auto-regressed in the returned plan

### Time Capping

The engine estimates capacity by sets, then trims lower-priority volume when the plan overshoots the target.

Current trim behavior:

- reduce sets from `ESD`, `Core`, `Warm-up`, `Strength`
- if reduction is not enough, drop later support movements in lower-priority phases

## Future Extension Points

- cooldown pool based on `lastPerformed`
- pattern-balance weighting
- injury flags
- left/right asymmetry logic
- equipment availability
- user history and progression rules

## When To Update This Doc

Update this file if any of these change:

- quota rules
- fatigue logic
- plan ordering
- metadata fields used by the engine
- time estimation or trimming rules
- rest metadata defaults in `src/actionLibrary.js`
