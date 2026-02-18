# Frontend Engineer Review — Dad Jokes

**Reviewer:** Senior Frontend Engineer
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

The original code is a functional prototype that demonstrates one thing well: fetching and displaying data from an API. As a tutorial exercise, it works. As frontend engineering, it has fundamental issues in performance, accessibility, resilience, and code organisation that need addressing before any features are added.

The good news: the feature set for v2 is well within vanilla JS/TS capabilities. No framework needed. The refactor is primarily about introducing structure and handling edge cases the tutorial ignored.

---

## Code Quality Assessment

### HTML (`index.html`)

**Issues:**
- `<div class="joke" id="joke">// Joke goes here</div>` — This is visible to the user on first load before JS runs. A developer comment displayed as content.
- No `<main>` landmark. The `<div class="container">` should be a `<main>`.
- No `lang` attribute on the joke content (fine since the page is `lang="en"` and the API returns English jokes).
- `<h3>` used as the first heading. Should be `<h1>` — the heading level hierarchy starts at 1 on every page.
- No `<meta name="description">`. No Open Graph tags. No favicon link.
- `IE=edge` meta tag is vestigial — IE is dead. Remove it.
- No `<noscript>` fallback.

### CSS (`style.css`)

**Issues:**
- `@import url(...)` for Google Fonts — **render-blocking**. This fetches a CSS file, which then fetches the font file. Two network requests before any text renders. Should use `<link rel="preconnect">` + `<link rel="stylesheet">` in the HTML head, or self-host the font.
- `overflow: hidden` on `body` — prevents scrolling entirely. If the joke text is long enough to overflow the viewport (small screen + long joke), the user literally cannot read the full joke.
- `.btn:focus { outline: 0; }` — **Accessibility violation.** Removes the focus indicator entirely. Keyboard users and assistive technology users cannot see where focus is. This is a WCAG 2.1 failure (2.4.7 Focus Visible, Level AA).
- Font loaded is `Roboto:wght@700` (bold only), but the joke text isn't bold. The browser will faux-bold the 700 weight or use it for all text, which means the body text is heavier than intended. Should load 400 and 700, or just 400.
- No CSS custom properties. Everything is hardcoded. Makes theming (dark mode) harder later.
- No responsive breakpoints. The design relies on `max-width: 100%` and `width: 800px` on the container. This works by accident on mobile but the 30px font size on the joke text will be too large on small screens, and the 50px padding top/bottom wastes space.
- No `:hover` state on the button. Only `:active` (scale down) and `:focus` (outline removed). The button has a `cursor: pointer` but no visual hover feedback.
- Colour contrast: `#9f68e0` (button) on `#686de0` (background) — both are mid-range purples. The button text (#fff on #9f68e0) has a contrast ratio of approximately 3.5:1. WCAG AA requires 4.5:1 for normal text. **Fails contrast.**

### JavaScript (`script.js`)

**Issues:**
- `innerHTML` used to set joke text. XSS vector. The API likely returns safe strings, but `textContent` is the correct choice for text-only content.
- No `async/await` error handling. If `fetch` throws (network error) or `res.json()` throws (malformed response), the promise rejects silently. No try/catch.
- No check on `res.ok`. A 500 response from the API would still attempt to parse JSON, likely throwing an uninformative error.
- No loading state. The button remains clickable during fetch. Multiple rapid clicks queue multiple requests. The user gets no feedback that anything is happening.
- No debouncing or request cancellation. If a user clicks 5 times quickly, 5 requests fire. The last one to resolve "wins" and updates the DOM, but the order is non-deterministic.
- No User-Agent header. The API requests one.
- Variables are declared with `const` at the top level — fine. But `generateJoke` is declared as a function declaration after being called, relying on hoisting. Not wrong, but a function expression or moving the call after the declaration is clearer.
- No separation between data fetching and DOM manipulation. Both happen in the same function.

---

## Recommended UI Architecture

### Component structure (without a framework)

Even without React/Svelte, I'd think in terms of rendering functions:

```
renderJoke(joke: Joke | null, isLoading: boolean, error: string | null)
renderHistory(history: Joke[], currentIndex: number)
renderSearchResults(results: Joke[], query: string)
renderFavourites(favourites: Joke[])
renderActions(joke: Joke | null)  // copy, share, favourite buttons
```

Each function takes data and updates a specific part of the DOM. None of them fetch data. None of them manage state. They just render.

### Event handling

One module (`main.ts`) wires up event listeners. Event handlers call state-modifying functions, which trigger re-renders. This is a manual version of the unidirectional data flow pattern.

```
User clicks "Next" → handler calls fetchNewJoke() → state updates → re-render
User clicks "Back" → handler calls navigateHistory(-1) → state updates → re-render
User clicks "Copy" → handler calls copyToClipboard(state.currentJoke) → toast shown
```

### Performance considerations

1. **Font loading:** Preconnect to Google Fonts, or better, self-host Roboto. Use `font-display: swap` to prevent invisible text during load.
2. **First paint:** The joke container should show a skeleton or nothing on initial load, not a developer comment. The first joke fetch should start immediately.
3. **Request management:** Use `AbortController` to cancel in-flight requests when a new one starts. This prevents race conditions with rapid clicks.
4. **DOM updates:** Batch DOM writes. Don't read-then-write in a loop. For this app's complexity it won't matter, but it's a good habit.
5. **Image/asset loading:** Currently none, but if OG images or icons are added later, lazy-load them.

### Responsive strategy

- **Mobile first.** Base styles for 320px and up. One breakpoint at ~640px for desktop.
- The joke font size should scale: `clamp(1.125rem, 4vw, 1.875rem)` gives a range from 18px to 30px based on viewport.
- Container padding should reduce on mobile. 50px vertical padding is luxurious on desktop, wasteful on a 5" screen.
- Action buttons (copy, share, favourite, next, back) need touch targets of at least 44x44px per WCAG.
- Consider a bottom-anchored action bar on mobile, since thumbs reach the bottom of the screen more easily.

---

## Build Tooling

### Vite setup

```
npm create vite@latest dad-jokes -- --template vanilla-ts
```

This gives us:
- TypeScript compilation
- Hot module replacement in dev
- Optimised production builds
- Import/export module system
- Easy plugin ecosystem for anything we need later

### What I'd add beyond the template:
- `vite-plugin-html` for HTML templating if needed (probably not)
- PostCSS autoprefixer if we care about older browser support
- A Vitest config for testing

### What I would NOT add:
- CSS preprocessor (vanilla CSS custom properties are sufficient)
- Linting/formatting can be added but isn't a priority for the refactor itself
- Any UI component library

---

## Accessibility Remediation Plan

This is non-negotiable work that must happen in Phase 1:

1. **Focus styles:** Replace `outline: 0` with a visible focus ring. `outline: 2px solid currentColor; outline-offset: 2px;` as a baseline, then refine visually.
2. **ARIA live region:** The joke container needs `aria-live="polite"` so screen readers announce new jokes.
3. **Heading hierarchy:** Change `<h3>` to `<h1>`.
4. **Semantic HTML:** Change the joke `<div>` to a `<p>`. Add `<main>` landmark.
5. **Colour contrast:** Darken the button colour or lighten the text. Button text needs at least 4.5:1 ratio.
6. **Button state:** Disable the button during loading with `aria-busy="true"` on the joke container.
7. **Touch targets:** Ensure all interactive elements are at least 44x44px.

---

## Top 3 Priorities

1. **Fix accessibility violations (focus styles, contrast, ARIA, semantics)** — These aren't enhancements, they're bug fixes. The app is currently unusable for keyboard and screen reader users.
2. **Add error handling and loading states** — The app silently fails on network errors and gives no feedback during fetches. This is the most visible functional gap.
3. **Introduce Vite + TypeScript and module structure** — Before adding any features, the code needs to be organised into modules. One script file will not survive the addition of history, search, favourites, and actions.
