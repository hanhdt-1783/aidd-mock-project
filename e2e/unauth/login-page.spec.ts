import { test, expect } from '@playwright/test';

// Guarantee a clean anonymous context.
test.use({ storageState: { cookies: [], origins: [] } });

test('login page renders Google sign-in button', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);

  // GoogleLoginButton renders a <button> with aria-label from t(lang, 'login.button.google').
  // Default lang is vi: "ĐĂNG NHẬP Bằng Google".
  // The component also accepts an English label prop ("LOGIN With Google") but the login
  // page passes the localised string. Match both via partial text of "Google".
  const googleBtn = page.getByRole('button', { name: /google/i });
  await expect(googleBtn).toBeVisible();
});
