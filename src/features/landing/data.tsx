import type { AbstractIntlMessages } from 'next-intl'
import type { Route } from '@/src/lib/types'

export type LandingRoute = Exclude<Route, 'pricing'>
export type LandingTitle = string | { before: string; emphasis: string }
export type FeatureCard = { number: string; title: string; body: string }
export type UseCase = { image: string; beforeImage: string; afterImage: string; title: string; body: string; cta: string }
export type FaqItem = readonly [question: string, answer: string]
export type LandingContent = {
  heroContent: Record<LandingRoute, { eyebrow: string; title: LandingTitle; description: string }>
  featureCards: Record<LandingRoute, FeatureCard[]>
  useCases: Record<LandingRoute, UseCase[]>
  featureIntro: Record<LandingRoute, { kicker: string; title: LandingTitle; description: string }>
  routeWorkflow: Record<LandingRoute, { kicker: string; title: LandingTitle; description: string; steps: readonly (readonly [string, string, string])[] }>
  testimonials: ReadonlyArray<readonly [string, string, string]>
  faqs: Record<LandingRoute, FaqItem[]>
  video: { title: string; description: string; alt: string; caption: string }
  useCaseIntro: { kicker: string; title: LandingTitle; description: string }
  testimonialIntro: { title: string; description: string }
  faqIntro: { title: string; description: string }
  comparison: { before: string; after: string; labelled: string; adjust: string }
}

/** Read the active locale's copy model from next-intl messages. */
export function getLandingContent(messages: AbstractIntlMessages): LandingContent {
  return (messages as AbstractIntlMessages & { landing: LandingContent }).landing
}

export function renderLandingTitle(title: LandingTitle): React.ReactNode {
  if (typeof title === 'string') return title
  return <>{title.before}<br /><em>{title.emphasis}</em></>
}
