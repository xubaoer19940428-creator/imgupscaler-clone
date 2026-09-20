'use client'

import { useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import zhMessages from '../messages/zh.json'
import enMessages from '../messages/en.json'
import { useLocaleStore } from '../src/lib/locale'

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((state) => state.locale)
  const hydrate = useLocaleStore((state) => state.hydrate)
  const isChinese = locale === 'zh'

  useEffect(() => { hydrate() }, [hydrate])
  useEffect(() => {
    document.documentElement.lang = isChinese ? 'zh-CN' : 'en'
    document.title = isChinese ? 'AI 图片放大工具 — Img.Upscaler' : 'AI Image Upscaler — Img.Upscaler'
  }, [isChinese])
  return <NextIntlClientProvider locale={locale} messages={isChinese ? zhMessages : enMessages}>{children}</NextIntlClientProvider>
}
