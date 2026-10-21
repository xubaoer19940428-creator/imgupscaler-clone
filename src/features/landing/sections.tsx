'use client'

import { useMessages, useTranslations } from 'next-intl'
import { useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Icon } from '@/src/components/ui/icons'
import type { FileItem } from '@/src/lib/types'
import { getLandingContent, renderLandingTitle, type LandingRoute } from './data'

export function VideoSection({ route }: { route: LandingRoute }) {
  const content = getLandingContent(useMessages())
  if (route !== 'home') return <FeatureSection route={route} />
  return <section className="video-section section-wrap"><SectionHeading kicker="" title={content.video.title} description={content.video.description} /><a className="video-card" href="https://youtu.be/MsEYdKfD2-s?si=VC_UOSJ14cFfXFfL" target="_blank" rel="noreferrer"><img src="/reference/youtube-thumbnail.jpeg" alt={content.video.alt} width="1200" height="675" loading="lazy" /><span className="video-play">▶</span><span className="video-caption">{content.video.caption}</span></a><FeatureCards route="home" /></section>
}

export function FeatureSection({ route }: { route: LandingRoute }) {
  const content = getLandingContent(useMessages())
  if (route === 'home') return null
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
  return <section className="reference-section section-wrap"><SectionHeading kicker={intro.kicker} title={renderLandingTitle(intro.title)} description={intro.description} /><div className="reference-grid">{content.useCases[route].map((useCase, index) => <article className="reference-card" key={useCase.title}><div className={index % 2 ? 'reference-copy md-order-2' : 'reference-copy'}><h3>{useCase.title}</h3><p>{useCase.body}</p><a className="text-link" href="#workspace" onClick={(event) => { event.preventDefault(); onUseCase() }}>{useCase.cta} <Icon name="arrow" /></a></div><div className={index % 2 ? 'reference-visual md-order-1' : 'reference-visual'}>{route === 'home' ? <img src={useCase.image} alt={useCase.title} width="640" height="640" loading="lazy" /> : <CompareCard before={useCase.beforeImage} after={useCase.afterImage} label={useCase.title} />}</div></article>)}</div></section>
}

export function WorkflowSection({ route, items }: { route: LandingRoute; onStart: () => void; items: FileItem[] }) {
  const workflow = getLandingContent(useMessages()).routeWorkflow[route]
  const source = items[0]
  return <section className="workflow-section"><div className="section-wrap"><SectionHeading kicker={workflow.kicker} title={renderLandingTitle(workflow.title)} description={workflow.description} /><div className="workflow-steps">{workflow.steps.map(([number, title, body]) => <article className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div><CompareCard before={source?.url ?? '/reference/anime-original.webp'} after={source?.resultUrl ?? '/reference/anime-upscaler.webp'} /></div></section>
}

export function ComparisonSection({ items }: { route: LandingRoute; items: FileItem[] }) {
  const source = items[0]
  return <section className="showcase-section section-wrap"><CompareCard before={source?.url ?? '/reference/anime-original.webp'} after={source?.resultUrl ?? '/reference/anime-upscaler.webp'} /></section>
}

function CompareCard({ before, after, label }: { before: string | React.CSSProperties; after: string | React.CSSProperties; label?: string }) {
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
      {typeof before === 'string' && <img src={before} alt={t('before')} width="640" height="640" loading="lazy" />}
      <span className="compare-label">{t('before')}</span>
    </div>
    <div className="compare-image after-image" style={{ clipPath: `inset(0 0 0 ${split}%)`, ...afterStyle }}>
      {typeof after === 'string' && <img src={after} alt={t('after')} width="640" height="640" loading="lazy" />}
      <span className="compare-label">{t('after')}</span>
    </div>
    <div className="compare-drag-layer" aria-hidden="true" />
    <input className="compare-range" type="range" min="10" max="90" value={split} onChange={(event) => setSplit(Number(event.target.value))} onKeyDown={onHandleKeyDown} aria-label={sliderLabel} />
    <span className="compare-handle" style={{ left: `${split}%` }} aria-hidden="true"><span /></span>
  </div>
}

export function TestimonialsSection() {
  const content = getLandingContent(useMessages())
  return <section className="testimonial-section section-wrap"><SectionHeading kicker="" title={content.testimonialIntro.title} description={content.testimonialIntro.description} /><div className="testimonial-grid">{content.testimonials.map(([name, role, quote], index) => <article className="testimonial-card" key={`${name}-${index}`}><span className="quote-mark">“</span><p>{quote}</p><div><strong>{name}</strong><span>{role}</span></div></article>)}</div></section>
}

export function SectionHeading({ kicker, title, description }: { kicker: string; title: React.ReactNode; description: string }) {
  return <div className="section-heading"><div>{kicker && <span className="kicker">{kicker}</span>}<h2>{title}</h2></div><p>{description}</p></div>
}
