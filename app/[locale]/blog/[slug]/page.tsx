import { BlogArticle } from '@/src/features/blog/blog-pages'
import { blogMetadata } from '@/src/features/blog/blog-metadata'
import { readLocale } from '@/src/lib/route-locale'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props) {
  return blogMetadata(await readLocale(params), (await params).slug)
}

export default async function ArticlePage({ params }: Props) {
  return <BlogArticle locale={await readLocale(params)} slug={(await params).slug} />
}
