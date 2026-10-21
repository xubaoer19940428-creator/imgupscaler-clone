'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Route } from '@/src/lib/types'
import { routeToPath } from '@/src/lib/locale-routing'
import type { Locale } from '@/src/lib/locale'
import type { ApiUser } from '@/src/lib/api/types'
import { api } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import { LoginDialog } from './login-dialog'
import { Icon } from '@/src/components/ui/icons'

type AccountTab = 'profile' | 'billing' | 'security'

export function AccountPage({ locale: providedLocale }: { locale?: Locale } = {}) {
  const router = useRouter()
  const runtimeLocale = useLocale() as Locale
  const locale = providedLocale ?? runtimeLocale
  const t = useTranslations('account')
  const authT = useTranslations('auth')
  const auth = useAuthStore()
  const [tab, setTab] = useState<AccountTab>('profile')
  const [message, setMessage] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = (route: Route) => router.push(routeToPath(route, locale))

  useEffect(() => { auth.hydrate() }, [auth.hydrate])
  useEffect(() => {
    if (!auth.hydrated) return
    if (!auth.token) { setLoading(false); return }
    if (auth.user) { setLoading(false); return }
    let active = true
    api.profile().then((user) => { if (active) auth.setUser(user) }).catch((error) => {
      if (!active) return
      if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 401) auth.clearSession()
      setMessage(t('loadFailed'))
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [auth.hydrated, auth.token, auth.user, auth.setUser, auth.clearSession, t])

  const signIn = async (email: string, password: string) => {
    const session = await api.login(email, password)
    auth.setSession(session.token, session.user_info)
    setLoginOpen(false)
    setMessage(authT('submitted'))
  }

  const signInWithGoogle = async () => {
    const { redirect_url } = await api.socialLogin('google')
    window.location.assign(redirect_url)
  }

  const signOut = async () => { await api.logout().catch(() => undefined); auth.clearSession() }
  return <div className="app-shell"><SiteHeader onLogin={() => setLoginOpen(true)} onNavigate={navigate} /><main className="account-page" id="main-content"><div className="account-shell">{loading ? <p className="account-feedback">{t('loading')}</p> : !auth.user ? <section className="account-empty"><span className="kicker">{t('member')}</span><h1>{t('title')}</h1><p>{t('signInPrompt')}</p><button className="dark-button" type="button" onClick={() => setLoginOpen(true)}>{t('signIn')} <Icon name="arrow" /></button></section> : <><AccountHeading t={t} user={auth.user} /><div className="account-layout"><AccountTabs tab={tab} t={t} onChange={setTab} /><section className="account-panel" aria-live="polite">{tab === 'profile' && <ProfilePanel t={t} user={auth.user} onNotify={setMessage} onUser={auth.setUser} onSignOut={signOut} />}{tab === 'billing' && <BillingPanel t={t} locale={locale} user={auth.user} />}{tab === 'security' && <SecurityPanel t={t} onNotify={setMessage} />}{message && <p className="account-feedback" role="status">{message}</p>}</section></div></>}</div></main><SiteFooter locale={locale} />{loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onGoogle={signInWithGoogle} onSubmit={async (email, password) => { try { await signIn(email, password) } catch { setMessage(authT('loginFailedDetail')) } }} />}</div>
}

function AccountHeading({ t, user }: { t: ReturnType<typeof useTranslations<'account'>>; user: ApiUser }) {
  const name = user.nickname || user.email || t('unknown')
  const plan = user.is_vip || user.is_paid ? t('planPremium') : t('planFree')
  const credits = user.remain_coins !== undefined ? String(user.remain_coins) : t('unknown')
  return <section className="account-heading" aria-labelledby="account-title"><div className="account-identity"><div className="account-profile-avatar">{user.avatar ? <img src={user.avatar} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}</div><div className="account-identity-copy"><span className="kicker">{t('member')}</span><h1 id="account-title">{name}</h1><p>{user.email || t('unknown')}</p></div></div><div className="account-summary"><div><span>{t('current')}</span><strong>{plan}</strong></div><div><span>{t('credits')}</span><strong><span className="account-summary-zap" aria-hidden="true">✦</span>{credits}</strong></div></div></section>
}

function AccountTabs({ tab, t, onChange }: { tab: AccountTab; t: ReturnType<typeof useTranslations<'account'>>; onChange: (tab: AccountTab) => void }) {
  const icons: Record<AccountTab, 'user' | 'credit-card' | 'lock'> = { profile: 'user', billing: 'credit-card', security: 'lock' }
  return <nav className="account-tabs" aria-label={t('settings')}>{(['profile', 'billing', 'security'] as AccountTab[]).map((item) => <button type="button" key={item} className={tab === item ? 'active' : ''} onClick={() => onChange(item)}><Icon name={icons[item]} />{t(item)}</button>)}</nav>
}

function ProfilePanel({ t, user, onNotify, onUser, onSignOut }: { t: ReturnType<typeof useTranslations<'account'>>; user: ApiUser; onNotify: (message: string) => void; onUser: (user: ApiUser | null) => void; onSignOut: () => void | Promise<void> }) {
  const [displayName, setDisplayName] = useState(user.nickname || '')
  const [avatar, setAvatar] = useState(user.avatar || '')
  const [redeemCode, setRedeemCode] = useState('')
  const save = async () => { try { onUser(await api.updateProfile({ nickname: displayName.trim() || undefined, avatar: avatar.trim() || undefined })); onNotify(t('saved')) } catch { onNotify(t('saveFailed')) } }
  const redeem = async () => { if (!redeemCode.trim()) return; try { await api.redeem(redeemCode.trim()); onNotify(t('redeemed')); setRedeemCode('') } catch { onNotify(t('redeemFailed')) } }
  const deleteAccount = async () => { if (!window.confirm(t('deleteConfirm'))) return; try { await api.deleteAccount(); useAuthStore.getState().clearSession(); onNotify(t('deleted')) } catch { onNotify(t('deleteFailed')) } }
  return <><span className="kicker">{t('profileKicker')}</span><h2>{t('profile')}</h2><label>{t('displayName')}<input name="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label><label>{t('avatar')}<input name="avatarUrl" value={avatar} onChange={(event) => setAvatar(event.target.value)} placeholder={t('placeholderAvatar')} autoComplete="url" /></label><label>{t('email')}<input name="email" value={user.email || ''} readOnly type="email" autoComplete="email" /></label><button className="dark-button" type="button" onClick={() => void save()}>{t('save')}</button><label>{t('redeem')}<input name="redeemCode" value={redeemCode} onChange={(event) => setRedeemCode(event.target.value)} autoComplete="off" /></label><button className="outline-button" type="button" onClick={() => void redeem()}>{t('redeemAction')}</button><button className="text-button" type="button" onClick={() => void onSignOut()}>{t('signOut')}</button><div className="danger-zone"><strong>{t('danger')}</strong><p>{t('dangerDescription')}</p><button className="danger-button" type="button" onClick={() => void deleteAccount()}>{t('delete')}</button></div></>
}

function BillingPanel({ t, locale, user }: { t: ReturnType<typeof useTranslations<'account'>>; locale: Locale; user: ApiUser }) {
  const plan = user.is_vip || user.is_paid ? t('planPremium') : t('planFree')
  const credits = user.remain_coins !== undefined ? String(user.remain_coins) : t('unknown')
  return <><span className="kicker">{t('billing')}</span><h2>{t('billing')}</h2><div className="account-plan"><div><span>{t('current')}</span><strong>{plan}</strong></div><div><span>{t('credits')}</span><strong>{credits}</strong></div><Link href={routeToPath('pricing', locale)} className="dark-button">{t('upgrade')}</Link></div><p className="account-note">{t('billingNote')}</p></>
}

function SecurityPanel({ t, onNotify }: { t: ReturnType<typeof useTranslations<'account'>>; onNotify: (message: string) => void }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const update = async () => { try { await api.changePassword(oldPassword, newPassword); setOldPassword(''); setNewPassword(''); onNotify(t('passwordUpdated')) } catch { onNotify(t('passwordFailed')) } }
  return <><span className="kicker">{t('security')}</span><h2>{t('security')}</h2><label>{t('currentPassword')}<input name="currentPassword" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} type="password" autoComplete="current-password" /></label><label>{t('newPassword')}<input name="newPassword" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" autoComplete="new-password" /></label><button className="dark-button" type="button" onClick={() => void update()}>{t('update')}</button></>
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}
