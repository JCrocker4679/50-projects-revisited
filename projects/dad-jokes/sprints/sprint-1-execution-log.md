# Sprint 1 — Execution Log

**Sprint goal:** Ship a production-grade foundation: the same one-joke app, but with error handling, accessibility, tests, and build tooling — deployed to Vercel.

**Executed by:** Claude Code (sprint-run)
**Reviewed by:** Joe (PR review + merge)

---

## Tickets Completed

### PR #16 — Ticket #2: Spike (User-Agent + Fonts)
**Branch:** `2-spike-user-agent-fonts` → `main`

- Researched User-Agent header — no longer a forbidden header in modern browsers
- Researched font hosting — recommended `@fontsource/roboto` for self-hosting
- Created `sprints/spike-2-findings.md` with full findings

### PR #17 — Ticket #3: Scaffold Vite + TypeScript
**Branch:** `3-scaffold-vite-typescript` → `main`

- `npm create vite@latest refactored -- --template vanilla-ts`
- Installed vitest, msw, happy-dom, @fontsource/roboto
- Created module structure: api.ts, ui.ts, state.ts, storage.ts, types.ts, constants.ts
- Ported original HTML/CSS (minus Google Fonts @import)
- Set up Vitest + MSW test infrastructure
- Used `@fontsource/roboto/latin-400.css` and `latin-700.css` (subset-specific to avoid 24KB bloat)

### PR #18 — Ticket #4: Migrate Code to Modules
**Branch:** `4-migrate-code-to-modules` → `3-scaffold-vite-typescript`

- Migration was effectively completed in #3 (original was ~20 lines, decomposed into typed modules)
- Added CHANGELOG.md documenting the original → refactored mapping

### PR #19 — Ticket #12: Meta Tags, OG Tags, Favicon
**Branch:** `12-meta-og-tags` → `3-scaffold-vite-typescript`

- Meta description, Open Graph tags, Twitter Card tags
- SVG emoji favicon, SVG OG image placeholder
- Theme-color meta tag
- Note: social platforms typically need PNG/JPG for OG images (deferred)

### PR #20 — Ticket #5: Baseline Tests (GATE)
**Branch:** `5-baseline-tests` → `4-migrate-code-to-modules`

- 7 tests covering D15 requirements
- **Issue:** jsdom ESM compatibility with Node 22.9.0 — switched to happy-dom
- MSW handlers capture `lastRequest` for header verification
- All 7 tests pass

### PR #21 — Ticket #6: Fix XSS
**Branch:** `6-fix-xss-textcontent` → `5-baseline-tests`

- `innerHTML` → `textContent` in ui.ts
- Updated baseline tests to verify textContent usage

### PR #22 — Ticket #7: Error Handling + Resilient API
**Branch:** `7-error-handling-api` → `6-fix-xss-textcontent`

- Custom `ApiError` class with type discrimination (network/http/timeout/validation)
- `AbortController` with 10s timeout
- HTTP status checking (`res.ok`)
- Response shape validation via type guard
- User-Agent header per API recommendation
- Cancel support for in-flight requests
- `renderError()` in ui.ts with D14 copy strings
- try/catch in main.ts

### PR #23 — Ticket #10: Accessibility + Responsive CSS
**Branch:** `10-accessibility-fixes` → `6-fix-xss-textcontent`

- Semantic HTML: `h3` → `h1`, `div` → `p`, `div` → `main`
- `aria-live="polite"`, `aria-atomic="true"` on joke container
- `<noscript>` fallback
- Visible focus styles (`focus-visible`)
- WCAG AA contrast ratios
- 44x44px touch targets
- `prefers-reduced-motion` media query
- Removed `overflow: hidden` (accessibility issue)
- CSS custom properties for theming prep
- Fluid typography with `clamp()`
- Mobile-first responsive (24px → 50px at 640px breakpoint)

**Ticket #11 (Responsive CSS)** — closed as completed within #10 (same files affected)

### PR #24 — Ticket #8: Loading State
**Branch:** `8-loading-state` → `7-error-handling-api`

