import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'reimagine')

export default function ZhReimaginePage() {
  return <><PageStructuredData locale="zh" page="reimagine" /><App /></>
}
