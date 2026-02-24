# Visual Designer Review — Dad Jokes

**Reviewer:** Product Designer
**Date:** 2026-02-23
**Project:** Dad Jokes (refactored — post Sprint 2, Sprint 3 partial)
**Branch reviewed:** `68-dark-mode-toggle`

---

## Headline Verdict

The core experience is solid and the palette work is genuinely warm. But Sprint 2 added features faster than it designed them, and the card now reads as three separate zones stacked on top of each other rather than one coherent product. The action row, history nav, and rating buttons are all doing roughly similar jobs (act on this joke) but look and behave like they came from three different sprints — because they did. The favourites panel toggle breaks the spatial model: it's a button that opens content inside the same card that contains the button. The primary CTA (Tell me another) is the right size but is surrounded by enough competing controls that a first-time user needs a moment to work out what to press. This is fixable without structural surgery, but it requires one clear hierarchy decision before Sprint 3 touches any UI.

---

## Visual Hierarchy Analysis

### What the user sees, in order of dominance

1. **"Tell me another" button** — amber, bold, prominent. Draws the eye first. ✅ This is correct.
2. **Joke text** — large, clear. Second eye-stop. ✅ Correct.
3. **The icon button cluster** (copy 📋, share ↗, favourite ★) — 48×48px boxes with borders, grouped alongside the primary CTA in the same `action-row` flex container. These sit *at the same visual weight as the primary button* due to identical border treatment and height.
4. **History nav row** — "← Prev" and "Next →" nav buttons with the history counter between them, AND the 👎 / 👍 rating buttons jammed into the right side of the same nav row. This row has four interactive elements, two visual zones, and a counter — in 44px of vertical space.
5. **"My Favourites (0)"** — a ghost button below the nav. Muted but still occupying a full row.
6. **Theme toggle** — fixed top-right, small circle. Correctly de-emphasised.

### What the user *should* see, in order

1. Joke text — big, prominent. The content is the product.
2. "Tell me another" — unambiguous primary CTA.
3. Action tray (copy, share, favourite) — secondary, clearly subordinate to the CTA.
4. History nav (prev/next + counter) — tertiary, visible only once relevant.
5. Everything else — hidden until requested.

### The delta

**The rating buttons (👎/👍) have no business being in the history nav.** They were placed there because the nav row had horizontal space, not because that's where they belong conceptually. Rating is an action on the current joke — it belongs with copy, share, and favourite in the action tray. The nav row should only contain navigation.

**The action row has a hierarchy problem.** The primary CTA and three secondary icon buttons share identical flex height and are separated only by gap. On mobile, a 375px viewport, these four elements sit in one row: a wide amber button + three 48px bordered squares. The squares are visually competing with the primary button rather than deferring to it. The icon buttons need to be visually subordinate — smaller, quieter, or in a row of their own below the CTA.

**"My Favourites (0)"** is always visible. Until the user has starred anything, the count is permanently 0 and the button's payoff is nil. It's dead UI on first use. The panel it reveals lives inside the card, which creates a card that grows vertically when you open it — a spatial surprise.

---

## Feature Coherence Audit

- ✅ **Primary CTA (Tell me another)** — One job, obvious, earns its prominence.
- ✅ **Copy to clipboard** — Clear job, no overlap. Clipboard emoji communicates function adequately.
- ✅ **Share** — Clear job. Correctly falls back to copy on desktop. Earns its place.
- ✅ **Favourite (star)** — Clear job, persistent payoff (saves to localStorage). Earns its place.
- ✅ **History nav (Prev / Next + counter)** — Clear job, well-executed logic. Correctly disables at boundaries.
- ⚠️ **Rating buttons (👎/👍) in history nav row** — Right feature, wrong location. Rating is a "react to this joke" action, same category as favourite. It's currently placed in the nav row because that row had space, not because navigation and rating belong together. Recommendation: move thumbs up/down into the action tray (alongside copy, share, favourite), and remove the `.history-nav__rating` sub-zone entirely.
- ⚠️ **"My Favourites (N)" toggle button** — The count payoff is real once the user has starred jokes. But the reveal pattern (a panel that opens inside the same card) makes the card grow unexpectedly and buries the primary CTA above a potentially long list. Recommendation: move to a `Sheet` that slides up from the bottom (shadcn/ui `Sheet` with `side="bottom"`), or promote to a separate view/page.
- ❌ **Favourites panel count badge showing "0"** — When the count is 0, this button has no visible payoff and no call to action. Either hide the button until there are favourites (reveal it when the first star is pressed), or change the label to "Save jokes ★" with no count until count > 0.

---

## Wireframe

### State 1 — Default (joke loaded, no history yet)

