'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import zhMessages from '../messages/zh.json'
import enMessages from '../messages/en.json'
import { localeFromPathname } from '../src/lib/locale'

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const isChinese = locale === 'zh'

  useEffect(() => {
    document.documentElement.lang = isChinese ? 'zh-CN' : 'en'
  }, [isChinese])
  return <NextIntlClientProvider locale={locale} timeZone="Asia/Hong_Kong" messages={isChinese ? zhMessages : enMessages}>{children}</NextIntlClientProvider>
}
