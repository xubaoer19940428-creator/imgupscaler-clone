import { LegalPage } from '../../../src/components/site/legal-page'
import { pageMetadata } from '../../../src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'terms')

export default function TermsPage() {
  return <LegalPage locale="zh" page="terms" />
}
