'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import zhMessages from '../messages/zh.json'
import enMessages from '../messages/en.json'

/**
 * 项目沿用参考站的 /zh 与无前缀路径，而不是把 locale 放进动态段。
 * 因此在客户端根据 pathname 选择消息，保持现有路由结构不变。
 */
export function IntlProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isChinese = pathname.startsWith('/zh')
  useEffect(() => {
    document.documentElement.lang = isChinese ? 'zh-CN' : 'en'
    document.title = isChinese ? 'AI 图片放大工具 — Img.Upscaler' : 'AI Image Upscaler — Img.Upscaler'
  }, [isChinese])
  return <NextIntlClientProvider locale={isChinese ? 'zh' : 'en'} messages={isChinese ? zhMessages : enMessages}>{children}</NextIntlClientProvider>
}
