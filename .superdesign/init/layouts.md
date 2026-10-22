# Shared layouts
Header with navigation/login; footer with locale menu. Locale root renders SSR lang and direction.

## `src/components/site/site-header.tsx`
```tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { visibleRoutes } from '@/src/lib/constants'
import type { Route } from '@/src/lib/types'
import { pagePath, pathToRoute, routeToPath } from '@/src/lib/locale-routing'
import { localeFromPathname } from '@/src/lib/locale'
import { Icon } from '@/src/components/ui/icons'
import { api } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'
import { MobileAccountPanel } from './mobile-account-panel'

export type HeaderCopy = {
  navigation: string
  accountMenu: string
  closeMenu: string
  openMenu: string
  planLabel: string
  planFree: string
  planPremium: string
  unknownValue: string
  creditsLabel: string
  account: string
  billing: string
  signOut: string
  signIn: string
}

type NavItem = { route: Route; label: string; href: string }

export function SiteHeader({ onLogin, onNavigate }: { onLogin: () => void; onNavigate?: (route: Route) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const locale = localeFromPathname(pathname)
  const t = useTranslations('header')
  const navT = useTranslations('nav')
  const auth = useAuthStore()
  const copy: HeaderCopy = {
    navigation: t('navigation'), accountMenu: t('accountMenu'), closeMenu: t('closeMenu'), openMenu: t('openMenu'),
    planLabel: t('planLabel'), planFree: t('planFree'), planPremium: t('planPremium'), unknownValue: t('unknownValue'), creditsLabel: t('creditsLabel'), account: t('account'), billing: t('billing'), signOut: t('signOut'), signIn: t('signIn'),
  }
  const route = pathToRoute(pathname)

  useEffect(() => { auth.hydrate() }, [auth.hydrate])
  useEffect(() => {
    if (!auth.hydrated || !auth.token || auth.user) return
    api.profile().then(auth.setUser).catch((error) => {
      if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 401) auth.clearSession()
    })
  }, [auth.hydrated, auth.token, auth.user, auth.setUser, auth.clearSession])

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
    else router.push(routeToPath(next, locale))
  }
  const hrefFor = (next: Route) => routeToPath(next, locale)
  const items: NavItem[] = visibleRoutes.map((key) => ({ route: key, label: navT(key === 'home' ? 'upscaler' : key), href: hrefFor(key) }))

  const accountHref = pagePath('/account', locale)
  const billingHref = pagePath('/account', locale, '?tab=billing')
  return <header ref={headerRef} className="site-header"><div className="header-inner"><a className="brand" href={hrefFor('home')} onClick={(event) => handleNavClick(event, navigate, 'home')} aria-label="Img.Upscaler">Img.Upscaler</a><HeaderNavigation items={items} activeRoute={route} onNavigate={navigate} ariaLabel={copy.navigation} open={mobileOpen} copy={copy} accountHref={accountHref} billingHref={billingHref} authenticated={Boolean(auth.user)} user={auth.user} onClose={() => setMobileOpen(false)} onLogin={onLogin} onSignOut={() => { void api.logout().catch(() => undefined); auth.clearSession(); setMobileOpen(false); setAccountOpen(false) }} /><HeaderActions copy={copy} accountRef={accountRef} accountOpen={accountOpen} accountHref={accountHref} billingHref={billingHref} authenticated={Boolean(auth.user)} user={auth.user} onLogin={onLogin} onSignOut={() => { void api.logout().catch(() => undefined); auth.clearSession(); setAccountOpen(false) }} onToggleAccount={() => { setAccountOpen((open) => !open); setMobileOpen(false) }} mobileOpen={mobileOpen} onToggleMobile={() => { setMobileOpen((open) => !open); setAccountOpen(false) }} /></div></header>
}

function HeaderNavigation({ items, activeRoute, onNavigate, ariaLabel, open, copy, accountHref, billingHref, authenticated, user, onClose, onLogin, onSignOut }: { items: NavItem[]; activeRoute: Route; onNavigate: (route: Route) => void; ariaLabel: string; open: boolean; copy: HeaderCopy; accountHref: string; billingHref: string; authenticated: boolean; user: ReturnType<typeof useAuthStore.getState>['user']; onClose: () => void; onLogin: () => void; onSignOut: () => void }) {
  const name = user?.nickname || user?.email || copy.signIn
  const email = user?.email || ''
  const plan = user ? (user.is_vip || user.is_paid ? copy.planPremium : copy.planFree) : ''
  const credits = user?.remain_coins !== undefined ? String(user.remain_coins) : copy.unknownValue
  return <nav id="primary-navigation" className={open ? 'main-nav open' : 'main-nav'} aria-label={ariaLabel}><div className="mobile-nav-links">{items.map((item) => <a className={activeRoute === item.route ? 'nav-link active' : 'nav-link'} key={item.route} href={item.href} onClick={(event) => handleNavClick(event, onNavigate, item.route)} aria-current={activeRoute === item.route ? 'page' : undefined}>{item.label}</a>)}</div><MobileAccountPanel authenticated={authenticated} name={name} email={email} avatar={user?.avatar} planLabel={copy.planLabel} plan={plan} creditsLabel={copy.creditsLabel} credits={credits} account={copy.account} billing={copy.billing} signOut={copy.signOut} signIn={copy.signIn} accountHref={accountHref} billingHref={billingHref} onClose={onClose} onLogin={onLogin} onSignOut={onSignOut} /></nav>
}

function HeaderActions({ copy, accountRef, accountOpen, accountHref, billingHref, authenticated, user, onLogin, onSignOut, onToggleAccount, mobileOpen, onToggleMobile }: { copy: HeaderCopy; accountRef: RefObject<HTMLDivElement | null>; accountOpen: boolean; accountHref: string; billingHref: string; authenticated: boolean; user: ReturnType<typeof useAuthStore.getState>['user']; onLogin: () => void; onSignOut: () => void; onToggleAccount: () => void; mobileOpen: boolean; onToggleMobile: () => void }) {
  return <div className="header-actions">{authenticated ? <AccountMenu copy={copy} accountRef={accountRef} open={accountOpen} accountHref={accountHref} billingHref={billingHref} user={user} onToggle={onToggleAccount} onSignOut={onSignOut} /> : <button type="button" className="dark-button header-login-button" onClick={onLogin}>{copy.signIn}</button>}<button className="menu-button" onClick={onToggleMobile} aria-label={mobileOpen ? copy.closeMenu : copy.openMenu} aria-expanded={mobileOpen} aria-controls="primary-navigation"><Icon name="menu" /></button></div>
}

function AccountMenu({ copy, accountRef, open, accountHref, billingHref, user, onToggle, onSignOut }: { copy: HeaderCopy; accountRef: RefObject<HTMLDivElement | null>; open: boolean; accountHref: string; billingHref: string; user: ReturnType<typeof useAuthStore.getState>['user']; onToggle: () => void; onSignOut: () => void }) {
  const name = user?.nickname || user?.email || copy.signIn
  return <div ref={accountRef} className="header-account"><button type="button" className="avatar-button" onClick={onToggle} aria-label={copy.accountMenu} aria-haspopup="menu" aria-expanded={open}>{user?.avatar ? <img src={user.avatar} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}</button>{open && <AccountPopover copy={copy} accountHref={accountHref} billingHref={billingHref} user={user} onClose={onToggle} onSignOut={onSignOut} />}</div>
}

function AccountPopover({ copy, accountHref, billingHref, user, onClose, onSignOut }: { copy: HeaderCopy; accountHref: string; billingHref: string; user: ReturnType<typeof useAuthStore.getState>['user']; onClose: () => void; onSignOut: () => void }) {
  const name = user?.nickname || user?.email || copy.signIn
  const plan = user ? (user.is_vip || user.is_paid ? copy.planPremium : copy.planFree) : copy.unknownValue
  const credits = user?.remain_coins !== undefined ? String(user.remain_coins) : copy.unknownValue
  return <div className="account-popover" role="menu"><div className="account-popover-profile"><div className="account-popover-avatar">{user?.avatar ? <img src={user.avatar} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}</div><div className="account-popover-identity"><strong>{name}</strong>{user?.email && <span>{user.email}</span>}</div></div><div className="account-popover-summary"><div><span>{copy.planLabel}</span><strong>{plan}</strong></div><div><span>{copy.creditsLabel}</span><strong>{credits}</strong></div></div><div className="account-popover-links"><Link role="menuitem" href={accountHref} onClick={onClose}><Icon name="user" />{copy.account}</Link><Link role="menuitem" href={billingHref} onClick={onClose}><Icon name="credit-card" />{copy.billing}</Link><button type="button" onClick={onSignOut}><Icon name="logout" />{copy.signOut}</button></div></div>
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function handleNavClick(event: MouseEvent<HTMLAnchorElement>, navigate: (route: Route) => void, next: Route) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  navigate(next)
}

```

