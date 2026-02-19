/**
 * UI rendering functions.
 *
 * Direct port of the original tutorial's DOM update logic.
 * Uses innerHTML to match original behaviour — will be replaced
 * with textContent in ticket #6.
 */

/**
 * Display a joke in the joke element.
 * Uses innerHTML to match original tutorial behaviour.
 */
export function renderJoke(jokeText: string): void {
  const jokeEl = document.getElementById('joke');
  if (jokeEl) {
    jokeEl.innerHTML = jokeText;
  }
}
