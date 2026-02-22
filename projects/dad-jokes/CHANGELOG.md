# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] — Sprint 2

### Added
- History navigation: back/forward buttons to browse previously seen jokes; position counter ("2 / 8"); persists across page reloads

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
