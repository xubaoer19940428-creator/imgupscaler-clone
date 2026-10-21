'use client'

import { useMessages, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Route } from '@/src/lib/types'
import { pagePath, routeToPath } from '@/src/lib/locale-routing'
import type { Locale } from '@/src/lib/locale'
import { getLegalContent, type LegalPageId } from '@/src/lib/legal-content'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function LegalPage({ page, locale: providedLocale }: { page: LegalPageId; locale?: Locale }) {
  const router = useRouter()
  const runtimeLocale = useLocale() as Locale
  const locale = providedLocale ?? runtimeLocale
  const messages = useMessages() as { legal: { back: string } }
  const content = getLegalContent(messages, page)
  const navigate = (route: Route) => router.push(routeToPath(route, locale))
  return <div className="app-shell"><SiteHeader onLogin={() => router.push(pagePath('/account', locale))} onNavigate={navigate} /><main className="legal-page" id="main-content"><article className="legal-card"><a href={pagePath('/', locale)} className="legal-back">← {messages.legal.back}</a><h1>{content.title}</h1><p className="legal-intro">{content.intro}</p>{content.sections.map(([sectionTitle, body]) => <section key={sectionTitle}><h2>{sectionTitle}</h2><p>{body}</p></section>)}</article></main><SiteFooter locale={locale} /></div>
}
