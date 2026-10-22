import { notFound } from 'next/navigation'
import { isLocale, type Locale } from './locale'

export async function readLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  if (!isLocale(locale) || locale === 'en' || locale === 'zh') notFound()
  return locale
}
