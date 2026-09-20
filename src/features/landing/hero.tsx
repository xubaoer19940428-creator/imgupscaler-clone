'use client'

import type { Route } from '@/src/lib/types'
import { useLocale } from 'next-intl'
import { FEATURE_FLAGS } from '@/src/lib/feature-flags'
import { WorkspacePanel } from '@/src/features/workspace/workspace-panel'
import type { WorkspaceController } from '@/src/features/workspace/use-workspace-controller'
import { getLandingContent } from './data'
import { PromoSection } from './sections'

/**
 * Hero 只组合首屏文案和工作区，具体上传/处理状态由 workspace feature 管理。
 * 这样营销文案可以独立替换，不会影响浏览器端处理状态机。
 */
export function Hero({ route, controller }: { route: Exclude<Route, 'pricing'>; controller: WorkspaceController }) {
  const content = getLandingContent(useLocale() as 'zh' | 'en').heroContent[route]
  return <section className="hero-section"><div className="hero-orb orb-one" /><div className="hero-orb orb-two" /><div className="hero-copy reveal"><div className="eyebrow"><span className="eyebrow-dot" /> {content.eyebrow}</div><h1>{content.title}</h1><p>{content.description}</p></div><WorkspacePanel route={route} controller={controller} />{FEATURE_FLAGS.enablePromoSection && <PromoSection />}</section>
}
