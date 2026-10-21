import type { Metadata } from 'next'
import enMessages from '../../messages/en.json'
import zhMessages from '../../messages/zh.json'
import type { Locale } from './locale'

type MetadataPage = keyof typeof enMessages.metadata

export function pageMetadata(locale: Locale, page: MetadataPage): Metadata {
  return (locale === 'zh' ? zhMessages.metadata : enMessages.metadata)[page] as Metadata
}
