import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'pricing')

export default function ZhPricingPage() {
  return <><PageStructuredData locale="zh" page="pricing" /><App /></>
}
