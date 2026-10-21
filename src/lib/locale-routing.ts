import type { Route } from './types'
import { isRouteVisible } from './constants'
import type { Locale } from './locale'

/** Remove legacy language prefixes without making them part of new links. */
export function stripLegacyLocalePrefix(pathname: string): string {
  return pathname.replace(/^\/(?:zh|en)(?=\/|$)/, '') || '/'
}

/** Convert a pathname to the application route used by the page shell. */
export function pathToRoute(pathname: string): Route {
  const path = stripLegacyLocalePrefix(pathname)
  if (path === '/enhancer' && isRouteVisible('enhancer')) return 'enhancer'
  if (path === '/reimagine' && isRouteVisible('reimagine')) return 'reimagine'
  if (path === '/pricing' && isRouteVisible('pricing')) return 'pricing'
  return 'home'
}

/** Build a stable, language-neutral application URL. */
export function routeToPath(route: Route, locale: Locale = 'en'): string {
  const path = route === 'home' ? '' : `/${route}`
  return locale === 'zh' ? `/zh${path || ''}` : path || '/'
}

/** Build a localized path while preserving an existing query string. */
export function pagePath(pathname: string, locale: Locale, search = ''): string {
  const path = stripLegacyLocalePrefix(pathname)
  const localized = locale === 'zh' ? `/zh${path === '/' ? '' : path}` : path
  return `${localized || '/'}${search}`
}

