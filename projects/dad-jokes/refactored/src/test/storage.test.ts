/**
 * Storage tests — Ticket #32
 *
 * Tests localStorage persistence for joke history.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadHistory, saveHistory } from '../storage.ts';

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

describe('saveHistory', () => {
  it('persists jokes to localStorage', () => {
    const jokes = [{ id: 'x', joke: 'Joke X' }];
    saveHistory(jokes);
    expect(store['dad-jokes-history-v1']).toBe(JSON.stringify(jokes));
  });

  it('does not throw when localStorage is unavailable', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    expect(() => saveHistory([{ id: 'y', joke: 'Y' }])).not.toThrow();
  });
});
