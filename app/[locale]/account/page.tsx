import { AccountPage } from '@/src/components/site/account-page'
import { pageMetadata } from '@/src/lib/site-metadata'
import { readLocale } from '@/src/lib/route-locale'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return pageMetadata(await readLocale(params), 'account')
}

export default async function LocaleAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  return <AccountPage locale={await readLocale(params)} />
}
