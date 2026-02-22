# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — Sprint 2

### Added
- Copy joke to clipboard button; shows "✓ Copied!" feedback for 2s, resets automatically; falls back to `execCommand` on older browsers
- Visual refresh: warm amber/cream colour palette replacing tutorial purple; action row layout for secondary buttons; icon button variant (`btn--icon`) with hover/active states
- Favourites: star/unstar jokes with localStorage persistence (`dad-jokes-favourites-v1`); star button in action row with `aria-pressed` support
- Joke history: stores last 50 jokes in localStorage (`dad-jokes-history-v1`); `navigateHistory()` for back/forward traversal
- Vercel Analytics: page-view tracking via `inject()` on load; custom events for `joke_fetched`, `error_shown`, `retry_clicked`, `joke_copied`, `joke_shared`, `favourite_added`, `favourite_removed`, `history_navigated`
- `src/analytics.ts` — typed analytics wrapper with `safeTrack()` so analytics failures never reach the user
- OG image: real 1200×630 PNG replacing placeholder, for proper social sharing previews

### Changed
- Main button label: "Get Another Joke" → "Tell me another"
- Joke text fade on load (CSS opacity transition, respects `prefers-reduced-motion`)
- Error colours now use CSS custom properties (no more hardcoded hex in error styles)
- Content Security Policy updated to allow `https://va.vercel-insights.com` for analytics

---

## [Sprint 1] — 2026-02-19

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
