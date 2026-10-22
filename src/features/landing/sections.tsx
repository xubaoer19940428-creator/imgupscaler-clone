'use client'

import { useMessages, useTranslations } from 'next-intl'
import { useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import Image from 'next/image'
import { Icon } from '@/src/components/ui/icons'
import { getLandingContent, renderLandingTitle, type LandingRoute } from './data'

export function FeatureSection({ route }: { route: LandingRoute }) {
  const content = getLandingContent(useMessages())
  const intro = content.featureIntro[route]
  return <section className="feature-section section-wrap"><SectionHeading kicker={intro.kicker} title={renderLandingTitle(intro.title)} description={intro.description} /><FeatureCards route={route} /></section>
}

function FeatureCards({ route }: { route: LandingRoute }) {
  const cards = getLandingContent(useMessages()).featureCards[route]
  return <div className="feature-grid">{cards.map((card) => <article className="feature-card" key={card.number}><span className="feature-number">{card.number}</span><h3>{card.title}</h3><p>{card.body}</p></article>)}</div>
}

export function UseCasesSection({ route, onUseCase }: { route: LandingRoute; onUseCase: () => void }) {
  const content = getLandingContent(useMessages())
  const intro = content.useCaseIntro
  return <section className="reference-section section-wrap"><SectionHeading kicker={intro.kicker} title={renderLandingTitle(intro.title)} description={intro.description} /><div className="reference-grid">{content.useCases[route].map((useCase, index) => <article className="reference-card" key={useCase.title}><div className={index % 2 ? 'reference-copy md-order-2' : 'reference-copy'}><h3>{useCase.title}</h3><p>{useCase.body}</p><a className="text-link" href="#workspace" onClick={(event) => { event.preventDefault(); onUseCase() }}>{useCase.cta} <Icon name="arrow" /></a></div><div className={index % 2 ? 'reference-visual md-order-1' : 'reference-visual'}>{route === 'home' ? <Image src={useCase.image} alt={useCase.title} width="640" height="640" sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) 45vw, 380px" loading="lazy" /> : <CompareCard before={useCase.beforeImage} after={useCase.afterImage} label={useCase.title} />}</div></article>)}</div></section>
}

export function WorkflowSection({ route }: { route: LandingRoute }) {
  const workflow = getLandingContent(useMessages()).routeWorkflow[route]
  return <section className="workflow-section"><div className="section-wrap"><SectionHeading kicker={workflow.kicker} title={renderLandingTitle(workflow.title)} description={workflow.description} /><div className="workflow-steps">{workflow.steps.map(([number, title, body]) => <article className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
}

export function CompareCard({ before, after, label, eager = false }: { before: string | React.CSSProperties; after: string | React.CSSProperties; label?: string; eager?: boolean }) {
  const t = useTranslations('landing.comparison')
  const [split, setSplit] = useState(50)
  const beforeStyle = typeof before === 'string' ? undefined : before
  const afterStyle = typeof after === 'string' ? undefined : after
  const onHandleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setSplit((current) => Math.max(10, current - step)) }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setSplit((current) => Math.min(90, current + step)) }
    if (event.key === 'Home') { event.preventDefault(); setSplit(10) }
    if (event.key === 'End') { event.preventDefault(); setSplit(90) }
  }
  const cardClass = label ? 'compare-card mini-compare-card' : 'compare-card'
  const sliderLabel = label ? `${label} ${t('labelled')}` : t('adjust')
  return <div className={cardClass}>
    {label && <span className="compare-card-title">{label}</span>}
    <div className="compare-image before-image" style={beforeStyle}>
      {typeof before === 'string' && <ComparisonImage src={before} alt={label ? `${label} — ${t('before')}` : t('before')} compact={Boolean(label)} eager={eager} />}
      <span className="compare-label">{t('before')}</span>
    </div>
    <div className="compare-image after-image" style={{ clipPath: `inset(0 0 0 ${split}%)`, ...afterStyle }}>
      {typeof after === 'string' && <ComparisonImage src={after} alt={label ? `${label} — ${t('after')}` : t('after')} compact={Boolean(label)} eager={eager} />}
      <span className="compare-label">{t('after')}</span>
    </div>
    <div className="compare-drag-layer" aria-hidden="true" />
    <input className="compare-range" dir="ltr" type="range" min="10" max="90" value={split} onChange={(event) => setSplit(Number(event.target.value))} onKeyDown={onHandleKeyDown} aria-label={sliderLabel} />
    <span className="compare-handle" style={{ left: `${split}%` }} aria-hidden="true"><span /></span>
  </div>
}

function ComparisonImage({ src, alt, compact, eager }: { src: string; alt: string; compact: boolean; eager: boolean }) {
  if (!src.startsWith('/reference/')) return <img src={src} alt={alt} width="640" height="640" loading="lazy" />
  return <Image src={src} alt={alt} width="640" height="640" quality={85} loading={eager ? 'eager' : 'lazy'} sizes={compact ? '(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) 45vw, 380px' : '(max-width: 900px) calc(100vw - 40px), (max-width: 1300px) 58vw, 700px'} />
}

export function SectionHeading({ kicker, title, description }: { kicker: string; title: React.ReactNode; description: string }) {
  return <div className="section-heading"><div>{kicker && <span className="kicker">{kicker}</span>}<h2>{title}</h2></div><p>{description}</p></div>
}
