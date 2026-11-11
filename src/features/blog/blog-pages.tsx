import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BlogShell } from './blog-shell'
import { actualLocale, blogHref, coverUrl, readBlogQuery } from './blog-metadata'
import { getArticle, getArticles, getArticleTags, articleTags, validArticleSlug } from '@/src/lib/articles'
import { renderArticleContent } from '@/src/lib/article-content'
import { pagePath } from '@/src/lib/locale-routing'
import { LANGUAGE_TAGS, type Locale } from '@/src/lib/locale'
import { SITE_INDEXABLE, absoluteUrl } from '@/src/lib/site-config'

export type BlogSearchParams = Promise<{ tag?: string | string[]; page?: string | string[] }>

function displayDate(timestamp: number, locale: Locale) {
  if (!timestamp || !Number.isFinite(timestamp)) return null
  return <time dateTime={new Date(timestamp * 1000).toISOString()}>
    {new Intl.DateTimeFormat(LANGUAGE_TAGS[locale], { dateStyle: 'medium', timeZone: 'UTC' }).format(timestamp * 1000)}
  </time>
}

export async function BlogIndex({ locale, searchParams }: { locale: Locale; searchParams: BlogSearchParams }) {
  const query = await searchParams
  const { tag, page } = readBlogQuery(query)
  const t = await getTranslations({ locale, namespace: 'blog' })
  const [tags, articles] = await Promise.all([getArticleTags(locale), getArticles(locale, page, tag)])
  if (page > 1 && !articles.list.length) notFound()
  const pageCount = Math.max(1, Math.ceil(articles.total / articles.page_size))
  const categories = tag && !tags.includes(tag) ? [...tags, tag] : tags

  return <BlogShell>
    <header className="blog-heading"><h1>{t('title')}</h1><p>{t('description')}</p></header>
    <nav className="blog-categories" aria-label={t('categories')}>
      <Link href={blogHref(locale)} prefetch={false} aria-current={!tag ? 'page' : undefined}>{t('all')}</Link>
      {categories.map((category) => <Link key={category} href={blogHref(locale, category)} prefetch={false}
        aria-current={tag === category ? 'page' : undefined}>{category}</Link>)}
    </nav>
    {articles.list.length ? <div className="blog-grid">
      {articles.list.map((article) => {
        const image = coverUrl(article.cover)
        const href = pagePath(`/blog/${encodeURIComponent(article.slug)}`, locale)
        return <article key={article.slug} className="blog-card" lang={article.locale}>
          {image && <Link href={href} prefetch={false} tabIndex={-1} aria-hidden="true" className="blog-cover-link">
            <img src={image} alt="" width="720" height="450" loading="lazy" className="blog-cover" />
          </Link>}
          <div className="blog-card-body">
            <div className="blog-meta">{displayDate(article.published_at, locale)}{article.author && <span>{article.author}</span>}</div>
            <h2><Link href={href} prefetch={false}>{article.title}</Link></h2>
            {article.summary && <p>{article.summary}</p>}
            <div className="blog-card-tags">{articleTags(article.tags).map((category) =>
              <Link key={category} href={blogHref(locale, category)} prefetch={false}>{category}</Link>)}</div>
            <Link className="blog-read" href={href} prefetch={false}>{t('readArticle')} <span aria-hidden="true">↗</span></Link>
          </div>
        </article>
      })}
    </div> : <p className="blog-empty">{t('empty')}</p>}
    {pageCount > 1 && <nav className="blog-pagination" aria-label={t('pagination', { page, pages: pageCount })}>
      {page > 1 && <Link href={blogHref(locale, tag, page - 1)} prefetch={false} rel="prev">{t('previous')}</Link>}
      <span>{t('pagination', { page, pages: pageCount })}</span>
      {page < pageCount && <Link href={blogHref(locale, tag, page + 1)} prefetch={false} rel="next">{t('next')}</Link>}
    </nav>}
  </BlogShell>
}

export async function BlogArticle({ locale, slug }: { locale: Locale; slug: string }) {
  const article = await getArticle(locale, slug)
  if (!article || !validArticleSlug(slug)) notFound()
  const t = await getTranslations({ locale, namespace: 'blog' })
  const image = coverUrl(article.cover)
  const contentLocale = actualLocale(article.locale, locale)
  const url = absoluteUrl(pagePath(`/blog/${encodeURIComponent(slug)}`, contentLocale))
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    '@id': `${url}#article`, url, mainEntityOfPage: url,
    headline: article.title, description: article.summary, inLanguage: article.locale,
    ...(image ? { image: [image] } : {}),
    ...(article.author ? { author: { '@type': 'Person', name: article.author } } : {}),
    ...(article.published_at > 0 ? { datePublished: new Date(article.published_at * 1000).toISOString() } : {}),
    ...(article.updated_at > 0 ? { dateModified: new Date(article.updated_at * 1000).toISOString() } : {}),
    publisher: { '@type': 'Organization', name: 'PhotoUpscale', url: absoluteUrl('/') },
  }
  return <BlogShell>
    <Link className="blog-back" href={blogHref(locale)}>{t('back')}</Link>
    <article className="blog-detail" lang={article.locale}>
      <header className="blog-article-heading">
        <div className="blog-card-tags">{articleTags(article.tags).map((tag) =>
          <Link key={tag} href={blogHref(locale, tag)} prefetch={false}>{tag}</Link>)}</div>
        <h1>{article.title}</h1>
        <div className="blog-meta">{article.author && <span>{article.author}</span>}{displayDate(article.published_at, locale)}</div>
        {article.summary && <p>{article.summary}</p>}
      </header>
      {image && <img src={image} alt={article.title} width="1200" height="750" className="blog-article-cover" />}
      <div className="blog-prose" dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }} />
    </article>
    {SITE_INDEXABLE && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />}
  </BlogShell>
}
