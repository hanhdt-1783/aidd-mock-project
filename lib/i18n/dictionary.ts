export type Language = 'vi' | 'en';

export const LANGUAGES: readonly Language[] = ['vi', 'en'] as const;
export const DEFAULT_LANGUAGE: Language = 'vi';
export const LANG_COOKIE = 'lang';

export const dictionary = {
  vi: {
    'login.welcome.line1': 'Bắt đầu hành trình của bạn cùng SAA 2025.',
    'login.welcome.line2': 'Đăng nhập để khám phá!',
    'login.button.google': 'Đăng nhập bằng Google',
    'login.button.loading': 'Đang đăng nhập…',
    'login.footer.copyright': 'Bản quyền thuộc về Sun* © 2025',
    'login.logo.alt': 'Sun* Annual Awards 2025',
    'login.error.oauth': 'Đăng nhập thất bại. Vui lòng thử lại.',
    'language.vi.label': 'VN',
    'language.en.label': 'EN',
  },
  en: {
    'login.welcome.line1': 'Start your journey with SAA 2025.',
    'login.welcome.line2': 'Log in to explore!',
    'login.button.google': 'Sign in with Google',
    'login.button.loading': 'Signing in…',
    'login.footer.copyright': 'Copyright © Sun* 2025',
    'login.logo.alt': 'Sun* Annual Awards 2025',
    'login.error.oauth': 'Login failed. Please try again.',
    'language.vi.label': 'VN',
    'language.en.label': 'EN',
  },
} as const satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof typeof dictionary['vi'];

export function t(lang: Language, key: TranslationKey): string {
  return dictionary[lang][key] ?? dictionary[DEFAULT_LANGUAGE][key] ?? key;
}
