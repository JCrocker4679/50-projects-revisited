# Dad Jokes — Review & Refactor Plan

## Original source
- **Course:** Traversy Media — 50 Projects in 50 Days (Section 11)
- **Repo:** https://github.com/just-joe27/dadjoke
- **Tech:** HTML / CSS / vanilla JS
- **API:** https://icanhazdadjoke.com (free, no auth required)

## What it does
Fetches a random dad joke from the icanhazdadjoke API and displays it on screen. One button to get another joke. That's it.

---

## PM Audit

### What works
- Clean, minimal UI — does exactly one thing
- Loads a joke immediately on page load (no empty state)
- The API is free, stable, and still active in 2026
- Responsive-ish (max-width on container, body padding)

### What's missing for production

**Critical:**
- [x] **No error handling** — ✅ Sprint 1: ApiError class, 4 error types, user-facing messages + retry button
- [x] **No loading state** — ✅ Sprint 1: shimmer animation, aria-busy, button disabled during fetch
- [x] **XSS risk** — ✅ Sprint 1: innerHTML → textContent throughout; DOM elements built programmatically
- [x] **No User-Agent header** — ✅ Sprint 1: User-Agent header added to all API requests

**Accessibility:**
- [x] **No ARIA live region** — ✅ Sprint 1: aria-live="polite" aria-atomic="true" on joke container
- [x] **Focus management** — ✅ Sprint 1: focus-visible styles added; outline:0 removed
- [x] **Joke container is a `<div>`** — ✅ Sprint 1: changed to `<p>` with semantic role
- [x] **No skip-to-content or landmark roles** — ✅ Sprint 1: `<main>` landmark added
- [x] **Colour contrast** — ✅ Sprint 1: WCAG AA contrast ratios verified

**UX gaps:**
- [ ] **No way to share a joke** — 📋 Sprint 2: Web Share API + clipboard fallback
- [ ] **No joke history** — 📋 Sprint 2: localStorage array, back/forward nav
- [ ] **No search** — 📋 Sprint 2: keyword search using API support
- [ ] **No favourites** — 📋 Sprint 2: star/unstar with localStorage persistence
- [x] **Placeholder text visible** — ✅ Sprint 1: "Warming up..." shown on first load; shimmer on subsequent loads
- [x] **Button doesn't disable during fetch** — ✅ Sprint 1: button disabled during fetch, in-flight requests cancelled

**Technical:**
- [x] **No tests** — ✅ Sprint 1: 55 tests, 97% coverage, 500ms runtime
- [x] **No build tooling** — ✅ Sprint 1: Vite + TypeScript, strict mode, 92ms build
- [x] **No meta tags** — ✅ Sprint 1: meta description, OG tags, Twitter card, SVG favicon
- [x] **Only loads Roboto 700** — ✅ Sprint 1: @fontsource self-hosted, latin subset, weights 400+700

### Who would actually use this?
People who want a quick laugh — it's a novelty/humour app. The real audience is wider than you'd think: office workers killing time, parents looking for clean jokes, teachers who want an icebreaker. Dad joke apps consistently do well because the content is inoffensive and shareable.

### v2 Spec — "Dad Jokes, but actually good"

**MVP features:**
1. ✅ Loading and error states that actually tell the user what's happening *(Sprint 1)*
2. Joke history (last N jokes, navigate back/forward) *(Sprint 2)*
3. Copy joke to clipboard *(Sprint 2)*
4. Share joke (native Web Share API where supported, fallback to copy) *(Sprint 2)*
5. Search jokes by keyword *(Sprint 2)*
6. Favourites (localStorage) *(Sprint 2)*
7. ✅ Proper accessibility (ARIA, focus, contrast) *(Sprint 1)*
8. ✅ Responsive design that works properly on mobile *(Sprint 1)*

**Stretch goals:**
- ~~Joke categories or tags~~ — API doesn't support this; would need backend. Dropped.
- Daily joke notification (PWA + service worker) *(Sprint 3)*
- "Joke of the day" permalink *(Sprint 3)*
- Social card / OG image generation for shared jokes *(Sprint 2: static PNG; Sprint 3: generated)*
- Dark mode *(Sprint 3 — CSS custom properties already in place)*
- Joke rating system (thumbs up/down with local storage) *(Sprint 3)*
- Animated transitions between jokes *(Sprint 3)*

---

## Refactor plan

### Phase 1 — Fix the foundations ✅ COMPLETE (Sprint 1, 2026-02-19)
All 14 tickets shipped. See `sprints/sprint-1-review.md` for full retro.

