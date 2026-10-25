'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Route } from '@/src/lib/types'
import { routeToPath } from '@/src/lib/locale-routing'
import type { Locale } from '@/src/lib/locale'
import type { ApiUser, FileRecord } from '@/src/lib/api/types'
import { api, ApiError } from '@/src/lib/api/client'
import { useAuthStore } from '@/src/stores/auth-store'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'
import { LoginDialog } from './login-dialog'
import { Icon } from '@/src/components/ui/icons'

type AccountTab = 'profile' | 'history' | 'billing'

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

  const register = async (email: string, password: string, code: string) => {
    const session = await api.register(email, password, code)
    auth.setSession(session.token, session.user_info)
    setLoginOpen(false)
    setMessage(authT('registered'))
  }

  const signInWithGoogle = async () => {
    const { redirect_url } = await api.socialLogin('google')
    window.location.assign(redirect_url)
  }

  const signOut = async () => { await api.logout().catch(() => undefined); auth.clearSession() }
  return <div className="app-shell"><SiteHeader onLogin={() => setLoginOpen(true)} onNavigate={navigate} /><main className="account-page" id="main-content"><div className="account-shell">{loading ? <p className="account-feedback">{t('loading')}</p> : !auth.user ? <section className="account-empty"><span className="kicker">{t('member')}</span><h1>{t('title')}</h1><p>{t('signInPrompt')}</p><button className="dark-button" type="button" onClick={() => setLoginOpen(true)}>{t('signIn')} <Icon name="arrow" /></button></section> : <><AccountHeading t={t} user={auth.user} /><div className="account-layout"><AccountTabs tab={tab} t={t} onChange={setTab} /><section className="account-panel" aria-live="polite">{tab === 'profile' && <ProfilePanel t={t} user={auth.user} onNotify={setMessage} onUser={auth.setUser} onSignOut={signOut} />}{tab === 'history' && <HistoryPanel t={t} locale={locale} onNotify={setMessage} />}{tab === 'billing' && <BillingPanel t={t} locale={locale} user={auth.user} />}{message && <p className="account-feedback" role="status">{message}</p>}</section></div></>}</div></main><SiteFooter locale={locale} />{loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} onGoogle={signInWithGoogle} onSubmit={async (email, password) => { try { await signIn(email, password) } catch (err) { setMessage(authT('loginFailedDetail')); throw err; } }} onRegister={async (email, password, code) => { try { const msg = authT('registerFailedDetail'); throw new Error(msg); } catch (err) { const msg = err instanceof ApiError && err.message ? err.message : authT('registerFailedDetail'); setMessage(msg); throw err; } }} />}</div>
}

function AccountHeading({ t, user }: { t: ReturnType<typeof useTranslations<'account'>>; user: ApiUser }) {
  const name = user.nickname || user.email || t('unknown')
  const plan = user.is_vip || user.is_paid ? t('planPremium') : t('planFree')
  const credits = user.remain_coins !== undefined ? String(user.remain_coins) : t('unknown')
  return <section className="account-heading" aria-labelledby="account-title"><div className="account-identity"><div className="account-profile-avatar">{user.avatar ? <img src={user.avatar} alt={name} /> : <span aria-hidden="true">{initials(name)}</span>}</div><div className="account-identity-copy"><span className="kicker">{t('member')}</span><h1 id="account-title">{name}</h1><p>{user.email || t('unknown')}</p></div></div><div className="account-summary"><div><span>{t('current')}</span><strong>{plan}</strong></div><div><span>{t('credits')}</span><strong><span className="account-summary-zap" aria-hidden="true">✦</span>{credits}</strong></div></div></section>
}

function AccountTabs({ tab, t, onChange }: { tab: AccountTab; t: ReturnType<typeof useTranslations<'account'>>; onChange: (tab: AccountTab) => void }) {
  const icons: Record<AccountTab, 'user' | 'history' | 'credit-card'> = { profile: 'user', history: 'history', billing: 'credit-card' }
  return <nav className="account-tabs" aria-label={t('settings')}>{(['profile', 'history', 'billing'] as AccountTab[]).map((item) => <button type="button" key={item} className={tab === item ? 'active' : ''} onClick={() => onChange(item)}><Icon name={icons[item]} />{t(item)}</button>)}</nav>
}

type HistoryCategory = 'generated' | 'uploaded' | 'all'

