/**
 * UI rendering functions.
 *
 * All DOM updates go through this module.
 * DOM elements are created programmatically (not innerHTML) to prevent XSS.
 */

/** Error message copy per DECISIONS.md D14 */
const ERROR_MESSAGES: Record<string, string> = {
  network: "Can't reach the joke factory. Check your connection and try again.",
  http: 'The joke servers are having a bad day. Give it a sec.',
  timeout: 'Request timed out — the joke servers might be slow.',
  validation: 'Something went sideways. Try again?',
};

/** Callback for retry button clicks, set via setRetryHandler */
let retryHandler: (() => void) | null = null;

/**
 * Register the retry callback.
 * Called once from main.ts at init time.
 */
export function setRetryHandler(handler: () => void): void {
  retryHandler = handler;
}

/**
 * Update history navigation buttons and counter.
 * Disables prevBtn at oldest joke, nextBtn at newest.
 * Counter hidden when history is empty.
 */
export function renderHistoryNav(index: number, total: number): void {
  const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
  const counter = document.querySelector('.history-counter') as HTMLElement | null;

  const atNewest = index === 0;
  const atOldest = total === 0 || index === total - 1;

  if (prevBtn) {
    prevBtn.disabled = atOldest;
    prevBtn.setAttribute('aria-disabled', String(atOldest));
  }

  if (nextBtn) {
    nextBtn.disabled = atNewest;
    nextBtn.setAttribute('aria-disabled', String(atNewest));
  }

  if (counter) {
    if (total === 0) {
      counter.textContent = '';
      counter.hidden = true;
    } else {
      counter.textContent = `${index + 1} / ${total}`;
      counter.hidden = false;
    }
  }
}

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
 * Display an error message with a retry button.
 * Uses copy from DECISIONS.md D14 based on error type.
 * If a cached joke is provided, shows it as a fallback below the error.
 *
 * Built with DOM methods (not innerHTML) per D6 XSS decision.
 */
export function renderError(
  message: string,
  type: 'network' | 'http' | 'timeout' | 'validation',
  cachedJoke?: string,
): void {
  const jokeEl = document.getElementById('joke');
  if (!jokeEl) return;

  // Clear previous content
  jokeEl.textContent = '';
  jokeEl.classList.add('joke--error');
  jokeEl.classList.remove('joke--loading');

  // Error message text
  const errorText = document.createElement('span');
  errorText.className = 'error-message';
  errorText.textContent = ERROR_MESSAGES[type] ?? message;
  jokeEl.appendChild(errorText);

  // Retry button
  const retryBtn = document.createElement('button');
  retryBtn.className = 'retry-btn';
  retryBtn.textContent = 'Try again';
  retryBtn.type = 'button';
  retryBtn.addEventListener('click', () => {
    if (retryHandler) retryHandler();
  });
  jokeEl.appendChild(retryBtn);

  // Cached joke fallback
  if (cachedJoke) {
    const fallbackLabel = document.createElement('span');
    fallbackLabel.className = 'fallback-label';
    fallbackLabel.textContent = "In the meantime, here's your last joke:";
    jokeEl.appendChild(fallbackLabel);

    const fallbackJoke = document.createElement('span');
    fallbackJoke.className = 'fallback-joke';
    fallbackJoke.textContent = cachedJoke;
    jokeEl.appendChild(fallbackJoke);
  }
}
