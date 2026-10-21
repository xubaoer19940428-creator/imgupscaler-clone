import { get, post } from "@/src/lib/api/request";
import type { ModelDetails, ModelSummary, Paged } from "@/src/lib/api/types";
import {
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

/** 获取可用模型列表，可按能力分页筛选。 */
export const listModels = (params: {
  capability?: string;
  page?: number;
  pageSize?: number;
} = {}) =>
  get<Paged<ModelSummary>>("/models", {
    ...(params.capability ? { capability: params.capability } : {}),
    page: normalizePage(params.page),
    page_size: normalizePageSize(params.pageSize, 100),
  });

/** 按关键词搜索模型。 */
export const searchModels = (
  keyword: string,
  page = 1,
  pageSize = 20,
) =>
  get<Paged<ModelSummary>>("/models/search", {
    keyword,
    page: normalizePage(page),
    page_size: normalizePageSize(pageSize, 100),
  });

/** 根据 slug 获取模型详情和模式 schema。 */
export const model = (slug: string) =>
  get<ModelDetails>(
    `/models/${encodeURIComponent(slug)}`,
  );

/** 获取当前用户收藏的模型目录，分页参数与普通模型列表一致。 */
export const favoriteModels = (page = 1, pageSize = 20) =>
  get<Paged<ModelSummary & { favorited_at?: number }>>(
    "/models/favorites",
    {
      page: normalizePage(page),
      page_size: normalizePageSize(pageSize, 100),
    },
  );

/** 评价模型，score 范围由接口文档定义。 */
export const rateModel = (slug: string, score: number) =>
  post<Record<string, never>>(
    `/models/${encodeURIComponent(slug)}/rate`,
    { score },
  );
