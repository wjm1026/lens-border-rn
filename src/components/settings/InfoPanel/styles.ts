/**
 * InfoPanel 样式定义
 * 集中管理样式，便于维护
 */

import {StyleSheet} from 'react-native';
import {colors, fontSize} from '../../../theme';

export const infoPanelStyles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },

  // ========== 头部区域 ==========
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLabelSpaced: {
    marginBottom: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ========== 开关行 ==========
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // ========== 区块 ==========
  sectionBlock: {
    marginBottom: 20,
  },
  helperText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  lineStyleSection: {
    paddingBottom: 8,
  },
});
