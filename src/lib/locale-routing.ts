import type { Route } from './types'
import { isRouteVisible } from './constants'

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
export function routeToPath(route: Route): string {
  return route === 'home' ? '/' : `/${route}`
}

/** Build a language-neutral path while preserving an existing query string. */
export function pagePath(pathname: string, search = ''): string {
  return `${stripLegacyLocalePrefix(pathname)}${search}`
}

