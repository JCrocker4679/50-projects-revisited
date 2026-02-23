/**
 * Theme initialisation — runs synchronously in <head> before paint.
 * Prevents flash of wrong theme (FOUC) by applying saved or system preference
 * before the page renders.
 *
 * Loaded as a module script in <head> (compiled by Vite — no inline script needed,
 * avoids CSP conflict with script-src 'self').
 */
const saved = localStorage.getItem('dad-jokes-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (saved === 'dark' || (!saved && prefersDark)) {
  document.documentElement.setAttribute('data-theme', 'dark');
}
