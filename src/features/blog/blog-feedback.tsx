'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { pagePath } from '@/src/lib/locale-routing'
import type { Locale } from '@/src/lib/locale'
import { BlogShell } from './blog-shell'

export function BlogError({ reset }: { reset: () => void }) {
  const t = useTranslations('blog')
  return <BlogShell><div className="blog-feedback" role="alert">
    <h1>{t('title')}</h1><p>{t('error')}</p>
    <button className="dark-button" onClick={reset}>{t('retry')}</button>
  </div></BlogShell>
}

export function BlogNotFound() {
  const t = useTranslations('blog')
  const locale = useLocale() as Locale
  return <BlogShell><div className="blog-feedback">
    <h1>{t('notFound')}</h1>
    <Link href={pagePath('/blog', locale)}>{t('back')}</Link>
  </div></BlogShell>
}
