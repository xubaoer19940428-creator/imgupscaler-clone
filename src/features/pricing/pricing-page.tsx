'use client'

import { useMessages } from 'next-intl'
import { useEffect, useState } from 'react'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'
import { api } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'

type PlanId = 'free' | 'premium' | 'business' | string
type PricingPlan = {
  id: PlanId
  name: string
  monthly: string
  annual: string
  label: string
  description: string
  features: string[]
  featured: boolean
  highlight?: string
  action: string
  footnote?: string
  pid?: number | string
}
type PricingCopy = {
  title: string
  description: string
  monthly: string
  annual: string
  annualBadge: string
  popular: string
  annualPrice: string
  monthlyPrice: string
  billingNote: string
  valueTitle: string
  valueDescription: string
  benefits: readonly [string, string][]
  faqKicker: string
  faqTitle: string
  faqEmphasis: string
  faqDescription: string
  plans: PricingPlan[]
  faqs: readonly [string, string][]
}

interface BackendProduct {
  id: number | string
  product_id?: string
  title?: string
  name?: string
  type?: string
  currency?: string
  price?: number | string
  local_price?: number | string
  coins?: number | string
  vip_days?: number | string
  is_selected?: number | boolean
  features?: string[]
  description?: string
  [key: string]: unknown
}

interface PayProductsResponse {
  subscriptions?: BackendProduct[]
  coins?: BackendProduct[]
  activity?: Record<string, unknown> | null
}

