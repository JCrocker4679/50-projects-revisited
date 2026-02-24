import '@fontsource/roboto/latin-400.css';
import '@fontsource/roboto/latin-700.css';
import './style.css';
import { inject } from '@vercel/analytics';
import { fetchJoke, searchJokes, ApiError } from './api.ts';
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
  setSearchLoading,
  renderSearchResults,
  clearSearchUI,
  setHistoryNavDisabled,
} from './ui.ts';
import { getTheme, toggleTheme } from './theme.ts';
import {
  getCurrentJoke,
  setCurrentJoke,
  initHistory,
  addToHistory,
  navigateHistory,
  getHistory,
  getHistoryIndex,
  initFavourites,
  getFavourites,
  isFavourited,
  toggleFavourite,
  initRatings,
  getRating,
  setRating,
  isSearchActive,
  setSearchResults,
  selectSearchResult,
  clearSearch,
  getSearchState,
} from './state.ts';
import { trackJokeFetched, trackErrorShown, trackRetryClicked } from './analytics.ts';

// Initialise Vercel Analytics (page views + custom events)
inject();

/**
 * Main entry point.
 */

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
const prevBtn = document.getElementById('prevBtn') as HTMLButtonElement | null;
const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement | null;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement | null;
const shareBtn = document.getElementById('shareBtn') as HTMLButtonElement | null;
const favouriteBtn = document.getElementById('favouriteBtn') as HTMLButtonElement | null;
const favListBtn = document.getElementById('favListBtn') as HTMLButtonElement | null;
const thumbsUpBtn = document.getElementById('thumbsUpBtn') as HTMLButtonElement | null;
const thumbsDownBtn = document.getElementById('thumbsDownBtn') as HTMLButtonElement | null;
const themeToggleBtn = document.getElementById('themeToggleBtn') as HTMLButtonElement | null;
const searchForm = document.getElementById('searchForm') as HTMLFormElement | null;
const searchClearBtn = document.getElementById('searchClearBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;
let favPanelOpen = false;
/** Joke visible before a search was triggered — restored when search is cleared. */
let priorToSearchJoke: import('./types.ts').Joke | null = null;

function updateHistoryNav(): void {
  renderHistoryNav(getHistoryIndex(), getHistory().length);
}

function refreshFavouritesUI(): void {
  const favs = getFavourites();
  updateFavouritesCount(favs.length);
  if (favPanelOpen) {
    renderFavouritesList(favs, (id) => {
      const joke = favs.find((j) => j.id === id);
      if (joke) toggleFavourite(joke);
      const current = getCurrentJoke();
      if (current) updateFavouriteButton(isFavourited(current.id));
      refreshFavouritesUI();
    });
  }
}

async function generateJoke(): Promise<void> {
  if (isSearchActive()) {
    clearSearch();
    clearSearchUI();
    setHistoryNavDisabled(false);
  }

  setCopyButtonEnabled(false);
  setShareButtonEnabled(false);
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    priorToSearchJoke = joke;
    setCurrentJoke(joke);
    renderJoke(joke.joke);
    setCopyButtonEnabled(true);
    setShareButtonEnabled(true);
    addToHistory(joke);
    updateHistoryNav();
    updateFavouriteButton(isFavourited(joke.id));
    updateRatingButtons(getRating(joke.id));
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
        await copyJoke();
      }
    }
  } else {
    // Desktop fallback: copy to clipboard
    await copyJoke();
  }
}

function handleHistoryNav(direction: 'back' | 'forward'): void {
  const joke = navigateHistory(direction);
  if (!joke) return;
  renderJoke(joke.joke);
  updateHistoryNav();
  updateFavouriteButton(isFavourited(joke.id));
  updateRatingButtons(getRating(joke.id));
}

