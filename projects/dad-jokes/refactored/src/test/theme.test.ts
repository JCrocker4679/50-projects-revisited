/**
 * Theme tests — Ticket #69
 *
 * Tests:
 * - theme.ts: getTheme, applyTheme, toggleTheme
 * - theme-init.ts: computeInitialTheme (pure helper, safe to import directly)
 *
 * NOTE: theme-init.ts is NOT imported directly — it runs localStorage/matchMedia
 * as a side-effect on module load. computeInitialTheme is exported separately
 * so it can be tested without triggering side effects.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTheme, applyTheme, toggleTheme } from '../theme.ts';
import { computeInitialTheme } from '../theme-init.ts';

// Minimal localStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};
vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  // Reset html data-theme to a clean state
  document.documentElement.removeAttribute('data-theme');
});

// ===== getTheme =====

describe('getTheme()', () => {
  it('returns "light" when no data-theme attribute is set', () => {
    expect(getTheme()).toBe('light');
  });

  it('returns "dark" when data-theme="dark" is set on <html>', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    expect(getTheme()).toBe('dark');
  });
});

// ===== applyTheme =====

describe('applyTheme()', () => {
  it('sets data-theme="dark" on <html> and saves to localStorage', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dad-jokes-theme', 'dark');
  });

  it('removes data-theme from <html> and saves "light" to localStorage', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dad-jokes-theme', 'light');
  });
});

// ===== toggleTheme =====

describe('toggleTheme()', () => {
  it('switches from light to dark', () => {
    // starts with no data-theme = light
    const next = toggleTheme();
    expect(next).toBe('dark');
    expect(getTheme()).toBe('dark');
  });

  it('switches from dark to light', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const next = toggleTheme();
    expect(next).toBe('light');
    expect(getTheme()).toBe('light');
  });

  it('persists new preference to localStorage', () => {
    toggleTheme(); // light → dark
    expect(localStorageMock.setItem).toHaveBeenCalledWith('dad-jokes-theme', 'dark');
  });
});

// ===== computeInitialTheme (from theme-init.ts) =====

describe('computeInitialTheme()', () => {
  it('returns "dark" when saved preference is "dark"', () => {
    expect(computeInitialTheme('dark', false)).toBe('dark');
  });

  it('returns "light" when saved preference is "light" (overrides system)', () => {
    expect(computeInitialTheme('light', true)).toBe('light');
  });

  it('returns "dark" when no saved preference but system prefers dark', () => {
    expect(computeInitialTheme(null, true)).toBe('dark');
  });

  it('returns "light" when no saved preference and system prefers light', () => {
    expect(computeInitialTheme(null, false)).toBe('light');
  });
});

// ===== theme-init.ts side-effect (module load applies dark theme) =====

describe('theme-init.ts side-effect', () => {
  it('sets data-theme="dark" on <html> when saved preference is dark', async () => {
    store['dad-jokes-theme'] = 'dark';
    document.documentElement.removeAttribute('data-theme');
    vi.resetModules();
    await import('../theme-init.ts');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    vi.resetModules(); // restore clean module cache
  });
});
