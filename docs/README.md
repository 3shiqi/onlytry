# onlytry Documentation

This directory is the source of truth for product behavior, UI rules, feature contracts, and change history.

## How To Use This Folder

If you want to change a specific feature later:

1. Start from `FEATURE_MAP.md`
2. Open the matching feature document
3. Update the code
4. Update that feature document in the same change
5. Add a short entry to `CHANGELOG.md`

## Folder Structure

- `CHANGELOG.md`
  - semantic version history for the project
- `FEATURE_MAP.md`
  - maps code files to the documentation file that should be updated with them
- `architecture/`
  - system structure, runtime flow, state flow
- `design/`
  - UI, interaction, motion, and visual rules
- `features/`
  - one document per major product capability
- `process/`
  - how to keep documentation synchronized with code
- `releases/`
  - one note per formal release
- `templates/`
  - templates for future feature documents or changes

## Recommended Editing Order

For most future work, edit in this order:

1. Feature doc under `features/`
2. Relevant architecture or design doc if the change is structural
3. `CHANGELOG.md`

## Current Core Docs

- `architecture/app-architecture.md`
- `design/experience-spec.md`
- `features/workout-engine.md`
- `features/session-execution.md`
- `features/top-tag-filters.md`
- `features/pwa-and-deployment.md`
- `process/doc-sync-workflow.md`
- `process/versioning-policy.md`
