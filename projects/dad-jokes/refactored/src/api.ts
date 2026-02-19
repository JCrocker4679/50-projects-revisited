import { API_URL } from './constants.ts';
import type { Joke, ApiResponse } from './types.ts';

/**
 * Fetch a random joke from the icanhazdadjoke API.
 *
 * This is a direct port of the original tutorial code's fetch logic,
 * reorganised into a module. Behaviour is identical to the original.
 */
export async function fetchJoke(): Promise<Joke> {
  const res = await fetch(API_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  const data: ApiResponse = await res.json();

  return {
    id: data.id,
    joke: data.joke,
  };
}
