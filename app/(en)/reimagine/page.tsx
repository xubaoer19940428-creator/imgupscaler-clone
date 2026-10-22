import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'reimagine')

export default function ReimaginePage() {
  return <><PageStructuredData locale="en" page="reimagine" /><App /></>
}
