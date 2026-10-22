import type { MetadataRoute } from 'next'
import { LOCALES } from '@/src/lib/locale'
import { pagePath } from '@/src/lib/locale-routing'
import { SITE_INDEXABLE, absoluteUrl } from '@/src/lib/site-config'
import { SEO_PAGE_PATHS, languageAlternates } from '@/src/lib/seo'
import { pageImages } from '@/src/lib/seo-images'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_INDEXABLE) return []
  const { account, root, ...publicPages } = SEO_PAGE_PATHS
  return Object.entries(publicPages).flatMap(([page, path]) => LOCALES.map((locale) => ({
    url: absoluteUrl(pagePath(path, locale)),
    alternates: { languages: languageAlternates(path) },
    ...(pageImages(page).length ? { images: pageImages(page).map(absoluteUrl) } : {}),
  })))
}
