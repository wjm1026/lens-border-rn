import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

import {colors} from '../../../theme';
import {Slider, SegmentedControl, ColorPicker} from '../../ui';
import type {FrameSettings} from '../../../types';
import {getGradientPoints} from '../../../utils/gradient';

const BACKGROUND_TYPES = [
  {id: 'color' as const, label: '纯色'},
  {id: 'gradient' as const, label: '渐变'},
  {id: 'blur' as const, label: '模糊'},
];

const BACKGROUND_COLORS = [
  '#FFFFFF',
  '#F5F5F5',
  '#E5E7EB',
  '#CBD5E1',
  '#9CA3AF',
  '#6B7280',
  '#111827',
  '#000000',
  '#FBBF24',
  '#F472B6',
  '#60A5FA',
  '#34D399',
];

const PRESET_GRADIENTS = [
  {start: '#4facfe', end: '#00f2fe'},
  {start: '#a18cd1', end: '#fbc2eb'},
  {start: '#ff9a9e', end: '#fecfef'},
  {start: '#fbc2eb', end: '#a6c1ee'},
  {start: '#667eea', end: '#764ba2'},
  {start: '#f093fb', end: '#f5576c'},
  {start: '#4facfe', end: '#84fab0'},
  {start: '#fa709a', end: '#fee140'},
  {start: '#30cfd0', end: '#330867'},
  {start: '#f8b500', end: '#ff6b6b'},
  {start: '#000000', end: '#434343'},
  {start: '#ece9e6', end: '#ffffff'},
];

interface BackgroundPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
}

