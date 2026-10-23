# Img.Upscaler 图片工作室

这是一个基于 Next.js App Router + React + TypeScript 的在线图片工作室。界面采用暖白、石灰灰、墨黑与低饱和墨蓝，首屏并排呈现上传工作区和效果对比，搭配图片用例、能力介绍、三步流程与 FAQ。定价、账户、法律页和弹窗共用同一视觉风格；工作区和账户数据通过 Mixu API 使用真实服务。

## 项目来源与素材

项目早期版本参考以下内容，当前界面已重新设计：

- 线上中文站：[Img.Upscaler 中文版](https://imgupscaler.com/zh)
- 线上主站：[Img.Upscaler](https://imgupscaler.com/)
- 本地页面参考稿：`文稿/AI _ ImgUpscaler.html`

本项目不包含参考站的后端服务、AI 模型、账户系统或支付系统。品牌名称暂沿用现有名称，`public/reference/` 中的图片属于当前开发占位素材，正式品牌和自有展示素材仍待替换。

## 启动

```bash
npm install
npm run dev
```

默认地址：`http://localhost:3000`

生产构建：

```bash
npm run build
npm start
```

## 已实现

- `/` 图像放大器：拖拽/多图选择、JPG/PNG/WebP/AVIF 校验、2K/4K 输出选项、真实 API 处理和结果下载。
- `/enhancer` 图像增强器：1K / 2K / 4K 输出预设，复用工作区，专属增强文案与 FAQ。
- `/reimagine` 重新构想：提示词、创造力、相似度滑杆、人像/详细模型预设与专属 FAQ。
- `/pricing` 定价：Free / Premium / Business 套餐、按月/按年切换、卖点区和定价 FAQ。
- 支持英文、简体中文、日语、韩语、西班牙语、法语、德语、巴西葡萄牙语、意大利语、俄语、阿拉伯语、土耳其语和荷兰语。每个语种均提供工具、定价、账户和法律页面。
- 前后对比滑杆、不同工具的 FAQ、响应式导航、账户/语言菜单、状态 toast。
- 单项移除、失败重试、完成结果编辑（裁剪、旋转、水平/垂直翻转、WebP/PNG/JPG、质量）、批量 ZIP 下载、清空任务和处理中取消保护。
- 并排上传与效果对比、三张图片用例、浅灰能力介绍、三步流程和分栏 FAQ；支持桌面、平板、手机与阿拉伯语 RTL 布局。
- 使用本地 Instrument Sans 可变字体与系统中文字体回退，无需请求远程字体样式。
- `/zh/account` 与 `/account` 账户面板接入真实资料、订阅积分、安全设置 API，法律页同时提供中英文路径。

工作区始终使用 Mixu API：上传临时源图并登记文件，创建异步图片 Run、轮询结果并提供下载。Reimagine 的提示词、创造力和相似度会随 canonical body 发送。

## 多语言与 SEO

英文使用根路径，中文使用 `/zh`，其他语言使用 `/ja`、`/ko`、`/es`、`/fr`、`/de`、`/pt-BR`、`/it`、`/ru`、`/ar`、`/tr`、`/nl` 前缀。例如 `/ja/pricing` 和 `/ar/enhancer`。语言菜单会保留当前页面、查询参数和锚点。

可见文案统一维护在 `messages/*.json`。服务器布局直接设置正确的 `lang` 和 `dir`，阿拉伯语使用从右向左的阅读方向，浏览器只接收当前语种的消息。`app/(en)` 是英文页面的路由分组，不会在网址中显示。

上线前，在构建环境中将 `NEXT_PUBLIC_SITE_URL` 设置为主域名 `https://photosharp.app`，并重新构建：

```bash
NEXT_PUBLIC_SITE_URL=https://photosharp.app pnpm run build
```

正式域名用于自引用 canonical、各语言 hreflang（含 `x-default`）、Open Graph、Twitter 分享信息和 `/sitemap.xml`。公开页面由服务器输出 WebSite、WebPage 结构化数据，非首页公开页面还提供 BreadcrumbList。站点地图包含 91 个公开页面、相互对应的语言版本，以及工具页面展示的图片地址。账户页设为 `noindex`，不进入站点地图。`photoupscale.app` 与 `photopop.app` 是部署别名，由 `proxy.ts` 返回永久跳转到 `photosharp.app`，避免重复页面被索引。未设置正式域名时，本地预览不开放索引，robots 禁止抓取，站点地图为空，避免输出错误的正式网址。

营销展示图片使用 Next.js 响应式图片优化，按显示尺寸提供 WebP，并保留图片尺寸和替代文本；用户上传图片继续使用原有预览流程。生产部署需运行 Next.js 服务以提供 `/_next/image` 图片优化。ZIP 库在批量下载时加载，登录弹窗、编辑器与定价组件独立拆包，减少工具首页的初始脚本体积。

检查翻译完整性和 ICU 数量格式：

```bash
pnpm run verify:i18n
pnpm exec tsc --noEmit
```

启动生产构建后，可以检查全部 104 个页面的服务器 HTML、标题、描述、canonical、hreflang、H1、分享信息、页面与面包屑结构化数据、响应式图片、图片站点地图和 404：

```bash
# 正式域名模式，第二个网址需要与构建时配置相同
python3 scripts/verify-seo.py http://localhost:3000 https://your-domain.example --indexable
# 未配置正式域名的本地预览模式
python3 scripts/verify-seo.py http://localhost:3000 http://localhost:3000
```

SEO 实现依据 [Google 多语言页面指南](https://developers.google.com/search/docs/specialty/international/localized-versions) 和项目内 Next.js 的国际化、Metadata 与 Sitemap 文档。上线后的收录和性能表现需要在实际域名上通过 Search Console 和真实访问数据确认。

## AIController API 配置

复制环境变量并填入真实值即可覆盖默认 API 地址：

```bash
NEXT_PUBLIC_ARTGURU_API_BASE_URL=https://api.mixu.ai/v1
# 登录后由前端写入 imgupscaler-token；兼容已有 artguru-token
NEXT_PUBLIC_IMGUPSCALER_REIMAGINE_MODEL=openai/gpt-image-1
```

适配层使用 `POST /v1/get-upload-url` 上传源图并登记 `/v1/files`，随后调用 `POST /v1/ai/images/{operation}`（Upscale 和 Enhance 使用 `google/nano-banana-pro` 的 `generations`，Reimagine 使用 `transforms`），再轮询 `GET /v1/ai/runs/{runId}`；取消任务调用对应的 `/cancel` 路径。实现位于 `src/services/imgupscaler-api.ts`。

## 接后端的位置

`src/services/imgupscaler-api.ts` 是 Mixu AIController 的前端适配层；工作区需要真实登录令牌，并根据 API 返回结果更新任务状态。

建议后端职责：鉴权、额度扣减、图片临时存储、模型队列、NSFW/内容安全、24 小时清理、结果签名 URL、支付 webhook。不要把模型密钥或支付密钥放进客户端。

## 代码结构

- `src/App.tsx` 只负责路由判断、页面编排和全局弹窗；没有把落地页内容和上传状态塞在同一个文件里。
- `src/features/workspace/` 负责上传、批量处理、取消/重试、编辑和下载。`use-workspace-controller.ts` 是唯一的工作区状态编排入口。
- `src/features/landing/` 负责 Hero、功能卡片、用例、工作流、对比与 FAQ；文案从 `messages/*.json` 读取，`data.tsx` 保留类型和读取逻辑。
- `src/styles/11-studio.css` 提供当前工作室主题；`src/lib/landing-images.ts` 统一首屏对比素材，分享图与图片站点地图同步使用当前展示图片。
- `src/features/pricing/` 负责套餐、按月/按年切换和定价 FAQ。
- `src/components/ui/` 保存 shadcn/ui 风格的基础组件；`src/lib/` 保存类型、常量、API 请求、结果编辑和下载工具。
- 注释只标注设计原因和真实服务接入边界：例如 object URL 必须释放、异步处理需要 run id 防止过期结果回写。
