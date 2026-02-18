# Team Review Summary — Dad Jokes

**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code → v2 refactor)
**Reviewers:** Technical Architect, Frontend Engineer, Backend Engineer, UX Designer, QA Engineer, Copywriter, Security Specialist, Business Advisor

---

## Top 3 Priorities Per Expert

### Technical Architect
1. Introduce Vite + TypeScript and module structure
2. Create a proper API layer with error handling
3. Implement state management before adding features

### Frontend Engineer
1. Fix accessibility violations (focus, contrast, ARIA, semantics)
2. Add error handling and loading states
3. Introduce Vite + TypeScript and module structure

### Backend Engineer
1. Build a proper API client with error handling, validation, and abort support
2. Design the localStorage schema with versioning from day one
3. Do NOT introduce a backend

### UX Designer
1. Fix accessibility fundamentals before adding features
2. Design the action row (favourite, copy, share) with progressive disclosure
3. Mobile-first responsive redesign

### QA Engineer
1. Write baseline tests before any refactoring
2. Fix critical bugs (silent failures, race conditions)
3. Set up test infrastructure (Vitest + MSW) with the Vite migration

### Copywriter
1. Write error messages and loading states
2. Define the brand voice and apply it to all UI text
3. Add meta tags and OG tags for sharing and SEO

### Security Specialist
1. Replace innerHTML with textContent (confirmed XSS vector)
2. Add a Content Security Policy
3. Validate and sanitise all API responses

### Business Advisor
1. Set a deployment deadline and ship v2 as an MVP
2. Produce content alongside building, not after
3. Keep architecture and cost minimal (no backend, no framework, $0)

---

## Consensus (Where Everyone Agrees)

### 1. Fix the fundamentals first
Every single reviewer flagged the same core issues:
- **No error handling** — the #1 functional gap, mentioned by 6/8 reviewers
- **innerHTML → textContent** — flagged by Frontend, Security, and QA as both an accessibility issue and a security vulnerability
- **No loading states** — the app gives zero feedback during fetches
- **Accessibility is broken** — focus styles removed, no ARIA, contrast fails

This is unanimous. Phase 1 is about fixing what's broken, not adding features.

### 2. No backend for v2
Technical Architect, Backend Engineer, and Business Advisor all independently and emphatically recommend against a backend. The v2 feature set (history, favourites, search, share, copy) is entirely client-side. A backend adds cost, complexity, and risk for zero user benefit at this stage.

### 3. Vite + TypeScript as the build foundation
Technical Architect, Frontend Engineer, and QA Engineer all recommend Vite + TypeScript. It provides the module system needed for organised code, TypeScript catches bugs early in a refactor, and Vitest integrates naturally for testing.

### 4. Keep it simple
Every reviewer, in their own way, warned against over-engineering. The architect said "no framework." The backend engineer said "no server." The business advisor said "ship fast, $0 budget." The UX designer said "fortune cookie, not software." This is a joke app. The constraint is a feature.

### 5. Accessibility is non-negotiable
Frontend, UX, QA, and Copywriter all treated accessibility as prerequisite work, not enhancement. The current code actively harms accessibility (removing focus outlines). WCAG AA is the minimum standard.

---

## Tensions (Where Experts Disagree)

### Tension 1: Testing before refactoring vs. testing with refactoring

**QA says:** Write baseline tests BEFORE any code changes. Lock down current behaviour first.

**Architect and Frontend say:** Introduce Vite + TypeScript first (which changes the code structure), then test the new modules.

**Resolution:** The QA engineer is right in principle — baseline tests protect against regressions. But the current code is 20 lines in a single file with no build tool, making it hard to test in isolation. **Compromise: Set up Vite + TypeScript FIRST (this is a structural change, not a behavioural one), then write baseline tests against the restructured-but-not-yet-refactored code.** The baseline tests cover: "fetches a joke on load," "button fetches a new joke," "joke is displayed." These can be written against the new module structure before any behaviour changes.

### Tension 2: Visual redesign scope

**UX Designer says:** Warm colour palette, new typography, card redesign, mobile-first layout overhaul. A meaningful visual refresh.

**Business Advisor says:** Ship fast. Don't over-invest in design for a portfolio project.

**Frontend Engineer says:** Fix contrast and responsive issues, but don't redesign everything at once.

**Resolution:** Phase 1 gets the minimum visual fixes (contrast, focus styles, responsive scaling). Phase 2 adds the action row and interaction design. A full visual refresh (colour palette, typography, card treatment) is a Phase 2 or Phase 3 concern — it can happen alongside feature work but shouldn't block shipping.

### Tension 3: Content production timing

**Business Advisor says:** Start content (blog posts, videos) NOW, during the build. The process is the content.

**QA and Frontend say:** Focus on shipping quality code first. Content comes after.

**Resolution:** These aren't incompatible. **Session logging** (quick notes on what happened, what was learned) takes minimal effort and provides raw material for content later. A blog post or video doesn't need to be published during the build — but the raw material should be captured. Use `/session-log` after each working session.

