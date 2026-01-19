/**
 * CameraSelector 组件样式
 * 集中管理样式，便于维护和复用
 */

import {StyleSheet} from 'react-native';
import {colors, fontSize} from '../../theme';

export const cameraSelectorStyles = StyleSheet.create({
  // ========== 触发按钮 ==========
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  triggerButtonActive: {
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  triggerLogoContainer: {
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  triggerTextActive: {
    color: colors.textPrimary,
  },
  presetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(59,130,246,0.25)',
    marginRight: 6,
  },
  presetBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent,
  },
  chevronOpen: {
    transform: [{rotate: '180deg'}],
  },

  // ========== 模态框 ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(17,17,17,0.96)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },

  // ========== 搜索框 ==========
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.05)',
    fontSize: fontSize.sm,
  },

  // ========== 菜单内容 ==========
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingBottom: 8,
  },

  // ========== EXIF 区域 ==========
  exifSection: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  exifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  exifButtonActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  exifTextBlock: {
    flex: 1,
    marginLeft: 10,
  },
  exifTitle: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  exifSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  exifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },

  // ========== 空状态 ==========
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.4)',
  },
});
