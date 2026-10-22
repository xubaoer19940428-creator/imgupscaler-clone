import { LocalizedRoot } from '@/src/components/site/localized-root'

export default function ChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <LocalizedRoot locale="zh">{children}</LocalizedRoot>
}