```
                                          ☾/☀
                               ← Button:ghost (theme-toggle, fixed top-right, 44px circle)

┌─────────────────────────────────────────┐
│                                         │
│  DON'T LAUGH CHALLENGE                  │  ← h1, text-muted, uppercase, small-caps
│                                         │
│                                         │
│  "Why don't scientists trust atoms?     │
│   Because they make up everything."     │  ← .joke, clamp(1.125rem, 4vw, 1.875rem)
│                                         │
│                                         │
│         [ Tell me another ]             │  ← .btn (amber, full-width-ish, own row)
│                                         │
│    [★ Fav]   [📋 Copy]   [↗ Share]      │  ← Button:ghost (icon row, secondary)
│    [👍 Up]   [👎 Down]                   │  ← same row or sub-row, all ghost/outline
│                                         │  ← ratings live here, NOT in nav
│                                         │
│  ← Prev        1 / 1        Next →      │  ← nav row, Prev/Next only, no rating zone
│  (disabled)               (disabled)    │
│                                         │
└─────────────────────────────────────────┘

                 ↑ "My Favourites" not visible — count is 0, button hidden
```

**Notes:**
- Primary CTA gets its own row, full-width-ish, clearly dominant.
- Action icons (fav, copy, share, thumbs up, thumbs down) in a subordinate row using `Button:ghost` or `Button:outline`.
- History nav is nav only. No rating buttons in the nav row.
- Favourites trigger hidden until user has starred ≥ 1 joke.

---

### State 2 — With history, favourites panel trigger visible

```
                                          ☾/☀

┌─────────────────────────────────────────┐
│                                         │
│  DON'T LAUGH CHALLENGE                  │
│                                         │
│  "Why can't you give Elsa a balloon?    │
│   Because she'll let it go."            │
│                                         │
│         [ Tell me another ]             │
│                                         │
│    [★ Saved]  [📋]   [↗]   [👍]  [👎]   │  ← icon row; ★ shows active state
│                                         │
│  ← Prev        3 / 5        Next →      │  ← nav, both enabled; counter visible
│                                         │
│  ─────────────────────────────────────  │  ← Separator (shadcn Separator)
│         [ ▼ My Favourites  2 ]          │  ← Button:ghost, Sheet trigger, appears
│                                         │    once count ≥ 1
└─────────────────────────────────────────┘
```

**Notes:**
- Separator (`<Separator>` from shadcn or `1px solid var(--color-divider)`) visually separates the "act on this joke" zone from the "manage my collection" zone.
- The "My Favourites" button appears only once `count ≥ 1`. Zero-state = hidden.
- Counter in the button reads as a `Badge` (shadcn `Badge` variant `secondary`) rather than inline text in a `<span>`, so it has consistent styling across future features.

---

### State 3 — Favourites Sheet open (bottom drawer)

Instead of expanding the card vertically (current behaviour), the favourites list opens as a `Sheet` from the bottom of the screen. The card remains visible and spatially stable.

```
┌─────────────────────────────────────────┐
│  (Card content, dimmed/overlaid)        │
│                                         │
│  [ Tell me another ]   ← still visible  │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐  ← Sheet (side="bottom")
│  My Favourites                      ✕  │  ← Sheet header + close button
│  ─────────────────────────────────────  │
│  "Why can't you give Elsa a balloon?   │
│   Because she'll let it go."  [Load] ✕ │  ← [Load] = navigate to this joke
│                                         │
│  "Why don't scientists trust atoms?    │
│   Because they make up everything."    │
│                           [Load] ✕      │
│                                         │
└─────────────────────────────────────────┘

Empty state (no favourites — sheet should never open in this state):
┌─────────────────────────────────────────┐
│  My Favourites                      ✕  │
│  ─────────────────────────────────────  │
│                                         │
│    ★ Star a joke to save it here        │  ← muted, centred empty state
│                                         │
└─────────────────────────────────────────┘
```

---

### State 4 — Loading (subsequent fetch)

```
┌─────────────────────────────────────────┐
│                                         │
│  DON'T LAUGH CHALLENGE                  │
│                                         │
│  "Why don't scientists trust atoms?     │  ← previous joke visible with shimmer
│   Because they make up everything."     │    overlay (current .joke--loading)
│   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                         │
│         [ Tell me another ]             │  ← disabled, opacity 0.6
│                                         │
│    [★]   [📋]   [↗]   [👍]  [👎]         │  ← copy/share disabled
│                                         │
│  ← Prev        3 / 5        Next →      │
└─────────────────────────────────────────┘
```

---

### State 5 — Error state

```
┌─────────────────────────────────────────┐
│                                         │
│  DON'T LAUGH CHALLENGE                  │
│                                         │
│  Can't reach the joke factory.          │  ← error text, --color-error
│  Check your connection and try again.   │
│                                         │
│           [ Try again ]                 │  ← retry-btn (red, own row)
│                                         │
│  ── In the meantime: ──                 │
│  "Why don't scientists trust atoms?"    │  ← cached joke fallback (italic, muted)
│                                         │
└─────────────────────────────────────────┘
```

**Note:** Error state hides the action row and nav — no point offering Copy/Share/Fav/Rating on an error. The retry button is the only CTA.

