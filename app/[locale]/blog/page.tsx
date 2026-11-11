import { BlogIndex, type BlogSearchParams } from '@/src/features/blog/blog-pages'
import { blogMetadata } from '@/src/features/blog/blog-metadata'
import { readLocale } from '@/src/lib/route-locale'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string }>; searchParams: BlogSearchParams }

export async function generateMetadata({ params, searchParams }: Props) {
  return blogMetadata(await readLocale(params), undefined, await searchParams)
}

export default async function BlogPage({ params, searchParams }: Props) {
  return <BlogIndex locale={await readLocale(params)} searchParams={searchParams} />
}
