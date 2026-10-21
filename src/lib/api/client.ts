import * as accountApi from "@/src/lib/api/account";
import * as affiliateApi from "@/src/lib/api/affiliate";
import * as aiApi from "@/src/lib/api/ai";
import * as authApi from "@/src/lib/api/auth";
import * as contentApi from "@/src/lib/api/content";
import * as discoveryApi from "@/src/lib/api/discovery";
import * as favoriteApi from "@/src/lib/api/favorites";
import * as fileApi from "@/src/lib/api/files";
import * as inboxApi from "@/src/lib/api/inbox";
import * as modelApi from "@/src/lib/api/models";
import * as paymentApi from "@/src/lib/api/payment";
import * as supportApi from "@/src/lib/api/support";

/**
 * 页面层使用的兼容门面。
 *
 * 请求实现按领域拆在独立模块中；这里仅负责保留扁平调用方式，并为完整领域
 * 提供分组入口。页面不需要知道 Axios、签名、Bearer Token 或响应 envelope。
 * 新接口应先加到对应领域文件，再在这里决定是否需要兼容别名。
 */
export { ApiError, getAuthToken } from "@/src/lib/api/request";
export { uploadInputFile, uploadToTicket } from "@/src/lib/api/files";

// 允许需要底层领域方法的页面直接导入，同时保留 api 门面兼容旧调用。
export * from "@/src/lib/api/ai";
export * from "@/src/lib/api/affiliate";
export * from "@/src/lib/api/account";
export * from "@/src/lib/api/auth";
export * from "@/src/lib/api/content";
export * from "@/src/lib/api/discovery";
export * from "@/src/lib/api/favorites";
export * from "@/src/lib/api/inbox";
export * from "@/src/lib/api/files";
export * from "@/src/lib/api/models";
export * from "@/src/lib/api/payment";
export * from "@/src/lib/api/support";

export const api = {
  // AIController：提交 Run、查询状态、事件轮询、SSE 和取消。
  ai: aiApi,
  createRun: aiApi.createRun,
  getRun: aiApi.getRun,
  cancelRun: aiApi.cancelRun,
  runEvents: aiApi.runEvents,
  chat: aiApi.chat,
  media: aiApi.media,
  routerModels: aiApi.routerModels,
  openRunStream: aiApi.openRunStream,

  // SSO：登录、注册、资料、密码和社交账号。
  login: authApi.login,
  register: authApi.register,
  resetPassword: authApi.resetPassword,
  sendEmail: authApi.sendEmail,
  profile: authApi.profile,
  updateProfile: authApi.updateProfile,
  changePassword: authApi.changePassword,
  socialLogin: authApi.socialLoginUrl,
  socialCallback: authApi.socialCallback,
  verifyAuth: authApi.verifyAuth,
  unbind: authApi.unbind,
  deleteAccount: authApi.deleteAccount,
  logout: authApi.logout,

  // 文件：列表、登记、删除、统计和预签名上传凭证。
  files: fileApi.listFiles,
  fileDetail: fileApi.fileDetail,
  updateFile: fileApi.updateFile,
  deleteFile: fileApi.deleteFile,
  batchDeleteFiles: fileApi.batchDeleteFiles,
  deleteFilesBySource: fileApi.deleteFilesBySource,
  filesBySource: fileApi.filesBySource,
  fileStats: fileApi.fileStats,
  uploadTicket: fileApi.uploadTicket,
  createFile: fileApi.createFile,

  // 模型目录和评分；模型 Run 同时可从 api.ai.createRun 调用。
  model: modelApi.model,
  models: modelApi.listModels,
  favoriteModels: modelApi.favoriteModels,
  searchModels: modelApi.searchModels,
  rateModel: modelApi.rateModel,

  // 收藏和站内信暂不接页面，但保留完整接口供后续页面使用。
  favorites: {
    add: favoriteApi.addFavorite,
    remove: favoriteApi.removeFavorite,
    toggle: favoriteApi.toggleFavorite,
    check: favoriteApi.checkFavorite,
    checkBatch: favoriteApi.checkFavorites,
    ids: favoriteApi.favoriteIds,
  },
  inbox: {
    list: inboxApi.inbox,
    unreadCount: inboxApi.unreadCount,
    markRead: inboxApi.markInboxRead,
    markAllRead: inboxApi.markAllInboxRead,
    detail: inboxApi.inboxDetail,
  },

  // 账户流水和设备。
  accountRecords: accountApi.accountRecords,
  accountDevices: accountApi.accountDevices,

  // 支付、订单、优惠码、App Store 收据和兑换码。
  paymentProducts: paymentApi.paymentProducts,
  paymentChannels: paymentApi.paymentChannels,
  createPayment: paymentApi.createPayment,
  paymentQuery: paymentApi.paymentQuery,
  paymentCallback: paymentApi.paymentCallback,
  paymentRequery: paymentApi.paymentRequery,
  paymentReport: paymentApi.paymentReport,
  orders: paymentApi.orders,
  order: paymentApi.order,
  orderByTradeSn: paymentApi.orderByTradeSn,
  validateCoupon: paymentApi.validateCoupon,
  couponHistory: paymentApi.couponHistory,
  appStoreVerify: paymentApi.appStoreVerify,
  redeem: paymentApi.redeem,

  // 验证码、系统配置、广告、友情链接、归因和发现页。
  captcha: contentApi.captcha,
  verifyCaptcha: contentApi.verifyCaptcha,
  systemConfig: contentApi.systemConfig,
  initConfigs: contentApi.initConfigs,
  page: contentApi.page,
  report: contentApi.report,
  advertisings: contentApi.advertisings,
  adClick: contentApi.adClick,
  friendLinks: contentApi.friendLinks,
  friendLinkClick: contentApi.friendLinkClick,
  marketingConversion: contentApi.marketingConversion,
  discovery: discoveryApi.discovery,
  discoveryItems: discoveryApi.discoveryItems,

  // 客服会话、消息轮询和 FAQ。
  supportSessions: supportApi.supportSessions,
  supportSession: supportApi.supportSession,
  supportSend: supportApi.supportSend,
  supportPoll: supportApi.supportPoll,
  supportHistory: supportApi.supportHistory,
  supportHandoff: supportApi.supportHandoff,
  supportClose: supportApi.supportClose,
  supportFaq: supportApi.supportFaq,
  supportFaqView: supportApi.supportFaqView,
  supportFaqHelpful: supportApi.supportFaqHelpful,

  // 联盟中心：激活、报表、项目、提现和流量上报。
  affiliate: affiliateApi,
};
