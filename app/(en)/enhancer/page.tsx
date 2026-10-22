import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'enhancer')

export default function EnhancerPage() {
  return <><PageStructuredData locale="en" page="enhancer" /><App /></>
}
