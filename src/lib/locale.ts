/** Supported interface languages. Keep this list in sync with messages/. */
export const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt-BR', 'it', 'ru', 'ar', 'tr', 'nl'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE = 'en' satisfies Locale
export const NON_DEFAULT_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE)

export const LANGUAGE_TAGS: Record<Locale, string> = {
  en: 'en', zh: 'zh-CN', ja: 'ja', ko: 'ko', es: 'es', fr: 'fr', de: 'de',
  'pt-BR': 'pt-BR', it: 'it', ru: 'ru', ar: 'ar', tr: 'tr', nl: 'nl',
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value != null && (LOCALES as readonly string[]).includes(value)
}

/** URL is the single source of truth for language selection. */
export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split(/[/?#]/, 3)[1]
  return isLocale(segment) ? segment : DEFAULT_LOCALE
}

