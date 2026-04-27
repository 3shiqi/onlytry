# Experience Spec

## Product Tone

The app should feel:

- immediate
- quiet
- athletic
- readable under fatigue
- low-friction

The interface should not look like a generic dashboard.
It should feel like a focused training screen.

## Layout Rules

### Overall Structure

- Strictly mobile-first
- Single-column portrait layout
- One primary mode visible at a time
- Fixed bottom primary action
- Minimal secondary chrome

### Top Area

- The topmost interactive control is a subtle segmented mode switch
- On the Home / Train route, the planning tag row sits below the mode switch
- Tags represent the current plan configuration, not generic navigation
- The refresh action lives on the far right
- A thin phase progress bar sits below the tag row
- On the Calendar route, the top content should reduce to a thin system-load bar and status copy

### Center Area

- Large illustration placeholder or media container
- Large movement name
- Small regression button beside the movement name
- Small instruction copy
- One primary data metric in the visual center
- Same-exercise next-set changes should still feel visually distinct
- On the Calendar route, the center becomes a sparse monthly grid with a separate detail area below it

### Bottom Area

- A global Home / Calendar tab bar stays fixed at the bottom
- Large `CHECK` button during the session
- Circular rest countdown replaces the bottom button during recovery
- Small `Skip Rest` button sits under the rest countdown
- Large `REFRESH` button on completion
- `记录系统外运动 (LOG ACTIVITY)` is the large bottom action in Play mode

## Visual Language

### Color

- Background: `#FFFFFF`
- Primary text: `#1A1A1A`
- Secondary text: `#64748B`
- Border: `#E2E8F0`
- Accent green: `#22C55E`
- Rest accent blue: `#60A5FA`
- Soft green surface: `#F0FDF4`
- Soft neutral surface: `#F8FAFC`
- Rest surface: `#F7FBFF`

### Typography

- Large bold movement title
- Small uppercase system labels
- Large bold metric value
- Minimal long-form copy

### Motion

- Mode and tab switches should feel quick and horizontal, not modal
- Horizontal slide transition between movements
- Horizontal slide transition should also appear when the set changes within the same movement
- Entering and exiting rest should feel like a meaningful state change, not a silent label swap
- Short dropdown fade/slide for top tag menus
- Progress bar transitions should be smooth but fast

## Interaction Rules

### Refresh

- Refresh regenerates the plan using the current tags
- Refresh resets the session to the first movement
- Refresh closes any open dropdown menu

### Time-Based Movements

- If a movement is time-based, pressing `CHECK` starts the work countdown
- The live timer becomes the dominant central metric during the set
- When the countdown completes, the set resolves automatically and then enters rest

### Rest State

- Every completed set should enter a visible recovery state
- Intra-set rest uses `restIntra`
- Final-set rest uses `restInter`
- The page background shifts to a pale blue during rest
- The bottom action area becomes a circular countdown timer
- `Skip Rest` should always be available for autonomy

### Top Tags

- Tags show only the current plan configuration
- Tapping a tag opens one dropdown at a time
- Selecting a value regenerates the session immediately

### Play Logger

- The play logger should keep the same quiet, bold, high-contrast tone as training mode
- Avoid bordered dashboard cards; use spacing, typography, and pills instead
- Success feedback should feel lightweight and immediate

### Calendar Page

- The calendar should avoid cards and drop shadows entirely
- `SYSTEM LOAD (系统负荷)` should feel like a system readout, not a marketing header
- The TSS bar should stay hairline-thin
- The month grid should be Monday-first and 7 columns wide
- `TODAY` should read as a crisp ring, not a filled badge
- completed `TRAIN` days should use a dark solid marker
- completed `PLAY` days should use a softer grey solid marker
- planned days should use a hollow marker
- true rest / empty days should fade heavily
- planned recovery days should still read as active prescriptions, not empty space
- tapping a day should update the detail panel below the grid

### Regression

- Regression only affects the current movement
- Engine-triggered auto regression and user-triggered manual regression should both be visible in copy

### Completion

- Completion should feel conclusive, not modal or disruptive
- Summary can show high-level stats but should stay compact

## Design Do Not Break

- Do not reintroduce a setup cover screen before the first movement
- Do not place multiple exercises on the same screen
- Do not demote the main metric below secondary tags or summary cards
- Do not turn the tag row into a navigation bar
- Do not make the play logger look like a separate product