## `src/components/site/site-footer.tsx`
```tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LANGUAGE_TAGS, LOCALES, localeFromPathname, type Locale } from '@/src/lib/locale'
import { pagePath } from '@/src/lib/locale-routing'

export function SiteFooter({ locale: providedLocale }: { locale?: Locale }) {
  const pathname = usePathname()
  const locale = providedLocale ?? localeFromPathname(pathname)
  const router = useRouter()
  const t = useTranslations('footer')
  const [languageOpen, setLanguageOpen] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const changeLanguage = (nextLocale: Locale) => {
    const query = typeof window === 'undefined' ? '' : window.location.search + window.location.hash
    router.push(pagePath(pathname, nextLocale, query))
    setLanguageOpen(false)
  }
  useEffect(() => {
    if (!languageOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setLanguageOpen(false) }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !languageRef.current?.contains(event.target)) setLanguageOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [languageOpen])

  return <footer className="site-footer"><div className="site-footer-inner"><div className="footer-meta"><div className="footer-brand">Img.Upscaler</div><p>{t('copyright')}</p></div><div className="footer-links"><Link href={pagePath('/privacy-policy', locale)}>{t('privacy')}</Link><Link href={pagePath('/terms', locale)}>{t('terms')}</Link><Link href={pagePath('/cookies', locale)}>{t('cookies')}</Link><a href="mailto:support@imgupscaler.com">{t('contact')}</a><div ref={languageRef} className="footer-language"><button type="button" className="footer-language-button" aria-haspopup="menu" aria-expanded={languageOpen} aria-label={t('switchLanguage')} onClick={() => setLanguageOpen((open) => !open)}><span>{t(`languageNames.${locale}`)}</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button><div className="footer-language-menu" role="menu" hidden={!languageOpen}>{LOCALES.map((nextLocale) => <Link key={nextLocale} href={pagePath(pathname, nextLocale)} prefetch={false} hrefLang={LANGUAGE_TAGS[nextLocale]} lang={LANGUAGE_TAGS[nextLocale]} dir="auto" role="menuitem" aria-current={nextLocale === locale ? 'page' : undefined} onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); changeLanguage(nextLocale) }}>{t(`languageNames.${nextLocale}`)}</Link>)}</div></div></div></div></footer>
}

```

