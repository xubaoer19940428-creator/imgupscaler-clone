import { BlogArticle } from '@/src/features/blog/blog-pages'
import { blogMetadata } from '@/src/features/blog/blog-metadata'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  return blogMetadata('en', (await params).slug)
}

export default async function ArticlePage({ params }: Props) {
  return <BlogArticle locale="en" slug={(await params).slug} />
}
