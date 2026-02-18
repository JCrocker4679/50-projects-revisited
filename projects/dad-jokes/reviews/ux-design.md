# UX Designer Review — Dad Jokes

**Reviewer:** UX Designer
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

The original design nails one thing: simplicity. Card, joke, button. There's almost no learning curve. But "simple" and "good UX" aren't the same thing. The current design fails users in every error scenario, excludes keyboard and screen reader users entirely, and provides no way to do anything with a joke beyond reading it. The v2 features (history, favourites, search, share) risk destroying the simplicity if we're not disciplined about progressive disclosure.

My north star: **the app should feel like opening a fortune cookie, not like using software.**

---

## Current User Flow Analysis

### The happy path (all that exists today)

```
Page load → Joke appears → User reads → Clicks "Get Another Joke" → New joke appears → Repeat
```

This works. It's immediate, it's clear, it's satisfying. The problem is everything outside this path.

### Failure states (none handled)

| Scenario | What happens now | What should happen |
|----------|-----------------|-------------------|
| API is down | Joke area shows previous joke or placeholder. No indication anything went wrong | Friendly error message with retry. Show last cached joke if available |
| Slow network | No feedback. Button stays clickable. User wonders if they clicked | Loading indicator. Button disabled. Skeleton or shimmer on joke area |
| Offline | Silent failure | "You're offline" message. Show a cached joke from history/favourites |
| Very long joke | Text overflows or gets cut off on small screens | Text scales, container grows, user can scroll |
| First visit, JS disabled | "// Joke goes here" is displayed | `<noscript>` message explaining JS is needed |

### Accessibility failures

I'm going to be blunt: **this app is currently inaccessible.** Not "could be better" — actively broken for some users.

1. **Keyboard users cannot see where they are.** `outline: 0` on the button removes the focus indicator. A keyboard user pressing Tab lands on the button but has no visual confirmation.
2. **Screen reader users don't know when the joke changes.** Without `aria-live`, a new joke loading is a silent event. The user has to manually navigate back to the joke text to discover it changed.
3. **The button has no disabled state.** During a fetch, nothing prevents double-activation or communicates that the app is working.
4. **Colour contrast fails.** The purple button on purple background, and possibly the h3 at 50% opacity on white, don't meet WCAG AA.

---

## User Personas

### Primary: The Break-Taker
- Office worker, parent, student — anyone killing 2 minutes
- Wants: quick laugh, minimal effort
- Behaviour: opens the app, reads a few jokes, closes it. Session: 30 seconds to 2 minutes
- Needs from v2: it should just work. Fast load, clear feedback, no friction

### Secondary: The Sharer
- Finds a joke they love, wants to send it to someone
- Wants: copy text, share via messaging app, maybe tweet it
- Behaviour: reads jokes until they find a good one, shares it, maybe keeps browsing
- Needs from v2: copy button, share button, maybe a permalink

### Tertiary: The Collector
- Likes curating jokes. Uses them for teaching, parenting, icebreakers
- Wants: save favourites, browse saved jokes, search for specific topics
- Behaviour: longer sessions, returns regularly, builds a personal library
- Needs from v2: favourites, search, history

---

## v2 Interaction Design

### Progressive disclosure

The core interaction must stay simple: **card, joke, button.** Advanced features should be discoverable but not in the way.

**Layout concept:**

```
┌─────────────────────────────┐
│      Don't Laugh Challenge  │  ← heading, de-emphasised
│                             │
│   "Why don't scientists     │
│    trust atoms? Because     │  ← joke text, prominent
│    they make up everything" │
│                             │
│   [♡] [📋] [↗]              │  ← action row: favourite, copy, share
│                             │
│   [← Back]  [Next Joke →]  │  ← navigation
│                             │
│   ────────────────────────  │
│   🔍 Search jokes...        │  ← search, collapsed by default
└─────────────────────────────┘
```

**Key decisions:**
- Action icons (favourite, copy, share) sit beneath the joke but above navigation. They act on the current joke.
- Back/Forward navigation appears only after the user has seen more than one joke. Don't show "Back" on the first joke.
- Search is at the bottom, visually separated. It's a secondary action. Could also be behind a toggle/icon.
- Favourites view is a separate mode — a list/grid of saved jokes. Accessible via a nav element or icon.

