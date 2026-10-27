'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Route } from '@/src/lib/types'
import { FEATURE_FLAGS } from '@/src/lib/feature-flags'
import { localeFromPathname } from '@/src/lib/locale'
import { pathToRoute, routeToPath } from '@/src/lib/locale-routing'
import { Icon } from '@/src/components/ui/icons'
import { SiteHeader } from '@/src/components/site/site-header'
import { SiteFooter } from '@/src/components/site/site-footer'
import { useWorkspaceController } from '@/src/features/workspace/use-workspace-controller'
import { Hero } from '@/src/features/landing/hero'
import { FaqSection } from '@/src/features/landing/faq'
import { FeatureSection, UseCasesSection, WorkflowSection } from '@/src/features/landing/sections'
import { api, ApiError } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'

const LoginDialog = dynamic(() => import('@/src/components/site/login-dialog').then((module) => module.LoginDialog))
const EditorDialog = dynamic(() => import('@/src/features/workspace/editor-dialog').then((module) => module.EditorDialog))
const PricingPage = dynamic(() => import('@/src/features/pricing/pricing-page').then((module) => module.PricingPage))
const PayStatusDialog = dynamic(() => import('@/src/components/site/pay-status-dialog').then((module) => module.PayStatusDialog))

export default function App() {
  const pathname = usePathname()
  const router = useRouter()
  const route = pathToRoute(pathname)
  const locale = localeFromPathname(pathname)
  const authT = useTranslations('auth')
  const setSession = useAuthStore((state) => state.setSession)
  const [loginOpen, setLoginOpen] = useState(false)
  const [toast, setToast] = useState<{ title: string; detail?: string } | null>(null)
  const [statusTradeSn, setStatusTradeSn] = useState<string | null>(null)

  // Listen for return from third-party payment checkout or trade_sn in URL
  useEffect(() => {
    const checkOrder = () => {
      if (typeof window === 'undefined') return
      const urlParams = new URLSearchParams(window.location.search)
      const urlTradeSn = urlParams.get('trade_sn')
      const storageTradeSn =
        window.sessionStorage.getItem('trade_sn') ||
        window.localStorage.getItem('trade_sn')

      const sn = urlTradeSn || storageTradeSn
      if (sn) {
        setStatusTradeSn(sn)
      }
    }

    checkOrder()
    window.addEventListener('focus', checkOrder)
    const handleVis = () => {
      if (document.visibilityState === 'visible') checkOrder()
    }
    window.addEventListener('visibilitychange', handleVis)

    return () => {
      window.removeEventListener('focus', checkOrder)
      window.removeEventListener('visibilitychange', handleVis)
    }
  }, [])

  // The page shell coordinates route-level UI only. Upload state, async processing
  // and object-URL lifecycle remain isolated inside the workspace controller.
  const controller = useWorkspaceController(route, () => setLoginOpen(true))

  const navigate = (next: Route) => {
    if (controller.processing) controller.cancel()
    router.push(routeToPath(next, locale))
  }
  const scrollToWorkspace = () => document.querySelector('.workspace-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div className="app-shell">
      <SiteHeader onLogin={() => setLoginOpen(true)} onNavigate={navigate} />
      {route === 'pricing' ? <div id="main-content"><PricingPage onChoose={navigate} onLogin={() => setLoginOpen(true)} /></div> : <LandingPage route={route} controller={controller} onUseCase={scrollToWorkspace} />}
      <SiteFooter locale={locale} />
      {FEATURE_FLAGS.enableImageEditor && controller.editingItemId && <EditorDialog controller={controller} />}
      {controller.toast && <Toast message={controller.toast} />}
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onGoogle={async () => {
        try {
          const { redirect_url } = await api.socialLogin('google')
          setLoginOpen(false)
          window.location.assign(redirect_url)
        } catch {
          setToast({ title: authT('googleFailed'), detail: authT('googleFailedDetail') })
        }
      }} onSubmit={async (email, password) => {
        try {
          const session = await api.login(email, password)
          setSession(session.token, session.user_info)
          setLoginOpen(false)
          controller.resumePendingProcess()
          setToast({ title: authT('submitted') })
        } catch (error) {
          setToast({ title: authT('loginFailed'), detail: authT('loginFailedDetail') })
          throw error
        }
      }} onRegister={async (email, password, code) => {
        try {
          const session = await api.register(email, password, code)
          setSession(session.token, session.user_info)
          setLoginOpen(false)
          controller.resumePendingProcess()
          setToast({ title: authT('registered') })
        } catch (error) {
          const msg = error instanceof ApiError && error.message ? error.message : authT('registerFailedDetail')
          setToast({ title: authT('registerFailed'), detail: msg })
          throw error
        }
      }} />}
      {toast && <Toast message={toast} />}
      {statusTradeSn && (
        <PayStatusDialog
          isOpen={Boolean(statusTradeSn)}
          tradeSn={statusTradeSn}
          onClose={() => setStatusTradeSn(null)}
          onSuccess={() => {
            setStatusTradeSn(null)
            setToast({ title: '支付成功！权益已即时生效' })
          }}
        />
      )}
    </div>
  )
}

function LandingPage({ route, controller, onUseCase }: { route: Exclude<Route, 'pricing'>; controller: ReturnType<typeof useWorkspaceController>; onUseCase: () => void }) {
  return <main id="main-content"><Hero route={route} controller={controller} /><UseCasesSection route={route} onUseCase={onUseCase} /><FeatureSection route={route} /><WorkflowSection route={route} /><FaqSection route={route} /></main>
}

function Toast({ message }: { message: { title: string; detail?: string } }) {
  const isError = /failed|error|失败/i.test(`${message.title} ${message.detail || ''}`)
  return (
    <div className={`toast ${isError ? 'toast-error' : ''}`} role="status" aria-live="polite">
      <div className="toast-icon">
        <Icon name={isError ? 'close' : 'check'} />
      </div>
      <div>
        <strong>{message.title}</strong>
        {message.detail && <span>{message.detail}</span>}
      </div>
    </div>
  )
}
