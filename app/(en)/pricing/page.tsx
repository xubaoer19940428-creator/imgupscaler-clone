import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'pricing')

export default function PricingPage() {
  return <><PageStructuredData locale="en" page="pricing" /><App /></>
}
