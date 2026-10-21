import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'en'
  const safeLocale = locale === 'en' ? 'en' : 'zh'
  return { locale: safeLocale, timeZone: 'Asia/Hong_Kong', messages: (await import(`../messages/${safeLocale}.json`)).default }
})
