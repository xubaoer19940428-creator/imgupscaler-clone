# Routes
Next.js 16.4.2 App Router. (en) URLs have no prefix; zh and dynamic locale have language prefixes. 13 locales. Each locale uses its root layout and LocalizedRoot.
- `app/(en)/account/page.tsx`: import { AccountPage } from '@/src/components/site/account-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'account')

export default function AccountRoute() {
  return <AccountPage locale="en" />
}

- `app/(en)/cookies/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'cookies')

export default function CookiesPage() {
  return <><PageStructuredData locale="en" page="cookies" /><LegalPage locale="en" page="cookies" /></>
}

- `app/(en)/enhancer/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'enhancer')

export default function EnhancerPage() {
  return <><PageStructuredData locale="en" page="enhancer" /><App /></>
}

- `app/(en)/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'home')

export default function Page() {
  return <><PageStructuredData locale="en" page="home" /><App /></>
}

- `app/(en)/pricing/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'pricing')

export default function PricingPage() {
  return <><PageStructuredData locale="en" page="pricing" /><App /></>
}

- `app/(en)/privacy-policy/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'privacy')

export default function PrivacyPolicyPage() {
  return <><PageStructuredData locale="en" page="privacy" /><LegalPage locale="en" page="privacy-policy" /></>
}

- `app/(en)/reimagine/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'reimagine')

export default function ReimaginePage() {
  return <><PageStructuredData locale="en" page="reimagine" /><App /></>
}

- `app/(en)/terms/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('en', 'terms')

export default function TermsPage() {
  return <><PageStructuredData locale="en" page="terms" /><LegalPage locale="en" page="terms" /></>
}

- `app/[locale]/account/page.tsx`: import { AccountPage } from '@/src/components/site/account-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'account')
}

export default async function LocaleAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  return <AccountPage locale={await readLocale(params)} />
}

- `app/[locale]/cookies/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'cookies')
}

export default async function LocaleCookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="cookies" /><LegalPage locale={locale} page="cookies" /></>
}

- `app/[locale]/enhancer/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'enhancer')
}

export default async function LocaleEnhancerPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="enhancer" /><App /></>
}

- `app/[locale]/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'home')
}

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="home" /><App /></>
}

- `app/[locale]/pricing/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'pricing')
}

export default async function LocalePricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="pricing" /><App /></>
}

- `app/[locale]/privacy-policy/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'privacy')
}

export default async function LocalePrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="privacy" /><LegalPage locale={locale} page="privacy-policy" /></>
}

- `app/[locale]/reimagine/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'reimagine')
}

export default async function LocaleReimaginePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="reimagine" /><App /></>
}

- `app/[locale]/terms/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'terms')
}

export default async function LocaleTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await readLocale(params)
  return <><PageStructuredData locale={locale} page="terms" /><LegalPage locale={locale} page="terms" /></>
}

- `app/zh/account/page.tsx`: import { AccountPage as AccountShell } from '@/src/components/site/account-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'account')

export default function AccountRoute() {
  return <AccountShell locale="zh" />
}

- `app/zh/cookies/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'cookies')

export default function CookiesPage() {
  return <><PageStructuredData locale="zh" page="cookies" /><LegalPage locale="zh" page="cookies" /></>
}

- `app/zh/enhancer/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'enhancer')

export default function ZhEnhancerPage() {
  return <><PageStructuredData locale="zh" page="enhancer" /><App /></>
}

- `app/zh/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'home')

export default function ZhHomePage() {
  return <><PageStructuredData locale="zh" page="home" /><App /></>
}

- `app/zh/pricing/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'pricing')

export default function ZhPricingPage() {
  return <><PageStructuredData locale="zh" page="pricing" /><App /></>
}

- `app/zh/privacy-policy/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'privacy')

export default function PrivacyPolicyPage() {
  return <><PageStructuredData locale="zh" page="privacy" /><LegalPage locale="zh" page="privacy-policy" /></>
}

- `app/zh/reimagine/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import App from '@/src/App'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'reimagine')

export default function ZhReimaginePage() {
  return <><PageStructuredData locale="zh" page="reimagine" /><App /></>
}

- `app/zh/terms/page.tsx`: import { PageStructuredData } from '@/src/components/site/page-structured-data'
import { LegalPage } from '@/src/components/site/legal-page'
import { pageMetadata } from '@/src/lib/site-metadata'

export const metadata = pageMetadata('zh', 'terms')

export default function TermsPage() {
  return <><PageStructuredData locale="zh" page="terms" /><LegalPage locale="zh" page="terms" /></>
}
