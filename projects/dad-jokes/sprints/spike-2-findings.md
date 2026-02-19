# Spike #2 Findings: User-Agent Header & Font Hosting

**Date:** 2026-02-19
**Ticket:** #2
**Status:** Complete

---

## User-Agent Header

### Finding
`User-Agent` is **no longer a forbidden header** in the Fetch specification. It was removed from the forbidden list. Chrome may still silently drop it in some cases, but it's worth setting.

### API Requirement
The icanhazdadjoke.com API recommends (not requires) a custom User-Agent:
> "If you intend on using the icanhazdadjoke.com API we kindly ask that you set a custom User-Agent header for all requests."

Example format: `My Library (https://github.com/username/repo)`

No authentication required. No documented rate limits.

### Recommendation
Set `User-Agent: "Dad Jokes App (https://github.com/JCrocker4679/50-projects-revisited)"` in the fetch config. If Chrome drops it silently, no harm — the browser default still gets sent.

---

## Font Hosting

### Finding
Self-host via `@fontsource/roboto`. Eliminates Google Fonts dependency entirely.

### Comparison

| Factor | Google Fonts CDN | @fontsource (self-hosted) |
|--------|-----------------|---------------------------|
| Setup | `@import` in CSS | `npm install` + JS import |
| Performance | 2 extra DNS lookups | Same-origin, Vite-bundled |
| CSP complexity | Must allow 2 Google domains | Only `'self'` needed |
| Privacy | Google tracks requests | No third-party tracking |
| Reliability | External dependency | Bundled in deploy |
| Size cost | 0 in bundle | ~20KB woff2 (400+700) |

### Recommendation
Use `@fontsource/roboto` with weights 400 (regular) and 700 (bold).

**Bug found:** Original code only loads Roboto 700 but uses it for body text — everything renders bold. Need both weights.

---

## Impact on Sprint Tickets

- **#7 (API layer):** Set User-Agent in fetch headers
- **#11 (CSS):** Replace Google Fonts `@import` with `@fontsource` import
- **#13 (CSP):** Fonts policy simplifies to `'self'` only
