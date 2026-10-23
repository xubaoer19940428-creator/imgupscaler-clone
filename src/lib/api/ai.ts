import {
  buildSignedUrl,
  get,
  getAcceptDomain,
  getAuthToken,
  post,
  type ApiRequestConfig,
} from "@/src/lib/api/request";
import type { AiMediaOperation, AiMediaRequest, AiRun } from "@/src/lib/api/types";
import { limit as normalizeLimit } from "@/src/lib/api/pagination";

/**
 * 创建一次模型运行。
 *
 * `input` 会和 mode 一起作为 JSON body 发送；幂等键用于避免用户重复点击
 * 时创建多个相同任务。第五个参数可传文档规定的 X-Request-ID。
 */
export const createRun = (
  slug: string,
  mode: string,
  input: Record<string, unknown>,
  idempotencyKey?: string,
  requestId?: string,
) =>
  post<AiRun>(
    `/models/${encodeURIComponent(slug)}/runs`,
    {
      ...input,
      // mode 来自模型目录，不能被 Provider schema 中同名字段覆盖。
      mode,
    },
    idempotencyKey || requestId
      ? {
          headers: {
            ...(idempotencyKey
              ? { "Idempotency-Key": idempotencyKey }
              : {}),
            ...(requestId ? { "X-Request-ID": requestId } : {}),
          },
        }
      : undefined,
  );

/** 查询一次模型运行的当前状态。 */
export const getRun = (runId: string, signal?: AbortSignal) =>
  get<AiRun>(
    `/ai/runs/${encodeURIComponent(runId)}`,
    undefined,
    signal ? { signal } : undefined,
  );

/** 取消尚未完成的模型运行。 */
export const cancelRun = (runId: string, signal?: AbortSignal) =>
  post<AiRun>(
    `/ai/runs/${encodeURIComponent(runId)}/cancel`,
    undefined,
    signal ? { signal } : undefined,
  );

/** 图片能力统一入口；保留给 ImgUpscaler 工作区的兼容调用。 */
export const createImageRun = (
  operation: AiMediaOperation,
  body: AiMediaRequest,
  idempotencyKey: string,
  signal?: AbortSignal,
) =>
  media(operation, "image", body, {
    signal,
    headers: { "Idempotency-Key": idempotencyKey },
  });

/** 获取运行产生的事件，可用 after 做增量查询。 */
export const runEvents = (
  runId: string,
  params: { limit?: number; after?: string } = {},
) =>
  get<Record<string, unknown>>(
    `/ai/runs/${encodeURIComponent(runId)}/events`,
    {
      ...(params.limit === undefined
        ? {}
        : { limit: normalizeLimit(params.limit, 500) }),
      ...(params.after ? { after: params.after } : {}),
    },
  );

/** 调用聊天能力。具体字段由 API 文档中的模型 schema 决定。 */
export const chat = (
  body: Record<string, unknown>,
  config?: ApiRequestConfig,
) =>
  post<AiRun>(
    "/ai/chat/completions",
    body,
    config,
  );

/** 调用图片或视频能力。operation 对应文档中的能力名称。 */
export const media = (
  operation: AiMediaOperation,
  capability: "image" | "video",
  body: AiMediaRequest | Record<string, unknown>,
  config?: ApiRequestConfig,
) =>
  post<AiRun>(
    `/ai/${capability === "image" ? "images" : "videos"}/${encodeURIComponent(operation)}`,
    body,
    config,
  );

/** 获取统一模型路由中的模型列表，可按能力筛选。 */
export const routerModels = (capability?: string) =>
  get<{ object: string; data: Record<string, unknown>[] }>(
    "/ai/models",
    capability ? { capability } : undefined,
  );

/**
 * 打开模型运行的 Server-Sent Events 流。
 *
 * 流式接口不能通过 Axios 的 JSON 拦截器处理，因此这里使用原生 fetch，
 * 但仍复用同一套签名 URL 和登录令牌。服务端会通过 Last-Event-ID 继续推送。
 */
export function openRunStream(
  runId: string,
  options: { lastEventId?: string; signal?: AbortSignal } = {},
) {
  const url = buildSignedUrl(
    `/ai/runs/${encodeURIComponent(runId)}/stream`,
  );
  const token = getAuthToken();
  const headers = new Headers({
    Accept: "text/event-stream",
  });

  if (options.lastEventId) {
    headers.set("Last-Event-ID", options.lastEventId);
  }

  if (token) {
    headers.set(
      "Authorization",
      /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`,
    );
  }

  if (typeof window !== "undefined") {
    // SSE 也要携带与 Axios 请求相同的域名、语言和时区上下文。
    headers.set("accept-domain", getAcceptDomain());
    headers.set(
      "lang",
      document.documentElement.lang?.toLowerCase().startsWith("zh")
        ? "zh"
        : "en",
    );
    headers.set(
      "accept-timezone",
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  }

  return fetch(url, {
    headers,
    signal: options.signal,
    credentials: "same-origin",
  });
}
