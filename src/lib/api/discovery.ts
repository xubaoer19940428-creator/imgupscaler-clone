import { get } from "@/src/lib/api/request";
import type { Paged } from "@/src/lib/api/types";
import {
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

/** 获取发现页推荐分组。 */
export const discovery = (params: {
  placement?: string;
  countryCode?: string;
  page?: number;
  pageSize?: number;
  itemLimit?: number;
} = {}) =>
  get<Paged<Record<string, unknown>>>("/discovery", {
    placement: params.placement ?? "home",
    page: normalizePage(params.page),
    page_size: normalizePageSize(params.pageSize, 50),
    ...(params.countryCode ? { country_code: params.countryCode } : {}),
    ...(params.itemLimit !== undefined
      ? { item_limit: params.itemLimit }
      : {}),
  });

/** 获取指定发现分组的完整条目。 */
export const discoveryItems = (
  id: number,
  page = 1,
  pageSize = 20,
) =>
  get<Paged<Record<string, unknown>>>(`/discovery/${id}/items`, {
    page: normalizePage(page),
    page_size: normalizePageSize(pageSize, 50),
  });
