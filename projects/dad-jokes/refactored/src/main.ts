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
  showCopyFeedback,
  setCopyButtonEnabled,
  updateFavouriteButton,
} from './ui.ts';
import {
  getCurrentJoke,
  setCurrentJoke,
  initHistory,
  addToHistory,
  initFavourites,
  isFavourited,
  toggleFavourite,
} from './state.ts';
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
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement | null;
const favouriteBtn = document.getElementById('favouriteBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;

async function generateJoke(): Promise<void> {
  setCopyButtonEnabled(false);
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    setCurrentJoke(joke);
    renderJoke(joke.joke);
    setCopyButtonEnabled(true);
    addToHistory(joke);
    updateFavouriteButton(isFavourited(joke.id));
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

async function copyJoke(): Promise<void> {
  const joke = getCurrentJoke();
  if (!joke) return;

  try {
    await navigator.clipboard.writeText(joke.joke);
    showCopyFeedback(true);
  } catch {
    // Fallback for older browsers / non-HTTPS environments
    try {
      const ta = document.createElement('textarea');
      ta.value = joke.joke;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showCopyFeedback(true);
    } catch {
      showCopyFeedback(false);
    }
  }
}

// Seed state from localStorage
initHistory();
initFavourites();

// Wire up retry handler so the retry button in error state can trigger a new fetch
setRetryHandler(() => {
  trackRetryClicked();
  generateJoke();
});

jokeBtn?.addEventListener('click', generateJoke);
copyBtn?.addEventListener('click', copyJoke);

favouriteBtn?.addEventListener('click', () => {
  const joke = getCurrentJoke();
  if (!joke) return;
  toggleFavourite(joke);
  updateFavouriteButton(isFavourited(joke.id));
});

// Load first joke immediately
generateJoke();
