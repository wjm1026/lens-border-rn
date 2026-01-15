import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

import {
  BACKGROUND_COLORS,
  BACKGROUND_TYPES,
  PRESET_GRADIENTS,
} from '../../../config';
import {colors, fontSize} from '../../../theme';
import {Slider, SegmentedControl, ColorPicker, SwatchPicker} from '../../ui';
import type {FrameSettings} from '../../../types';
import {getGradientPoints} from '../../../utils/gradient';

const SWATCH_SIZE = 28;
const GRADIENT_SWATCH = 32;

interface BackgroundPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  patchSettings: (patch: Partial<FrameSettings>) => void;
  setIsSliding: (sliding: boolean) => void;
}

export default function BackgroundPanel({
  settings,
  updateSettings,
  patchSettings,
  setIsSliding,
}: BackgroundPanelProps) {
  const normalizedBackground = settings.backgroundColor.toLowerCase();
  const normalizedStart = settings.gradientStartColor.toLowerCase();
  const normalizedEnd = settings.gradientEndColor.toLowerCase();
  const gradientPoints = useMemo(
    () => getGradientPoints(settings.gradientAngle),
    [settings.gradientAngle],
  );

  const updateGradient = (nextStart: string, nextEnd: string) => {
    patchSettings({
      gradientStartColor: nextStart,
      gradientEndColor: nextEnd,
    });
  };

  return (
    <View style={styles.container}>
      <SegmentedControl<FrameSettings['backgroundType']>
        label="背景填充类型"
        options={BACKGROUND_TYPES}
        value={settings.backgroundType}
        onChange={val => updateSettings('backgroundType', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
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
                onSlidingStart={() => setIsSliding(true)}
                onSlidingComplete={() => setIsSliding(false)}
                size={32}
              />
            </View>
          </View>
          <SwatchPicker
            items={BACKGROUND_COLORS}
            onSelect={color => updateSettings('backgroundColor', color)}
            activeId={normalizedBackground}
            getId={color => color.toLowerCase()}
            setIsSliding={setIsSliding}
            containerStyle={styles.swatchRow}
            renderItem={(color, isActive) => (
              <View
                style={[
                  styles.swatch,
                  {backgroundColor: color},
                  isActive && styles.swatchActive,
                ]}
              />
            )}
          />
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
            }}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={() => setIsSliding(false)}
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
                  onSlidingStart={() => setIsSliding(true)}
                  onSlidingComplete={() => setIsSliding(false)}
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
                  onSlidingStart={() => setIsSliding(true)}
                  onSlidingComplete={() => setIsSliding(false)}
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
          <SwatchPicker
            items={PRESET_GRADIENTS}
            onSelect={preset => updateGradient(preset.start, preset.end)}
            activeId={`${normalizedStart}-${normalizedEnd}`}
            getId={preset =>
              `${preset.start.toLowerCase()}-${preset.end.toLowerCase()}`
            }
            setIsSliding={setIsSliding}
            containerStyle={styles.swatchRow}
            renderItem={(preset, isActive, index) => (
              <View
                style={[
                  styles.gradientSwatch,
                  isActive && styles.swatchActive,
                ]}>
                <Svg
                  width={GRADIENT_SWATCH}
                  height={GRADIENT_SWATCH}
                  viewBox={`0 0 ${GRADIENT_SWATCH} ${GRADIENT_SWATCH}`}>
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
                    width={GRADIENT_SWATCH}
                    height={GRADIENT_SWATCH}
                    fill={`url(#presetGrad-${index})`}
                  />
                </Svg>
              </View>
            )}
          />
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
          onSlidingStart={() => setIsSliding(true)}
          onSlidingComplete={() => setIsSliding(false)}
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
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
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
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  sectionValue: {
    fontSize: fontSize.xs,
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
    fontSize: fontSize.xs,
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
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  colorPickerValue: {
    fontSize: fontSize.xs,
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
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
