import type { Metadata } from 'next'
import deMessages from '../../messages/de.json'
import arMessages from '../../messages/ar.json'
import enMessages from '../../messages/en.json'
import esMessages from '../../messages/es.json'
import frMessages from '../../messages/fr.json'
import itMessages from '../../messages/it.json'
import jaMessages from '../../messages/ja.json'
import koMessages from '../../messages/ko.json'
import nlMessages from '../../messages/nl.json'
import ptBRMessages from '../../messages/pt-BR.json'
import ruMessages from '../../messages/ru.json'
import trMessages from '../../messages/tr.json'
import zhMessages from '../../messages/zh.json'
import type { Locale } from './locale'
import { pagePath } from './locale-routing'
import { SITE_INDEXABLE, SITE_URL, absoluteUrl } from './site-config'
import { SEO_PAGE_PATHS, languageAlternates } from './seo'
import { pageImages } from './seo-images'

export type MetadataPage = keyof typeof enMessages.metadata

const messages = { en: enMessages, zh: zhMessages, ja: jaMessages, ko: koMessages, es: esMessages, fr: frMessages, de: deMessages, 'pt-BR': ptBRMessages, it: itMessages, ru: ruMessages, ar: arMessages, tr: trMessages, nl: nlMessages }

export function pageCopy(locale: Locale, page: MetadataPage) {
  return messages[locale].metadata[page]
}

export function pageMetadata(locale: Locale, page: MetadataPage): Metadata {
  const { title, description } = pageCopy(locale, page)
  const path = SEO_PAGE_PATHS[page]
  const url = absoluteUrl(pagePath(path, locale))
  const publicPage = page !== 'account'
  const image = absoluteUrl(pageImages(page)[0] ?? '/reference/youtube-thumbnail.jpeg')

  return {
    metadataBase: SITE_URL,
    title,
    description,
    alternates: {
      canonical: url,
      ...(publicPage ? { languages: languageAlternates(path) } : {}),
    },
    robots: { index: SITE_INDEXABLE && publicPage, follow: true, ...(publicPage ? { 'max-image-preview': 'large' as const } : {}) },
    openGraph: {
      type: 'website', siteName: 'Photosharp', title, description, url,
      images: [{ url: image, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
