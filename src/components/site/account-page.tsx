'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from '@/src/lib/types'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

type AccountTab = 'profile' | 'billing' | 'security'
type Locale = 'zh' | 'en'
type AccountCopy = Record<AccountTab | 'back' | 'member' | 'name' | 'title' | 'current' | 'credits' | 'save' | 'redeem' | 'redeemAction' | 'upgrade' | 'signOut' | 'update' | 'danger' | 'delete' | 'saved' | 'deleted' | 'email' | 'avatar' | 'currentPassword' | 'newPassword' | 'billingNote' | 'signIn', string>

const copy: Record<Locale, AccountCopy> = {
  zh: { back: '返回工作区', member: '会员', profile: '个人简介', billing: '订阅与积分', security: '安全设置', name: '钱诚', title: '我的账户', current: '当前方案', credits: '可用积分', save: '保存更改', redeem: '兑换码', redeemAction: '兑换', upgrade: '升级方案', signOut: '退出登录', update: '更新密码', danger: '危险区域', delete: '删除账户', saved: '演示保存成功，真实服务端接入后提交。', deleted: '演示删除已拦截，生产环境需要二次确认。', email: '电子邮件', avatar: '头像链接', currentPassword: '当前密码', newPassword: '新密码', billingNote: '升级、取消订阅、支付记录和积分扣减必须由服务端和支付 webhook 维护。', signIn: '登录' },
  en: { back: 'Back to workspace', member: 'MEMBER', profile: 'Profile', billing: 'Billing', security: 'Security', name: 'Qian Cheng', title: 'My account', current: 'CURRENT PLAN', credits: 'AVAILABLE CREDITS', save: 'Save changes', redeem: 'Redeem code', redeemAction: 'Redeem', upgrade: 'Upgrade plan', signOut: 'Sign out', update: 'Update password', danger: 'Danger zone', delete: 'Delete account', saved: 'Demo saved locally; connect your server to persist changes.', deleted: 'Demo deletion blocked; production needs confirmation.', email: 'Email', avatar: 'Avatar URL', currentPassword: 'Current password', newPassword: 'New password', billingNote: 'Upgrades, cancellations, payment history, and credit deductions must be maintained by your server and payment webhooks.', signIn: 'Sign in' },
}

/** Account shell mirrors the reference account area while keeping writes local in this demo. */
export function AccountPage({ locale }: { locale: Locale }) {
  const router = useRouter()
  const [tab, setTab] = useState<AccountTab>('profile')
  const [message, setMessage] = useState('')
  const prefix = locale === 'zh' ? '/zh' : ''
  const labels = copy[locale]
  const navigate = (route: Route) => router.push(`${prefix}${route === 'home' ? '/' : `/${route}`}`.replace(/\/\/$/, '/'))
  const notify = (value: string) => setMessage(value)

  return <div className="app-shell"><a className="skip-link" href="#main-content">{locale === 'zh' ? '跳转到主要内容' : 'Skip to content'}</a><SiteHeader onLogin={() => notify(labels.signIn)} onNavigate={navigate} /><main className="account-page" id="main-content"><div className="account-shell"><AccountHeading locale={locale} labels={labels} prefix={prefix} /><div className="account-layout"><AccountTabs tab={tab} labels={labels} onChange={setTab} locale={locale} /><section className="account-panel" aria-live="polite">{tab === 'profile' && <ProfilePanel locale={locale} labels={labels} onNotify={notify} />}{tab === 'billing' && <BillingPanel labels={labels} prefix={prefix} />}{tab === 'security' && <SecurityPanel locale={locale} labels={labels} onNotify={notify} />}{message && <p className="account-feedback" role="status">{message}</p>}</section></div></div></main><SiteFooter locale={locale} /></div>
}

function AccountHeading({ locale, labels, prefix }: { locale: Locale; labels: AccountCopy; prefix: string }) {
  const description = locale === 'zh' ? '管理个人资料、订阅和安全设置。真实登录、账单和积分由你的服务端接入。' : 'Manage your profile, subscription, and security settings. Connect your backend for real authentication, billing, and credits.'
  return <div className="account-heading"><div><Link href={prefix || '/'}>← {labels.back}</Link><span className="kicker">{labels.member}</span><h1>{labels.title}</h1><p>{description}</p></div><span className="account-credit">50 <small>{labels.credits}</small></span></div>
}

function AccountTabs({ tab, labels, onChange, locale }: { tab: AccountTab; labels: AccountCopy; onChange: (tab: AccountTab) => void; locale: Locale }) {
  return <nav className="account-tabs" aria-label={locale === 'zh' ? '账户设置' : 'Account settings'}>{(['profile', 'billing', 'security'] as AccountTab[]).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => onChange(item)}>{labels[item]}</button>)}</nav>
}

function ProfilePanel({ locale, labels, onNotify }: { locale: Locale; labels: AccountCopy; onNotify: (message: string) => void }) {
  const email = locale === 'zh' ? 'xubaoer19940428@gmail.com' : 'demo@example.com'
  return <><span className="kicker">{locale === 'zh' ? '个人资料' : 'Profile'}</span><h2>{labels.profile}</h2><label>{locale === 'zh' ? '显示名称' : 'Display name'}<input name="displayName" defaultValue={labels.name} autoComplete="name" /></label><label>{labels.avatar}<input name="avatarUrl" placeholder="https://example.com/avatar.png" autoComplete="url" /></label><label>{labels.email}<input name="email" defaultValue={email} type="email" autoComplete="email" /></label><button className="dark-button" onClick={() => onNotify(labels.saved)}>{labels.save}</button><label>{labels.redeem}<input name="redeemCode" autoComplete="off" /></label><button className="outline-button" onClick={() => onNotify(labels.saved)}>{labels.redeemAction}</button><button className="text-button" onClick={() => onNotify(labels.signOut)}>{labels.signOut}</button></>
}

function BillingPanel({ labels, prefix }: { labels: AccountCopy; prefix: string }) {
  return <><span className="kicker">{labels.billing}</span><h2>{labels.billing}</h2><div className="account-plan"><div><span>{labels.current}</span><strong>{prefix ? '免费' : 'Free'}</strong></div><div><span>{labels.credits}</span><strong>50</strong></div><Link href={`${prefix}/pricing`} className="dark-button">{labels.upgrade}</Link></div><p className="account-note">{labels.billingNote}</p></>
}

function SecurityPanel({ locale, labels, onNotify }: { locale: Locale; labels: AccountCopy; onNotify: (message: string) => void }) {
  const description = locale === 'zh' ? '删除账户并永久清除账户级数据。' : 'Delete your account and permanently remove account-level data.'
  return <><span className="kicker">{labels.security}</span><h2>{labels.security}</h2><label>{labels.currentPassword}<input name="currentPassword" type="password" autoComplete="current-password" /></label><label>{labels.newPassword}<input name="newPassword" type="password" autoComplete="new-password" /></label><button className="dark-button" onClick={() => onNotify(labels.saved)}>{labels.update}</button><div className="danger-zone"><strong>{labels.danger}</strong><p>{description}</p><button className="danger-button" onClick={() => onNotify(labels.deleted)}>{labels.delete}</button></div></>
}
