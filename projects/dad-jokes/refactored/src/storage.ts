/**
 * localStorage persistence module.
 */

import type { Joke } from './types.ts';

/** Storage schema version for future migrations */
export const STORAGE_VERSION = 1;

const HISTORY_KEY = 'dad-jokes-history-v1';

export function loadHistory(): Joke[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Joke[];
  } catch {
    return [];
  }
}

export function saveHistory(history: Joke[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}
