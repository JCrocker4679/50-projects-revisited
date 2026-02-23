# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Sprint 3] — In progress

### Added

- **Dark mode — CSS variables**: full warm dark palette via `[data-theme="dark"]` on `<html>`; all colours now driven by CSS custom properties. Fixed hardcoded `rgba(255,255,255,0.6)` shimmer, `#eee` borders, `#999` loading text, `#fff` retry button text.
- **Rating types**: `RatingValue` (`'up' | 'down' | null`) and `JokeRatings` (`Record<string, RatingValue>`) added to `types.ts`
- **Rating state**: `initRatings`, `getRating`, `setRating` in `state.ts`; toggle behaviour — calling `setRating` with the current value clears it back to null
- **Rating persistence**: `loadRatings` / `saveRatings` in `storage.ts`; stored under `dad-jokes-ratings-v1`; unbounded `Record` (no eviction)
- **Rating UI**: thumbs up 👍 and thumbs down 👎 buttons in the history-nav row (right side); `aria-pressed` tracks active state; `rating-btn--up-active` / `rating-btn--down-active` CSS classes provide green/red visual feedback; rating updates on history navigation and on new joke fetch; `updateRatingButtons()` added to `ui.ts`
- **Dark mode toggle**: fixed top-right button (sun/moon icon); toggles `[data-theme="dark"]` on `<html>`; persists preference to `localStorage` (`dad-jokes-theme`); respects `prefers-color-scheme` on first visit; no FOUC — theme applied before paint via `src/theme-init.ts` module script in `<head>`; correct `aria-label` and `aria-pressed` on every render; `src/theme.ts` module handles all toggle/persist logic; `updateThemeToggle()` added to `ui.ts`
- **Visual pass: card layout restructure** (D-VD1, D-VD2, D-VD4, D-VD5): CTA button moved to its own `.cta-row`; all secondary icon buttons (★ 👎 👍 📋 ↗) grouped in `.icon-row` below joke text; rating buttons moved from history-nav row into icon-row; history nav simplified to Prev/counter/Next only (removed `__left`/`__rating` sub-divs); `.btn--icon` updated to ghost style (transparent border by default, border appears on hover/focus/active); `.fav-toggle-row` hidden at zero count (`hidden` attribute toggled via `updateFavouritesCount`)

---

## [Sprint 2] — 2026-02-22

### Added

- **Favourites list view**: panel showing saved jokes with delete buttons; empty state when list is empty; toggle button with live count badge (`My Favourites (3)`)
- **Favourites**: star/unstar jokes from the action row; persisted to `localStorage` (`dad-jokes-favourites-v1`); max 100 saved; `aria-pressed` on star button
- **Web Share API**: share button uses native share sheet on mobile; falls back to clipboard copy on desktop; dismissed share sheet handled silently
- **Copy to clipboard**: copy button with 2s "✓ Copied!" feedback that resets automatically; falls back to `execCommand` on older browsers
- **History navigation**: back/forward buttons to browse previously seen jokes; position counter ("2 / 8"); history persists across page reloads (`dad-jokes-history-v1`); max 50 entries
- **Visual refresh**: warm amber/cream colour palette replacing tutorial purple; action row layout for icon buttons; `btn--icon` and `btn--ghost` CSS variants; joke text crossfade on load
- **Vercel Analytics**: page-view tracking via `inject()` on load; custom typed events for `joke_fetched`, `error_shown`, `retry_clicked`, `joke_copied`, `joke_shared`, `favourite_added`, `favourite_removed`, `history_navigated`; `safeTrack()` wrapper so analytics failures never reach users
- **OG image**: real 1200×630 PNG replacing placeholder SVG, for correct social sharing previews
- `src/analytics.ts` — typed Vercel Analytics wrapper module

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
- Resilient API layer: typed `ApiError` class, `AbortController` timeout, HTTP status checking, response shape validation
- Error UI: user-friendly messages per error type (network, HTTP, timeout, validation); retry button; cached joke fallback
- Loading state: shimmer animation via CSS, `aria-busy` for screen readers
- Accessibility: semantic HTML, WCAG AA contrast, 44×44px touch targets, visible focus styles, `aria-live` on joke text
- Responsive layout: mobile-first, fluid typography via `clamp()`, desktop breakpoint at 640px
- Meta tags: `<title>`, `<meta description>`, Open Graph, Twitter Card, favicon, theme-color
- Content Security Policy meta tag (strict: `default-src 'self'`)
- Baseline tests: Vitest + MSW test infrastructure; tests for `api.ts`, `ui.ts`, `state.ts`, `storage.ts`
- Self-hosted Roboto font via @fontsource (latin subset, weights 400 + 700)
- Vercel deployment: `dad-jokes-revisited.vercel.app`

### Changed

- Original 20-line `script.js` decomposed into typed, tested modules
- `innerHTML` → `textContent` / DOM methods throughout (XSS prevention)
- Google Fonts `@import` → self-hosted @fontsource (eliminates third-party font request)
- Font weight 400 added (original only loaded 700, all text rendered bold)
- Duplicate `.btn:disabled` rule removed from CSS
- `overflow: hidden` removed from body (was clipping content on small viewports)
- Focus styles: `outline: 0` replaced with `3px solid #2563eb` visible outline
