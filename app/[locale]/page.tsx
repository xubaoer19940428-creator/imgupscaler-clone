import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'home')
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="home" /><App /></>
}
