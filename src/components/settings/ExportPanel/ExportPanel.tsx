import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../../../theme';
import {Slider} from '../../ui/Slider';
import {SegmentedControl} from '../../ui/SegmentedControl';
import type {FrameSettings} from '../../../types';

const EXPORT_FORMAT_OPTIONS = [
  {id: 'png' as const, label: 'PNG'},
  {id: 'jpeg' as const, label: 'JPEG'},
];

interface ExportPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
}

export default function ExportPanel({
  settings,
  updateSettings,
}: ExportPanelProps) {
  return (
    <View style={styles.container}>
      <SegmentedControl<FrameSettings['exportFormat']>
        label="导出格式"
        options={EXPORT_FORMAT_OPTIONS}
        value={settings.exportFormat}
        onChange={val => updateSettings('exportFormat', val)}
      />

      {settings.exportFormat === 'jpeg' && (
        <Slider
          label="图片质量"
          value={Math.round(settings.exportQuality * 100)}
          min={10}
          max={100}
          step={1}
          onChange={val => updateSettings('exportQuality', val / 100)}
          unit="%"
        />
      )}

      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>Export Options</Text>
        <Text style={styles.hintText}>支持高分辨率无损导出</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  hintBox: {
    marginTop: 12,
    alignItems: 'center',
    opacity: 0.6,
  },
  hintTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hintText: {
    marginTop: 4,
    fontSize: 10,
    color: colors.textMuted,
  },
});
