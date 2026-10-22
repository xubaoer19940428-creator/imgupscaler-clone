import { getRequestConfig } from 'next-intl/server'
import { isLocale, type Locale } from '../src/lib/locale'
import { loadMessages } from '../src/lib/messages'

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale
  const safeLocale: Locale = isLocale(requestedLocale) ? requestedLocale : 'en'
  return { locale: safeLocale, timeZone: 'Asia/Hong_Kong', messages: await loadMessages(safeLocale) }
})
