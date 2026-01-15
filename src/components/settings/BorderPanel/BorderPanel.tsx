import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {BORDER_COLORS} from '../../../config';
import {colors, fontSize} from '../../../theme';
import {Slider, ColorPicker, SwatchPicker} from '../../ui';
import type {FrameSettings} from '../../../types';

interface BorderPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  setIsSliding: (sliding: boolean) => void;
}

export default function BorderPanel({
  settings,
  updateSettings,
  setIsSliding,
}: BorderPanelProps) {
  const normalizedColor = settings.borderColor.toLowerCase();

  return (
    <View style={styles.container}>
      <Slider
        label="边框圆角"
        value={settings.borderRadius}
        min={0}
        max={100}
        step={1}
        onChange={val => updateSettings('borderRadius', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
        unit="px"
      />

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>阴影参数</Text>
      <Slider
        label="大小"
        value={settings.shadowSize}
        min={0}
        max={100}
        step={1}
        onChange={val => updateSettings('shadowSize', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
        unit="px"
      />
      <Slider
        label="透明度"
        value={Math.round(settings.shadowOpacity * 100)}
        min={0}
        max={100}
        step={1}
        onChange={val => updateSettings('shadowOpacity', val / 100)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
        unit="%"
      />

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>边框外观</Text>
      <Slider
        label="宽度"
        value={settings.borderWidth}
        min={0}
        max={20}
        step={1}
        onChange={val => updateSettings('borderWidth', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
        unit="px"
      />

      <View style={styles.colorHeader}>
        <Text style={styles.colorLabel}>颜色</Text>
        <View style={styles.colorPickerWrapper}>
          <Text style={styles.colorValue}>
            {settings.borderColor.toUpperCase()}
          </Text>
          <ColorPicker
            color={settings.borderColor}
            onChange={color => updateSettings('borderColor', color)}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={() => setIsSliding(false)}
            size={32}
          />
        </View>
      </View>
      <SwatchPicker
        items={BORDER_COLORS}
        onSelect={color => updateSettings('borderColor', color)}
        activeId={normalizedColor}
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
    </View>
  );
}

const SWATCH_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  colorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorValue: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
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
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
