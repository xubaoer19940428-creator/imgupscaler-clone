import { LegalPage } from '../../../src/components/site/legal-page'

export default function CookiesPage() {
  return <LegalPage locale="zh" title="Cookies" intro="Cookies 是保存在设备上的小型文本文件。本页面说明登录、偏好、分析与广告场景下可能使用的 Cookies，以及您可以进行的选择。" sections={[['1. 必要 Cookies', '这些 Cookies 用于保持登录状态、保存安全设置和完成核心功能，通常无法在系统中关闭。'], ['2. 性能与功能 Cookies', '性能 Cookies 帮助我们了解访问者如何使用服务；功能 Cookies 用于记住语言和其他偏好。'], ['3. 第三方 Cookies', '分析、广告、支付和登录供应商可能设置第三方 Cookies，并依据其自己的隐私政策处理数据。'], ['4. 您的选择', '您可以通过浏览器设置删除或阻止 Cookies。禁用必要 Cookies 可能导致登录、上传或结账功能无法正常工作。'], ['5. 联系我们', '如需了解 Cookies 的使用情况，请联系 support@imgupscaler.com。']]} />
}
