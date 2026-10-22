import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'privacy')

export default function PrivacyPolicyPage() {
  return <><PageStructuredData locale="en" page="privacy" /><LegalPage locale="en" page="privacy-policy" /></>
}
