# Dad Jokes — Product Decisions

> This document is the single source of truth for what we're building, why, and what we've explicitly decided not to do. Every decision records context, options, rationale, and when to revisit. Sprint planning reads from the Sprint Brief at the bottom.

---

## Decision Log — 2026-02-18 (Initial)

**Input:** 8 expert reviews (Technical Architect, Frontend Engineer, Backend Engineer, UX Designer, QA Engineer, Copywriter, Security Specialist, Business Advisor), PM audit (REVIEW.md), vision doc (dad-jokes-big-vision.md).

---

### D1: What is this project, commercially?

**Context:** The big-vision doc describes an evolution from tutorial to platform. The business advisor says the app itself won't make money. We need to settle what we're optimising for, because it changes every downstream decision.

**Options considered:**
- (a) Build it as a real product to monetise (Business Advisor flagged this as unrealistic)
- (b) Build it as a portfolio piece and content asset (Business Advisor's primary recommendation)
- (c) Build it purely as a learning exercise with no deployment (risks never shipping — Business Advisor's #1 concern)

**Decision:** **(b) Portfolio piece and content asset.** The app is a marketing vehicle for the "50 Projects Revisited" blog/video series. It needs to be deployed, polished, and publicly visible. It does NOT need to make money directly.

**Rationale:** The business advisor nailed it — the content about building the app is more valuable than the app itself. But the app must actually exist, deployed and working, for the content to be credible. This means we optimise for: shipped > perfect, visible > hidden, interesting process > impressive result.

**Impact on sprint planning:** Ship fast. Deploy after Sprint 1 if possible, definitely after Sprint 2. Don't gold-plate.

**Revisit when:** If the app somehow gains real traction (>1000 DAU), reconsider whether it justifies its own business model.

---

### D2: Tech stack — Language

**Context:** The architect and frontend engineer both recommend TypeScript. The original code is vanilla JS. The question is whether TS is worth the setup overhead for a small project.

**Options considered:**
- (a) **TypeScript** — Architect and Frontend both recommend. Catches bugs in the state management layer. Types document the data model. (Architect, Frontend)
- (b) **JavaScript** — Simpler setup, no compilation needed. Adequate for 20 lines but questionable for the v2 feature set. (Nobody explicitly recommended this, but the REVIEW.md Phase 3 originally placed build tooling last)

**Decision:** **TypeScript.**

**Rationale:** The v2 feature set introduces state management (history, favourites, search results) where type safety earns its keep. The data model (Joke, AppState, StoredFavourites) benefits from being typed — it's documentation and bug prevention in one. Vite makes TS setup trivial — it's not 2018 where TS meant fighting webpack configs. Additionally, TS is more impressive in a portfolio and more instructive for blog content.

**Impact on sprint planning:** Sprint 1 includes Vite + TS setup as the first ticket. All new code is TypeScript.

**Revisit when:** Never for this project. TS is the right call.

---

### D3: Tech stack — Framework

**Context:** The architect says no framework. The frontend engineer agrees. But the v2 feature set (history, favourites, search, multiple views) might strain vanilla JS.

**Options considered:**
- (a) **React / Preact** — Component model, ecosystem, widely understood. Overkill for one view (Architect)
- (b) **Svelte** — Small bundle, less boilerplate. Still a framework for a simple app (Architect)
- (c) **Vanilla TypeScript with module structure** — No framework overhead. Clean separation via modules (Architect, Frontend, Business Advisor)

**Decision:** **(c) Vanilla TypeScript.** No framework.

**Rationale:** The app has one primary view (joke card + actions) with optional secondary views (favourites list, search results). This is comfortably handled by render functions in a `ui.ts` module. A framework adds bundle size, learning curve for readers, and dependency weight — all for a component tree that's maybe 4 levels deep. The architect's module structure (api.ts, state.ts, ui.ts, storage.ts, main.ts) provides sufficient separation.

The business advisor's argument seals it: "look what you can build with zero budget and no framework" is a stronger content angle than "I used React like everyone else."

**Impact on sprint planning:** No framework-specific setup, no component library. The `ui.ts` module contains render functions.

**Revisit when:** If Phase 2 features require routing (e.g., separate pages for favourites, search), consider adding a tiny router library. If the component tree exceeds ~10 render functions, reconsider.

---

### D4: Tech stack — Build tooling

**Context:** The original REVIEW.md placed build tooling in Phase 3. Every technical reviewer independently placed it in Phase 1. This needs resolving.

**Options considered:**
- (a) **No build tool** — Keep it simple, add later (original REVIEW.md Phase 3)
- (b) **Vite** — Fast, zero-config for vanilla TS, pairs with Vitest (Architect, Frontend, QA)
- (c) **esbuild / Rollup directly** — More control, less abstraction (nobody recommended)

**Decision:** **(b) Vite.** Move build tooling to Sprint 1, ticket 1.

**Rationale:** The original REVIEW.md had build tooling in Phase 3 because it was thinking in terms of "what can we add." The team review reframed it as "what do we need to do the work." You can't write TypeScript without a build step. You can't write tests without Vitest (which needs Vite). You can't organise modules without import/export (which needs a bundler). Build tooling isn't a feature — it's infrastructure. It comes first.

**Impact on sprint planning:** First ticket in Sprint 1: `npm create vite@latest` with the vanilla-ts template. Everything else builds on this.

**Revisit when:** Not applicable. Vite is the foundation.

---

### D5: Tech stack — Testing

**Context:** QA wants baseline tests before any refactoring. Architect wants modules first. Both are right, but the sequencing matters.

**Options considered:**
- (a) **Write baseline tests against original code, then migrate to Vite** — QA's ideal (QA)
- (b) **Set up Vite + TS first, then write baseline tests against the restructured (but behaviourally identical) code** — Summary's compromise (Architect, Frontend, Summary resolution)
- (c) **Skip baseline tests, just test the refactored code** — Fastest but riskiest (nobody recommended)

**Decision:** **(b) Vite first, then baseline tests.** The compromise from the Summary.

**Rationale:** The original code is 20 lines in a single file with no exports. Testing it in isolation is awkward — you'd need to set up a test runner anyway, which is essentially what Vite + Vitest gives you. The sequence is: (1) scaffold Vite project, (2) move existing code into modules WITHOUT changing behaviour, (3) write baseline tests that verify the existing behaviour works. Then start refactoring.

**Testing tools:** Vitest (unit/integration), MSW (API mocking), Playwright (E2E, Sprint 2+).

**Coverage target:** 80%+ on api.ts, state.ts, and storage.ts. Don't obsess over ui.ts coverage — test the logic, not the DOM wiring.

**Impact on sprint planning:** Sprint 1 tickets: Vite setup → code migration → baseline tests → then refactoring begins. Baseline tests are a gate before behaviour changes.

**Revisit when:** If test maintenance becomes a burden, relax the coverage target. If bugs slip through, tighten it.

---

### D6: Architecture — Backend

**Context:** The vision doc describes accounts, moderation, ratings. Three reviewers independently shouted "no backend."

**Options considered:**
- (a) **Add a backend now** — Future-proof for v3/v4 features (Vision doc implies this)
- (b) **No backend for v2, plan for v3** — All v2 features work client-side (Architect, Backend, Business Advisor)
- (c) **Never add a backend** — Keep it static forever (too limiting for the blog content arc)

**Decision:** **(b) No backend for v2.** Explicitly out of scope. Revisit at v3 planning.

**Rationale:** Unanimous from three reviewers: Architect, Backend, Business Advisor. Every v2 feature (history, favourites, search, share, copy) works with client-side state + localStorage + the existing API. A backend adds $25-75/month in hosting costs (Business Advisor), deployment complexity, security surface area (Security Specialist), and maintenance burden. For zero user-facing benefit in v2.

The business advisor's cost analysis is compelling: the moment you add a backend, costs go from $0 to $25-75/month. For a portfolio project, that's a real consideration.

**Impact on sprint planning:** No backend tickets. No database tickets. No auth tickets. API calls go directly from the browser to icanhazdadjoke.com.

**Revisit when:** A v3 feature (user accounts, cross-user ratings, moderation) is in scope AND validated as worth building.

---

### D7: Architecture — State management

**Context:** The original code has no state. The v2 features all need state. How do we manage it?

**Options considered:**
- (a) **State library (Redux, Zustand, etc.)** — Overkill for this app (nobody recommended)
- (b) **Simple module-level state object + getter/setter functions** — state.ts exports functions that read/write a module-scoped object. Favourites sync to localStorage. (Architect, Backend)
- (c) **Reactive signals (Preact Signals, etc.)** — Interesting but adds a dependency for minimal benefit (nobody recommended)

**Decision:** **(b) Module-level state with getter/setter functions.**

**Rationale:** The state shape is simple: current joke, history array, history index, favourites array, loading boolean, error string. A single `state.ts` module with typed functions (`getCurrentJoke()`, `addToHistory(joke)`, `toggleFavourite(joke)`) is sufficient and testable. No libraries needed.

The Backend Engineer's localStorage schema design (versioned, validated, defensive reads) is the right approach for persistence.

**Impact on sprint planning:** `state.ts` and `storage.ts` are Sprint 1 tickets (part of the module structure). Favourites/history logic built on top in Sprint 2.

**Revisit when:** If state interactions become complex enough that debugging state changes is difficult, consider adding a simple event emitter or pub/sub pattern for state change notifications.

---

### D8: Architecture — Deployment target

**Context:** The Summary flagged this as a decision needed. Options are all free-tier.

**Options considered:**
- (a) **Netlify** — Simple static hosting, form handling, redirects via _netlify.toml (Architect, Backend)
- (b) **Vercel** — Similar to Netlify, better integration with serverless functions if we ever need them. Free analytics. (Architect, Backend)
- (c) **GitHub Pages** — Simplest, but no server-side configuration (no headers, no redirects)

**Decision:** **(b) Vercel.**

**Rationale:** Vercel and Netlify are both excellent for static sites. Vercel edges ahead because: (1) free built-in analytics (basic, but covers our needs without Plausible's $9/month), (2) if we ever add OG image generation (Vercel OG), it's native, (3) the deploy previews on PRs are excellent for review workflow.

**Impact on sprint planning:** Deploy configuration is a Sprint 1 ticket (lightweight — add a `vercel.json` for security headers). Actual deployment is the final ticket of Sprint 1 or first ticket of Sprint 2.

**Revisit when:** If Vercel's free tier limits become an issue (unlikely for this project).

---

### D9: Architecture — Custom domain

**Context:** Business Advisor flagged this as worth $10/year for portfolio credibility.

**Options considered:**
- (a) **Buy a domain now** (e.g., dadjokes.app, groanworthy.dev)
- (b) **Use the free Vercel subdomain** (dad-jokes.vercel.app or similar)
- (c) **Decide later**

**Decision:** **(c) Decide later.** Use the free Vercel subdomain for Sprint 1 and 2. Consider a domain when the blog content is ready and we want a polished public presence.

**Rationale:** $10/year is trivial, but the decision of which domain name to buy is a branding decision that doesn't need to be made under time pressure. The free subdomain is sufficient for development and initial deployment. A custom domain is a Phase 3 polish item.

**Impact on sprint planning:** No domain tickets in Sprint 1 or 2.

**Revisit when:** Phase 3, or when the first blog post is ready to publish and we want a clean URL to share.

---

### D10: UX — Accessibility scope

**Context:** Every reviewer who touched UX or frontend flagged accessibility as broken and non-negotiable. The question is how much to do in Sprint 1 vs. later.

**Options considered:**
- (a) **Full WCAG AA audit and remediation in Sprint 1** — Everything the UX designer listed (UX, Frontend)
- (b) **Critical fixes in Sprint 1, full compliance in Sprint 2** — Fix the worst violations first
- (c) **Defer to Sprint 2** — Nobody recommended this

**Decision:** **(a) Full WCAG AA remediation in Sprint 1.** All critical accessibility fixes happen before features.

**Rationale:** The frontend engineer and UX designer are clear: these aren't enhancements, they're bug fixes. The current code actively harms accessibility (removing focus outlines). The business advisor also noted that WCAG compliance has legal implications. And from a content perspective, "we fixed the tutorial's accessibility violations" is a strong blog angle.

**Specific fixes (all Sprint 1):**
- Replace `outline: 0` with visible focus styles
- Add `aria-live="polite"` on joke container
- Change `<h3>` to `<h1>`
- Change joke `<div>` to `<p>`, add `<main>` landmark
- Fix colour contrast to WCAG AA (4.5:1 minimum)
- Add `aria-busy` during loading
- Remove `overflow: hidden` on body
- Ensure 44x44px touch targets
- Add `prefers-reduced-motion` support
- Add `<noscript>` fallback

**Impact on sprint planning:** Accessibility is woven into every Sprint 1 ticket, not a separate ticket. When we rebuild the HTML, it's semantic from the start. When we rebuild the CSS, it has focus styles and contrast from the start.

**Revisit when:** Screen reader testing (VoiceOver) happens in Sprint 2. Any issues found there get fixed immediately.

---

### D11: UX — Visual redesign scope

**Context:** UX Designer wants a warm colour palette and new typography. Business Advisor wants to ship fast. Frontend wants to fix the broken bits only.

**Options considered:**
- (a) **Full visual redesign in Sprint 1** — New colours, typography, card treatment (UX Designer)
- (b) **Fix violations only in Sprint 1, redesign in Sprint 2** — Contrast, responsive, focus styles now; palette and typography later (Frontend, Summary resolution)
- (c) **No visual redesign, just fix what's broken** — Business Advisor's implicit preference

**Decision:** **(b) Fix violations in Sprint 1. Visual refresh in Sprint 2, alongside features.**

**Rationale:** Sprint 1 is about foundations. Picking a new colour palette is a design exploration that can happen in parallel with Sprint 1 engineering work, but doesn't need to block it. The fixes needed for accessibility (contrast, focus styles) and functionality (responsive scaling, overflow) are enough visual change for Sprint 1.

In Sprint 2, when we add the action row (favourite, copy, share buttons) and history navigation, we'll need to design new UI elements anyway. That's the natural moment for a visual refresh — new elements + refined existing ones in one pass.

**What Sprint 1 visual work includes:**
- Fix contrast (pick colours that pass WCAG AA — this may naturally shift the palette)
- Add focus styles (visible, attractive, not just browser defaults)
- Fluid typography (`clamp()`)
- Responsive padding
- Remove overflow: hidden
- Add CSS custom properties for colours (prep for theming)

**What Sprint 2 visual work includes:**
- Finalise colour palette (warm direction per UX Designer)
- Typography decision (keep Roboto or change)
- Action button design
- Card refinement
- Transition animations (subtle crossfade)

**Impact on sprint planning:** Sprint 1 has CSS fixes but no design exploration. Sprint 2 has a "visual design" ticket.

**Revisit when:** If Sprint 1 looks terrible after the fixes, do a quick visual pass before deploying.

---

### D12: UX — Mobile strategy

**Context:** The current CSS works on mobile by accident. The v2 features (5+ buttons) won't.

**Decision:** **Mobile-first responsive design.** Base styles target 320px+. One breakpoint at ~640px for desktop.

**Specifics:**
- Fluid typography: `clamp(1.125rem, 4vw, 1.875rem)` for joke text
- Container padding: 24px mobile, 50px desktop
- Touch targets: 44x44px minimum on all interactive elements
- Action buttons: row on 360px+, stack on <360px
- Allow scrolling (remove `overflow: hidden`)

**Impact on sprint planning:** Responsive design is part of the CSS rebuild ticket in Sprint 1. Not a separate ticket.

**Revisit when:** Sprint 2 feature work (action row, search) may need additional responsive consideration.

---

### D13: Security — What's needed now vs. later

**Context:** Security Specialist identified one confirmed vulnerability and several hygiene improvements.

**Options considered:**
- (a) **Fix everything now** — innerHTML, CSP, security headers, SRI (Security Specialist)
- (b) **Fix the vulnerability now, headers at deploy time** — innerHTML is a code change; CSP and security headers are deployment config
- (c) **Defer security to deployment** — Nobody recommended this

**Decision:** **(b) Fix innerHTML in Sprint 1 code work. Add CSP and security headers at deployment.**

**Rationale:** `innerHTML → textContent` is a code change that happens as part of the refactoring. CSP can be added as a `<meta>` tag in the HTML (Sprint 1) and/or as a header in `vercel.json` (deployment ticket). Security headers (X-Frame-Options, HSTS, etc.) are deployment configuration, best handled in the deploy ticket.

**Specific Sprint 1 security work:**
- Replace innerHTML with textContent ✓
- Validate API response shape before using ✓
- Add AbortController with timeout ✓
- Add CSP meta tag ✓

**Deployment ticket security work:**
- Security headers in vercel.json (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS)

**Impact on sprint planning:** Security is woven into the refactoring, not a separate ticket (except the deploy config).

**Revisit when:** If we add any new external resources (scripts, images, fonts from new CDNs), update the CSP.

---

### D14: Copy and brand voice

**Context:** Copywriter wants to establish a brand voice. Architect says focus on architecture. The app needs error messages and loading states regardless.

**Options considered:**
- (a) **Full brand voice guide + all copy in Sprint 1** (Copywriter)
- (b) **Error/loading copy in Sprint 1, brand voice refinement in Sprint 2** (Summary resolution)
- (c) **Placeholder copy only, refine later** (Architect's implicit preference)

**Decision:** **(b) Write real error/loading copy for Sprint 1. Refine brand voice and secondary copy in Sprint 2.**

**Rationale:** Error messages and loading states are user-facing from day one. Placeholder text like "Error" or "Loading..." is a missed opportunity — the copy is part of the product. The Copywriter's error message table is excellent and ready to implement. But the fuller brand voice work (button labels, empty states, share text format, rotating headings) can wait for Sprint 2 when the features they support are built.

**Sprint 1 copy decisions (locked):**
- Loading (first visit): "Warming up..."
- Loading (subsequent): Skeleton/shimmer (no text)
- Error (network): "Can't reach the joke factory. Check your connection and try again."
- Error (API 5xx): "The joke servers are having a bad day. Give it a sec."
- Error (generic): "Something went sideways. Try again?"
- Page title: "Dad Jokes" (keep it simple for now)
- Button: "Get Another Joke" (keep for Sprint 1, revisit in Sprint 2)
- Meta description: "Groan-worthy dad jokes on demand. Get a random joke, save your favourites, and share the pain. Free, no sign-up, no ads."

**Sprint 2 copy work:**
- Button label refinement ("Tell me another" per Copywriter)
- Action button labels/aria-labels
- Empty states
- Share text format
- Brand voice guide document

**Impact on sprint planning:** Copy strings are included in the Sprint 1 refactoring tickets (error handling, loading state). Not a separate copywriting ticket.

**Revisit when:** Sprint 2 planning. The Copywriter's full recommendation is in their review.

---

### D15: Testing — Baseline tests before behaviour changes

**Context:** QA is adamant: lock down current behaviour before changing anything. Architect wants modules first. We resolved this in D5, but the specific baseline tests need defining.

**Decision:** **Write these specific baseline tests after Vite migration, before any refactoring:**

1. Page loads and calls the API (fetch to icanhazdadjoke.com)
2. API response joke text appears in the DOM
3. Button click triggers a new API call
4. Fetch includes `Accept: application/json` header

These tests use MSW to mock the API. They verify the happy path works in the new module structure before any behaviour changes begin.

**Impact on sprint planning:** "Write baseline tests" is a distinct ticket, gated before "refactor" tickets.

**Revisit when:** After Sprint 1, decide if baseline tests are still needed or can be replaced by the fuller test suite.

---

### D16: Content production alongside building

**Context:** Business Advisor wants content NOW. Engineers want to focus on code.

**Options considered:**
- (a) **Publish content during each sprint** (Business Advisor)
- (b) **Capture session logs during sprints, produce content between sprints** (Summary resolution)
- (c) **Build first, content after** (implicit preference of technical reviewers)

**Decision:** **(b) Session logs during sprints. Content production between sprints.**

**Rationale:** These aren't incompatible. `/session-log` after each working session takes 5 minutes and captures the raw material. Turning that into a blog post or video script is a separate activity that doesn't compete with engineering time.

**Sprint 1 content commitment:**
- Run `/session-log` after each working session
- No blog posts or videos due during Sprint 1
- The team review process itself is content material (Business Advisor's suggestion)

**Sprint 2 content commitment:**
- One blog post or video script drafted, using Sprint 1 session logs as raw material

**Impact on sprint planning:** `/session-log` is a lightweight post-sprint activity, not a ticketed work item.

**Revisit when:** If content production falls behind, make it a ticketed item in Sprint 3.

---

### D17: Analytics

**Context:** Summary flagged this as a decision needed. Business Advisor wants metrics. Security Specialist prefers privacy-respecting tools.

**Options considered:**
- (a) **Plausible** — Privacy-respecting, no cookies, GDPR-compliant. $9/month (Business, Security)
- (b) **Vercel Analytics** — Free (basic), built into the deploy platform. Limited but sufficient for a portfolio project
- (c) **None** — Simplest. No privacy concerns. No data

**Decision:** **(b) Vercel Analytics.** Free, built-in, good enough.

**Rationale:** We're deploying to Vercel anyway. Their built-in analytics (Web Vitals + page views) is free and requires zero setup beyond flipping a toggle. It gives us enough signal to know if anyone's using the app. Plausible is better but $9/month is a recurring cost for a $0-budget project. If the app gets real traction (>500 visitors/month), upgrade to Plausible.

**Impact on sprint planning:** No analytics tickets. Enable Vercel Analytics in the deploy configuration.

**Revisit when:** >500 monthly visitors, or if we need event tracking (share/copy/favourite actions) that Vercel Analytics doesn't support.

---

### D18: What we're NOT building (explicit scope exclusions)

These items from the vision doc and REVIEW.md are **explicitly out of scope for v2** (Sprints 1 and 2):

| Feature | Why not | Revisit when |
|---------|---------|-------------|
| User accounts | Needs a backend. No backend in v2. | v3 planning |
| Joke ratings (cross-user) | Needs a backend + database. | v3 planning |
| Admin dashboard | Needs a backend + auth. | v4 planning |
| Moderation / reporting | Needs a backend. | v4 planning |
| Joke submission | Needs a backend + moderation pipeline. | v4 planning |
| Email (joke of the day digest) | Needs a backend + email service. | v4 planning |
| PWA (service worker, manifest) | Phase 3 stretch goal. Not needed for MVP. | Sprint 3+ |
| Dark mode | Nice to have, not MVP. | Sprint 3+ |
| OG image generation per joke | Stretch goal. Add after core features ship. | Sprint 3+ |
| Joke categories/tags | API doesn't support natively. Would need our own data layer. | v3 planning |
| Swipe gestures on mobile | UX flagged as stretch. Complex to implement without conflicting with browser gestures. | Sprint 3+ |
| Animated joke transitions | Polish, not foundation. | Sprint 2 (lightweight) or Sprint 3 |
| "Don't show me this again" | Needs seen-joke tracking. Could be client-side but adds complexity. | Sprint 3+ |
| Joke of the day permalink | Needs routing or a serverless function. | Sprint 3+ |
| Landing page | Content/marketing concern, not product. | When first blog post publishes |

---

## Sprint Brief — Sprint 1: Fix the Foundations

> This is the section `/sprint-plan` consumes. Everything above is context and rationale. Everything below is actionable.

### Sprint goal

**Ship a production-grade foundation: the same one-joke app, but with error handling, accessibility, tests, and build tooling — deployed to Vercel.**

### What's in scope (ordered by priority)

1. **Scaffold Vite + TypeScript project** — `npm create vite@latest` with vanilla-ts template. Set up the project structure: `src/main.ts`, `src/api.ts`, `src/ui.ts`, `src/state.ts`, `src/storage.ts`, `src/types.ts`, `src/constants.ts`. Move `index.html` and `styles/main.css` into the Vite structure.

2. **Migrate existing behaviour into modules** — Move the 20 lines of original JS into the new module structure WITHOUT changing behaviour. `api.ts` gets the fetch call. `ui.ts` gets the DOM update. `main.ts` wires them together. Behaviour is identical to the original — just reorganised.

3. **Write baseline tests** — Vitest + MSW. Tests verify: (a) page load triggers API call, (b) joke text appears in DOM, (c) button click triggers new API call, (d) correct headers sent. These are the "before" snapshot.

4. **Replace innerHTML with textContent** — One-line change, but it's a security fix (VULN-001) and the first behaviour change after baseline tests.

5. **Add error handling to API layer** — try/catch in `api.ts`. Check `res.ok`. Validate response shape. Custom `ApiError` class. AbortController with 10-second timeout. User-Agent header.

6. **Add loading state** — Button disabled + `aria-busy="true"` during fetch. Visual loading indicator (skeleton shimmer on joke area). Cancel in-flight request if button clicked again.

7. **Add user-facing error messages** — Render error messages in the joke area when fetch fails. Use the copy from D14. Include a "Try again" action. Show last cached joke if available on network error.

8. **Fix all accessibility violations** — Semantic HTML (`<main>`, `<h1>`, `<p>` for joke). Visible focus styles. `aria-live="polite"` on joke container. WCAG AA contrast (fix colours). 44x44px touch targets. `prefers-reduced-motion` support. `<noscript>` fallback.

9. **Fix responsive CSS** — Remove `overflow: hidden`. Fluid typography with `clamp()`. Responsive padding (24px mobile, 50px desktop). Fix font loading (preconnect, proper weights). CSS custom properties for all colours.

10. **Add meta tags and OG tags** — `<title>`, `<meta description>`, `og:title`, `og:description`, `og:image` (generic for now). Favicon. Remove vestigial IE meta tag.

11. **Add Content Security Policy** — `<meta>` CSP tag restricting scripts to self, styles to self + Google Fonts, connections to icanhazdadjoke.com.

12. **Deploy to Vercel** — Connect GitHub repo. Add `vercel.json` with security headers. Enable Vercel Analytics. Verify the deployed app works.

13. **Write tests for refactored behaviour** — Tests for: error handling (network error, API error, timeout), loading state (button disabled, indicator shown), accessibility (ARIA attributes present), API client (response validation, abort). Target: 80%+ coverage on api.ts and state.ts.

### What's explicitly out of scope for Sprint 1

| Item | Why |
|------|-----|
| Joke history / back-forward navigation | Sprint 2 feature |
| Favourites | Sprint 2 feature |
| Copy to clipboard | Sprint 2 feature |
| Share button | Sprint 2 feature |
| Search | Sprint 2 feature |
| Visual redesign (new palette, typography) | Sprint 2 — fix violations only in Sprint 1 |
| Dark mode | Sprint 3+ |
| Animated transitions | Sprint 2 or 3 |
| Backend of any kind | Not in v2 at all |
| User accounts | Not in v2 at all |
| PWA | Sprint 3+ |
| Custom domain | Decide later |
| Blog post / video | Session logs only in Sprint 1 |
| Playwright E2E tests | Sprint 2 (once there are user flows worth testing end-to-end) |

### Technical constraints

- **Language:** TypeScript (strict mode)
- **Build tool:** Vite
- **Test runner:** Vitest + MSW
- **Deploy target:** Vercel (free tier)
- **No framework.** Vanilla TS with module structure.
- **No backend.** All API calls from the browser.
- **No new npm dependencies** beyond Vite, Vitest, and MSW. If you think you need a package, check if the browser or TypeScript can do it natively first.
- **CSS:** Vanilla CSS with custom properties. No preprocessor.
- **Original code preserved** in `projects/dad-jokes/original/` — never modify it.

### Definition of done for Sprint 1

- [ ] App loads and displays a random joke
- [ ] Error states show user-friendly messages (network error, API error, timeout)
- [ ] Loading state shows during fetch (button disabled, visual indicator)
- [ ] innerHTML replaced with textContent (XSS fix)
- [ ] All accessibility violations fixed (focus styles, ARIA, contrast, semantics)
- [ ] Responsive on mobile (scrollable, readable, touch targets)
- [ ] Meta tags and OG tags present
- [ ] CSP meta tag in place
- [ ] Tests pass (baseline + refactored behaviour)
- [ ] Deployed to Vercel and publicly accessible
- [ ] No console errors in production
- [ ] Session log captured for content

### Open questions (spikes)

1. **User-Agent header from browser:** The API asks for a custom User-Agent. Browsers typically don't allow setting the User-Agent header on fetch requests (it's a forbidden header). Spike: verify whether this header can be set from a client-side fetch call, and if not, determine the alternative (e.g., a custom `X-User-Agent` header, or just setting it and seeing if the API accepts requests without it).

2. **Google Fonts vs. self-hosting:** The Frontend Engineer mentioned self-hosting the font. Spike: determine whether self-hosting Roboto (via fontsource or manual download) is worth the effort vs. just using the Google Fonts CDN with preconnect. Decision factors: CSP simplicity, performance, dependency reduction.
