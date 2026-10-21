import { get, post } from "@/src/lib/api/request";
import { limit as normalizeLimit } from "@/src/lib/api/pagination";

/** 获取图形验证码图片和对应的校验 token。 */
export const captcha = () =>
  get<{ token: string; image: string }>(
    "/captcha/generate",
  );

/** 校验图形验证码；redirectUrl 只作为成功后的前端提示。 */
export const verifyCaptcha = (
  token: string,
  code: string,
  redirectUrl?: string,
) =>
  post<{ redirect_url: string }>("/captcha/verify", {
    token,
    code,
    ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
  });

/** 获取指定的系统配置。 */
export const systemConfig = (key: string) =>
  get<Record<string, unknown>>(
    "/system-config",
    { key },
  );

/** 获取首页初始化配置。 */
export const initConfigs = () =>
  get<Record<string, unknown>>(
    "/init-configs",
  );

/** 获取隐私条款、用户协议等单页内容。 */
export const page = (slug: string) =>
  get<Record<string, unknown>>(
    "/page",
    { slug },
  );

/** 上报来源、UTM 等公共数据。 */
export const report = (body: Record<string, unknown>) =>
  post<Record<string, never>>(
    "/report",
    body,
  );

/** 获取广告列表。 */
export const advertisings = (placement?: string, limit = 10) =>
  get<Record<string, unknown>[]>("/advertisings", {
    limit: normalizeLimit(limit, 50),
    ...(placement ? { placement } : {}),
  });

/** 记录广告点击。 */
export const adClick = (id: number) =>
  post<Record<string, never>>(
    "/advertising/click",
    { id },
  );

/** 获取友情链接。 */
export const friendLinks = (placement?: string, limit = 20) =>
  get<Record<string, unknown>[]>("/friend-links", {
    limit: normalizeLimit(limit, 100),
    ...(placement ? { placement } : {}),
  });

/** 记录友情链接点击。 */
export const friendLinkClick = (id: number) =>
  post<Record<string, never>>(
    "/friend-link/click",
    { id },
  );

/** 注册成功后的投放归因上报，接口只接受 register 事件。 */
export const marketingConversion = (clickId: string) =>
  post<{ conversion_id: number }>("/marketing/conversion/report", {
    event_type: "register",
    click_id: clickId,
  });
