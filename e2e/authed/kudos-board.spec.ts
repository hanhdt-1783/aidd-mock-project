import { test, expect } from '@playwright/test';
import { AUTH_FILE } from '../support/test-user';

// Load the storageState written by global.setup.ts.
test.use({ storageState: AUTH_FILE });

test('kudos board loads without redirect and shows seeded kudos', async ({ page }) => {
  await page.goto('/kudos');

  // Must NOT redirect to /login.
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).toHaveURL(/\/kudos/);

  // KudosSpotlightBoard renders a section aria-labelledby="spotlight-board-heading".
  // The heading itself has id="spotlight-board-heading" and text "SPOTLIGHT BOARD".
  const spotlightHeading = page.locator('#spotlight-board-heading');
  await expect(spotlightHeading).toBeVisible();

  // seed.sql inserts kudos with Vietnamese titles into public.kudos.title.
  // Depends on supabase/seed.sql — if this fails, run 'npx supabase db reset' to reseed.
  // The first seeded kudo is "IDOL GIỚI TRẺ" — assert it appears in the feed.
  // Note: "Legend Hero" / "Rising Hero" / "New Hero" are profile badge labels
  // rendered as <img alt="..."> — not findable via getByText.
  const seededKudoTitle = page.getByText(/IDOL GIỚI TRẺ|NGƯỜI TRUYỀN CẢM HỨNG|NGƯỜI THẦY TẬN TÂM/).first();
  await expect(seededKudoTitle).toBeVisible();
});
