import { BlogArticle } from '@/src/features/blog/blog-pages'
import { blogMetadata } from '@/src/features/blog/blog-metadata'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  return blogMetadata('zh', (await params).slug)
}

export default async function ArticlePage({ params }: Props) {
  return <BlogArticle locale="zh" slug={(await params).slug} />
}
