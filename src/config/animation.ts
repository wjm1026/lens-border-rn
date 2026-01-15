/**
 * 动画配置
 * 统一管理应用中所有动画的时间和缓动参数
 */

// 通用动画时长（毫秒）
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 250,
  slow: 300,
} as const;

// Spring 动画配置（用于弹性动画）
export const SPRING_CONFIG = {
  default: {
    damping: 18,
    stiffness: 180,
    mass: 0.8,
  },
  snappy: {
    damping: 20,
    stiffness: 400,
    mass: 1,
  },
  gentle: {
    damping: 18,
    stiffness: 200,
    mass: 0.8,
    useNativeDriver: false,
  },
} as const;

// LayoutAnimation 配置
export const LAYOUT_ANIMATION_CONFIG = {
  duration: 250,
  create: {type: 'easeInEaseOut', property: 'opacity'},
  update: {type: 'spring', springDamping: 0.85},
  delete: {type: 'easeInEaseOut', property: 'opacity'},
} as const;

// FloatingPanel 动画配置
export const FLOATING_PANEL_ANIMATION = {
  duration: 250,
  contentAnimationDuration: 150,
  slideDistance: 80,
} as const;
