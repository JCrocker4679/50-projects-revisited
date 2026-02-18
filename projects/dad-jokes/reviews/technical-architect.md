# Technical Architect Review — Dad Jokes

**Reviewer:** Technical Architect
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

The current codebase is a 20-line tutorial exercise with zero architecture. That's not a criticism — it's accurate scoping for what it was. The interesting question is what architecture serves the v2 vision without over-engineering a joke app.

My recommendation: stay static, stay client-side, use build tooling only where it earns its place. The biggest architectural risk here is doing too much.

---

## Current Architecture Assessment

### What exists
- Single HTML file, single CSS file, single JS file
- No build step, no bundling, no dependencies
- Direct fetch to `https://icanhazdadjoke.com` with no abstraction
- All state is implicit (whatever the DOM shows is the state)

### What's wrong
1. **No separation of concerns.** DOM manipulation, API calls, and "business logic" are all in one 20-line function. Fine for 20 lines. Not fine for the v2 feature set.
2. **No state management.** History, favourites, search results — these all need state that outlives a single render cycle. Currently there is none.
3. **No error boundary.** An unhandled promise rejection will silently fail. The user sees the last joke or the placeholder text and has no idea something went wrong.
4. **No caching or request deduplication.** Each button click fires a new request. No way to go back to a previous joke without refetching.

---

## Recommended Architecture for v2

### Principle: Progressive complexity, not premature complexity

The v2 feature set (history, favourites, search, share, copy) is entirely achievable as a **static client-side application**. No backend needed. No database needed. No auth needed. This is important — the temptation to "do it properly" with a server is the biggest over-engineering risk.

### Stack recommendation

| Layer | Choice | Why |
|-------|--------|-----|
| Build tool | **Vite** | Fast, zero-config for vanilla JS/TS, good dev experience, trivial to deploy |
| Language | **TypeScript** | The state shape (history, favourites, search results) benefits from types. Catches bugs early in a refactor where you're adding state management to code that had none |
| Framework | **None (vanilla TS)** | The UI is simple enough that a framework adds weight without value. If component complexity grows beyond Phase 2, revisit — but not before |
| State | **Simple module-level state + localStorage** | A `state.ts` module exporting getter/setter functions. Favourites and preferences persist to localStorage. No Redux, no signals, no stores |
| API layer | **Thin fetch wrapper** | A `api.ts` module that handles headers, error handling, response parsing. Single responsibility |
| Styling | **CSS (vanilla)** | No preprocessor needed. CSS custom properties for theming if dark mode is added later |
| Testing | **Vitest** | Pairs with Vite, fast, good DX. Use for unit tests on state and API modules |
| Deploy | **Netlify or Vercel** | Static site deploy. Free tier. CI/CD from GitHub |

### Module structure

```
src/
  main.ts          — Entry point, event listeners, orchestration
  api.ts           — Fetch wrapper, error handling, response types
  state.ts         — App state: current joke, history, favourites, search
  ui.ts            — DOM updates, render functions, ARIA management
  storage.ts       — localStorage read/write with validation
  types.ts         — Shared TypeScript types
  constants.ts     — API URLs, limits, keys

public/
  index.html
  favicon.ico

styles/
  main.css
```

This is 6-7 modules, not 60. Each one has a clear reason to exist.

### Data model

```typescript
interface Joke {
  id: string;       // from API
  joke: string;     // the text
  fetchedAt: number; // timestamp
}

interface AppState {
  currentJoke: Joke | null;
  history: Joke[];           // ordered, most recent first
  historyIndex: number;      // for back/forward navigation
  favourites: Joke[];        // persisted to localStorage
  searchQuery: string;
  searchResults: Joke[];
  isLoading: boolean;
  error: string | null;
}
```

### API layer design

The icanhazdadjoke API is simple but has some design constraints worth noting:

- **Rate limiting:** Not documented, but hammering it is poor citizenship. Debounce the button, cache results.
- **Search endpoint:** `GET /search?term={term}&limit={limit}&page={page}` — returns paginated results. This changes the data flow significantly compared to single random jokes.
- **Joke by ID:** `GET /j/{joke_id}` — useful for sharing. A shared URL like `?joke=abc123` can deep-link to a specific joke.
- **No auth required** but they ask for a custom User-Agent header. Set it.

### What I'd push back on

1. **No backend for v2.** The REVIEW.md and big-vision doc hint at accounts, admin dashboards, moderation. Those are v3/v4 concerns. Introducing a backend before you need one adds hosting cost, deployment complexity, security surface area, and maintenance burden. All for a joke app.
2. **No framework.** React, Svelte, etc. would make sense if you had complex component trees, routing, or shared state across many views. This app has one view. One card. A few buttons. Vanilla TS with good module structure handles this cleanly.
3. **No PWA yet.** Service workers and manifests are Phase 3 stretch goals, not foundation work. Don't set up the plumbing until you need it.

---

## Scalability Considerations

This is a static site consuming a third-party API. "Scalability" means:

1. **CDN-served static assets** — Netlify/Vercel handles this. No scaling concerns.
2. **Client-side storage limits** — localStorage has a ~5MB cap per origin. Even at 1000 saved jokes, you're using maybe 200KB. Not a concern.
3. **API rate limits** — The only scaling constraint. If this app got viral traffic, the icanhazdadjoke API might throttle or block you. Mitigations: cache aggressively on the client, don't fetch on every button click if you can serve from history, consider prefetching a small batch.

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| API goes down or changes | Medium | Error handling, cached last-known-good joke, graceful degradation |
| Over-engineering the architecture | High | Stick to vanilla TS, no framework, no backend until proven necessary |
| Scope creep into v3/v4 during v2 | High | DECISIONS.md should lock scope. Phase 2 features only |
| localStorage data corruption | Low | Validate on read, wrap in try/catch, reset gracefully |

---

## Top 3 Priorities

1. **Introduce build tooling (Vite + TypeScript) and module structure** — This is the foundation everything else builds on. Without it, adding features means growing a single script file into an unmaintainable mess.
2. **Create a proper API layer with error handling** — The current bare `fetch` with no error handling is the single biggest functional gap.
3. **Implement state management before adding features** — History, favourites, search all need state. Build the state module first, then the features are straightforward.
