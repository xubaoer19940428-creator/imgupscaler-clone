# Img.Upscaler 前端复刻项目记忆

> 最后更新：2026-09-20
>
> 本文件是当前复刻项目的长期维护记录。后续替换图片、调整页面、接入真实 AI 服务或继续对照参考站时，先阅读本文件，再修改代码。

## 1. 项目目标与当前边界

本项目是 `imgupscaler.com/zh` 以及本地参考稿 `文稿/AI _ ImgUpscaler.html` 的前端复刻版本。目标是先把参考站的页面结构、视觉节奏和前端交互完整搭出来，后续再替换素材、文案和真实服务。

当前版本明确只做前端演示：

- 使用 Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui 风格基础组件、Zustand、next-intl。
- 上传、拖放、预览、处理进度、取消、重试、编辑和下载均可在浏览器中完成。
- “AI 处理”目前是 Canvas 演示，不是真实的超分辨率模型，也不会把图片上传到服务器。
- 登录、账户、积分、订阅和支付页面是可操作的 UI 演示，不会写入真实账户，也不会发起支付。
- `src/services/upscaler.ts` 已经预留真实服务适配边界；接后端时优先替换该边界和工作区控制器，不要把 API 逻辑直接塞进展示组件。

当前不包含：

- 真实 AI 推理、模型队列、鉴权、数据库、文件存储、支付 webhook。
- 真实邮箱登录、密码找回、账户删除和订阅扣款。
- 生产环境内容安全、NSFW 检测、额度扣减、任务过期清理和签名 URL。

## 2. 参考来源与复刻原则

复刻时参考了两类来源：

1. 线上中文站：`https://imgupscaler.com/zh`，用于确认页面层级、产品名称、导航和营销内容方向。
2. 本地 HTML 稿：`文稿/AI _ ImgUpscaler.html`，用于对照落地页的区块顺序、布局节奏、图片位置和页面形态。

后续继续复刻时遵循以下原则：

- 页面外壳、Header、Footer、工作区和营销区块优先复用现有组件。
- 文案和图片尽量放在 `data.tsx`、`messages/*.json`、`public/reference/`，不要把大量内容继续堆进 `src/App.tsx`。
- 一个组件只负责一个明确区域；单文件尽量保持短小，新增嵌套控制在 3～4 层以内。
- 交互状态放在 feature controller/store，视觉组件只接收数据和回调。
- 需要真实服务时，通过 adapter 替换演示实现，保持 UI API 不变。

## 3. 技术栈与启动方式

### 技术栈

- Next.js `latest`，App Router
- React `latest`
- TypeScript `latest`
- Tailwind CSS `^4.3.3` 与 `@tailwindcss/postcss`
- shadcn/ui 风格组件：项目内维护 `src/components/ui/`，未引入完整 shadcn CLI 生成目录
- Zustand `^5.0.15`
- next-intl `^4.14.5`
- JSZip：批量结果 ZIP 下载
- CSS 使用 Google Fonts：DM Sans、Manrope、Plus Jakarta Sans

### 常用命令

```bash
npm install
npm run dev
npm run build
npm start
npx tsc --noEmit
```

默认开发地址：`http://localhost:3000`。

## 4. 页面与路由清单

### 产品页面

| 路由 | 语言 | 页面 | 说明 |
| --- | --- | --- | --- |
| `/` | English 默认壳、产品文案以中文为主 | 图像放大器 | 2K / 4K 输出、批量上传、下载 |
| `/zh` | 中文 | 图像放大器 | 中文入口，与首页共用工作区 |
| `/enhancer` | English 路径 | 图像增强器 | 1K / 2K / 4K 输出预设 |
| `/zh/enhancer` | 中文 | 图像增强器 | 中文增强器入口 |
| `/reimagine` | English 路径 | Reimagine AI | 提示词、创造力、相似度、模型预设 |
| `/zh/reimagine` | 中文 | Reimagine AI | 中文 Reimagine 入口 |
| `/pricing` | English 路径 | 定价 | Free / Premium / Business，月付年付 |
| `/zh/pricing` | 中文 | 定价 | 中文定价入口 |

### 账户与法律页面

| 路由 | 页面 |
| --- | --- |
| `/account`、`/zh/account` | 账户页：Profile / Billing / Security |
| `/privacy-policy`、`/zh/privacy-policy` | 隐私政策 |
| `/terms`、`/zh/terms` | 服务条款 |
| `/cookies`、`/zh/cookies` | Cookie 政策 |

