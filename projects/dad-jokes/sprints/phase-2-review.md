# Sprint 2 Review & Retrospective — Dad Jokes

**Sprint:** 2 of 3 — Make it Useful
**Date:** 2026-02-23
**Facilitator:** Claude Code (Scrum Master)
**Attendees:** Joe Crocker

---

## Sprint Goal

> **Make the app worth coming back to — add joke history, favourites, copy, and share so users can do something with jokes, not just read them. Ship with a visual refresh that makes it feel like a real product.**

**Verdict: ✅ Goal Met — all tickets shipped, deployed, and verified**

12 of 12 work tickets shipped. 12 PRs merged to `main`. 131 tests passing (up from 55), 100% line coverage. App live at `dad-jokes-revisited.vercel.app`.

---

## Sprint Review — What We Delivered

### Ticket-by-Ticket

| # | Title | Status | PR | Notes |
|---|-------|--------|----|-------|
| #30 | Spike: Web Share + Clipboard API | ✅ Done | #42 | Findings doc produced; informed #34 and #35 |
| #31 | Fix OG image (PNG 1200×630) | ✅ Done | #43 | Carry-over from Sprint 1; quick win |
| #39 | Analytics events | ✅ Done | #44 | 8 typed events; `safeTrack()` wrapper |
| #32 | Joke history: data layer | ✅ Done | #45 | localStorage, last 50 jokes, persists across reloads |
| #36 | Favourites: star/unstar + localStorage | ✅ Done | #46 | Max 100 favourites, `aria-pressed` on star button |
| #38 | Visual refresh | ✅ Done | #47 | Warm amber/cream palette, action row, icon buttons |
| #34 | Copy to clipboard | ✅ Done | #48 | 2s "✓ Copied!" feedback, `execCommand` fallback |
| #33 | History nav UI (back/forward) | ✅ Done | #49 | Position counter "2 / 8" |
| #35 | Web Share API + clipboard fallback | ✅ Done | #50 | Native share on mobile, clipboard on desktop |
| #37 | Favourites list view | ✅ Done | #51 | Browse + delete; live count badge; empty state |
| #40 | Tests: gap-fill + coverage check | ✅ Done | #52 | 131 tests, 100% line coverage |
| #41 | Deploy + verify | ✅ Done | #53 | CHANGELOG cleaned; live URL confirmed working |

**12/12 tickets complete. 0 carry-over.**

### Definition of Done — Checklist

- [x] Joke history stored in localStorage (last 50 jokes)
- [x] Back/forward navigation through history
- [x] Copy joke to clipboard — single click, feedback on success
- [x] Web Share API on mobile, clipboard fallback on desktop
- [x] Favourites — star/unstar a joke, persisted to localStorage
- [x] Favourites list view — see and delete saved favourites
- [x] Visual refresh — warm amber palette, action row, button copy
- [x] OG image PNG (1200×630) replacing placeholder SVG
- [x] Analytics events wired (8 typed events)
- [x] All tests passing, 100% line coverage
- [x] Deployed to Vercel and confirmed working
- [x] CHANGELOG.md up to date

### What the App Can Do Now

Before Sprint 2: fetch a joke, see an error if the API fails.

After Sprint 2:
- **Browse jokes over time** — back/forward through the last 50 jokes seen, position-tracked ("2 / 8"), history persists on reload
- **Save favourites** — star any joke, up to 100 saved, with a browsable list view and per-joke delete
- **Copy a joke** — one click, 2-second confirmation, works on all browsers
- **Share a joke** — native share sheet on iOS/Android; clipboard on desktop
- **Feels designed** — warm amber/cream palette, icon buttons in an action row, crossfade animation on new jokes
- **Tracked** — 8 analytics events for every meaningful interaction, safely wrapped so failures are silent

### Metrics

| Metric | Sprint 1 | Sprint 2 | Delta |
|--------|----------|----------|-------|
| Source files | 7 | 8 (+`analytics.ts`) | +1 |
| Source lines (non-test) | ~600 | ~900 | +300 |
| Test lines | ~700 | 1,262 | +562 |
| Tests | 55 | 131 | +76 |
| Coverage | 97% | 100% | +3% |
| Issues closed | 13 | 12 | — |
| PRs merged | 13 | 12 | — |

---

## Retrospective

### What Went Well

**1. The pipeline held up for a larger sprint.**
Sprint 1 proved the workflow. Sprint 2 confirmed it scales. 12 tickets, substantial new state management, a new module (`analytics.ts`), a visual rethink — all shipped cleanly with zero rework.

**2. The spike genuinely earned its place.**
`#30` (Web Share + Clipboard spike) was the first ticket in the execution order. The findings document it produced directly shaped how `#34` and `#35` were built — particularly the fallback strategy and the dismissed-share-sheet edge case. The pattern works: spike first, build second.

