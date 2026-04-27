# onlytry

A minimalist adaptive sports training session tracker built with React, Vite, Tailwind CSS, Lucide, and Framer Motion.

Current app version: `0.6.1`

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

- monthly-grid Calendar page with historical logs and future projections
- Dexie persistence for in-app training history and external sport logs
- automatic rest cadence in future planning plus tap-to-inspect day details
- PWA cache refresh fix so deployed UI updates reach installed clients more reliably

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

- `docs/features/pwa-and-deployment.md`

## PWA

This project includes:

- `manifest.webmanifest`
- service worker registration
- iPhone home screen icon assets

## Main Source Files

- `src/App.jsx` - dual-mode home shell and global tab routing
- `src/WorkoutExecutor.jsx` - active session execution view
- `src/PlayLogger.jsx` - system-external sport logging flow
- `src/CalendarPage.jsx` - system-load monthly grid and day-detail view
- `src/workoutEngine.js` - adaptive workout generation engine
- `src/trainingSystem.js` - prescriptions, TSS helpers, and periodization logic
- `src/trainingDb.js` - Dexie persistence helpers for train and play logs
- `src/trainingState.jsx` - global training state provider and hook
- `src/actionLibrary.js` - mock action library
- `scripts/patch-rollup-native.cjs` - local Rollup build fallback patch
