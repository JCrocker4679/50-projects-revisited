/**
 * Storage tests — Tickets #32 / #36 / #64
 *
 * Tests localStorage persistence for joke history, favourites, and ratings.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadHistory, saveHistory, loadFavourites, saveFavourites, loadRatings, saveRatings } from '../storage.ts';

// Minimal localStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};
vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ===== loadHistory =====

describe('loadHistory', () => {
  it('returns [] when key does not exist', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('returns parsed array when valid JSON is stored', () => {
    const jokes = [{ id: 'a', joke: 'Joke A' }, { id: 'b', joke: 'Joke B' }];
    store['dad-jokes-history-v1'] = JSON.stringify(jokes);
    expect(loadHistory()).toEqual(jokes);
  });

  it('returns [] when stored value is invalid JSON', () => {
    store['dad-jokes-history-v1'] = 'not-json{{{';
    expect(loadHistory()).toEqual([]);
  });

  it('returns [] when stored value is valid JSON but not an array', () => {
    store['dad-jokes-history-v1'] = JSON.stringify({ id: 'a', joke: 'A' });
    expect(loadHistory()).toEqual([]);
  });
});

// ===== saveHistory =====

describe('saveHistory', () => {
  it('persists jokes to localStorage', () => {
    const jokes = [{ id: 'x', joke: 'Joke X' }];
    saveHistory(jokes);
    expect(store['dad-jokes-history-v1']).toBe(JSON.stringify(jokes));
  });

  it('does not throw when localStorage throws (quota exceeded)', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveHistory([{ id: 'y', joke: 'Y' }])).not.toThrow();
  });
});

// ===== loadFavourites =====

describe('loadFavourites', () => {
  it('returns [] when key does not exist', () => {
    expect(loadFavourites()).toEqual([]);
  });

  it('returns parsed array when valid JSON is stored', () => {
    const jokes = [{ id: 'fav1', joke: 'Fav joke 1' }, { id: 'fav2', joke: 'Fav joke 2' }];
    store['dad-jokes-favourites-v1'] = JSON.stringify(jokes);
    expect(loadFavourites()).toEqual(jokes);
  });

  it('returns [] when stored value is invalid JSON', () => {
    store['dad-jokes-favourites-v1'] = 'not-json{{{';
    expect(loadFavourites()).toEqual([]);
  });

  it('returns [] when stored value is valid JSON but not an array', () => {
    store['dad-jokes-favourites-v1'] = JSON.stringify({ id: 'f', joke: 'F' });
    expect(loadFavourites()).toEqual([]);
  });
});

// ===== saveFavourites =====

describe('saveFavourites', () => {
  it('persists favourites to localStorage', () => {
    const jokes = [{ id: 'f1', joke: 'Favourite 1' }];
    saveFavourites(jokes);
    expect(store['dad-jokes-favourites-v1']).toBe(JSON.stringify(jokes));
  });

  it('does not throw when localStorage throws (quota exceeded)', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveFavourites([{ id: 'f2', joke: 'F2' }])).not.toThrow();
  });

  it('history and favourites use separate storage keys', () => {
    const historyJokes = [{ id: 'h1', joke: 'History joke' }];
    const favJokes = [{ id: 'f1', joke: 'Fav joke' }];

    saveHistory(historyJokes);
    saveFavourites(favJokes);

    expect(loadHistory()).toEqual(historyJokes);
    expect(loadFavourites()).toEqual(favJokes);
  });
});

// ===== loadRatings =====

describe('loadRatings', () => {
  it('returns {} when key does not exist', () => {
    expect(loadRatings()).toEqual({});
  });

  it('returns parsed object when valid JSON is stored', () => {
    const ratings = { 'joke-1': 'up', 'joke-2': 'down' };
    store['dad-jokes-ratings-v1'] = JSON.stringify(ratings);
    expect(loadRatings()).toEqual(ratings);
  });

  it('returns {} when stored value is invalid JSON', () => {
    store['dad-jokes-ratings-v1'] = 'not-json{{{';
    expect(loadRatings()).toEqual({});
  });

  it('returns {} when stored value is an array (wrong shape)', () => {
    store['dad-jokes-ratings-v1'] = JSON.stringify(['up', 'down']);
    expect(loadRatings()).toEqual({});
  });

  it('returns {} when stored value is null JSON', () => {
    store['dad-jokes-ratings-v1'] = JSON.stringify(null);
    expect(loadRatings()).toEqual({});
  });
});

// ===== saveRatings =====

describe('saveRatings', () => {
  it('persists ratings to localStorage', () => {
    const ratings = { 'joke-1': 'up' as const };
    saveRatings(ratings);
    expect(store['dad-jokes-ratings-v1']).toBe(JSON.stringify(ratings));
  });

  it('does not throw when localStorage throws (quota exceeded)', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveRatings({ 'joke-1': 'down' })).not.toThrow();
  });

  it('ratings use a separate storage key from history and favourites', () => {
    const historyJokes = [{ id: 'h1', joke: 'History joke' }];
    const ratings = { 'joke-r': 'up' as const };

    saveHistory(historyJokes);
    saveRatings(ratings);

    expect(loadHistory()).toEqual(historyJokes);
    expect(loadRatings()).toEqual(ratings);
  });
});
