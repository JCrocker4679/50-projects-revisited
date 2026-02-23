/**
 * localStorage persistence module.
 */

import type { Joke, JokeRatings } from './types.ts';

/** Storage schema version for future migrations */
export const STORAGE_VERSION = 1;

const HISTORY_KEY = 'dad-jokes-history-v1';
const FAVOURITES_KEY = 'dad-jokes-favourites-v1';
const RATINGS_KEY = 'dad-jokes-ratings-v1';

export function loadHistory(): Joke[] {
  return loadJsonArray(HISTORY_KEY);
}

export function saveHistory(history: Joke[]): void {
  saveJson(HISTORY_KEY, history);
}

export function loadFavourites(): Joke[] {
  return loadJsonArray(FAVOURITES_KEY);
}

export function saveFavourites(favourites: Joke[]): void {
  saveJson(FAVOURITES_KEY, favourites);
}

export function loadRatings(): JokeRatings {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as JokeRatings;
  } catch {
    return {};
  }
}

export function saveRatings(ratings: JokeRatings): void {
  saveJson(RATINGS_KEY, ratings);
}

function loadJsonArray(key: string): Joke[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Joke[];
  } catch {
    return [];
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}
