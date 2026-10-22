'use client'

import type { Route } from '@/src/lib/types'
import { useMessages, useTranslations } from 'next-intl'
import { WorkspacePanel } from '@/src/features/workspace/workspace-panel'
import type { WorkspaceController } from '@/src/features/workspace/use-workspace-controller'
import { getLandingContent, renderLandingTitle } from './data'
import { CompareCard } from './sections'
import { HERO_IMAGES } from '@/src/lib/landing-images'

/**
 * Hero 只组合首屏文案和工作区，具体上传/处理状态由 workspace feature 管理。
 * 这样营销文案可以独立替换，不会影响浏览器端处理状态机。
 */
export function Hero({ route, controller }: { route: Exclude<Route, 'pricing'>; controller: WorkspaceController }) {
  const content = getLandingContent(useMessages()).heroContent[route]
  const t = useTranslations('landing.comparison')
  const artwork = HERO_IMAGES[route]
  const hasFiles = controller.items.length > 0
  return <section className="hero-section">
    <div className="hero-copy reveal">
      <div className="hero-heading"><div className="eyebrow"><span className="eyebrow-dot" />{content.eyebrow}</div><h1>{renderLandingTitle(content.title)}</h1></div>
      <p>{content.description}</p>
    </div>
    <div className={`studio-workbench${hasFiles ? ' has-files' : ''}`}>
      <WorkspacePanel route={route} controller={controller} />
      {!hasFiles && <div className="studio-preview"><CompareCard before={artwork.before} after={artwork.after} eager /><div className="studio-preview-caption"><span>{t('adjust')}</span><span aria-hidden="true">↔</span></div></div>}
    </div>
  </section>
}
