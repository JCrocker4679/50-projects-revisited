import type { AppState, Joke } from './types.ts';
import { loadHistory, saveHistory } from './storage.ts';

const MAX_HISTORY = 50;

const state: AppState = {
  currentJoke: null,
  isLoading: false,
  error: null,
  history: [],
  historyIndex: 0,
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
