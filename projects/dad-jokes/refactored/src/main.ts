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
  showCopyFeedback,
  setCopyButtonEnabled,
  setShareButtonEnabled,
} from './ui.ts';
import { getCurrentJoke, setCurrentJoke } from './state.ts';

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement | null;
const shareBtn = document.getElementById('shareBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;

async function generateJoke(): Promise<void> {
  setCopyButtonEnabled(false);
  setShareButtonEnabled(false);
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    setCurrentJoke(joke);
    renderJoke(joke.joke);
    setCopyButtonEnabled(true);
    setShareButtonEnabled(true);
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

async function copyJokeToClipboard(): Promise<void> {
  const joke = getCurrentJoke();
  if (!joke) return;
  try {
    await navigator.clipboard.writeText(joke.joke);
    showCopyFeedback(true);
  } catch {
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

async function shareJoke(): Promise<void> {
  const joke = getCurrentJoke();
  if (!joke) return;

  const shareData = { text: joke.joke };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // AbortError = user dismissed share sheet — not an error
      if ((err as Error).name !== 'AbortError') {
        await copyJokeToClipboard();
      }
    }
  } else {
    // Desktop fallback: copy to clipboard
    await copyJokeToClipboard();
  }
}

setRetryHandler(generateJoke);

jokeBtn?.addEventListener('click', generateJoke);
copyBtn?.addEventListener('click', copyJokeToClipboard);
shareBtn?.addEventListener('click', shareJoke);

generateJoke();
