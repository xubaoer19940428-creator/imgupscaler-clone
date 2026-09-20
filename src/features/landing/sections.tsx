'use client'

import { useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useLocale } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'
import type { FileItem } from '@/src/lib/types'
import { getLandingContent } from './data'

type LandingRoute = Exclude<Route, 'pricing'>

export function PromoSection() {
  const isChinese = useLocale() === 'zh'
  return <div className="promo-section"><div className="promo-card"><img src="/reference/Upscal.jpeg" alt={isChinese ? 'Upscal 桌面应用 Logo' : 'Upscal desktop app logo'} width="42" height="42" /><div className="promo-copy"><div className="promo-title">{isChinese ? '全新 Upscal 图像放大应用已发布' : 'New Upscal image upscaler is here'} <span className="promo-info" title={isChinese ? '网页订阅与应用授权是独立产品。网页订阅不包含应用，购买应用也不包含网页端访问权限。' : 'Web subscriptions and app licenses are separate products.'}>ⓘ</span></div><p>{isChinese ? <>Upscal 可让您离线批量增强和放大图像，<a href="https://upscal.app/" target="_blank" rel="noreferrer">了解更多</a>。</> : <>Upscal batch-enhances and upscales images offline. <a href="https://upscal.app/" target="_blank" rel="noreferrer">Learn more</a>.</>}</p></div><div className="promo-actions"><a href="https://apps.microsoft.com/detail/9nq2g8s2gm58?hl=en-US&amp;gl=US" target="_blank" rel="noreferrer" className="outline-button">{isChinese ? '微软商店' : 'Microsoft Store'} <Icon name="download" /></a><a href="https://apps.apple.com/us/app/upscal-enhance-video-image/id1487928043" target="_blank" rel="noreferrer" className="outline-button">Mac App Store <Icon name="download" /></a></div></div></div>
}

export function VideoSection({ route }: { route: LandingRoute }) {
  const locale = useLocale() as 'zh' | 'en'
  const isChinese = locale === 'zh'
  const content = getLandingContent(locale)
  if (route !== 'home') return <FeatureSection route={route} />
  return <section className="video-section section-wrap"><SectionHeading kicker="" title={content.video.title} description={content.video.description} /><a className="video-card" href="https://youtu.be/MsEYdKfD2-s?si=VC_UOSJ14cFfXFfL" target="_blank" rel="noreferrer"><img src="/reference/youtube-thumbnail.jpeg" alt={isChinese ? 'ImgUpscaler 视频演示' : 'ImgUpscaler video showcase'} width="1200" height="675" loading="lazy" /><span className="video-play">▶</span><span className="video-caption">{isChinese ? '在 YouTube 观看 ↗' : 'Watch on YouTube ↗'}</span></a><FeatureCards route="home" /></section>
}

export function FeatureSection({ route }: { route: LandingRoute }) {
  if (route === 'home') return null
  const locale = useLocale() as 'zh' | 'en'
  const intro = getLandingContent(locale).featureIntro[route]
  return <section className="feature-section section-wrap"><SectionHeading kicker={intro.kicker} title={intro.title} description={intro.description} /><FeatureCards route={route} /></section>
}

function FeatureCards({ route }: { route: LandingRoute }) {
  const locale = useLocale() as 'zh' | 'en'
  return <div className="feature-grid">{getLandingContent(locale).featureCards[route].map((card) => <article className="feature-card" key={card.number}><span className="feature-number">{card.number}</span><h3>{card.title}</h3><p>{card.body}</p></article>)}</div>
}

export function UseCasesSection({ route, onUseCase }: { route: LandingRoute; onUseCase: () => void }) {
  const locale = useLocale() as 'zh' | 'en'
  const content = getLandingContent(locale)
  const intro = content.useCaseIntro
  return <section className="reference-section section-wrap"><SectionHeading kicker={intro.kicker} title={intro.title} description={intro.description} /><div className="reference-grid">{content.useCases[route].map((useCase, index) => <article className="reference-card" key={useCase.title}><div className={index % 2 ? 'reference-copy md-order-2' : 'reference-copy'}><h3>{useCase.title}</h3><p>{useCase.body}</p><a className="text-link" href="#workspace" onClick={(event) => { event.preventDefault(); onUseCase() }}>{useCase.cta} <Icon name="arrow" /></a></div><div className={index % 2 ? 'reference-visual md-order-1' : 'reference-visual'}>{route === 'home' ? <img src={useCase.image} alt={useCase.title} width="640" height="640" loading="lazy" /> : <CompareCard before={useCase.beforeImage} after={useCase.afterImage} label={useCase.title} />}</div></article>)}</div></section>
}

