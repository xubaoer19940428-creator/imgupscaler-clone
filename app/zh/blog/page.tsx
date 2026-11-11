import { BlogIndex, type BlogSearchParams } from '@/src/features/blog/blog-pages'
import { blogMetadata } from '@/src/features/blog/blog-metadata'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: { searchParams: BlogSearchParams }) {
  return blogMetadata('zh', undefined, await searchParams)
}

export default function BlogPage({ searchParams }: { searchParams: BlogSearchParams }) {
  return <BlogIndex locale="zh" searchParams={searchParams} />
}
