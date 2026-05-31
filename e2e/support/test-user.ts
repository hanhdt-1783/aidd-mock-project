import path from 'path';

/** Dedicated E2E test user — local Supabase only, never staging/prod. */
export const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'e2e-test@sun-asterisk.com';
export const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'E2eTestPassword!2025';
export const TEST_DISPLAY_NAME = 'E2E Test User';

/** Path where the Playwright storageState is written by global.setup.ts. */
export const AUTH_FILE = path.join(__dirname, '../../playwright/.auth/user.json');

/**
 * Read required env vars. Credentials must come from the environment or a
 * .env file (see .env.test.local) — no hardcoded key fallbacks, so a missing
 * or empty var fails loudly at setup time instead of silently using local
 * demo creds (which would be wrong/insecure against a non-local URL).
 * The Supabase URL keeps a harmless local default (not a credential).
 */
export function getEnv() {
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!ANON_KEY) throw new Error('E2E: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      'E2E: SUPABASE_SERVICE_ROLE_KEY is not set — add it to .env.test.local (local dev) or the CI env.',
    );
  }

  return { SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY };
}
