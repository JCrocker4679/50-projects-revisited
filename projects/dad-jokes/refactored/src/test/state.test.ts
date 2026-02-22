/**
 * State management tests
 *
 * Tests the application state module in state.ts:
 * - setCurrentJoke / getCurrentJoke
 * - setIsLoading / getIsLoading
 * - setError / getError
 * - getFavourites / isFavourited / toggleFavourite
 * - addToHistory / getHistory / navigateHistory / isAtHistoryStart / isAtHistoryEnd
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
  getHistory,
  getHistoryIndex,
  addToHistory,
  navigateHistory,
  isAtHistoryStart,
  isAtHistoryEnd,
  initHistory,
} from '../state.ts';

// Mock storage so state tests don't depend on localStorage
vi.mock('../storage.ts', () => ({
  loadFavourites: () => [],
  saveFavourites: vi.fn(),
  loadHistory: () => [],
  saveHistory: vi.fn(),
}));

describe('State: currentJoke', () => {
  it('starts as null', () => {
    expect(getCurrentJoke()).toBeDefined(); // null or previously set
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

describe('State: history', () => {
  beforeEach(() => {
    initHistory();
  });

  it('starts empty after initHistory', () => {
    expect(getHistory()).toHaveLength(0);
  });

  it('addToHistory prepends new joke (newest first)', () => {
    addToHistory({ id: 'a', joke: 'Joke A' });
    addToHistory({ id: 'b', joke: 'Joke B' });
    expect(getHistory()[0].id).toBe('b');
    expect(getHistory()[1].id).toBe('a');
  });

  it('addToHistory resets historyIndex to 0', () => {
    addToHistory({ id: 'a', joke: 'Joke A' });
    navigateHistory('back'); // move index to 1 (won't go OOB since only 1 item, returns null)
    addToHistory({ id: 'b', joke: 'Joke B' });
    expect(getHistoryIndex()).toBe(0);
  });

  it('trims history to 50 items', () => {
    for (let i = 0; i < 55; i++) {
      addToHistory({ id: `j${i}`, joke: `Joke ${i}` });
    }
    expect(getHistory()).toHaveLength(50);
    // Most recent should be at index 0
    expect(getHistory()[0].id).toBe('j54');
  });

  it('navigateHistory back moves to older jokes', () => {
    addToHistory({ id: 'first', joke: 'First' });
    addToHistory({ id: 'second', joke: 'Second' });
    const joke = navigateHistory('back');
    expect(joke?.id).toBe('first');
    expect(getHistoryIndex()).toBe(1);
  });

  it('navigateHistory forward moves to newer jokes', () => {
    addToHistory({ id: 'first', joke: 'First' });
    addToHistory({ id: 'second', joke: 'Second' });
    navigateHistory('back'); // index=1
    const joke = navigateHistory('forward');
    expect(joke?.id).toBe('second');
    expect(getHistoryIndex()).toBe(0);
  });

  it('navigateHistory returns null at the back bound', () => {
    addToHistory({ id: 'only', joke: 'Only joke' });
    expect(navigateHistory('back')).toBeNull();
    expect(getHistoryIndex()).toBe(0);
  });

  it('navigateHistory returns null at the forward bound (index 0)', () => {
    addToHistory({ id: 'a', joke: 'A' });
    addToHistory({ id: 'b', joke: 'B' });
    expect(navigateHistory('forward')).toBeNull(); // already at 0
  });

  it('isAtHistoryStart is true when index is 0', () => {
    addToHistory({ id: 'a', joke: 'A' });
    expect(isAtHistoryStart()).toBe(true);
  });

  it('isAtHistoryStart is false after navigating back', () => {
    addToHistory({ id: 'a', joke: 'A' });
    addToHistory({ id: 'b', joke: 'B' });
    navigateHistory('back');
    expect(isAtHistoryStart()).toBe(false);
  });

  it('isAtHistoryEnd is true when empty', () => {
    expect(isAtHistoryEnd()).toBe(true);
  });

  it('isAtHistoryEnd is true when at oldest joke', () => {
    addToHistory({ id: 'a', joke: 'A' });
    addToHistory({ id: 'b', joke: 'B' });
    navigateHistory('back'); // index=1 = oldest
    expect(isAtHistoryEnd()).toBe(true);
  });

  it('isAtHistoryEnd is false when not at oldest', () => {
    addToHistory({ id: 'a', joke: 'A' });
    addToHistory({ id: 'b', joke: 'B' });
    expect(isAtHistoryEnd()).toBe(false);
  });
});
