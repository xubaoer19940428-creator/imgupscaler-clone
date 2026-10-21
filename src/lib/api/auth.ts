import { get, post } from "@/src/lib/api/request";
import type { ApiUser, AuthData } from "@/src/lib/api/types";

/** 使用邮箱和密码登录。 */
export const login = (email: string, password: string) =>
  post<AuthData>("/sso/login/email", {
    email,
    password,
  });

/** 使用邮箱验证码注册或登录。 */
export const register = (
  email: string,
  password: string,
  code: string,
) =>
  post<AuthData>("/sso/register", {
    email,
    password,
    code,
  });

/** 使用邮箱验证码重置密码。 */
export const resetPassword = (
  email: string,
  code: string,
  newPassword: string,
) =>
  post<Record<string, never>>("/sso/reset-password", {
    email,
    code,
    new_password: newPassword,
  });

/** 发送注册、重置密码或绑定邮箱的验证码。 */
export const sendEmail = (
  type: "register" | "reset" | "bind",
  email: string,
  options: {
    password?: string;
    captchaToken?: string;
    captchaCode?: string;
  } = {},
) =>
  post<{ message: string }>("/sso/send-email", {
    type,
    email,
    ...(options.password ? { password: options.password } : {}),
    ...(options.captchaToken
      ? { captcha_token: options.captchaToken }
      : {}),
    ...(options.captchaCode ? { captcha_code: options.captchaCode } : {}),
  });

/** 获取当前登录用户资料。 */
export const profile = () =>
  get<ApiUser>(
    "/sso/profile",
  );

/** 更新当前用户的昵称或头像。 */
export const updateProfile = (body: {
  nickname?: string;
  avatar?: string;
}) =>
  post<ApiUser>(
    "/sso/profile",
    body,
  );

/** 修改已绑定邮箱账号的密码。 */
export const changePassword = (
  oldPassword: string,
  newPassword: string,
) =>
  post<Record<string, never>>("/sso/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });

/** 获取第三方登录授权地址，页面随后跳转到返回的 redirect_url。 */
export const socialLoginUrl = (provider: string) =>
  get<{ redirect_url: string }>(
    `/sso/social/${encodeURIComponent(provider)}`,
  );

/** 处理第三方平台回调参数。 */
export const socialCallback = (
  provider: string,
  params?: Record<string, string>,
) =>
  get<AuthData | Record<string, unknown>>(
    `/sso/callback/${encodeURIComponent(provider)}`,
    params,
  );

/** 完成绑定邮箱的验证码确认。 */
export const verifyAuth = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/sso/verify",
    body,
  );

/** 解绑邮箱或第三方登录方式。 */
export const unbind = (provider: string) =>
  post<Record<string, never>>(
    `/sso/unbind/${encodeURIComponent(provider)}`,
  );

/** 注销当前账号。该操作需要发送文档规定的确认字段。 */
export const deleteAccount = () =>
  post<Record<string, never>>("/sso/delete-account", {
    confirm: "DELETE",
  });

/** 退出当前登录令牌。 */
export const logout = () =>
  post<Record<string, never>>(
    "/sso/logout",
  );
