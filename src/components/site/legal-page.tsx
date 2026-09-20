'use client'

import { useRouter } from 'next/navigation'
import type { Route } from '@/src/lib/types'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

type LegalSection = { title: string; body: string } | readonly [title: string, body: string]

/** Shared legal-page shell keeps policy pages consistent with the product shell. */
export function LegalPage({ locale, title, intro, sections }: { locale: 'zh' | 'en'; title: string; intro: string; sections: LegalSection[] }) {
  const router = useRouter()
  const prefix = locale === 'zh' ? '/zh' : ''
  const navigate = (route: Route) => router.push(`${prefix}${route === 'home' ? '/' : `/${route}`}`.replace(/\/\/$/, '/'))
  return <div className="app-shell"><SiteHeader onLogin={() => router.push(`${prefix}/account`)} onNavigate={navigate} /><main className="legal-page" id="main-content"><article className="legal-card"><a href={prefix || '/'} className="legal-back">← {locale === 'zh' ? '返回工作区' : 'Back to workspace'}</a><h1>{title}</h1><p className="legal-intro">{intro}</p>{sections.map((section) => { const sectionTitle = 'title' in section ? section.title : section[0]; const body = 'body' in section ? section.body : section[1]; return <section key={sectionTitle}><h2>{sectionTitle}</h2><p>{body}</p></section> })}</article></main><SiteFooter locale={locale} /></div>
}
