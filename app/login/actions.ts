'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

async function getSiteOrigin(): Promise<string> {
  // Prefer explicit env (production), fall back to request Origin (dev).
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envOrigin) return envOrigin.replace(/\/$/, '');
  const origin = (await headers()).get('origin');
  return origin ?? 'http://localhost:3000';
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();
  const origin = await getSiteOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (data?.url) {
    redirect(data.url);
  }

  // Defensive: provider returned neither URL nor error.
  redirect(`/login?error=${encodeURIComponent('oauth_no_url')}`);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
