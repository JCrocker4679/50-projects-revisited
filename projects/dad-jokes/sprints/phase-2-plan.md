# Sprint 2 Plan — Dad Jokes: Make it Useful

**Sprint goal:** Make the app worth coming back to — add joke history, favourites, copy, and share so users can do something with jokes, not just read them. Ship with a visual refresh that makes it feel like a real product.

**Epic:** #29 — [Phase 2: Make it useful](https://github.com/JCrocker4679/50-projects-revisited/issues/29)

**Phase:** 2 of 3
**Planned:** 2026-02-19

---

## Scope decisions

### What's in scope

| Feature | Rationale |
|---------|-----------|
| OG image (PNG) | Carry-over from Sprint 1 — small, high polish impact |
| Web Share + Clipboard spike | Must spike before building either feature |
| Joke history (data + UI) | Core "come back" value; most architectural new work |
| Copy to clipboard | Small, high value, near-zero complexity |
| Web Share API | Builds on copy; native mobile sharing |
| Favourites (star + list view) | Core engagement feature; pairs well with history |
| Visual refresh | New UI elements demand cohesive design |
| Analytics events | Small, high signal, already have the platform |
| Sprint 2 tests (gap-fill) | Keep coverage high after adding new state/storage |
| Deploy + verify | Hard gate before sprint review |

### What's explicitly pushed to Sprint 3

| Item | Why pushed |
|------|-----------|
| Search by keyword | New UI surface (search input, results list, debounce) — significant complexity for a feature that's "nice to have" vs. "core useful" |
| Playwright E2E tests | Adds tooling setup overhead; Sprint 2 features need unit tests first |
| Dark mode | Sprint 3+ per DECISIONS.md |
| PWA / service worker | Sprint 3+ per DECISIONS.md |
| Animated transitions | Sprint 3+ per DECISIONS.md |
| Custom domain | Decide at Phase 3 |

---

## Tickets

| # | Title | Size | Type | Blocked by | Agent |
|---|-------|------|------|-----------|-------|
| #29 | Epic: Phase 2 | — | epic | — | — |
| #30 | Spike: Web Share + Clipboard API | S | spike | — | frontend |
| #31 | Fix OG image (PNG 1200×630) | S | feature | — | frontend |
| #32 | Joke history: data layer (localStorage + state) | M | feature | — | frontend/qa |
| #33 | History nav UI (back/forward buttons) | M | feature | #32 | frontend |
| #34 | Copy joke to clipboard | S | feature | #30 | frontend |
| #35 | Web Share API with clipboard fallback | M | feature | #30, #34 | frontend |
| #36 | Favourites: star/unstar + localStorage | M | feature | — | frontend |
| #37 | Favourites list view | M | feature | #36 | frontend/ux |
| #38 | Visual refresh (palette, action row, copy) | L | feature | — | frontend/ux |
| #39 | Analytics events (Vercel Analytics) | S | feature | — | frontend |
| #40 | Sprint 2 tests: gap-fill and coverage check | M | test | #32–#37 | qa |
| #41 | Deploy + verify | S | feature | all above | architect + Joe |

---

## Dependency graph

```
main
├── #30 Spike (Web Share + Clipboard) — independent
├── #31 OG image — independent
├── #32 History data layer — independent
│   └── #33 History nav UI
├── #34 Copy to clipboard ← #30
│   └── #35 Web Share ← #30, #34
├── #36 Favourites data + star ← independent
│   └── #37 Favourites list view ← #36
├── #38 Visual refresh — independent (coordinates with #33, #34, #35, #36, #37 for action row)
├── #39 Analytics events — independent
└── #40 Tests (gap-fill) ← #32, #33, #34, #35, #36, #37
    └── #41 Deploy + verify ← all above
```

**Parallelism available:**
- #30 (spike), #31 (OG image), #32 (history data), #36 (favourites data), #38 (visual refresh), #39 (analytics) can all start immediately — no dependencies
- #33, #34, #35, #37 follow their respective blockers
- #40 is the integration test pass — runs after all feature tickets
- #41 is always last

---

## Suggested execution order

Respecting dependencies, smallest first within tiers:

**Tier 0 — No dependencies (can start immediately):**
1. #30 — Spike (S) — do this first; its findings inform #34 and #35
2. #31 — OG image (S) — quick carry-over, clear requirements
3. #39 — Analytics events (S)
4. #32 — History data layer (M)
5. #36 — Favourites data + star (M)
6. #38 — Visual refresh (L) — start early, it's large

**Tier 1 — After their blockers:**
7. #34 — Copy to clipboard (S) ← after #30
8. #33 — History nav UI (M) ← after #32
9. #37 — Favourites list view (M) ← after #36

**Tier 2 — After tier 1:**
10. #35 — Web Share (M) ← after #30 + #34

**Tier 3 — Integration:**
11. #40 — Tests gap-fill (M) ← after #32–#37
12. #41 — Deploy + verify (S) ← after all above

---

## Key notes for sprint-run

### All PRs target main
Every branch off `main`, every PR to `main`. No stacked PRs. See sprint-run command for details.

### CHANGELOG is mandatory per-ticket
Every PR that adds user-visible behaviour must include a CHANGELOG.md entry. The deploy ticket (#41) does a final verification pass.

### The visual refresh (#38) coordinates with action row tickets
Tickets #34, #35, #36, and #37 all add buttons to the action row. The visual refresh (#38) designs the action row. Execution order: feature tickets stub the HTML elements → visual refresh ticket styles them cohesively. If #38 runs before #34–#37, some action row elements won't exist yet. Recommended: run #38 last in tier 0, after at least #34 and #36 are in place.

### Spike findings (#30) must be captured
The spike ticket (#30) produces a findings doc or detailed PR description that the copy (#34) and share (#35) tickets reference. Don't skip this — it's what prevents rework.

### Deploy (#41) is blocked by Joe
The deploy ticket includes a manual verification checklist. The sprint-review pre-flight check will block until Joe confirms the live URL works. This is intentional — "deployed" means "verified working in a browser."

---

## Definition of done for Sprint 2

- [ ] Joke history stored in localStorage (last 50 jokes)
- [ ] Back/forward navigation through history
- [ ] Copy joke to clipboard — single click, feedback on success
- [ ] Web Share API on mobile, clipboard fallback on desktop
- [ ] Favourites — star/unstar a joke, persisted to localStorage
- [ ] Favourites list view — see and delete saved favourites
- [ ] Visual refresh — new colour palette, button copy refinement, action row design
- [ ] OG image PNG (1200×630) replacing placeholder SVG
- [ ] Analytics events wired (joke_fetched, error_shown, retry_clicked, favourite_added, share_clicked)
- [ ] All tests passing, coverage ≥ 80% on storage.ts + state.ts
- [ ] Deployed to Vercel and confirmed working by Joe
- [ ] CHANGELOG.md up to date

---

## Estimated scale

| Size | Count |
|------|-------|
| S (Small) | 4 tickets (#30, #31, #34, #39, #41) |
| M (Medium) | 5 tickets (#32, #33, #35, #36, #37, #40) |
| L (Large) | 1 ticket (#38) |

Similar total scope to Sprint 1 (14 tickets, ~2 sprint sessions).
