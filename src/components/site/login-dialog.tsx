'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'
import { api, ApiError } from '@/src/lib/api/client'

export function LoginDialog({
  onClose,
  onSubmit,
  onRegister,
  onGoogle,
  initialMode = 'login',
}: {
  onClose: () => void
  onSubmit: (email: string, password: string) => void | Promise<void>
  onRegister?: (email: string, password: string, code: string) => void | Promise<void>
  onGoogle: () => void | Promise<void>
  initialMode?: 'login' | 'register'
}) {
  const t = useTranslations('auth')
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [googlePending, setGooglePending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [inlineNotice, setInlineNotice] = useState('')
  const [inlineError, setInlineError] = useState('')

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleGoogle = async () => {
    if (googlePending) return
    setGooglePending(true)
    try {
      await onGoogle()
    } finally {
      setGooglePending(false)
    }
  }

  const handleSendCode = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setInlineError(t('emailRequired'))
      return
    }
    if (sendingCode || countdown > 0) return
    setSendingCode(true)
    setInlineError('')
    setInlineNotice('')
    try {
      await api.sendEmail('register', trimmedEmail)
      setInlineNotice(t('codeSent'))
      setCountdown(60)
    } catch (err) {
      const msg = err instanceof ApiError && err.message ? err.message : t('registerFailedDetail')
      setInlineError(msg)
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setInlineError(t('emailRequired'))
      return
    }
    if (!password) {
      setInlineError(t('passwordRequired'))
      return
    }
    if (mode === 'register' && !code.trim()) {
      setInlineError(t('codeRequired'))
      return
    }

    setSubmitting(true)
    setInlineError('')
    try {
      if (mode === 'login') {
        await onSubmit(trimmedEmail, password)
      } else if (onRegister) {
        await onRegister(trimmedEmail, password, code.trim())
      }
    } catch (err) {
      const msg =
        err instanceof ApiError && err.message
          ? err.message
          : mode === 'login'
          ? t('loginFailedDetail')
          : t('registerFailedDetail')
      setInlineError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="editor-backdrop" role="presentation" onClick={onClose}>
      <div
        className="login-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="editor-header">
          <div>
            <span className="kicker">
              {mode === 'login' ? t('kicker') : t('registerKicker')}
            </span>
            <h2 id="login-title">
              {mode === 'login' ? t('title') : t('registerTitle')}
            </h2>
            <p className="editor-subtitle">
              {mode === 'login' ? t('description') : t('registerDescription')}
            </p>
          </div>
          <button
            type="button"
            className="editor-close"
            onClick={onClose}
            aria-label={t('close')}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login')
              setInlineError('')
              setInlineNotice('')
            }}
          >
            {t('tabLogin')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register')
              setInlineError('')
              setInlineNotice('')
            }}
          >
            {t('tabRegister')}
          </button>
        </div>

        <button
          type="button"
          className="google-login-button"
          onClick={handleGoogle}
          disabled={googlePending}
        >
          <GoogleMark />
          {googlePending ? t('googleLoading') : t('google')}
        </button>

        <div className="login-divider">
          <span />
          {t('or')}
          <span />
        </div>

        {inlineNotice && (
          <div className="login-notice" role="status">
            {inlineNotice}
          </div>
        )}
        {inlineError && (
          <div className="login-error" role="alert">
            {inlineError}
          </div>
        )}

        <label>
          {t('email')}
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              if (inlineError) setInlineError('')
            }}
          />
        </label>

        {mode === 'register' && (
          <label>
            {t('code')}
            <div className="code-input-group">
              <input
                type="text"
                placeholder={t('codePlaceholder')}
                maxLength={6}
                value={code}
                onChange={(event) => {
                  setCode(event.target.value)
                  if (inlineError) setInlineError('')
                }}
              />
              <button
                type="button"
                className="send-code-button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0 || !email.trim()}
              >
                {countdown > 0
                  ? `${countdown}s`
                  : sendingCode
                  ? t('codeSending')
                  : t('sendCode')}
              </button>
            </div>
          </label>
        )}

        <label>
          {t('password')}
          <input
            type="password"
            placeholder={t('passwordPlaceholder')}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (inlineError) setInlineError('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSubmit()
            }}
          />
        </label>

        <button
          type="button"
          className="dark-button full"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? `${mode === 'login' ? t('submit') : t('registerSubmit')}…`
            : mode === 'login'
            ? t('submit')
            : t('registerSubmit')}{' '}
          <Icon name="arrow" />
        </button>

        <div className="login-switch-row">
          <span>
            {mode === 'login' ? t('toRegisterPrompt') : t('toLoginPrompt')}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setInlineError('')
              setInlineNotice('')
            }}
          >
            {mode === 'login' ? t('toRegisterLink') : t('toLoginLink')}
          </button>
        </div>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" focusable="false">
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.82h3.14c1.84-1.69 2.91-4.18 2.91-7.79Z"
      />
      <path
        fill="#34A853"
        d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.5Z"
      />
      <path
        fill="#FBBC05"
        d="M6.53 13.58A5.84 5.84 0 0 1 6.22 12c0-.55.11-1.08.31-1.58V7.9H3.28A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.1l3.25-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.39c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.48 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.72 5.4l3.25 2.52C7.3 8.11 9.46 6.39 12 6.39Z"
      />
    </svg>
  )
}