- `showLoading()` / `hideLoading()` in ui.ts
- `aria-busy` attribute for screen readers
- CSS shimmer animation on `.joke--loading`
- Button disabled during fetch
- First load: "Warming up..." text; subsequent loads: shimmer over previous joke
- `prefers-reduced-motion` fallback (no animation)

### PR #25 — Ticket #9: Error Messages with Retry
**Branch:** `9-error-messages-retry` → `8-loading-state`

- `renderError()` builds DOM elements programmatically (not innerHTML, per D6)
- "Try again" button wired to retry handler via `setRetryHandler()` pattern
- Cached joke fallback when previous joke exists
- D14 copy strings per error type
- Retry button meets WCAG AA touch targets

### PR #26 — Ticket #13: Content Security Policy
**Branch:** `13-content-security-policy` → `9-error-messages-retry`

- Strict CSP via `<meta>` tag — no external domains needed (fonts self-hosted)
- `script-src 'self'` blocks inline script injection
- `connect-src https://icanhazdadjoke.com` — only the joke API
- Vite plugin relaxes CSP in dev mode for HMR compatibility
- Production build verified: no `unsafe-inline`

### PR #27 — Ticket #14: Comprehensive Tests
**Branch:** `14-refactored-tests` → `13-content-security-policy`

- **55 total tests** across 4 files (500ms runtime)
- api.test.ts: 17 tests (fetch, errors, validation, cancellation, headers)
- state.test.ts: 7 tests (all getters/setters)
- ui.test.ts: 24 tests (renderJoke, renderError, loading, retry, accessibility)
- baseline.test.ts: 7 tests (existing)
- **Coverage:** api.ts 93.5%, state.ts 100%, ui.ts 98%, overall 97%
- Added `@vitest/coverage-v8`

### PR #28 — Ticket #15: Deploy to Vercel
**Branch:** `15-deploy-vercel` → `14-refactored-tests`

- `vercel.json` with security headers (HSTS, X-Frame-Options, CSP supplement)
- Fixed TypeScript build: refactored ApiError for `erasableSyntaxOnly` compat
- Manual deployment steps documented in PR for Joe

---

## Issues Encountered

| Issue | Resolution |
|-------|-----------|
| jsdom ESM incompatibility with Node 22.9.0 | Switched to happy-dom |
| @fontsource importing all subsets (24KB) | Used subset-specific imports: `latin-400.css` |
| GitHub Project scope auth | Skipped — non-blocking for sprint execution |
| Ticket #11 empty PR (no diff vs #10) | Closed issue with comment — work done in #10 |
| Node 22.9.0 version warning from Vite 7.3.1 | Non-blocking — builds work despite warning |
| `erasableSyntaxOnly` blocking parameter properties | Refactored ApiError to explicit assignment |

## Branching Strategy

Stacked PRs — each ticket branches from its dependency since PRs aren't merged yet:

```
main
├── 2-spike-user-agent-fonts (PR #16)
├── 3-scaffold-vite-typescript (PR #17)
│   ├── 4-migrate-code-to-modules (PR #18)
│   │   └── 5-baseline-tests (PR #20)
│   │       └── 6-fix-xss-textcontent (PR #21)
│   │           ├── 7-error-handling-api (PR #22)
│   │           │   └── 8-loading-state (PR #24)
│   │           │       └── 9-error-messages-retry (PR #25)
│   │           │           └── 13-content-security-policy (PR #26)
│   │           │               └── 14-refactored-tests (PR #27)
│   │           │                   └── 15-deploy-vercel (PR #28)
│   │           └── 10-accessibility-fixes (PR #23)
│   └── 12-meta-og-tags (PR #19)
```

**Recommended merge order:** #16 → #17 → #18 → #20 → #21 → #22 → #24 → #25 → #26 → #27 → #28, then #19 and #23 (parallel branches, may need rebase).

## Stats

- **Tickets planned:** 14 (15 issues, #11 merged into #10)
- **Tickets completed:** 14/14 ✅
- **PRs created:** 12
- **Tests:** 55 (all passing)
- **Coverage:** 97% statements
- **Build time:** ~92ms
- **Test time:** ~500ms
