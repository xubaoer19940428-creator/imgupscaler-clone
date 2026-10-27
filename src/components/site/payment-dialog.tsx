'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'
import { api } from '@/src/lib/api/client'

export interface PaymentProductInfo {
  id: string | number
  pid?: string | number
  name: string
  price: string
  period?: string
  description?: string
  highlight?: string
  coins?: number | string
  vip_days?: number | string
  type?: string
  currency?: string
  rawPrice?: number | string
}

export interface PaymentChannelItem {
  id: number | string
  channel?: string
  sub_channel?: string
  name?: string
  description?: string
  icon_url?: string
  currency?: string
  currency_price?: number | string
  price?: number | string
  discount?: number | string
  is_kyc?: number | boolean
  is_safe?: number | boolean
  [key: string]: unknown
}

const DEFAULT_CHANNELS: PaymentChannelItem[] = [
  {
    id: 12,
    name: 'Crypto',
    description: 'Credit Card / Google Pay / Apple Pay/Paypal',
    icon_url: 'https://cdn.mixu.ai/systems/payment/credit_card.png',
    channel: 'payblis',
    sub_channel: 'credit_cards',
    is_safe: 1,
    is_kyc: 1,
    discount: 100,
    price: '19.99',
  },
  {
    id: 1,
    name: 'Crypto',
    description: 'PayPal',
    icon_url: 'https://cdn.mixu.ai/systems/payment/paypal.png',
    channel: 'luxfintech',
    sub_channel: 'paypal',
    is_safe: 1,
    is_kyc: 1,
    discount: 100,
    price: '19.99',
  },
  {
    id: 103,
    name: 'Crypto',
    description: 'All Cryptocurrencies',
    icon_url: 'https://cdn.mixu.ai/systems/payment/all_cryptocurrencies.png',
    channel: 'mixpay',
    sub_channel: '',
    is_safe: 1,
    is_kyc: 0,
    discount: 95,
    price: '19.99',
  },
  {
    id: 2,
    name: 'Crypto',
    description: 'Venmo',
    icon_url: 'https://cdn.mixu.ai/systems/payment/venmo.png',
    channel: 'luxfintech',
    sub_channel: 'venmo',
    is_safe: 1,
    is_kyc: 1,
    discount: 100,
    price: '19.99',
  },
  {
    id: 5,
    name: 'Credit Card',
    description: 'Telegram Stars',
    icon_url: 'https://cdn.mixu.ai/systems/payment/telegram_stars.png',
    channel: 'telegram',
    sub_channel: 'stars',
    is_safe: 1,
    is_kyc: 0,
    discount: 100,
    price: '19.99',
  },
]

