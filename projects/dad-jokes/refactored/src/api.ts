import { API_URL, USER_AGENT, REQUEST_TIMEOUT_MS } from './constants.ts';
import type { Joke, ApiResponse } from './types.ts';

/**
 * Custom error class for API failures.
 * Distinguishes between network errors, HTTP errors, and validation errors.
 */
export class ApiError extends Error {
  readonly type: 'network' | 'http' | 'timeout' | 'validation';
  readonly status?: number;

  constructor(
    message: string,
    type: 'network' | 'http' | 'timeout' | 'validation',
    status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
  }
}

/**
 * Type guard to validate API response shape.
 * Defensive: don't trust the API to always return what we expect.
 */
function isValidApiResponse(data: unknown): data is ApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'joke' in data &&
    typeof (data as ApiResponse).id === 'string' &&
    typeof (data as ApiResponse).joke === 'string'
  );
}

/** Active AbortController for the current request, if any */
let activeController: AbortController | null = null;

/**
 * Cancel any in-flight joke request.
 * Called when the user clicks the button again before the previous
 * request completes, preventing stale responses from appearing.
 */
export function cancelActiveRequest(): void {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}

/**
 * Fetch a random joke from the icanhazdadjoke API.
 *
 * Resilient implementation with:
 * - AbortController with configurable timeout
 * - HTTP status code checking
 * - Response shape validation
 * - Typed error classification
 * - User-Agent header per API recommendation
 * - Cancel support for in-flight requests
 *
 * @throws {ApiError} On network failure, HTTP error, timeout, or invalid response
 */
export async function fetchJoke(): Promise<Joke> {
  // Cancel any in-flight request
  cancelActiveRequest();

  // Create new controller for this request
  activeController = new AbortController();
  const { signal } = activeController;

  // Set up timeout
  const timeoutId = setTimeout(() => {
    activeController?.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      signal,
    });

    if (!res.ok) {
      throw new ApiError(
        `API returned ${res.status}`,
        'http',
        res.status,
      );
    }

    const data: unknown = await res.json();

    if (!isValidApiResponse(data)) {
      throw new ApiError(
        'API returned unexpected data shape',
        'validation',
      );
    }

    return {
      id: data.id,
      joke: data.joke,
    };
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle abort (timeout or manual cancel)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out — the joke servers might be slow',
        'timeout',
      );
    }

    // Handle network errors (offline, DNS failure, etc.)
    if (error instanceof TypeError) {
      throw new ApiError(
        'Network error — check your connection',
        'network',
      );
    }

    // Unknown error — wrap it
    throw new ApiError(
      'Something went wrong fetching a joke',
      'network',
    );
  } finally {
    clearTimeout(timeoutId);
    activeController = null;
  }
}
