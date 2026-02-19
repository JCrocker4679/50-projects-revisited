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
 * Show loading state.
 * Disables button and adds aria-busy for screen readers.
 */
export function showLoading(isFirstLoad: boolean): void {
  const jokeEl = document.getElementById('joke');
  const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;

  if (jokeEl) {
    jokeEl.setAttribute('aria-busy', 'true');
    jokeEl.classList.add('joke--loading');
    jokeEl.classList.remove('joke--error');
    if (isFirstLoad) {
      jokeEl.textContent = 'Warming up...';
    }
    // On subsequent loads, keep showing the previous joke (shimmer overlay)
  }

  if (jokeBtn) {
    jokeBtn.disabled = true;
  }
}

/**
 * Hide loading state.
 * Re-enables button and removes aria-busy.
 */
export function hideLoading(): void {
  const jokeEl = document.getElementById('joke');
  const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;

  if (jokeEl) {
    jokeEl.setAttribute('aria-busy', 'false');
    jokeEl.classList.remove('joke--loading');
  }

  if (jokeBtn) {
    jokeBtn.disabled = false;
  }
}

/**
 * Display a joke in the joke element.
 * Clears any error/loading state.
 */
export function renderJoke(jokeText: string): void {
  const jokeEl = document.getElementById('joke');
  if (jokeEl) {
    jokeEl.textContent = jokeText;
    jokeEl.classList.remove('joke--error');
    jokeEl.classList.remove('joke--loading');
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
    jokeEl.classList.remove('joke--loading');
  }
}
