import { test as setup, expect } from '@playwright/test';
import { ensureTestUser, signInWithPassword } from './supabase-admin';
import { writeStorageState } from './storage-state';
import { AUTH_FILE, TEST_EMAIL, TEST_PASSWORD, getEnv } from './test-user';

/**
 * Global auth setup — runs once before the authed test project.
 *
 * Steps:
 *  1. Provision test user via service_role admin REST (idempotent).
 *  2. Sign in via password grant (raw fetch, NOT supabase-js — Node 20 has no
 *     native WebSocket so supabase-js realtime init would throw).
 *  3. Write @supabase/ssr-format cookie into playwright/.auth/user.json.
 *  4. Self-verify: load /kudos with that storageState; assert no redirect to /login.
 */
setup('authenticate test user', async ({ page }) => {
  const { SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY } = getEnv();

  // Step 1 — ensure the test user exists with a password
  await ensureTestUser(SUPABASE_URL, SERVICE_ROLE_KEY, TEST_EMAIL, TEST_PASSWORD);

  // Step 2 — sign in via password grant
  const session = await signInWithPassword(SUPABASE_URL, ANON_KEY, TEST_EMAIL, TEST_PASSWORD);

  // Step 3 — write storageState with the @supabase/ssr cookie
  writeStorageState(session, SUPABASE_URL, AUTH_FILE);

  // Step 4 — self-verify: open a fresh context with the written storageState and hit /kudos.
  // NOTE: do NOT call page.context().storageState({ path }) here — that would overwrite
  // the file we just wrote with the current (empty) page context state.
  const context = await page.context().browser()!.newContext({ storageState: AUTH_FILE });
  const verifyPage = await context.newPage();

  await verifyPage.goto('/kudos');

  // Authed storageState must NOT bounce to /login. If it does, the cookie
  // format or session is wrong — check storage-state.ts encodeSession().
  await expect(
    verifyPage,
    'Auth verification FAILED: /kudos redirected to /login — check storage-state.ts cookie format.',
  ).not.toHaveURL(/\/login/);

  await context.close();

  console.log(`[global.setup] Auth OK — storageState written to ${AUTH_FILE}`);
});
