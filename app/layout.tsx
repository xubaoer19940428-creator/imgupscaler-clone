import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import '../src/styles.css'
import { IntlProvider } from './intl-provider'
import messages from '../messages/zh.json'

export const metadata: Metadata = {
  title: 'AI 图片放大工具 — Img.Upscaler',
  description: '使用 AI 在线放大图片、增强细节并下载更清晰的高分辨率结果。',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><NextIntlClientProvider locale="zh" messages={messages}><IntlProvider>{children}</IntlProvider></NextIntlClientProvider></body>
    </html>
  )
}
