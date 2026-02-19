import type { AppState, Joke } from './types.ts';

/**
 * Application state module.
 *
 * For Sprint 1, state is minimal — just tracks the current joke.
 * History, favourites, and localStorage persistence come in Sprint 2.
 */

const state: AppState = {
  currentJoke: null,
  isLoading: false,
  error: null,
};

export function getCurrentJoke(): Joke | null {
  return state.currentJoke;
}

export function setCurrentJoke(joke: Joke): void {
  state.currentJoke = joke;
}

export function getIsLoading(): boolean {
  return state.isLoading;
}

export function setIsLoading(loading: boolean): void {
  state.isLoading = loading;
}

export function getError(): string | null {
  return state.error;
}

export function setError(error: string | null): void {
  state.error = error;
}
