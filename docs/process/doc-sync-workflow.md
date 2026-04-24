# Documentation Sync Workflow

## Goal

Code and docs should move together.
No feature change should land without its matching behavior note.

## Mandatory Rule

For every code change:

1. Update the related feature document
2. Update `docs/CHANGELOG.md`
3. If the change is user-visible, decide whether the project version should increase
4. Keep `VERSION` and `package.json` aligned
5. If architecture changed, update `docs/architecture/app-architecture.md`
6. If UI rules changed, update `docs/design/experience-spec.md`

## Fast Workflow

### If You Change One Small Feature

1. Find the feature in `docs/FEATURE_MAP.md`
2. Edit the linked feature doc
3. Make the code change
4. Add one changelog entry

### If You Change Multiple Features

1. Update every affected feature doc
2. Update architecture if state flow or module ownership changed
3. Update design doc if layout or interaction behavior changed
4. Add one grouped changelog entry

## Documentation Minimum Standard

Each feature doc should answer:

- what it does
- where the code lives
- what must stay true
- what events reset or change the state
- what future editors must not accidentally break

## Suggested Commit Habit

For each feature change, keep this order:

1. code
2. matching feature doc
3. changelog

## Review Checklist

Before finishing a change, verify:

- the doc still matches actual UI behavior
- button labels in docs match the product
- file paths in docs still exist
- outdated screens or flows were removed from docs
- `npm run version:check` still passes
