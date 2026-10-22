import type { AbstractIntlMessages } from 'next-intl'
import type { Locale } from './locale'

export async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  return (await import(`../../messages/${locale}.json`)).default
}
