import type { Metadata } from 'next'
import { LegalPage } from '../../../src/components/site/legal-page'

export const metadata: Metadata = { title: '服务条款 — Img.Upscaler' }

export default function TermsPage() {
  return <LegalPage locale="zh" title="服务条款" intro="使用 ImgUpscaler 即表示您同意遵守以下服务条款。正式上线前，请根据实际模型、积分、支付和内容安全策略进行法律审查。" sections={[['1. 服务范围', 'ImgUpscaler 提供在线图像放大、图像增强和 Reimagine AI 工作流。功能、模型、处理上限和可用地区可能随产品迭代而调整。'], ['2. 用户内容', '您必须拥有上传图片的必要权利，或已取得处理该图片的授权。不得上传违法、侵权、恶意或包含未经授权个人信息的内容。'], ['3. 演示限制', '当前复刻版本使用浏览器 Canvas 生成演示结果，不代表真实 AI 输出、商业授权、准确性或服务等级。'], ['4. 积分与订阅', '生产服务中的积分扣减、订阅、退款和账单状态应以账户页面与支付服务商记录为准。免费或付费生成结果是否适合商业项目，仍取决于原始素材权利和适用法律。'], ['5. 可接受使用', '不得尝试绕过额度、滥用批处理、干扰服务、反向攻击模型或将服务用于违法用途。我们可以为安全、维护或法律原因暂停相关任务。'], ['6. 联系方式', '如需帮助，请联系 support@imgupscaler.com。']]} />
}
