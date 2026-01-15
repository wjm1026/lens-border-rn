import {StyleSheet} from 'react-native';

import {colors} from './colors';
import {fontSize} from './typography';

/**
 * 通用样式常量，用于减少重复代码
 */

// 面板容器的默认内边距
export const PANEL_PADDING_TOP = 4;

// 通用的圆角尺寸
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  round: 999,
} as const;

// 通用阴影样式
export const shadowStyles = StyleSheet.create({
  sm: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
});

// 通用的标签样式
export const labelStyles = StyleSheet.create({
  section: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  hint: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

// 分隔线样式
export const dividerStyles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
});
