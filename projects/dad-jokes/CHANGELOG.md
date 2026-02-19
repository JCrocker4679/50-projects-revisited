# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — Sprint 2

### Added
- Vercel Analytics: page-view tracking via `inject()` on load; custom events for `joke_fetched`, `error_shown`, `retry_clicked`, `joke_copied`, `joke_shared`, `favourite_added`, `favourite_removed`, `history_navigated`
- `src/analytics.ts` — typed analytics wrapper with `safeTrack()` so analytics failures never reach the user
- OG image: real 1200×630 PNG replacing placeholder, for proper social sharing previews

### Changed
- Content Security Policy updated to allow `https://va.vercel-insights.com` for analytics

---

## [Sprint 1]

### Added
- Vite + TypeScript project scaffold (`refactored/`)
- Module structure: `api.ts`, `ui.ts`, `state.ts`, `storage.ts`, `types.ts`, `constants.ts`
- Self-hosted Roboto font via @fontsource (latin subset, weights 400 + 700)
- Vitest + MSW test infrastructure

### Changed
- Original 20-line `script.js` decomposed into typed modules
- Google Fonts `@import` replaced with self-hosted @fontsource
- Font weight 400 added (original only loaded 700, causing all text to render bold)

### Migration Notes
The code migration preserves exact original behaviour:
- `api.ts` → fetch call with `Accept: application/json` header
- `ui.ts` → DOM update via `innerHTML` (intentionally kept for now — security fix in #6)
- `main.ts` → event listener + initial call on page load
- HTML structure identical to original
- CSS identical (minus `@import url()` for Google Fonts)
