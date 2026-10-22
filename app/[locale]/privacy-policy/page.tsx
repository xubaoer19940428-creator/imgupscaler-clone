import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'privacy')
}

export default async function LocalePrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="privacy" /><LegalPage locale={locale} page="privacy-policy" /></>
}
