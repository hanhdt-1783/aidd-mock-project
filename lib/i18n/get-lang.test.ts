import { beforeEach, describe, expect, it, vi } from 'vitest';

// getLang() reads the `lang` cookie via next/headers. Mock the async cookies()
// store so we can drive the validation branches without a Next.js runtime.
const getCookie = vi.fn();
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: getCookie }),
}));

import { getLang } from './get-lang';
import { LANG_COOKIE } from './dictionary';

describe('getLang', () => {
  beforeEach(() => {
    getCookie.mockReset();
  });

  it('reads the language from the lang cookie', () => {
    getCookie.mockReturnValue({ value: 'en' });
    return expect(getLang()).resolves.toBe('en');
  });

  it('accepts vi as a valid language', () => {
    getCookie.mockReturnValue({ value: 'vi' });
    return expect(getLang()).resolves.toBe('vi');
  });

  it('falls back to the default when the cookie is absent', () => {
    getCookie.mockReturnValue(undefined);
    return expect(getLang()).resolves.toBe('vi');
  });

  it('falls back to the default for an unsupported cookie value', () => {
    getCookie.mockReturnValue({ value: 'fr' });
    return expect(getLang()).resolves.toBe('vi');
  });

  it('queries the correct cookie name', async () => {
    getCookie.mockReturnValue({ value: 'en' });
    await getLang();
    expect(getCookie).toHaveBeenCalledWith(LANG_COOKIE);
  });
});
