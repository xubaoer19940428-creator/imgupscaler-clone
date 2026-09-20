'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { visibleRoutes, isRouteVisible } from '@/src/lib/constants'
import type { Route } from '@/src/lib/types'
import { Icon } from '@/src/components/ui/icons'
import { MobileAccountPanel } from './mobile-account-panel'

export type HeaderCopy = {
  navigation: string
  accountMenu: string
  closeMenu: string
  openMenu: string
  name: string
  email: string
  planLabel: string
  plan: string
  creditsLabel: string
  account: string
  billing: string
  signOut: string
}

type NavItem = { route: Route; label: string; href: string }

export function SiteHeader({ onLogin: _onLogin, onNavigate }: { onLogin: () => void; onNavigate?: (route: Route) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('nav')
  const localePrefix = pathname.startsWith('/zh') ? '/zh' : ''
  const copy = getHeaderCopy(localePrefix === '/zh')
  const route = routeFromPath(pathname)

  useEffect(() => {
    if (!mobileOpen && !accountOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setAccountOpen(false)
      }
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMobileOpen(false)
        setAccountOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [mobileOpen, accountOpen])

  // Keep navigation and menu state in the shell so route changes remain
  // compatible with both the App workspace and standalone account/legal pages.
  const navigate = (next: Route) => {
    setMobileOpen(false)
    setAccountOpen(false)
    if (onNavigate) onNavigate(next)
    else router.push(toLocalizedPath(localePrefix, next))
  }
  const hrefFor = (next: Route) => toLocalizedPath(localePrefix, next)
  const items: NavItem[] = visibleRoutes.map((key) => ({ route: key, label: t(key === 'home' ? 'upscaler' : key), href: hrefFor(key) }))

  return <header ref={headerRef} className="site-header"><div className="header-inner"><a className="brand" href={hrefFor('home')} onClick={(event) => handleNavClick(event, navigate, 'home')} aria-label="Img.Upscaler">Img.Upscaler</a><HeaderNavigation items={items} activeRoute={route} onNavigate={navigate} ariaLabel={copy.navigation} open={mobileOpen} copy={copy} accountHref={`${localePrefix}/account`} billingHref={`${localePrefix}/account?tab=billing`} onClose={() => setMobileOpen(false)} /><HeaderActions copy={copy} accountRef={accountRef} accountOpen={accountOpen} accountHref={`${localePrefix}/account`} billingHref={`${localePrefix}/account?tab=billing`} onToggleAccount={() => { setAccountOpen((open) => !open); setMobileOpen(false) }} mobileOpen={mobileOpen} onToggleMobile={() => { setMobileOpen((open) => !open); setAccountOpen(false) }} /></div></header>
}

function HeaderNavigation({ items, activeRoute, onNavigate, ariaLabel, open, copy, accountHref, billingHref, onClose }: { items: NavItem[]; activeRoute: Route; onNavigate: (route: Route) => void; ariaLabel: string; open: boolean; copy: HeaderCopy; accountHref: string; billingHref: string; onClose: () => void }) {
  return <nav id="primary-navigation" className={open ? 'main-nav open' : 'main-nav'} aria-label={ariaLabel}><div className="mobile-nav-links">{items.map((item) => <a className={activeRoute === item.route ? 'nav-link active' : 'nav-link'} key={item.route} href={item.href} onClick={(event) => handleNavClick(event, onNavigate, item.route)} aria-current={activeRoute === item.route ? 'page' : undefined}>{item.label}</a>)}</div><MobileAccountPanel {...copy} accountHref={accountHref} billingHref={billingHref} onClose={onClose} /></nav>
}

function HeaderActions({ copy, accountRef, accountOpen, accountHref, billingHref, onToggleAccount, mobileOpen, onToggleMobile }: { copy: HeaderCopy; accountRef: RefObject<HTMLDivElement | null>; accountOpen: boolean; accountHref: string; billingHref: string; onToggleAccount: () => void; mobileOpen: boolean; onToggleMobile: () => void }) {
  return <div className="header-actions"><AccountMenu copy={copy} accountRef={accountRef} open={accountOpen} accountHref={accountHref} billingHref={billingHref} onToggle={onToggleAccount} /><button className="menu-button" onClick={onToggleMobile} aria-label={mobileOpen ? copy.closeMenu : copy.openMenu} aria-expanded={mobileOpen} aria-controls="primary-navigation"><Icon name="menu" /></button></div>
}

function AccountMenu({ copy, accountRef, open, accountHref, billingHref, onToggle }: { copy: HeaderCopy; accountRef: RefObject<HTMLDivElement | null>; open: boolean; accountHref: string; billingHref: string; onToggle: () => void }) {
  return <div ref={accountRef} className="header-account"><button type="button" className="avatar-button" onClick={onToggle} aria-label={copy.accountMenu} aria-haspopup="menu" aria-expanded={open}><img src="/reference/unnamed.jpg" alt={copy.name} /></button>{open && <AccountPopover copy={copy} accountHref={accountHref} billingHref={billingHref} onClose={onToggle} />}</div>
}

function AccountPopover({ copy, accountHref, billingHref, onClose }: { copy: HeaderCopy; accountHref: string; billingHref: string; onClose: () => void }) {
  return <div className="account-popover" role="menu"><div className="account-popover-profile"><div className="account-popover-avatar"><img src="/reference/unnamed.jpg" alt={copy.name} /></div><div className="account-popover-identity"><strong>{copy.name}</strong><span>{copy.email}</span></div></div><div className="account-popover-summary"><div><span>{copy.planLabel}</span><strong>{copy.plan}</strong></div><div><span>{copy.creditsLabel}</span><strong>50</strong></div></div><div className="account-popover-links"><Link role="menuitem" href={accountHref} onClick={onClose}><Icon name="user" />{copy.account}</Link><Link role="menuitem" href={billingHref} onClick={onClose}><Icon name="credit-card" />{copy.billing}</Link><button type="button" onClick={onClose}><Icon name="logout" />{copy.signOut}</button></div></div>
}

function getHeaderCopy(isChinese: boolean): HeaderCopy {
  return isChinese
    ? { navigation: '主导航', accountMenu: '账户菜单', closeMenu: '关闭菜单', openMenu: '打开菜单', name: '钱诚', email: 'xubaoer19940428@gmail.com', planLabel: '方案', plan: '免费', creditsLabel: '积分', account: '账户', billing: '计费', signOut: '退出' }
    : { navigation: 'Primary navigation', accountMenu: 'Account menu', closeMenu: 'Close menu', openMenu: 'Open menu', name: 'Qian Cheng', email: 'xubaoer19940428@gmail.com', planLabel: 'Plan', plan: 'Free', creditsLabel: 'Credits', account: 'Account', billing: 'Billing', signOut: 'Sign out' }
}

function toLocalizedPath(localePrefix: string, route: Route): string {
  return `${localePrefix}${route === 'home' ? '/' : `/${route}`}`.replace(/\/\/$/, '/')
}

function handleNavClick(event: MouseEvent<HTMLAnchorElement>, navigate: (route: Route) => void, next: Route) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  navigate(next)
}

function routeFromPath(pathname: string): Route {
  const path = pathname.replace(/^\/zh(?=\/|$)/, '') || '/'
  if (path === '/enhancer' && isRouteVisible('enhancer')) return 'enhancer'
  if (path === '/reimagine' && isRouteVisible('reimagine')) return 'reimagine'
  if (path === '/pricing' && isRouteVisible('pricing')) return 'pricing'
  return 'home'
}
