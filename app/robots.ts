import type { MetadataRoute } from 'next'
import { SITE_INDEXABLE, absoluteUrl } from '@/src/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', ...(SITE_INDEXABLE ? { allow: '/' } : { disallow: '/' }) },
    ...(SITE_INDEXABLE ? { sitemap: absoluteUrl('/sitemap.xml') } : {}),
  }
}
