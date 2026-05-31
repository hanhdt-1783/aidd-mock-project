import { test, expect } from '@playwright/test';
import { AUTH_FILE } from '../support/test-user';

// Load the storageState written by global.setup.ts.
test.use({ storageState: AUTH_FILE });

test('give-kudos two-step FAB opens modal with core fields', async ({ page }) => {
  await page.goto('/kudos');
  await expect(page).not.toHaveURL(/\/login/);

  // Step 1: closed FAB — aria-label="Viết Kudos" (home.widget.label, vi).
  const fab = page.getByRole('button', { name: 'Viết Kudos' });
  await expect(fab).toBeVisible();
  await fab.click();

  // Step 2: expanded panel — "Viết KUDOS" button (home.widget.write-kudos, vi).
  // No aria-label on this button; Playwright matches the visible text span.
  const writeKudosBtn = page.getByRole('button', { name: 'Viết KUDOS' });
  await expect(writeKudosBtn).toBeVisible();
  await writeKudosBtn.click();

  // Step 3: modal — native <dialog aria-modal="true" aria-label="Viết Kudo">.
  // The dialog element itself has background:transparent + overflow:visible (CSS workaround
  // for the scrollable-card layout), so Playwright considers it "hidden" at the dialog level.
  // Assert on the card heading inside the dialog instead, which is fully visible.
  // kudos-create-form.tsx: <h2>{t(lang,'kudos.create.title')}</h2> = "Gửi lời cám ơn..."
  const dialogHeading = page.getByRole('heading', { name: /Gửi lời cám ơn/ });
  await expect(dialogHeading).toBeVisible();

  // Core fields confirmed from kudos-create-form.tsx:
  // - Title input: aria-label=t(lang,'kudos.create.title.label') = "Danh hiệu"
  // - Content textarea: aria-label=t(lang,'kudos.create.content.aria') = "Nội dung Kudo"
  await expect(page.getByRole('textbox', { name: 'Danh hiệu' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Nội dung Kudo' })).toBeVisible();

  // Close via ESC — native <dialog> cancel event → onClose().
  await page.keyboard.press('Escape');
  await expect(dialogHeading).not.toBeVisible();
});
