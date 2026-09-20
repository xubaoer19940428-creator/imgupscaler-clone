import type { Metadata } from 'next'
import '../src/styles.css'
import { IntlProvider } from './intl-provider'

export const metadata: Metadata = {
  title: 'Img.Upscaler',
  description: 'AI image upscaling and enhancement in the browser.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><IntlProvider>{children}</IntlProvider></body>
    </html>
  )
}
