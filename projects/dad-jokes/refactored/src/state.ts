import type { AppState, Joke } from './types.ts';
import { loadFavourites, saveFavourites } from './storage.ts';

const MAX_FAVOURITES = 100;

const state: AppState = {
  currentJoke: null,
  isLoading: false,
  error: null,
  favourites: [],
};

// --- Current joke ---

export function getCurrentJoke(): Joke | null {
  return state.currentJoke;
}

export function setCurrentJoke(joke: Joke): void {
  state.currentJoke = joke;
}

// --- Loading ---

export function getIsLoading(): boolean {
  return state.isLoading;
}

export function setIsLoading(loading: boolean): void {
  state.isLoading = loading;
}

// --- Error ---

export function getError(): string | null {
  return state.error;
}

export function setError(error: string | null): void {
  state.error = error;
}

// --- Favourites ---

export function initFavourites(): void {
  state.favourites = loadFavourites();
}

export function getFavourites(): Joke[] {
  return state.favourites;
}

export function isFavourited(jokeId: string): boolean {
  return state.favourites.some((j) => j.id === jokeId);
}

export function toggleFavourite(joke: Joke): void {
  if (isFavourited(joke.id)) {
    state.favourites = state.favourites.filter((j) => j.id !== joke.id);
  } else {
    state.favourites = [joke, ...state.favourites].slice(0, MAX_FAVOURITES);
  }
  saveFavourites(state.favourites);
}
