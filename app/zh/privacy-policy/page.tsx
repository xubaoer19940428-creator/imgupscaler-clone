import type { Metadata } from 'next'
import { LegalPage } from '../../../src/components/site/legal-page'

export const metadata: Metadata = { title: '隐私政策 — Img.Upscaler' }

export default function PrivacyPolicyPage() {
  return <LegalPage locale="zh" title="隐私政策" intro="ImgUpscaler 是由 Sparklightforce Limited 运营的在线 AI 图像放大与增强服务。本页面说明我们如何收集、使用和保护您在使用服务时提供的信息。" sections={[{ title: '1. 我们收集的信息', body: '为提供和改进 ImgUpscaler，我们可能收集电子邮件、账户名称、头像、登录方式、上传图片、生成结果、账单状态、积分余额、使用记录、设备和浏览器信息、IP 地址、Cookies 以及您发送的客服消息。' }, { title: '2. 信息的使用方式', body: '我们使用这些信息来运行图像处理流程、创建和管理账户、验证身份、提供积分和账单功能、防止滥用、处理客服请求、改进服务可靠性、衡量产品性能并履行法律义务。我们不会出售您的个人信息。' }, { title: '3. 上传图片与生成结果', body: '上传的图片仅用于提供放大、增强、预览和下载功能。生产服务中的源图和结果不会作为长期资产保存，处理完成后会在 24 小时内自动删除。当前前端演示只在浏览器内生成本地预览。' }, { title: '4. Cookies 与分析', body: '我们可能使用 Cookies 保存登录状态、偏好设置、服务安全信息并分析流量。接入分析或广告服务时，相关供应商会依据其隐私政策和适用法律处理有限的使用数据。' }, { title: '5. 安全与保留', body: '我们会采取合理的技术和组织措施保护信息。账户、账单和使用记录仅在提供服务、解决争议、防止滥用及满足法律义务所需期间保留。' }, { title: '6. 您的选择', body: '您可以联系 support@imgupscaler.com 请求访问、更正或删除账户信息，也可以通过浏览器设置管理 Cookies。禁用必要 Cookies 可能导致部分功能无法使用。' }, { title: '7. 联系我们', body: '如对本隐私政策有疑问，请发送邮件至 support@imgupscaler.com。Sparklightforce Limited：ROOM 1503-09, 15/F, CAUSEWAY BAY CENTRE, 15-23 SUGAR STREET, CAUSEWAY BAY, HONG KONG。' }]} />
}