---

## shadcn/ui Component Map

This project uses vanilla TypeScript (no React, no framework), so shadcn/ui components can't be directly installed. However, the **design patterns** from shadcn/ui should be implemented manually using the same visual conventions. The table below maps each element to its shadcn/ui equivalent as a *design reference*, not an installation target.

| Element | shadcn/ui reference | Implementation notes |
|---------|--------------------|-|
| Primary CTA ("Tell me another") | `Button` `default` | Amber, full padding, own row. Already correct. |
| Action icons (copy, share, favourite) | `Button` `ghost` or `outline` | Should be smaller than primary. Currently `btn--icon` at 48px with border — competing visually. Reduce to `Button:ghost` style: no border by default, border only on hover. |
| Rating buttons (👍/👎) | `Button` `ghost` (toggle variant) | Move from nav row to action row. `aria-pressed` toggle state already implemented. |
| History nav buttons (← Prev, Next →) | `Button` `outline` | Correct variant. Consider `Button:ghost` — the border adds visual noise in a secondary zone. |
| History counter | `Badge` `secondary` | Currently a plain `<span>`. A `Badge` gives consistent sizing and visual separation from nav buttons. |
| Favourites trigger | `Button` `ghost` + `Badge` | Button label + count badge. Badge appears/disappears with count. |
| Favourites list | `Sheet` `side="bottom"` | Replace the in-card expanding panel with a bottom Sheet. Spatially stable, mobile-native. |
| Favourites count | `Badge` `secondary` | Inside the Sheet trigger button. |
| Separator (before fav trigger) | `Separator` | `1px solid var(--color-divider)` — already used in `.fav-panel`, promote to the section boundary. |
| Empty state (no favourites) | Custom, per shadcn patterns | Centred icon + muted text. Not a full component but follows the shadcn empty-state convention. |
| Error message area | Custom + `Button` `destructive` | Retry button should use `destructive` variant semantics (red background, white text). Already doing this. |
| Theme toggle | `Button` `ghost` (icon, circular) | Fixed top-right. Already correct treatment. |

---

## Decisions Required

| # | Decision | Option A | Option B | Recommendation |
|---|----------|----------|----------|----------------|
| D-VD1 | Where do rating buttons live? | Stay in history nav row (current) | Move to action row alongside copy/share/fav | **Move to action row.** Rating is a "react to this joke" action, not navigation. Keeping it in the nav row creates a conceptually muddled nav zone. |
| D-VD2 | Primary CTA layout in action row | CTA shares a flex row with icon buttons (current) | CTA gets its own row; icon row below | **Own row.** The icon buttons are currently competing with the primary CTA for visual weight. CTA alone > CTA + three boxes at the same height. |
| D-VD3 | Favourites panel reveal pattern | Expand-in-card (current) | Bottom Sheet (slides up over content) | **Bottom Sheet.** The expanding card breaks spatial stability and buries the primary CTA when the list is long. A Sheet is the native mobile pattern for secondary views. |
| D-VD4 | Favourites trigger visibility | Always visible, count = "0" when empty | Hidden until user has ≥ 1 favourite | **Hidden until ≥ 1.** Showing a "(0)" count on first use is dead UI. Reveal the button when the star is first pressed — this is also a nice micro-moment. |
| D-VD5 | Icon button visual weight | Bordered 48px squares (current `.btn--icon`) | Ghost style — no border default, border on hover | **Ghost with hover border.** The bordered squares at 48px read as peers of the 48px primary CTA. Ghost style reads as secondary. Hover border provides affordance without constant visual noise. |

---

## What to Tell the UX Agent

The UX review got the progressive disclosure intent exactly right: "action icons sit beneath the joke but above navigation." The problem is Sprint 2 executed the action row without enforcing the hierarchy, and Sprint 3 added rating buttons into the nav row without checking that they belong there conceptually.

**Specific gaps to wire into sprint-plan-review:**

1. **D-VD1 (rating button location)** was never a UX decision — it was an implementation shortcut. The ticket description for the rating feature should have specified which zone ratings live in. Future sprint-plan-review should flag: "Where in the visual hierarchy does this new control live?" as an explicit ticket constraint.

2. **D-VD2 (CTA row layout)** is an implicit design assumption that the action-row flex container can hold the CTA + icons without hierarchy problems. It can't. Sprint tickets that add controls to an existing row should require sign-off on whether the hierarchy still holds.

3. **D-VD3 (favourites panel pattern)** was tagged as a Sprint 2 UX decision but the UX review only specified "a separate mode — a list/grid" without specifying the reveal pattern. The executing agent defaulted to an expand-in-card. A sprint-plan-review pass would have caught this before code was written.

4. **Zero-state design (D-VD4)** is never specified in ticket descriptions. "Show favourites count" should include "what does this look like when count = 0?" — the answer should always be in the ticket before the ticket executes.
