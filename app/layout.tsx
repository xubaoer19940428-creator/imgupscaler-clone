import '../src/styles.css'
import { IntlProvider } from './intl-provider'
import { pageMetadata } from '../src/lib/site-metadata'

export const metadata = pageMetadata('en', 'root')

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><IntlProvider>{children}</IntlProvider></body>
    </html>
  )
}
