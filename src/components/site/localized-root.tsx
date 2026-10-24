import '@/src/styles.css'
import localFont from 'next/font/local'
import { IntlProvider } from '@/app/intl-provider'
import { LANGUAGE_TAGS, type Locale } from '@/src/lib/locale'
import { loadMessages } from '@/src/lib/messages'
import { absoluteUrl, SITE_INDEXABLE } from '@/src/lib/site-config'
import { pagePath } from '@/src/lib/locale-routing'

const studioFont = localFont({
  src: '../../assets/fonts/instrument-sans-variable.ttf',
  variable: '--font-studio',
  weight: '400 700',
  display: 'swap',
  fallback: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
})

export async function LocalizedRoot({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const messages = await loadMessages(locale)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl(pagePath('/', locale))}#website`,
    name: 'Photosharp',
    url: absoluteUrl(pagePath('/', locale)),
    inLanguage: LANGUAGE_TAGS[locale],
  }

  return <html className={studioFont.variable} lang={LANGUAGE_TAGS[locale]} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <body>
      <IntlProvider locale={locale} messages={messages}>{children}</IntlProvider>
      {SITE_INDEXABLE && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />}
    </body>
  </html>
}
