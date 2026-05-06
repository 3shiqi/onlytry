# Handover: Workout Planning Algorithm

## Purpose

This document explains how one `TRAIN` session is generated today, where each rule lives in code, and how to safely change the algorithm later.

Primary source files:

- `src/workoutEngine.js`
- `src/trainingSystem.js`
- `src/actionLibrary.js`

## Current Scope

This handover is only about **single-session workout generation**.

It does **not** control:

- calendar projection
- TSS-based future day planning
- play logging
- rest countdown UI behavior during execution

Those systems consume the workout output later, but do not decide the session plan itself.

## Current Entry Point

The active generator is:

- `generateWorkout(library, preferences, filters)` in `src/workoutEngine.js`

The executor currently boots with:

- `defaultPreferences = { goal: 'strength', timeLimit: 30, fatigue: 4 }`
- `reservedFilters = { phase: null, pattern: null, plane: null, isNew: null }`

So the default launch behavior is:

- strength-oriented
- 30-minute target
- medium fatigue
- no extra filtering

## Mental Model

The current algorithm is best understood as:

1. Resolve target quota from the selected goal
2. Filter the action library
3. Apply fatigue safety
4. Randomly draw actions inside each CSCS phase
5. Trim volume if the session is too long
6. Return the final plan plus summary tags

This is a **quota-first random sampler**, not a progression engine.

## Full Flow

### 1. Inputs

`generateWorkout()` accepts:

- `library`
- `preferences`
- `filters`

Current `preferences` fields:

- `goal`
- `timeLimit`
- `fatigue`

Current `filters` fields:

- `phase`
- `pattern`
- `plane`
- `isNew`

## 2. Resolve Goal Into Phase Quota

The generator first decides how many actions to take from each CSCS phase.

Two sources exist:

- legacy goals in `legacyQuotaMap`
- granular prescriptions from `PRESCRIPTIONS` in `src/trainingSystem.js`

### Legacy quotas

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

### Prescription quotas

If `goal` matches a key in `PRESCRIPTIONS`, the engine prefers that mapping.

Example:

- `上肢力量 (Upper Strength)` resolves to:
  - pattern `Push/Pull`
  - quota `warmup 2 / strength 4 / core 1`

`normalizeCscsQuota()` converts lower-case keys like `warmup` and `esd` into engine phase keys like `Warm-up` and `ESD`.

## 3. Filter The Library

The engine next calls `applyWorkoutFilters()`.

Current filter behavior:

- `null`, empty string, or empty array means "ignore this filter"
- `phase` supports both a single string and an array
- actions with comma-separated phases are normalized by `normalizePhase()`

Important:

- the UI currently keeps this filter surface mostly reserved
- the filter hook already exists, so more advanced filtering can be added without changing the generator shape

## 4. Apply Fatigue Safety

If `fatigue <= 2`, the engine narrows the usable library:

- remove `isNew === true`
- remove actions with `difficulty > 3`

Then, for actions that still survive:

- if `exercise.reg` exists, the returned plan marks the action with:
  - `autoRegressed: true`
  - `note: '系统因疲劳自动降阶'`

Important nuance:

- the engine does **not** overwrite `exercise.name`
- the UI layer decides to render `exercise.reg` instead of `exercise.name` when `autoRegressed` is true

Fallback behavior:

- if fatigue filtering removes everything, the engine falls back to the original filtered library instead of returning an empty plan

## 5. Draw Actions By Phase

The plan order is locked by:

- `phaseOrder = ['Warm-up', 'Power', 'Strength', 'Core', 'ESD']`

For each phase:

1. read how many actions are needed from the quota
2. find available actions in that phase
3. exclude actions already used in this session
4. shuffle the candidates
5. take the first `N`

This gives:

- stable macro structure
- variation inside each phase
- no duplicate action ids in the same session

Important limitations:

- there is no pattern balancing inside a phase
- there is no historical cooldown
- there is no left/right asymmetry logic
- there is no injury-aware exclusion layer yet

## 6. Time Cap The Session

After the initial plan is assembled, the engine trims it to fit `timeLimit`.

### Set-based capacity model

The session uses a rough capacity model:

- `maxSets = max(8, floor(timeLimit / 1.5))`

This means:

- 30 minutes -> about 20 sets
- 45 minutes -> about 30 sets
- 60 minutes -> about 40 sets

### Estimated duration

Reported estimated time is:

- `round(totalSets * 1.5 + 3)`

So each set is treated as roughly 1.5 minutes, then a small fixed buffer is added.

