/**
 * CameraSelector 组件
 * 相机型号选择器，支持搜索和品牌分组展示
 */

import React, {useCallback} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Camera, ChevronDown, Search, Sparkles} from 'lucide-react-native';

import {useCameraSelectorState} from '../../hooks/useCameraSelectorState';
import {useMenuPosition} from '../../hooks/useMenuPosition';
import {CAMERA_SELECTOR_MENU_MAX_HEIGHT} from '../../config';
import {colors} from '../../theme';
import {getBrandByPresetId, type CameraPreset} from '../../data';
import BrandGroup from './BrandGroup';
import {cameraSelectorStyles as styles} from './styles';

// ========== 类型定义 ==========

interface CameraSelectorProps {
  onSelect: (preset: CameraPreset | null) => void;
  selectedId?: string | null;
  currentExifCamera?: string;
}

// Logo 填充色常量
const LOGO_FILL_COLOR = colors.textPrimary;

// 方形 Logo 品牌（需要特殊宽度处理）
const SQUARE_LOGO_BRANDS = ['leica', 'apple', 'huawei', 'xiaomi'] as const;

// ========== 辅助函数 ==========

/**
 * 获取 Logo 组件（处理 require 返回值）
 */
const getLogoComponent = (logoSource: any) => {
  if (!logoSource) {
    return null;
  }
  return logoSource?.default || logoSource;
};

// ========== 主组件 ==========

export default function CameraSelector({
  onSelect,
  selectedId,
  currentExifCamera,
}: CameraSelectorProps) {
  const {
    search,
    setSearch,
    expandedBrand,
    toggleBrand,
    selectedPreset,
    filteredBrands,
    hasSearchQuery,
    resetSearch,
  } = useCameraSelectorState({selectedId});

  const {isOpen, menuPosition, openMenu, closeMenu, triggerRef} =
    useMenuPosition({
      maxHeight: CAMERA_SELECTOR_MENU_MAX_HEIGHT,
      onClose: resetSearch,
    });

  // ========== 事件处理 ==========

  const handleSelect = useCallback(
    (preset: CameraPreset) => {
      onSelect(preset);
      closeMenu();
    },
    [closeMenu, onSelect],
  );

  const handleReset = useCallback(() => {
    onSelect(null);
    closeMenu();
  }, [closeMenu, onSelect]);

  // ========== 渲染数据 ==========

  const isPresetSelected = Boolean(selectedPreset);

  // 获取选中品牌的 Logo
  const selectedBrand = selectedPreset?.id
    ? getBrandByPresetId(selectedPreset.id)
    : null;

  // 智能选择 Logo：优先使用选中的品牌下的可用变体
  const logoSource =
    selectedBrand?.logoWhite ||
    selectedBrand?.logoColor ||
    selectedBrand?.logo ||
    selectedBrand?.logoBlack;
  const LogoComponent = getLogoComponent(logoSource);
  const hasLogo = LogoComponent && typeof LogoComponent !== 'number';

  // 当有 Logo 时只显示型号（如 "Z9"），否则显示完整名称（如 "Nikon Z9"）
  const displayText = (() => {
    if (!selectedPreset) {
      return currentExifCamera || '选择相机型号';
    }
    if (hasLogo) {
      return selectedPreset.modelOnly;
    }
    return selectedPreset.displayName;
  })();

  // ========== 渲染 ==========

  return (
    <View>
      {/* 触发按钮 */}
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.triggerButton, isOpen && styles.triggerButtonActive]}
          onPress={openMenu}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="选择相机型号">
          {isPresetSelected && hasLogo ? (
            <View style={styles.triggerLogoContainer}>
              <LogoComponent
                height={18}
                width={
                  selectedBrand?.id &&
                  SQUARE_LOGO_BRANDS.includes(selectedBrand.id as any)
                    ? 22
                    : 50
                }
                preserveAspectRatio="xMaxYMid meet"
                fill={LOGO_FILL_COLOR}
                style={{color: LOGO_FILL_COLOR}}
              />
            </View>
          ) : (
            <Camera size={16} color="rgba(255,255,255,0.6)" />
          )}
          <Text
            style={[
              styles.triggerText,
              isPresetSelected ? styles.triggerTextActive : null,
            ]}
            numberOfLines={1}>
            {displayText}
          </Text>
          {isPresetSelected && (
            <View style={styles.presetBadge}>
              <Text style={styles.presetBadgeText}>预设</Text>
            </View>
          )}
          <ChevronDown
            size={16}
            color="rgba(255,255,255,0.4)"
            style={isOpen ? styles.chevronOpen : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* 选择器模态框 */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menuContainer,
              {
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              },
            ]}
            onPress={e => e.stopPropagation()}>
            {/* 搜索框 */}
            <View style={styles.searchContainer}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="搜索相机..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>

            {/* 品牌列表 */}
            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* 原始 EXIF 选项 */}
              {currentExifCamera && (
                <View style={styles.exifSection}>
                  <TouchableOpacity
                    style={[
                      styles.exifButton,
                      !isPresetSelected && styles.exifButtonActive,
                    ]}
                    onPress={handleReset}
                    activeOpacity={0.8}>
                    <Sparkles size={16} color={colors.accent} />
                    <View style={styles.exifTextBlock}>
                      <Text style={styles.exifTitle}>使用原始 EXIF</Text>
                      <Text style={styles.exifSubtitle} numberOfLines={1}>
                        {currentExifCamera}
                      </Text>
                    </View>
                    {!isPresetSelected && <View style={styles.exifDot} />}
                  </TouchableOpacity>
                </View>
              )}

              {/* 品牌分组 */}
              {filteredBrands.map(brand => (
                <BrandGroup
                  key={brand.id}
                  brand={brand}
                  isExpanded={hasSearchQuery || expandedBrand === brand.id}
                  onToggle={() => toggleBrand(brand.id)}
                  onSelect={handleSelect}
                  selectedId={selectedId}
                />
              ))}

              {/* 空状态 */}
              {filteredBrands.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>未找到匹配的相机</Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
