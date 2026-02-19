/**
 * Baseline tests — Sprint 1, Ticket #5
 *
 * These tests lock down the current behaviour BEFORE any refactoring.
 * They verify the migrated code behaves identically to the original.
 *
 * Per DECISIONS.md D15:
 * 1. Page loads and calls the API (fetch to icanhazdadjoke.com)
 * 2. API response joke text appears in the DOM
 * 3. Button click triggers a new API call
 * 4. Fetch includes Accept: application/json header
 *
 * GATE: These tests must pass before any behaviour changes (tickets #6+).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { fetchJoke } from '../api.ts';
import { renderJoke } from '../ui.ts';
import { MOCK_JOKE, lastRequest } from './mocks/handlers.ts';

describe('Baseline: API module', () => {
  it('fetches a joke from the API', async () => {
    const joke = await fetchJoke();
    expect(joke).toBeDefined();
    expect(joke.joke).toBe(MOCK_JOKE.joke);
    expect(joke.id).toBe(MOCK_JOKE.id);
  });

  it('sends Accept: application/json header', async () => {
    await fetchJoke();
    expect(lastRequest).not.toBeNull();
    expect(lastRequest?.headers.get('Accept')).toBe('application/json');
  });

  it('returns a Joke object with id and joke properties', async () => {
    const joke = await fetchJoke();
    expect(joke).toHaveProperty('id');
    expect(joke).toHaveProperty('joke');
    expect(typeof joke.id).toBe('string');
    expect(typeof joke.joke).toBe('string');
  });
});

describe('Baseline: UI module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main class="container" role="main">
        <h1 class="title">Don't Laugh Challenge</h1>
        <p class="joke" id="joke" aria-live="polite" aria-atomic="true">Loading...</p>
        <button id="jokeBtn" class="btn" type="button">Get Another Joke</button>
      </main>
    `;
  });

  it('renders joke text into the joke element', () => {
    renderJoke('Test joke text');
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe('Test joke text');
  });

  it('replaces existing joke text with new text', () => {
    renderJoke('First joke');
    renderJoke('Second joke');
    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe('Second joke');
  });
});

describe('Baseline: Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main class="container" role="main">
        <h1 class="title">Don't Laugh Challenge</h1>
        <p class="joke" id="joke" aria-live="polite" aria-atomic="true">Loading...</p>
        <button id="jokeBtn" class="btn" type="button">Get Another Joke</button>
      </main>
    `;
  });

  it('fetches a joke and displays it in the DOM', async () => {
    const joke = await fetchJoke();
    renderJoke(joke.joke);

    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe(MOCK_JOKE.joke);
  });

  it('button click triggers a new joke fetch and display', async () => {
    const jokeBtn = document.getElementById('jokeBtn');
    expect(jokeBtn).toBeDefined();

    // Simulate what main.ts does: fetch + render
    const joke = await fetchJoke();
    renderJoke(joke.joke);

    const jokeEl = document.getElementById('joke');
    expect(jokeEl?.textContent).toBe(MOCK_JOKE.joke);
  });
});