**3. Analytics module design was smart.**
The `safeTrack()` wrapper — catching errors from Vercel Analytics so they never surface to users — is a clean pattern. The typed event map means you can't typo an event name. Worth copying to every future project.

**4. Test coverage improved despite scope expanding.**
Sprint 1 ended at 97% coverage with 55 tests. Sprint 2 added significant new state logic (history, favourites, multiple storage keys, UI interactions) and still pushed to 100% line coverage. The test-gap-fill ticket at the end of the sprint is the right model.

**5. CHANGELOG discipline held.**
Every ticket included a CHANGELOG entry. The deploy ticket did a final verification pass. The document accurately reflects the sprint. This is a solvable operational habit — it just needs to be in the sprint structure.

---

### What Didn't Go Well

**1. Merge conflicts from autonomous sprint-run without PR merges between waves.**

The sprint executor ran multiple tickets and opened PRs before any were merged. Because all branches were off `main` at a fixed point, and because several tickets touched overlapping files (`ui.ts`, `style.css`, `state.ts`), PRs that were opened later conflicted with changes made by tickets executed earlier.

The tickets with declared dependencies (`#33` ← `#32`, `#35` ← `#30 + #34`, etc.) were correctly sequenced, but the implementation files they all touched were effectively a shared surface. When `#36` (favourites data) and `#38` (visual refresh) both modified `ui.ts` independently, the second PR to reach GitHub had conflicts.

**Root cause:** The sprint-run checkpoint model (open all PRs in a wave, then stop for merges) assumed ticket authors would write defensively against each other's branches. They wrote against `main`, which hadn't moved.

**Mitigation already applied:** The sprint-run command has been updated. Future sprints will stop after each individual ticket, not after a whole wave, requiring a merge before the next ticket starts. This eliminates the conflict surface.

**2. UX decisions in sprint planning lacked specialist review.**

Looking at the shipped product, some UX choices are functional but not considered:
- The favourites panel appears as a separate view with a toggle — but the transition is abrupt. There's no animation, no clear indication of where you "are" in the UI.
- The action row has four icon buttons (copy, share, star, back, forward) with no labels. Icon-only buttons are a known accessibility risk — the `aria-label` attributes are there, but a first-time user has no visual affordance.
- History position counter ("2 / 8") appears above the action row. A UX reviewer would likely question whether that's the right place, or whether the back/forward buttons should be more clearly paired with the counter.

These aren't bugs. But they're the kind of decisions that benefit from someone asking "how does a user understand this?" before the code is written.

**Root cause:** Sprint planning currently has no specialist review step. DECISIONS.md feeds the sprint brief, the sprint plan breaks it into tickets, and sprint-run executes. There's no moment where the UX agent (or any specialist) reviews the plan before execution begins.

**See: Process Improvement #2 below for a proposed fix.**

