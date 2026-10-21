import { AccountPage } from '../../src/components/site/account-page'
import { pageMetadata } from '../../src/lib/site-metadata'

export const metadata = pageMetadata('en', 'account')

export default function AccountRoute() {
  return <AccountPage locale="en" />
}
