# Feature: Session Execution View

## Purpose

The app should open directly into the first movement of the current plan.
There is no separate confirmation screen before training starts.

## Source File

- `src/App.jsx`

## Core Behavior

### Entry

- On app load, the engine generates a plan immediately
- The first visible screen is the first exercise in that plan

### Active Movement

The active movement screen contains:

- illustration placeholder
- movement name
- regression trigger
- instruction copy
- one central metric
- exercise count
- set progress

### Set Completion

- Pressing `CHECK` on a rep-based movement immediately completes that set
- If more sets remain, the app enters an intra-set rest state
- If the final set finishes, the app enters an inter-exercise rest state
- No extra confirmation tap is needed between exercises

### Time-Based Sets

- If the visible movement is time-based, `CHECK` starts the work timer instead of instantly completing the set
- While the timer is running, the center metric changes to a live countdown
- When the countdown ends, the set completes automatically and follows the same rest rules
- The bottom button is disabled while the countdown is running

### Rest State

- Every completed set enters a recovery state
- `restIntra` controls between-set rest on the same movement
- `restInter` controls the delay before moving to the next movement
- During rest, the bottom `CHECK` button is replaced by a circular countdown timer
- A `Skip Rest` button remains available
- The page background shifts to a pale blue tint while resting

### Set Transition Visibility

- The UI should visibly re-transition between sets even when the movement itself stays the same
- Same-exercise set changes and rest transitions are treated as meaningful state transitions, not silent number updates

### Completion State

- After the final movement, the app enters a completion panel
- Completion shows summary stats and phase mix
- Bottom action switches from `CHECK` to `REFRESH`

## Regression Model

### Auto Regression

- Comes from the engine when fatigue is low
- Uses `exercise.reg`
- Shows helper copy explaining that the downgrade was system-triggered

### Manual Regression

- Triggered by tapping the small arrow button
- Only affects the current movement
- Persists for the remainder of the current session

## State Reset Rules

These actions reset the active session back to movement 1:

- changing top tag filters
- pressing refresh
- regenerating the workout plan

These actions also clear:

- active work countdowns
- active rest countdowns
- per-session manual regressions

## Do Not Break

- Do not add a start screen before the first movement
- Do not require a second tap to advance after the final set
- Do not replace the single-focus screen with a multi-card list
- Do not make same-exercise set changes visually invisible
- Do not make rest feel like an untracked background process
