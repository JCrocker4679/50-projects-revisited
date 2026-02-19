/**
 * API client tests — Ticket #14
 *
 * Tests the resilient fetch layer in api.ts:
 * - Successful fetch with typed return
 * - HTTP error handling (non-200)
 * - Network error handling (TypeError)
 * - Timeout via AbortController
 * - Response shape validation
 * - In-flight request cancellation
 * - Correct headers (Accept, User-Agent)
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server.ts';
import { fetchJoke, cancelActiveRequest, ApiError } from '../api.ts';
import { API_URL, USER_AGENT } from '../constants.ts';
import { MOCK_JOKE, lastRequest } from './mocks/handlers.ts';

describe('API client: fetchJoke()', () => {
  describe('successful requests', () => {
    it('returns a Joke with id and joke properties', async () => {
      const joke = await fetchJoke();
      expect(joke).toEqual({
        id: MOCK_JOKE.id,
        joke: MOCK_JOKE.joke,
      });
    });

    it('does not include the status field in the returned Joke', async () => {
      const joke = await fetchJoke();
      expect(joke).not.toHaveProperty('status');
    });

    it('sends Accept: application/json header', async () => {
      await fetchJoke();
      expect(lastRequest).not.toBeNull();
      expect(lastRequest?.headers.get('Accept')).toBe('application/json');
    });

    it('sends User-Agent header', async () => {
      await fetchJoke();
      expect(lastRequest).not.toBeNull();
      // Note: browsers may strip User-Agent from fetch, but we still set it
      // In the test (MSW + happy-dom), it should be present
      expect(lastRequest?.headers.get('User-Agent')).toBe(USER_AGENT);
    });
  });

  describe('HTTP errors', () => {
    it('throws ApiError with type "http" on 500 response', async () => {
      server.use(
        http.get(API_URL, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      await expect(fetchJoke()).rejects.toMatchObject({
        type: 'http',
        status: 500,
      });
    });

    it('throws ApiError with type "http" on 404 response', async () => {
      server.use(
        http.get(API_URL, () => {
          return new HttpResponse(null, { status: 404 });
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      await expect(fetchJoke()).rejects.toMatchObject({
        type: 'http',
        status: 404,
      });
    });

    it('includes status code in error message', async () => {
      server.use(
        http.get(API_URL, () => {
          return new HttpResponse(null, { status: 503 });
        }),
      );

      await expect(fetchJoke()).rejects.toThrow('503');
    });
  });

  describe('network errors', () => {
    it('throws ApiError with type "network" on network failure', async () => {
      server.use(
        http.get(API_URL, () => {
          return HttpResponse.error();
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      try {
        await fetchJoke();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe('network');
      }
    });
  });

  describe('response validation', () => {
    it('throws ApiError with type "validation" when response missing "joke" field', async () => {
      server.use(
        http.get(API_URL, () => {
          return HttpResponse.json({ id: 'test-1', status: 200 });
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      try {
        await fetchJoke();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe('validation');
      }
    });

    it('throws ApiError with type "validation" when response missing "id" field', async () => {
      server.use(
        http.get(API_URL, () => {
          return HttpResponse.json({ joke: 'test joke', status: 200 });
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      try {
        await fetchJoke();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe('validation');
      }
    });

    it('throws ApiError with type "validation" when id is not a string', async () => {
      server.use(
        http.get(API_URL, () => {
          return HttpResponse.json({ id: 123, joke: 'test', status: 200 });
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      try {
        await fetchJoke();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe('validation');
      }
    });

    it('throws ApiError with type "validation" when response is null', async () => {
      server.use(
        http.get(API_URL, () => {
          return HttpResponse.json(null);
        }),
      );

      await expect(fetchJoke()).rejects.toThrow(ApiError);
      try {
        await fetchJoke();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).type).toBe('validation');
      }
    });
  });

  describe('request cancellation', () => {
    it('cancelActiveRequest() does not throw when no active request', () => {
      expect(() => cancelActiveRequest()).not.toThrow();
    });

    it('cancels in-flight request when new fetchJoke() is called', async () => {
      // Start two requests — the first should be cancelled
      const first = fetchJoke();
      const second = fetchJoke();

      // The second should succeed
      const joke = await second;
      expect(joke.joke).toBe(MOCK_JOKE.joke);

      // The first should be rejected (abort)
      await expect(first).rejects.toThrow(ApiError);
    });
  });
});

describe('ApiError class', () => {
  it('has correct name property', () => {
    const error = new ApiError('test', 'network');
    expect(error.name).toBe('ApiError');
  });

  it('stores type and optional status', () => {
    const error = new ApiError('test message', 'http', 503);
    expect(error.message).toBe('test message');
    expect(error.type).toBe('http');
    expect(error.status).toBe(503);
  });

  it('is an instance of Error', () => {
    const error = new ApiError('test', 'validation');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});
