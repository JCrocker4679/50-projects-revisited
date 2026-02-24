/**
 * UI rendering tests — Ticket #14
 *
 * Tests the UI module in ui.ts:
 * - renderJoke() sets textContent (XSS safe)
 * - renderError() shows error message, retry button, cached joke fallback
 * - showLoading() / hideLoading() toggle aria-busy and button state
 * - setRetryHandler() wires the retry callback
 * - renderHistoryNav() — history nav button states and counter
 * - showCopyFeedback() / setCopyButtonEnabled() / setShareButtonEnabled() — action buttons
 * - updateFavouriteButton() — favourite button state
 * - updateFavouritesCount() / toggleFavouritesPanel() / renderFavouritesList() — favourites panel
 * - updateThemeToggle() — dark mode toggle button state (#69)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  renderJoke,
  renderError,
  showLoading,
  hideLoading,
  setRetryHandler,
  renderHistoryNav,
  showCopyFeedback,
  setCopyButtonEnabled,
  setShareButtonEnabled,
  updateFavouriteButton,
  updateFavouritesCount,
  toggleFavouritesPanel,
  renderFavouritesList,
  updateRatingButtons,
  updateThemeToggle,
} from '../ui.ts';

/** Standard DOM fixture for all UI tests */
function setupDOM(): void {
  document.body.innerHTML = `
    <div class="container">
      <h3>Don't Laugh Challenge</h3>
      <div class="joke" id="joke">// Joke goes here</div>
      <div class="action-row">
        <button id="jokeBtn" class="btn">Get Another Joke</button>
        <button id="copyBtn" class="btn btn--icon" aria-label="Copy joke to clipboard" disabled>📋</button>
        <button id="shareBtn" class="btn btn--icon" aria-label="Share joke" disabled>↗</button>
        <button id="favouriteBtn" class="btn btn--icon" aria-pressed="false" aria-label="Add to favourites">★</button>
      </div>
      <nav class="history-nav" aria-label="Joke history navigation">
        <div class="history-nav__left">
          <button id="prevBtn" class="btn btn--nav" disabled aria-disabled="true" aria-label="Previous joke">← Prev</button>
          <span class="history-counter" aria-live="polite" hidden></span>
          <button id="nextBtn" class="btn btn--nav" disabled aria-disabled="true" aria-label="Next joke">Next →</button>
        </div>
        <div class="history-nav__rating">
          <button id="thumbsDownBtn" class="btn btn--icon" aria-label="Rate joke down" aria-pressed="false">👎</button>
          <button id="thumbsUpBtn" class="btn btn--icon" aria-label="Rate joke up" aria-pressed="false">👍</button>
        </div>
      </nav>
      <div class="fav-toggle-row">
        <button id="favListBtn" class="btn btn--ghost" aria-expanded="false" aria-controls="favPanel">
          My Favourites (<span id="favCount">0</span>)
        </button>
      </div>
      <section id="favPanel" class="fav-panel" hidden aria-label="Saved favourites"></section>
    </div>
  `;
}

describe('UI: renderJoke()', () => {
  beforeEach(setupDOM);

  it('does not throw when joke element is missing', () => {
    document.getElementById('joke')?.remove();
    expect(() => renderJoke('test')).not.toThrow();
  });

  it('sets joke text via textContent', () => {
    renderJoke('Why did the bike fall over? It was two-tired.');
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe(
      'Why did the bike fall over? It was two-tired.',
    );
  });

  it('uses textContent, not innerHTML (XSS prevention)', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    renderJoke(malicious);
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe(malicious);
    expect(jokeEl?.querySelector('img')).toBeNull();
  });

  it('removes joke--error class when rendering a joke', () => {
    const jokeEl = document.getElementById('joke');
    jokeEl?.classList.add('joke--error');
    renderJoke('Clean joke');
    expect(jokeEl?.classList.contains('joke--error')).toBe(false);
  });

  it('removes joke--loading class when rendering a joke', () => {
    const jokeEl = document.getElementById('joke');
    jokeEl?.classList.add('joke--loading');
    renderJoke('Fresh joke');
    expect(jokeEl?.classList.contains('joke--loading')).toBe(false);
  });
});