export function PricingPage({ onChoose, onLogin }: { onChoose: (route: Route) => void; onLogin: () => void }) {
  const [annual, setAnnual] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [backendProducts, setBackendProducts] = useState<PayProductsResponse | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | number | null>(null)
  const copy = (useMessages() as { pricing: PricingCopy }).pricing

  useEffect(() => {
    let active = true
    setLoadingProducts(true)

    // Request products from backend (matches undress-app /payment/products)
    api.paymentProducts()
      .then((res: any) => {
        if (active && res) {
          setBackendProducts(res)
        }
      })
      .catch((err) => {
        console.warn('Failed to load payment products from backend:', err)
      })
      .finally(() => {
        if (active) setLoadingProducts(false)
      })

    return () => {
      active = false
    }
  }, [])

  // If backend returns subscriptions, map them dynamically; otherwise fallback to copy.plans
  const plans: PricingPlan[] = (() => {
    const subs = backendProducts?.subscriptions
    if (subs && subs.length > 0) {
      const freePlan = copy.plans.find((p) => p.id === 'free') || {
        id: 'free',
        name: 'Free',
        monthly: '$0',
        annual: '$0',
        label: 'Basic',
        description: 'Get started for free',
        features: ['50 Free Credits', 'Standard Processing'],
        featured: false,
        action: 'Start Free',
      }

      const mappedPaid: PricingPlan[] = subs.map((sub, index) => {
        const currency = sub.currency || '$'
        const rawPrice = sub.price !== undefined ? sub.price : sub.local_price || 0
        const priceNum = Number(rawPrice) || 0
        const priceStr = `${currency}${priceNum}`
        const annualPriceStr = `${currency}${(priceNum * 0.7).toFixed(2)}`

        return {
          id: String(sub.id),
          pid: sub.id,
          name: sub.title || sub.name || `Plan ${index + 1}`,
          monthly: priceStr,
          annual: annualPriceStr,
          label: sub.is_selected ? copy.popular : `VIP`,
          description: sub.description || (sub.coins ? `${sub.coins} Credits / mo` : copy.plans[1]?.description || ''),
          features: sub.features && sub.features.length > 0 ? sub.features : copy.plans[1]?.features || [
            sub.coins ? `${sub.coins} Credits` : 'High Priority',
            'Full Resolution Output',
            'No Watermark',
            'Commercial License',
          ],
          featured: Boolean(sub.is_selected || index === 0),
          action: copy.plans[1]?.action || 'Subscribe Now',
        }
      })

      return [freePlan, ...mappedPaid]
    }

    return copy.plans
  })()

  const choosePlan = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      onChoose('home')
      return
    }

    const token =
      useAuthStore.getState().token ||
      (typeof window !== 'undefined'
        ? window.localStorage.getItem('imgupscaler-token') || window.localStorage.getItem('artguru-token')
        : null)

    if (!token) {
      onLogin()
      return
    }

    setSubmittingId(plan.id)
    try {
      const pid = plan.pid || (typeof plan.id === 'number' ? plan.id : Number(plan.id) || 1)
      const channelsRes = (await api.paymentChannels(Number(pid)).catch(() => null)) as any
      const channelId = channelsRes?.items?.[0]?.id || 1

      const res = (await api.createPayment({
        channel_id: String(channelId),
        pid: String(pid),
      })) as any

      if (res?.pay_link) {
        window.location.assign(res.pay_link)
      } else if (res?.trade_sn) {
        window.location.assign(`/payment/callback?trade_sn=${res.trade_sn}`)
      } else {
        onLogin()
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err)
      const isAuth =
        err?.status === 401 ||
        err?.code === 20001 ||
        /not_logined|auth|unauthorized/i.test(err?.message || '')
      if (isAuth) {
        onLogin()
      }
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <main className="pricing-page">
      <section className="pricing-hero section-wrap">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className="billing-toggle">
          <button
            type="button"
            className={!annual ? 'active' : ''}
            aria-pressed={!annual}
            onClick={() => setAnnual(false)}
          >
            {copy.monthly}
          </button>
          <button
            type="button"
            className={annual ? 'active' : ''}
            aria-pressed={annual}
            onClick={() => setAnnual(true)}
          >
            {copy.annual} <span>{copy.annualBadge}</span>
          </button>
        </div>
      </section>

      <section className="plans-grid section-wrap">
        {plans.map((plan) => {
          const isSubmitting = submittingId === plan.id
          return (
            <article className={plan.featured ? 'plan-card featured' : 'plan-card'} key={plan.id}>
              {plan.featured && <span className="popular-badge">{copy.popular}</span>}
              <span className="plan-label">{plan.label}</span>
              <h2>{plan.name}</h2>
              <div className="plan-price">
                {annual ? plan.annual : plan.monthly}
                <small>{annual ? copy.annualPrice : copy.monthlyPrice}</small>
              </div>
              {plan.highlight && <p className="plan-highlight">{plan.highlight}</p>}
              <p className="plan-description">{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Icon name="check" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={plan.featured ? 'dark-button full' : 'outline-button full'}
                disabled={isSubmitting}
                onClick={() => choosePlan(plan)}
              >
                {isSubmitting ? '...' : plan.action} <Icon name="arrow" />
              </button>
              {plan.footnote && <p className="plan-footnote">{plan.footnote}</p>}
            </article>
          )
        })}
        <p className="billing-note">{copy.billingNote}</p>
      </section>

      <section className="pricing-note section-wrap">
        <div>
          <span className="feature-icon">
            <Icon name="lock" />
          </span>
          <h2>{copy.valueTitle}</h2>
        </div>
        <p>{copy.valueDescription}</p>
      </section>

      <section className="pricing-benefits section-wrap">
        {copy.benefits.map(([title, description]) => (
          <article key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className="pricing-faq section-wrap">
        <div className="section-heading compact">
          <div>
            <span className="kicker">{copy.faqKicker}</span>
            <h2>
              {copy.faqTitle}
              <br />
              <em>{copy.faqEmphasis}</em>
            </h2>
          </div>
          <p>{copy.faqDescription}</p>
        </div>
        <div className="faq-list">
          {copy.faqs.map(([question, answer], index) => {
            const expanded = faqOpen === index
            const answerId = `pricing-faq-answer-${index}`
            return (
              <article className={expanded ? 'faq-item expanded' : 'faq-item'} key={question}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={answerId}
                  onClick={() => setFaqOpen(expanded ? null : index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{question}</strong>
                  <Icon name="chevron" />
                </button>
                <p id={answerId} hidden={!expanded}>
                  {answer}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