产品页由 `src/App.tsx` 根据 pathname 编排；账户页和法律页是独立壳，但共用 `SiteHeader`、`SiteFooter` 和统一样式。

## 5. 页面结构与区块顺序

### 产品落地页

产品页的主结构位于 `src/App.tsx` 的 `LandingPage`：

1. `SiteHeader`
2. `Hero`
   - 路由专属 eyebrow、标题、描述
   - `WorkspacePanel` 工作区
   - `PromoSection` Upscal 推广卡
3. `VideoSection`
   - YouTube/视频展示图片与说明
4. `UseCasesSection`
   - 三张使用场景卡片
   - 参考图或 before/after 对比卡
5. `WorkflowSection`
   - 三步流程
   - 工作流主对比图
6. 首页额外显示 `TestimonialsSection`
7. `FaqSection`
   - 首页、增强器、Reimagine 使用不同 FAQ 数据
8. `SiteFooter`

营销内容数据集中在 `src/features/landing/data.tsx`，组件实现位于 `hero.tsx`、`sections.tsx`、`faq.tsx`。后续换图或改文案时，优先修改数据文件，不要改 JSX 结构。

### 定价页

`src/features/pricing/pricing-page.tsx` 自包含以下区块：

1. 定价 Hero 与月付/年付切换
2. Free、Premium、Business 三张套餐卡
3. 计费提示
4. “为何升级物有所值”说明
5. 六张权益卡
6. 定价 FAQ 手风琴

Free 按钮会回到工作区；Premium 和 Business 当前打开演示登录弹窗。年付切换只改变展示价格，不发起真实订阅。

### 账户页

`src/components/site/account-page.tsx` 将账户分成三个本地 tab：

- Profile：显示名称、头像 URL、邮箱、兑换码、保存和退出按钮。
- Billing：当前方案、可用积分、升级入口、后端账单接入说明。
- Security：当前密码、新密码、更新密码、危险区域和删除账户演示。

所有“保存/删除”都是本地提示反馈，生产环境必须接入服务端并做二次确认。

### 法律页

`src/components/site/legal-page.tsx` 是公共法律页壳，页面内容通过 `LegalSection[]` 传入。中英文路由分别在 `app/*` 和 `app/zh/*` 中提供标题、简介和章节数据。

## 6. 目录职责

```text
app/
  layout.tsx                 全局 metadata、CSS、NextIntl provider
  intl-provider.tsx          根据 pathname 选择 zh/en 消息并同步 html lang
  page.tsx                   /
  zh/page.tsx                /zh
  enhancer/                  增强器入口
  reimagine/                 Reimagine 入口
  pricing/                   定价入口
  account/                   账户入口
  privacy-policy/terms/cookies  法律页入口

src/
  App.tsx                    产品页总壳、路由映射、登录弹窗、Toast
  styles.css                 全局视觉、参考稿对齐层、响应式和最终覆盖规则
  components/site/           Header、Footer、账户、登录、法律页
  components/ui/             Button、Card、Input、Textarea、Badge、Icon
  features/landing/          Hero、营销区块、FAQ、内容数据
  features/workspace/        上传、队列、处理、编辑、下载工作区
  features/pricing/          定价页
  stores/                    Zustand 工作区 store
  lib/                       类型、常量、Canvas 处理、下载、工具函数
  services/                  未来真实 AI 服务 adapter 契约

messages/
  zh.json / en.json          next-intl 工作区和导航等 UI 消息
public/reference/            当前占位素材，后续可直接替换
```

### 关键文件职责

- `src/App.tsx`：只处理 route、locale、全局登录/Toast、页面组合；不要把上传队列和营销内容放进来。
- `src/features/landing/hero.tsx`：Hero 文案与工作区组合。
- `src/features/landing/sections.tsx`：Promo、Video、Feature、Use Case、Workflow、Comparison、Testimonials 等区块；其中 `CompareCard` 负责通用前后对比。
- `src/features/landing/data.tsx`：Hero、功能卡、用例、流程、评价和 FAQ 数据。
- `src/features/landing/faq.tsx`：FAQ 展开状态和 FAQ 渲染。
- `src/features/workspace/workspace-panel.tsx`：上传区、文件网格、路由专属控件和工作区操作按钮。
- `src/features/workspace/use-workspace-controller.ts`：工作区唯一状态编排入口，负责 object URL 生命周期、异步 run id、处理、取消、重试、编辑、下载。
- `src/features/workspace/editor-dialog.tsx`：完成图片的裁剪、旋转、翻转、格式和质量编辑弹窗。
- `src/stores/workspace-store.ts`：Zustand 保存图片列表、倍率、处理状态、进度、提示词、创造力和相似度。
- `src/lib/image-processing.ts`：浏览器 Canvas 演示处理和编辑处理。
- `src/lib/downloads.ts`：单张下载和 JSZip 批量下载。
- `src/services/upscaler.ts`：未来真实后端调用的类型契约和占位函数。
- `src/components/site/site-header.tsx`：导航、活动路由、移动菜单、头像账户菜单、登录/账户设置入口。
- `src/components/site/site-footer.tsx`：公共 Footer、法律链接、博客/联系、语言切换。
- `src/components/site/account-page.tsx`：账户三 tab 演示。
- `src/components/site/legal-page.tsx`：法律页公共壳。
- `src/styles.css`：基础层、参考稿视觉层、响应式层、Footer 修复层、CompareCard 修复层。

