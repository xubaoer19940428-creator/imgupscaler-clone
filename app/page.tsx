import App from '../src/App'
import { pageMetadata } from '../src/lib/site-metadata'

export const metadata = pageMetadata('en', 'home')

export default function Page() {
  return <App />
}