### Tension 4: How much copy/branding to define upfront

**Copywriter says:** Define the brand voice, write all error messages, write landing page copy, establish the personality.

**Technical Architect says:** The copy can be placeholders. Focus on architecture.

**Resolution:** Error messages and loading states need real copy from day one — they're visible to users immediately. Brand voice and landing page copy can evolve. **Write error/loading copy in Phase 1. Brand voice and landing page in Phase 2.**

---

## Prioritised Action Plan

### Phase 1 — Fix the Foundations (Sprint 1)

**Goal:** A working, accessible, resilient app with the same feature set as the original, but production-grade.

| Priority | Task | Expert drivers |
|----------|------|---------------|
| 1 | Set up Vite + TypeScript project with module structure | Architect, Frontend |
| 2 | Migrate existing code into modules (api.ts, ui.ts, main.ts, types.ts) | Architect, Frontend |
| 3 | Write baseline tests (Vitest + MSW) | QA |
| 4 | Replace innerHTML with textContent | Security, Frontend |
| 5 | Add try/catch error handling with user-facing messages | All |
| 6 | Add loading state (button disabled, visual indicator) | Frontend, UX, Copywriter |
| 7 | Fix accessibility: focus styles, ARIA live region, semantic HTML, h1, contrast | Frontend, UX |
| 8 | Set custom User-Agent header per API docs | Backend |
| 9 | Add request timeout and AbortController for cancellation | Backend, Security |
| 10 | Add meta tags, OG tags, favicon | Copywriter, Frontend |
| 11 | Write error message copy and loading state copy | Copywriter |
| 12 | Add Content Security Policy | Security |
| 13 | Fix responsive issues: remove overflow:hidden, fluid typography, reduced mobile padding | Frontend, UX |

**Exit criteria:** The app loads, fetches jokes, handles errors gracefully, is keyboard-accessible, meets WCAG AA contrast, has tests, and is deployable.

### Phase 2 — Make It Useful (Sprint 2)

**Goal:** The features that transform it from "read a joke" to "do something with a joke."

| Priority | Task | Expert drivers |
|----------|------|---------------|
| 1 | Joke history (in-memory array, back/forward navigation) | Architect, UX |
| 2 | State management module with localStorage persistence | Architect, Backend |
| 3 | localStorage schema with versioning | Backend |
| 4 | Copy to clipboard | UX, Copywriter |
| 5 | Web Share API (native share + copy fallback) | UX, Frontend |
| 6 | Favourites (save/unsave, view saved list) | UX, Architect |
| 7 | Search by keyword | UX, Backend |
| 8 | Action row UI (favourite, copy, share buttons) | UX, Frontend |
| 9 | Mobile-optimised layout for action buttons | UX, Frontend |
| 10 | Tests for all new features | QA |
| 11 | Empty state and success feedback copy | Copywriter |

**Exit criteria:** Users can navigate history, save favourites, copy/share jokes, search by keyword. All features tested. App deployed to Netlify/Vercel.

### Phase 3 — Make It Impressive (Sprint 3+)

**Goal:** Polish, deploy, and create content.

| Task | Expert drivers |
|------|---------------|
| Visual refresh (colours, typography, card design) | UX |
| Joke transitions (crossfade animation) | UX, Frontend |
| Dark mode | UX, Frontend |
| PWA support (service worker, manifest) | Architect, Frontend |
| OG image generation for shared jokes | Frontend, Copywriter |
| Deploy with custom domain | Business |
| "Buy Me a Coffee" integration | Business |
| Privacy-respecting analytics (Plausible) | Business, Security |
| Blog post series production | Business, Copywriter |
| Performance audit (Lighthouse) | Frontend, QA |

---

## Key Decisions Needed Before Sprint Planning

These are questions the team surfaced that need answers before `/product-decisions`:

1. **TypeScript or JavaScript?** — Architect and Frontend recommend TS. If scope/time pressure is a concern, JS is viable. Decision needed.
2. **Deploy target?** — Netlify vs Vercel vs GitHub Pages. All free. Minor differences in DX.
3. **Custom domain?** — Worth $10/year for portfolio credibility. Decision needed.
4. **Analytics?** — Plausible (privacy-respecting, $9/month) vs Vercel Analytics (free, basic) vs none. Decision needed.
5. **Content cadence?** — Blog post per sprint? Video per sprint? Session logs only? Decision needed.
6. **Visual refresh scope in Phase 2?** — Minimal fixes only, or a proper redesign alongside features? Decision needed.

---

## Final Note

Eight experts reviewed 20 lines of JavaScript and found enough work for 3+ sprints. That's not because the code is terrible — it's because the gap between "tutorial exercise" and "production product" is exactly that wide. This is the whole thesis of the series, demonstrated in a single project.

Ship Phase 1 fast. Ship Phase 2 with features. Ship Phase 3 with polish. Document everything. That's the plan.
