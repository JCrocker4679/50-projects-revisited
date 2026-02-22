/**
 * UI rendering tests — Ticket #14
 *
 * Tests the UI module in ui.ts:
 * - renderJoke() sets textContent (XSS safe)
 * - renderError() shows error message, retry button, cached joke fallback
 * - showLoading() / hideLoading() toggle aria-busy and button state
 * - setRetryHandler() wires the retry callback
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderJoke,
  renderError,
  showLoading,
  hideLoading,
  setRetryHandler,
  renderHistoryNav,
} from '../ui.ts';

/** Standard DOM fixture for all UI tests */
function setupDOM(): void {
  document.body.innerHTML = `
    <div class="container">
      <h3>Don't Laugh Challenge</h3>
      <div class="joke" id="joke">// Joke goes here</div>
      <div class="action-row">
        <button id="jokeBtn" class="btn">Get Another Joke</button>
      </div>
      <nav class="history-nav" aria-label="Joke history navigation">
        <button id="prevBtn" class="btn btn--nav" disabled aria-disabled="true" aria-label="Previous joke">← Prev</button>
        <span class="history-counter" aria-live="polite" hidden></span>
        <button id="nextBtn" class="btn btn--nav" disabled aria-disabled="true" aria-label="Next joke">Next →</button>
      </nav>
    </div>
  `;
}

describe('UI: renderJoke()', () => {
  beforeEach(setupDOM);

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
    // textContent renders the string literally, not as HTML
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
    // Should not contain the old joke text directly as textContent
    // The error message should be in the .error-message span
    expect(jokeEl?.querySelector('.error-message')?.textContent).toContain(
      'joke factory',
    );
  });
});

describe('UI: showLoading()', () => {
  beforeEach(setupDOM);

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

  it('disables prevBtn when at oldest joke (index === total - 1)', () => {
    renderHistoryNav(4, 5); // index 4 = oldest in 5-item list
    const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    expect(prevBtn.getAttribute('aria-disabled')).toBe('true');
  });

  it('enables prevBtn when not at oldest', () => {
    renderHistoryNav(0, 5); // index 0 = newest
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