describe('UI: renderError()', () => {
  beforeEach(setupDOM);

  it('shows network error message per D14 copy', () => {
    renderError('fallback', 'network');
    const jokeEl = document.getElementById('joke');
    const errorMsg = jokeEl?.querySelector('.error-message');
    expect(errorMsg?.textContent).toBe(
      "Can't reach the joke factory. Check your connection and try again.",
    );
  });

  it('shows HTTP error message per D14 copy', () => {
    renderError('fallback', 'http');
    const errorMsg = document
      .getElementById('joke')
      ?.querySelector('.error-message');
    expect(errorMsg?.textContent).toBe(
      'The joke servers are having a bad day. Give it a sec.',
    );
  });

  it('shows timeout error message per D14 copy', () => {
    renderError('fallback', 'timeout');
    const errorMsg = document
      .getElementById('joke')
      ?.querySelector('.error-message');
    expect(errorMsg?.textContent).toBe(
      'Request timed out — the joke servers might be slow.',
    );
  });

  it('shows validation error message per D14 copy', () => {
    renderError('fallback', 'validation');
    const errorMsg = document
      .getElementById('joke')
      ?.querySelector('.error-message');
    expect(errorMsg?.textContent).toBe('Something went sideways. Try again?');
  });

  it('includes a "Try again" button', () => {
    renderError('error', 'network');
    const retryBtn = document.getElementById('joke')?.querySelector('.retry-btn');
    expect(retryBtn).not.toBeNull();
    expect(retryBtn?.textContent).toBe('Try again');
    expect((retryBtn as HTMLButtonElement)?.type).toBe('button');
  });

  it('retry button calls the registered handler', () => {
    const handler = vi.fn();
    setRetryHandler(handler);

    renderError('error', 'network');
    const retryBtn = document
      .getElementById('joke')
      ?.querySelector('.retry-btn') as HTMLButtonElement;
    retryBtn.click();

    expect(handler).toHaveBeenCalledOnce();
  });

  it('retry button click does not throw when no handler is registered', () => {
    // Clear any previously registered handler
    setRetryHandler(() => {});
    setRetryHandler(null as unknown as () => void);

    renderError('error', 'network');
    const retryBtn = document
      .getElementById('joke')
      ?.querySelector('.retry-btn') as HTMLButtonElement;
    expect(() => retryBtn.click()).not.toThrow();
  });

  it('adds joke--error class', () => {
    renderError('error', 'network');
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.classList.contains('joke--error')).toBe(true);
  });

  it('removes joke--loading class', () => {
    const jokeEl = document.getElementById('joke');
    jokeEl?.classList.add('joke--loading');
    renderError('error', 'http');
    expect(jokeEl?.classList.contains('joke--loading')).toBe(false);
  });

  it('shows cached joke fallback when provided', () => {
    renderError('error', 'network', 'Previous joke text');
    const jokeEl = document.getElementById('joke');

    const fallbackLabel = jokeEl?.querySelector('.fallback-label');
    expect(fallbackLabel?.textContent).toBe(
      "In the meantime, here's your last joke:",
    );

    const fallbackJoke = jokeEl?.querySelector('.fallback-joke');
    expect(fallbackJoke?.textContent).toBe('Previous joke text');
  });

  it('does not show cached joke fallback when not provided', () => {
    renderError('error', 'network');
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.querySelector('.fallback-label')).toBeNull();
    expect(jokeEl?.querySelector('.fallback-joke')).toBeNull();
  });

  it('clears previous content before rendering error', () => {
    renderJoke('Old joke');
    renderError('error', 'network');
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.querySelector('.error-message')?.textContent).toContain(
      'joke factory',
    );
  });

  it('does not throw when joke element is missing', () => {
    document.getElementById('joke')?.remove();
    expect(() => renderError('error', 'network')).not.toThrow();
  });
});

