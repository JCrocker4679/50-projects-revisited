import { test, expect } from '@playwright/test';

/**
 * Smoke test — verifies the app loads and the key elements are present.
 * Full E2E scenarios will be added in ticket #71.
 *
 * NOTE: Tests run against the real JokeAPI (no MSW in E2E).
 * Assertions avoid relying on specific joke text to stay API-agnostic.
 */
test('page loads and shows the title and main button', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Dad Jokes/i);
  await expect(page.getByText("Don't Laugh Challenge")).toBeVisible();
  await expect(page.getByRole('button', { name: /Tell me another/i })).toBeVisible();
});
