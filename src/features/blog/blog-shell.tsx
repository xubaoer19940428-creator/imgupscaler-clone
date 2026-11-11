'use client'

import type { ReactNode } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Locale } from '@/src/lib/locale'
import { pagePath } from '@/src/lib/locale-routing'
import { SiteHeader } from '@/src/components/site/site-header'
import { SiteFooter } from '@/src/components/site/site-footer'

export function BlogShell({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale
  const router = useRouter()
  return <div className="app-shell">
    <SiteHeader onLogin={() => router.push(pagePath('/account', locale))} />
    <main id="main-content" className="blog-page">{children}</main>
    <SiteFooter locale={locale} />
  </div>
}
