import fs from 'fs';
import path from 'path';
import type { GoTrueSession } from './supabase-admin';

/** Max byte length of a single @supabase/ssr cookie chunk. */
const MAX_CHUNK_SIZE = 3180;

/**
 * Derive the @supabase/ssr cookie name from the Supabase URL.
 * Formula: sb-{firstLabel}-auth-token
 * e.g. http://127.0.0.1:54321 → "sb-127-auth-token"
 */
export function cookieName(supabaseUrl: string): string {
  const hostname = new URL(supabaseUrl).hostname;
  const firstLabel = hostname.split('.')[0];
  return `sb-${firstLabel}-auth-token`;
}

/**
 * Encode a GoTrue session into the @supabase/ssr cookie value format:
 *   "base64-" + base64url(JSON.stringify(session))
 */
export function encodeSession(session: GoTrueSession): string {
  const json = JSON.stringify(session);
  // base64url: standard base64 without padding, with +→- and /→_
  const b64 = Buffer.from(json, 'utf8').toString('base64url');
  return `base64-${b64}`;
}

interface PlaywrightCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Lax' | 'Strict' | 'None';
}

interface StorageState {
  cookies: PlaywrightCookie[];
  origins: unknown[];
}

/**
 * Split an encoded value into @supabase/ssr chunks if it exceeds MAX_CHUNK_SIZE.
 * Each chunk gets name "{baseName}.{index}" to match combineChunks().
 * Current sessions (~2543 chars) fit in a single cookie — this is a defensive guard.
 */
function buildCookies(name: string, value: string): PlaywrightCookie[] {
  const base: Omit<PlaywrightCookie, 'name' | 'value'> = {
    domain: 'localhost',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  };

  if (value.length <= MAX_CHUNK_SIZE) {
    return [{ name, value, ...base }];
  }

  // Chunk into MAX_CHUNK_SIZE slices, named {name}.0, {name}.1, ...
  const chunks: PlaywrightCookie[] = [];
  let i = 0;
  let offset = 0;
  while (offset < value.length) {
    chunks.push({
      name: `${name}.${i}`,
      value: value.slice(offset, offset + MAX_CHUNK_SIZE),
      ...base,
    });
    offset += MAX_CHUNK_SIZE;
    i++;
  }
  return chunks;
}

/**
 * Build a Playwright storageState from a GoTrue session and write it to disk.
 * The caller (global.setup.ts) passes AUTH_FILE as the target path.
 */
export function writeStorageState(
  session: GoTrueSession,
  supabaseUrl: string,
  authFile: string,
): void {
  const name = cookieName(supabaseUrl);
  const value = encodeSession(session);
  const cookies = buildCookies(name, value);

  const state: StorageState = { cookies, origins: [] };

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  fs.writeFileSync(authFile, JSON.stringify(state, null, 2), 'utf8');
}
