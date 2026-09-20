import type { Metadata } from 'next'
import { AccountPage as AccountPanelPage } from '../../../src/components/site/account-page'

export const metadata: Metadata = { title: '账户 — Img.Upscaler' }

export default function AccountPage() {
  return <AccountPanelPage locale="zh" />
}
