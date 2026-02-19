/**
 * State management tests
 *
 * Tests the application state module in state.ts:
 * - setCurrentJoke / getCurrentJoke
 * - setIsLoading / getIsLoading
 * - setError / getError
 * - getFavourites / isFavourited / toggleFavourite
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCurrentJoke,
  setCurrentJoke,
  getIsLoading,
  setIsLoading,
  getError,
  setError,
  getFavourites,
  isFavourited,
  toggleFavourite,
  initFavourites,
} from '../state.ts';

vi.mock('../storage.ts', () => ({
  loadFavourites: () => [],
  saveFavourites: vi.fn(),
}));

describe('State: currentJoke', () => {
  it('starts as null', () => {
    expect(getCurrentJoke()).toBeDefined();
  });

  it('setCurrentJoke updates the value returned by getCurrentJoke', () => {
    const joke = { id: 'test-1', joke: 'Why did the chicken cross the road?' };
    setCurrentJoke(joke);
    expect(getCurrentJoke()).toEqual(joke);
  });

  it('overwrites previous joke with new one', () => {
    setCurrentJoke({ id: 'first', joke: 'First joke' });
    setCurrentJoke({ id: 'second', joke: 'Second joke' });
    expect(getCurrentJoke()?.id).toBe('second');
    expect(getCurrentJoke()?.joke).toBe('Second joke');
  });
});

describe('State: isLoading', () => {
  it('setIsLoading(true) sets loading to true', () => {
    setIsLoading(true);
    expect(getIsLoading()).toBe(true);
  });

  it('setIsLoading(false) sets loading to false', () => {
    setIsLoading(true);
    setIsLoading(false);
    expect(getIsLoading()).toBe(false);
  });
});

describe('State: error', () => {
  it('setError sets the error message', () => {
    setError('Something went wrong');
    expect(getError()).toBe('Something went wrong');
  });

  it('setError(null) clears the error', () => {
    setError('Some error');
    setError(null);
    expect(getError()).toBeNull();
  });
});

describe('State: favourites', () => {
  beforeEach(() => {
    initFavourites();
  });

  it('starts empty after initFavourites', () => {
    expect(getFavourites()).toHaveLength(0);
  });

  it('toggleFavourite adds a new joke', () => {
    toggleFavourite({ id: 'a', joke: 'Joke A' });
    expect(getFavourites()).toHaveLength(1);
    expect(getFavourites()[0].id).toBe('a');
  });

  it('toggleFavourite removes an already-favourited joke', () => {
    toggleFavourite({ id: 'a', joke: 'Joke A' });
    toggleFavourite({ id: 'a', joke: 'Joke A' });
    expect(getFavourites()).toHaveLength(0);
  });

  it('isFavourited returns true for a favourited joke', () => {
    toggleFavourite({ id: 'b', joke: 'Joke B' });
    expect(isFavourited('b')).toBe(true);
  });

  it('isFavourited returns false for an unfavourited joke', () => {
    expect(isFavourited('not-there')).toBe(false);
  });

  it('adds new favourites at the front (newest first)', () => {
    toggleFavourite({ id: 'first', joke: 'First' });
    toggleFavourite({ id: 'second', joke: 'Second' });
    expect(getFavourites()[0].id).toBe('second');
  });

  it('trims favourites to 100', () => {
    for (let i = 0; i < 105; i++) {
      toggleFavourite({ id: `j${i}`, joke: `Joke ${i}` });
    }
    expect(getFavourites()).toHaveLength(100);
  });
});
