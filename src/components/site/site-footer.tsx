'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { useLocaleStore, type Locale } from '@/src/lib/locale'

const footerCopy: Record<Locale, { privacy: string; terms: string; cookies: string; blog: string; contact: string; switchLanguage: string; currentLanguage: string; alternateLanguage: string; copyright: string }> = {
  zh: { privacy: '隐私政策', terms: '服务条款', cookies: 'Cookie 政策', blog: '博客', contact: '联系', switchLanguage: '切换语言', currentLanguage: '中文简体', alternateLanguage: 'English', copyright: '© 2026 ImgUpscaler。保留所有权利。' },
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service', cookies: 'Cookies', blog: 'Blog', contact: 'Contact', switchLanguage: 'Switch language', currentLanguage: 'English', alternateLanguage: '简体中文', copyright: '© 2026 ImgUpscaler. All rights reserved.' },
}

export function SiteFooter({ locale: providedLocale }: { locale?: Locale }) {
  const locale = (providedLocale ?? useLocale()) as Locale
  const setLocale = useLocaleStore((state) => state.setLocale)
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const copy = footerCopy[locale]
  const changeLanguage = (nextLocale: Locale) => {
    setLocale(nextLocale)
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

  return <footer className="site-footer"><div className="site-footer-inner"><div className="footer-meta"><div className="footer-brand">Img.Upscaler</div><p>{copy.copyright}</p></div><div className="footer-links"><Link href="/privacy-policy">{copy.privacy}</Link><Link href="/terms">{copy.terms}</Link><Link href="/cookies">{copy.cookies}</Link><a href="https://imgupscaler.com/blog/" target="_blank" rel="noreferrer">{copy.blog}</a><a href="mailto:support@imgupscaler.com">{copy.contact}</a><div ref={languageRef} className="footer-language"><button type="button" className="footer-language-button" aria-haspopup="menu" aria-expanded={languageOpen} aria-label={copy.switchLanguage} onClick={() => setLanguageOpen((open) => !open)}><span>{copy.currentLanguage}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>{languageOpen && <div className="footer-language-menu" role="menu"><button type="button" role="menuitem" onClick={() => changeLanguage(locale === 'zh' ? 'en' : 'zh')}>{copy.alternateLanguage}</button></div>}</div></div></div></footer>
}
