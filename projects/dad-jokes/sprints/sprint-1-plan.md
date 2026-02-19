# Sprint 1 Plan — Fix the Foundations

**Project:** Dad Jokes
**Sprint:** 1 of 3 (Phase 1: Fix the Foundations)
**Date:** 2026-02-19
**Epic:** [#1 — Sprint 1: Fix the Foundations](https://github.com/JCrocker4679/50-projects-revisited/issues/1)
**Source:** `projects/dad-jokes/DECISIONS.md` (Sprint Brief)

---

## Sprint Goal

**Ship a production-grade foundation: the same one-joke app, but with error handling, accessibility, tests, and build tooling — deployed to Vercel.**

No new features. Same functionality as the tutorial, but resilient, accessible, tested, and deployed.

---

## Tickets Overview

| # | Title | Type | Size | Depends on | Expert |
|---|-------|------|------|-----------|--------|
| [#1](https://github.com/JCrocker4679/50-projects-revisited/issues/1) | Epic: Sprint 1 — Fix the Foundations | epic | — | — | — |
| [#2](https://github.com/JCrocker4679/50-projects-revisited/issues/2) | Spike: User-Agent header + font hosting | spike | S | — | Frontend / Architect |
| [#3](https://github.com/JCrocker4679/50-projects-revisited/issues/3) | Scaffold Vite + TypeScript project | infrastructure | M | — | Architect / Frontend |
| [#4](https://github.com/JCrocker4679/50-projects-revisited/issues/4) | Migrate existing code into TS modules | refactor | M | #3 | Frontend |
| [#5](https://github.com/JCrocker4679/50-projects-revisited/issues/5) | Write baseline tests | test | M | #4 | QA |
| [#6](https://github.com/JCrocker4679/50-projects-revisited/issues/6) | Fix XSS: innerHTML → textContent | security | S | #5 ⚠️ gate | Frontend / Security |
| [#7](https://github.com/JCrocker4679/50-projects-revisited/issues/7) | Add error handling + resilient API layer | refactor | L | #6 | Frontend / Backend |
| [#8](https://github.com/JCrocker4679/50-projects-revisited/issues/8) | Add loading state with visual feedback | feature | M | #7 | Frontend / UX |
| [#9](https://github.com/JCrocker4679/50-projects-revisited/issues/9) | Add user-facing error messages with retry | feature | M | #7 | Frontend / Copywriter |
| [#10](https://github.com/JCrocker4679/50-projects-revisited/issues/10) | Fix all accessibility violations | refactor | L | #6 | Frontend / UX |
| [#11](https://github.com/JCrocker4679/50-projects-revisited/issues/11) | Fix responsive CSS and mobile layout | refactor | M | #6 | Frontend |
| [#12](https://github.com/JCrocker4679/50-projects-revisited/issues/12) | Add meta tags, OG tags, and favicon | feature | S | #3 | Frontend / Copywriter |
| [#13](https://github.com/JCrocker4679/50-projects-revisited/issues/13) | Add Content Security Policy | security | S | #11 | Security / Frontend |
| [#14](https://github.com/JCrocker4679/50-projects-revisited/issues/14) | Write tests for refactored behaviour | test | L | #7, #8, #9, #10 | QA |
| [#15](https://github.com/JCrocker4679/50-projects-revisited/issues/15) | Deploy to Vercel with security headers | infrastructure | M | #14 | Architect / Frontend |

**Total: 14 work tickets + 1 epic**
**Size breakdown:** 4× Small, 6× Medium, 4× Large

---

## Suggested Working Order

The dependency chain creates a clear critical path. Here's the recommended order:

### Wave 1: Foundation (can be done in parallel)
```
#2 Spike (User-Agent + fonts)     ← quick research, informs later work
#3 Scaffold Vite + TS project     ← everything depends on this
```

### Wave 2: Migration
```
#4 Migrate code into TS modules   ← depends on #3
#12 Meta tags + OG tags            ← depends on #3, can run parallel with #4
```

### Wave 3: Safety net
```
#5 Write baseline tests            ← depends on #4. GATE: must pass before Wave 4
```

### Wave 4: Refactoring (the core work)
```
#6 Fix XSS (innerHTML → textContent)  ← first behaviour change after baseline tests
#7 Error handling + API layer          ← depends on #6 (biggest single ticket)
#10 Accessibility fixes                ← depends on #6, can run parallel with #7
#11 Responsive CSS + mobile            ← depends on #6, can run parallel with #7/#10
```

### Wave 5: Error/Loading UX (after API layer is solid)
```
#8 Loading state                       ← depends on #7
#9 Error messages with retry           ← depends on #7, parallel with #8
#13 Content Security Policy            ← depends on #11 (font strategy settled)
```

### Wave 6: Verification
```
#14 Tests for refactored behaviour     ← depends on #7, #8, #9, #10
```

### Wave 7: Ship it
```
#15 Deploy to Vercel                   ← depends on #14 (all tests passing)
```

---

## Dependency Graph

```
#2 (spike) ─────────────────────────────────────────────── informs #7, #11, #13
                                                            │
#3 (scaffold) ──┬──→ #4 (migrate) ──→ #5 (baseline) ──→ #6 (XSS fix) ──┐
                │                                           ⚠️ GATE       │
                └──→ #12 (meta tags)                                      │
                                                                          │
                    ┌─────────────────────────────────────────────────────┘
                    │
                    ├──→ #7 (error handling) ──┬──→ #8 (loading state) ──┐
                    │                          └──→ #9 (error messages) ──┤
                    │                                                     │
                    ├──→ #10 (accessibility) ──────────────────────────────┤
                    │                                                     │
                    └──→ #11 (responsive CSS) ──→ #13 (CSP) ─────────────┤
                                                                          │
                                                                          └──→ #14 (tests) ──→ #15 (deploy)
```

---

## Key Gates and Risks

### Gate: Baseline tests (#5) must pass before behaviour changes
The baseline tests in #5 are a hard gate. Tickets #6 through #11 must not begin until #5 is green. This ensures we can detect regressions during refactoring.

### Risk: Accessibility + responsive + error handling touch the same files
Tickets #7, #8, #9, #10, and #11 all modify HTML and CSS. Since this is a solo developer workflow (one branch at a time), coordinate these changes carefully. Suggested approach: work #10 and #11 together in one branch (they share the CSS file), then #7/#8/#9 together (they share the API/state/UI modules).

### Risk: CSP may conflict with Vite dev server
Vite injects inline scripts in development mode. A strict CSP will block these. The CSP ticket (#13) may need a development-only relaxation. This is expected and documented in the ticket.

---

## What's NOT in this sprint (by decision)

Per DECISIONS.md D18, these are explicitly out of scope:

- Joke history / back-forward navigation (Sprint 2)
- Favourites (Sprint 2)
- Copy to clipboard (Sprint 2)
- Share button (Sprint 2)
- Search (Sprint 2)
- Visual redesign — new palette, typography (Sprint 2)
- Dark mode (Sprint 3+)
- Animated transitions (Sprint 2/3)
- Backend of any kind (not in v2)
- PWA (Sprint 3+)
- E2E tests with Playwright (Sprint 2)
- Custom domain (later)
- Blog posts / videos (session logs only)

---

## Definition of Done

From DECISIONS.md Sprint Brief:

- [ ] App loads and displays a random joke
- [ ] Error states show user-friendly messages (network error, API error, timeout)
- [ ] Loading state shows during fetch (button disabled, visual indicator)
- [ ] innerHTML replaced with textContent (XSS fix)
- [ ] All accessibility violations fixed (focus styles, ARIA, contrast, semantics)
- [ ] Responsive on mobile (scrollable, readable, touch targets)
- [ ] Meta tags and OG tags present
- [ ] CSP meta tag in place
- [ ] Tests pass (baseline + refactored behaviour, 80%+ coverage on api.ts/state.ts)
- [ ] Deployed to Vercel and publicly accessible
- [ ] No console errors in production
- [ ] Session log captured for content

---

## How to work tickets

Use `/work-ticket <ticket-number>` to pick up each ticket. This will:
1. Create a feature branch
2. Do the implementation work
3. Commit and push
4. Open a PR referencing the issue

One ticket at a time. Follow the dependency order above.
