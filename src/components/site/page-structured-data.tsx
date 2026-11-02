import { LANGUAGE_TAGS, type Locale } from '@/src/lib/locale'
import { pagePath } from '@/src/lib/locale-routing'
import { landingCopy, pageCopy, type MetadataPage } from '@/src/lib/site-metadata'
import { SEO_PAGE_PATHS } from '@/src/lib/seo'
import { pageImages } from '@/src/lib/seo-images'
import { absoluteUrl, SITE_INDEXABLE } from '@/src/lib/site-config'

export function PageStructuredData({ locale, page }: { locale: Locale; page: MetadataPage }) {
  if (!SITE_INDEXABLE || page === 'account') return null
  const { title, description } = pageCopy(locale, page)
  const path = SEO_PAGE_PATHS[page]
  const url = absoluteUrl(pagePath(path, locale))
  const home = absoluteUrl(pagePath('/', locale))
  const image = pageImages(page)[0]
  const tool = page === 'home' || page === 'enhancer' || page === 'reimagine' ? page : null
  const content = landingCopy(locale)
  const application = tool ? {
    '@type': 'WebApplication', '@id': `${url}#application`,
    name: `${content.heroContent[tool].eyebrow} | Photosharp`,
    url, description: content.heroContent[tool].description,
    applicationCategory: 'MultimediaApplication', operatingSystem: 'Web browser',
    inLanguage: LANGUAGE_TAGS[locale],
    publisher: { '@id': absoluteUrl('/#organization') },
    featureList: content.featureCards[tool].map((feature) => feature.title),
    ...(image ? { image: absoluteUrl(image) } : {}),
  } : null
  const faq = tool ? {
    '@type': 'FAQPage', '@id': `${url}#faq`, url: `${url}#faq`,
    inLanguage: LANGUAGE_TAGS[locale], isPartOf: { '@id': `${url}#webpage` },
    mainEntity: content.faqs[tool].map(([question, answer], index) => ({
      '@type': 'Question', '@id': `${url}#faq-question-${index}`, name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  } : null
  const breadcrumb = path !== '/' ? {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Photosharp', item: home },
      { '@type': 'ListItem', position: 2, name: title.split(' | ')[0], item: url },
    ],
  } : null
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description,
        inLanguage: LANGUAGE_TAGS[locale], isPartOf: { '@id': `${home}#website` },
        publisher: { '@id': absoluteUrl('/#organization') },
        ...(application ? { mainEntity: { '@id': application['@id'] } } : {}),
        ...(faq ? { hasPart: { '@id': faq['@id'] } } : {}),
        ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: absoluteUrl(image) } } : {}),
        ...(breadcrumb ? { breadcrumb: { '@id': breadcrumb['@id'] } } : {}),
      },
      ...(breadcrumb ? [breadcrumb] : []),
      ...(application ? [application] : []),
      ...(faq ? [faq] : []),
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
}
