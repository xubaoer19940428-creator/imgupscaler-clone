import { LANGUAGE_TAGS, LOCALES } from './locale'
import { pagePath } from './locale-routing'
import { absoluteUrl } from './site-config'

export const SEO_PAGE_PATHS = {
  home: '/', enhancer: '/enhancer', reimagine: '/reimagine', pricing: '/pricing',
  privacy: '/privacy-policy', terms: '/terms', cookies: '/cookies', account: '/account', root: '/',
} as const

export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [LANGUAGE_TAGS[locale], absoluteUrl(pagePath(path, locale))])),
    'x-default': absoluteUrl(path),
  }
}
