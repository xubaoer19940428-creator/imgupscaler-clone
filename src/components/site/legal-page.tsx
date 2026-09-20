'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import type { Route } from '@/src/lib/types'
import { routeToPath } from '@/src/lib/locale-routing'
import type { Locale } from '@/src/lib/locale'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

type LegalSection = { title: string; body: string } | readonly [title: string, body: string]

/** Shared legal-page shell keeps policy pages consistent with the product shell. */
export function LegalPage({ locale: providedLocale, title, intro, sections }: { locale?: Locale; title?: string; intro?: string; sections?: LegalSection[] }) {
  const router = useRouter()
  const locale = (providedLocale ?? useLocale()) as Locale
  const navigate = (route: Route) => router.push(routeToPath(route))
  const content = { title: title ?? '', intro: intro ?? '', sections: sections ?? [] }
  return <div className="app-shell"><SiteHeader onLogin={() => router.push('/account')} onNavigate={navigate} /><main className="legal-page" id="main-content"><article className="legal-card"><a href="/" className="legal-back">← {locale === 'zh' ? '返回工作区' : 'Back to workspace'}</a><h1>{content.title}</h1><p className="legal-intro">{content.intro}</p>{content.sections.map((section) => { const sectionTitle = 'title' in section ? section.title : section[0]; const body = 'body' in section ? section.body : section[1]; return <section key={sectionTitle}><h2>{sectionTitle}</h2><p>{body}</p></section> })}</article></main><SiteFooter locale={locale} /></div>
}
