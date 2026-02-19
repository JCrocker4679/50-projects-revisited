import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-700.css';
import './style.css';
import { fetchJoke, ApiError } from './api.ts';
import { renderJoke, renderError } from './ui.ts';

/**
 * Main entry point.
 *
 * Fetches a joke on page load and on button click.
 * Handles errors gracefully with user-facing messages.
 */

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;

async function generateJoke(): Promise<void> {
  try {
    const joke = await fetchJoke();
    renderJoke(joke.joke);
  } catch (error) {
    if (error instanceof ApiError) {
      renderError(error.message, error.type);
    } else {
      renderError('Something went sideways. Try again?', 'network');
    }
  }
}

jokeBtn?.addEventListener('click', generateJoke);

// Load first joke immediately
generateJoke();
