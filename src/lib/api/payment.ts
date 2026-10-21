import { get, post } from "@/src/lib/api/request";
import type { Paged } from "@/src/lib/api/types";
import {
  page as normalizePage,
  pageSize as normalizePageSize,
} from "@/src/lib/api/pagination";

/** 获取订阅、金币和活动商品。 */
export const paymentProducts = () =>
  get<{
    subscriptions: Record<string, unknown>[];
    coins: Record<string, unknown>[];
    activity: Record<string, unknown> | null;
  }>("/payment/products");

/** 获取某个商品可用的支付渠道。 */
export const paymentChannels = (pid: number) =>
  get<{ items: Record<string, unknown>[] }>(
    "/payment/channels",
    { pid },
  );

/** 创建支付订单，返回支付链接和交易号。 */
export const createPayment = (body: Record<string, unknown>) =>
  post<{ pay_link: string; trade_sn: string }>(
    "/payment/create",
    body,
  );

/** 查询一个订单，或查询当前用户的全部订单状态。 */
export const paymentQuery = (tradeSn?: string) =>
  get<Record<string, unknown>[]>(
    "/payment/query",
    tradeSn ? { trade_sn: tradeSn } : undefined,
  );

/** 获取支付完成后的订单回跳数据。 */
export const paymentCallback = (tradeSn: string) =>
  get<Record<string, unknown>>("/payment/callback", {
    trade_sn: tradeSn,
  });

/** 重查待支付订单，可按交易号或用户 ID 筛选。 */
export const paymentRequery = (
  tradeSn?: string,
  userId?: number,
) =>
  get<Record<string, unknown>[]>("/payment/requery", {
    ...(tradeSn ? { trade_sn: tradeSn } : {}),
    ...(userId !== undefined ? { user_id: userId } : {}),
  });

/** 上报支付失败或用户放弃支付的原因。 */
export const paymentReport = (
  content?: string,
  tradeSn?: string,
) =>
  post<Record<string, never>>("/payment/report", {
    ...(content ? { content } : {}),
    ...(tradeSn ? { trade_sn: tradeSn } : {}),
  });

/** 获取订单列表。 */
export const orders = (
  page = 1,
  pageSize = 20,
  status?: number,
) =>
  get<Paged<Record<string, unknown>>>("/orders", {
    page: normalizePage(page),
    page_size: normalizePageSize(pageSize, 50),
    ...(status !== undefined ? { status } : {}),
  });

/** 按订单 ID 获取订单详情。 */
export const order = (id: number) =>
  get<Record<string, unknown>>(
    `/orders/${id}`,
  );

/** 按 trade_sn 获取订单详情。 */
export const orderByTradeSn = (tradeSn: string) =>
  get<Record<string, unknown>>("/orders/detail", {
    trade_sn: tradeSn,
  });

/** 验证优惠码；文档规定 coupon_code 必须放在 query 中。 */
export const validateCoupon = (couponCode: string) =>
  post<Record<string, unknown>>(
    "/coupon/validate",
    undefined,
    {
      params: {
        coupon_code: couponCode,
      },
    },
  );

/** 获取优惠码使用记录。 */
export const couponHistory = (page = 1, pageSize = 20) =>
  get<Paged<Record<string, unknown>>>("/coupon/usage-history", {
    page: normalizePage(page),
    page_size: normalizePageSize(pageSize),
  });

/** 验证 App Store 收据。 */
export const appStoreVerify = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/appstore/verify",
    body,
  );

/** 兑换金币或会员兑换码。 */
export const redeem = (code: string) =>
  post<Record<string, unknown>>(
    "/redeem",
    { code },
  );
