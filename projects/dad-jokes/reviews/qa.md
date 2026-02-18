# QA Engineer Review — Dad Jokes

**Reviewer:** QA Engineer
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

There are zero tests. Zero. No unit tests, no integration tests, no end-to-end tests, no manual test plan. The original code is 20 lines with no error handling, which means every failure path is untested because every failure path is unhandled.

Before any refactoring begins, we need baseline tests that lock down the current behaviour. Then the refactoring can proceed with confidence that we haven't broken anything. After refactoring, we need tests for every new feature, every error state, and every edge case.

---

## Current Bug Report

These are bugs in the existing code, not feature requests.

### BUG-001: Placeholder text visible on first load
**Severity:** Low
**Steps:** Open index.html in a browser. Observe the text "// Joke goes here" briefly visible before the first joke loads.
**Expected:** No visible placeholder. Either an empty state, a loading skeleton, or the joke appears before the container is shown.
**Actual:** Developer comment displayed as user-facing text.

### BUG-002: Silent failure on network error
**Severity:** Critical
**Steps:** Open the app. Disable network (airplane mode or DevTools throttling > Offline). Click "Get Another Joke".
**Expected:** Error message displayed to the user.
**Actual:** Nothing happens. The previous joke (or placeholder) remains. No indication of failure. Unhandled promise rejection in console.

### BUG-003: Silent failure on API error
**Severity:** Critical
**Steps:** If the API returns a non-200 status code (simulate with DevTools or a mock), the code attempts `res.json()` without checking `res.ok`.
**Expected:** Error handling with user-facing message.
**Actual:** If the response body isn't valid JSON, an unhandled error. If it is JSON but not the expected shape, `data.joke` may be `undefined`, and `innerHTML` is set to "undefined".

### BUG-004: Multiple concurrent requests on rapid clicking
**Severity:** Medium
**Steps:** Click "Get Another Joke" rapidly 5+ times.
**Expected:** Button disabled during fetch. One request at a time. Or: previous request cancelled when new one starts.
**Actual:** Multiple requests fire simultaneously. The joke that displays is whichever response arrives last (race condition). The user sees jokes flickering.

### BUG-005: Focus indicator removed
**Severity:** High (Accessibility)
**Steps:** Use keyboard to Tab to the button.
**Expected:** Visible focus ring or indicator.
**Actual:** No visible focus indicator. CSS `outline: 0` explicitly removes it.

### BUG-006: XSS via innerHTML
**Severity:** Medium (depends on API trust)
**Steps:** If the API ever returned a joke containing `<script>` tags or HTML, `innerHTML` would render it as HTML.
**Expected:** Joke text displayed as text.
**Actual:** Joke content rendered as HTML. A malicious API response (or a compromised API) could inject scripts.

### BUG-007: overflow:hidden prevents scrolling long jokes
**Severity:** Medium
**Steps:** On a small viewport (e.g., 320x480), if the joke text is long enough to extend beyond the viewport.
**Expected:** User can scroll to read the full joke.
**Actual:** `overflow: hidden` on body prevents scrolling. Content is clipped.

---

## Testing Strategy for v2

### Testing pyramid

```
         /  E2E  \        ← 3-5 critical user journeys (Playwright)
        /----------\
       / Integration \    ← API client + state interactions (Vitest)
      /----------------\
     /   Unit Tests      \ ← Pure functions: state, storage, helpers (Vitest)
    /______________________\
```

### Unit tests (Vitest)

Test pure logic in isolation. No DOM, no fetch.

**State management:**
- Adding a joke to history
- Navigating history (forward, back, boundaries)
- Adding/removing favourites
- Preventing duplicate favourites
- History size limits (if implemented)
- State reset

**Storage module:**
- Saving to localStorage
- Loading from localStorage
- Handling missing data (first visit)
- Handling corrupted data (invalid JSON)
- Handling wrong schema version
- Storage quota exceeded

**API response parsing:**
- Valid response → Joke object
- Missing fields → Error thrown
- Invalid JSON → Error thrown
- Empty joke string → Handled gracefully

**Utility functions:**
- Copy to clipboard (mock navigator.clipboard)
- Share API availability check
- Debounce/throttle behaviour

### Integration tests (Vitest + jsdom or happy-dom)

Test how modules work together with a simulated DOM.

**Fetch + render:**
- Successful fetch → joke displayed in DOM
- Network error → error message displayed
- API error (non-200) → error message displayed
- Loading state → button disabled, loading indicator shown
- Request cancellation on rapid clicks

