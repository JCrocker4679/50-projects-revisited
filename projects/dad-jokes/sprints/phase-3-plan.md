# Sprint 3 Plan — Dad Jokes: Make it Impressive

**Sprint goal:** Make it the kind of app you bookmark and come back to — with search, ratings, dark mode, and enough test coverage to call it done.

**Planned:** 2026-02-23
**Epic:** #55

---

## Scope decisions

This sprint was scoped down from the Sprint 2 review's original Phase 3 recommendation. Items cut:

| Item | Why cut |
|------|---------|
| Lighthouse / Core Web Vitals audit | Moved to project retrospective or Sprint 4 exit gate. The app already has solid foundations. |
| PWA / service worker / offline / install prompt | Too much tooling risk (Workbox) to bundle into an already features-heavy sprint. Deserves its own focused sprint or a DECISIONS.md discussion. |
| Generated OG images per joke | Satori adds a build step. Not MVP. |

Chosen track: **Features-first** — search and rating as the headline, dark mode and E2E alongside.

---

## Tickets

### Epic
| # | Title | Labels | Complexity |
|---|-------|--------|------------|
| #55 | Epic: Phase 3 — Make it impressive | epic, phase-3 | — |

### User stories
| # | Title | Labels |
|---|-------|--------|
| #56 | Story: Search by keyword | user-story, phase-3 |
| #57 | Story: Joke rating (thumbs up/down) | user-story, phase-3 |
| #58 | Story: Dark mode toggle | user-story, phase-3 |
| #59 | Story: Playwright E2E tests | user-story, phase-3 |

### Tasks
| # | Title | Labels | Complexity | Depends on | Agent | parallel-safe? |
|---|-------|--------|------------|------------|-------|----------------|
| #60 | Spike: Search API endpoint | spike, phase-3 | S | — | frontend | ✅ yes |
| #61 | Search: data layer (api.ts + state.ts) | feature, phase-3 | M | #60 | backend/frontend | no |
| #62 | Search: UI (input, results, clear) | feature, phase-3 | M | #61 | frontend | no |
| #63 | Search: tests | test, phase-3 | S | #61, #62 | qa | no |
| #64 | Rating: data layer (state.ts + storage.ts) | feature, phase-3 | S | — | backend/frontend | ✅ yes |
| #65 | Rating: UI (thumbs buttons in action row) | feature, phase-3 | S | #64 | frontend | no |
| #66 | Rating: tests | test, phase-3 | S | #64, #65 | qa | no |
| #67 | Dark mode: CSS custom properties + dark palette | feature, phase-3 | S | — | frontend | ✅ yes |
| #68 | Dark mode: toggle UI + localStorage | feature, phase-3 | S | #67 | frontend | no |
| #69 | Dark mode: tests | test, phase-3 | S | #67, #68 | qa | no |
| #70 | Playwright: setup + config | test, infrastructure, phase-3 | S | — | qa | ✅ yes |
| #71 | Playwright: E2E tests | test, phase-3 | L | #62, #65, #68, #70 | qa | no |
| #72 | Deploy + verify Sprint 3 | infrastructure, phase-3 | S | all above | qa/infra | no |

---

## Dependency graph

```
Tier 0 (parallel-safe, no dependencies):
  #60 — Spike: search API
  #64 — Rating: data layer
  #67 — Dark mode: CSS
  #70 — Playwright: setup

Tier 1 (depends on Tier 0):
  #61 — Search: data layer        (← #60)
  #65 — Rating: UI                (← #64)
  #68 — Dark mode: toggle UI      (← #67)

Tier 2 (depends on Tier 1):
  #62 — Search: UI                (← #61)
  #66 — Rating: tests             (← #64, #65)
  #69 — Dark mode: tests          (← #67, #68)

Tier 3 (depends on Tier 2):
  #63 — Search: tests             (← #61, #62)

Tier 4 (depends on all features):
  #71 — Playwright: E2E tests     (← #62, #65, #68, #70)

Tier 5 (final gate):
  #72 — Deploy + verify           (← all)
```

## Suggested execution order

Per-ticket merge model (one PR merged before next ticket starts):

1. **#60** — Spike: search API *(kick off first; findings unblock #61)*
2. **#67** — Dark mode: CSS *(parallel-safe; can run while spike is digested)*
3. **#64** — Rating: data layer *(parallel-safe; no deps)*
4. **#70** — Playwright: setup *(parallel-safe; can run any time)*
5. **#61** — Search: data layer *(blocked by #60)*
6. **#65** — Rating: UI *(blocked by #64)*
7. **#68** — Dark mode: toggle UI *(blocked by #67)*
8. **#62** — Search: UI *(blocked by #61)*
9. **#66** — Rating: tests *(blocked by #64, #65)*
10. **#69** — Dark mode: tests *(blocked by #67, #68)*
11. **#63** — Search: tests *(blocked by #61, #62)*
12. **#71** — Playwright: E2E *(blocked by #62, #65, #68, #70)*
13. **#72** — Deploy + verify *(final gate)*

### Parallelism opportunities
Tickets #60, #64, #67, #70 are all parallel-safe. Joe can open two terminal sessions and run two of these simultaneously using `/work-ticket`. Merge both before moving to Tier 1.

---

## What's explicitly NOT in Sprint 3

| Item | Why | Revisit |
|------|-----|---------|
| Lighthouse audit | Deferred — app foundations are solid; audit when content is ready | Project retro or Sprint 4 |
| PWA / service worker | Tooling risk; own sprint or DECISIONS.md discussion | Sprint 4 if wanted |
| Generated OG images | Satori complexity; not MVP | Sprint 4+ |
| Joke of the day permalink | Needs backend | v3 |
| Animated transitions (full) | Crossfade already shipped in Sprint 2; deprioritised | Sprint 4+ |
| Custom domain | Decide when first blog post publishes | Content launch |

---

## Definition of done for Sprint 3

- [ ] Keyword search: input, results, empty state, clear
- [ ] Joke rating: thumbs up/down toggle, persists to localStorage
- [ ] Dark mode: toggle, localStorage persistence, prefers-color-scheme default, no FOUC
- [ ] Playwright: setup complete, E2E tests covering happy path, history, favourites, search, error, dark mode
- [ ] All existing Vitest tests (131+) still passing
- [ ] Deployed to Vercel, all features verified live
- [ ] CHANGELOG.md updated
- [ ] Session log captured

---

*Planned 2026-02-23 by Claude Code (Scrum Master)*
