import type { Metadata } from 'next'
import { SSOCallbackPage } from '@/src/components/site/sso-callback'

export const metadata: Metadata = {
  title: 'SSO Authentication',
  robots: { index: false, follow: false },
}

export function generateStaticParams() {
  return [
    { provider: 'google' },
    { provider: 'facebook' },
    { provider: 'github' },
  ]
}

export default function SSORoute() {
  return <SSOCallbackPage locale="en" />
}
