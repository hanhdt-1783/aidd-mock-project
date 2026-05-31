import { test, expect } from '@playwright/test';
import { AUTH_FILE } from '../support/test-user';

// Load the storageState written by global.setup.ts.
test.use({ storageState: AUTH_FILE });

test('/profile renders Coming Soon placeholder', async ({ page }) => {
  await page.goto('/profile');

  // Must NOT redirect to /login.
  await expect(page).not.toHaveURL(/\/login/);

  // profile/page.tsx: <h1>Profile</h1> + <p>Sắp ra mắt</p> (vi default)
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  await expect(page.getByText('Sắp ra mắt')).toBeVisible();
});

test('/secret-box renders Secret Box heading for authed user', async ({ page }) => {
  await page.goto('/secret-box');

  // Must NOT redirect to /login.
  await expect(page).not.toHaveURL(/\/login/);

  // secret-box/page.tsx: <h1>Secret Box</h1>
  await expect(page.getByRole('heading', { name: 'Secret Box' })).toBeVisible();
});

test('/awards renders for authed user without redirect', async ({ page }) => {
  await page.goto('/awards');

  // Must NOT redirect to /login.
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).toHaveURL(/\/awards/);

  // awards/page.tsx renders AwardsPageTitle which contains:
  //   <h1>{t(lang,'awards.title')}</h1> = "Hệ thống giải thưởng SAA 2025" (vi)
  // Match partial text so a 500-error <h1> can't satisfy the assertion.
  await expect(page.getByRole('heading', { level: 1, name: /giải thưởng/ })).toBeVisible();
});
