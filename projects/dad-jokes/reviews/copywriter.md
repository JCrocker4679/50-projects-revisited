# Copywriter Review — Dad Jokes

**Reviewer:** Copywriter / Content Strategist
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

The current app has almost no copy. A heading, a button label, and a placeholder that's actually a code comment. That's it. For a v2 product, copy does real work: it sets the tone, guides the user, handles errors gracefully, and — for a joke app — is the entire personality of the product.

The opportunity here is unusual: the content (jokes) comes from an API, but everything around it — the framing, the error messages, the empty states, the share text — is ours to write. A joke app with bad microcopy is like a comedy club with a rude host. The wrapper matters.

---

## Current Copy Audit

| Element | Current copy | Assessment |
|---------|-------------|------------|
| Page title | "Dad Jokes" | Functional but generic. No personality, poor SEO |
| Heading | "Don't Laugh Challenge" | Actually decent. Sets a playful frame. Gives the user an implicit game to play |
| Joke placeholder | "// Joke goes here" | A code comment shown to users. This is the first thing they see while the API loads. Terrible first impression |
| Button | "Get Another Joke" | Clear and functional. Could be more playful but does the job |
| Error states | (none) | No error copy exists. Silent failures |
| Loading state | (none) | No loading copy exists |
| Meta description | (none) | No SEO description |

---

## Brand Voice

### Who are we?

A dad joke app should sound like... a dad. The good kind — warm, corny, self-aware. Not trying to be cool. Not corporate. Not sarcastic. The voice should feel like a real person who knows they're being cheesy and leans into it.

### Voice attributes

| Attribute | What it means | Example |
|-----------|--------------|---------|
| **Warm** | Friendly, approachable, no edge | "Couldn't grab a joke this time. The internet must be taking a nap." |
| **Self-aware** | Knows it's cheesy, doesn't pretend otherwise | "You're welcome. (Sorry.)" |
| **Brief** | Dad jokes are short. The UI copy should be too | Button: "Hit me" not "Click here to generate another random joke" |
| **Inclusive** | Clean humour, no exclusion, family-friendly | Avoid any copy that assumes age, gender, parental status |

### What the voice is NOT
- Sarcastic or mean
- Corporate or formal
- Trying too hard (no "EPIC JOKES" or "HILARIOUS CONTENT")
- Apologetic ("We're sorry, an error occurred" — too stiff)

---

## Recommended Copy

### Page title
**Current:** "Dad Jokes"
**Recommended:** "Dad Jokes — One groan at a time"

For the `<title>` tag: `Dad Jokes — Free Random Dad Jokes Generator`
This hits SEO keywords while remaining readable.

### Meta description
**Current:** (none)
**Recommended:** `Groan-worthy dad jokes on demand. Get a random joke, save your favourites, and share the pain. Free, no sign-up, no ads.`

### Heading
**Current:** "Don't Laugh Challenge"
**Recommended:** Keep it. It works. It frames the experience as a game, which increases engagement. Consider rotating headings as a stretch goal:
- "Don't Laugh Challenge"
- "Your daily groan"
- "You asked for this"
- "Brace yourself"

### Placeholder / loading state
**Current:** "// Joke goes here" (a code comment)
**Recommended options:**
- While loading first joke: "Warming up..." or "Thinking of a good one..."
- While loading subsequent jokes: "Hold on, this one's gonna be great..." or just a subtle loading spinner with no text
- Skeleton approach: A pulsing line placeholder (no text needed)

I'd lean toward the skeleton approach for subsequent loads (keeps it snappy) and a warm text message for the first load only.

### Button label
**Current:** "Get Another Joke"
**Recommended options:**
- "Another one" — short, punchy, DJ Khaled energy
- "Hit me" — playful, gambling metaphor
- "One more" — understated
- "Tell me another" — conversational

I'd go with **"Tell me another"** for the primary button. It's conversational, natural, and matches the dad voice. For the first joke (before any joke has loaded), the button shouldn't exist yet or should say something like "Tell me a joke."

