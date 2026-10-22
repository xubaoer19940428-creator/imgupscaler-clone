import { NON_DEFAULT_LOCALES } from '@/src/lib/locale'
import { readLocale } from '@/src/lib/route-locale'
import { LocalizedRoot } from '@/src/components/site/localized-root'

// The root and /zh routes remain stable legacy routes. This segment owns the
// additional translated URLs and is statically generated for known locales.
export const dynamicParams = false

export function generateStaticParams() {
  return NON_DEFAULT_LOCALES
    .filter((locale) => locale !== 'zh')
    .map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  return <LocalizedRoot locale={await readLocale(params)}>{children}</LocalizedRoot>
}
