import { AccountPage as AccountShell } from '../../../src/components/site/account-page'
import { pageMetadata } from '../../../src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'account')

export default function AccountRoute() {
  return <AccountShell locale="zh" />
}