## 7. 工作区功能与状态流

### 上传

`WorkspacePanel` 的隐藏 file input 和拖放区域都调用 `controller.addFiles`，保证校验逻辑只有一份。

- 支持：JPG、PNG、WebP、AVIF。
- 单张大小上限：20 MB。
- 单个工作区最多：12 张。
- 通过 `URL.createObjectURL` 做本地预览。
- 移除、清空、替换结果和卸载时调用 `URL.revokeObjectURL`。
- 处理期间禁止新增和删除，避免异步结果回写到错误的列表。

### 图片状态

每个 `FileItem` 的状态为：

```text
ready -> processing -> done
                    \-> error -> retry(process)
```

工作区整体还维护 `processing`、`progress.completed`、`progress.total`。取消处理时会增加 `runRef`，使当前异步任务失效，并把正在处理的条目恢复成 `ready`。

### 处理选项

- Home：2K、4K（内部仍使用 `2`、`4` 作为演示处理倍率，只有界面显示标签改为 K）。
- Enhancer：1K、2K、4K。
- Reimagine：人像模型、详细模型（内部值为 `1`、`2`）。
- Reimagine 额外提供提示词、创造力 0～100、相似度 0～100。

路由切换时，`resetForRoute` 只重置默认倍率/模型，故意保留当前图片列表，方便用户在工具之间查看同一批图片。

### 浏览器端演示处理

`createDemoResult` 的流程：

1. 为源文件创建临时 object URL。
2. 加载图片并读取原始尺寸。
3. 根据工具和倍率计算目标长边，演示层将长边限制为 4096px。
4. 使用高质量 image smoothing 绘制到 Canvas。
5. 对 Reimagine 根据 creativity、similarity、prompt 长度施加轻量对比度/饱和度滤镜。
6. 以 WebP 生成结果 object URL。
7. 在 finally 中释放源 object URL。

这只是为了验证 UI 闭环，不代表 AI 重建细节。真实模型接入应替换 controller 中对 `createDemoResult` 的调用。

### 下载、编辑和重试

- 单个完成条目：直接通过临时 `<a download>` 下载。
- 多个完成条目：使用 JSZip 生成 `imgupscaler-results.zip`。
- 编辑器支持：原图、正方形、4:3、16:9 裁剪；0/90/180/270 度旋转；水平/垂直翻转；WebP/PNG/JPG；质量 10～100。
- 保存编辑结果前会释放旧 result URL，避免浏览器内存泄漏。
- 失败条目显示错误信息和“重试”，重试只提交该条目。

## 8. 账户页与移动端 Header 菜单实现记录

### 账户页移动端

`src/components/site/account-page.tsx` 现在按参考稿的账户页面层级组织：

1. 用户摘要卡：头像、Member/会员徽标、姓名、邮箱。
2. 方案摘要：当前方案、可用积分。
3. 带图标的 Profile / Billing / Security 标签页。
4. 当前设置面板：表单、订阅信息或安全设置。

账户摘要不再使用固定高度，移动端由 `src/styles/10-final-page-fixes.css` 的账户覆盖规则自然撑开。这样 320px、375px、390px 宽度下积分摘要不会脱离卡片、覆盖标签页或挤压标题。账户面板的输入框、按钮和方案卡也统一使用至少 44px 的触摸高度。

### 移动端展开菜单

`src/components/site/site-header.tsx` 的 `HeaderNavigation` 在菜单展开时渲染 `MobileAccountPanel`，对应参考稿 `文稿/ImgUpscaler.html` 的移动端结构：

- 图像放大器、图像增强器、重新构想、定价四个导航入口。
- 用户头像、姓名和邮箱。
- 方案 / 积分摘要卡。
- 账户、计费、退出三个操作。

