import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-700.css';
import './style.css';
import { fetchJoke, ApiError } from './api.ts';
import {
  renderJoke,
  renderError,
  showLoading,
  hideLoading,
  setRetryHandler,
  updateFavouriteButton,
} from './ui.ts';
import { getCurrentJoke, initFavourites, isFavourited, toggleFavourite } from './state.ts';

/**
 * Main entry point.
 *
 * Fetches a joke on page load and on button click.
 * Shows loading state during fetch, handles errors gracefully.
 * Caches last successful joke for fallback on error.
 */

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
const favouriteBtn = document.getElementById('favouriteBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;

async function generateJoke(): Promise<void> {
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    renderJoke(joke.joke);
    updateFavouriteButton(isFavourited(joke.id));
  } catch (error) {
    const cached = lastJoke ?? undefined;
    if (error instanceof ApiError) {
      renderError(error.message, error.type, cached);
    } else {
      renderError('Something went sideways. Try again?', 'network', cached);
    }
  } finally {
    hideLoading();
    isFirstLoad = false;
  }
}

// Seed favourites state from localStorage
initFavourites();

// Wire up retry handler so the retry button in error state can trigger a new fetch
setRetryHandler(generateJoke);

jokeBtn?.addEventListener('click', generateJoke);

favouriteBtn?.addEventListener('click', () => {
  const joke = getCurrentJoke();
  if (!joke) return;
  toggleFavourite(joke);
  updateFavouriteButton(isFavourited(joke.id));
});

// Load first joke immediately
generateJoke();
