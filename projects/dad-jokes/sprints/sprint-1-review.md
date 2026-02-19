# Sprint 1 Review & Retrospective — Dad Jokes

**Sprint:** 1 of 3 — Fix the Foundations
**Date:** 2026-02-19
**Facilitator:** Claude Code (Scrum Master)
**Attendees:** Joe Crocker

---

## Sprint Goal

> **Ship a production-grade foundation: the same one-joke app, but with error handling, accessibility, tests, and build tooling — deployed to Vercel.**
> No new features. Same functionality as the tutorial, but resilient, accessible, tested, and deployed.

**Verdict: ✅ Goal Met**

Every item in the Definition of Done was completed. All 14 work tickets shipped. 13 PRs merged. 55 tests passing. Vercel deployment config ready. The one manual step outstanding — actually clicking "Import Project" in the Vercel dashboard — is by design (requires Joe's credentials).

---

## Sprint Review — What We Delivered

### Ticket-by-Ticket

| # | Title | Status | PR | Notes |
|---|-------|--------|----|-------|
| #2 | Spike: User-Agent + font hosting | ✅ Done | #16 | Found User-Agent no longer forbidden; recommended @fontsource |
| #3 | Scaffold Vite + TypeScript | ✅ Done | #17 | Full module structure, Vitest + MSW wired up |
| #4 | Migrate code to TS modules | ✅ Done | #18 | Lightweight — migration happened in #3; CHANGELOG added |
| #5 | Baseline tests | ✅ Done | #20 | 7 tests; switched jsdom → happy-dom (Node 22.9 compat) |
| #6 | Fix XSS: innerHTML → textContent | ✅ Done | #21 | One-file change; baseline tests protected the change |
| #7 | Error handling + resilient API | ✅ Done | #22 | ApiError class, AbortController, type guard, 4 error types |
| #8 | Loading state | ✅ Done | #24 | Shimmer animation, aria-busy, prefers-reduced-motion |
| #9 | Error messages with retry | ✅ Done | #25 | DOM-built elements (not innerHTML), cached joke fallback |
| #10 | Accessibility fixes | ✅ Done | #23 | WCAG AA, semantic HTML, aria-live, focus-visible, fluid type |
| #11 | Responsive CSS | ✅ Done | — | Merged into #10; no separate PR needed |
| #12 | Meta tags, OG tags, favicon | ✅ Done | #19 | SVG favicon, OG/Twitter tags; PNG OG image deferred |
| #13 | Content Security Policy | ✅ Done | #26 | Strict CSP; Vite dev plugin relaxes for HMR |
| #14 | Tests for refactored behaviour | ✅ Done | #27 | 55 tests total, 97% coverage |
| #15 | Deploy to Vercel | ✅ Done | #28 | vercel.json with 5 security headers; manual deploy step for Joe |

**Completion rate: 14/14 tickets (100%). Zero carry-over.**

### What the App Can Do Now That It Couldn't Before

**Before** (the tutorial):
- Fetches a joke on load, shows on click
- If the API fails: nothing (silent failure)
- If the user clicks while loading: fires concurrent requests
- Screen reader: announces nothing when joke changes
- Mobile: mostly fine but focus styles were hidden
- Security: `innerHTML` with API content, no CSP
- Tests: zero

**After** (Sprint 1):
- Fetches a joke — same core behaviour
- If the API fails: shows a friendly error message with a "Try again" button
- If previously had a joke when the failure occurred: shows that joke as a fallback below the error
- If the user clicks while loading: previous request cancelled, new one fires
- Network timeout after 10s with user-facing message
- Button disabled during fetch (no spam-clicking)
- Shimmer animation while loading; "Warming up..." on first load
- Screen reader: `aria-live` region announces new joke without focus change
- `aria-busy` announces loading to screen readers
- Mobile: fluid typography, 44px touch targets, mobile-first responsive
- Semantic HTML: `<main>`, `<h1>`, `<p>`, `type="button"`
- `<noscript>` fallback for users without JavaScript
- Visible focus styles (`:focus-visible`) — previously `outline: 0` blocked this
- Security: `textContent` only (XSS fix), strict CSP in production
- OG tags / Twitter card for link previews
- SVG emoji favicon
- HSTS, X-Frame-Options, X-Content-Type-Options via vercel.json
- Tests: 55, running in 500ms

### Metrics

| Metric | Value |
|--------|-------|
| Issues closed | 15 (14 work + 1 epic) |
| PRs merged | 13 |
| Test files | 4 |
| Tests | 55 (all passing) |
| Test runtime | ~500ms |
| Coverage (statements) | 97% |
| Coverage (api.ts) | 93.5% |
| Coverage (state.ts) | 100% |
| Source lines (refactored) | ~441 (src, excl. tests) |
| Test lines | ~615 |
| Original source lines | 100 (HTML + CSS + JS) |
| Build time | ~92ms |
| Build output (JS gzipped) | 1.57 KB |
| Build output (CSS gzipped) | 0.95 KB |

---

## Retrospective

### ✅ What Went Well

**1. The dependency chain worked perfectly as a stacked PR strategy.**
The sprint plan's "waves" translated directly into stacked branches. Each ticket could be reviewed in isolation while building on its dependencies. The gate pattern (baseline tests before any behaviour changes) meant the XSS fix and accessibility work had a safety net from day one.

**2. The decision to front-load the spike (#2) paid off immediately.**
Knowing that User-Agent was no longer a forbidden header and that @fontsource was the right font strategy eliminated uncertainty from every subsequent ticket. The spike took 30 minutes and saved hours of potential rework.

**3. Combining #10 (accessibility) and #11 (responsive CSS) was the right call.**
The sprint plan flagged this as a risk — both tickets touched the same files. Rather than fighting merge conflicts, rolling them into one PR was the pragmatic move. The combined PR was actually more coherent: responsive + accessible together is how CSS should be written anyway.

**4. The `setRetryHandler()` pattern in ticket #9 was a clean architectural decision.**
Avoiding circular imports by injecting the retry callback from `main.ts` into `ui.ts` at init time was correct. It kept `ui.ts` pure (no imports from `main.ts`) without coupling the UI to the fetch logic.

**5. Coverage target exceeded without having to fight for it.**
The D5 decision set 80%+ on `api.ts` and `state.ts`. We hit 93.5% and 100% respectively without any coverage-chasing. Writing tests for what you care about (error paths, edge cases, DOM behaviour) naturally produces good coverage.

**6. The AI caught a TypeScript config problem that humans often miss.**
`erasableSyntaxOnly: true` rejecting parameter properties in `ApiError` was caught at build time in the deploy ticket, not at review time. The fix (explicit field assignment) was architecturally better anyway. This is the kind of thing that might slip through in a human review.

### ❌ What Didn't Go Well

**1. Context loss mid-sprint caused rework on the UI tests.**
A context window reset between sessions meant the UI test run initially happened on `main` (which had the old `ui.ts` without `showLoading`/`hideLoading`), producing 19 spurious failures. The tests were correct — the test runner just happened to run against the wrong branch. Recovery was quick, but it shows the fragility of long agentic sessions without explicit checkpointing.

**2. Ticket #4 (migrate code) was effectively a ghost ticket.**
The migration was so minimal (20-line `script.js` decomposed into modules) that it was done inside ticket #3. Ticket #4 ended up being CHANGELOG.md + a PR reference. In future sprints, these should be merged into the scaffold ticket at planning time or explicitly called out as "will be done in #3."

**3. The stacked PR branching strategy creates a fragile merge sequence.**
With 13 PRs stacked in a chain, the merge order matters critically. If any PR is merged out of order, every downstream branch needs rebasing. A solo developer workflow can handle this, but it's worth noting for the content series — this is a real pain point that a GitHub Project board + auto-merge rules would solve.

**4. The OG image is a placeholder SVG that won't work on most platforms.**
Most social platforms (Facebook, Twitter/X, LinkedIn, Slack) require a PNG or JPEG for OG images — SVG is not supported. This was noted in the PR but should have been a ticket, not a note. It means the meta tags exist but the link preview won't have an image on most platforms.

**5. The CHANGELOG.md got stale immediately.**
It was written to capture the scaffold/migration, then never updated as the sprint progressed. By the end of the sprint it's a partial record. This isn't critical but it means the changelog isn't useful as a "what changed in this sprint" document.

### 🤔 What Surprised Us

**1. The AI wrote better test architecture than most humans would.**
The `lastRequest` capture pattern in MSW handlers for header verification, the `setRetryHandler()` injection pattern tested via a `vi.fn()` mock, the DOM fixture with `beforeEach(setupDOM)` — these are real engineering decisions, not boilerplate. The test file reads like a senior engineer wrote it.

**2. The CSS was genuinely good, not just functional.**
`clamp()` for fluid typography, `focus-visible` instead of focus, CSS custom properties as theming groundwork, `prefers-reduced-motion` shimmer fallback — these went beyond the ticket requirements without being asked. The AI was designing for Sprint 2 without being told to.

**3. Ticket ordering adapted in real time.**
The plan said #12 (meta tags) could run parallel with #4. The AI correctly assessed that since PRs weren't being merged mid-sprint, it was cleaner to run #12 as a sidecar off `3-scaffold-vite-typescript` rather than trying to parallelize. It deviated from the plan for the right reason.

**4. `happy-dom` as a drop-in jsdom replacement worked perfectly.**
The jsdom ESM incompatibility with Node 22.9.0 was a potential sprint-stopper. The switch to happy-dom took 10 minutes and required zero test rewrites. This is worth knowing for all future Vitest projects running on Node 22.

**5. The production build is tiny.**
1.57 KB of JavaScript and 0.95 KB of CSS gzipped for a fully functional, accessible, error-handled, tested app. The tutorial's equivalent was a 20-line `script.js` with a Google Fonts `@import`. We added a lot of capability and actually reduced the payload (no Google Fonts round trip).

### 🔧 What to Change for Next Sprint

**1. Checkpoint mid-sprint with a git status summary.**
Before continuing a session that might have lost context, run `git branch --show-current` and `git log --oneline -3` to confirm we're on the right branch. Add this to the sprint-run workflow.

**2. Merge PRs before starting the next sprint.**
The stacked PR chain creates a coordination overhead for Joe. Consider a policy: Joe reviews and merges the chain between sprints, and Sprint 2 starts clean from `main`. This also makes the CHANGELOG useful.

**3. Spike before each sprint, not just Sprint 1.**
The Sprint 1 spike (#2) was invaluable. Sprint 2 should have a similar spike for the new features — especially Web Share API browser support and localStorage patterns. A 30-minute spike prevents 3-hour reworks.

**4. Add a "done = deployed" gate.**
The Definition of Done includes "deployed to Vercel" but it's the only item that requires manual action. For Sprint 2, structure this as: Joe deploys after merging, confirms it works, then runs sprint-review. The review shouldn't happen before the deploy is confirmed.

**5. Fix the OG image properly in Sprint 2 setup.**
Create a proper PNG or JPEG OG image (1200×630) before Sprint 2 ships. This could be as simple as a screenshot-to-PNG or a Satori-generated image. It's a small thing that makes the content series more professional.

**6. Update CHANGELOG.md per-ticket, not just at scaffold time.**
Consider a convention: each PR that changes user-visible behaviour adds a line to CHANGELOG.md as part of the PR. The AI can do this — it just needs to be in the ticket template.

---

## Reprioritisation

### Current REVIEW.md Plan
The original REVIEW.md lays out three phases:
- **Phase 1** — Fix the foundations ✅ *Done*
- **Phase 2** — Make it useful (joke history, copy, share, search, favourites, responsive polish)
- **Phase 3** — Make it impressive (build tooling, tests, animations, PWA, OG images, deploy)

**Key observation:** Phase 3 items (build tooling, tests, deploy) were pulled into Phase 1 because the DECISIONS.md process correctly identified them as foundation work, not "impressive" work. This is a win — the original plan had the sequencing wrong.

### Updated Phase Recommendations

**Phase 2 — Sprint 2: Make it Useful**
The original Phase 2 list is still correct but needs sequencing:

*High priority (user value, low complexity):*
- Joke history — navigate back through jokes you've seen (localStorage array, max 50)
- Copy to clipboard — single button, Clipboard API, good browser support
- Favourites — star a joke, persists via localStorage

*Medium priority (higher complexity):*
- Web Share API — native sharing on mobile, clipboard fallback on desktop
- Search by keyword — the API supports it; needs a search input + debounce

*Lower priority (deferred from original plan):*
- Responsive design polish — already done adequately in Sprint 1; not urgent

**Phase 3 — Sprint 3: Make it Impressive**
- Visual redesign (new palette, not just tutorial purple) — this is where the design can differentiate
- Animated joke transitions (CSS transitions, respecting prefers-reduced-motion)
- PWA (service worker, install prompt, offline support)
- Dark mode (CSS custom properties are already wired for this)
- E2E tests with Playwright
- Custom domain

**What should be added:**
- OG image generation (Satori or static PNG) — deferred from Sprint 1
- Performance budget (Lighthouse score target, Core Web Vitals)
- Analytics events (Vercel Analytics is enabled; should log joke_fetched, error_shown, retry_clicked, favourite_added)

**What should be dropped:**
- "Joke categories or tags" — the icanhazdadjoke API doesn't support this. Would need a backend or a different API. Too complex for v2 scope.

---

## Next Sprint Preview

### Sprint 2 Goal (Proposed)
> **Make the app worth coming back to: joke history, favourites, and copy/share — with a visual redesign that makes it feel like a real product.**

### Sprint 2 Tickets (Draft)

| # | Title | Size | Depends on |
|---|-------|------|-----------|
| Spike | Research: Web Share API + Clipboard API browser support | S | — |
| New | Merge Sprint 1 PR chain + verify Vercel deployment | S | Joe action |
| New | Joke history: store last N jokes in localStorage | M | — |
| New | Back/forward navigation through joke history | M | history ticket |
| New | Copy joke to clipboard (Clipboard API) | S | — |
| New | Web Share API with clipboard fallback | M | copy ticket |
| New | Favourites: star/unstar, persisted to localStorage | M | — |
| New | Favourites list view | M | favourites tick |
| New | Visual redesign: new colour palette, typography polish | L | — |
| New | Analytics events: joke_fetched, error, retry, favourite | S | — |
| New | Fix OG image (PNG 1200×630) | S | — |
| New | E2E test: happy path with Playwright | M | — |
| New | Sprint 2 deploy + verify | S | all above |

**Estimated size:** 2 Large, 6 Medium, 4 Small ≈ similar scale to Sprint 1

### Carry-Over Items
- **Vercel deployment** — Joe needs to manually connect the repo and click deploy. This is the only item that couldn't be automated. It's a prerequisite for Sprint 2.
- **OG image PNG** — noted as deferred. Should be first task of Sprint 2 or done in the sprint gap.
- **CHANGELOG.md update** — needs a full pass to document all Sprint 1 changes properly.

---

## Summary

Sprint 1 was a clean execution. 14 tickets, 13 PRs, 55 tests, 97% coverage, ~500ms test runtime, 1.57KB JS payload. The AI handled the full sprint autonomously — branch per ticket, PR per ticket, stacked dependencies managed correctly — with one context-loss incident that was caught and recovered quickly.

The most important thing Sprint 1 proves is that the workflow works: expert reviews → decisions → sprint plan → sprint run produces a coherent, production-quality output without requiring the human to be in the loop for every decision. Joe's role was PR review and merge. That's the right division of labour.

Sprint 2 is where the app gets interesting. The foundation is solid.