菜单样式位于 `src/styles/10-final-page-fixes.css` 的 `.mobile-nav-*` 规则，使用整宽下拉面板、顶部边框分隔、16px 两侧安全边距和 42px 点击区域。桌面端仍保留头像旁的独立账户 Popover；移动端菜单和头像 Popover 互斥，点击导航或账户链接后自动关闭。

`src/lib/feature-flags.ts` 中 `enableEnhancer` 和 `enableReimagine` 已开启，使移动菜单与参考稿保持完整的四项导航；如果后续需要隐藏产品，只修改功能开关，不修改 Header JSX。

## 10. Before / After 对比卡实现记录

这是本轮重点修复区域，代码在 `src/features/landing/sections.tsx`，样式在 `src/styles.css`。

### 最终实现

- 以原生 `input[type="range"]` 覆盖整个对比卡，范围 10～90，初始值 50。
- range 设置为透明但不禁用 pointer events，因此鼠标、触摸和键盘输入都由原生控件接收。
- `.compare-drag-layer` 只做结构/视觉层，最终设置 `pointer-events: none`，避免它挡住 range。
- `.compare-handle` 和内部圆形也不拦截事件，只负责显示分割线和拖动圆钮。
- after 图层使用 `clip-path: inset(0 0 0 ${split}%)`，before 图层保持全尺寸。

### 键盘可访问性

- ArrowLeft / ArrowDown：减少位置。
- ArrowRight / ArrowUp：增加位置。
- Shift + 方向键：步长从 2 提升到 10。
- Home：跳到 10。
- End：跳到 90。
- range 有动态 aria-label，中文显示“前后对比”相关标签。

### handle 居中修复

`.compare-handle span` 使用：

```css
display: grid;
place-items: center;
transform: translate(-50%, -50%);
```

左右箭头伪元素改为 `top: 50%`，再用 `translateY(-50%)`，左右分别使用 `left: 8px` 和 `right: 8px`，确保箭头在圆形内部上下左右居中且对称。

### 已验证的拖动行为

浏览器验证结果：

- 初始值为 50。
- 鼠标按下并拖动可更新到约 27。
- 继续移动可更新到约 62。
- 键盘 ArrowRight 可从 50 更新到 51。

## 11. 国际化与中文页面处理

### 路由策略

项目沿用参考站的“无前缀英文入口 + `/zh` 中文入口”，没有改成 `[locale]` 动态路由。`app/intl-provider.tsx` 根据 `usePathname()` 是否以 `/zh` 开头选择 `zh` 或 `en` 消息，并同步 `document.documentElement.lang`。

### 消息来源

- 导航、工作区等常用 UI 文案：`messages/zh.json`、`messages/en.json`，通过 `useTranslations` 使用。
- 营销页面和法律内容：分别放在 feature data 或对应路由文件中，避免把长文案塞进组件。

### 本轮中文混杂修复

中文页面中已替换以下容易漏出的英文状态或操作：

- `BEFORE / 原图`、`AFTER / 增强` 改为 `处理前`、`处理后`。
- `WORKSPACE`、`READY`、`PROCESSING`、`DONE`、`ERROR` 改为 `工作区`、`待处理`、`处理中`、`已完成`、`处理失败`。
- Footer `Switch language` 改为 `切换语言`，中文 Footer 的 Cookies 改为 `Cookie 政策`。
- 登录弹窗标题、字段、按钮、忘记密码提示已根据 locale 切换。
- 编辑器标题、字段、按钮已提供中文显示。
- 账户页的 `PROFILE / BILLING / SECURITY`、`Free` 已提供中文显示。
- 工作区的添加、下载、取消、清空、重做、编辑、状态和输出提示已提供中文显示。
- Upscal 宣传区域、视频图片 alt 和说明文案已清理明显英文。

保留的内容：Img.Upscaler、ImgUpscaler、Reimagine AI、Upscal、JPG/PNG/WebP/AVIF、Mac App Store 等产品名、格式名和官方品牌名。若后续要求中文页面连品牌/格式也完全中文化，再单独设计显示策略。

## 12. 样式与响应式记录

`src/styles.css` 是按层叠顺序组织的，后面的参考稿对齐层和最终覆盖层会覆盖前面的通用样式。

### 视觉基调

- 白色 editorial 页面底色。
- 深色文字、蓝色主操作、浅灰边框。
- Plus Jakarta Sans / Manrope 用于标题，DM Sans 用于正文。
- Header 使用 sticky + 半透明 blur。
- Hero 使用蓝色和薄荷色 radial gradient。
- 卡片使用轻边框、圆角和低强度阴影。

