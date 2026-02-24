# Sprint 3 Plan Review — Dad Jokes (Phase 3) — Second Pass

**Reviewed:** 2026-02-23 (second pass, after partial sprint execution)
**Reviewer:** UX Designer + Product Designer + QA Engineer (Claude Code)
**Sprint plan:** phase-3-plan.md
**Context:** Tickets #60, #64, #65, #67, #68 are closed and merged. Reviewing remaining open tickets in light of (a) what was actually built and (b) the Visual Designer review that arrived on branch `68-dark-mode-toggle`.

---

## Summary

Sprint 3 is about 40% done: the search spike is resolved, the rating data layer and UI are merged, and the dark mode CSS and toggle are shipped. The remaining open tickets are the search feature (#61, #62, #63), the rating/dark mode tests (#66, #69), the Playwright infrastructure (#70, #71), and deployment (#72).

**Three risks going into the remaining work:**

1. **Visual Designer review conflicts with already-merged decisions.** The `/agent-visual-designer` review (in `reviews/visual-designer.md`) raises five design decisions (D-VD1 through D-VD5) that contradict decisions made in the first plan review — specifically the placement of rating buttons (in history nav, now recommended to move to action row), the CTA row layout, and the favourites reveal pattern. These decisions need resolution before the search UI ticket (#62) adds yet another element to the card. **This is the highest-risk item in the sprint.**

2. **Search UI ticket (#62) requires main.ts changes not mentioned in the ticket scope.** The ticket says "ui.ts and style.css" but the orchestration work (wiring up search submit, clear, and result-click to call state functions and update button state) lives in main.ts. Without this being explicit, the executing agent may produce a UI with no working wiring.

3. **Dark mode tests ticket (#69) references `initTheme()` which does not exist.** The actual implementation uses `theme-init.ts` as a top-level side-effect module, not an exported function. Tests need to adapt — a direct import of `theme-init.ts` will run as a side-effect and may corrupt test state.

---

## Visual Designer Review — Action Required

The Visual Designer review (`reviews/visual-designer.md`) was produced after the first plan review but BEFORE this second pass. It raises five decisions that are **in conflict with merged code**:

| Decision | Visual Designer recommendation | Current implementation | Status |
|----------|-------------------------------|----------------------|--------|
| D-VD1 — Rating button location | Move to action row | In history nav row (`.history-nav__rating`) — merged in #65 | ⚠️ **Conflict** |
| D-VD2 — CTA row layout | CTA gets its own row | CTA shares flex row with icon buttons | ⚠️ **Conflict** |
| D-VD3 — Favourites reveal pattern | Bottom Sheet | In-card expand (from Sprint 2) | ⚠️ **Conflict** |
| D-VD4 — Favourites button zero-state | Hide until count ≥ 1 | Always visible, shows "(0)" | ⚠️ **Conflict** |
| D-VD5 — Icon button visual weight | Ghost (no border) | Bordered 48px squares (`.btn--icon`) | ⚠️ **Conflict** |

**These conflicts must be resolved in `/product-decisions` before proceeding with #62 (Search UI).** Adding a search bar to a card with an unresolved layout hierarchy problem will compound the problem. At a minimum, D-VD1 must be resolved before the search UI is built — if ratings move back to the action row, the search UI wireframe in #62 needs updating too.

**Recommendation:** Run `/product-decisions` to adjudicate D-VD1 through D-VD5. Sprint 3 execution can continue for #61 (data layer, no UI changes) and #66 (tests) and #70 (Playwright setup) while decisions are pending. Do NOT execute #62 until D-VD1 is resolved.

---

## Ticket-by-ticket findings

### #61 — Search: data layer

No new issues found. UX note from first review is in the ticket body (history nav disabled during search, `isSearchActive` getter). Implementation note: `state.ts` already imports from `storage.ts` — search state does not need localStorage persistence (it's transient). Confirm: `clearSearch()` should NOT write to storage.

**No changes needed.**

---

### #62 — Search: UI

**UX finding (new — main.ts wiring):** The ticket scope says "ui.ts and style.css" but search orchestration requires changes to `main.ts`. The executing agent must wire up:
1. Form submit handler: call `searchJokes()`, pass results to `setSearchResults()`, disable history nav, render results
2. Clear handler: call `clearSearch()`, re-enable history nav, render last random joke
3. Result-click handler: call `selectSearchResult(index)`, render joke, update rating/fav button state

**Wireframe note:** If D-VD1 is resolved to move ratings to the action row, the search UI wireframe needs updating — the search input goes between h1 and joke text, and the action row below the joke will have more buttons in it.

**Blocker note:** **Do not execute #62 until D-VD1 is resolved.** The wireframe added to the ticket in the first review shows ratings in the action row (consistent with the visual designer recommendation) but the current implementation has them in the nav row. The executing agent needs the final answer before building the search UI.

**Action:** Update ticket #62 with:
> ⚠️ **BLOCKED pending product decision on D-VD1 (rating button location).** See `reviews/visual-designer.md` and `/product-decisions`. Do not start until D-VD1 is resolved. If ratings move to the action row, update the wireframe in the UX notes section before executing.

---

### #63 — Search: tests

No new issues. QA note from first review is in the ticket body (search+history integration is an E2E concern, not a unit test concern). Implementation note: extend existing `state.test.ts` for search state functions; add a new `api.test.ts` `describe('searchJokes')` block — do not create a new file.

**Action:** Add note to ticket:
> **QA note (second-pass):** Add search tests to existing `src/test/api.test.ts` (new `describe('searchJokes')` block) and `src/test/state.test.ts` (new `describe('State: search')` block). Do not create new test files. The existing MSW setup in `src/test/mocks/` should be extended with a search handler.

---

### #66 — Rating: tests

**QA finding:** The ticket doesn't mention that the test files already exist. An executing agent may create new files instead of extending the existing ones.

**Action:** Updated in GitHub — extend existing `state.test.ts` and `storage.test.ts`, match existing localStorage mock pattern.

---

### #69 — Dark mode: tests

**QA finding (critical):** The ticket references `initTheme()` which does not exist in the implementation. `theme-init.ts` is a 4-line side-effect module (top-level code, no exported functions). Importing it in a test will execute the side-effect against happy-dom state.

**Recommended approach:** Extract the init decision logic to a pure helper that can be tested in isolation:
```typescript
// testable helper (add to theme.ts or a new theme-utils.ts)
export function computeInitialTheme(saved: string | null, prefersDark: boolean): 'light' | 'dark' {
  if (saved === 'dark') return 'dark';
  if (!saved && prefersDark) return 'dark';
  return 'light';
}
```
Test `computeInitialTheme` directly. Test `applyTheme`, `toggleTheme`, and `getTheme` from `theme.ts` directly.

**Action:** Updated in GitHub with this approach.

---

### #70 — Playwright: setup

No new issues. Ticket is well-specified. Confirm: create `e2e/` directory at `projects/dad-jokes/refactored/e2e/` (not at repo root).

**No changes needed.**

---

### #71 — Playwright: E2E tests

The QA notes from the first review are already in the ticket body (three additional scenarios: search+history integration, rating persistence, dark mode FOUC). No new issues found.

**One additional scenario to add:** Rating state update on history navigation.
- Rate joke #1 as thumbs up
- Click "Next →" (new joke)
- Assert: thumbs up shows *not active* (new joke has no rating)
- Click "← Prev" (back to joke #1)
- Assert: thumbs up shows *active* (aria-pressed="true")

This tests the `updateRatingButtons(getRating(joke.id))` call in `handleHistoryNav()` which is easy to miss.

**Action:** Add scenario to #71.

---

### #72 — Deploy + verify

No UX or QA issues. Deployment ticket is a checklist.

**One note:** If D-VD1 through D-VD5 result in UI changes, deploy after those changes are merged, not before. Sequence matters.

**No changes needed unless VD decisions produce new tickets.**

---

## Parallel-safe audit (remaining open tickets)

| # | Label | Verdict |
|---|-------|---------|
| #61 | not labelled | Correct — touches state.ts (shared file, no parallel safety) |
| #62 | not labelled | Correct — touches ui.ts, style.css, main.ts |
| #63 | not labelled | Correct — depends on #61 and #62 |
| #66 | not labelled | ⚠️ Could run in parallel with #61 (different describe blocks in state.test.ts). **But state.test.ts is a shared file** — merge conflicts possible. Keep sequential. |
| #69 | not labelled | Correct — tests theme.ts. Could technically run parallel to #66 (different files) but keep sequential to avoid test infrastructure conflicts. |
| #70 | ✅ `parallel-safe` | Correct — creates new files only, no shared file conflicts |
| #71 | not labelled | Correct — depends on all features |
| #72 | not labelled | Correct — final gate |

---

## Visual Designer Decisions Log

These decisions come from `reviews/visual-designer.md` and must be resolved in `/product-decisions` before further UI work:

| Decision | Options considered | Visual Designer recommendation | Must resolve before |
|----------|-------------------|-------------------------------|---------------------|
| D-VD1 — Rating button location | History nav row (current) vs. action row | Action row | #62 (search UI) |
| D-VD2 — CTA row layout | CTA shares action-row (current) vs. CTA own row | Own row | #62 |
| D-VD3 — Favourites reveal | In-card expand (current) vs. bottom Sheet | Bottom Sheet | New ticket (not Sprint 3?) |
| D-VD4 — Favourites zero-state | Always visible (current) vs. hidden until count ≥ 1 | Hidden until ≥ 1 | New ticket (not Sprint 3?) |
| D-VD5 — Icon button weight | Bordered 48px (current) vs. ghost style | Ghost style | #62 |

D-VD3 and D-VD4 concern the favourites panel (Sprint 2 work). Resolving these may create new Sprint 3 tickets or defer to a Sprint 4 visual pass. D-VD1, D-VD2, D-VD5 affect the current card layout and should be resolved before the search UI is built into the same card.

---

## Tickets updated in this second-pass review

- #62 — Added main.ts wiring note + blocker pending D-VD1 decision
- #63 — Added note about extending existing test files
- #66 — Added note about extending existing test files (match existing mock pattern)
- #69 — Updated with correct implementation approach (`computeInitialTheme` helper)
- #71 — Additional E2E scenario for rating state on history navigation

**5 tickets updated.**

---

## Recommended execution order for remaining tickets

1. **Run `/product-decisions` on D-VD1 through D-VD5** (or at minimum D-VD1, D-VD2, D-VD5 as the Sprint 3 blockers)
2. **#61** — Search data layer (no UI, safe to proceed)
3. **#70** — Playwright setup (parallel-safe, proceed now)
4. **#66** — Rating tests (no UI, safe to proceed)
5. **#69** — Dark mode tests (no UI, safe to proceed)
6. **[After product decisions]** — Update #62 wireframe if needed, then execute #62
7. **#63** — Search tests (after #61 and #62)
8. **#71** — E2E tests (after all features)
9. **#72** — Deploy (final gate)

---

*Plan review (second pass) completed 2026-02-23 by Claude Code (UX Designer + Product Designer + QA Engineer)*
