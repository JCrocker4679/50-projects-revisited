/**
 * UI rendering functions.
 *
 * All DOM updates go through this module.
 * Uses textContent (not innerHTML) to prevent XSS.
 */

/** Error message copy per DECISIONS.md D14 */
const ERROR_MESSAGES: Record<string, string> = {
  network: "Can't reach the joke factory. Check your connection and try again.",
  http: 'The joke servers are having a bad day. Give it a sec.',
  timeout: 'Request timed out — the joke servers might be slow.',
  validation: 'Something went sideways. Try again?',
};

/**
 * Display a joke in the joke element.
 * Clears any error state.
 */
export function renderJoke(jokeText: string): void {
  const jokeEl = document.getElementById('joke');
  if (jokeEl) {
    jokeEl.textContent = jokeText;
    jokeEl.classList.remove('joke--error');
  }
}

/**
 * Display an error message in the joke element.
 * Uses the copy from DECISIONS.md D14 based on error type.
 */
export function renderError(
  message: string,
  type: 'network' | 'http' | 'timeout' | 'validation',
): void {
  const jokeEl = document.getElementById('joke');
  if (jokeEl) {
    jokeEl.textContent = ERROR_MESSAGES[type] ?? message;
    jokeEl.classList.add('joke--error');
  }
}