### Error messages

These are the most important copy in the app because they're shown when the user is frustrated.

| Scenario | Recommended copy |
|----------|-----------------|
| Network error | "Can't reach the joke factory. Check your connection and try again." |
| API down (500) | "The joke servers are having a bad day. Give it a sec." |
| Rate limited (429) | "Whoa, slow down! Even dad jokes need a breather." |
| Generic error | "Something went sideways. Try again?" |
| Offline | "You're offline. Here's one from your collection." (if cached joke available) |
| Offline, no cache | "You're offline, and we don't have any saved jokes. Connect and try again." |

**Pattern:** Explain what happened in plain language → suggest what to do. No error codes. No technical jargon. Keep the warm tone even in errors.

### Action buttons (microcopy)

| Action | Label | Tooltip / aria-label | Success feedback |
|--------|-------|---------------------|-----------------|
| Copy | (clipboard icon) | "Copy joke" | "Copied!" (1.5s toast) |
| Share | (share icon) | "Share joke" | Native share sheet opens |
| Favourite | (heart icon) | "Save to favourites" / "Remove from favourites" | Heart fills/unfills (no text toast needed) |
| Back | "←" or (back icon) | "Previous joke" | Joke changes |
| Forward | "→" or (forward icon) | "Next joke" | Joke changes |

### Empty states

| State | Copy |
|-------|------|
| No favourites yet | "No saved jokes yet. Hit the ♡ on any joke to save it here." |
| Search with no results | "No jokes about '{query}'. Try a different topic?" |
| History empty (shouldn't happen) | "No jokes in history. How'd you get here?" |

### Share text

When a user shares a joke via the Web Share API or clipboard:

**Format:**
```
{joke text}

— via Dad Jokes (dadjokes.app)
```

Short, clean, attributable. The URL drives traffic back. No hashtags, no "shared from" spam.

### 404 page (if deployed as a multi-page app)

"This page doesn't exist. Kind of like a dad joke that actually makes sense."

With a button: "Take me to the jokes"

---

## SEO Considerations

### For a single-page app
- `<title>` and `<meta description>` are critical
- OG tags for social sharing: `og:title`, `og:description`, `og:image`
- If we implement joke permalinks (`/joke/{id}`), each joke page needs unique meta tags
- Structured data (`application/ld+json`) for the website — not essential but helps

### OG image
A generic OG image for the site, plus dynamically generated images for individual jokes (stretch goal). The generic image should be warm, playful, and include the app name.

### Keyword targets (for blog/landing page)
- "dad jokes"
- "random dad jokes"
- "dad joke generator"
- "best dad jokes"
- "clean jokes"

These are high-volume, low-competition keywords in a space dominated by listicles and ad-heavy sites. A clean, fast, well-built app can compete.

---

## Landing Page Copy (if/when deployed)

### Above the fold
**Headline:** "Dad Jokes. On demand."
**Subhead:** "Free, fast, and guaranteed to make someone groan. No sign-up required."
**CTA:** "Get a joke" (links to the app)

### Below the fold (optional)
- "Save your favourites" — with a screenshot of the favourite flow
- "Search by topic" — with a screenshot of search
- "Share the pain" — with a screenshot of the share action
- "Built different" — brief note about accessibility, privacy (no tracking, no accounts needed), speed

---

## Top 3 Priorities

1. **Write error messages and loading states** — These are the highest-impact copy additions. Every user will encounter a loading state. Many will encounter an error. Currently both are invisible.
2. **Define the brand voice and apply it to all UI text** — The heading, button labels, empty states, tooltips, and share text should all feel like they come from the same personality. Consistency is what makes an app feel polished.
3. **Add meta tags and OG tags for sharing and SEO** — The app has no discoverable presence. No meta description, no social preview, no page title beyond "Dad Jokes". This is zero-effort, high-impact work.
