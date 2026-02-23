import type { Joke, RatingValue } from './types.ts';

/**
 * Update the dark mode toggle button to reflect the current theme.
 */
export function updateThemeToggle(theme: 'light' | 'dark'): void {
  const btn = document.getElementById('themeToggleBtn') as HTMLButtonElement | null;
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.setAttribute('aria-pressed', String(isDark));
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  btn.textContent = isDark ? '☀' : '☾';
}

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

const COPY_RESET_MS = 2000;
let copyResetTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Show copy feedback on the copy button.
 * Changes text/label for 2s then resets to original state.
 */
export function showCopyFeedback(success: boolean): void {
  const btn = document.getElementById('copyBtn') as HTMLButtonElement | null;
  if (!btn) return;

  if (copyResetTimer) clearTimeout(copyResetTimer);

  if (success) {
    btn.textContent = '✓';
    btn.setAttribute('aria-label', 'Copied!');
  } else {
    btn.textContent = '✗';
    btn.setAttribute('aria-label', 'Copy failed');
  }


  copyResetTimer = setTimeout(() => {
    btn.textContent = '📋';
    btn.setAttribute('aria-label', 'Copy joke to clipboard');
    copyResetTimer = null;
  }, COPY_RESET_MS);
}

/**
 * Enable or disable the copy button.
 */
export function setCopyButtonEnabled(enabled: boolean): void {
  const btn = document.getElementById('copyBtn') as HTMLButtonElement | null;
  if (btn) btn.disabled = !enabled;
}

export function setShareButtonEnabled(enabled: boolean): void {
  const btn = document.getElementById('shareBtn') as HTMLButtonElement | null;
  if (btn) btn.disabled = !enabled;
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
 * Update thumbs up/down rating buttons to reflect the current rating for a joke.
 * Sets aria-pressed and active CSS class on each button.
 */
export function updateRatingButtons(rating: RatingValue): void {
  const upBtn = document.getElementById('thumbsUpBtn') as HTMLButtonElement | null;
  const downBtn = document.getElementById('thumbsDownBtn') as HTMLButtonElement | null;

  if (upBtn) {
    const isUp = rating === 'up';
    upBtn.setAttribute('aria-pressed', String(isUp));
    upBtn.classList.toggle('rating-btn--up-active', isUp);
  }

  if (downBtn) {
    const isDown = rating === 'down';
    downBtn.setAttribute('aria-pressed', String(isDown));
    downBtn.classList.toggle('rating-btn--down-active', isDown);
  }
}

/**
 * Update the favourite (star) button aria state.
 */
export function updateFavouriteButton(favourited: boolean): void {
  const btn = document.getElementById('favouriteBtn') as HTMLButtonElement | null;
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(favourited));
  btn.setAttribute('aria-label', favourited ? 'Remove from favourites' : 'Add to favourites');
  btn.classList.toggle('favourite-btn--active', favourited);
}

/**
 * Update the count badge in the favourites toggle button.
 */
export function updateFavouritesCount(count: number): void {
  const el = document.getElementById('favCount');
  if (el) el.textContent = String(count);
}

/**
 * Show or hide the favourites panel and sync aria-expanded.
 */
export function toggleFavouritesPanel(open: boolean): void {
  const panel = document.getElementById('favPanel') as HTMLElement | null;
  const btn = document.getElementById('favListBtn') as HTMLButtonElement | null;
  if (panel) panel.hidden = !open;
  if (btn) btn.setAttribute('aria-expanded', String(open));
}

/**
 * Render the favourites list into the panel.
 * Each item has a delete button; onDelete is called with the joke id.
 * Uses DOM methods (not innerHTML) per XSS policy.
 */
export function renderFavouritesList(
  favourites: Joke[],
  onDelete: (id: string) => void,
): void {
  const panel = document.getElementById('favPanel');
  if (!panel) return;

  // Clear previous content
  panel.textContent = '';

  if (favourites.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'fav-empty';
    empty.textContent = 'No saved jokes yet. Star a joke to save it.';
    panel.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'fav-list';

  for (const joke of favourites) {
    const item = document.createElement('li');
    item.className = 'fav-item';

    const text = document.createElement('span');
    text.className = 'fav-item__text';
    text.textContent = joke.joke;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'fav-item__delete';
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', 'Remove from favourites');
    deleteBtn.textContent = '✕';
    deleteBtn.addEventListener('click', () => onDelete(joke.id));

    item.appendChild(text);
    item.appendChild(deleteBtn);
    list.appendChild(item);
  }

  panel.appendChild(list);
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
