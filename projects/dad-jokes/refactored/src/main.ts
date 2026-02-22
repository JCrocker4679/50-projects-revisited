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
  updateFavouritesCount,
  toggleFavouritesPanel,
  renderFavouritesList,
} from './ui.ts';
import {
  getCurrentJoke,
  setCurrentJoke,
  initFavourites,
  getFavourites,
  isFavourited,
  toggleFavourite,
} from './state.ts';

const jokeBtn = document.getElementById('jokeBtn') as HTMLButtonElement | null;
const favouriteBtn = document.getElementById('favouriteBtn') as HTMLButtonElement | null;
const favListBtn = document.getElementById('favListBtn') as HTMLButtonElement | null;
let isFirstLoad = true;
let lastJoke: string | null = null;
let favPanelOpen = false;

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
  showLoading(isFirstLoad);

  try {
    const joke = await fetchJoke();
    lastJoke = joke.joke;
    setCurrentJoke(joke);
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

// Seed from localStorage
initFavourites();
refreshFavouritesUI();

setRetryHandler(generateJoke);

jokeBtn?.addEventListener('click', generateJoke);

favouriteBtn?.addEventListener('click', () => {
  const joke = getCurrentJoke();
  if (!joke) return;
  toggleFavourite(joke);
  updateFavouriteButton(isFavourited(joke.id));
  refreshFavouritesUI();
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

generateJoke();
