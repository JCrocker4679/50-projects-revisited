/**
 * API gap-fill tests — Ticket #40
 *
 * Covers two branches not reached by the main api.test.ts:
 *
 * 1. Timeout abort path (line 77): The setTimeout callback calls
 *    activeController?.abort(). This requires fake timers to trigger
 *    the timeout synchronously before the fetch completes.
 *
 * 2. Unknown error fallback (line 133): When fetch rejects with something
 *    that is neither ApiError, DOMException(AbortError), nor TypeError,
 *    the catch block wraps it as an ApiError with type 'network'.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server.ts';
import { fetchJoke, ApiError } from '../api.ts';
import { API_URL, REQUEST_TIMEOUT_MS } from '../constants.ts';

describe('API client: timeout abort path', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws ApiError with type "timeout" when request times out', async () => {
    // MSW handler that never responds (hangs until aborted)
    server.use(
      http.get(API_URL, async ({ request }) => {
        // Wait for abort signal
        await new Promise<void>((_, reject) => {
          request.signal.addEventListener('abort', () =>
            reject(new DOMException('AbortError', 'AbortError'))
          );
        });
        return HttpResponse.json({});
      }),
    );

    const promise = fetchJoke();

    // Advance timers past the timeout to trigger the abort callback
    vi.advanceTimersByTime(REQUEST_TIMEOUT_MS + 100);

    await expect(promise).rejects.toMatchObject({
      type: 'timeout',
    });
  });
});

describe('API client: unknown error fallback', () => {
  it('throws ApiError with type "network" for unknown thrown errors', async () => {
    // MSW swallows server-side errors, so we stub fetch directly to throw
    // a non-TypeError, non-DOMException, non-ApiError — the catch-all branch.
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new RangeError('Unexpected'));

    await expect(fetchJoke()).rejects.toMatchObject({ type: 'network' });
    await expect(fetchJoke()).rejects.toBeInstanceOf(ApiError);

    globalThis.fetch = originalFetch;
  });
});
