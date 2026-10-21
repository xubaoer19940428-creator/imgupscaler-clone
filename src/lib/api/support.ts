import { get, post } from "@/src/lib/api/request";
import type { Paged } from "@/src/lib/api/types";
import {
  limit as normalizeLimit,
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

/** 获取当前用户或访客的客服会话列表。 */
export const supportSessions = (page = 1, pageSize = 20) =>
  get<Paged<Record<string, unknown>>>(
    "/support/sessions",
    {
      page: normalizePage(page),
      page_size: normalizePageSize(pageSize, 50),
    },
  );

/** 创建新会话，或恢复指定的未关闭会话。 */
export const supportSession = (sessionKey?: string) =>
  post<Record<string, unknown>>("/support/session", {
    ...(sessionKey ? { session_key: sessionKey } : {}),
  });

/** 发送客服消息。 */
export const supportSend = (
  sessionKey: string,
  content: string,
  contentType = "text",
) =>
  post<Record<string, unknown>>("/support/send", {
    session_key: sessionKey,
    content,
    content_type: contentType,
  });

/** 增量轮询客服消息，参数名必须使用文档中的 last_id。 */
export const supportPoll = (
  sessionKey: string,
  lastId?: number,
) =>
  get<Record<string, unknown>>("/support/poll", {
    session_key: sessionKey,
    ...(lastId !== undefined ? { last_id: lastId } : {}),
  });

/** 获取客服历史消息，文档使用 limit 而不是 page/page_size。 */
export const supportHistory = (
  sessionKey: string,
  limit = 50,
) =>
  get<Record<string, unknown>>("/support/history", {
    session_key: sessionKey,
    limit: normalizeLimit(limit, 100),
  });

/** 转人工客服。 */
export const supportHandoff = (sessionKey: string) =>
  post<Record<string, unknown>>(
    "/support/transfer",
    {
      session_key: sessionKey,
    },
  );

/** 关闭客服会话。 */
export const supportClose = (sessionKey: string) =>
  post<Record<string, unknown>>(
    "/support/close",
    {
      session_key: sessionKey,
    },
  );

/** 获取 FAQ 列表，可按分类筛选。 */
export const supportFaq = (category?: string) =>
  get<{ list: Record<string, unknown>[] }>(
    "/support/faq",
    category ? { category } : undefined,
  );

/** 记录 FAQ 查看事件。 */
export const supportFaqView = (faqId: number) =>
  post<Record<string, never>>("/support/faq/view", {
    faq_id: faqId,
  });

/** 记录用户认为某个 FAQ 有帮助；文档只要求 faq_id。 */
export const supportFaqHelpful = (faqId: number) =>
  post<Record<string, never>>("/support/faq/helpful", {
    faq_id: faqId,
  });
