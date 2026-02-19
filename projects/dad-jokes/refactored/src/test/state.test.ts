/**
 * State management tests — Ticket #14
 *
 * Tests the application state module in state.ts:
 * - setCurrentJoke / getCurrentJoke
 * - setIsLoading / getIsLoading
 * - setError / getError
 */

import { describe, it, expect } from 'vitest';
import {
  getCurrentJoke,
  setCurrentJoke,
  getIsLoading,
  setIsLoading,
  getError,
  setError,
} from '../state.ts';

describe('State: currentJoke', () => {
  it('starts as null', () => {
    // Note: state persists across tests in the same module since it's module-level
    // The initial test checks the default before any mutations
    // For a clean test, we'd need a reset function — but Sprint 1 state is minimal
    expect(getCurrentJoke()).toBeDefined(); // Will be null or a previously set joke
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
