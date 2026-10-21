import { LegalPage } from '../../../src/components/site/legal-page'
import { pageMetadata } from '../../../src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'privacy')

export default function PrivacyPolicyPage() {
  return <LegalPage locale="zh" page="privacy-policy" />
}
