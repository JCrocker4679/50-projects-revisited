/**
 * Vitest global test setup.
 *
 * This file runs before each test file.
 * MSW handlers and other global setup will be configured here.
 */

import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server.ts';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (for per-test overrides)
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
