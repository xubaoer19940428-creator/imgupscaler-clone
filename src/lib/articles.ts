import 'server-only'

import { cache } from 'react'
import { API_BASE_URL, ApiError, createSignature, type QueryParams } from './api/request'
import { SITE_URL } from './site-config'
import type { Locale } from './locale'

export type ArticleSummary = {
  slug: string
  title: string
  summary: string
  cover: string
  tags: string
  author: string
  views: number
  locale: string
  published_at: number
  updated_at: number
}

export type Article = ArticleSummary & { content: string }
export type ArticleList = { list: ArticleSummary[]; total: number; page: number; page_size: number }
export const ARTICLE_PAGE_SIZE = 12
export const validArticleSlug = (slug: string) => /^[a-z0-9][a-z0-9-]*$/.test(slug)

async function articleRequest<T>(path: string, locale: Locale, params: QueryParams = {}): Promise<T> {
  const domain = process.env.NEXT_PUBLIC_ACCEPT_DOMAIN
    || (['localhost', '127.0.0.1', '[::1]'].includes(SITE_URL.hostname) ? 'photoupscale.app' : SITE_URL.hostname)
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const url = new URL(`${API_BASE_URL}${path}`)
  const signature = createSignature(path, params, undefined, timestamp, nonce, domain)
  for (const [key, value] of Object.entries({ ...params, ts: timestamp, nn: nonce, sn: signature })) {
    if (value != null) url.searchParams.set(key, String(value))
  }
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'accept-domain': domain, lang: locale, 'accept-timezone': 'Asia/Hong_Kong' },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new ApiError(`Article API returned HTTP ${response.status}`, response.status, response.status)
  const body = await response.json() as { code: number; message: string; data: T }
  if (body.code !== 0) throw new ApiError(body.message || 'Article API failed', body.code, response.status)
  return body.data
}

export const getArticleTags = cache(async (locale: Locale): Promise<string[]> => {
  const data = await articleRequest<{ list: string[] }>('/articles/tags', locale)
  return [...new Set(data.list.filter((tag) => typeof tag === 'string' && tag.trim()))]
})

export const getArticles = cache((locale: Locale, page = 1, tag = '') =>
  articleRequest<ArticleList>('/articles', locale, { page, page_size: ARTICLE_PAGE_SIZE, ...(tag ? { tag } : {}) }))

// Metadata and page rendering share one read, so the API increments views once.
export const getArticle = cache(async (locale: Locale, slug: string): Promise<Article | null> => {
  if (!validArticleSlug(slug)) return null
  try {
    return await articleRequest<Article>(`/articles/${encodeURIComponent(slug)}`, locale)
  } catch (error) {
    if (error instanceof ApiError && error.code === 30001) return null
    throw error
  }
})

export function articleTags(tags: string): string[] {
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean)
}
