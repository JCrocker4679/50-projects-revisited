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
- [ ] **No error handling** — if the API is down or the network drops, the user sees nothing. No try/catch, no fallback, no retry
- [ ] **No loading state** — clicking the button gives zero feedback while the fetch is in progress. On slow connections this would feel broken
- [ ] **XSS risk** — uses `innerHTML` to render the joke. The API *probably* returns safe strings, but this is bad practice. Should use `textContent`
- [ ] **No User-Agent header** — the API docs specifically ask consumers to set a custom User-Agent. The original code doesn't

**Accessibility:**
- [ ] **No ARIA live region** — screen readers won't announce when a new joke loads
- [ ] **Focus management** — no visible focus styles (`.btn:focus { outline: 0 }` actively removes them)
- [ ] **Joke container is a `<div>`** — should probably be a `<p>` or have an appropriate role
- [ ] **No skip-to-content or landmark roles**
- [ ] **Colour contrast** — the purple button on purple background may not meet WCAG AA

**UX gaps:**
- [ ] **No way to share a joke** — no copy button, no share link, no tweet button
- [ ] **No joke history** — once you click "next" the previous joke is gone forever
- [ ] **No search** — the API supports search by keyword, completely unused
- [ ] **No favourites** — can't save jokes you like
- [ ] **Placeholder text visible** — `// Joke goes here` flashes before the first fetch resolves
- [ ] **Button doesn't disable during fetch** — user can spam-click and fire multiple concurrent requests

**Technical:**
- [ ] **No tests**
- [ ] **No build tooling** — fine for a tutorial, but limits what you can do
- [ ] **No meta tags** — no description, no OG tags, no favicon
- [ ] **Only loads Roboto 700** — the body text isn't bold, so the font weight doesn't match usage

### Who would actually use this?
People who want a quick laugh — it's a novelty/humour app. The real audience is wider than you'd think: office workers killing time, parents looking for clean jokes, teachers who want an icebreaker. Dad joke apps consistently do well because the content is inoffensive and shareable.

### v2 Spec — "Dad Jokes, but actually good"

**MVP features:**
1. Loading and error states that actually tell the user what's happening
2. Joke history (last N jokes, navigate back/forward)
3. Copy joke to clipboard
4. Share joke (native Web Share API where supported, fallback to copy)
5. Search jokes by keyword
6. Favourites (localStorage)
7. Proper accessibility (ARIA, focus, contrast)
8. Responsive design that works properly on mobile

**Stretch goals:**
- Joke categories or tags (if the API supports it, or add our own layer)
- Daily joke notification (PWA + service worker)
- "Joke of the day" permalink
- Social card / OG image generation for shared jokes
- Dark mode
- Joke rating system (thumbs up/down with local storage)
- Animated transitions between jokes

---

## Refactor plan

### Phase 1 — Fix the foundations
1. Add try/catch with user-facing error messages
2. Add loading state (disable button, show spinner or text)
3. Replace `innerHTML` with `textContent`
4. Set custom User-Agent header per API docs
5. Remove `outline: 0`, add proper focus styles
6. Add ARIA live region for joke updates
7. Fix the placeholder text (hide until first joke loads)
8. Add meta tags, favicon, proper `<title>`

### Phase 2 — Make it useful
9. Joke history (store in array, add back/forward nav)
10. Copy to clipboard button
11. Web Share API integration
12. Search by keyword
13. Favourites with localStorage
14. Responsive design polish for mobile

### Phase 3 — Make it impressive
15. Add build tooling (Vite or similar)
16. Add tests (Vitest or similar)
17. Animated joke transitions (CSS or Framer Motion)
18. PWA support
19. OG image generation for shared jokes
20. Deploy somewhere (Vercel, Netlify)

---

## AI models used
| Model | Task | How it went |
|-------|------|-------------|
| Claude Opus 4.6 | Initial PM review & refactor plan | Via Cowork mode |

## Learnings
_To be filled in as we go._