function HistoryPanel({ t, locale, onNotify }: { t: ReturnType<typeof useTranslations<'account'>>; locale: Locale; onNotify: (message: string) => void }) {
  const [records, setRecords] = useState<FileRecord[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 8
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<HistoryCategory>('generated')
  const [previewItem, setPreviewItem] = useState<FileRecord | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchHistory = useCallback(async (targetPage: number, targetCategory: HistoryCategory) => {
    setLoading(true)
    try {
      const queryParams: Record<string, unknown> = {
        page: targetPage,
        pageSize,
        fileType: 'image',
      }
      if (targetCategory === 'generated') {
        queryParams.sourceType = 'ai_run'
      } else if (targetCategory === 'uploaded') {
        queryParams.purpose = 'ai_input'
      }

      const res = await api.files(queryParams)
      setRecords(res.list || [])
      setTotal(res.total || 0)
      setPage(targetPage)
    } catch {
      onNotify(t('historyLoadFailed'))
    } finally {
      setLoading(false)
    }
  }, [pageSize, onNotify, t])

  useEffect(() => {
    fetchHistory(1, category)
  }, [category, fetchHistory])

  const handleCategoryChange = (newCat: HistoryCategory) => {
    if (newCat === category) return
    setCategory(newCat)
    setPage(1)
  }

  const handleDelete = async (record: FileRecord) => {
    if (!window.confirm(t('historyDeleteConfirm'))) return
    setDeletingId(record.id)
    try {
      await api.deleteFile(record.id)
      onNotify(t('historyDeleteSuccess'))
      const nextPage = records.length === 1 && page > 1 ? page - 1 : page
      fetchHistory(nextPage, category)
    } catch {
      onNotify(t('historyDeleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleDownload = (record: FileRecord) => {
    const a = document.createElement('a')
    a.href = record.file_url
    a.download = record.file_name || `upscaled-${record.id}.jpg`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const isGeneratedRecord = (item: FileRecord) => {
    const purpose = typeof item.purpose === 'string' ? item.purpose : ''
    return item.source_type === 'ai_run' || purpose === 'ai_output' || (purpose !== 'ai_input' && !purpose.includes('input'))
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const formatSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (val?: unknown) => {
    if (!val) return ''
    const num = Number(val)
    if (isNaN(num)) return String(val)
    const ms = num < 1e11 ? num * 1000 : num
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const emptyTitle =
    category === 'generated'
      ? t('historyEmptyGenerated')
      : category === 'uploaded'
        ? t('historyEmptyUploaded')
        : t('historyEmpty')

  return (
    <>
      <div className="account-history-header">
        <span className="kicker">{t('historyKicker')}</span>
        <h2>{t('history')}</h2>
        <p className="account-history-subtitle">{t('historySubtitle')}</p>

        <div className="account-history-filter-bar" role="tablist" aria-label={t('history')}>
          <button
            type="button"
            role="tab"
            aria-selected={category === 'generated'}
            className={`account-history-filter-btn ${category === 'generated' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('generated')}
          >
            <Icon name="spark" />
            <span>{t('historyFilterGenerated')}</span>
            {category === 'generated' && total > 0 && <span className="badge-count">{total}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={category === 'uploaded'}
            className={`account-history-filter-btn ${category === 'uploaded' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('uploaded')}
          >
            <Icon name="upload" />
            <span>{t('historyFilterUploaded')}</span>
            {category === 'uploaded' && total > 0 && <span className="badge-count">{total}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={category === 'all'}
            className={`account-history-filter-btn ${category === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            <span>{t('historyFilterAll')}</span>
            {category === 'all' && total > 0 && <span className="badge-count">{total}</span>}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="account-feedback">{t('historyLoading')}</p>
      ) : records.length === 0 ? (
        <div className="account-history-empty">
          <div className="account-history-empty-icon">
            <Icon name={category === 'uploaded' ? 'upload' : 'history'} />
          </div>
          <h3>{emptyTitle}</h3>
          <p>{t('historyEmptyDesc')}</p>
          <Link href={routeToPath('home', locale)} className="dark-button">
            {t('historyEmptyAction')} <Icon name="arrow" />
          </Link>
        </div>
      ) : (
        <>
          <div className="account-history-grid">
            {records.map((item) => {
              const generated = isGeneratedRecord(item)
              return (
                <div key={item.id} className="account-history-card">
                  <div
                    className="account-history-thumb-wrap"
                    onClick={() => setPreviewItem(item)}
                  >
                    <img
                      src={item.file_url}
                      alt={item.file_name || 'Image'}
                      className="account-history-thumb"
                      loading="lazy"
                    />
                    <div className="account-history-overlay">
                      <button
                        type="button"
                        className="account-history-action-btn"
                        title={t('preview')}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewItem(item)
                        }}
                      >
                        <Icon name="spark" />
                      </button>
                      <button
                        type="button"
                        className="account-history-action-btn"
                        title={t('download')}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(item)
                        }}
                      >
                        <Icon name="download" />
                      </button>
                      <button
                        type="button"
                        className="account-history-action-btn delete"
                        title={t('delete')}
                        disabled={deletingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item)
                        }}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                  <div className="account-history-meta">
                    <span className="account-history-title" title={item.file_name}>
                      {item.file_name || `image-${item.id}.jpg`}
                    </span>
                    <div className="account-history-info">
                      <span>{formatDate(item.created_at)}</span>
                      {generated ? (
                        <span className="account-history-tag generated">
                          <Icon name="spark" /> {t('tagGenerated')}
                        </span>
                      ) : (
                        <span className="account-history-tag uploaded">
                          <Icon name="upload" /> {t('tagUploaded')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="account-history-pagination">
            <div className="account-history-page-info">
              <span>{t('pageInfo', { page, totalPages })}</span>
              <span>•</span>
              <span>{t('totalCount', { total })}</span>
            </div>
            <div className="account-history-page-btns">
              <button
                type="button"
                className="account-history-page-btn"
                disabled={page <= 1 || loading}
                onClick={() => fetchHistory(page - 1, category)}
              >
                {t('prevPage')}
              </button>
              <button
                type="button"
                className="account-history-page-btn"
                disabled={page >= totalPages || loading}
                onClick={() => fetchHistory(page + 1, category)}
              >
                {t('nextPage')}
              </button>
            </div>
          </div>
        </>
      )}

      {previewItem && (
        <div
          className="account-history-modal-backdrop"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="account-history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="account-history-modal-header">
              <h3>{previewItem.file_name || `image-${previewItem.id}.jpg`}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setPreviewItem(null)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="account-history-modal-body">
              <img
                src={previewItem.file_url}
                alt={previewItem.file_name || 'Preview'}
                className="account-history-modal-img"
              />
            </div>
            <div className="account-history-modal-footer">
              <span className="account-history-subtitle">
                {formatSize(previewItem.file_size)} {formatDate(previewItem.created_at) && `• ${formatDate(previewItem.created_at)}`}
              </span>
              <button
                type="button"
                className="dark-button"
                onClick={() => handleDownload(previewItem)}
              >
                <Icon name="download" /> {t('download')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
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

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}
