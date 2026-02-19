import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-700.css';
import './style.css';
import { fetchJoke } from './api.ts';
import { renderJoke } from './ui.ts';

/**
 * Main entry point.
 *
 * Direct port of the original tutorial's wiring:
 * - Fetch a joke on page load
 * - Fetch a new joke on button click
 *
 * Behaviour is identical to the original — just reorganised into modules.
 */

const jokeBtn = document.getElementById('jokeBtn');

async function generateJoke(): Promise<void> {
  const joke = await fetchJoke();
  renderJoke(joke.joke);
}

jokeBtn?.addEventListener('click', generateJoke);

// Load first joke immediately
generateJoke();
