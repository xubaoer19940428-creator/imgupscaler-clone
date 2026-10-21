/**
 * 功能开关配置 (Feature Flags)
 * 
 * 用于控制页面功能、路由及辅助组件的显示与隐藏。
 * 如需恢复某项功能，只需将对应属性改为 true 即可，无需改动其他业务逻辑代码。
 */
export const FEATURE_FLAGS = {
  // AI 工具与页面路由显隐
  enableEnhancer: true,       // AI 图像增强器
  enableReimagine: true,      // Reimagine 创意放大器
  enablePricing: true,        // 定价方案 (保留)
  enableAccount: true,        // 账户与登录 (保留)

  // 页面辅助区块与工具显隐
  enableImageEditor: true,    // 图片完成后的裁剪/编辑功能
} as const

export type FeatureFlags = typeof FEATURE_FLAGS
