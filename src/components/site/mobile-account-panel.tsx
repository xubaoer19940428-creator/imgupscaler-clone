import Link from 'next/link'
import { Icon } from '@/src/components/ui/icons'

type MobileAccountPanelProps = {
  name: string
  email: string
  planLabel: string
  plan: string
  creditsLabel: string
  account: string
  billing: string
  signOut: string
  accountHref: string
  billingHref: string
  onClose: () => void
}

/** Authenticated actions shown below the mobile navigation links. */
export function MobileAccountPanel({ name, email, planLabel, plan, creditsLabel, account, billing, signOut, accountHref, billingHref, onClose }: MobileAccountPanelProps) {
  return <div className="mobile-nav-account"><div className="mobile-nav-account-content"><ProfileSummary name={name} email={email} /><PlanSummary planLabel={planLabel} plan={plan} creditsLabel={creditsLabel} /><div className="mobile-account-links"><Link href={accountHref} onClick={onClose}><Icon name="user" />{account}</Link><Link href={billingHref} onClick={onClose}><Icon name="credit-card" />{billing}</Link><button type="button" onClick={onClose}><Icon name="logout" />{signOut}</button></div></div></div>
}

function ProfileSummary({ name, email }: { name: string; email: string }) {
  return <div className="mobile-account-profile"><div className="mobile-account-avatar"><img src="/reference/unnamed.jpg" alt={name} /></div><div className="mobile-account-identity"><strong>{name}</strong><span>{email}</span></div></div>
}

function PlanSummary({ planLabel, plan, creditsLabel }: { planLabel: string; plan: string; creditsLabel: string }) {
  return <div className="mobile-account-summary"><div><span>{planLabel}</span><strong>{plan}</strong></div><div><span>{creditsLabel}</span><strong>50</strong></div></div>
}
