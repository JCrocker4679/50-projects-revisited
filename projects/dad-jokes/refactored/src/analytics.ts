/**
 * Analytics module.
 *
 * Thin wrapper around @vercel/analytics track().
 * Events are fire-and-forget — failures never propagate to the app.
 * All event names and properties are typed here for consistency.
 */

import { track as vercelTrack } from '@vercel/analytics';

function safeTrack(eventName: string, props?: Record<string, string>): void {
  try {
    vercelTrack(eventName, props);
  } catch {
    // Never let analytics failures reach the user
  }
}

export function trackJokeFetched(jokeId: string): void {
  safeTrack('joke_fetched', { jokeId });
}

export function trackErrorShown(errorType: string): void {
  safeTrack('error_shown', { errorType });
}

export function trackRetryClicked(): void {
  safeTrack('retry_clicked');
}

export function trackJokeCopied(): void {
  safeTrack('joke_copied');
}

export function trackJokeShared(): void {
  safeTrack('joke_shared');
}

export function trackFavouriteAdded(): void {
  safeTrack('favourite_added');
}

export function trackFavouriteRemoved(): void {
  safeTrack('favourite_removed');
}

export function trackHistoryNavigated(direction: 'back' | 'forward'): void {
  safeTrack('history_navigated', { direction });
}
