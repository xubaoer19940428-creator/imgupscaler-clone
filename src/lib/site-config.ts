// `photosharp.app` is the canonical production origin. The other domains are
// accepted as deployment aliases and are permanently redirected to it by
// `proxy.ts` to avoid duplicate indexable copies of every page.
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const SITE_URL = new URL(configuredSiteUrl)
export const SITE_ALIASES = [
  'photosharp.app',
  'photoupscale.app',
  'photopop.app',
] as const
export const SITE_INDEXABLE = Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  && !['localhost', '127.0.0.1', '[::1]'].includes(SITE_URL.hostname)

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}
