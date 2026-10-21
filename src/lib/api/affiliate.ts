import {
  download,
  get,
  post,
  type QueryParams,
} from "@/src/lib/api/request";

/** 获取当前登录用户的联盟合作伙伴资料。 */
export const partnerInfo = () =>
  get<Record<string, unknown>>(
    "/affiliate/partner-info",
  );

/** 提交联盟账号激活申请，手机号和 Telegram 至少填写一个。 */
export const activate = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/affiliate/activation",
    body,
  );

/** 获取联盟首页聚合数据，包含摘要和图表。 */
export const dashboard = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/dashboard",
    params,
  );

/** 获取联盟统计概览。 */
export const stats = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/stats",
    params,
  );

/** 获取收益趋势图数据。 */
export const rewards = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/rewards",
    params,
  );

/** 获取邀请用户增长图数据。 */
export const userStats = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/user-stats",
    params,
  );

/** 按项目获取佣金趋势。 */
export const commissionChart = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/commission-chart",
    params,
  );

/** 分页获取联盟奖励订单。 */
export const rewardOrders = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/reward-orders",
    params,
  );

/** 下载联盟奖励订单 CSV 文件。 */
export const exportRewardOrders = (
  params: Record<string, string | number> = {},
) =>
  download(
    "/affiliate/reward-orders/export",
    params,
    "reward-orders.csv",
  );

/** 分页获取邀请用户列表。 */
export const inviteUsers = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/invite-users",
    params,
  );

/** 分页获取联盟推广项目。 */
export const projects = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/projects",
    params,
  );

/** 添加联盟推广项目。 */
export const addProject = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/affiliate/project/add",
    body,
  );

/** 更新联盟推广项目。 */
export const updateProject = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/affiliate/project/update",
    body,
  );

/** 删除联盟推广项目。 */
export const deleteProject = (id: number) =>
  post<Record<string, unknown>>(
    "/affiliate/project/delete",
    { id },
  );

/** 获取可用的提现渠道。 */
export const payoutChannels = () =>
  get<Record<string, unknown>>(
    "/affiliate/payout-channels",
  );

/** 新增提现渠道，body 根据 type=swift/usdt 传对应字段。 */
export const addPayoutChannel = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/affiliate/payout-channel/add",
    body,
  );

/** 更新提现渠道。 */
export const updatePayoutChannel = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/affiliate/payout-channel/update",
    body,
  );

/** 软删除提现渠道。 */
export const deletePayoutChannel = (id: number) =>
  post<Record<string, unknown>>(
    "/affiliate/payout-channel/delete",
    { id },
  );

/** 分页获取提现记录。 */
export const payoutHistory = (
  params: QueryParams = {},
) =>
  get<Record<string, unknown>>(
    "/affiliate/payout-history",
    params,
  );

/** 发起提现申请。 */
export const requestPayout = (channelId: number) =>
  post<Record<string, unknown>>(
    "/affiliate/payout/request",
    {
      channel_id: channelId,
    },
  );

/** 上报联盟流量事件，该接口允许未登录访问。 */
export const reportTraffic = (body: Record<string, unknown>) =>
  post<Record<string, unknown>>(
    "/affiliate/traffic/report",
    body,
  );
