import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-700.css';
import './style.css';
import { inject } from '@vercel/analytics';
import { fetchJoke, ApiError } from './api.ts';
import {
  renderJoke,
  renderError,
  showLoading,
  hideLoading,
  setRetryHandler,
} from './ui.ts';
import { initHistory, addToHistory } from './state.ts';
import { trackJokeFetched, trackErrorShown, trackRetryClicked } from './analytics.ts';

// Initialise Vercel Analytics (page views + custom events)
inject();

/**
 * Main entry point.
 *
 * Fetches a joke on page load and on button click.
 * Shows loading state during fetch, handles errors gracefully.
 * Caches last successful joke for fallback on error.
 */

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;

async function generateJoke(): Promise<void> {
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    renderJoke(joke.joke);
    addToHistory(joke);
    trackJokeFetched(joke.id);
  } catch (error) {
    const cached = lastJoke ?? undefined;
    if (error instanceof ApiError) {
      renderError(error.message, error.type, cached);
      trackErrorShown(error.type);
    } else {
      renderError('Something went sideways. Try again?', 'network', cached);
      trackErrorShown('unknown');
    }
  } finally {
    hideLoading();
    isFirstLoad = false;
  }
}

// Seed history state from localStorage
initHistory();

// Wire up retry handler so the retry button in error state can trigger a new fetch
setRetryHandler(() => {
  trackRetryClicked();
  generateJoke();
});

jokeBtn?.addEventListener('click', generateJoke);

// Load first joke immediately
generateJoke();
