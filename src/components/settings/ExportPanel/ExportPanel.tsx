import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {EXPORT_FORMAT_OPTIONS, EXPORT_SCALE_OPTIONS} from '../../../config';
import {colors, fontSize} from '../../../theme';
import {Slider} from '../../ui/Slider';
import {SegmentedControl} from '../../ui/SegmentedControl';
import type {FrameSettings} from '../../../types';

interface ExportPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function ExportPanel({
  settings,
  updateSettings,
  onSave,
  isSaving = false,
}: ExportPanelProps) {
  const isDisabled = isSaving || !onSave;
  const buttonLabel = isSaving ? '保存中...' : '保存到相册';

  // 计算预估导出尺寸
  const estimatedWidth = 400 * settings.exportScale;
  const scaleLabel = `${settings.exportScale}x (约 ${estimatedWidth}px 宽)`;

  return (
    <View style={styles.container}>
      <SegmentedControl<FrameSettings['exportFormat']>
        label="导出格式"
        options={EXPORT_FORMAT_OPTIONS}
        value={settings.exportFormat}
        onChange={val => updateSettings('exportFormat', val)}
      />

      <SegmentedControl<number>
        label="导出分辨率"
        options={EXPORT_SCALE_OPTIONS}
        value={settings.exportScale}
        onChange={val => updateSettings('exportScale', val)}
      />

      <View style={styles.scaleHint}>
        <Text style={styles.scaleHintText}>{scaleLabel}</Text>
      </View>

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

      <TouchableOpacity
        style={[styles.saveButton, isDisabled && styles.saveButtonDisabled]}
        onPress={onSave}
        activeOpacity={0.8}
        disabled={isDisabled}>
        <Text style={styles.saveButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>

      <View style={styles.hintBox}>
        <Text style={styles.hintTitle}>导出建议</Text>
        <Text style={styles.hintText}>
          {settings.exportFormat === 'png'
            ? 'PNG: 无损导出，文件极大'
            : 'JPEG: 兼容性最好，质量建议 80%-90%'}
        </Text>
        <Text style={styles.hintText}>
          3x 即可满足 4K 屏幕显示需求，且体积适中
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  hintBox: {
    marginTop: 12,
    alignItems: 'center',
    opacity: 0.6,
  },
  hintTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hintText: {
    marginTop: 4,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  scaleHint: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  scaleHintText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    opacity: 0.8,
  },
});
