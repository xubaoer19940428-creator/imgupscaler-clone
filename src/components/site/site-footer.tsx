'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type Locale = 'zh' | 'en'

const footerCopy: Record<Locale, { privacy: string; terms: string; blog: string; contact: string; copyright: string; switchLanguage: string; alternateLanguage: string }> = {
  zh: { privacy: '隐私政策', terms: '服务条款', blog: '博客', contact: '联系', copyright: '© 2026 ImgUpscaler。保留所有权利。', switchLanguage: '切换语言', alternateLanguage: 'English' },
  en: { privacy: 'Privacy Policy', terms: 'Terms of Service', blog: 'Blog', contact: 'Contact', copyright: '© 2026 ImgUpscaler. All rights reserved.', switchLanguage: 'Switch language', alternateLanguage: '简体中文' },
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const [languageOpen, setLanguageOpen] = useState(false)
  const prefix = locale === 'zh' ? '/zh' : ''
  const alternatePath = locale === 'zh' ? pathname.replace(/^\/zh(?=\/|$)/, '') || '/' : `/zh${pathname === '/' ? '' : pathname}`
  const copy = footerCopy[locale]
  return <footer className="site-footer"><div className="site-footer-inner"><div className="footer-brand">Img.Upscaler</div><p>{copy.copyright}</p><div className="footer-links"><Link href={`${prefix}/privacy-policy`}>{copy.privacy}</Link><Link href={`${prefix}/terms`}>{copy.terms}</Link><Link href={`${prefix}/cookies`}>{locale === 'zh' ? 'Cookie 政策' : 'Cookies'}</Link><a href="https://imgupscaler.com/blog/" target="_blank" rel="noreferrer">{copy.blog}</a><a href="mailto:support@imgupscaler.com">{copy.contact}</a><span className="language-switcher"><button type="button" aria-haspopup="menu" aria-expanded={languageOpen} onClick={() => setLanguageOpen((open) => !open)}>{copy.switchLanguage}</button>{languageOpen && <span className="language-menu" role="menu"><Link role="menuitem" href={alternatePath} onClick={() => setLanguageOpen(false)}>{copy.alternateLanguage}</Link></span>}</span></div></div></footer>
}
