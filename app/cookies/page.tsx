import { LegalPage } from '../../src/components/site/legal-page'
import { pageMetadata } from '../../src/lib/site-metadata'

export const metadata = pageMetadata('en', 'cookies')

export default function CookiesPage() {
  return <LegalPage locale="en" page="cookies" />
}
