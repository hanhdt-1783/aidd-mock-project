import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  dictionary,
  t,
  type TranslationKey,
} from './dictionary';

describe('language constants', () => {
  it('declares vi and en', () => {
    expect(LANGUAGES).toEqual(['vi', 'en']);
  });

  it('defaults to Vietnamese', () => {
    expect(DEFAULT_LANGUAGE).toBe('vi');
  });
});

describe('t()', () => {
  it('returns the Vietnamese translation for vi', () => {
    expect(t('vi', 'login.button.google')).toBe('ĐĂNG NHẬP Bằng Google');
  });

  it('returns the English translation for en', () => {
    expect(t('en', 'login.button.google')).toBe('LOGIN With Google');
  });

  it('returns distinct values per language for the same key', () => {
    expect(t('vi', 'home.nav.about')).not.toBe(t('en', 'home.nav.about'));
  });

  it('falls back to the key itself when the key is unknown', () => {
    const missing = 'does.not.exist' as TranslationKey;
    expect(t('vi', missing)).toBe('does.not.exist');
    expect(t('en', missing)).toBe('does.not.exist');
  });

  it('dispatches on the language argument for the same key', () => {
    // Distinct values per language prove t() honors `lang`, not just fallback.
    expect(t('vi', 'home.header.account.signout')).toBe('Logout');
    expect(t('en', 'home.header.account.signout')).toBe('Sign out');
  });
});

describe('dictionary key parity', () => {
  it('has identical key sets for vi and en', () => {
    const viKeys = Object.keys(dictionary.vi).sort();
    const enKeys = Object.keys(dictionary.en).sort();
    expect(enKeys).toEqual(viKeys);
  });

  it('has no empty translation values', () => {
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(dictionary[lang])) {
        expect(value, `${lang}.${key} should not be empty`).not.toBe('');
      }
    }
  });
});
