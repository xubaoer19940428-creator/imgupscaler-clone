import { LegalPage } from '../../src/components/site/legal-page'
import { pageMetadata } from '../../src/lib/site-metadata'

export const metadata = pageMetadata('en', 'terms')

export default function TermsPage() {
  return <LegalPage locale="en" page="terms" />
}
