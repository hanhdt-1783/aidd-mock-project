import { cookies } from 'next/headers';
import { DEFAULT_LANGUAGE, LANG_COOKIE, LANGUAGES, type Language } from './dictionary';

export async function getLang(): Promise<Language> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LANG_COOKIE)?.value;
  return (LANGUAGES as readonly string[]).includes(raw ?? '')
    ? (raw as Language)
    : DEFAULT_LANGUAGE;
}