**3. The visual refresh (#38) was sequenced as "independent" but should have waited.**

The sprint plan noted this risk: `#38` designs the action row, but `#33`, `#34`, `#35`, `#36`, `#37` all add buttons to the action row. The execution order worked in practice (visual refresh ran mid-sprint, after some features were stubbed), but the note in the sprint plan was a workaround, not a solution. A better dependency model would have `#38` explicitly depend on the feature tickets that define the action row's contents.

---

### What Surprised Us

**1. 100% line coverage on a complex stateful codebase.**
After adding history, favourites, copy, share, analytics — a lot of branching logic, async flows, and localStorage interaction — hitting 100% line coverage in the test gap-fill ticket was not a given. The test infrastructure established in Sprint 1 (Vitest + MSW + happy-dom) made it tractable.

**2. The analytics module was generated cleanly on the first pass.**
Typed event maps, `safeTrack()` error wrapper, `inject()` on load — this came out of a single ticket with no rework. It's a pattern worth templating for future projects.

**3. The visual refresh is the biggest quality signal.**
Functionally, every feature in this sprint could have been built on top of the Sprint 1 purple palette. The amber/cream refresh makes the app feel intentional. This is the first sprint where you could show it to someone and they wouldn't immediately say "tutorial project."

---

### What to Change — Process Improvements

**Process Improvement #1: Sprint-run now stops after each ticket (already applied)**

The sprint-run command has been updated to require a merge between each ticket rather than batching a wave. This eliminates the merge conflict surface. The trade-off is more manual intervention — but the alternative (debugging conflicts) costs more time.

**Process Improvement #2: Specialist sprint plan review before execution**

Currently: DECISIONS.md → sprint plan → sprint-run.

Proposed: DECISIONS.md → sprint plan → **specialist review pass** → sprint-run.

After `/sprint-plan` produces the plan, run one or more agent reviewers against it before committing to execution. The UX agent is the highest-value reviewer here — UX decisions that are made implicitly in a sprint plan (what does the favourites panel look like? how are icon buttons labelled?) get made explicitly by a specialist before any code is written.

Concretely, add a `/sprint-plan-review` step (or fold it into `/sprint-plan`) where the UX agent (and optionally QA) reviews the proposed ticket list and surfaces interaction design decisions that need to be resolved before execution starts. These decisions get written into the ticket description, not left to the implementing agent to decide at runtime.

**Trade-off:** Adds one step between planning and execution. Worth it for any ticket that involves new UI surfaces or interaction patterns.

**Process Improvement #3: Parallelise non-conflicting tickets with sub-agents**

Currently all ticket execution is synchronous — one ticket at a time, in sequence. With the new per-ticket merge checkpoint, this is even more sequential than Sprint 2 was.

The opportunity: truly independent tickets (different files, no shared state) could run in parallel via sub-agents. In Sprint 2, `#30` (spike), `#31` (OG image), `#39` (analytics), and `#32` (history data layer) had zero file overlap. They could theoretically run concurrently.

**Current constraint:** Claude Code doesn't natively parallelise ticket execution within a single sprint-run session. The Task tool can spawn sub-agents, but sub-agents don't have access to the git workflow tools (branch creation, commits, PR opening) in a way that's reliably composable back to the parent session.

**Practical near-term approach:** Identify clearly independent tickets in the sprint plan (label them `parallel-safe`), and document them as candidates for running in separate terminal sessions simultaneously. This is a manual orchestration step — Joe could open two Claude Code sessions and run one ticket in each. Not automated, but faster than sequential for large sprints.

**Longer-term:** Revisit as sub-agent tooling matures. The pattern is sound; the infrastructure constraint is the blocker.

---

## Reprioritisation

### REVIEW.md Status After Sprint 2

Phase 1: ✅ Complete
Phase 2: ✅ Complete (all 12 tickets)
Phase 3: Remaining

### Phase 3 — Revised Priority Order

Original Phase 3 list, re-evaluated after Sprint 2:

| Item | Original Priority | Revised Priority | Notes |
|------|-----------------|-----------------|-------|
| Animated joke transitions | Medium | **High** | The crossfade from Sprint 2 is already there; full transitions are a polish pass that now makes sense |
| Dark mode | Medium | **High** | CSS custom properties are fully wired; this is a sprint-hours job, not a sprint-days job |
| PWA support | High | **Medium** | Genuinely useful (offline, install) but adds tooling complexity; sequence after polish work |
| Joke rating system | Low | **Medium** | With favourites built, rating (thumbs up/down) is a small delta and high engagement signal |
| "Joke of the day" permalink | Low | **Low** | Interesting but needs backend; out of scope for this project |
| Generated OG images per joke | Low | **Low** | Cool but complex; Satori adds a build step; defer |
| Performance budget | Medium | **High** | Lighthouse audit before calling Phase 3 done — this should be the exit gate |
| Playwright E2E tests | Pushed from Sprint 2 | **High** | Explicitly deferred; Sprint 3 is the right time; needed before calling the project "production-grade" |
| Search by keyword | Pushed from Sprint 2 | **Medium** | Still valuable; API supports it; but UI complexity means it's right here, not rushed |

### Recommended Phase 3 Sprint Brief

**Goal:** Polish, performance, and reach — make it something you'd put on a portfolio or ship as a side product.

**In scope:**
1. Dark mode (CSS custom properties already wired — small lift)
2. Animated joke transitions (full crossfade/slide between jokes)
3. Joke rating (thumbs up/down, localStorage, pairs with favourites)
4. Search by keyword (API endpoint exists, needs search input UI)
5. Playwright E2E tests (happy path + key user flows)
6. Lighthouse/Core Web Vitals audit (performance budget gate)
7. PWA: service worker + offline mode + install prompt
8. UX agent review of Phase 3 plan before execution *(new, per retrospective)*

**Sprint 3 recommended kickoff:** Run `/sprint-plan dad-jokes 3` after confirming the Phase 3 brief above.

---

## Next Sprint Preview

**Sprint 3 goal:** "Make it impressive" — polish, offline capability, search, and an honest performance audit. Exit state: something you'd show at a job interview.

**New tickets to create based on Sprint 2 learnings:**
- `UX review of Sprint 3 plan` — run the UX agent against the sprint plan before execution starts
- `Playwright E2E: happy path + favourites + history nav` — explicitly carried over from Sprint 2 deferral
- `Lighthouse audit: baseline + pass` — performance budget gate; run before Sprint 3 review

**Carry-over from Sprint 2:** None. All 12 tickets shipped.

**Open epic:** #29 (Phase 2 epic) — can now be closed.

---

## Sprint Close

- ✅ All 12 phase-2 issues closed
- ✅ Epic #29 to be closed
- ✅ REVIEW.md updated (Phase 2 marked complete)
- ✅ CHANGELOG.md up to date
- ✅ Deployed and verified
- ✅ Phase 2 review written

---

*Sprint 2 reviewed 2026-02-23 by Claude Code (Scrum Master)*
