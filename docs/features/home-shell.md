# Feature: Home Shell, Play Logger, And Calendar

## Purpose

Turn the app into a dual-mode shell without breaking the existing training executor.

The shell now supports:

- a `Train / Play` mode switch
- a persistent bottom tab bar
- a Home route
- a Calendar route

## Source Files

- `src/App.jsx`
- `src/PlayLogger.jsx`
- `src/CalendarPage.jsx`
- `src/WorkoutExecutor.jsx`

## Shell Contract

### Top Control

- a subtle pill-shaped segmented control lives at the very top
- it toggles global `appMode`
- `TRAIN` routes Home to the workout executor
- `PLAY` routes Home to the play logger
- shell controls should rely on borders and contrast, not drop shadows

### Bottom Navigation

- global tab navigation stays fixed at the bottom
- current tabs:
  - `Home`
  - `Calendar`
- the tab bar must stay available regardless of `appMode`
- keep the nav visually quiet with outlines instead of floating shadows

## Home Route Behavior

### If `appMode === TRAIN`

- render the existing workout execution view
- preserve the current movement typography
- preserve the massive bottom action button
- preserve the current movement-first layout

### If `appMode === PLAY`

- render `PlayLogger`

## Play Logger Contract

The logger should stay visually minimal and match the app tone.

Required inputs:

- sport type as horizontally scrollable pill buttons
- duration slider from `10` to `180`
- RPE slider from `1` to `10`

Required action:

- bottom black button labeled `记录系统外运动 (LOG ACTIVITY)`

Required logic:

- calculate TSS using `calculatePlayTSS()`
- append an external log entry
- increase `currentTSS`
- show a lightweight success toast
- reset the form to defaults

## Calendar Route Contract

- render `CalendarPage`
- show current TSS as a system-load header
- show the rolling 7-day prescription timeline
- allow the Calendar route to reflect same-day play logging immediately

## Do Not Break

- Do not bury the segmented control inside the workout content
- Do not replace the training executor with a generic dashboard card layout
- Do not remove the massive bottom action from training mode
- Do not turn the logger into a multi-step wizard
