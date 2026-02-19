/**
 * UI rendering functions.
 *
 * Security fix (#6): innerHTML replaced with textContent to prevent XSS.
 * The icanhazdadjoke API returns plain text jokes, so textContent is
 * both safer and more appropriate.
 */

/**
 * Display a joke in the joke element.
 * Uses textContent (not innerHTML) to prevent XSS injection.
 */
export function renderJoke(jokeText: string): void {
  const jokeEl = document.getElementById('joke');
  if (jokeEl) {
    jokeEl.textContent = jokeText;
  }
}
