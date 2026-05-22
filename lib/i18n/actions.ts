'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LANG_COOKIE, LANGUAGES, type Language } from './dictionary';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLanguage(lang: Language): Promise<void> {
  if (!(LANGUAGES as readonly string[]).includes(lang)) {
    throw new Error(`Invalid language: ${lang}`);
  }
  const cookieStore = await cookies();
  cookieStore.set(LANG_COOKIE, lang, {
    maxAge: ONE_YEAR,
    sameSite: 'lax',
    path: '/',
  });
  revalidatePath('/', 'layout');
}
