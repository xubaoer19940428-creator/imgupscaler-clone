'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Icon } from '@/src/components/ui/icons'

export function LoginDialog({ onClose, onSubmit, onForgot }: { onClose: () => void; onSubmit: () => void; onForgot: () => void }) {
  const locale = useLocale()
  const isChinese = locale === 'zh'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return <div className="editor-backdrop" role="presentation" onClick={onClose}><div className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={(event) => event.stopPropagation()}><div className="editor-header"><div><span className="kicker">{isChinese ? '账户登录' : 'Account / Login'}</span><h2 id="login-title">{isChinese ? '欢迎回来' : 'Welcome back'}</h2><p className="editor-subtitle">{isChinese ? '登录后可同步积分、订阅和处理历史。' : 'Sign in to sync credits, subscriptions, and processing history.'}</p></div><button type="button" className="editor-close" onClick={onClose} aria-label={isChinese ? '关闭登录' : 'Close login'}><Icon name="close" /></button></div><label>{isChinese ? '电子邮件' : 'Email'}<input type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>{isChinese ? '密码' : 'Password'}<input type="password" placeholder={isChinese ? '至少 8 个字符' : 'At least 8 characters'} value={password} onChange={(event) => setPassword(event.target.value)} /></label><button type="button" className="dark-button full" onClick={onSubmit}>{isChinese ? '登录' : 'Sign in'} <Icon name="arrow" /></button><button type="button" className="text-button login-link" onClick={onForgot}>{isChinese ? '忘记密码？' : 'Forgot password?'}</button></div></div>
}
