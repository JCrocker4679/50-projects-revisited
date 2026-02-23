# Dad Jokes — Changelog

All notable changes to this project will be documented in this file.

## [Sprint 3] — 2026-02-23

### Added

- **Dark mode palette** (`[data-theme="dark"]`): warm dark colour overrides using CSS custom properties. All WCAG AA contrast ratios verified (text 13.81:1, muted 5.74:1, error 5.83:1 on dark card background)
- `--color-rating-up` / `--color-rating-down` CSS custom properties for rating buttons (#65) — in both light and dark themes
- `.rating-btn--up-active` / `.rating-btn--down-active` CSS classes for active rating button states
- Smooth theme transition: `background-color` and `color` transitions on `body` and `.container` (disabled for `prefers-reduced-motion`)

### Fixed

- `--color-shimmer` custom property replaces hardcoded `rgba(255,255,255,0.6)` in shimmer animation — fixes white flash in dark mode
- `--color-divider` custom property replaces hardcoded `#eee` / `#f0f0f0` borders in `.fav-panel` and `.fav-item`
- `.joke--loading` text colour now uses `var(--color-text-muted)` instead of hardcoded `#999`
- `.retry-btn` text uses `var(--color-card)` instead of hardcoded `#fff` (correct in dark mode)

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
