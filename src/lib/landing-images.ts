import type { LandingRoute } from '@/src/features/landing/data'

export const HERO_IMAGES: Record<LandingRoute, { before: string; after: string }> = {
  home: { before: '/reference/enhancer/enhancer-sample-1-before.webp', after: '/reference/enhancer/enhancer-sample-1-after.webp' },
  enhancer: { before: '/reference/enhancer/enhancer-sample-2-before.webp', after: '/reference/enhancer/enhancer-sample-2-after.webp' },
  reimagine: { before: '/reference/reimagine/reimagine-upscaler-building-before.jpg', after: '/reference/reimagine/reimagine-upscaler-building-after.jpg' },
}