**State + storage:**
- Favourites saved to localStorage and restored on reload
- History persists across page reloads (if implemented)
- Corrupted localStorage doesn't crash the app

**Search:**
- Search request with results → results displayed
- Search with no results → "no results" message
- Search with empty query → handled (ignored or show all)
- Search pagination (if implemented)

### End-to-end tests (Playwright)

Test real user flows in a real browser. Keep these minimal — they're slow and flaky.

**Critical paths:**
1. **First visit:** Page loads → joke appears → no errors in console
2. **Basic usage:** Load page → read joke → click next → new joke appears → click next → click back → previous joke shows
3. **Favourite flow:** Load page → read joke → click favourite → open favourites → joke is there → unfavourite → joke removed
4. **Copy flow:** Load page → read joke → click copy → clipboard contains joke text
5. **Error recovery:** Load page → go offline → click next → error message shown → go online → click retry → joke loads

### Cross-browser testing

| Browser | Priority | Why |
|---------|----------|-----|
| Chrome (latest) | P0 | Majority of users |
| Safari (latest) | P0 | iOS users, different JS engine |
| Firefox (latest) | P1 | Privacy-focused users |
| Safari iOS | P0 | Mobile is a primary use case |
| Chrome Android | P0 | Mobile is a primary use case |
| Edge | P2 | Chromium-based, usually works if Chrome works |

**API differences to test across browsers:**
- `navigator.clipboard.writeText()` — different permission models
- `navigator.share()` — not available in all browsers/contexts
- `localStorage` — quota and behaviour differences
- CSS `clamp()` — well-supported but worth verifying

---

## Edge Cases to Test

### Joke content
- Empty joke string from API
- Very long joke (200+ characters) — layout, scrolling, font size
- Joke with special characters: quotes, ampersands, angle brackets, unicode, emoji
- Joke with newlines or line breaks (some jokes are multi-line)

### User behaviour
- Rapid clicking (10+ clicks in 1 second)
- Click during loading
- Navigate back past the beginning of history
- Navigate forward past the end of history
- Save the same joke as favourite twice
- Open the app in multiple tabs (localStorage sync)
- Clear localStorage while the app is open
- Exceed localStorage quota

### Network conditions
- Offline at page load (no cached joke yet)
- Offline after some usage (cached jokes available)
- Slow network (3G simulation — 2+ second response times)
- Intermittent connectivity (online → offline → online)
- API returns 429 (rate limited)
- API returns 500 (server error)
- API returns 200 with unexpected body shape
- API returns 200 with empty body
- DNS resolution failure
- CORS error (if API changes its CORS policy)

### Device/viewport
- 320px wide (smallest common mobile)
- 768px (tablet)
- 1920px+ (desktop)
- Landscape orientation on mobile
- Split-screen / multitasking on tablet
- Zoom level 200% (accessibility requirement)

---

## Baseline Test Plan (Pre-Refactor)

Before changing any code, write tests that capture the current behaviour:

1. **Page loads and fetches a joke** — The `generateJoke` function is called on load
2. **Button click fetches a new joke** — Event listener is wired up
3. **Joke text is set via innerHTML** — This will change to textContent, so the baseline test documents the current (incorrect) behaviour
4. **Fetch uses correct URL and headers** — `https://icanhazdadjoke.com` with `Accept: application/json`
5. **No User-Agent header is set** — Documents the current gap

These baseline tests serve as a contract: the refactor must preserve all correct behaviours while fixing the bugs.

---

## Test Infrastructure Recommendations

- **Vitest** for unit and integration tests (pairs with Vite)
- **Playwright** for E2E tests (cross-browser, reliable, good API)
- **MSW (Mock Service Worker)** for mocking API responses in integration tests without coupling tests to implementation details
- **GitHub Actions** for CI — run tests on every PR
- **Coverage target:** 80%+ on the state and API modules. Don't chase 100% — focus coverage on logic, not on DOM wiring.

---

## Top 3 Priorities

1. **Write baseline tests before any refactoring** — Lock down the current behaviour so the refactor can't introduce regressions. This is prerequisite work, not optional.
2. **Fix the critical bugs (silent failures, race conditions)** — BUG-002 and BUG-003 mean the app is broken for any user who encounters a network issue. BUG-004 means rapid clicks produce unpredictable results.
3. **Set up test infrastructure (Vitest + MSW) as part of the Vite migration** — Tests need to be easy to write and fast to run, or they won't get written. Vitest + MSW gives us both.
