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

### Service Worker Strategy

Current strategy:

- versioned shell cache and runtime cache
- navigation requests are network-first
- `/index.html` is refreshed from network whenever available
- static assets can still be cached for repeat launches

This is important because product updates should not leave installed iPhone users stuck on an older app shell.

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

## Native iOS App

The repository also contains a native iOS scaffold under `ios/App`.

Current native iOS direction:

- SwiftUI app entry in `OnlytryApp.swift`
- SwiftData persistence for `Exercise` and `SessionLog`
- three tabs: `Session`, `Library`, `Calendar`
- minimum iOS target `17.0`
- app display name `Onlytry`
- bundle ID `com.sunshiqi.onlytry`

Open:

- `ios/App/App.xcodeproj`

The native target no longer needs the Capacitor storyboard bridge for launch.
It also no longer packages the old Capacitor `public`, `config.xml`, or `Main.storyboard` resources.

Detailed native implementation notes live in:

- `docs/features/native-ios-app.md`
- `docs/handovers/native-ios-app.md`

## When To Update This Doc

Update this file if any of these change:

- deployment platform
- custom domain
- canonical host redirect
- build command
- service worker strategy
- install flow
- native iOS target structure
- local build workaround
