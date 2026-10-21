import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { md5 } from "js-md5";
import type { ApiEnvelope } from "@/src/lib/api/types";

/** 统一的 API 错误，供页面按 code 或 HTTP status 处理。 */
export class ApiError extends Error {
  code: number;
  status?: number;

  constructor(message: string, code = 0, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** 支持签名算法所需的基础 query/body 值。 */
export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | QueryValue[]
  | { [key: string]: QueryValue };

export type QueryParams = Record<string, QueryValue>;

/** 页面调用请求层时可传入的 Axios 配置。 */
export type ApiRequestConfig = Omit<
  AxiosRequestConfig,
  "url" | "baseURL"
> & {
  params?: QueryParams;
};

type SignedRequestConfig = InternalAxiosRequestConfig & {
  __imgUpscalerSigned?: boolean;
};

/** 去掉结尾斜杠，并确保 API 路径包含文档规定的 /v1。 */
function normalizeBaseUrl(rawValue: string | undefined) {
  const raw = (rawValue || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  return /\/v1$/i.test(raw) ? raw : `${raw}/v1`;
}

/** 浏览器请求使用的 API 根地址。 */
const DEFAULT_API_BASE_URL = "https://api.mixu.ai";

export const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_ARTGURU_API_BASE_URL ||
    process.env.NEXT_PUBLIC_IMGUPSCALER_API_BASE_URL ||
    DEFAULT_API_BASE_URL,
);

/** 浏览器端签名密钥，只从公开环境变量读取。 */
const APP_SECRET_KEY = (
  process.env.NEXT_PUBLIC_ARTGURU_APP_SECRET_KEY ||
  process.env.NEXT_PUBLIC_IMGUPSCALER_APP_SECRET_KEY ||
  ""
).trim();

/** 从 localStorage 读取登录令牌；服务端渲染时返回 null。 */
export function getAuthToken() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_IMGUPSCALER_API_TOKEN || null;
  }
  return (
    window.localStorage.getItem("imgupscaler-token") ||
    window.localStorage.getItem("artguru-token") ||
    process.env.NEXT_PUBLIC_IMGUPSCALER_API_TOKEN ||
    null
  );
}

/** 生成文档要求的随机 nonce。 */
function randomNonce(length = 16) {
  const alphabet = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return result;
}

/** 按 RFC3986 规则编码签名参数。 */
function encode3986(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** 将 URL 中已经存在的 query 拆成 pathname 和参数对象。 */
function parseEmbeddedQuery(path: string): {
  pathname: string;
  params: QueryParams;
} {
  const questionMark = path.indexOf("?");
  if (questionMark < 0) {
    return {
      pathname: path,
      params: {},
    };
  }

  const pathname = path.slice(0, questionMark);
  const params: QueryParams = {};

  new URLSearchParams(path.slice(questionMark + 1)).forEach((value, key) => {
    params[key] = value;
  });

  return { pathname, params };
}

/** 从 JSON body 提取可参与签名的对象字段。 */
function parseBody(data: unknown): QueryParams {
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && data instanceof Blob;

  if (!data || typeof data !== "object" || isFormData || isBlob) {
    if (typeof data !== "string") return {};

    try {
      const parsed = JSON.parse(data) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as QueryParams)
        : {};
    } catch {
      return {};
    }
  }

  return Array.isArray(data)
    ? {}
    : (data as QueryParams);
}

/** 递归序列化一个签名参数，嵌套值使用 PHP 风格的方括号。 */
function serializeParam(
  key: string,
  value: QueryValue,
  parts: string[],
) {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      serializeParam(`${key}[${index}]`, item, parts);
    });
    return;
  }

  if (typeof value === "object") {
    Object.keys(value).forEach((nestedKey) => {
      serializeParam(`${key}[${nestedKey}]`, value[nestedKey], parts);
    });
    return;
  }

  parts.push(`${encode3986(key)}=${encode3986(String(value))}`);
}

/**
 * 生成与现有浏览器客户端一致的参数字符串：
 * 根级 key 排序，嵌套对象使用方括号，所有值使用 RFC3986 编码。
 */
export function serializeSignatureParams(
  params: QueryParams,
) {
  const parts: string[] = [];

  Object.keys(params)
    .sort()
    .forEach((key) => {
      serializeParam(key, params[key], parts);
    });

  return parts.join("&");
}

/**
 * 计算请求签名。
 * sn 本身不参与签名；ts 和 nn 会与 URL query 或 JSON body 参与计算。
 */