export default function BackgroundPanel({
  settings,
  updateSettings,
}: BackgroundPanelProps) {
  const normalizedBackground = settings.backgroundColor.toLowerCase();
  const normalizedStart = settings.gradientStartColor.toLowerCase();
  const normalizedEnd = settings.gradientEndColor.toLowerCase();
  const gradientPoints = useMemo(
    () => getGradientPoints(settings.gradientAngle),
    [settings.gradientAngle],
  );

  const updateGradient = (nextStart: string, nextEnd: string) => {
    updateSettings('gradientStartColor', nextStart);
    updateSettings('gradientEndColor', nextEnd);
    updateSettings(
      'backgroundGradient',
      `${settings.gradientAngle}deg, ${nextStart} 0%, ${nextEnd} 100%`,
    );
  };

  return (
    <View style={styles.container}>
      <SegmentedControl<FrameSettings['backgroundType']>
        label="背景填充类型"
        options={BACKGROUND_TYPES}
        value={settings.backgroundType}
        onChange={val => updateSettings('backgroundType', val)}
      />

      {/* 纯色模式 */}
      {settings.backgroundType === 'color' && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>填充颜色</Text>
            <View style={styles.colorPickerWrapper}>
              <Text style={styles.sectionValue}>
                {settings.backgroundColor.toUpperCase()}
              </Text>
              <ColorPicker
                color={settings.backgroundColor}
                onChange={color => updateSettings('backgroundColor', color)}
                size={32}
              />
            </View>
          </View>
          <View style={styles.swatchRow}>
            {BACKGROUND_COLORS.map(color => {
              const isActive = normalizedBackground === color.toLowerCase();
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.swatch,
                    {backgroundColor: color},
                    isActive && styles.swatchActive,
                  ]}
                  onPress={() => updateSettings('backgroundColor', color)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`背景颜色 ${color}`}
                />
              );
            })}
          </View>
        </>
      )}

      {/* 渐变模式 */}
      {settings.backgroundType === 'gradient' && (
        <>
          {/* 渐变预览 */}
          <View style={styles.gradientPreview}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient
                  id="previewGradient"
                  x1={gradientPoints.x1}
                  y1={gradientPoints.y1}
                  x2={gradientPoints.x2}
                  y2={gradientPoints.y2}>
                  <Stop offset="0" stopColor={settings.gradientStartColor} />
                  <Stop offset="1" stopColor={settings.gradientEndColor} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#previewGradient)"
              />
            </Svg>
            <View style={styles.gradientBadge}>
              <Text style={styles.gradientBadgeText}>
                {settings.gradientAngle}°
              </Text>
            </View>
          </View>

          <Slider
            label="渐变角度"
            value={settings.gradientAngle}
            min={0}
            max={360}
            step={1}
            onChange={val => {
              updateSettings('gradientAngle', val);
              updateSettings(
                'backgroundGradient',
                `${val}deg, ${settings.gradientStartColor} 0%, ${settings.gradientEndColor} 100%`,
              );
            }}
            unit="°"
          />

          {/* 起始颜色和结束颜色 - 并排显示 */}
          <View style={styles.colorPickerRow}>
            <View style={styles.colorPickerItem}>
              <View style={styles.colorPickerHeader}>
                <ColorPicker
                  color={settings.gradientStartColor}
                  onChange={color =>
                    updateGradient(color, settings.gradientEndColor)
                  }
                  size={42}
                />
              </View>
              <Text style={styles.colorPickerLabel}>起始颜色</Text>
              <Text style={styles.colorPickerValue}>
                {settings.gradientStartColor.toUpperCase()}
              </Text>
            </View>

            {/* 箭头 */}
            <View style={styles.arrowContainer}>
              <View style={styles.arrowLine} />
              <View style={styles.arrowHead} />
            </View>

            <View style={styles.colorPickerItem}>
              <View style={styles.colorPickerHeader}>
                <ColorPicker
                  color={settings.gradientEndColor}
                  onChange={color =>
                    updateGradient(settings.gradientStartColor, color)
                  }
                  size={42}
                />
              </View>
              <Text style={styles.colorPickerLabel}>结束颜色</Text>
              <Text style={styles.colorPickerValue}>
                {settings.gradientEndColor.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* 预设渐变 */}
          <Text style={styles.sectionLabel}>预设渐变</Text>
          <View style={styles.swatchRow}>
            {PRESET_GRADIENTS.map((preset, index) => {
              const isActive =
                normalizedStart === preset.start.toLowerCase() &&
                normalizedEnd === preset.end.toLowerCase();
              return (
                <TouchableOpacity
                  key={`${preset.start}-${preset.end}-${index}`}
                  style={[
                    styles.gradientSwatch,
                    isActive && styles.swatchActive,
                  ]}
                  onPress={() => updateGradient(preset.start, preset.end)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`预设渐变 ${index + 1}`}>
                  <Svg width="100%" height="100%">
                    <Defs>
                      <LinearGradient
                        id={`presetGrad-${index}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1">
                        <Stop offset="0" stopColor={preset.start} />
                        <Stop offset="1" stopColor={preset.end} />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill={`url(#presetGrad-${index})`}
                    />
                  </Svg>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {/* 模糊模式 */}
      {settings.backgroundType === 'blur' && (
        <Slider
          label="模糊强度"
          value={settings.blurAmount}
          min={0}
          max={60}
          step={1}
          onChange={val => updateSettings('blurAmount', val)}
          unit="px"
        />
      )}

      <View style={styles.divider} />
      <Slider
        label="背景亮度"
        value={settings.backgroundBrightness}
        min={20}
        max={200}
        step={1}
        onChange={val => updateSettings('backgroundBrightness', val)}
        unit="%"
      />
      <View style={styles.brightnessHints}>
        <Text style={styles.hintText}>较暗</Text>
        <Text style={styles.hintText}>常规</Text>
        <Text style={styles.hintText}>较亮</Text>
      </View>
    </View>
  );
}

const SWATCH_SIZE = 28;
const GRADIENT_SWATCH = 32;

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginRight: 12,
  },
  colorPickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    marginBottom: 12,
  },
  gradientSwatch: {
    width: GRADIENT_SWATCH,
    height: GRADIENT_SWATCH,
    borderRadius: GRADIENT_SWATCH / 2,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  gradientPreview: {
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradientBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  gradientBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.6,
  },
  colorPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  colorPickerItem: {
    alignItems: 'center',
    flex: 1,
  },
  colorPickerHeader: {
    marginBottom: 8,
  },
  colorPickerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  colorPickerValue: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 34, // 与颜色圆对齐（补偿下方标签和颜色值的高度）
  },
  arrowLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.textMuted,
    borderRadius: 1,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.textMuted,
    marginLeft: -1,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  brightnessHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
