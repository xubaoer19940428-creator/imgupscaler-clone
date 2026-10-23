import type { Metadata } from 'next'
import { SSOCallbackPage } from '@/src/components/site/sso-callback'

export const metadata: Metadata = {
  title: '授权登录',
  robots: { index: false, follow: false },
}

export function generateStaticParams() {
  return [
    { provider: 'google' },
    { provider: 'facebook' },
    { provider: 'github' },
  ]
}

export default function ZhSSORoute() {
  return <SSOCallbackPage locale="zh" />
}
