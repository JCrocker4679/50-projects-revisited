import type { AppState, Joke, RatingValue } from './types.ts';
import { loadHistory, saveHistory, loadFavourites, saveFavourites, loadRatings, saveRatings } from './storage.ts';

const MAX_HISTORY = 50;
const MAX_FAVOURITES = 100;

const state: AppState = {
  currentJoke: null,
  isLoading: false,
  error: null,
  history: [],
  historyIndex: 0,
  favourites: [],
  ratings: {},
  isSearchActive: false,
  searchTerm: '',
  searchResults: [],
  selectedSearchIndex: null,
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

// --- History ---

export function initHistory(): void {
  state.history = loadHistory();
  state.historyIndex = 0;
}

export function getHistory(): Joke[] {
  return state.history;
}

export function getHistoryIndex(): number {
  return state.historyIndex;
}

export function addToHistory(joke: Joke): void {
  state.history = [joke, ...state.history].slice(0, MAX_HISTORY);
  state.historyIndex = 0;
  saveHistory(state.history);
}

export function navigateHistory(direction: 'back' | 'forward'): Joke | null {
  if (state.isSearchActive) return null;

  const newIndex =
    direction === 'back' ? state.historyIndex + 1 : state.historyIndex - 1;

  if (newIndex < 0 || newIndex >= state.history.length) return null;

  state.historyIndex = newIndex;
  return state.history[newIndex];
}

export function isAtHistoryStart(): boolean {
  return state.historyIndex === 0;
}

export function isAtHistoryEnd(): boolean {
  return state.history.length === 0 || state.historyIndex === state.history.length - 1;
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

// --- Ratings ---

export function initRatings(): void {
  state.ratings = loadRatings();
}

export function getRating(jokeId: string): RatingValue {
  return state.ratings[jokeId] ?? null;
}

/**
 * Set a rating for a joke. Calling with the same value as the current rating
 * acts as a toggle — it clears the rating back to null.
 */
export function setRating(jokeId: string, rating: RatingValue): void {
  const current = getRating(jokeId);
  const next: RatingValue = current === rating ? null : rating;
  if (next === null) {
    delete state.ratings[jokeId];
  } else {
    state.ratings[jokeId] = next;
  }
  saveRatings(state.ratings);
}

// --- Search ---

export function isSearchActive(): boolean {
  return state.isSearchActive;
}

export function getSearchState(): { isSearchActive: boolean; searchTerm: string; searchResults: Joke[]; selectedSearchIndex: number | null } {
  return {
    isSearchActive: state.isSearchActive,
    searchTerm: state.searchTerm,
    searchResults: state.searchResults,
    selectedSearchIndex: state.selectedSearchIndex,
  };
}

export function setSearchResults(results: Joke[], term: string): void {
  state.isSearchActive = true;
  state.searchTerm = term;
  state.searchResults = results;
  state.selectedSearchIndex = results.length > 0 ? 0 : null;
  if (results.length > 0) {
    state.currentJoke = results[0];
  }
}

export function selectSearchResult(index: number): void {
  if (index < 0 || index >= state.searchResults.length) return;
  state.selectedSearchIndex = index;
  state.currentJoke = state.searchResults[index];
}

export function clearSearch(): void {
  state.isSearchActive = false;
  state.searchTerm = '';
  state.searchResults = [];
  state.selectedSearchIndex = null;
}
