import { LocalizedRoot } from '@/src/components/site/localized-root'

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LocalizedRoot locale="en">{children}</LocalizedRoot>
}
