/**
 * Theme management — toggle dark/light mode and persist preference.
 *
 * Preference stored in localStorage under 'dad-jokes-theme' ('light' | 'dark').
 * The data-theme attribute on <html> drives all CSS theming.
 */

const STORAGE_KEY = 'dad-jokes-theme';

/**
 * Returns the current theme by reading the data-theme attribute.
 * Falls back to 'light' if unset.
 */
export function getTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Apply a theme by setting data-theme on <html> and saving to localStorage.
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem(STORAGE_KEY, theme);
}

/**
 * Toggle between light and dark, persist and return the new theme.
 */
export function toggleTheme(): 'light' | 'dark' {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
