# ArticleController API 文档

文章内容展示接口（博客、公告、教程等，用于SEO优化和功能介绍）

- 所有接口**免登录**
- 支持多应用（app_ids 逗号分隔，空=全局通用）和多语言（当前语言不存在时自动回退到 en）
- 数据表：`app_articles`（内容由后台维护，本端仅提供展示）

---

## 1. 文章列表

**接口**: `GET /v1/articles`

**需要登录**: 否

**描述**: 分页返回已发布文章列表，按发布时间倒序。列表项不含正文（减小体积）。支持按标签过滤。

### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 默认值 | 示例 | 说明 |
|--------|------|------|------|--------|------|------|
| `page` | query | int | 否 | `1` | `1` | 页码（最小1） |
| `page_size` | query | int | 否 | `20` | `20` | 每页数量（1-100） |
| `tag` | query | string | 否 | - | `seo` | 按标签过滤（精确匹配） |

### 请求示例

```
GET /v1/articles?page=1&page_size=20
GET /v1/articles?tag=seo
```

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "slug": "how-to-use-ai",
        "title": "How to Use AI",
        "summary": "Intro to NovaAI features",
        "cover": "https://cdn.example.com/articles/1.jpg",
        "tags": "seo,intro",
        "author": "Nova",
        "views": 123,
        "locale": "en",
        "published_at": 1710000000,
        "updated_at": 1710000000
      }
    ],
    "total": 4,
    "page": 1,
    "page_size": 20
  }
}
```

### 返回字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| list | array | 文章列表（不含 content 正文） |
| list[].slug | string | 文章标识，用于详情查询 |
| list[].title | string | 标题 |
| list[].summary | string | 摘要（列表展示/SEO description） |
| list[].cover | string | 封面图URL |
| list[].tags | string | 标签（逗号分隔原文） |
| list[].author | string | 作者名称 |
| list[].views | int | 浏览次数 |
| list[].locale | string | 实际返回的语言代码（回退时可能与请求语言不同） |
| list[].published_at | int | 发布时间戳 |
| list[].updated_at | int | 最后更新时间戳 |
| total | int | 符合条件的文章总数 |
| page | int | 当前页码 |
| page_size | int | 每页数量 |

> 当前语言无匹配文章时自动回退到 en 重试（包括按 tag 过滤的情况）。

---

## 2. 文章标签列表（分类）

**接口**: `GET /v1/articles/tags`

**需要登录**: 否

**描述**: 从当前应用可见的已发布文章中提取 `tags` 字段，拆分、去重、排序后返回，用于分类导航。结果缓存 **10 分钟**（`article:tags:{appId}:{locale}`），当前语言无标签时回退到 en。

### 请求参数

无

### 请求示例

```
GET /v1/articles/tags
```

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      "intro",
      "seo",
      "tutorial"
    ]
  }
}
```

### 返回字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| list | string[] | 标签名称列表（字母序） |

> 注意：`/articles/tags` 为固定路径，优先级高于 `/articles/{slug}`。

---

## 3. 文章详情

**接口**: `GET /v1/articles/{slug}`

**需要登录**: 否

**描述**: 根据 slug 获取文章详情，含正文（已替换变量）。返回时浏览量自动 +1。

### 请求参数

| 参数名 | 位置 | 类型 | 必填 | 默认值 | 示例 | 说明 |
|--------|------|------|------|--------|------|------|
| `slug` | path | string | 是 | - | `how-to-use-ai` | 文章标识（小写字母/数字/连字符） |

### 请求示例

```
GET /v1/articles/how-to-use-ai
```

### 响应示例

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "slug": "how-to-use-ai",
    "title": "How to Use AI",
    "summary": "Intro to NovaAI features",
    "cover": "https://cdn.example.com/articles/1.jpg",
    "content": "<p>Full article content...</p>",
    "tags": "seo,intro",
    "author": "Nova",
    "views": 124,
    "locale": "en",
    "published_at": 1710000000,
    "updated_at": 1710000000
  }
}
```

### 返回字段说明

在列表字段基础上增加：

| 字段 | 类型 | 说明 |
|------|------|------|
| content | string | 文章内容（HTML/Markdown），已替换变量 |
| views | int | 浏览次数（已含本次 +1） |

### 变量替换

与 `/v1/page` 一致，`title`、`summary`、`content` 支持 `{{variable_name}}` 占位符，内置变量 `{{app_name}}`、`{{support_email}}`、`{{cdn}}`、`{{domain}}`、`{{year}}`、`{{updated_at}}`，自定义变量由后台在文章 `variables` 字段以 JSON 配置。

### 错误码

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 40001 | slug_required | 文章标识必填 |
| 30001 | article_not_found | 文章不存在或已下架 |

---

## 注意事项

1. 应用可见性：`app_ids` 为空表示全局所有应用可见；非空则按 `FIND_IN_SET` 精确匹配，应用可见集 = 全局 ∪ 本应用专属。
2. 语言回退：列表、标签、详情在当前语言无数据时均回退到 en；响应中的 `locale` 字段标识实际返回语言。
3. slug 路由约束：`{slug}` 仅匹配 `[a-z0-9][a-z0-9\-]*`（小写字母/数字/连字符），建议后台发文时遵守该格式。
4. `page_size` 上限为 100。
