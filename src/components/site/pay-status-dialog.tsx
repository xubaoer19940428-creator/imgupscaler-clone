'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'
import { api } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'

interface PayStatusDialogProps {
  isOpen: boolean
  tradeSn: string | null
  onClose: () => void
  onSuccess?: () => void
}

export function PayStatusDialog({
  isOpen,
  tradeSn,
  onClose,
  onSuccess,
}: PayStatusDialogProps) {
  const locale = useLocale()
  const isZh = locale?.toLowerCase().startsWith('zh')
  const [checking, setChecking] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  if (!isOpen) return null

  const handleConfirmPaid = async () => {
    if (!tradeSn || checking) return
    setChecking(true)
    setStatusMsg(null)

    try {
      // 1. Query order status from backend
      const res: any = await api.paymentQuery(tradeSn).catch(() => null)
      const orders = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []
      const order = orders.find((o: any) => o.trade_sn === tradeSn) || orders[0]

      if (order && Number(order.status) === 1) {
        // Order completed successfully
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('trade_sn')
          window.sessionStorage.removeItem('trade_sn')
        }

        // Refresh user profile to immediately sync credits & VIP status
        try {
          const profile: any = await api.profile()
          if (profile) {
            useAuthStore.getState().setUser(profile)
          }
        } catch (e) {
          console.warn('Failed to refresh user profile:', e)
        }

        setStatusMsg({
          type: 'success',
          text: isZh ? '支付成功！权益已即时到账' : 'Payment confirmed! Your benefits are now active.',
        })

        setTimeout(() => {
          onClose()
          if (onSuccess) onSuccess()
        }, 1200)
      } else {
        setStatusMsg({
          type: 'info',
          text: isZh
            ? '暂未查询到已支付状态，如已付款可能稍有延迟，请稍后重试。'
            : 'Payment is not confirmed yet. It might take a few moments to sync.',
        })
      }
    } catch (err: any) {
      console.error('Failed to query order:', err)
      setStatusMsg({
        type: 'error',
        text: isZh ? '查询订单状态失败，请稍后重试' : 'Failed to check order status. Please try again.',
      })
    } finally {
      setChecking(false)
    }
  }

  const handleCancel = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('trade_sn')
      window.sessionStorage.removeItem('trade_sn')
    }
    onClose()
  }

  return (
    <div
      className="editor-backdrop"
      role="presentation"
      onClick={onClose}
      style={{
        zIndex: 1100,
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
          width: 'min(460px, 100%)',
          padding: '28px 24px 24px',
          borderRadius: '24px',
          boxShadow: '0 25px 65px -12px rgba(15, 23, 42, 0.35)',
          background: '#ffffff',
          textAlign: 'center',
        }}
      >
        {/* Header Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Icon name="check" />
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
          {isZh ? '请在新打开的页面中完成支付' : 'Please Complete Payment'}
        </h2>

        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
          {isZh
            ? '已为你打开收银台。支付完成后，请点击下方「我已支付」同步状态。'
            : 'Payment tab has been opened. Once you finish, click the button below to confirm.'}
        </p>

        {tradeSn && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '11px',
              color: '#94a3b8',
              fontFamily: 'monospace',
              marginBottom: '18px',
              wordBreak: 'break-all',
            }}
          >
            {isZh ? '订单号: ' : 'Order SN: '}
            {tradeSn}
          </div>
        )}

        {statusMsg && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background:
                statusMsg.type === 'success'
                  ? '#dcfce7'
                  : statusMsg.type === 'info'
                  ? '#eff6ff'
                  : '#fef2f2',
              color:
                statusMsg.type === 'success'
                  ? '#15803d'
                  : statusMsg.type === 'info'
                  ? '#1d4ed8'
                  : '#b91c1c',
              fontSize: '13px',
              marginBottom: '18px',
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            {statusMsg.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            disabled={checking}
            onClick={handleConfirmPaid}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: checking ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              cursor: checking ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            {checking
              ? isZh
                ? '正在查询支付结果...'
                : 'Verifying payment...'
              : isZh
              ? '我已支付'
              : 'Payment Successful'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'transparent',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 600,
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isZh ? '支付遇到问题 / 取消' : 'Payment Problem / Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
