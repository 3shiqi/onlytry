# Feature: Top Tag Filters

## Purpose

The top row is the lightweight planning surface for the current workout.
It replaces a separate setup screen.

## Source File

- `src/App.jsx`

## Current Tags

The current implementation exposes three plan tags:

- `goal`
- `timeLimit`
- `fatigue`

These are planning tags, not movement metadata tags.

## Layout Contract

- Tags sit at the top of the page
- Tags are left-aligned in a single horizontal row
- Refresh icon button is on the far right
- Only one dropdown menu can be open at a time

## Behavior

### Open

- Tapping a tag opens its dropdown
- Tapping the same tag again closes it
- Tapping another tag switches the open dropdown

### Select

- Choosing an option regenerates the plan immediately
- The session resets to the first exercise
- The dropdown closes automatically
- Any active work timer or rest timer is cleared

### Refresh

- Refresh keeps the same tag values
- Refresh re-randomizes the session plan
- Refresh returns the user to the first exercise
- Refresh closes any open dropdown
- Refresh clears active work and rest countdowns

## Future Direction

If later you want true action-library metadata filters, this file should be updated first.

Examples:

- `phase`
- `pattern`
- `plane`
- `isNew`

That future change would also require updates to:

- `src/workoutEngine.js`
- `docs/features/workout-engine.md`
- `docs/FEATURE_MAP.md`

## Do Not Break

- The top row should remain compact
- Refresh should stay visually separate from the tags
- Tag selection should remain faster than opening a full modal