1. ✅ Add try/catch with user-facing error messages
2. ✅ Add loading state (disable button, shimmer animation)
3. ✅ Replace `innerHTML` with `textContent` (+ DOM-built elements for error state)
4. ✅ Set custom User-Agent header per API docs
5. ✅ Remove `outline: 0`, add proper focus-visible styles
6. ✅ Add ARIA live region for joke updates
7. ✅ Fix the placeholder text ("Warming up..." on first load)
8. ✅ Add meta tags, favicon, proper `<title>`
9. ✅ Bonus: Vite + TypeScript build tooling (moved up from Phase 3)
10. ✅ Bonus: 55 tests with 97% coverage (moved up from Phase 3)
11. ✅ Bonus: Content Security Policy
12. ✅ Bonus: Vercel deployment config with security headers

### Phase 2 — Make it useful ✅ COMPLETE (Sprint 2, 2026-02-23)
All 12 tickets shipped. See `sprints/phase-2-review.md` for full retro.

1. ✅ OG image (PNG 1200×630) — carry-over from Sprint 1
2. ✅ Joke history — localStorage array, back/forward navigation, position counter
3. ✅ Copy to clipboard — Clipboard API with 2s feedback
4. ✅ Favourites — star/unstar with localStorage persistence (max 100)
5. ✅ Favourites list view — browse and delete; live count badge; empty state
6. ✅ Web Share API with clipboard fallback
7. ✅ Analytics events — 8 typed events, `safeTrack()` wrapper
8. ✅ Visual refresh — warm amber/cream palette, action row, icon buttons, crossfade
9. ✅ Tests — 131 tests, 100% line coverage
10. ✅ Deployed and verified live

**Dropped from original Phase 2:** "Search by keyword" (pushed to Sprint 3), "E2E tests with Playwright" (pushed to Sprint 3).

### Phase 3 — Make it impressive 🔮 FUTURE
*Sequencing revised — build tooling, tests, and deploy moved to Sprint 1 where they belonged.*

1. Animated joke transitions (CSS, prefers-reduced-motion aware)
2. PWA support (service worker, offline, install prompt)
3. Dark mode (CSS custom properties already wired)
4. Joke rating system (thumbs up/down, localStorage)
5. "Joke of the day" permalink
6. Generated OG images per joke (Satori or similar)
7. Performance budget (Lighthouse, Core Web Vitals targets)

---

## AI models used
| Model | Task | How it went |
|-------|------|-------------|
| Claude Opus 4.6 | Initial PM review & refactor plan | Via Cowork mode |
| Claude Opus 4.6 | 8 expert agent reviews + decisions | Full team-review + product-decisions workflow |
| Claude Opus 4.6 | Sprint 1 planning (15 issues) | /sprint-plan — accurate, well-sequenced |
| Claude Opus 4.6 | Sprint 1 execution (13 PRs) | /sprint-run — autonomous, 14/14 tickets completed |
| Claude Sonnet 4.6 | Sprint 2 planning (12 issues) | /sprint-plan — clean dependency graph, well-scoped |
| Claude Sonnet 4.6 | Sprint 2 execution (12 PRs) | /sprint-run → manual conflict resolution → /sprint-resume — 12/12 tickets completed |

## Learnings

**Sprint 1 (2026-02-19):**
- The expert-agent → decisions → sprint-plan → sprint-run pipeline works. Zero supervision needed on the actual coding.
- Stacked PRs (each ticket off its dependency branch) work but require careful merge order. Merge the chain between sprints.
- `happy-dom` is the right Vitest environment for Node 22+ (jsdom has ESM compat issues).
- Spike first, always. 30-minute spike saved hours of potential rework on fonts + User-Agent.
- Build tooling and tests belong in Phase 1 (foundations), not Phase 3 (impressive). The original plan had this sequencing wrong.
- `erasableSyntaxOnly: true` in TypeScript 5.9+ rejects parameter properties in classes — worth knowing for all future projects.
- CSS custom properties + clamp() + focus-visible + prefers-reduced-motion should be defaults in all projects going forward.
- The AI naturally wrote for Sprint 2 (CSS custom properties as theming groundwork) without being told to. This is the right instinct.
- Context loss between sessions is the primary operational risk for long sprint-runs. Mitigate with branch checkpointing.

**Sprint 2 (2026-02-23):**
- Autonomous sprint-run without mid-wave merges causes merge conflicts when multiple tickets touch the same files (ui.ts, style.css). Fix: stop after each ticket, merge, continue.
- Sprint planning has no specialist review step — UX decisions in ticket descriptions get made implicitly by the executing agent, not a specialist. Worth adding a UX review pass between /sprint-plan and /sprint-run.
- Truly independent tickets (different files, no shared state) could run in parallel sub-agents — but current tooling makes this a manual orchestration step (two terminal sessions), not automated.
- `safeTrack()` wrapper for analytics and typed event maps are patterns worth templating for all future projects.
- CSS custom properties investment in Sprint 1 paid off in Sprint 2 — dark mode in Sprint 3 will be similarly cheap because of Sprint 2's palette work.