describe('UI: showLoading()', () => {
  beforeEach(setupDOM);

  it('does not throw when joke element is missing', () => {
    document.getElementById('joke')?.remove();
    expect(() => showLoading(false)).not.toThrow();
  });

  it('does not throw when jokeBtn element is missing', () => {
    document.getElementById('jokeBtn')?.remove();
    expect(() => showLoading(false)).not.toThrow();
  });

  it('sets aria-busy to "true" on joke element', () => {
    showLoading(false);
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('adds joke--loading class', () => {
    showLoading(false);
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.classList.contains('joke--loading')).toBe(true);
  });

  it('removes joke--error class', () => {
    const jokeEl = document.getElementById('joke');
    jokeEl?.classList.add('joke--error');
    showLoading(false);
    expect(jokeEl?.classList.contains('joke--error')).toBe(false);
  });

  it('disables the joke button', () => {
    showLoading(false);
    const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement;
    expect(jokeBtn.disabled).toBe(true);
  });

  it('shows "Warming up..." on first load', () => {
    showLoading(true);
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe('Warming up...');
  });

  it('keeps previous content on subsequent loads', () => {
    renderJoke('Previous joke');
    showLoading(false);
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe('Previous joke');
  });
});

describe('UI: hideLoading()', () => {
  beforeEach(setupDOM);

  it('does not throw when joke element is missing', () => {
    document.getElementById('joke')?.remove();
    expect(() => hideLoading()).not.toThrow();
  });

  it('does not throw when jokeBtn element is missing', () => {
    document.getElementById('jokeBtn')?.remove();
    expect(() => hideLoading()).not.toThrow();
  });

  it('sets aria-busy to "false"', () => {
    showLoading(false);
    hideLoading();
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.getAttribute('aria-busy')).toBe('false');
  });

  it('removes joke--loading class', () => {
    showLoading(false);
    hideLoading();
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.classList.contains('joke--loading')).toBe(false);
  });

  it('re-enables the joke button', () => {
    showLoading(false);
    hideLoading();
    const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement;
    expect(jokeBtn.disabled).toBe(false);
  });
});

describe('UI: renderHistoryNav()', () => {
  beforeEach(setupDOM);

  it('does not throw when nav elements are missing', () => {
    document.getElementById('prevBtn')?.remove();
    document.getElementById('nextBtn')?.remove();
    document.querySelector('.history-counter')?.remove();
    expect(() => renderHistoryNav(0, 5)).not.toThrow();
  });

  it('disables prevBtn when at oldest joke (index === total - 1)', () => {
    renderHistoryNav(4, 5);
    const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    expect(prevBtn.getAttribute('aria-disabled')).toBe('true');
  });

  it('enables prevBtn when not at oldest', () => {
    renderHistoryNav(0, 5);
    const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(false);
  });

  it('disables nextBtn when at newest (index === 0)', () => {
    renderHistoryNav(0, 5);
    const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
    expect(nextBtn.getAttribute('aria-disabled')).toBe('true');
  });

  it('enables nextBtn when not at newest', () => {
    renderHistoryNav(2, 5);
    const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
  });

  it('shows correct counter text', () => {
    renderHistoryNav(2, 10);
    const counter = document.querySelector('.history-counter');
    expect(counter?.textContent).toBe('3 / 10');
  });

  it('hides counter when history is empty (total === 0)', () => {
    renderHistoryNav(0, 0);
    const counter = document.querySelector('.history-counter') as HTMLElement;
    expect(counter.hidden).toBe(true);
    expect(counter.textContent).toBe('');
  });

  it('shows counter when history has items', () => {
    renderHistoryNav(0, 3);
    const counter = document.querySelector('.history-counter') as HTMLElement;
    expect(counter.hidden).toBe(false);
  });
});

describe('UI: showCopyFeedback()', () => {
  beforeEach(() => {
    setupDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows success: changes button text and aria-label', () => {
    showCopyFeedback(true);
    const btn = document.getElementById('copyBtn');
    expect(btn?.textContent).toBe('✓');
    expect(btn?.getAttribute('aria-label')).toBe('Copied!');
  });

  it('shows failure: changes button text and aria-label', () => {
    showCopyFeedback(false);
    const btn = document.getElementById('copyBtn');
    expect(btn?.textContent).toBe('✗');
    expect(btn?.getAttribute('aria-label')).toBe('Copy failed');
  });

  it('resets button text after 2s', () => {
    showCopyFeedback(true);
    vi.advanceTimersByTime(2000);
    const btn = document.getElementById('copyBtn');
    expect(btn?.textContent).toBe('📋');
    expect(btn?.getAttribute('aria-label')).toBe('Copy joke to clipboard');
  });

  it('does nothing if button is missing', () => {
    document.getElementById('copyBtn')?.remove();
    expect(() => showCopyFeedback(true)).not.toThrow();
  });
});

