// Set this to the deployment's own public origin before enabling indexing.
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
export const SITE_INDEXABLE = Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  && !['localhost', '127.0.0.1', '[::1]'].includes(SITE_URL.hostname)

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href
}
