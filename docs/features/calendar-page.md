# Feature: Calendar Page

## Purpose

Turn the Calendar tab into a readable system-load timeline instead of a placeholder summary screen.

The page should answer two questions immediately:

- how stressed the system is right now
- how the next 7 days shift after external play is logged

## Source Files

- `src/CalendarPage.jsx`
- `src/trainingState.jsx`
- `src/trainingSystem.js`

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

## Timeline Contract

The main section is a 7-day timeline.

Required behavior:

- use `calculateFluidCalendar(currentTSS)` as the base prescription array
- show `Day 1` through `Day 7`
- show a real date for every day
- keep `Day 1` visually larger than the rest
- use line separators and whitespace instead of cards or shadows

## Today Log Override

If the user logged a `PLAY` session today:

- `Day 1` must display `已记录: {Sport Name} (+{TSS} TSS)`
- `Day 1` must show a checkmark
- `Day 2` must be forced to `无痛重启 (Recovery)`
- later days should shift backward through the base prescription array so the timeline feels more conservative

Current implementation detail:

- if multiple external logs exist today, the most recent log owns the `Day 1` summary line
- `currentTSS` still reflects all logged sessions because the provider accumulates total earned TSS

## Do Not Break

- do not turn the timeline into boxed cards
- do not add drop shadows
- do not remove the `Day 1` visual emphasis
- do not embed play-log annotations inside `calculateFluidCalendar()` itself
- keep the log-day override in the page layer so the pure periodization helper stays reusable
