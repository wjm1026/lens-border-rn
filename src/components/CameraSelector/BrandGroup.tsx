/**
 * BrandGroup 组件
 * 相机选择器中的品牌分组，包含品牌头部和展开的型号列表
 */

import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ChevronDown} from 'lucide-react-native';

import {colors, fontSize} from '../../theme';
import type {CameraBrand, CameraPreset} from '../../data';

// Logo 在深色背景下的默认填充色
const LOGO_FILL_COLOR = colors.textPrimary;

interface BrandGroupProps {
  brand: CameraBrand;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (preset: CameraPreset) => void;
  selectedId?: string | null;
}

/**
 * 获取 Logo 组件
 * 处理 require 返回的对象和直接组件两种情况
 */
const getLogoComponent = (logoSource: any) => {
  if (!logoSource) {return null;}
  return logoSource?.default || logoSource;
};

export default function BrandGroup({
  brand,
  isExpanded,
  onToggle,
  onSelect,
  selectedId,
}: BrandGroupProps) {
  const hasSelected = brand.models.some(model => model.id === selectedId);
  const LogoComponent = getLogoComponent(brand.logoWhite);

  return (
    <View style={styles.container}>
      {/* 品牌头部 */}
      <TouchableOpacity
        style={[styles.header, hasSelected && styles.headerActive]}
        onPress={onToggle}
        activeOpacity={0.8}>
        {LogoComponent && typeof LogoComponent !== 'number' ? (
          <View style={styles.logoContainer}>
            <LogoComponent
              width={20}
              height={20}
              fill={LOGO_FILL_COLOR}
              style={{color: LOGO_FILL_COLOR}}
            />
          </View>
        ) : (
          <View style={styles.logoPlaceholder} />
        )}
        <Text style={styles.brandName}>{brand.name}</Text>
        <Text style={styles.modelCount}>({brand.models.length})</Text>
        <View style={styles.spacer} />
        {hasSelected && <View style={styles.selectedDot} />}
        <ChevronDown
          size={16}
          color="rgba(255,255,255,0.35)"
          style={isExpanded ? styles.chevronOpen : undefined}
        />
      </TouchableOpacity>

      {/* 型号列表 */}
      {isExpanded && (
        <View style={styles.modelsContainer}>
          {brand.models.map(model => {
            const isActive = model.id === selectedId;
            return (
              <TouchableOpacity
                key={model.id}
                style={[styles.modelRow, isActive && styles.modelRowActive]}
                onPress={() => onSelect(model)}
                activeOpacity={0.8}>
                <Text style={styles.modelText} numberOfLines={1}>
                  {model.displayName}
                </Text>
                {isActive && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  logoContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 24,
    height: 24,
  },
  brandName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  modelCount: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.35)',
    marginLeft: 6,
  },
  spacer: {
    flex: 1,
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  chevronOpen: {
    transform: [{rotate: '180deg'}],
  },
  modelsContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  modelRowActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  modelText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
});