### Hero 宽度修复

用户要求去掉 `.hero-section` 上的 `max-width: 980px`。当前 Hero 不再受 980px 窄列限制；保留合理的整体宽度控制、左右内边距和工作区自身的 `width: min(920px, 100%)`，防止大屏内容无限拉伸。营销中的视频、参考区、FAQ 等仍可按参考稿使用 980px 级窄列，这是区块布局需要，不是 Hero 的限制。

### Footer 拥挤修复

公共 Footer 曾因多层旧样式叠加导致品牌、版权和链接挤在一起。最终覆盖层做了以下处理：

- `.site-footer` 强制占满宽度，不再继承旧的窄网格。
- `.site-footer-inner` 桌面端使用 flex，品牌、版权和链接拥有明确的 flex 权重。
- 版权文本允许换行但不挤压品牌。
- Footer 链接支持换行并保持间距。
- 980px 以下切换为多行，720px 以下纵向排列，避免移动端横向溢出。

### 定价间距修复

计划卡和下方价值说明之间增加了稳定的呼吸区：桌面 `.pricing-page .plans-grid` 保持 `height: 725px`、`padding-bottom: 136px`；移动端改为自然高度并保留 `padding-bottom: 96px`。后续修改价格卡高度时，要同步检查下方 `pricing-note` 是否贴得过近。

### 响应式

- 980px：Footer 改为多行布局。
- 720px：Header、Hero、工作区、营销区块、流程卡、评价卡、Footer 全部切单列或纵向排列。
- 参考区偶数卡片在桌面端左右交替，移动端恢复自然顺序。
- 文件网格和工作区按钮需要在窄屏继续检查，尤其是多文件和长中文文案场景。

## 13. 重要交互和可维护性约束

- `useWorkspaceController` 是上传和异步处理的唯一入口，禁止在 `WorkspacePanel` 里复制处理逻辑。
- object URL 必须在移除、清空、替换结果、取消后的无效结果和组件卸载时释放。
- 异步处理必须使用 run id 或等价的取消机制，避免旧任务完成后覆盖新路由/新列表。
- 新增 route 时要同步修改：`Route` 类型、`pathToRoute`、Header 导航、locale 前缀、对应 data、FAQ 和页面入口。
- 新增语言时要同步修改 `IntlProvider`、消息文件、Footer 语言切换、Header 文案以及法律/账户页。
- 新增可复用 UI 优先放到 `src/components/ui/`，不要在页面中重复写按钮和卡片基础样式。
- 后续真实服务接入时，模型密钥、支付密钥、签名 URL 和额度扣减只能放服务端。

## 14. 真实后端接入边界

`src/services/upscaler.ts` 当前定义：

```ts
type UpscaleRequest = {
  file: File
  tool: 'upscaler' | 'enhancer' | 'reimagine'
  scale: string
  prompt?: string
  creativity?: number
  similarity?: number
}

type UpscaleResult = {
  taskId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  resultUrl?: string
}
```

推荐接入路径：

1. 新增 `app/api/upscale/route.ts`，接收 FormData、鉴权并创建服务端任务。
2. `submitUpscaleTask` 调用自己的 Route Handler，不在浏览器暴露模型密钥。
3. `pollUpscaleTask` 轮询或改为 SSE/WebSocket，直到 completed/failed。
4. controller 收到 `resultUrl` 后写回 `FileItem.resultUrl`。
5. 服务端实现额度扣减、内容安全、临时存储、24 小时清理和结果访问控制。
6. 生产环境下载不要盲信客户端 URL，应由服务端返回短期签名地址。

建议后端职责：鉴权、图片临时存储、模型队列、额度/积分扣减、NSFW 与内容安全、任务取消、重试、计费状态、webhook、自动清理和审计日志。

## 15. 当前素材替换方式

用户后续会替换 `public/reference/` 内的图片。建议：

1. 保持文件名不变，直接替换文件，最少影响代码。
2. 如果必须改文件名，只修改 `src/features/landing/data.tsx` 和 Header 头像引用。
3. Before/After 图片要检查主体位置是否一致；对比卡使用 `object-fit: cover`，主体焦点变化会直接影响视觉效果。
4. 替换后重新检查：Hero 工作区、三张用例卡、视频图、主对比图、Header 头像、编辑器预览。
5. 大图注意移动端加载体积；必要时提供 WebP/AVIF，避免直接把超大原图放进仓库。

