import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'cookies')

export default function CookiesPage() {
  return <><PageStructuredData locale="en" page="cookies" /><LegalPage locale="en" page="cookies" /></>
}
