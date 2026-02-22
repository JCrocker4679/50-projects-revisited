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

/** Application state */
export interface AppState {
  currentJoke: Joke | null;
  isLoading: boolean;
  error: string | null;
  history: Joke[];
  historyIndex: number;
  favourites: Joke[];
}
