import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticle } from '@/src/lib/articles'
import { isLocale, type Locale } from '@/src/lib/locale'
import { loadMessages } from '@/src/lib/messages'
import { pagePath } from '@/src/lib/locale-routing'
import { SITE_INDEXABLE, SITE_URL, absoluteUrl } from '@/src/lib/site-config'
import { languageAlternates } from '@/src/lib/seo'

export function blogHref(locale: Locale, tag = '', page = 1): string {
  const query = new URLSearchParams()
  if (tag) query.set('tag', tag)
  if (page > 1) query.set('page', String(page))
  return pagePath('/blog', locale, query.size ? `?${query}` : '')
}

export function coverUrl(cover: string): string | undefined {
  if (!cover?.trim()) return undefined
  try {
    const url = new URL(cover, SITE_URL)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

export function actualLocale(value: string, requested: Locale): Locale {
  if (value.toLowerCase().startsWith('zh')) return 'zh'
  return isLocale(value) ? value : requested
}

export type BlogQuery = { tag?: string | string[]; page?: string | string[] }

export function readBlogQuery(query: BlogQuery) {
  const tag = typeof query.tag === 'string' ? query.tag : ''
  const value = typeof query.page === 'string' ? Number(query.page) : 1
  return { tag, page: Number.isSafeInteger(value) && value > 0 ? value : 1 }
}

export async function blogMetadata(locale: Locale, slug?: string, query: BlogQuery = {}): Promise<Metadata> {
  const messages = await loadMessages(locale)
  const copy = messages.blog as { title: string; description: string }
  const article = slug === undefined ? null : await getArticle(locale, slug)
  if (slug !== undefined && !article) notFound()
  const contentLocale = article ? actualLocale(article.locale, locale) : locale
  const { tag, page } = readBlogQuery(query)
  const filtered = !article && Boolean(tag || page > 1)
  const url = article
    ? absoluteUrl(pagePath(`/blog/${encodeURIComponent(article.slug)}`, contentLocale))
    : absoluteUrl(blogHref(locale, tag, page))
  const title = `${article?.title || copy.title} | PhotoUpscale`
  const description = article?.summary || copy.description
  const image = article ? coverUrl(article.cover) : undefined
  return {
    metadataBase: SITE_URL, title, description,
    alternates: { canonical: url, ...(!article && !filtered ? { languages: languageAlternates('/blog') } : {}) },
    robots: { index: SITE_INDEXABLE && !filtered, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: article ? 'article' : 'website', title, description, url, siteName: 'PhotoUpscale',
      ...(image ? { images: [{ url: image, alt: article?.title }] } : {}),
      ...(article ? {
        ...(article.published_at > 0 ? { publishedTime: new Date(article.published_at * 1000).toISOString() } : {}),
        ...(article.updated_at > 0 ? { modifiedTime: new Date(article.updated_at * 1000).toISOString() } : {}),
        ...(article.author ? { authors: [article.author] } : {}),
      } : {}),
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, ...(image ? { images: [image] } : {}) },
  }
}
