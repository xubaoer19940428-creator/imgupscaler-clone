'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { Route } from '@/src/lib/types'
import { FEATURE_FLAGS } from '@/src/lib/feature-flags'
import { localeFromPathname } from '@/src/lib/locale'
import { pathToRoute, routeToPath } from '@/src/lib/locale-routing'
import { Icon } from '@/src/components/ui/icons'
import { SiteHeader } from '@/src/components/site/site-header'
import { SiteFooter } from '@/src/components/site/site-footer'
import { LoginDialog } from '@/src/components/site/login-dialog'
import { EditorDialog } from '@/src/features/workspace/editor-dialog'
import { useWorkspaceController } from '@/src/features/workspace/use-workspace-controller'
import { Hero } from '@/src/features/landing/hero'
import { FaqSection } from '@/src/features/landing/faq'
import { TestimonialsSection, UseCasesSection, VideoSection, WorkflowSection } from '@/src/features/landing/sections'
import { PricingPage } from '@/src/features/pricing/pricing-page'
import { api } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'

export default function App() {
  const pathname = usePathname()
  const router = useRouter()
  const route = pathToRoute(pathname)
  const locale = localeFromPathname(pathname)
  const authT = useTranslations('auth')
  const setSession = useAuthStore((state) => state.setSession)
  const [loginOpen, setLoginOpen] = useState(false)
  const [toast, setToast] = useState<{ title: string; detail?: string } | null>(null)
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
      {FEATURE_FLAGS.enableImageEditor && <EditorDialog controller={controller} />}
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
          setToast({ title: authT('submitted') })
        } catch {
          setToast({ title: authT('loginFailed'), detail: authT('loginFailedDetail') })
        }
      }} />}
      {toast && <Toast message={toast} />}
    </div>
  )
}

function LandingPage({ route, controller, onUseCase }: { route: Exclude<Route, 'pricing'>; controller: ReturnType<typeof useWorkspaceController>; onUseCase: () => void }) {
  return <main id="main-content"><Hero route={route} controller={controller} /><VideoSection route={route} /><UseCasesSection route={route} onUseCase={onUseCase} /><WorkflowSection route={route} onStart={onUseCase} items={controller.items} />{route === 'home' && <TestimonialsSection />}<FaqSection route={route} /></main>
}

function Toast({ message }: { message: { title: string; detail?: string } }) {
  return <div className="toast" role="status" aria-live="polite"><div className="toast-icon"><Icon name="check" /></div><div><strong>{message.title}</strong>{message.detail && <span>{message.detail}</span>}</div></div>
}
