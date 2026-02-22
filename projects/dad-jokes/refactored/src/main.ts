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
  renderHistoryNav,
} from './ui.ts';
import {
  initHistory,
  addToHistory,
  navigateHistory,
  getHistory,
  getHistoryIndex,
} from './state.ts';

/**
 * Main entry point.
 */

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;

function updateHistoryNav(): void {
  renderHistoryNav(getHistoryIndex(), getHistory().length);
}

async function generateJoke(): Promise<void> {
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    renderJoke(joke.joke);
    addToHistory(joke);
    updateHistoryNav();
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

function handleHistoryNav(direction: 'back' | 'forward'): void {
  const joke = navigateHistory(direction);
  if (!joke) return;
  renderJoke(joke.joke);
  updateHistoryNav();
}

// Seed history state from localStorage
initHistory();

// Wire up retry handler
setRetryHandler(generateJoke);

jokeBtn?.addEventListener('click', generateJoke);
prevBtn?.addEventListener('click', () => handleHistoryNav('back'));
nextBtn?.addEventListener('click', () => handleHistoryNav('forward'));

// Load first joke immediately
generateJoke();