### Micro-interactions

| Action | Feedback | Duration |
|--------|----------|----------|
| Click "Next Joke" | Button shows loading spinner, joke area fades/slides | 200-400ms transition |
| Joke loads | New joke fades/slides in | 200ms |
| Copy to clipboard | Button briefly shows checkmark + "Copied!" | 1.5s then resets |
| Add to favourites | Heart fills/animates, subtle bounce | 300ms |
| Error | Joke area shows error message with retry link | Persists until retry or new joke |
| Share | Native share sheet opens (or copy fallback) | OS-controlled |

### Transitions between jokes

Don't overcomplicate this. A simple crossfade (fade out old joke, fade in new joke) is better than a slide, flip, or bounce. The content is text — let it be readable as quickly as possible.

```css
.joke-enter { opacity: 0; transform: translateY(8px); }
.joke-enter-active { opacity: 1; transform: translateY(0); transition: all 200ms ease-out; }
```

Subtle vertical movement + opacity. Nothing more.

---

## Mobile Design

### Current issues
- 30px joke font is too large on small screens
- 50px padding wastes vertical space
- Single button works but the v2 actions (5+ buttons) need careful layout
- `overflow: hidden` on body prevents scrolling long jokes

### Recommendations
- **Fluid typography:** `clamp(1.125rem, 4vw, 1.875rem)` for joke text
- **Reduced padding:** 24px on mobile, 50px on desktop
- **Stacked action buttons** on very small screens (<360px), row on everything larger
- **Bottom action bar** for primary actions (next joke, favourite) — thumb-friendly
- **Allow scrolling.** Remove `overflow: hidden`. Long jokes exist.
- **Touch targets:** Every interactive element 44x44px minimum
- **Swipe gestures (stretch):** Swipe left for next joke, swipe right for previous. Natural on mobile but needs careful implementation to not conflict with browser back gesture.

### Viewport considerations

| Viewport | Layout change |
|----------|--------------|
| < 360px | Stack action buttons vertically. Smallest usable |
| 360-640px | Action buttons in a row. Compact padding |
| 640px+ | Full desktop layout. Generous padding |

---

## Visual Direction

### Current aesthetic
Purple-on-purple with a white card. It works but feels generic — could be any tutorial project.

### Recommended direction
Keep it playful but give it personality. This is a dad joke app — it should feel warm, slightly goofy, approachable.

- **Warm colour palette:** Move from electric purple to something warmer. Think soft yellows, warm greys, a pop of orange or teal for the action buttons.
- **Typography:** Roboto is fine but boring. Consider a display font for the heading (something with character — a rounded sans-serif or a playful serif) and keep Roboto or Inter for the joke text body.
- **Card design:** Softer shadows, slightly more rounded corners (16px instead of 10px). Maybe a subtle background pattern or texture.
- **Button design:** Rounded pills, clear hover/active/focus states, distinct from the card background.
- **Dark mode:** A nice-to-have that many users expect. Warm dark background (not pure black), light text, adjusted card colours.

---

## Accessibility Requirements (Non-Negotiable)

1. **WCAG AA contrast** on all text. Test every colour combination.
2. **Visible focus indicators** on all interactive elements. No exceptions.
3. **`aria-live="polite"`** on the joke container so screen readers announce new jokes.
4. **`aria-busy="true"`** during loading states.
5. **Semantic HTML:** `<main>`, `<h1>`, `<p>` for the joke, `<nav>` for navigation.
6. **Button labels:** Icon-only buttons (copy, share, favourite) need `aria-label`.
7. **44x44px touch targets** on all interactive elements.
8. **Reduced motion:** Respect `prefers-reduced-motion`. Disable transitions for users who need it.
9. **Screen reader testing** with VoiceOver (macOS/iOS) at minimum.

---

## Top 3 Priorities

1. **Fix accessibility fundamentals before adding any features** — Focus styles, contrast, ARIA live region, semantic HTML. These aren't enhancements — they're baseline requirements that the original code actively violates.
2. **Design the action row (favourite, copy, share) with progressive disclosure** — These are the features that transform the app from "read a joke" to "do something with a joke." Get the layout and interaction right before coding.
3. **Mobile-first responsive redesign** — The current CSS works on mobile by accident. The v2 features won't. Design for mobile first, then enhance for desktop.
