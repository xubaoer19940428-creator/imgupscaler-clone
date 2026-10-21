'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { localeFromPathname, type Locale } from '@/src/lib/locale'
import { pagePath } from '@/src/lib/locale-routing'

export function SiteFooter({ locale: providedLocale }: { locale?: Locale }) {
  const pathname = usePathname()
  const locale = providedLocale ?? localeFromPathname(pathname)
  const router = useRouter()
  const t = useTranslations('footer')
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const changeLanguage = (nextLocale: Locale) => {
    const query = typeof window === 'undefined' ? '' : window.location.search
    router.push(pagePath(pathname, nextLocale, query))
    setLanguageOpen(false)
  }
  useEffect(() => {
    if (!languageOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setLanguageOpen(false) }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageRef.current?.contains(event.target)) setLanguageOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [languageOpen])

  return <footer className="site-footer"><div className="site-footer-inner"><div className="footer-meta"><div className="footer-brand">Img.Upscaler</div><p>{t('copyright')}</p></div><div className="footer-links"><Link href={pagePath('/privacy-policy', locale)}>{t('privacy')}</Link><Link href={pagePath('/terms', locale)}>{t('terms')}</Link><Link href={pagePath('/cookies', locale)}>{t('cookies')}</Link><a href="https://imgupscaler.com/blog/" target="_blank" rel="noreferrer">{t('blog')}</a><a href="mailto:support@imgupscaler.com">{t('contact')}</a><div ref={languageRef} className="footer-language"><button type="button" className="footer-language-button" aria-haspopup="menu" aria-expanded={languageOpen} aria-label={t('switchLanguage')} onClick={() => setLanguageOpen((open) => !open)}><span>{t('currentLanguage')}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>{languageOpen && <div className="footer-language-menu" role="menu"><button type="button" role="menuitem" onClick={() => changeLanguage(locale === 'zh' ? 'en' : 'zh')}>{t('alternateLanguage')}</button></div>}</div></div></div></footer>
}
