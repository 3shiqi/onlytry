# Feature: PWA And Deployment

## Purpose

Allow `onlytry` to run like a lightweight installable app on iPhone and remain easy to deploy.

## Source Files

- `src/main.jsx`
- `public/manifest.webmanifest`
- `public/sw.js`
- `public/apple-touch-icon.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `index.html`
- `scripts/patch-rollup-native.cjs`
- `package.json`

## PWA Behavior

### Included Assets

- web manifest
- service worker
- Apple touch icon
- standard PWA icons

### iPhone Usage

Recommended flow:

1. Open `https://onlytry.cc` in Safari
2. Share
3. Add to Home Screen

## Deployment Model

Current production host:

- Cloudflare Pages
- custom domain: `onlytry.cc`
- alias domain: `www.onlytry.cc`
- canonical host redirect: `www.onlytry.cc` -> `onlytry.cc`

## Build Contract

Current build command:

- `npm run build`

Current output:

- `dist/`

## Local Machine Workaround

This machine has a Rollup native module loading issue.

The repository fixes that through:

- `@rollup/wasm-node`
- `scripts/patch-rollup-native.cjs`
- `postinstall` and `prebuild` hooks in `package.json`

## Related External Notes

- Root file: `CLOUDFLARE_PAGES_SETUP.md`
- Root file: `IOS_SETUP.md`

## When To Update This Doc

Update this file if any of these change:

- deployment platform
- custom domain
- canonical host redirect
- build command
- service worker strategy
- install flow
- local build workaround
