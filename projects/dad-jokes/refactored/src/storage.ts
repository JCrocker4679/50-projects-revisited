/**
 * localStorage persistence module.
 */

import type { Joke } from './types.ts';

export const STORAGE_VERSION = 1;

const FAVOURITES_KEY = 'dad-jokes-favourites-v1';

export function loadFavourites(): Joke[] {
  return loadJsonArray(FAVOURITES_KEY);
}

export function saveFavourites(favourites: Joke[]): void {
  saveJson(FAVOURITES_KEY, favourites);
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
    // Storage quota exceeded — fail silently
  }
}
