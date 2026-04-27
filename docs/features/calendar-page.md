# Feature: Calendar Page

## Purpose

Turn the Calendar tab into a monthly operating view that merges real history with projected future planning.

The page should answer three questions immediately:

- how stressed the system is right now
- what actually happened earlier this month
- what the next planned training / rest cadence looks like from today forward

## Source Files

- `src/CalendarPage.jsx`
- `src/trainingState.jsx`
- `src/trainingSystem.js`
- `src/trainingDb.js`

## Header Contract

The top section is a system-status readout, not a dashboard card.

Required elements:

- title `SYSTEM LOAD (系统负荷)`
- a thin horizontal progress bar driven by `currentTSS`
- status text `Current TSS: {value} / 100`

Color thresholds:

- below `40` -> green
- `40` to `70` -> yellow
- above `70` -> red

## Month Grid Contract

The main section is a Monday-first monthly grid.

Required behavior:

- use a 7-column layout with weekday headers `M T W T F S S`
- pad leading and trailing filler cells so the grid keeps its calendar structure
- show one tap target per real day
- keep the layout free of boxed cards and drop shadows
- keep `today` visible via a crisp black ring

The grid data is built by `generateMonthData(year, month, options)`.

## Time Divide Contract

The page splits the month into historical days and projected days.

### Past Days

For every day before `today`:

- query Dexie through `getMonthLogs(year, month)`
- merge `history` logs and `activityLogs`
- if a log exists, mark the cell `COMPLETED`
- if no log exists, mark the cell `MISSED_OR_REST`

Completed subtype rules:

- `TRAIN` uses a solid dark marker
- `PLAY` uses a solid grey marker

### Today And Future Days

For `today` and later:

- use `buildProjectedCalendarSlots(currentTSS, totalDays)` as the projection source
- preserve the automatic rest cadence that comes from `calculateFluidCalendar()`
- render planned training days as outlined markers
- render `REST (休息)` days as faded dates with no active marker

If a real log already exists today:

- today stays `COMPLETED`
- future planning starts from tomorrow
- the next projected days still come from the current TSS-driven prescription engine

## Day Details Contract

Below the grid, the page renders one persistent detail block for the selected date.

Detail copy rules:

- completed train day -> `Completed: {Theme} (+{TSS} TSS)`
- completed play day -> `Completed: {Sport} (+{TSS} TSS)`
- planned future day -> `Planned: {Theme}`
- empty past day -> `No completed log. Marked as rest / missed.`
- future rest day -> `Planned: REST (休息)`

Clicking any day in the grid must update this section immediately.

## Do Not Break

- do not convert the month grid into card tiles
- do not add heavy borders or shadows to cells
- do not move historical log lookup into `trainingSystem.js`
- keep historical Dexie reads in the page/data layer
- keep future planning driven by the pure periodization helpers
- do not fade planned recovery prescriptions the same way as true rest days
