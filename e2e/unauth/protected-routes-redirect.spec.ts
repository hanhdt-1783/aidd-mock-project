import { test, expect } from '@playwright/test';

// Guarantee a clean anonymous context regardless of project defaults.
test.use({ storageState: { cookies: [], origins: [] } });

const PROTECTED_ROUTES = ['/', '/kudos', '/profile', '/secret-box', '/awards'];

for (const route of PROTECTED_ROUTES) {
  test(`unauthenticated GET ${route} redirects to /login`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
  });
}