async function handleSearch(term: string): Promise<void> {
  priorToSearchJoke = getCurrentJoke();
  setSearchLoading(true);
  try {
    const response = await searchJokes(term);
    setSearchResults(response.results, term);
    const { searchResults, selectedSearchIndex } = getSearchState();
    renderSearchResults(searchResults, term, response.total_jokes, selectedSearchIndex, handleSelectSearchResult);
    setHistoryNavDisabled(true);
    if (searchResults.length > 0) {
      const joke = searchResults[0];
      renderJoke(joke.joke);
      setCopyButtonEnabled(true);
      setShareButtonEnabled(true);
      updateFavouriteButton(isFavourited(joke.id));
      updateRatingButtons(getRating(joke.id));
    }
  } catch (error) {
    if (error instanceof ApiError) {
      renderError(error.message, error.type);
    }
  } finally {
    setSearchLoading(false);
  }
}

function handleSelectSearchResult(index: number): void {
  selectSearchResult(index);
  const { searchResults } = getSearchState();
  const joke = searchResults[index];
  if (!joke) return;
  renderJoke(joke.joke);
  setCopyButtonEnabled(true);
  setShareButtonEnabled(true);
  updateFavouriteButton(isFavourited(joke.id));
  updateRatingButtons(getRating(joke.id));
  // Collapse the results list after selection (keep term in input, X still visible)
  const list = document.getElementById('searchResults') as HTMLElement | null;
  if (list) list.hidden = true;
}

function handleClearSearch(): void {
  clearSearch();
  clearSearchUI();
  setHistoryNavDisabled(false);
  updateHistoryNav();
  if (priorToSearchJoke) {
    setCurrentJoke(priorToSearchJoke);
    lastJoke = priorToSearchJoke.joke;
    renderJoke(priorToSearchJoke.joke);
    setCopyButtonEnabled(true);
    setShareButtonEnabled(true);
    updateFavouriteButton(isFavourited(priorToSearchJoke.id));
    updateRatingButtons(getRating(priorToSearchJoke.id));
  }
}

// Seed state from localStorage
initHistory();
initFavourites();
initRatings();
refreshFavouritesUI();

// Sync theme toggle button with current theme (applied before paint by theme-init.ts)
updateThemeToggle(getTheme());

// Wire up retry handler so the retry button in error state can trigger a new fetch
setRetryHandler(() => {
  trackRetryClicked();
  generateJoke();
});

jokeBtn?.addEventListener('click', generateJoke);
prevBtn?.addEventListener('click', () => handleHistoryNav('back'));
nextBtn?.addEventListener('click', () => handleHistoryNav('forward'));
copyBtn?.addEventListener('click', copyJoke);
shareBtn?.addEventListener('click', shareJoke);

favouriteBtn?.addEventListener('click', () => {
  const joke = getCurrentJoke();
  if (!joke) return;
  toggleFavourite(joke);
  updateFavouriteButton(isFavourited(joke.id));
  refreshFavouritesUI();
});

thumbsUpBtn?.addEventListener('click', () => {
  const joke = getCurrentJoke();
  if (!joke) return;
  setRating(joke.id, 'up');
  updateRatingButtons(getRating(joke.id));
});

thumbsDownBtn?.addEventListener('click', () => {
  const joke = getCurrentJoke();
  if (!joke) return;
  setRating(joke.id, 'down');
  updateRatingButtons(getRating(joke.id));
});

favListBtn?.addEventListener('click', () => {
  favPanelOpen = !favPanelOpen;
  toggleFavouritesPanel(favPanelOpen);
  if (favPanelOpen) {
    renderFavouritesList(getFavourites(), (id) => {
      const joke = getFavourites().find((j) => j.id === id);
      if (joke) toggleFavourite(joke);
      const current = getCurrentJoke();
      if (current) updateFavouriteButton(isFavourited(current.id));
      refreshFavouritesUI();
    });
  }
});

themeToggleBtn?.addEventListener('click', () => {
  const next = toggleTheme();
  updateThemeToggle(next);
});

searchForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('searchInput') as HTMLInputElement | null;
  const term = input?.value.trim() ?? '';
  if (!term) return;
  handleSearch(term);
});

searchClearBtn?.addEventListener('click', handleClearSearch);

// Load first joke immediately
generateJoke();
