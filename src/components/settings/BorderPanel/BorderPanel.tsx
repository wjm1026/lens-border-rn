import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {colors} from '../../../theme';
import {Slider, ColorPicker} from '../../ui';
import type {FrameSettings} from '../../../types';

const BORDER_COLORS = [
  '#FFFFFF',
  '#000000',
  '#F5F5F5',
  '#D1D5DB',
  '#9CA3AF',
  '#4B5563',
  '#FBBF24',
  '#93C5FD',
];

interface BorderPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
}

export default function BorderPanel({
  settings,
  updateSettings,
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
        unit="px"
      />
      <Slider
        label="透明度"
        value={Math.round(settings.shadowOpacity * 100)}
        min={0}
        max={100}
        step={1}
        onChange={val => updateSettings('shadowOpacity', val / 100)}
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
            size={32}
          />
        </View>
      </View>
      <View style={styles.swatchRow}>
        {BORDER_COLORS.map(color => {
          const isActive = normalizedColor === color.toLowerCase();
          return (
            <TouchableOpacity
              key={color}
              style={[
                styles.swatch,
                {backgroundColor: color},
                isActive && styles.swatchActive,
              ]}
              onPress={() => updateSettings('borderColor', color)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`边框颜色 ${color}`}
            />
          );
        })}
      </View>
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
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  colorValue: {
    fontSize: 10,
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