export function createSignature(
  path: string,
  queryParams: QueryParams,
  body: unknown,
  timestamp: number,
  nonce: string,
) {
  if (!APP_SECRET_KEY) {
    throw new ApiError("api_secret_not_configured", 503);
  }

  const { pathname, params: embeddedParams } = parseEmbeddedQuery(path);
  // 与 undressly-app 的旧客户端保持一致：有 body 时以 body 作为签名参数，
  // 没有 body 时才使用 query 参数。URL 中已有的 query 始终保留。
  const bodyParams = body ? parseBody(body) : queryParams;
  const params = {
    ...embeddedParams,
    ...bodyParams,
    ts: timestamp,
    nn: nonce,
  } satisfies QueryParams;
  const canonicalParams = serializeSignatureParams(params);
  const encodedPath = `${API_BASE_URL}${pathname}`.replace(
    /[!'()*]/g,
    (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return md5(`${encodedPath}${canonicalParams}${APP_SECRET_KEY}`);
}

/** 构造带 ts、nn、sn 的签名 URL，供 SSE 等非 Axios 请求使用。 */
export function buildSignedUrl(
  path: string,
  queryParams: QueryParams = {},
) {
  if (!API_BASE_URL) {
    throw new ApiError("api_base_url_not_configured", 503);
  }

  const { pathname, params: embeddedParams } = parseEmbeddedQuery(path);
  const params = {
    ...embeddedParams,
    ...queryParams,
  };
  const url = new URL(`${API_BASE_URL}${pathname}`);

  // AIController 文档只要求 Bearer Token。旧服务若配置了签名密钥，
  // 继续附加 ts/nn/sn；未配置时保持纯 Bearer 请求，避免前端被迫伪造签名。
  if (APP_SECRET_KEY) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = randomNonce();
    const signature = createSignature(
      pathname,
      params,
      undefined,
      timestamp,
      nonce,
    );
    url.searchParams.set("ts", String(timestamp));
    url.searchParams.set("nn", nonce);
    url.searchParams.set("sn", signature);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      typeof value !== "object"
    ) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

/** 确保 Authorization 头拥有 Bearer 前缀。 */
function normalizeToken(token: string) {
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

/** 将标准 API 错误 envelope 转为 ApiError。 */
function responseError(response: AxiosResponse<unknown>) {
  const body = response.data as Partial<ApiEnvelope<unknown>> | null;

  return new ApiError(
    body?.message || `API request failed (${response.status})`,
    Number(body?.code || response.status),
    response.status,
  );
}

/** 将 Axios 网络错误或服务端错误统一转为 ApiError。 */
function convertAxiosError(error: unknown) {
  if (error instanceof ApiError) return error;

  const axiosError = error as AxiosError<Partial<ApiEnvelope<unknown>>>;
  const body = axiosError.response?.data;

  return new ApiError(
    body?.message || axiosError.message || "Network request failed",
    Number(body?.code || axiosError.response?.status || 0),
    axiosError.response?.status,
  );
}

/** 所有 JSON API 请求共享的 Axios 实例。 */
const service: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 30_000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * 在请求发出前统一添加签名、鉴权和浏览器来源信息。
 * 签名参数由 URL query 或 JSON body、ts 和 nn 组成，规则与现有客户端一致。
 */
service.interceptors.request.use((config: SignedRequestConfig) => {
  if (!API_BASE_URL) {
    throw new ApiError("api_base_url_not_configured", 503);
  }

  if (config.__imgUpscalerSigned) return config;

  const embedded = parseEmbeddedQuery(config.url || "");
  const queryParams = {
    ...embedded.params,
    ...(config.params || {}),
  } as QueryParams;

  config.url = embedded.pathname;
  config.params = { ...queryParams };
  if (APP_SECRET_KEY) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = randomNonce();
    const signature = createSignature(
      embedded.pathname,
      queryParams,
      config.data,
      timestamp,
      nonce,
    );
    config.params = {
      ...config.params,
      ts: timestamp,
      nn: nonce,
      sn: signature,
    };
  }
  config.__imgUpscalerSigned = true;

  const headers = config.headers;
  headers.set("Accept", "application/json");

  if (
    config.data &&
    !(typeof FormData !== "undefined" && config.data instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", normalizeToken(token));
  }

  if (typeof window !== "undefined") {
    // 这些头用于后端的域名、语言和时区安全校验，名称与现有客户端保持一致。
    headers.set("accept-domain", window.location.host);
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

  return config;
});

/** 将 API envelope 解包为 data，并保留 CSV 下载响应原样返回。 */
service.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers["content-type"] || "");
    if (
      contentType.includes("text/csv") ||
      contentType.includes("application/csv")
    ) {
      return response;
    }

    const body = response.data as Partial<ApiEnvelope<unknown>> | null;
    if (!body || typeof body.code !== "number") return response;
    if (body.code !== 0) throw responseError(response);

    response.data = body.data;
    return response;
  },
  (error: unknown) => Promise.reject(convertAxiosError(error)),
);

/** 发起带签名的 GET 请求。 */
export async function get<T>(
  path: string,
  params?: QueryParams,
  config?: ApiRequestConfig,
): Promise<T> {
  const response = await service.get<T>(path, {
    ...config,
    params: {
      ...(params || {}),
      ...(config?.params || {}),
    },
  });

  return response.data;
}

/** 发起带签名的 POST 请求。 */
export async function post<T>(
  path: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const response = await service.post<T>(
    path,
    body,
    config,
  );
  return response.data;
}

/** 发起带签名的 PUT 请求。 */
export async function put<T>(
  path: string,
  body?: unknown,
  config?: ApiRequestConfig,
): Promise<T> {
  const response = await service.put<T>(
    path,
    body,
    config,
  );
  return response.data;
}

/**
 * 下载文件并触发浏览器保存。
 * 该方法只负责浏览器端下载，不返回 Blob 给页面层。
 */
export async function download(
  path: string,
  params?: QueryParams,
  filename = "download.csv",
) {
  const response = await service.get<Blob>(path, {
    params,
    responseType: "blob",
  });
  const contentDisposition = String(
    response.headers["content-disposition"] || "",
  );
  const match = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
  );
  const resolvedFilename =
    match?.[1]?.replace(/["']/g, "") || filename;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = resolvedFilename;
  link.click();
  URL.revokeObjectURL(url);
}
