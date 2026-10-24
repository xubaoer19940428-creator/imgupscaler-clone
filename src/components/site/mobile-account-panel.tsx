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
  signOut: string
  signIn: string
  accountHref: string
  onClose: () => void
  onLogin: () => void
  onSignOut: () => void
}

/** Authenticated actions shown below the mobile navigation links. */
export function MobileAccountPanel({ authenticated, name, email, avatar, planLabel, plan, creditsLabel, credits, account, signOut, signIn, accountHref, onClose, onLogin, onSignOut }: MobileAccountPanelProps) {
  return <div className="mobile-nav-account"><div className="mobile-nav-account-content">{authenticated ? <><ProfileSummary name={name} email={email} avatar={avatar} /><PlanSummary planLabel={planLabel} plan={plan} creditsLabel={creditsLabel} credits={credits} /><div className="mobile-account-links"><Link href={accountHref} onClick={onClose}><Icon name="user" />{account}</Link><button type="button" onClick={onSignOut}><Icon name="logout" />{signOut}</button></div></> : <button type="button" className="dark-button full mobile-sign-in" onClick={() => { onClose(); onLogin() }}>{signIn}<Icon name="arrow" /></button>}</div></div>
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
