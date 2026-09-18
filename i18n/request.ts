import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || 'zh'
  const safeLocale = locale === 'en' ? 'en' : 'zh'
  return { locale: safeLocale, messages: (await import(`../messages/${safeLocale}.json`)).default }
})
