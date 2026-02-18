# Backend Engineer Review — Dad Jokes

**Reviewer:** Senior Backend / Full-Stack Engineer
**Date:** 2026-02-18
**Project:** Dad Jokes (original tutorial code)

---

## Executive Summary

This app doesn't need a backend. Not for v2, and probably not until well into v3. That's my primary recommendation and I'll argue for it strongly. The icanhazdadjoke API handles all the data. localStorage handles all the persistence. A static site on a CDN handles all the hosting. Adding a backend here would be resume-driven development.

That said, there's still backend-flavoured work to do: understanding the API we depend on, designing our client-side data layer properly, and knowing exactly when and why we'd introduce a server.

---

## API Dependency Analysis

### icanhazdadjoke.com

This is our entire data layer. Worth understanding what we're working with.

**Endpoints we'll use:**

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/` | GET | Random joke | Accept: application/json |
| `/j/{id}` | GET | Specific joke by ID | For sharing/deep-linking |
| `/search?term={term}` | GET | Search jokes | Returns paginated results |

**Response shape (random joke):**
```json
{
  "id": "R7UfaahVfFd",
  "joke": "My dog used to chase people on a bike a lot...",
  "status": 200
}
```

**Response shape (search):**
```json
{
  "current_page": 1,
  "limit": 20,
  "next_page": 2,
  "previous_page": 1,
  "results": [{ "id": "...", "joke": "..." }],
  "search_term": "dog",
  "status": 200,
  "total_jokes": 15,
  "total_pages": 1
}
```

**What concerns me about this dependency:**

1. **No SLA.** This is a free, community API. It could go down, change its response shape, or shut down entirely. We need to handle all three scenarios gracefully.
2. **No documented rate limits.** We don't know what rate limiting exists. We should be conservative — debounce user actions, cache responses, avoid hammering it.
3. **CORS is enabled** — they allow cross-origin requests, which is why the current client-side fetch works. If they disabled CORS, the app would break entirely.
4. **They request a custom User-Agent.** The current code doesn't send one. This is disrespectful and could lead to us being blocked. Set it: `User-Agent: DadJokesRevisited (https://github.com/JCrocker4679)`.

### When would we need our own backend?

Only when we need server-side capabilities that the client can't provide:

| Feature | Needs backend? | Why / why not |
|---------|---------------|---------------|
| Favourites | No | localStorage is fine |
| History | No | In-memory + localStorage |
| Search | No | API supports it directly |
| Copy/Share | No | Browser APIs |
| User accounts | **Yes** | Auth requires a server |
| Joke ratings (aggregated across users) | **Yes** | Shared state needs a database |
| Moderation/reporting | **Yes** | Admin functionality needs auth + database |
| Joke submission | **Yes** | User-generated content needs moderation pipeline |
| Analytics (custom) | No | Third-party analytics (Plausible, etc.) |
| OG image generation | Maybe | Could use Vercel OG or a serverless function |

**Bottom line:** Everything in the v2 spec works client-side. The v3/v4 vision (accounts, ratings, moderation) does need a backend, but that's a future decision.

---

## Client-Side Data Layer Design

Even without a server, we need to think like backend engineers about data.

### localStorage schema

```typescript
// Key: "dad-jokes-favourites"
interface StoredFavourites {
  version: 1;  // Schema version for future migrations
  jokes: Array<{
    id: string;
    joke: string;
    savedAt: number;  // timestamp
  }>;
}

// Key: "dad-jokes-preferences"
interface StoredPreferences {
  version: 1;
  theme?: "light" | "dark";
  seenJokeIds?: string[];  // For "don't show again" feature
}
```

**Why the version field:** If the schema changes in a future release, the version field lets us migrate old data instead of wiping it. This is a pattern directly from backend database migrations, applied to localStorage.

### Data integrity

localStorage is string-based and user-accessible. Anything we read from it could be:
- Missing (first visit, cleared storage)
- Malformed (user edited it in DevTools, corruption)
- Wrong schema version (app updated, old data format)

Every read from localStorage needs:
```typescript
function loadFavourites(): StoredFavourites {
  try {
    const raw = localStorage.getItem("dad-jokes-favourites");
    if (!raw) return { version: 1, jokes: [] };
    const parsed = JSON.parse(raw);
    if (!parsed.version || !Array.isArray(parsed.jokes)) {
      return { version: 1, jokes: [] };
    }
    return parsed;
  } catch {
    return { version: 1, jokes: [] };
  }
}
```

This is the kind of defensive coding that tutorials never cover but production demands.

---

## API Client Design

### Request handling

```typescript
const API_BASE = "https://icanhazdadjoke.com";
const USER_AGENT = "DadJokesRevisited (https://github.com/JCrocker4679)";

async function fetchJoke(signal?: AbortSignal): Promise<Joke> {
  const res = await fetch(API_BASE, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    signal,
  });

  if (!res.ok) {
    throw new ApiError(`API returned ${res.status}`, res.status);
  }

  const data = await res.json();

  if (!data.id || !data.joke) {
    throw new ApiError("Unexpected response shape", res.status);
  }

  return { id: data.id, joke: data.joke, fetchedAt: Date.now() };
}
```

**Key decisions:**
- Custom error type (`ApiError`) so the UI can distinguish between network errors and API errors.
- Response shape validation — don't trust that the API always returns what you expect.
- `AbortSignal` support for request cancellation.
- User-Agent header per API requirements.

### Error taxonomy

Not all errors are equal. The UI needs to respond differently:

| Error type | Example | User message | Action |
|------------|---------|-------------|--------|
| Network error | Device offline | "You're offline. Here's your last joke." | Show cached joke |
| API error (5xx) | Server down | "The joke factory is taking a break. Try again?" | Retry button |
| API error (429) | Rate limited | "Slow down! Too many jokes at once." | Disable button temporarily |
| Parse error | Malformed JSON | "Something went wrong. Try again?" | Retry button |
| Timeout | Slow response | "That's taking too long. Try again?" | Retry with timeout |

---

## Cost Analysis

### Current cost: $0/month
- No hosting (local files)
- No API fees (free API)
- No database
- No domain

### v2 projected cost: $0/month
- **Hosting:** Netlify/Vercel free tier (100GB bandwidth, unlimited deploys)
- **API:** Still free
- **Domain:** Optional. ~$10/year if you want a custom domain
- **SSL:** Free via hosting provider

### When costs start
- **Custom backend (v3+):** A serverless function on Vercel/Netlify for OG images or a BFF layer: free tier covers low traffic. A proper database (PlanetScale, Supabase free tier) for accounts/ratings: free up to limits, then $25+/month.
- **Only add backend infrastructure when a feature demands it and the feature is validated.** Don't pay for infrastructure for features nobody uses yet.

---

## Top 3 Priorities

1. **Build a proper API client with error handling, response validation, and abort support** — The current bare fetch is the single biggest technical risk. Every user interaction depends on this one external call working.
2. **Design the localStorage schema with versioning from day one** — Migrating localStorage schemas after users have saved data is painful. Get the schema right now with a version field so future changes are non-destructive.
3. **Do NOT introduce a backend** — Resist the temptation. Every v2 feature works client-side. A backend adds cost, complexity, deployment overhead, and security surface area. Revisit only when v3 features (accounts, shared ratings) are actually in scope.
