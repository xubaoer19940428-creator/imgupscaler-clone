'use client'

import { useState } from 'react'
import { Icon } from '@/src/components/ui/icons'
import type { Route } from '@/src/lib/types'

const plans = [
  { name: '免费', monthly: '$0', annual: '$0', label: '先试用一下', description: '最适合用于测试AI图像放大功能，并每月优化少量图片。', features: ['每月50积分', '无需订阅', '试用 AI 图像放大与增强功能', '可使用 Reimagine AI', '单张图片处理', '包含广告'], featured: false },
  { name: 'Premium', monthly: '$9.90', annual: '$6.14', label: '最受欢迎', description: '特别适合经常需要优化图片的创作者、营销人员和小团队。', features: ['每月500积分', '电子邮件支持', '可使用 Reimagine AI', '批量处理', '无广告', '最适合普通创作者的选择'], featured: true },
  { name: 'Business', monthly: '$19.90', annual: '$12.34', label: '适用于高容量', description: '适用于无需信用额度的企业及生产工作流。', features: ['无积分限制', '电子邮件支持', '单个和批量处理', '可使用 Reimagine AI', '无广告', '最适合商业及高使用量场景'], featured: false },
]

const pricingFaqs = [
  ['我应该选择哪个套餐？', '若仅需测试 ImgUpscaler，请选择“免费”套餐。若您经常进行图像增强且需要批量处理、更多积分、Reimagine AI 功能以及无广告体验，请选择“高级”套餐。若您因频繁进行商业或生产工作而需要无积分限制，请选择“企业”套餐。'],
  ['积分能让我做什么？', '积分用于AI处理任务，例如图像放大、图像增强及相关创意工作流程。付费套餐提供更多循环处理额度，让您在每个计费周期内能够处理更多图像。'],
  ['我可以随时取消订阅吗？', '是的。您可以在账户计费页面取消订阅。您的访问权限和积分将保留至当前计费周期结束。'],
  ['如果积分用完了，如何获取更多积分？', '升级至更高阶套餐，即可获得更大的定期信用额度。如果您经常处理图像集或使用 Reimagine AI，通常选择 Premium 或 Business 套餐会比 Free 套餐更合适。'],
  ['在这个网站上付款安全吗？', '是的。支付处理由安全的支付服务商负责，交易均经过加密处理。'],
  ['我以后可以升级或降级套餐吗？', '是的。您可以随时通过账户中的“账单”部分更改套餐。'],
  ['如果付款失败，我该怎么办？', '请通过 support@imgupscaler.com 联系客服，并提供您的账户邮箱及大致付款时间，以便我们及时为您提供帮助。'],
  ['我的订阅费用何时收取？', '您的订阅将在每个计费周期（按月或按年）的同一天自动续订，该日期即为您最初的购买日期。'],
  ['我可以将处理结果用于商业项目吗？', '可以。免费或付费生成的结果均可用于个人和商业项目，但需遵守适用法律及原始图片的相关权利。'],
] as const

export function PricingPage({ onChoose, onLogin }: { onChoose: (route: Route) => void; onLogin: () => void }) {
  const [annual, setAnnual] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const choosePlan = (planName: string) => planName === '免费' ? onChoose('home') : onLogin()
  return <main className="pricing-page"><section className="pricing-hero section-wrap"><h1>选择适合您图像工作流的套餐</h1><p>ImgUpscaler 和 Reimagine 可免费使用。当您需要更多积分、批量处理或更高处理量时再升级。</p><div className="billing-toggle"><button type="button" className={!annual ? 'active' : ''} aria-pressed={!annual} onClick={() => setAnnual(false)}>每月</button><button type="button" className={annual ? 'active' : ''} aria-pressed={annual} onClick={() => setAnnual(true)}>每年 <span>最佳价值</span></button></div></section><section className="plans-grid section-wrap">{plans.map((plan) => <article className={plan.featured ? 'plan-card featured' : 'plan-card'} key={plan.name}>{plan.featured && <span className="popular-badge">推荐</span>}<span className="plan-label">{plan.label}</span><h2>{plan.name}</h2><div className="plan-price">{annual ? plan.annual : plan.monthly}<small>{annual ? '/mo · 按年计费' : '/mo'}</small></div>{plan.featured || plan.name === 'Business' ? <p className="plan-highlight">{plan.name === 'Business' ? '无积分限制' : '500 每月积分'}</p> : null}<p className="plan-description">{plan.description}</p><ul>{plan.features.map((feature) => <li key={feature}><Icon name="check" />{feature}</li>)}</ul><button type="button" className={plan.featured ? 'dark-button full' : 'outline-button full'} onClick={() => choosePlan(plan.name)}>{plan.name === '免费' ? '立即免费试用' : plan.name === 'Premium' ? '选择高级版' : '选择业务类型'} <Icon name="arrow" /></button>{plan.name === '免费' && <p className="plan-footnote">无需付费订阅。</p>}</article>)}<p className="billing-note">安全结算。您可随时在账户账单页面取消订阅。</p></section><section className="pricing-note section-wrap"><div><span className="feature-icon"><Icon name="lock" /></span><h2>为何升级物有所值</h2></div><p>付费套餐专为需要更大处理能力、更高效的工作流程以及更清晰图像效果的用户设计，适用于实际项目，而不仅仅是偶尔的测试。</p></section><section className="pricing-benefits section-wrap"><article><h3>更多创作空间</h3><p>在AI图像放大、照片增强及Reimagine AI功能中使用更多积分，且不触及免费套餐的上限。</p></article><article><h3>批量工作流</h3><p>无论您是在准备电商照片、社交媒体素材、AI艺术作品、人像照片还是客户交付物，都能更快地处理多张图片。</p></article><article><h3>高级创意工具</h3><p>升级以获取更高容量的增强工作流、Reimagine AI 功能以及更清晰的商业级输出效果。</p></article><article><h3>付费套餐无广告</h3><p>通过更简洁的工作区和更少的干扰，让您专注于图像编辑和导出。</p></article><article><h3>安全计费</h3><p>结账流程通过安全的支付服务商处理，您可通过账户管理套餐变更。</p></article><article><h3>专为商业用途打造</h3><p>为产品列表、广告、作品集、社交媒体帖子、演示文稿及客户项目制作更高质量的视觉素材。</p></article></section><section className="pricing-faq section-wrap"><div className="section-heading compact"><div><span className="kicker">定价常见问题解答</span><h2>关于积分、计费周期与<br /><em>套餐升级。</em></h2></div><p>关于积分、计费周期、套餐升级、结账流程以及如何选择合适的 ImgUpscaler 套餐的常见问题。</p></div><div className="faq-list">{pricingFaqs.map(([question, answer], index) => { const expanded = faqOpen === index; const answerId = `pricing-faq-answer-${index}`; return <article className={expanded ? 'faq-item expanded' : 'faq-item'} key={question}><button type="button" aria-expanded={expanded} aria-controls={answerId} onClick={() => setFaqOpen(expanded ? null : index)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{question}</strong><Icon name="chevron" /></button><p id={answerId} hidden={!expanded}>{answer}</p></article> })}</div></section></main>
}
