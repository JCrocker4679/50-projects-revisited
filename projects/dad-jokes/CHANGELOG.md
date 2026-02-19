# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — Sprint 2

### Added
- Visual refresh: warm amber/cream colour palette replacing tutorial purple; action row layout for secondary buttons; icon button variant (`btn--icon`) with hover/active states

### Changed
- Main button label: "Get Another Joke" → "Tell me another"
- Joke text fade on load (CSS opacity transition, respects `prefers-reduced-motion`)
- Error colours now use CSS custom properties (no more hardcoded hex in error styles)

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