export function WorkflowSection({ route, onStart, items }: { route: LandingRoute; onStart: () => void; items: FileItem[] }) {
  const locale = useLocale() as 'zh' | 'en'
  const workflow = getLandingContent(locale).routeWorkflow[route]
  const source = items[0]
  return <section className="workflow-section"><div className="section-wrap"><SectionHeading kicker={workflow.kicker} title={workflow.title} description={workflow.description} /><div className="workflow-steps">{workflow.steps.map(([number, title, body]) => <article className="workflow-step" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div><CompareCard before={source?.url ?? '/reference/anime-original.webp'} after={source?.resultUrl ?? '/reference/anime-upscaler.webp'} /></div></section>
}

export function ComparisonSection({ route, items }: { route: LandingRoute; items: FileItem[] }) {
  const source = items[0]
  const before = source?.url ?? '/reference/anime-original.webp'
  const after = source?.resultUrl ?? '/reference/anime-upscaler.webp'
  return <section className="showcase-section section-wrap"><CompareCard before={before} after={after} /></section>
}

function CompareCard({ before, after, label }: { before: string | React.CSSProperties; after: string | React.CSSProperties; label?: string }) {
  const locale = useLocale()
  const isChinese = locale === 'zh'
  const [split, setSplit] = useState(50)
  const beforeStyle = typeof before === 'string' ? undefined : before
  const afterStyle = typeof after === 'string' ? undefined : after
  // The native range remains transparent but owns mouse, touch, and keyboard
  // input. This preserves the browser's reliable slider semantics while the
  // custom handle and image layers stay purely visual.
  const onHandleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const step = event.shiftKey ? 10 : 2
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setSplit((current) => Math.max(10, current - step)) }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setSplit((current) => Math.min(90, current + step)) }
    if (event.key === 'Home') { event.preventDefault(); setSplit(10) }
    if (event.key === 'End') { event.preventDefault(); setSplit(90) }
  }
  const cardClass = label ? 'compare-card mini-compare-card' : 'compare-card'
  const beforeText = isChinese ? '处理前' : 'Before'
  const afterText = isChinese ? '处理后' : 'After'
  const sliderLabel = label ? `${label} ${isChinese ? '前后对比' : 'before and after comparison'}` : (isChinese ? '调整前后对比' : 'Adjust before and after comparison')
  return <div className={cardClass}>
    {label && <span className="compare-card-title">{label}</span>}
    <div className="compare-image before-image" style={beforeStyle}>
      {typeof before === 'string' && <img src={before} alt={beforeText} width="640" height="640" loading="lazy" />}
      <span className="compare-label">{beforeText}</span>
    </div>
    <div className="compare-image after-image" style={{ clipPath: `inset(0 0 0 ${split}%)`, ...afterStyle }}>
      {typeof after === 'string' && <img src={after} alt={afterText} width="640" height="640" loading="lazy" />}
      <span className="compare-label">{afterText}</span>
    </div>
    {/* Keep a dedicated visual layer so the drag affordance is independent of the image markup. */}
    <div className="compare-drag-layer" aria-hidden="true" />
    <input className="compare-range" type="range" min="10" max="90" value={split} onChange={(event) => setSplit(Number(event.target.value))} onKeyDown={onHandleKeyDown} aria-label={sliderLabel} />
    <span className="compare-handle" style={{ left: `${split}%` }} aria-hidden="true"><span /></span>
  </div>
}

export function TestimonialsSection() {
  const locale = useLocale() as 'zh' | 'en'
  const content = getLandingContent(locale)
  return <section className="testimonial-section section-wrap"><SectionHeading kicker="" title={content.testimonialIntro.title} description={content.testimonialIntro.description} /><div className="testimonial-grid">{content.testimonials.map(([name, role, quote], index) => <article className="testimonial-card" key={`${name}-${index}`}><span className="quote-mark">“</span><p>{quote}</p><div><strong>{name}</strong><span>{role}</span></div></article>)}</div></section>
}

export function SectionHeading({ kicker, title, description }: { kicker: string; title: React.ReactNode; description: string }) {
  return <div className="section-heading"><div>{kicker && <span className="kicker">{kicker}</span>}<h2>{title}</h2></div><p>{description}</p></div>
}
