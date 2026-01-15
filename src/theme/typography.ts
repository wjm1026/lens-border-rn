/**
 * Typography System - 统一的排版规范
 *
 * 设计原则:
 * - 使用 4pt 倍数作为基础尺寸单位
 * - 限制字体大小变体，保持视觉一致性
 * - 每种尺寸都有明确的使用场景
 */

// 字体大小规范 (基于 4pt 网格)
export const fontSize = {
  /** 极小文字：辅助提示、版权信息 */
  xs: 10,
  /** 小号文字：标签、说明文字、次要信息 */
  sm: 12,
  /** 正文大小：主要内容、输入框 */
  base: 14,
  /** 中等大小：按钮文字、重要标签 */
  md: 16,
  /** 大号文字：小标题 */
  lg: 18,
  /** 特大号：页面标题 */
  xl: 24,
  /** 超大号：品牌展示 */
  xxl: 32,
} as const;

// 字重规范
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// 行高规范
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// 字间距规范
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

// 预设文字样式
export const textStyles = {
  // 面板标签 - 用于各面板的小标签
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
  },
  // 面板正文 - 用于面板内的主要文字
  body: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  // 输入框文字
  input: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
  },
  // 按钮文字
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  // Tab 按钮文字
  tab: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  // 辅助提示文字
  helper: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  // 数值显示
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
} as const;
