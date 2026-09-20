'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'
import { getLandingContent } from './data'

export function FaqSection({ route }: { route: Exclude<Route, 'pricing'> }) {
  const [openIndex, setOpenIndex] = useState(0)
  const locale = useLocale() as 'zh' | 'en'
  const content = getLandingContent(locale)
  const intro = content.faqIntro
  return <section className="faq-section section-wrap" id="faq"><div className="section-heading compact"><SectionHeadingLike title={intro.title} description={intro.description} /></div><div className="faq-list">{content.faqs[route].map(([question, answer], index) => { const expanded = openIndex === index; return <article className={expanded ? 'faq-item expanded' : 'faq-item'} key={question}><button aria-expanded={expanded} aria-controls={`faq-answer-${index}`} onClick={() => setOpenIndex(expanded ? -1 : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><Icon name="chevron" /></button><p id={`faq-answer-${index}`} hidden={!expanded}>{answer}</p></article> })}</div></section>
}

function SectionHeadingLike({ title, description }: { title: string; description: string }) {
  return <><h2>{title}</h2><p>{description}</p></>
}
