import type { Metadata } from 'next'
import { LegalPage } from '../../src/components/site/legal-page'

export const metadata: Metadata = { title: 'Cookies — Img.Upscaler' }

export default function CookiesPage() {
  return <LegalPage locale="en" title="Cookies" intro="Cookies are small text files stored on your device. This page explains how cookies may support sign-in, preferences, analytics, and advertising, along with your choices." sections={[['1. Essential Cookies', 'Essential cookies keep sessions active, preserve security settings, and support core functionality. They generally cannot be disabled in our systems.'], ['2. Performance and Functional Cookies', 'Performance cookies help us understand how visitors use the service. Functional cookies remember language and other preferences.'], ['3. Third-Party Cookies', 'Analytics, advertising, payment, and authentication providers may set third-party cookies under their own privacy policies.'], ['4. Your Choices', 'You can delete or block cookies in your browser. Disabling required cookies may prevent sign-in, uploads, or checkout from working correctly.'], ['5. Contact', 'Questions about cookie usage can be sent to support@imgupscaler.com.']]} />
}
