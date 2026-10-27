'use client'

import { useLocale, useMessages } from 'next-intl'
import { useEffect, useState } from 'react'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'
import { api } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'
import { PaymentDialog, type PaymentProductInfo } from '@/src/components/site/payment-dialog'
import { PayStatusDialog } from '@/src/components/site/pay-status-dialog'

type PlanId = 'free' | 'premium' | 'business' | string
type PricingPlan = {
  id: PlanId
  name: string
  price: string
  period: string
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
  plans: Array<{
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
  }>
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
  original_price?: number | string
  discount?: number | string
  local_currency?: string
  local_price?: number | string
  coins?: number | string
  vip_days?: number | string
  is_selected?: number | boolean
  is_trial?: number | boolean
  features?: string[]
  description?: string
  [key: string]: unknown
}

interface PayProductsResponse {
  subscriptions?: BackendProduct[]
  coins?: BackendProduct[]
  activity?: Record<string, unknown> | null
}

const DEFAULT_SUBSCRIPTIONS: BackendProduct[] = [
  {
    id: 105,
    product_id: 'pp_onetime_subscription_7',
    title: '1 Week',
    type: 'SUBS',
    currency: 'USD',
    price: '9.99',
    coins: 80,
    vip_days: 7,
    is_selected: 0,
  },
  {
    id: 106,
    product_id: 'pp_onetime_subscription_30',
    title: '1 Month',
    type: 'SUBS',
    currency: 'USD',
    price: '19.99',
    coins: 200,
    vip_days: 30,
    is_selected: 1,
  },
  {
    id: 107,
    product_id: 'pp_onetime_subscription_90',
    title: '3 Months',
    type: 'SUBS',
    currency: 'USD',
    price: '39.99',
    coins: 200,
    vip_days: 90,
    is_selected: 0,
  },
  {
    id: 108,
    product_id: 'pp_onetime_subscription_365',
    title: '1 Year',
    type: 'SUBS',
    currency: 'USD',
    price: '69.99',
    coins: 200,
    vip_days: 365,
    is_selected: 0,
  },
]

const DEFAULT_COINS: BackendProduct[] = [
  {
    id: 158,
    product_id: 'pp_onetime_stars_599',
    title: '60 Stars',
    type: 'INAPP',
    currency: 'USD',
    price: '5.99',
    coins: 60,
    is_trial: 1,
    is_selected: 0,
  },
  {
    id: 116,
    product_id: 'pp_onetime_stars_2999',
    title: '300 Stars',
    type: 'INAPP',
    currency: 'USD',
    price: '29.99',
    coins: 300,
    is_selected: 0,
  },
  {
    id: 114,
    product_id: 'pp_onetime_stars_7999',
    title: '1000 Stars',
    type: 'INAPP',
    currency: 'USD',
    price: '79.99',
    discount: '20.00',
    coins: 1000,
    is_selected: 1,
  },
  {
    id: 115,
    product_id: 'pp_onetime_stars_12999',
    title: '2000 Stars',
    type: 'INAPP',
    currency: 'USD',
    price: '129.99',
    discount: '30.00',
    coins: 2000,
    is_selected: 0,
  },
  {
    id: 113,
    product_id: 'pp_onetime_stars_19999',
    title: '4000 Stars',
    type: 'INAPP',
    currency: 'USD',
    price: '199.99',
    discount: '50.00',
    coins: 4000,
    is_selected: 0,
  },
]

