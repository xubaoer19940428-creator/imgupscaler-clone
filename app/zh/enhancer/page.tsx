import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'enhancer')

export default function ZhEnhancerPage() {
  return <><PageStructuredData locale="zh" page="enhancer" /><App /></>
}