当前参考素材：

- `public/reference/anime-upscaler.webp`
- `public/reference/unnamed.jpg`
- `public/reference/anime-original.webp`
- `public/reference/Upscal.jpeg`
- `public/reference/batch-upscaler.jpeg`
- `public/reference/enhance-subjects.jpeg`
- `public/reference/upscale-image-online.jpeg`
- `public/reference/youtube-thumbnail.jpeg`

## 16. 已完成修复清单（按用户反馈记录）

### 14.1 公共 Footer 布局

修复前：品牌、版权和多个链接在公共 Footer 中挤成一行，窄屏出现拥挤。

修复后：Footer 采用稳定的桌面 flex、多行中屏、纵向移动端结构，并保留语言菜单和法律链接。

### 14.2 Before / After 无法拖动

修复前：自定义拖动层拦截事件，compare-card 点击后 split 不更新。

修复后：透明原生 range 接管 pointer/touch/keyboard；视觉 handle 和 drag layer 不再拦截事件。已在浏览器验证鼠标和键盘均可更新 split。

### 14.3 compare-handle 圆形内箭头偏移

修复前：箭头通过固定 `top: 17px` 放置，视觉上没有上下左右居中。

修复后：圆形内部使用 grid 居中，伪元素使用 50% + translateY(-50%)，左右对称定位。

### 14.4 中文页面英文混杂

修复前：中文页面出现 BEFORE、AFTER、WORKSPACE、READY、PROCESSING、Footer 英文等。

修复后：工作区、对比卡、Footer、登录、编辑器、账户、下载和状态文案均按 locale 显示。品牌名和文件格式名按产品惯例保留。

### 14.5 Hero 的 980px 限制

修复前：`.hero-section` 使用 `max-width: 980px`，首屏内容过窄。

修复后：移除 Hero 的 980px 限制，Hero 使用宽屏布局；其他需要参考稿窄列的区块继续独立控制宽度。

### 14.6 定价区块间距

修复前：价格卡下方留白不足，价值说明贴得太近。

修复后：为 plans grid 增加固定桌面呼吸区和移动端底部间距，后续调整套餐卡高度时需回归检查。

### 14.7 图像放大选项标签

主图像放大器工作区原先显示 `2× / 4×`，现已统一显示为 `2K / 4K`。实现只调整展示标签，内部状态值仍为 `2` 和 `4`，因此不会改变当前 Canvas 演示处理的倍率逻辑；Reimagine 的模型按钮仍显示“人像模型 / 详细模型”。

### 14.8 功能非破坏性隐藏（专注“图片放大”，可一键恢复）

需求背景：项目保留所有 AI 工具页面与底层实现；是否在导航中显示由功能开关控制。当前为了与参考稿移动端菜单一致，图像增强器和重新构想均显示。

实现方式：通过 `src/lib/feature-flags.ts` 集中管理 `FEATURE_FLAGS` 开关：
- `enableEnhancer: true`：显示导航栏中的「图像增强器」。
- `enableReimagine: true`：显示导航栏中的「重新构想」。
- `enablePricing: true`：保留「定价」导航与页面演示。
- `enableAccount: true`：保留右上角「演示账户」与登录注册弹窗。
- `enablePromoSection: false`：隐藏首屏 Hero 下方的 Upscal 桌面客户端推广卡片。
- `enableImageEditor: false`：隐藏工作区图片放大完成后的「编辑」裁剪弹窗按钮，只保留直接下载与重做。

**恢复方法**：任何时候若需要重新开启某项功能，只需将 `src/lib/feature-flags.ts` 中对应的布尔值改回 `true` 即可立刻恢复全部功能，无需调整任何业务代码。

## 17. 验证结果


已执行并通过：

```bash
npx tsc --noEmit
npm run build
```

Next.js 生产构建成功，中英文路由均能生成。CompareCard 另做了浏览器交互检查：初始 50、鼠标拖动可更新、ArrowRight 可更新。

后续每次涉及工作区、路由或样式大改，至少重新执行：

```bash
npx tsc --noEmit
npm run build
```

如果有可用浏览器，再补充检查：

- `/`、`/zh`、`/enhancer`、`/zh/enhancer`、`/reimagine`、`/zh/reimagine`
- `/pricing`、`/zh/pricing`
- `/account`、`/zh/account`
- 三个法律页的中英文入口
- 空工作区上传、拖放、多图、取消、重试、编辑、单张下载、ZIP 下载
- 所有营销对比卡鼠标/触摸/键盘拖动
- 720px 移动端 Footer、定价留白和工作区按钮是否溢出

