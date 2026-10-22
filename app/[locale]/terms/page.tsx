import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'terms')
}

export default async function LocaleTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="terms" /><LegalPage locale={locale} page="terms" /></>
}
