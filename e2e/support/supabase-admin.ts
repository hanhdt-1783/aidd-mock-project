/**
 * Supabase admin helpers for E2E auth seeding.
 *
 * IMPORTANT: Uses raw fetch ONLY — no supabase-js client.
 * Reason: supabase-js realtime init throws "Node.js 20 detected without native
 * WebSocket" even for auth-only operations. Raw fetch avoids this entirely.
 */

export interface GoTrueSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: Record<string, unknown>;
}

interface AdminUserPayload {
  email: string;
  password: string;
  email_confirm: boolean;
}

/**
 * Ensure a test user with the given email+password exists in GoTrue.
 * Seed users use provider='seed' with no password — this creates/updates
 * the dedicated E2E user so password-grant sign-in works.
 */
export async function ensureTestUser(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  password: string,
): Promise<void> {
  const payload: AdminUserPayload = { email, password, email_confirm: true };

  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify(payload),
  });

  if (createRes.ok) return; // user created

  const body = (await createRes.json()) as { code?: number; error_code?: string; msg?: string; message?: string };
  const msg = body.msg ?? body.message ?? '';

  // 422 = user already exists (error_code: email_exists) — update the password to keep idempotent
  if (createRes.status === 422 && (body.code === 422 || msg.toLowerCase().includes('already'))) {
    const userId = await lookupUserId(supabaseUrl, serviceRoleKey, email);
    await updateUserPassword(supabaseUrl, serviceRoleKey, userId, password);
    return;
  }

  throw new Error(
    `ensureTestUser: unexpected ${createRes.status} from admin API — ${JSON.stringify(body)}`,
  );
}

async function lookupUserId(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
): Promise<string> {
  // GoTrue admin list: use `filter=<email>` (not `email=<email>`) for email search.
  const res = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    },
  );
  if (!res.ok) {
    throw new Error(`lookupUserId: ${res.status} — ${await res.text()}`);
  }
  const data = (await res.json()) as { users?: Array<{ id: string }> };
  const id = data.users?.[0]?.id;
  if (!id) throw new Error(`lookupUserId: no user found for ${email}`);
  return id;
}

async function updateUserPassword(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    throw new Error(`updateUserPassword: ${res.status} — ${await res.text()}`);
  }
}

/**
 * Sign in with email+password via GoTrue password grant.
 * Returns the full session JSON needed to build the storageState cookie.
 */
export async function signInWithPassword(
  supabaseUrl: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<GoTrueSession> {
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`signInWithPassword: ${res.status} — ${text}`);
  }

  return res.json() as Promise<GoTrueSession>;
}
