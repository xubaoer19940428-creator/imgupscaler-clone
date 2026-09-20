import { create } from 'zustand'

/** Supported interface languages. Add future languages here and in messages/. */
export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'imgupscaler-locale'

type LocaleState = {
  locale: Locale
  hydrated: boolean
  setLocale: (locale: Locale) => void
  hydrate: () => void
}

function isLocale(value: string | null): value is Locale {
  return value === 'zh' || value === 'en'
}

/**
 * A URL-independent locale preference.
 *
 * Keeping the language outside the route means switching languages never
 * reloads or duplicates a page tree. The preference is persisted locally so
 * returning visitors keep their last selection.
 */
export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'zh',
  hydrated: false,
  setLocale: (locale) => {
    set({ locale, hydrated: true })
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, locale)
  },
  hydrate: () => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    set({ locale: isLocale(stored) ? stored : 'zh', hydrated: true })
  },
}))

