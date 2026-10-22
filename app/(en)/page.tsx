import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'home')

export default function Page() {
  return <><PageStructuredData locale="en" page="home" /><App /></>
}
