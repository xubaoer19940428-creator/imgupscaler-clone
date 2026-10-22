'use client'

import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import type { Locale } from '@/src/lib/locale'

export function IntlProvider({ children, locale, messages }: {
  children: React.ReactNode
  locale: Locale
  messages: AbstractIntlMessages
}) {
  return <NextIntlClientProvider locale={locale} timeZone="Asia/Hong_Kong" messages={messages}>{children}</NextIntlClientProvider>
}
