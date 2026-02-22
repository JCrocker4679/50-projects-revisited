# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Sprint 2 — Ticket #37: Favourites list view

#### Added
- `renderFavouritesList()` in `ui.ts` — renders saved jokes as DOM list with delete buttons; shows empty state when list is empty
- `updateFavouriteButton()` — syncs star button aria-pressed, aria-label, and active CSS class
- `updateFavouritesCount()` — updates the count badge in the panel toggle button
- `toggleFavouritesPanel()` — shows/hides favourites panel with aria-expanded sync
- Favourites panel (`#favPanel`) in index.html with toggle button and count badge
- Star button (`#favouriteBtn`) alongside the main joke button in an action row
- Panel, item, and icon button CSS (`.fav-panel`, `.fav-list`, `.fav-item`, `.btn--icon`, `.btn--ghost`)
- 16 new UI tests covering all four new UI functions, including XSS-safety check

#### Changed
- `AppState` extended with `favourites: Joke[]`
- `storage.ts` extended with `loadFavourites` / `saveFavourites`
- `state.ts` extended with `initFavourites`, `getFavourites`, `isFavourited`, `toggleFavourite` (max 100, newest-first)
- `main.ts` wires star button, panel toggle, and delete callbacks; calls `initFavourites()` on load

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
