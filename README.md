# Img.Upscaler 前端复刻

这是一个基于 Next.js App Router + React + TypeScript 的 ImgUpscaler 前端复刻。页面顺序、导航、工作区、视频展示、能力卡片、用例、三步流程、before/after、评价、FAQ、定价、账户与法律页均按本地保存的 `AI _ ImgUpscaler.html` 和线上中文页结构搭建；工作区和账户数据通过 Mixu API 使用真实服务。

## 参考来源

本项目的页面结构、视觉布局和交互方向参考以下内容：

- 线上中文站：[Img.Upscaler 中文版](https://imgupscaler.com/zh)
- 线上主站：[Img.Upscaler](https://imgupscaler.com/)
- 本地页面参考稿：`文稿/AI _ ImgUpscaler.html`

本项目是独立的前端复刻实现，不包含参考站的后端服务、AI 模型、账户系统或支付系统。`public/reference/` 中的图片属于当前开发占位素材，后续可以按项目需要替换。

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
- 同时提供 `/zh`、`/zh/enhancer`、`/zh/reimagine`、`/zh/pricing` 入口，方便按原站中文路径验收。
- 前后对比滑杆、不同工具的 FAQ、响应式导航、账户/语言菜单、状态 toast。
- 单项移除、失败重试、完成结果编辑（裁剪、旋转、水平/垂直翻转、WebP/PNG/JPG、质量）、批量 ZIP 下载、清空任务和处理中取消保护。
- YouTube 展示、三张 use-case 图片卡片、四条用户评价和隐私/商业用途内容区。
- `/zh/account` 与 `/account` 账户面板接入真实资料、订阅积分、安全设置 API，法律页同时提供中英文路径。

工作区始终使用 Mixu API：上传临时源图并登记文件，创建异步图片 Run、轮询结果并提供下载。Reimagine 的提示词、创造力和相似度会随 canonical body 发送。

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
- `src/features/landing/` 负责 Hero、功能卡片、用例、工作流、对比、评价与 FAQ；可替换 `data.tsx` 中的文案和素材而不改交互。
- `src/features/pricing/` 负责套餐、按月/按年切换和定价 FAQ。
- `src/components/ui/` 保存 shadcn/ui 风格的基础组件；`src/lib/` 保存类型、常量、API 请求、结果编辑和下载工具。
- 注释只标注设计原因和真实服务接入边界：例如 object URL 必须释放、异步处理需要 run id 防止过期结果回写。