## 18. 后续待办

1. 用户替换真实素材后，重新检查所有对比卡的裁切比例、主体焦点和加载体积。
2. 逐页对照线上站和 `文稿/AI _ ImgUpscaler.html`，重点复核 Pricing、Account、法律页和移动端。
3. 如果要求中文页面完全不出现英文，继续处理 Premium、Business、官方品牌名和格式名的显示策略。
4. 接真实模型前，先确定任务 API、认证方式、额度模型、结果保留时间和失败重试语义。
5. 接支付前，补齐服务端订阅状态、webhook 幂等、退款和权限校验。
6. 如果要上线，补充图片内容安全、速率限制、上传大小服务端校验、CSP、错误监控和可访问性审计。

## 19. 维护日志

### 2026-09-20
- 根据 `ImgUpscaler.html` 参考稿恢复并重做账户入口：Header 现在使用 `public/reference/unnamed.jpg` 作为头像，点击头像打开可关闭的 Popover，而不是显示登录/注册按钮。Popover 包含用户头像、钱诚 / 邮箱、免费方案、50 积分、账户、计费和退出入口；账户与计费链接会根据当前语言自动生成 `/account` 或 `/zh/account` 路径。
- `SiteHeader` 的移动端结构调整为 Logo 左侧、头像与菜单按钮右侧，导航继续以抽屉式下拉菜单展示；头像与菜单互斥打开，支持 Escape、点击外部关闭，弹层在 320px 以上窄屏保持在视口内。
- 新增 `user`、`credit-card`、`logout` 图标，统一由 `src/components/ui/icons.tsx` 输出，避免在 Header 内散落大段 SVG。
- 定价页新增 720px 以下移动端专用布局覆盖：价格 Hero、月付/年付切换、三张方案卡、结算提示、价值说明、六张权益卡和 FAQ 均改为自然高度；方案卡改为单列，内容、按钮和底部脚注不会互相挤压，375/390px 视口不再依赖桌面固定高度。
- 移动端定价页重新设定标题、说明、卡片内边距、价格字号、权益行距和区块上下留白，重点保证 featured 方案卡与“为何升级物有所值”之间有明确呼吸区。
- 本次调整没有删除账户、计费、定价或工作区底层逻辑；Popover 的退出按钮当前仅关闭演示菜单，真实认证接入时只需替换该按钮回调，不需要改 Header DOM。
- 为避免 Header 继续堆成单个超长 JSX，已将 Header 拆为 `HeaderNavigation`、`HeaderActions`、`AccountMenu`、`AccountPopover` 等小组件，并抽出路由地址和双语文案辅助函数；后续替换真实用户数据时只需改 Popover 数据入口。
- 使用本地浏览器做了 375px 移动视口与 1440px 桌面视口回归：移动端 Header 为 Logo—头像—菜单左右分布，价格页套餐单列、权益卡单列、FAQ 单列；桌面端恢复三列价格卡与 Logo—导航—头像布局。Popover 的 DOM、头像文案和账户/计费链接均已在页面结构中确认。
- 将原本集中在 `src/styles.css` 的 466 行全局样式按职责拆分为 10 个模块，并保留原有导入顺序，避免级联覆盖顺序变化导致 UI 回归：
  - `src/styles/01-foundation.css`：字体、CSS 变量、基础 reset 与全局基础元素。
  - `src/styles/02-hero-workspace.css`：Hero、上传工作区、文件网格、放大控制和对比卡基础样式。
  - `src/styles/03-landing-sections.css`：首屏后的功能、展示、workflow、FAQ、Footer、Toast 与定价基础样式。
  - `src/styles/04-pricing-motion.css`：定价基础规则、响应式断点和通用动画入口。
  - `src/styles/05-interaction-components.css`：上传错误状态、弹窗、账户交互、编辑器和定价卡细节。
  - `src/styles/06-reference-layout.css`：按参考站对齐的白色编辑型页面布局层。
  - `src/styles/07-page-shells.css`：定价、账户、法律页以及共享页面壳层规则。
  - `src/styles/08-cascade-responsive.css`：历史覆盖层、响应式安全规则、Footer/定价留白和对比拖动交互覆盖。
  - `src/styles/09-final-header-footer.css`：最终 Header、Footer 和语言切换控件规则。
  - `src/styles/10-final-page-fixes.css`：workflow 卡片最终对齐、定价卡自然文档流和 Footer 溢出保护。