export function PricingPage({ onChoose, onLogin }: { onChoose: (route: Route) => void; onLogin: () => void }) {
  const locale = useLocale()
  const isZh = locale?.toLowerCase().startsWith('zh')
  const [tab, setTab] = useState<'subs' | 'coins'>('subs')
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [backendProducts, setBackendProducts] = useState<PayProductsResponse | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | number | null>(null)
  const [paymentProduct, setPaymentProduct] = useState<PaymentProductInfo | null>(null)
  const [statusTradeSn, setStatusTradeSn] = useState<string | null>(null)
  const copy = (useMessages() as { pricing: PricingCopy }).pricing

  useEffect(() => {
    const checkPendingOrder = () => {
      if (typeof window === 'undefined') return
      const sn = window.sessionStorage.getItem('trade_sn') || window.localStorage.getItem('trade_sn')
      if (sn) {
        setStatusTradeSn(sn)
      }
    }

    checkPendingOrder()
    window.addEventListener('focus', checkPendingOrder)
    const handleVis = () => {
      if (document.visibilityState === 'visible') checkPendingOrder()
    }
    window.addEventListener('visibilitychange', handleVis)

    return () => {
      window.removeEventListener('focus', checkPendingOrder)
      window.removeEventListener('visibilitychange', handleVis)
    }
  }, [])

  useEffect(() => {
    let active = true
    setLoadingProducts(true)

    // Request products from backend (accept-domain: photopop.app)
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

  const subscriptionsList =
    backendProducts?.subscriptions && backendProducts.subscriptions.length > 0
      ? backendProducts.subscriptions
      : DEFAULT_SUBSCRIPTIONS

  const coinsList =
    backendProducts?.coins && backendProducts.coins.length > 0
      ? backendProducts.coins
      : DEFAULT_COINS

  const getCurrency = (item: BackendProduct) => {
    if (item.currency === 'USD' || !item.currency) return '$'
    if (item.currency === 'JPY') return '¥'
    return `${item.currency} `
  }

  // Format subscription plans
  const subPlans: PricingPlan[] = subscriptionsList.map((sub) => {
    const sym = getCurrency(sub)
    const priceVal = sub.price !== undefined ? sub.price : sub.local_price || 0
    const priceNum = Number(priceVal) || 0
    const vipDays = Number(sub.vip_days || 30)

    let period = '/ month'
    let label = isZh ? 'VIP 订阅' : 'VIP Plan'
    let highlight = sub.coins ? `${sub.coins} Stars / mo` : undefined

    if (vipDays <= 7) {
      period = isZh ? '/ 7 天' : '/ 7 days'
      label = isZh ? '轻量周卡' : 'Weekly'
    } else if (vipDays <= 30) {
      period = isZh ? '/ 月' : '/ month'
      label = isZh ? '最受欢迎' : copy.popular || 'Most Popular'
    } else if (vipDays <= 90) {
      const perMo = (priceNum / 3).toFixed(2)
      period = isZh ? `/ 季 (约${sym}${perMo}/月)` : `/ 3 mo (~${sym}${perMo}/mo)`
      label = isZh ? '季度特惠' : 'Quarterly'
    } else if (vipDays <= 365) {
      const perMo = (priceNum / 12).toFixed(2)
      period = isZh ? `/ 年 (约${sym}${perMo}/月 · 省70%)` : `/ year (~${sym}${perMo}/mo · 70% OFF)`
      label = isZh ? '最高性价比' : 'Best Value'
      highlight = isZh ? '立省 70% · 每年赠 200 Stars' : 'Save 70% · 200 Stars included'
    }

    const isFeatured = Boolean(sub.is_selected) || vipDays === 30

    return {
      id: String(sub.id),
      pid: sub.id,
      name: sub.title || `${vipDays} Days VIP`,
      price: `${sym}${priceNum}`,
      period,
      label: isFeatured ? (isZh ? '热门首选' : copy.popular || 'Most Popular') : label,
      description:
        sub.description ||
        (isZh
          ? `包含 ${sub.coins || 0} 颗 AI 算力星，尊享无限高精放大与急速通道`
          : `Includes ${sub.coins || 0} AI Stars, unlimited 4K/8K upscaling & fast queue`),
      features: sub.features && sub.features.length > 0 ? sub.features : [
        isZh ? `包含 ${sub.coins || 0} 颗 AI 算力星` : `${sub.coins || 0} AI Stars included`,
        isZh ? '无限次 4K / 8K 高清放大与增强' : 'Unlimited 4K / 8K upscaling & enhance',
        isZh ? 'AI 重绘 (Reimagine) 与变体支持' : 'AI Reimagine & variation tools',
        isZh ? 'VIP 极速专属生成队列' : 'VIP high-priority generation lane',
        isZh ? '商业授权 & 无水印高清下载' : 'Commercial license & watermark free',
      ],
      featured: isFeatured,
      highlight,
      action: isZh ? '立即订阅' : 'Subscribe Now',
      footnote: isZh ? '单次扣款 · 到期不自动扣费' : 'One-time billing · No hidden charges',
    }
  })

  // Format coin packages
  const coinPlans: PricingPlan[] = coinsList.map((coin) => {
    const sym = getCurrency(coin)
    const priceVal = coin.price !== undefined ? coin.price : coin.local_price || 0
    const priceNum = Number(priceVal) || 0
    const stars = Number(coin.coins || 0)
    const perStar = stars > 0 ? (priceNum / stars).toFixed(3) : '0'
    const discount = Number(coin.discount || 0)
    const isFeatured = Boolean(coin.is_selected) || stars === 1000

    let label = isZh ? '算力加油包' : 'Credit Pack'
    if (coin.is_trial) {
      label = isZh ? '新手体验包' : 'Starter Trial'
    } else if (discount > 0) {
      label = isZh ? `立省 ${discount}%` : `${discount}% OFF`
    } else if (isFeatured) {
      label = isZh ? '热门特惠' : 'Most Popular'
    }

    return {
      id: String(coin.id),
      pid: coin.id,
      name: coin.title || `${stars} Stars`,
      price: `${sym}${priceNum}`,
      period: isZh ? `单次充值 · 约${sym}${perStar}/星` : `One-time · ~${sym}${perStar}/star`,
      label: isFeatured ? (isZh ? '热门首选 · 20% OFF' : 'Most Popular · 20% OFF') : label,
      description:
        coin.description ||
        (isZh
          ? `充值 ${stars} 颗 AI 算力星，即时到账，永久有效`
          : `Top up ${stars} AI Stars. Never expires, one-time payment.`),
      features: coin.features && coin.features.length > 0 ? coin.features : [
        isZh ? `即时到账 ${stars} 颗 AI 算力星` : `${stars} AI Stars credited immediately`,
        isZh ? '点数永久有效，不随时间过期' : 'Never expires · Use anytime',
        isZh ? '支持全部 AI 图像增强与重绘模型' : 'Full access to all AI upscaler models',
        isZh ? '单次购买，无任何自动扣费' : 'One-time payment · No subscription',
        isZh ? '支持批量超高清图像导出' : 'Batch ultra-resolution export ready',
      ],
      featured: isFeatured,
      highlight: discount > 0 ? (isZh ? `超值特惠立省 ${discount}%` : `Save ${discount}%`) : undefined,
      action: isZh ? '立即充值' : 'Buy Stars',
      footnote: isZh ? '永久有效 · 无自动扣费' : 'Never expires · One-time checkout',
    }
  })

  const currentPlans = tab === 'subs' ? subPlans : coinPlans

  const choosePlan = (plan: PricingPlan) => {
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

    setPaymentProduct({
      id: plan.id,
      pid: plan.pid || plan.id,
      name: plan.name,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      highlight: plan.highlight,
    })
  }

  return (
    <main className="pricing-page">
      <section className="pricing-hero section-wrap">
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <div className="billing-toggle">
          <button
            type="button"
            className={tab === 'subs' ? 'active' : ''}
            aria-pressed={tab === 'subs'}
            onClick={() => setTab('subs')}
          >
            {isZh ? 'VIP 会员订阅' : 'VIP Subscriptions'}
          </button>
          <button
            type="button"
            className={tab === 'coins' ? 'active' : ''}
            aria-pressed={tab === 'coins'}
            onClick={() => setTab('coins')}
          >
            {isZh ? '算力加油包 (Stars)' : 'Credit Packs (Stars)'}{' '}
            <span>{isZh ? '最高省50%' : 'Up to 50% OFF'}</span>
          </button>
        </div>
      </section>

      <section className="plans-grid section-wrap">
        {currentPlans.map((plan) => {
          const isSubmitting = submittingId === plan.id
          return (
            <article className={plan.featured ? 'plan-card featured' : 'plan-card'} key={plan.id}>
              {plan.featured && (
                <span className="popular-badge">
                  {isZh ? '热门推荐' : copy.popular || 'Most Popular'}
                </span>
              )}
              <span className="plan-label">{plan.label}</span>
              <h2>{plan.name}</h2>
              <div className="plan-price">
                {plan.price}
                <small>{plan.period}</small>
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

      {paymentProduct && (
        <PaymentDialog
          product={paymentProduct}
          onClose={() => setPaymentProduct(null)}
          onSuccess={(sn) => {
            setPaymentProduct(null)
            setStatusTradeSn(sn)
          }}
        />
      )}

      {statusTradeSn && (
        <PayStatusDialog
          isOpen={Boolean(statusTradeSn)}
          tradeSn={statusTradeSn}
          onClose={() => setStatusTradeSn(null)}
          onSuccess={() => {
            setStatusTradeSn(null)
          }}
        />
      )}
    </main>
  )
}
