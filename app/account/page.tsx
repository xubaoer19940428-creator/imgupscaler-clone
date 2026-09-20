import type { Metadata } from 'next'
import { AccountPage } from '../../src/components/site/account-page'

export const metadata: Metadata = { title: 'Account — Img.Upscaler' }

export default function AccountRoute() {
  return <AccountPage />
}
