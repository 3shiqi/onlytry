# onlytry

A minimalist adaptive sports training session tracker built with React, Vite, Tailwind CSS, Lucide, and Framer Motion.

Current app version: `0.2.1`

## Documentation

Project docs now live under `docs/` and are organized for feature-level updates:

- `docs/README.md` - documentation index
- `docs/FEATURE_MAP.md` - source file to feature doc mapping
- `docs/CHANGELOG.md` - dated change log
- `docs/process/doc-sync-workflow.md` - documentation update rules
- `docs/process/versioning-policy.md` - formal versioning rules
- `docs/releases/` - release notes by version

When code changes, update the related feature doc and `docs/CHANGELOG.md` in the same change.

Latest release highlights:

- explicit rest state with per-exercise `restIntra` and `restInter`
- circular rest countdown with `Skip Rest`
- refresh and tag changes fully reset timers and return to the first exercise
- `www.onlytry.cc` now redirects to `onlytry.cc`

## Version Management

This project now uses a lightweight formal versioning system:

- root `VERSION`
- matching `package.json` version
- `docs/CHANGELOG.md`
- `docs/releases/`

Useful commands:

```bash
npm run version:current
npm run version:check
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Cloudflare Pages

Use these settings in Cloudflare Pages:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

See also:

- `CLOUDFLARE_PAGES_SETUP.md`

## PWA

This project includes:

- `manifest.webmanifest`
- service worker registration
- iPhone home screen icon assets

## Main Source Files

- `src/App.jsx` - active session UI and interaction flow
- `src/workoutEngine.js` - adaptive workout generation engine
- `src/actionLibrary.js` - mock action library
- `scripts/patch-rollup-native.cjs` - local Rollup build fallback patch
