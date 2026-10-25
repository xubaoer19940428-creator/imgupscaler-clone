export type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

export type ApiUser = {
  user_id: number;
  nickname?: string;
  avatar?: string;
  email?: string;
  is_vip?: boolean;
  is_paid?: boolean;
  total_coins?: number;
  used_coins?: number;
  remain_coins?: number;
  [key: string]: unknown;
};

export type AuthData = {
  user_id: number;
  token: string;
  user_info: ApiUser;
};

export type RunItem = {
  type: string;
  url: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  duration?: number;
  fps?: number;
};

export type AiRunResult = {
  items?: RunItem[];
  meta?: Record<string, unknown>;
  content?: string | null;
  reasoning?: string | null;
  tool_calls?: Record<string, unknown>[];
  finish_reason?: string | null;
  usage?: Record<string, number>;
};

export type AiMediaOperation =
  | "generations"
  | "variations"
  | "edits"
  | "upscales"
  | "transforms";

export type ImageInputReference = {
  type: "image_url";
  image_url: { url: string };
};

/**
 * Canonical image/video router fields accepted by the platform API.
 * 平台统一图片/视频接口规范：
 * - prompt 必填且非空
 * - 参考图/源图统一必须使用 input_references 数组，严禁使用 image_url！
 */
export type AiMediaRequest = {
  model: string;
  prompt: string;
  negative_prompt?: string;
  n?: number;
  size?: string;
  quality?: "auto" | "low" | "medium" | "high" | "standard" | "hd";
  response_format?: "url" | "b64_json";
  stream?: boolean;
  aspect_ratio?: string;
  resolution?: "512" | "1K" | "2K" | "4K" | "8K";
  output_format?: "png" | "jpeg" | "webp" | "svg";
  output_compression?: number;
  background?: "auto" | "transparent" | "opaque";
  seed?: number;
  input_references?: ImageInputReference[];
  provider?: Record<string, unknown>;
  user?: string;
  [key: string]: unknown;
};

export type AiRun = {
  run_id: string;
  status: "queued" | "running" | "waiting_external" | "completed" | "failed" | "cancelled";
  capability?: "chat" | "image" | "video";
  cancellation_requested?: boolean;
  run_url?: string;
  events_url?: string;
  cancel_url?: string;
  stream_url?: string | null;
  quote_credits?: number;
  result?: AiRunResult | null;
  error?: { code?: number | string; message?: string } | null;
  created_at?: number;
  updated_at?: number;
  started_at?: number;
  finished_at?: number;
  [key: string]: unknown;
};

export type UploadTicket = {
  url: string;
  cdn_url: string;
  key: string;
};

export type ModelMode = {
  code: string;
  title?: string;
  capability?: "chat" | "image" | "video" | string;
  operation?: string;
  schema?: ModelSchema;
  defaults?: Record<string, unknown>;
  ui_overrides?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
};

/** Provider mode 的输入字段描述；页面只依赖 required 和字段名。 */
export type ModelSchema = {
  fields?: Record<string, ModelSchemaField>;
};

export type ModelSchemaField = {
  type?: string;
  required?: boolean;
};

export type ModelDetails = {
  id?: number;
  slug: string;
  router_model?: string;
  name?: string;
  description?: string;
  capability?: "chat" | "image" | "video" | string;
  capabilities?: string[];
  tags?: string[];
  cover?: string;
  preview_video?: string;
  estimated_time?: number;
  pricing?: Record<string, unknown>;
  published?: boolean;
  available?: boolean;
  modes?: ModelMode[];
  featured?: boolean;
  rating_avg?: number;
  rating_count?: number;
  my_score?: number | null;
  remaining_free_trials?: number;
};

export type ModelSummary = ModelDetails & {
  id: number;
  name: string;
  description?: string;
  capability: "chat" | "image" | "video";
  capabilities?: string[];
  cover?: string;
  available?: boolean;
  modes?: ModelMode[];
  featured?: boolean;
  rating_avg?: number;
  rating_count?: number;
};

export type Paged<T> = { list: T[]; page: number; page_size: number; total?: number };

export type FileRecord = {
  id: number;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  [key: string]: unknown;
};