### Trim order

If total sets exceed capacity:

1. reduce sets one by one from:
   - `ESD`
   - `Core`
   - `Warm-up`
   - `Strength`
2. if more reduction is still needed, drop whole actions from:
   - `ESD`
   - `Core`
   - `Warm-up`

Important:

- `Power` is intentionally protected from trimming
- `Strength` can lose sets but is not dropped in the second pass
- trimming walks from the back of the plan, so later support work is the first to be cut

## 7. Output

The generator returns:

- `plan`
- `tags`
- `summary`

### `plan`

Final ordered actions after fatigue logic and time trimming.

### `tags`

- `theme`
- `estimatedTime`
- `difficultyStr`
- `totalSets`

`difficultyStr` is based on average action difficulty:

- `>= 4` -> `困难`
- `>= 2.5` -> `适中`
- else -> `恢复`

### `summary`

- `goal`
- `fatigue`
- `timeLimit`
- `prescriptionPattern`
- `phaseBreakdown`

`phaseBreakdown` is what the completion screen uses to describe the final session composition.

## Pseudocode

```text
function generateWorkout(library, preferences, filters):
  mergedPreferences = defaults + preferences
  quota = resolveQuota(goal)
  filteredLibrary = applyWorkoutFilters(library, filters)

  if fatigue <= 2:
    safeLibrary = remove new and high-difficulty actions
  else:
    safeLibrary = filteredLibrary

  usableLibrary = safeLibrary if not empty else filteredLibrary

  generatedPlan = []
  usedIds = new Set()

  for phase in phaseOrder:
    neededCount = quota[phase]
    available = usableLibrary in this phase and not already used
    selected = shuffle(available).slice(0, neededCount)
    add selected actions to generatedPlan

  timeCappedPlan = trimPlanToTime(generatedPlan, timeLimit)
  derive tags and summary
  return plan + tags + summary
```

## Where To Change What

### If you want to change session composition

Edit:

- `legacyQuotaMap` in `src/workoutEngine.js`
- or `PRESCRIPTIONS` in `src/trainingSystem.js`

### If you want to add a new goal

Edit:

- `PRESCRIPTIONS` in `src/trainingSystem.js`
- any matching UI option source

If the goal should keep the old short-form style, add:

- quota mapping
- theme mapping

### If you want stricter fatigue protection

Edit:

- fatigue gate in `generateWorkout()`

Typical changes:

- lower allowed `difficulty`
- exclude specific `pattern`s
- exclude `isNew`
- force stronger regression behavior

### If you want true regression replacement at engine level

Right now regression is only marked, not rewritten.

If you really want data-level replacement:

- modify the action object before `generatedPlan.push()`

Be careful:

- the UI currently expects both `name` and `reg` to remain available
- replacing `name` directly may break future analytics or summary logic

### If you want less repetitive refreshes

You will need a history-aware layer.

Recommended next step:

- add `lastPerformed`
- rank candidates before shuffle
- avoid selecting actions used in the last `N` days

This should happen before `slice(0, neededCount)`.

### If you want more professional balancing

The current algorithm is not balancing by movement pattern density.

A likely next iteration is:

1. phase quota first
2. pattern weighting second
3. random draw third

That would reduce cases like:

- too many hinge-dominant lower-body choices
- too little pull volume across the final session

## Known Limitations

- no deterministic seed for reproducible sessions
- no library shortage warning when quota cannot be fully satisfied
- no progressive overload logic
- no injury-specific exclusion layer
- no equipment constraints
- no coupling between `currentTSS` and same-day session generation
- no de-duplication by movement family beyond raw action id

## Recommended Safe Edit Order

When changing this system later:

1. update `docs/features/workout-engine.md`
2. update this handover doc if the algorithm shape changed
3. change `src/workoutEngine.js`
4. if goal taxonomy changed, also update `src/trainingSystem.js`
5. smoke test:
   - default strength session
   - one low-fatigue session
   - one short-duration session
   - one granular prescription goal

## Quick Review Checklist

Before shipping algorithm changes, verify:

- CSCS phase order is still preserved
- no duplicate exercise ids appear in one session
- fatigue safety still has a fallback path
- time trimming does not accidentally delete the entire session
- `tags.totalSets` matches the final trimmed plan
- `summary.phaseBreakdown` matches what the UI actually renders

## Related Docs

- `docs/features/workout-engine.md`
- `docs/features/training-state.md`
- `docs/architecture/app-architecture.md`
