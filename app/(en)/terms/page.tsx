import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'terms')

export default function TermsPage() {
  return <><PageStructuredData locale="en" page="terms" /><LegalPage locale="en" page="terms" /></>
}