export function PaymentDialog({
  product,
  onClose,
  onSuccess,
}: {
  product: PaymentProductInfo | null
  onClose: () => void
  onSuccess?: (tradeSn: string) => void
}) {
  const locale = useLocale()
  const isZh = locale?.toLowerCase().startsWith('zh')
  const [channels, setChannels] = useState<PaymentChannelItem[]>(DEFAULT_CHANNELS)
  const [selectedChannelId, setSelectedChannelId] = useState<string | number>(12)
  const [loadingChannels, setLoadingChannels] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const chooseDefaultChannel = (list: PaymentChannelItem[]) => {
    if (!list || list.length === 0) return 12
    // Preferred order: Credit Card (id 12) -> PayPal (id 1) -> First item
    const creditCard = list.find((item) => Number(item.id) === 12)
    if (creditCard) return creditCard.id
    const paypal = list.find((item) => Number(item.id) === 1)
    if (paypal) return paypal.id
    return list[0].id
  }

  useEffect(() => {
    if (!product) return

    let active = true
    setLoadingChannels(true)
    setErrorMsg('')

    const pid = Number(product.pid || product.id)
    api.paymentChannels(pid)
      .then((res: any) => {
        if (!active) return
        const rawItems = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []
        if (rawItems.length > 0) {
          // Sort items so Credit Card and PayPal are prominent at the top
          const sorted = [...rawItems].sort((a, b) => {
            const orderScore = (ch: PaymentChannelItem) => {
              const id = Number(ch.id)
              if (id === 12) return 1 // Credit Card / Google Pay / Apple Pay
              if (id === 1) return 2 // PayPal
              if (id === 103) return 3 // Crypto (5% off)
              if (id === 5) return 4 // Telegram Stars
              if (id === 2) return 5 // Venmo
              return 10
            }
            return orderScore(a) - orderScore(b)
          })

          setChannels(sorted)
          setSelectedChannelId(chooseDefaultChannel(sorted))
        } else {
          setChannels(DEFAULT_CHANNELS)
          setSelectedChannelId(12)
        }
      })
      .catch((err) => {
        console.warn('Failed to load payment channels:', err)
        if (active) {
          setChannels(DEFAULT_CHANNELS)
          setSelectedChannelId(12)
        }
      })
      .finally(() => {
        if (active) setLoadingChannels(false)
      })

    return () => {
      active = false
    }
  }, [product])

  if (!product) return null

  const selectedChannel = channels.find((c) => String(c.id) === String(selectedChannelId)) || channels[0]

  // Calculate price taking discount into account
  const rawPriceStr = String(product.rawPrice || product.price || '0').replace(/[^0-9.]/g, '')
  const basePriceNum = Number(rawPriceStr) || 0
  const currencySymbol = String(product.price || '').startsWith('¥') ? '¥' : '$'

  const discountVal = Number(selectedChannel?.discount || 100)
  const isDiscounted = discountVal > 0 && discountVal < 100
  const finalPriceNum = isDiscounted
    ? Number((basePriceNum * (discountVal / 100)).toFixed(2))
    : basePriceNum
  const finalPriceText = `${currencySymbol}${finalPriceNum.toFixed(2)}`

  const handlePay = async () => {
    if (!selectedChannelId) {
      setErrorMsg(isZh ? '请选择支付方式' : 'Please select a payment method')
      return
    }

    setPayLoading(true)
    setErrorMsg('')

    try {
      const pid = String(product.pid || product.id)
      const res = (await api.createPayment({
        channel_id: String(selectedChannelId),
        pid,
      })) as any

      if (res?.trade_sn && typeof window !== 'undefined') {
        window.localStorage.setItem('trade_sn', res.trade_sn)
        window.sessionStorage.setItem('trade_sn', res.trade_sn)
      }

      if (res?.pay_link) {
        const newWin = window.open(res.pay_link, '_blank')
        if (!newWin) {
          window.location.assign(res.pay_link)
        }
        if (onSuccess && res?.trade_sn) {
          onSuccess(res.trade_sn)
        }
      } else if (res?.trade_sn) {
        if (onSuccess) {
          onSuccess(res.trade_sn)
        } else {
          window.location.assign(`/payment/callback?trade_sn=${res.trade_sn}`)
        }
      } else {
        setErrorMsg(isZh ? '未能生成支付订单，请重试' : 'Failed to create payment order. Please try again.')
      }
    } catch (err: any) {
      console.error('Payment checkout failed:', err)
      setErrorMsg(
        err?.message ||
          (isZh ? '支付调起失败，请稍后重试' : 'Payment checkout failed. Please try again.')
      )
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div
      className="editor-backdrop"
      role="presentation"
      onClick={onClose}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(500px, 100%)',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 25px 65px -12px rgba(15, 23, 42, 0.35)',
          background: '#ffffff',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {isZh ? '选择支付渠道' : 'Select Payment Method'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              {isZh ? '安全加密支付 · 随时生效' : 'Instant activation · 256-bit encrypted'}
            </p>
          </div>
          <button
            type="button"
            className="editor-close"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'background 0.2s',
            }}
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Order Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              {product.description || (product.period ? `${product.period}` : '')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {isDiscounted ? (
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {product.price}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', letterSpacing: '-0.03em' }}>
                  {finalPriceText}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563eb', letterSpacing: '-0.03em' }}>
                  {product.price}
                </div>
                {product.period && (
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {product.period}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Channels List */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto', marginBottom: '20px', paddingRight: '2px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>
            {isZh ? '支付方式' : 'Payment Methods'}
          </div>

          {loadingChannels ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              {isZh ? '正在获取实时支付渠道...' : 'Loading available payment methods...'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {channels.map((ch) => {
                const isSelected = String(ch.id) === String(selectedChannelId)
                const channelDiscount = Number(ch.discount || 100)
                const hasDiscount = channelDiscount > 0 && channelDiscount < 100
                const requiresKyc = Number(ch.is_kyc) === 1

                // Channel display title: prioritize description (which has specific details)
                const title = ch.description || ch.name || `Channel ${ch.id}`

                return (
                  <div
                    key={ch.id}
                    onClick={() => setSelectedChannelId(ch.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '13px 15px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      {ch.icon_url ? (
                        <div
                          style={{
                            width: '42px',
                            height: '30px',
                            borderRadius: '7px',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            padding: '3px',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={ch.icon_url}
                            alt=""
                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '42px',
                            height: '30px',
                            borderRadius: '7px',
                            background: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700,
                            color: '#475569',
                            flexShrink: 0,
                          }}
                        >
                          PAY
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                        <div
                          style={{
                            fontSize: '13.5px',
                            fontWeight: 700,
                            color: '#0f172a',
                            lineHeight: '18px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {requiresKyc && (
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              KYC
                            </span>
                          )}
                          {hasDiscount && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                background: '#dcfce7',
                                color: '#15803d',
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {isZh ? `立省 ${100 - channelDiscount}%` : `${100 - channelDiscount}% OFF`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                        background: '#ffffff',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: '12px',
              marginBottom: '14px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          disabled={payLoading || loadingChannels}
          onClick={handlePay}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            background: payLoading ? '#94a3b8' : '#2563eb',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: payLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          }}
        >
          {payLoading ? (
            <span>{isZh ? '正在发起支付...' : 'Processing checkout...'}</span>
          ) : (
            <span>
              {isZh
                ? `立即支付 ${finalPriceText}${isDiscounted ? ` (已省 ${100 - discountVal}%)` : ''}`
                : `Pay ${finalPriceText}${isDiscounted ? ` (${100 - discountVal}% OFF)` : ''}`}
            </span>
          )}
        </button>

        {/* Security badge */}
        <div
          style={{
            marginTop: '12px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Icon name="lock" />
          <span>{isZh ? '256 位 SSL 安全加密传输 · 官方通道' : '256-bit SSL encrypted · Official checkout'}</span>
        </div>
      </div>
    </div>
  )
}
