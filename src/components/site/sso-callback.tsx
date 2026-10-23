'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { api, ApiError } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'
import { Icon } from '@/src/components/ui/icons'

export function SSOCallbackPage({ locale = 'en' }: { locale?: string }) {
  return (
    <Suspense fallback={<SSOLoadingCard isZh={locale.startsWith('zh')} />}>
      <SSOCallbackContent locale={locale} />
    </Suspense>
  )
}

function SSOLoadingCard({ isZh }: { isZh: boolean }) {
  return (
    <main className="sso-callback-shell">
      <div className="sso-callback-card">
        <div className="sso-spinner" aria-hidden="true" />
        <h2>{isZh ? '正在完成授权…' : 'Completing authentication…'}</h2>
        <p>{isZh ? '正在与账号中心同步，请勿关闭窗口。' : 'Please do not close this window.'}</p>
      </div>
    </main>
  )
}

function SSOCallbackContent({ locale }: { locale: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const routeParams = useParams()
  const setSession = useAuthStore((state) => state.setSession)
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const hasRequested = useRef(false)

  const isZh = locale.startsWith('zh')

  useEffect(() => {
    if (hasRequested.current) return
    hasRequested.current = true

    const code = searchParams.get('code')
    const provider = (routeParams?.provider as string) || searchParams.get('provider') || 'google'

    if (!code) {
      setStatus('error')
      setErrorMsg(isZh ? '未找到授权码 (code)' : 'No authorization code found.')
      return
    }

    const handleAuthCallback = async () => {
      try {
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })

        const res = (await api.socialCallback(provider, params)) as any

        if (res?.token) {
          const user = res.user_info || res
          setSession(res.token, user)
          setStatus('success')
          setTimeout(() => {
            const returnTo =
              typeof window !== 'undefined' ? window.sessionStorage.getItem('return_to') : null
            if (returnTo) {
              window.sessionStorage.removeItem('return_to')
              router.replace(returnTo)
            } else {
              router.replace(isZh ? '/zh/account' : '/account')
            }
          }, 800)
        } else if (res?.message === 'bind_success') {
          setStatus('success')
          setTimeout(() => {
            router.replace(isZh ? '/zh/account' : '/account')
          }, 800)
        } else {
          setStatus('error')
          setErrorMsg(isZh ? '授权失败：未返回有效 Token' : 'Authentication failed: Missing token.')
        }
      } catch (error: any) {
        console.error('SSO Callback Error:', error)
        setStatus('error')
        const msg =
          error instanceof ApiError && error.message
            ? error.message
            : error?.message || (isZh ? '授权失败，请重试。' : 'Authentication failed. Please try again.')
        setErrorMsg(msg)
      }
    }

    handleAuthCallback()
  }, [searchParams, routeParams, router, setSession, isZh])

  return (
    <main className="sso-callback-shell">
      <div className="sso-callback-card">
        {status === 'loading' && (
          <>
            <div className="sso-spinner" aria-hidden="true" />
            <h2>{isZh ? '正在完成授权…' : 'Completing authentication…'}</h2>
            <p>{isZh ? '正在与账号中心同步，请勿关闭窗口。' : 'Please do not close this window.'}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="sso-status-icon success" aria-hidden="true">
              <Icon name="check" />
            </div>
            <h2>{isZh ? '授权成功！' : 'Authentication Successful!'}</h2>
            <p>{isZh ? '正在为你跳转…' : 'Redirecting you back…'}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="sso-status-icon error" aria-hidden="true">
              <Icon name="close" />
            </div>
            <h2>{isZh ? '授权失败' : 'Authentication Failed'}</h2>
            <p className="sso-error-detail">{errorMsg}</p>
            <button
              type="button"
              className="dark-button"
              onClick={() => router.replace(isZh ? '/zh' : '/')}
            >
              {isZh ? '返回首页' : 'Return to Home'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