- `src/styles.css` 现在只作为入口文件，通过固定顺序 `@import` 模块；后续新增样式应放到对应模块，不再继续堆积入口文件。
- Footer DOM 增加 `footer-meta` 分组，让品牌和版权与右侧链接/语言控件拥有独立布局边界；语言按钮加入最大宽度、文本截断和窄屏换行保护，避免超出 Footer。
- workflow 步骤卡改为自然高度、桌面三列 / 平板两列 / 手机单列，标题与步骤编号间距对齐线上参考站。
- 定价页的套餐网格改为自然文档流，结算提示不再绝对定位，保证 featured 卡片与下方“为何升级物有所值”区块之间有稳定留白。

### 2026-09-20（移动端个人中心与展开菜单二次对照）
- 根据用户提供的移动端参考 DOM，`HeaderNavigation` 新增 `MobileAccountPanel`。菜单展开后的顺序固定为：四项产品导航、用户信息卡、方案/积分卡、账户、计费、退出。
- 移动菜单采用整宽下拉容器，导航和账户区之间使用 1px 顶部分隔线；账户信息卡、方案积分卡与操作按钮均保留参考稿的圆角、浅色表面和 42px 触摸区域。
- 移动端不再把账户操作挤进只有头像宽度的 Popover；桌面端仍使用头像旁 Popover，两套入口互斥打开。
- `SiteHeader` 的外部点击监听改为监听整个 Header：点击页面内容会同时关闭移动菜单和账户 Popover，点击菜单内部不会误关闭。
- 账户页摘要卡已从“固定高度 + 单独积分块”改为头像、姓名、邮箱、当前方案和可用积分的自然高度组合，修复了移动端积分块覆盖标签页的问题。
- 账户标签页加入账户、计费、安全图标，面板和输入控件在移动端使用自然高度与至少 44px 触摸尺寸。
- 为与参考移动菜单保持四项入口，`enableEnhancer` 与 `enableReimagine` 当前设为 `true`；隐藏时只修改 `src/lib/feature-flags.ts`，不删除页面代码。
- 浏览器回归确认：375px 视口下账户页摘要、标签页和 Profile 表单不再重叠；Header DOM 中移动菜单包含四项导航及完整账户操作文案。Chrome 对部分移动按钮的坐标点击在当前扩展环境中会超时，因此同时用 DOM 可访问树、Computed layout 和键盘焦点状态核对结构与层级。
- 本次拆分仅改变 CSS 文件组织和上述已确认的 UI 修复，不改变 React 组件、路由和交互逻辑。
- 将主图像放大器工作区的 `2× / 4×` 展示选项改为 `2K / 4K`。
- 保留内部 `2`、`4` 状态值，避免改变现有 Canvas 演示处理逻辑。
- 移除页面中会显示为 `Skip to content` 的跳转链接，避免它干扰复刻页面的正常视觉；同步清理无用的 `.skip-link` 样式。
- 按参考站重做 Header：桌面端为 Logo 左侧、导航居中、头像账户入口右侧；移动端为 Logo 左侧、头像与菜单按钮右侧，导航使用下拉菜单。
- 根据 `ImgUpscaler.html` 恢复头像账户 Popover，Popover 内容包括用户身份、方案与积分摘要、账户/计费链接和退出入口；Popover 支持点击头像切换、Escape 和点击外部关闭。
- 重做 Footer 多语言切换：中文显示“中文简体”、英文显示“English”，使用参考站风格的圆角胶囊按钮、下箭头和向上弹出的菜单；补充 Escape 键和点击外部关闭行为，并适配移动端锚点位置。
- 根据线上 Footer 的实际结构再次细化语言控件：改为独立的 `footer-language` 容器、14px SVG 下箭头和紧贴按钮上方的轻量菜单，清理旧语言类名的层叠干扰。

### 2026-09-19
- 根据需求将产品聚焦于核心“图片放大（图片变清晰）”功能。
- 引入集中式 `FEATURE_FLAGS` 开关机制（零代码删除、可一键恢复）。
- 隐藏顶部及移动端导航栏中的「图像增强器」和「重新构想 (Reimagine)」，直接访问自动回退至图片放大主页。
- 隐藏首屏 Hero 下方的 Upscal 桌面客户端推广卡片，首屏更加纯粹聚焦。
- 隐藏工作区放大完成后的「编辑」裁剪弹窗按钮，只保留直接下载和重做。
- 保留「定价」与「账户/登录」演示。
- 全量通过 `npx tsc --noEmit` 和 `npm run build`。
