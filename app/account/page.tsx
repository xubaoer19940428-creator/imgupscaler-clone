import type { Metadata } from 'next'
import { AccountPage } from '../../src/components/site/account-page'

export const metadata: Metadata = { title: 'Account — Img.Upscaler' }

export default function EnglishAccountPage() {
  return <AccountPage locale="en" />
}
