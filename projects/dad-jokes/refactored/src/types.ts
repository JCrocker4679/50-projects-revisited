/**
 * Core data types for the Dad Jokes app.
 */

/** A joke returned from the icanhazdadjoke API */
export interface Joke {
  id: string;
  joke: string;
}

/** Raw API response shape from icanhazdadjoke.com */
export interface ApiResponse {
  id: string;
  joke: string;
  status: number;
}

/** A user's rating for a single joke. null = not yet rated */
export type RatingValue = 'up' | 'down' | null;

/** Map of joke ID → rating. Unbounded — grows with usage, no eviction. */
export type JokeRatings = Record<string, RatingValue>;

/** Application state */
export interface AppState {
  currentJoke: Joke | null;
  isLoading: boolean;
  error: string | null;
  history: Joke[];
  historyIndex: number;
  favourites: Joke[];
  ratings: JokeRatings;
}
