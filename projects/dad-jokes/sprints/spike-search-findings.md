# Spike: Search API Endpoint Findings
**Issue:** #60
**Date:** 2026-02-23

---

## Endpoint

```
GET https://icanhazdadjoke.com/search?term={keyword}&limit={n}&page={n}
```

**Required headers** (same as the main joke endpoint):
- `Accept: application/json` — required; without it, returns plain text (newline-separated jokes)
- `User-Agent: {app-name}/{version}` — strongly recommended per API docs

---

## Response shape

```json
{
  "current_page": 1,
  "limit": 20,
  "next_page": 2,
  "previous_page": 1,
  "results": [
    { "id": "daaUfibh", "joke": "Why was the big cat disqualified from the race? Because it was a cheetah." }
  ],
  "search_term": "cat",
  "status": 200,
  "total_jokes": 11,
  "total_pages": 1
}
```

### TypeScript interface

```typescript
export interface SearchApiResponse {
  current_page: number;
  limit: number;
  next_page: number;
  previous_page: number;
  results: Joke[];          // Joke = { id: string; joke: string }
  search_term: string;
  status: number;
  total_jokes: number;
  total_pages: number;
}
```

---

## Answers to spike questions

### 1. Response shape
Confirmed above. `results` is an array of `{ id, joke }` — same shape as the main `Joke` type.

### 2. Pagination and limit parameter
- Default limit: **20** (when no `limit` param supplied)
- Max effective limit: **30** (the API accepts `limit=30`; tested at `limit=100` — response came back with `limit=30`)
- When results < limit: returns exactly what's available; no padding or error
- Pagination works: `page=1`, `page=2` etc. Supported but **we won't paginate** — we'll request limit=30 and show all results on one page

### 3. Empty / blank term
- `term=` (blank): returns **200 with 744 results** (appears to return all jokes in the database)
- This means we must validate on the client before submitting: **don't allow empty search terms**

### 4. No-match term
- Returns `{ results: [], total_jokes: 0, status: 200 }` — HTTP 200 with empty results array
- Not an error — just an empty state to render

### 5. HTTP status codes observed
- `200` — success (including no results)
- `200` — blank term (returns all jokes, not an error)
- No `4xx` observed for invalid terms; the API is permissive

### 6. Result ordering
- **Results are NOT stable across calls** — tested same term twice, different order both times
- Results appear randomised per request
- Impact: search results list will reorder on repeat searches. This is acceptable; don't try to sort client-side

### 7. Recommended limit
- Use **limit=20** (API default). 20 results is enough to find a specific topic; more creates a long list to scroll.
- `total_jokes` tells us if there are more — we can show "Showing 20 of {total} results" when `total_jokes > 20`

---

## Edge cases for the data layer to handle

| Case | Behaviour | Handle by |
|------|-----------|-----------|
| Blank term | Returns 744 results (all jokes) | Client-side validation — reject blank term before fetch |
| No results (`total_jokes: 0`) | 200 + empty array | Render empty state: "No jokes found for '{term}'" |
| Network error | Throws | Same ApiError pattern as fetchJoke() |
| Timeout | Request hangs | AbortController — same 10s timeout as fetchJoke() |
| `results` missing from response | Malformed response | Validate response shape, treat as error |
| Same-term repeat | Different order | Expected — don't deduplicate results |

---

## Surprises / gotchas

1. **Blank term doesn't error** — it returns all 700+ jokes. Must validate before calling.
2. **Results are randomised** — not alphabetical, not by relevance. Fine for a fun app.
3. **No 404/400** for bad searches — all responses are 200. Empty `results` is the signal.
4. **`limit=100` is silently capped at 30** — don't tell users "showing all results" when there might be more; use `total_jokes` to show an accurate count.
5. **Same `Joke` type** as main endpoint — `{ id, joke }` — no new types needed beyond the search response wrapper.

---

## Recommendation for data layer (#61)

```typescript
// Recommended function signature
export async function searchJokes(term: string, limit = 20): Promise<SearchApiResponse>

// Validation: caller should guard against empty term, but also guard here
if (!term.trim()) throw new ApiError('Search term cannot be empty', 'validation');

// Show count in UI when results are partial
// "Showing 20 of 744 results" when total_jokes > limit
```

Use `limit=20` as default. Expose `total_jokes` from the response so the UI can show accurate counts.