describe('UI: setCopyButtonEnabled() / setShareButtonEnabled()', () => {
  beforeEach(setupDOM);

  it('enables copy button', () => {
    setCopyButtonEnabled(true);
    expect((document.getElementById('copyBtn') as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables copy button', () => {
    setCopyButtonEnabled(true);
    setCopyButtonEnabled(false);
    expect((document.getElementById('copyBtn') as HTMLButtonElement).disabled).toBe(true);
  });

  it('enables share button', () => {
    setShareButtonEnabled(true);
    expect((document.getElementById('shareBtn') as HTMLButtonElement).disabled).toBe(false);
  });

  it('disables share button', () => {
    setShareButtonEnabled(true);
    setShareButtonEnabled(false);
    expect((document.getElementById('shareBtn') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('UI: updateFavouriteButton()', () => {
  beforeEach(setupDOM);

  it('sets aria-pressed to "true" when favourited', () => {
    updateFavouriteButton(true);
    const btn = document.getElementById('favouriteBtn');
    expect(btn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('sets aria-pressed to "false" when not favourited', () => {
    updateFavouriteButton(true);
    updateFavouriteButton(false);
    const btn = document.getElementById('favouriteBtn');
    expect(btn?.getAttribute('aria-pressed')).toBe('false');
  });

  it('sets aria-label to "Remove from favourites" when favourited', () => {
    updateFavouriteButton(true);
    const btn = document.getElementById('favouriteBtn');
    expect(btn?.getAttribute('aria-label')).toBe('Remove from favourites');
  });

  it('sets aria-label to "Add to favourites" when not favourited', () => {
    updateFavouriteButton(false);
    const btn = document.getElementById('favouriteBtn');
    expect(btn?.getAttribute('aria-label')).toBe('Add to favourites');
  });

  it('adds favourite-btn--active class when favourited', () => {
    updateFavouriteButton(true);
    const btn = document.getElementById('favouriteBtn');
    expect(btn?.classList.contains('favourite-btn--active')).toBe(true);
  });

  it('removes favourite-btn--active class when not favourited', () => {
    updateFavouriteButton(true);
    updateFavouriteButton(false);
    const btn = document.getElementById('favouriteBtn');
    expect(btn?.classList.contains('favourite-btn--active')).toBe(false);
  });

  it('does nothing if button element is missing', () => {
    document.getElementById('favouriteBtn')?.remove();
    expect(() => updateFavouriteButton(true)).not.toThrow();
  });
});

describe('UI: updateFavouritesCount()', () => {
  beforeEach(setupDOM);

  it('updates the count text', () => {
    updateFavouritesCount(5);
    expect(document.getElementById('favCount')?.textContent).toBe('5');
  });

  it('does not throw when favCount element is missing', () => {
    document.getElementById('favCount')?.remove();
    expect(() => updateFavouritesCount(3)).not.toThrow();
  });
});

describe('UI: toggleFavouritesPanel()', () => {
  beforeEach(setupDOM);

  it('does not throw when panel and button are missing', () => {
    document.getElementById('favPanel')?.remove();
    document.getElementById('favListBtn')?.remove();
    expect(() => toggleFavouritesPanel(true)).not.toThrow();
  });

  it('shows panel when open=true', () => {
    toggleFavouritesPanel(true);
    expect((document.getElementById('favPanel') as HTMLElement).hidden).toBe(false);
  });

  it('hides panel when open=false', () => {
    toggleFavouritesPanel(true);
    toggleFavouritesPanel(false);
    expect((document.getElementById('favPanel') as HTMLElement).hidden).toBe(true);
  });

  it('updates aria-expanded on toggle button', () => {
    toggleFavouritesPanel(true);
    expect(document.getElementById('favListBtn')?.getAttribute('aria-expanded')).toBe('true');
    toggleFavouritesPanel(false);
    expect(document.getElementById('favListBtn')?.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('UI: renderFavouritesList()', () => {
  beforeEach(setupDOM);

  it('renders one item per joke', () => {
    const jokes = [{ id: 'a', joke: 'Joke A' }, { id: 'b', joke: 'Joke B' }];
    renderFavouritesList(jokes, vi.fn());
    expect(document.querySelectorAll('.fav-item')).toHaveLength(2);
  });

  it('shows empty state when list is empty', () => {
    renderFavouritesList([], vi.fn());
    expect(document.querySelector('.fav-empty')).not.toBeNull();
    expect(document.querySelector('.fav-list')).toBeNull();
  });

  it('calls onDelete with correct id when delete button clicked', () => {
    const onDelete = vi.fn();
    renderFavouritesList([{ id: 'x', joke: 'Joke X' }], onDelete);
    (document.querySelector('.fav-item__delete') as HTMLButtonElement).click();
    expect(onDelete).toHaveBeenCalledWith('x');
  });

  it('renders joke text as textContent (not innerHTML)', () => {
    renderFavouritesList([{ id: '1', joke: '<script>alert(1)</script>' }], vi.fn());
    const text = document.querySelector('.fav-item__text');
    expect(text?.textContent).toBe('<script>alert(1)</script>');
    expect(document.querySelector('script')).toBeNull();
  });

  it('does nothing if favPanel element is missing', () => {
    document.getElementById('favPanel')?.remove();
    expect(() => renderFavouritesList([{ id: 'a', joke: 'A' }], vi.fn())).not.toThrow();
  });
});

describe('UI: updateRatingButtons()', () => {
  beforeEach(setupDOM);

  it('sets aria-pressed "true" on thumbs-up when rating is "up"', () => {
    updateRatingButtons('up');
    expect(document.getElementById('thumbsUpBtn')?.getAttribute('aria-pressed')).toBe('true');
    expect(document.getElementById('thumbsDownBtn')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('sets aria-pressed "true" on thumbs-down when rating is "down"', () => {
    updateRatingButtons('down');
    expect(document.getElementById('thumbsDownBtn')?.getAttribute('aria-pressed')).toBe('true');
    expect(document.getElementById('thumbsUpBtn')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('sets both aria-pressed "false" when rating is null', () => {
    updateRatingButtons('up');
    updateRatingButtons(null);
    expect(document.getElementById('thumbsUpBtn')?.getAttribute('aria-pressed')).toBe('false');
    expect(document.getElementById('thumbsDownBtn')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('adds rating-btn--up-active class when rated up', () => {
    updateRatingButtons('up');
    expect(document.getElementById('thumbsUpBtn')?.classList.contains('rating-btn--up-active')).toBe(true);
    expect(document.getElementById('thumbsDownBtn')?.classList.contains('rating-btn--down-active')).toBe(false);
  });

  it('adds rating-btn--down-active class when rated down', () => {
    updateRatingButtons('down');
    expect(document.getElementById('thumbsDownBtn')?.classList.contains('rating-btn--down-active')).toBe(true);
    expect(document.getElementById('thumbsUpBtn')?.classList.contains('rating-btn--up-active')).toBe(false);
  });

  it('removes active classes when rating cleared', () => {
    updateRatingButtons('up');
    updateRatingButtons(null);
    expect(document.getElementById('thumbsUpBtn')?.classList.contains('rating-btn--up-active')).toBe(false);
    expect(document.getElementById('thumbsDownBtn')?.classList.contains('rating-btn--down-active')).toBe(false);
  });

  it('does not throw when buttons are missing', () => {
    document.getElementById('thumbsUpBtn')?.remove();
    document.getElementById('thumbsDownBtn')?.remove();
    expect(() => updateRatingButtons('up')).not.toThrow();
  });
});

// ===== updateThemeToggle =====

describe('UI: updateThemeToggle()', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="themeToggleBtn" aria-pressed="false" aria-label="Switch to dark mode">☾</button>
    `;
  });

  it('sets aria-pressed="true" and label "Switch to light mode" when theme is dark', () => {
    updateThemeToggle('dark');
    const btn = document.getElementById('themeToggleBtn');
    expect(btn?.getAttribute('aria-pressed')).toBe('true');
    expect(btn?.getAttribute('aria-label')).toBe('Switch to light mode');
  });

  it('sets aria-pressed="false" and label "Switch to dark mode" when theme is light', () => {
    updateThemeToggle('dark'); // set to dark first
    updateThemeToggle('light');
    const btn = document.getElementById('themeToggleBtn');
    expect(btn?.getAttribute('aria-pressed')).toBe('false');
    expect(btn?.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('does not throw when button is missing', () => {
    document.getElementById('themeToggleBtn')?.remove();
    expect(() => updateThemeToggle('dark')).not.toThrow();
  });
});
