'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'

export function LoginDialog({ onClose, onSubmit, onGoogle }: { onClose: () => void; onSubmit: (email: string, password: string) => void | Promise<void>; onGoogle: () => void | Promise<void> }) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [googlePending, setGooglePending] = useState(false)
  const handleGoogle = async () => {
    if (googlePending) return
    setGooglePending(true)
    try {
      await onGoogle()
    } finally {
      setGooglePending(false)
    }
  }
  return <div className="editor-backdrop" role="presentation" onClick={onClose}><div className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={(event) => event.stopPropagation()}><div className="editor-header"><div><span className="kicker">{t('kicker')}</span><h2 id="login-title">{t('title')}</h2><p className="editor-subtitle">{t('description')}</p></div><button type="button" className="editor-close" onClick={onClose} aria-label={t('close')}><Icon name="close" /></button></div><button type="button" className="google-login-button" onClick={handleGoogle} disabled={googlePending}><GoogleMark />{googlePending ? t('googleLoading') : t('google')}</button><div className="login-divider"><span />{t('or')}<span /></div><label>{t('email')}<input type="email" placeholder={t('emailPlaceholder')} value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>{t('password')}<input type="password" placeholder={t('passwordPlaceholder')} value={password} onChange={(event) => setPassword(event.target.value)} /></label><button type="button" className="dark-button full" onClick={() => onSubmit(email, password)}>{t('submit')} <Icon name="arrow" /></button></div></div>
}

function GoogleMark() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" focusable="false"><path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.82h3.14c1.84-1.69 2.91-4.18 2.91-7.79Z" /><path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.5Z" /><path fill="#FBBC05" d="M6.53 13.58A5.84 5.84 0 0 1 6.22 12c0-.55.11-1.08.31-1.58V7.9H3.28A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.1l3.25-2.52Z" /><path fill="#EA4335" d="M12 6.39c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.4l3.25 2.52C7.3 8.11 9.46 6.39 12 6.39Z" /></svg>
}
