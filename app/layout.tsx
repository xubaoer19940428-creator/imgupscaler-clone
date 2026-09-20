import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import '../src/styles.css'
import { IntlProvider } from './intl-provider'
import messages from '../messages/zh.json'

export const metadata: Metadata = {
  title: 'Img.Upscaler',
  description: 'AI image upscaling and enhancement in the browser.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><NextIntlClientProvider locale="zh" messages={messages}><IntlProvider>{children}</IntlProvider></NextIntlClientProvider></body>
    </html>
  )
}
