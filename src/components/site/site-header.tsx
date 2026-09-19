'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { routeLabels, visibleRoutes, isRouteVisible } from '@/src/lib/constants'
import { FEATURE_FLAGS } from '@/src/lib/feature-flags'
import type { Route } from '@/src/lib/types'
import { Icon } from '@/src/components/ui/icons'

export function SiteHeader({ onLogin, onNavigate }: { onLogin: () => void; onNavigate?: (route: Route) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const t = useTranslations('nav')
  const localePrefix = pathname.startsWith('/zh') ? '/zh' : ''
  const isChinese = localePrefix === '/zh'
  const route = routeFromPath(pathname)

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileOpen])

  useEffect(() => {
    if (!accountOpen) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Element && !target.closest('.account-menu')) setAccountOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [accountOpen])

  // The reference header keeps account actions behind the avatar. The callback
  // lets App cancel a local processing run before changing routes.
  const navigate = (next: Route) => {
    setMobileOpen(false)
    if (onNavigate) onNavigate(next)
    else router.push(`${localePrefix}${next === 'home' ? '/' : `/${next}`}`.replace(/\/\/$/, '/'))
  }

  const hrefFor = (next: Route) => `${localePrefix}${next === 'home' ? '/' : `/${next}`}`.replace(/\/\/$/, '/')
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, next: Route) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    navigate(next)
  }

  const headerCopy = isChinese ? { navigation: '主导航', account: '账户菜单', demoAccount: '演示账户', workspace: '免费工作区 · 50 积分', signIn: '登录', settings: '账户设置', signOut: '退出', register: '注册', closeMenu: '关闭菜单', openMenu: '打开菜单', avatar: '钱诚' } : { navigation: 'Primary navigation', account: 'Account menu', demoAccount: 'Demo account', workspace: 'Free workspace · 50 credits', signIn: 'Sign in', settings: 'Account settings', signOut: 'Sign out', register: 'Sign up', closeMenu: 'Close menu', openMenu: 'Open menu', avatar: 'Account avatar' }
  return <header className="site-header"><div className="header-inner"><a className="brand" href={hrefFor('home')} onClick={(event) => handleNavClick(event, 'home')} aria-label="Img.Upscaler">Img.Upscaler</a><nav id="primary-navigation" className={mobileOpen ? 'main-nav open' : 'main-nav'} aria-label={headerCopy.navigation}>{visibleRoutes.map((key) => <a className={route === key ? 'nav-link active' : 'nav-link'} key={key} href={hrefFor(key)} onClick={(event) => handleNavClick(event, key)} aria-current={route === key ? 'page' : undefined}>{t(key === 'home' ? 'upscaler' : key)}</a>)}</nav><div className="header-actions">{route === 'pricing' ? <><button className="ghost-button" onClick={onLogin}>{headerCopy.signIn}</button><button className="dark-button" onClick={onLogin}>{headerCopy.register}</button></> : FEATURE_FLAGS.enableAccount ? <div className="account-menu"><button className="avatar-button" onClick={() => setAccountOpen((open) => !open)} aria-label={headerCopy.account} aria-expanded={accountOpen}><img src="/reference/unnamed.jpg" width="36" height="36" alt={headerCopy.avatar} /></button>{accountOpen && <div className="menu-popover"><strong>{headerCopy.demoAccount}</strong><span>{headerCopy.workspace}</span><button onClick={onLogin}>{headerCopy.signIn}</button><button onClick={() => router.push(`${localePrefix}/account`)}>{headerCopy.settings}</button><button onClick={() => setAccountOpen(false)}>{headerCopy.signOut}</button></div>}</div> : null}<button className="menu-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? headerCopy.closeMenu : headerCopy.openMenu} aria-expanded={mobileOpen} aria-controls="primary-navigation"><Icon name="menu" /></button></div></div></header>
}

function routeFromPath(pathname: string): Route {
  const path = pathname.replace(/^\/zh(?=\/|$)/, '') || '/'
  if (path === '/enhancer' && isRouteVisible('enhancer')) return 'enhancer'
  if (path === '/reimagine' && isRouteVisible('reimagine')) return 'reimagine'
  if (path === '/pricing' && isRouteVisible('pricing')) return 'pricing'
  return 'home'
}
