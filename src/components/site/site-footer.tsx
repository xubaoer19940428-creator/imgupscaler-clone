'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type Locale = 'zh' | 'en'

const footerCopy: Record<Locale, { privacy: string; terms: string; blog: string; contact: string; switchLanguage: string; currentLanguage: string; alternateLanguage: string; copyright: string }> = {
  zh: { privacy: '隐私政策', terms: '服务条款', blog: '博客', contact: '联系', switchLanguage: '切换语言', currentLanguage: '中文简体', alternateLanguage: 'English', copyright: '© 2026 ImgUpscaler。保留所有权利。' },
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service', blog: 'Blog', contact: 'Contact', switchLanguage: 'Switch language', currentLanguage: 'English', alternateLanguage: '简体中文', copyright: '© 2026 ImgUpscaler. All rights reserved.' },
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const prefix = locale === 'zh' ? '/zh' : ''
  const alternatePath = locale === 'zh' ? pathname.replace(/^\/zh(?=\/|$)/, '') || '/' : `/zh${pathname === '/' ? '' : pathname}`
  const copy = footerCopy[locale]
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

  return <footer className="site-footer"><div className="site-footer-inner"><div className="footer-meta"><div className="footer-brand">Img.Upscaler</div><p>{copy.copyright}</p></div><div className="footer-links"><Link href={`${prefix}/privacy-policy`}>{copy.privacy}</Link><Link href={`${prefix}/terms`}>{copy.terms}</Link><Link href={`${prefix}/cookies`}>{locale === 'zh' ? 'Cookie 政策' : 'Cookies'}</Link><a href="https://imgupscaler.com/blog/" target="_blank" rel="noreferrer">{copy.blog}</a><a href="mailto:support@imgupscaler.com">{copy.contact}</a><div ref={languageRef} className="footer-language"><button type="button" className="footer-language-button" aria-haspopup="menu" aria-expanded={languageOpen} aria-label={copy.switchLanguage} onClick={() => setLanguageOpen((open) => !open)}><span>{copy.currentLanguage}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>{languageOpen && <div className="footer-language-menu" role="menu"><Link role="menuitem" href={alternatePath} onClick={() => setLanguageOpen(false)}>{copy.alternateLanguage}</Link></div>}</div></div></div></footer>
}
