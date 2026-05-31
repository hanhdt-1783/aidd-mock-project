import { test, expect } from '@playwright/test';

// Guarantee a clean anonymous context.
test.use({ storageState: { cookies: [], origins: [] } });

test('prelaunch page renders countdown heading', async ({ page }) => {
  await page.goto('/prelaunch');

  // Must stay on /prelaunch — this route is public (no auth guard).
  await expect(page).toHaveURL(/\/prelaunch/);

  // PrelaunchCountdownPage renders an <h1> with t(lang, 'prelaunch.title').
  // In vi (default lang): "Sự kiện sẽ bắt đầu sau". Match on partial text so a
  // 500-error <h1> can't satisfy the assertion, while surviving minor wording tweaks.
  const heading = page.getByRole('heading', { level: 1, name: /Sự kiện/ });
  await expect(heading).toBeVisible();
});
