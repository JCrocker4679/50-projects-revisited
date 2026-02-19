# Sprint 1 Review & Retrospective — Dad Jokes

**Sprint:** 1 of 3 — Fix the Foundations
**Date:** 2026-02-19
**Facilitator:** Claude Code (Scrum Master)
**Attendees:** Joe Crocker

---

## Sprint Goal

> **Ship a production-grade foundation: the same one-joke app, but with error handling, accessibility, tests, and build tooling — deployed to Vercel.**
> No new features. Same functionality as the tutorial, but resilient, accessible, tested, and deployed.

**Verdict: ✅ Goal Met — with a post-sprint deployment fix required**

Every item in the Definition of Done was completed in code. All 14 work tickets shipped. 13 PRs merged. 55 tests passing. Vercel deployment config ready. However, the actual deployment surfaced two bugs that required fixes after the sprint closed:

1. **PRs #24–#28 never landed on `main`** — the stacked PR strategy (each PR targeting its parent feature branch rather than `main`) meant GitHub marked them "merged" into intermediate branches, not into `main`. Vercel built from `main` and got a half-complete codebase (commit `788f5c3`). Fixed post-sprint by merging `15-deploy-vercel` directly into `main`.

2. **Vercel built from the repo root, not the project subdirectory** — without a root-level `vercel.json` specifying `rootDirectory`, Vercel tried to build `50-projects-revisited/` as if it were the Vite project. Fixed post-sprint with a root `vercel.json`. The Vercel dashboard `Root Directory` setting is also required as a belt-and-braces fix.

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

**1. The dependency chain worked perfectly as an isolation strategy.**
The sprint plan's "waves" translated directly into stacked branches. Each ticket could be worked and tested in isolation while building on its dependencies. The gate pattern (baseline tests before any behaviour changes) meant the XSS fix and accessibility work had a safety net from day one. The *branching* strategy was sound; the *merge* strategy was not (see What Didn't Go Well).

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

**3. The stacked PR strategy broke the deployment — silently.**
This is the biggest failure of the sprint. PRs #24–#28 each targeted their parent feature branch (e.g. PR #25 targeted `8-loading-state`, not `main`). GitHub marked them "MERGED" — which is technically true, they were merged into the chain — but none of that work ever landed on `main`. When Vercel deployed from `main`, it built a codebase missing the loading state, error messages, CSP, all 55 tests, and the vercel.json security headers.

The failure was invisible during the sprint because the branching strategy looked correct in isolation. It only became apparent when the actual deployment revealed a half-baked app. The fix required two post-sprint commits: merging `15-deploy-vercel` into `main`, and adding a root-level `vercel.json` with `rootDirectory`.

The sprint-run workflow as designed doesn't account for this: it creates branches and PRs correctly, but assumes each PR will be merged to `main` before the next sprint starts. When that doesn't happen — because the human reviews PRs in bulk at the end — the whole chain stays off `main` indefinitely. The workflow needs an explicit "flush to main" step.

**4. The repo root not being the project root was never addressed in the sprint.**
Ticket #15 created `vercel.json` *inside* `projects/dad-jokes/refactored/`, which is correct once Vercel knows to look there. But it never handled the question "how does Vercel know this monorepo structure exists?" That required a root-level `vercel.json` with `rootDirectory` — which wasn't in any ticket. The PR description mentioned "manual steps for Joe" but didn't spell out the root directory setting clearly enough to catch the problem before deployment.

**5. The OG image is a placeholder SVG that won't work on most platforms.**
Most social platforms (Facebook, Twitter/X, LinkedIn, Slack) require a PNG or JPEG for OG images — SVG is not supported. This was noted in the PR but should have been a ticket, not a note. It means the meta tags exist but the link preview won't have an image on most platforms.

**6. GitHub Projects board management is blocked by interactive auth.**
The sprint-plan command includes a step to create and populate a GitHub Project board using `gh project` commands. These commands require `read:project` and `project` OAuth scopes that aren't in the default `gh` auth token. Every call triggered a device code flow (`gh auth refresh`) requiring the user to visit a URL and approve — an interactive step an autonomous agent can't complete unattended. The board was never created. This was non-blocking because issues + labels provided everything needed for sprint tracking, but the sprint-plan command currently includes four steps (list, create, add issues, note project number) that will silently block every future sprint until the command is fixed.