## `src/components/site/mobile-account-panel.tsx`
```tsx
import Link from 'next/link'
import { Icon } from '@/src/components/ui/icons'

type MobileAccountPanelProps = {
  authenticated: boolean
  name: string
  email: string
  avatar?: string
  planLabel: string
  plan: string
  creditsLabel: string
  credits: string
  account: string
  billing: string
  signOut: string
  signIn: string
  accountHref: string
  billingHref: string
  onClose: () => void
  onLogin: () => void
  onSignOut: () => void
}

/** Authenticated actions shown below the mobile navigation links. */
export function MobileAccountPanel({ authenticated, name, email, avatar, planLabel, plan, creditsLabel, credits, account, billing, signOut, signIn, accountHref, billingHref, onClose, onLogin, onSignOut }: MobileAccountPanelProps) {
  return <div className="mobile-nav-account"><div className="mobile-nav-account-content">{authenticated ? <><ProfileSummary name={name} email={email} avatar={avatar} /><PlanSummary planLabel={planLabel} plan={plan} creditsLabel={creditsLabel} credits={credits} /><div className="mobile-account-links"><Link href={accountHref} onClick={onClose}><Icon name="user" />{account}</Link><Link href={billingHref} onClick={onClose}><Icon name="credit-card" />{billing}</Link><button type="button" onClick={onSignOut}><Icon name="logout" />{signOut}</button></div></> : <button type="button" className="dark-button full mobile-sign-in" onClick={() => { onClose(); onLogin() }}>{signIn}<Icon name="arrow" /></button>}</div></div>
}

function ProfileSummary({ name, email, avatar }: { name: string; email: string; avatar?: string }) {
  return <div className="mobile-account-profile"><div className="mobile-account-avatar">{avatar ? <img src={avatar} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}</div><div className="mobile-account-identity"><strong>{name}</strong>{email && <span>{email}</span>}</div></div>
}

function PlanSummary({ planLabel, plan, creditsLabel, credits }: { planLabel: string; plan: string; creditsLabel: string; credits: string }) {
  return <div className="mobile-account-summary"><div><span>{planLabel}</span><strong>{plan}</strong></div><div><span>{creditsLabel}</span><strong>{credits}</strong></div></div>
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

```

## `src/components/site/localized-root.tsx`
```tsx
import '@/src/styles.css'
import { IntlProvider } from '@/app/intl-provider'
import { LANGUAGE_TAGS, type Locale } from '@/src/lib/locale'
import { loadMessages } from '@/src/lib/messages'
import { absoluteUrl, SITE_INDEXABLE } from '@/src/lib/site-config'
import { pagePath } from '@/src/lib/locale-routing'

export async function LocalizedRoot({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const messages = await loadMessages(locale)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl(pagePath('/', locale))}#website`,
    name: 'Img.Upscaler',
    url: absoluteUrl(pagePath('/', locale)),
    inLanguage: LANGUAGE_TAGS[locale],
  }

  return <html lang={LANGUAGE_TAGS[locale]} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
    <body>
      <IntlProvider locale={locale} messages={messages}>{children}</IntlProvider>
      {SITE_INDEXABLE && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />}
    </body>
  </html>
}

```

## `app/intl-provider.tsx`
```tsx
'use client'

import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import type { Locale } from '@/src/lib/locale'

export function IntlProvider({ children, locale, messages }: {
  children: React.ReactNode
  locale: Locale
  messages: AbstractIntlMessages
}) {
  return <NextIntlClientProvider locale={locale} timeZone="Asia/Hong_Kong" messages={messages}>{children}</NextIntlClientProvider>
}

```
