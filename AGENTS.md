<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AI Media Canonical Request Parameters Specification

平台统一图片与视频能力接口规范（针对 `/v1/ai/images/*` 与 `/v1/ai/videos/*`）：

### 核心调用规则
1. **参考图必须统一使用 `input_references`**：
   - 严禁向平台 API 传递 `image_url` 等模型底层字段！
   - 单参考图模型也**必须统一使用 `input_references` 数组**（最多 16 项），平台网关会根据具体 Model Deployment 的 `input_references_field` 自动映射到底层参数。
   - 参考图格式统一为：
     ```json
     [
       {
         "type": "image_url",
         "image_url": { "url": "https://..." }
       }
     ]
     ```
2. **`prompt` 必填且非空**：所有图像生成、放大、增强、变体操作均必须提供非空 `prompt`。如果用户未手动输入提示词，业务层必须提供合适的默认提示词（如 `Upscale image to high resolution`）。

### Canonical 参数表

| 字段 | 类型 | 必填 | 默认/约束 |
| --- | --- | --- | --- |
| `model` | string | 是 | `brand/model` |
| `prompt` | string | 是 | 非空 |
| `negative_prompt` | string | 否 | 负面提示词，最多 4000 字符；是否生效由所选 Deployment 支持情况决定 |
| `n` | integer | 否 | `1`，范围 `1~10` |
| `size` | string | 否 | `宽x高`、`512`、`1K`、`2K`、`4K`、`8K`；像素尺寸与 `resolution`/`aspect_ratio` 互斥 |
| `quality` | string | 否 | `auto`；可选 `low/medium/high/standard/hd` |
| `response_format` | string | 否 | `url` 或 `b64_json` |
| `stream` | boolean | 否 | `false`；所有图片操作均支持平台流式观察 |
| `aspect_ratio` | string | 否 | `W:H` 形式；完整值域见配置文档"Canonical 参数注册表"（image/video 共用统一超集，含 `auto`） |
| `resolution` | string | 否 | `512/1K/2K/4K/8K`；大小写不敏感，入口统一折叠为 `4K` 形式 |
| `output_format` | string | 否 | `png/jpeg/webp/svg` |
| `output_compression` | integer | 否 | `0~100` |
| `background` | string | 否 | `auto/transparent/opaque`；透明只允许 PNG/WebP |
| `seed` | integer | 否 | 随机种子 |
| `input_references` | array | 否 | 参考图列表，最多 16 项；单参考图模型也统一使用此字段 |
| `provider` | object | 否 | Provider 选择 |
| `user` | string | 否 | OpenAI-compatible 上游收到脱敏值 |

