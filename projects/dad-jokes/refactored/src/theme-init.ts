/**
 * Theme initialisation — runs synchronously in <head> before paint.
 * Prevents flash of wrong theme (FOUC) by applying saved or system preference
 * before the page renders.
 *
 * Loaded as a module script in <head> (compiled by Vite — no inline script needed,
 * avoids CSP conflict with script-src 'self').
 */

/**
 * Pure function — exported for unit testing only.
 * Determines the initial theme from saved preference and system preference.
 */
export function computeInitialTheme(saved: string | null, prefersDark: boolean): 'light' | 'dark' {
  if (saved === 'dark' || (!saved && prefersDark)) return 'dark';
  return 'light';
}

const saved = localStorage.getItem('dad-jokes-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (computeInitialTheme(saved, prefersDark) === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
}
