import messages from '../../messages/en.json'
import { HERO_IMAGES } from './landing-images'

export function pageImages(page: string): string[] {
  if (page !== 'home' && page !== 'enhancer' && page !== 'reimagine') return []
  const examples = messages.landing.useCases[page].flatMap((item) => [item.afterImage, item.beforeImage])
  return [...new Set([HERO_IMAGES[page].after, HERO_IMAGES[page].before, ...examples])]
}
