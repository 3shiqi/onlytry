# onlytry

A minimalist adaptive sports training session tracker built with React, Vite, Tailwind CSS, Lucide, and Framer Motion.

Current app version: `0.5.0`

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

- de-UI Calendar page with system-load header and 7-day timeline
- Day 1 logged-state rendering for same-day Play sessions
- automatic recovery shift on Day 2 after external sport is recorded

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

- `src/App.jsx` - dual-mode home shell and global tab routing
- `src/WorkoutExecutor.jsx` - active session execution view
- `src/PlayLogger.jsx` - system-external sport logging flow
- `src/CalendarPage.jsx` - system-load and 7-day prescription timeline
- `src/workoutEngine.js` - adaptive workout generation engine
- `src/trainingSystem.js` - prescriptions, TSS helpers, and periodization logic
- `src/trainingState.jsx` - global training state provider and hook
- `src/actionLibrary.js` - mock action library
- `scripts/patch-rollup-native.cjs` - local Rollup build fallback patch
