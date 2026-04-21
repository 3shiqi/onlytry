# Cloudflare Pages + Custom Domain

This project is ready to deploy to Cloudflare Pages as a static Vite app.

## Build settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`

## Recommended flow

1. Push this project to GitHub
2. In Cloudflare Dashboard, create a new Pages project from that repo
3. Use the build settings above
4. After the first deploy, add your custom domain in the Pages project

## Direct upload fallback

If you do not want to connect GitHub, you can also upload the built `dist/` folder directly in Pages.

## Brand

- App / PWA name: `onlytry`
- Suggested domain style: `onlytry.app`, `onlytry.fit`, or your preferred domain bought separately
