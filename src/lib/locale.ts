/** Supported interface languages. Add future languages here and in messages/. */
export type Locale = 'zh' | 'en'

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'zh' || value === 'en'
}

/** URL is the single source of truth for language selection. */
export function localeFromPathname(pathname: string): Locale {
  return /^\/zh(?:\/|$)/.test(pathname) ? 'zh' : DEFAULT_LOCALE
}

