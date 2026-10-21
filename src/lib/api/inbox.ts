import { get, post } from "@/src/lib/api/request";
import type { Paged } from "@/src/lib/api/types";
import {
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

/** 获取广播消息和私信列表。 */
export const inbox = (page = 1, pageSize = 20) =>
  get<Paged<Record<string, unknown>>>("/inbox/list", {
    page: normalizePage(page),
    page_size: normalizePageSize(pageSize, 100),
  });

/** 获取当前用户的未读消息数量。 */
export const unreadCount = () =>
  get<{ count: number }>(
    "/inbox/unread-count",
  );

/** 标记单条广播或私信为已读。 */
export const markInboxRead = (
  source: "broadcast" | "direct",
  id: number,
) =>
  post<Record<string, never>>("/inbox/read", {
    source,
    id,
  });

/** 标记全部消息为已读。 */
export const markAllInboxRead = () =>
  post<Record<string, never>>(
    "/inbox/read-all",
  );

/** 获取单条广播或私信的详情。 */
export const inboxDetail = (
  source: "broadcast" | "direct",
  id: number,
) =>
  get<Record<string, unknown>>("/inbox/detail", {
    source,
    id,
  });
