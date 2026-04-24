# Versioning Policy

## Current Scheme

The project uses Semantic Versioning in the `0.x` phase.

Current version sources:

- root `VERSION`
- `package.json`
- `docs/CHANGELOG.md`
- `docs/releases/`

## Meaning

### Patch `0.x.Z`

Use for:

- bug fixes
- copy-only corrections
- non-behavioral documentation cleanup
- build or tooling fixes that do not change user behavior

### Minor `0.Y.x`

Use for:

- user-visible feature additions
- interaction changes
- new filters
- new session behaviors
- new screens or major workflow shifts

### Major `X.0.0`

Not expected until the product stabilizes past the experimental phase.

## Release Rules

For each versioned release:

1. Update `VERSION`
2. Update `package.json`
3. Keep `package-lock.json` aligned
4. Add or update the matching note in `docs/releases/`
5. Add the summary entry in `docs/CHANGELOG.md`
6. Run `npm run version:check`

## Current First Formal Release

`0.1.0` is the first formal documented release.

It represents:

- direct-to-first-exercise entry
- top tag planning controls
- adaptive workout engine
- time-based automatic countdown behavior
- structured docs and release process