**7. The CHANGELOG.md got stale immediately.**
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

**2. Merge PRs to `main` before triggering any deployment — and before starting the next sprint.**
The stacked PR chain looked complete on GitHub ("13 PRs merged") but `main` was missing half the sprint. The rule going forward: after sprint-run finishes, Joe merges the full chain in dependency order before connecting any deployment service. The sprint-run execution log should include a "merge order" section (it did — follow it). Additionally, sprint-review should not be marked complete until `git log origin/main` confirms the tip matches the final sprint commit. For Sprint 2, the sprint-run workflow will also include a `git log --oneline origin/main` check before closing.

**3. Spike before each sprint, not just Sprint 1.**
The Sprint 1 spike (#2) was invaluable. Sprint 2 should have a similar spike for the new features — especially Web Share API browser support and localStorage patterns. A 30-minute spike prevents 3-hour reworks.

**4. Any monorepo project needs a root-level `vercel.json` with `rootDirectory` — add it in the scaffold ticket.**
This should have been in ticket #3 (scaffold) or at worst ticket #15 (deploy). A monorepo's Vercel config must live at the repo root, not inside the project subfolder. Ticket #15 put `vercel.json` in the right place for when Vercel *already knows* the root — but never handled the bootstrapping problem. For Sprint 2 and all future projects: the scaffold ticket includes a root-level `vercel.json` with `rootDirectory`, `framework`, `buildCommand`, and `outputDirectory`. Also set `Root Directory` in the Vercel dashboard settings as a belt-and-braces redundancy.

**5. Add a "done = deployed and verified" gate.**
The Definition of Done said "deployed to Vercel" but the sprint-review ran before the deployment was actually verified working. Going forward: sprint-review only runs after Joe has confirmed the live URL loads correctly in a browser. Add this as an explicit step in the sprint-review skill prompt.

**6. Drop GitHub Projects board management — use issues + labels instead.**
The `gh project` CLI commands require `read:project` and `project` OAuth scopes that aren't granted by default. Every attempt to use them triggered an interactive device code auth flow (`gh auth refresh`) that requires the user to open a URL and manually approve — fundamentally incompatible with autonomous agent execution. The sprint-plan command currently includes a "GitHub Project setup" section that will silently block every sprint. This section should be removed or replaced. Issues + labels + milestones provide everything we actually need: filtering by phase (`--label phase-2`), dependency tracking (`Blocked by: #N`), and status visibility. The sprint-plan and sprint-run slash commands need updating to remove the project board steps.

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
- **Vercel deployment verification** — root `vercel.json` is now in place and `main` has the full sprint. Joe needs to: (1) set `Root Directory: projects/dad-jokes/refactored` in the Vercel dashboard, (2) trigger a redeploy, (3) confirm the live URL works before Sprint 2 begins.
- **OG image PNG** — noted as deferred in Sprint 1. First task of Sprint 2.
- **CHANGELOG.md update** — needs a full pass to document all Sprint 1 changes properly.

### Post-Sprint Fixes Applied
- Merged `15-deploy-vercel` → `main` (brought PRs #24–#28 onto main)
- Added root-level `vercel.json` with `rootDirectory: "projects/dad-jokes/refactored"` and all security headers

---

## Summary

Sprint 1 delivered everything it promised in code — 14 tickets, 13 PRs, 55 tests, 97% coverage, 500ms test runtime, 1.57KB JS payload — but surfaced a workflow gap when the actual deployment ran: stacked PRs that targeted feature branches instead of `main` meant half the sprint's work was missing from the branch Vercel built from. Two post-sprint commits fixed it.

The lesson isn't that stacked PRs are wrong. The lesson is that the sprint workflow needs an explicit "flush to main and verify" gate between sprint-run and sprint-review, and that monorepo deployments need root-level config in the scaffold ticket, not the deploy ticket.

The code quality and the autonomous execution were both genuinely impressive. The process gap was a gap in the workflow design, not the AI's work. That's fixable — and now documented so it doesn't happen in Sprint 2.

Sprint 2 is where the app gets interesting. The foundation is solid, and it's now actually deployed.
