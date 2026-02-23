# Sprint 3 Plan Review — Dad Jokes (Phase 3)

**Reviewed:** 2026-02-23
**Reviewer:** UX Designer + QA Engineer (Claude Code)
**Sprint plan:** phase-3-plan.md
**Tickets reviewed:** #60–#72

---

## Summary

Sprint 3 adds search, rating, and dark mode to an app that already has history, favourites, copy, and share. The sprint plan is well-structured with clear dependency tiers. Three UX/QA risks going in:

1. **Search interaction model** — The inline search results placement (below the joke card) causes layout shift when results appear. Revised to position search above the joke card. The relationship between search mode and history navigation (back/forward disabled during search) was implicit in the plan; now explicit in tickets #61 and #62.

2. **Action row capacity** — Adding rating buttons to the existing action row would overflow on 360px mobile. Revised: rating buttons (👎 👍) join the history nav row (not the action row), which makes contextual sense and avoids crowding.

3. **Dark mode FOUC prevention** — The obvious implementation (inline `<script>` in `<head>`) is blocked by the existing CSP (`script-src 'self'`). Correct pattern: a separate `theme-init.ts` file loaded as a module script in `<head>`. Written explicitly into #68 to avoid the executing agent hitting this wall at runtime.

---

## Findings by ticket

### #61 — Search: data layer
**Issue:** History navigation behaviour during search was not specified at the data layer.
**Resolution:** Added to ticket — `isSearchActive` getter; `navigateHistory()` is a no-op while active; back/forward buttons disabled in UI when search active; clearing search restores historyIndex.

### #62 — Search: UI
**Issues:**
1. Search input placement (below joke card) causes layout shift when results appear.
2. History nav buttons not addressed during search mode.
3. Clicking a result: what exactly happens to search UI state was underspecified.
4. Clear button placement on mobile.

**Resolutions:**
1. Search input moved above joke text (between h1 and joke paragraph).
2. Back/forward buttons disabled while search active.
3. Clicking result: hides list, renders joke, leaves input populated, shows clear button, updates rating/fav state.
4. X button inline with input field, not a separate UI element.

### #63 — Search: tests
**Issue:** Search/history integration is an orchestration concern (main.ts) — not unit-testable.
**Resolution:** Added note linking to #71 where this scenario must be explicitly covered.

### #64 — Rating: data layer
**Issue:** Ratings store has no cap — could grow indefinitely. Was not documented.
**Resolution:** Added explicit decision: accept unbounded growth (at 10k entries, ~200KB — within quota). Document in storage.ts. Added caveat about not running #64 and #61 simultaneously (both touch state.ts/storage.ts).

### #65 — Rating: UI
**Issues:**
1. Adding rating buttons to action row overflows on 360px mobile.
2. Active state CSS custom properties were not specified.

**Resolutions:**
1. Rating buttons (👎 👍) placed in the history nav row (`.history-nav`), right side, separated from back/counter/forward by a flex spacer.
2. Added `--color-rating-up` and `--color-rating-down` CSS custom properties to :root spec.

### #67 — Dark mode: CSS
**Issues:**
1. Dark palette colours were unspecified — risk of WCAG AA failures.
2. Shimmer gradient uses hardcoded `rgba(255,255,255,0.6)` — white flash in dark mode.
3. Several border colours are hardcoded hex values not covered by CSS custom properties.

**Resolutions:**
1. Suggested dark palette with specific values added to ticket. All values checked for WCAG AA.
2. Added `--color-shimmer` custom property to fix shimmer in dark mode.
3. Flagged `.fav-panel`, `.fav-item`, and `.joke--loading` colour values for migration to custom properties.

### #68 — Dark mode: toggle
**Issues:**
1. Inline `<script>` in `<head>` is blocked by existing CSP.
2. Toggle placement ("top-right, fixed or in header") was underspecified — app has no header.

**Resolutions:**
1. Correct pattern: `src/theme-init.ts` loaded as `<script type="module">` in `<head>`. Code provided.
2. Toggle: `position: fixed; top: 16px; right: 16px` — viewport-fixed, not inside the card.

### #71 — Playwright: E2E tests
**Issue:** Three integration scenarios were missing: search+history interaction, rating persistence across reload, and dark mode FOUC verification.
**Resolution:** All three scenarios added to ticket body with specific assertions.

---

## Parallel-safe audit

| # | Label | Verdict |
|---|-------|---------|
| #60 | ✅ `parallel-safe` | Correct — writes to a new findings file only |
| #64 | ✅ `parallel-safe` | Correct for Tier 0. Added caveat: do not run simultaneously with #61 |
| #67 | ✅ `parallel-safe` | Correct — only touches style.css |
| #70 | ✅ `parallel-safe` | Correct — creates new playwright.config.ts and e2e/ directory |

No label changes required. Caveat note added to #64.

---

## Decision log

| Decision | Options considered | Chosen | Rationale |
|----------|--------------------|--------|-----------|
| Search input placement | Below joke card (original) vs. above joke card | **Above joke card** | Below causes layout shift as results appear; above is stable |
| Search + history interaction | History nav enabled during search vs. disabled | **Disabled during search** | Prevents ambiguous back/forward behaviour; clear resets to previous state |
| Rating button placement | Join action row vs. join history nav row | **History nav row** | Action row overflows on 360px mobile with 6+ icon buttons; history nav has space and contextual fit |
| Ratings store cap | Cap at 50/100 vs. unbounded | **Unbounded** | At 10k entries ~200KB — within quota for this project; no user-visible benefit to capping |
| FOUC prevention approach | Inline script (blocked by CSP) vs. separate module file | **Separate module file** (`theme-init.ts`) | Inline scripts are blocked by existing `script-src 'self'` CSP; module file is CSP-compliant and Vite-friendly |
| Dark mode shimmer | Hardcoded white rgba (wrong on dark) vs. CSS custom property | **CSS custom property** (`--color-shimmer`) | Ensures shimmer looks correct in both themes without dark-mode-specific overrides |

---

## Tickets updated

- #61 — UX note added (history nav during search)
- #62 — UX notes added (placement, mode model, click behaviour, mobile layout)
- #63 — QA note added (integration scenario for E2E)
- #64 — QA note added (unbounded store decision + parallel caveat)
- #65 — UX notes added (layout decision, CSS custom properties)
- #67 — UX/QA notes added (dark palette, shimmer fix, hardcoded colours)
- #68 — UX/QA notes added (FOUC pattern, toggle placement)
- #71 — QA notes added (3 new integration scenarios)

**8 of 13 tickets updated.**

---

*Plan review completed 2026-02-23 by Claude Code (UX Designer + QA Engineer)*
