/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 22:33:08
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 00:22:50
 * @FilePath: /code/lens-border-rn/src/components/settings/ExportPanel/ExportPanel.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

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

      <TouchableOpacity
        style={[styles.saveButton, isDisabled && styles.saveButtonDisabled]}
        onPress={onSave}
        activeOpacity={0.8}
        disabled={isDisabled}>
        <Text style={styles.saveButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>

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
    fontSize: 14,
    fontWeight: '600',
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
