import { FEATURE_FLAGS } from './feature-flags'
import type { Route } from './types'

export const MAX_FILES = 12
export const MAX_FILE_BYTES = 20 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const

export const routeLabels = {
  home: '图像放大器',
  enhancer: '图像增强器',
  reimagine: '重新构想',
  pricing: '定价',
} as const

export function isRouteVisible(route: Route): boolean {
  if (route === 'enhancer') return FEATURE_FLAGS.enableEnhancer
  if (route === 'reimagine') return FEATURE_FLAGS.enableReimagine
  if (route === 'pricing') return FEATURE_FLAGS.enablePricing
  return true
}

export const visibleRoutes = (Object.keys(routeLabels) as Route[]).filter(isRouteVisible)

