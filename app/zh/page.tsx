import App from '../../src/App'
import { pageMetadata } from '../../src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'home')

export default function ZhHomePage() {
  return <App />
}
