import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-700.css';
import './style.css';
import { fetchJoke, ApiError } from './api.ts';
import { renderJoke, renderError, showLoading, hideLoading } from './ui.ts';

/**
 * Main entry point.
 *
 * Fetches a joke on page load and on button click.
 * Shows loading state during fetch, handles errors gracefully.
 */

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
let isFirstLoad = true;

async function generateJoke(): Promise<void> {
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    renderJoke(joke.joke);
  } catch (error) {
    if (error instanceof ApiError) {
      renderError(error.message, error.type);
    } else {
      renderError('Something went sideways. Try again?', 'network');
    }
  } finally {
    hideLoading();
    isFirstLoad = false;
  }
}

jokeBtn?.addEventListener('click', generateJoke);

// Load first joke immediately
generateJoke();
