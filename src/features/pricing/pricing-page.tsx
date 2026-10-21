'use client'

import { useMessages } from 'next-intl'
import { useState } from 'react'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'

type PlanId = 'free' | 'premium' | 'business'
type PricingPlan = { id: PlanId; name: string; monthly: string; annual: string; label: string; description: string; features: string[]; featured: boolean; highlight?: string; action: string; footnote?: string }
type PricingCopy = {
  title: string; description: string; monthly: string; annual: string; annualBadge: string; popular: string; annualPrice: string; monthlyPrice: string; billingNote: string
  valueTitle: string; valueDescription: string; benefits: readonly [string, string][]; faqKicker: string; faqTitle: string; faqEmphasis: string; faqDescription: string
  plans: PricingPlan[]; faqs: readonly [string, string][]
}

export function PricingPage({ onChoose, onLogin }: { onChoose: (route: Route) => void; onLogin: () => void }) {
  const [annual, setAnnual] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const copy = (useMessages() as { pricing: PricingCopy }).pricing
  const choosePlan = (plan: PricingPlan) => plan.id === 'free' ? onChoose('home') : onLogin()

  return <main className="pricing-page"><section className="pricing-hero section-wrap"><h1>{copy.title}</h1><p>{copy.description}</p><div className="billing-toggle"><button type="button" className={!annual ? 'active' : ''} aria-pressed={!annual} onClick={() => setAnnual(false)}>{copy.monthly}</button><button type="button" className={annual ? 'active' : ''} aria-pressed={annual} onClick={() => setAnnual(true)}>{copy.annual} <span>{copy.annualBadge}</span></button></div></section><section className="plans-grid section-wrap">{copy.plans.map((plan) => <article className={plan.featured ? 'plan-card featured' : 'plan-card'} key={plan.id}>{plan.featured && <span className="popular-badge">{copy.popular}</span>}<span className="plan-label">{plan.label}</span><h2>{plan.name}</h2><div className="plan-price">{annual ? plan.annual : plan.monthly}<small>{annual ? copy.annualPrice : copy.monthlyPrice}</small></div>{plan.highlight && <p className="plan-highlight">{plan.highlight}</p>}<p className="plan-description">{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}</ul><button type="button" className={plan.featured ? 'dark-button full' : 'outline-button full'} onClick={() => choosePlan(plan)}>{plan.action} <Icon name="arrow" /></button>{plan.footnote && <p className="plan-footnote">{plan.footnote}</p>}</article>)}<p className="billing-note">{copy.billingNote}</p></section><section className="pricing-note section-wrap"><div><span className="feature-icon"><Icon name="lock" /></span><h2>{copy.valueTitle}</h2></div><p>{copy.valueDescription}</p></section><section className="pricing-benefits section-wrap">{copy.benefits.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</section><section className="pricing-faq section-wrap"><div className="section-heading compact"><div><span className="kicker">{copy.faqKicker}</span><h2>{copy.faqTitle}<br /><em>{copy.faqEmphasis}</em></h2></div><p>{copy.faqDescription}</p></div><div className="faq-list">{copy.faqs.map(([question, answer], index) => { const expanded = faqOpen === index; const answerId = `pricing-faq-answer-${index}`; return <article className={expanded ? 'faq-item expanded' : 'faq-item'} key={question}><button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setFaqOpen(expanded ? null : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><Icon name="chevron" /></button><p id={answerId} hidden={!expanded}>{answer}</p></article> })}</div></section></main>
}
