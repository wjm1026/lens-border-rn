import React, {useCallback} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RotateCcw} from 'lucide-react-native';

import {DEFAULT_EXIF_INFO, INFO_LAYOUT_OPTIONS} from '../../../config';
import {colors, fontSize} from '../../../theme';
import {Slider, SegmentedControl, ColorPicker, AnimatedSwitch} from '../../ui';
import CameraSelector from '../../CameraSelector';
import InfoLineStyleCard from './InfoLineStyleCard';
import type {FrameSettings, LineStyle, ParsedExifData} from '../../../types';
import type {CameraPreset} from '../../../data/cameraPresets';
import {buildExifParams, normalizeCameraModel} from '../../../utils/exifUtils';

interface InfoPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  patchSettings: (patch: Partial<FrameSettings>) => void;
  onReset: () => void;
  initialExif?: ParsedExifData;
  setIsSliding: (sliding: boolean) => void;
}

export default function InfoPanel({
  settings,
  updateSettings,
  patchSettings,
  onReset,
  initialExif,
  setIsSliding,
}: InfoPanelProps) {
  const updateCustomExif = useCallback(
    (key: keyof FrameSettings['customExif'], value: string) => {
      updateSettings('customExif', {...settings.customExif, [key]: value});
    },
    [settings.customExif, updateSettings],
  );

  const updateLineStyle = useCallback(
    (target: 'line1Style' | 'line2Style', patch: Partial<LineStyle>) => {
      const next = {...settings[target], ...patch};
      updateSettings(target, next);
    },
    [settings, updateSettings],
  );

  const handleCameraSelect = useCallback(
    (preset: CameraPreset | null) => {
      if (preset) {
        patchSettings({
          selectedCameraPresetId: preset.id,
          customExif: {
            ...settings.customExif,
            model: normalizeCameraModel(preset.model),
            lens: preset.defaultLens || settings.customExif.lens,
          },
        });
        return;
      }

      // 恢复到原始 EXIF 数据
      patchSettings({
        selectedCameraPresetId: null,
        customExif: {
          ...settings.customExif,
          model: initialExif?.Model,
          lens: initialExif?.LensModel,
          params: buildExifParams(initialExif),
          date: initialExif?.DateTime,
        },
      });
    },
    [patchSettings, settings.customExif, initialExif],
  );

  // 从 initialExif 生成相机显示名称
  const exifCamera =
    initialExif?.Make || initialExif?.Model
      ? `${initialExif.Make || ''} ${initialExif.Model || ''}`.trim()
      : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>参数设置</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          activeOpacity={0.7}>
          <RotateCcw size={14} color={colors.textSecondary} />
          <Text style={styles.resetLabel}>重置</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>显示参数信息</Text>
        <AnimatedSwitch
          value={settings.showExif}
          onValueChange={val => updateSettings('showExif', val)}
        />
      </View>

      <SegmentedControl<FrameSettings['infoLayout']>
        label="显示布局"
        options={INFO_LAYOUT_OPTIONS}
        value={settings.infoLayout}
        onChange={val => updateSettings('infoLayout', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
      />

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          相机型号
        </Text>
        <CameraSelector
          onSelect={handleCameraSelect}
          selectedId={settings.selectedCameraPresetId ?? null}
          currentExifCamera={exifCamera}
        />
        <Text style={styles.helperText}>预设可快速更换品牌和镜头</Text>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>文字颜色</Text>
        <ColorPicker
          color={settings.textColor}
          onChange={color => updateSettings('textColor', color)}
          onSlidingStart={() => setIsSliding(true)}
          onSlidingComplete={() => setIsSliding(false)}
          size={40}
        />
      </View>

      <Slider
        label="内边距"
        value={settings.infoPadding}
        min={0}
        max={100}
        step={1}
        onChange={val => updateSettings('infoPadding', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
        unit="px"
      />

      {settings.infoLayout === 'centered' && (
        <Slider
          label="行间距"
          value={settings.infoGap}
          min={0}
          max={40}
          step={1}
          onChange={val => updateSettings('infoGap', val)}
          onSlidingStart={() => setIsSliding(true)}
          onSlidingComplete={() => setIsSliding(false)}
          unit="px"
        />
      )}

      {settings.infoLayout === 'centered' && (
        <View style={styles.lineStyleSection}>
          <InfoLineStyleCard
            title="第一行: 相机型号"
            fontId={settings.line1Style.fontId}
            onFontIdChange={fontId => updateLineStyle('line1Style', {fontId})}
            fontSize={settings.line1Style.fontSize}
            onFontSizeChange={val =>
              updateLineStyle('line1Style', {fontSize: val})
            }
            maxFontSize={48}
            setIsSliding={setIsSliding}>
            <Slider
              label="字重"
              value={settings.line1Style.fontWeight}
              min={100}
              max={900}
              step={100}
              onChange={val => updateLineStyle('line1Style', {fontWeight: val})}
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
            />

            <Slider
              label="间距"
              value={Math.round(settings.line1Style.letterSpacing * 100)}
              min={-5}
              max={100}
              step={1}
              onChange={val =>
                updateLineStyle('line1Style', {letterSpacing: val / 100})
              }
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
            />
          </InfoLineStyleCard>

          <InfoLineStyleCard
            title="第二行: 拍摄参数"
            fontId={settings.line2Style.fontId}
            onFontIdChange={fontId => updateLineStyle('line2Style', {fontId})}
            fontSize={settings.line2Style.fontSize}
            onFontSizeChange={val =>
              updateLineStyle('line2Style', {fontSize: val})
            }
            maxFontSize={36}
            setIsSliding={setIsSliding}>
            <Slider
              label="不透明度"
              value={Math.round(settings.line2Style.opacity * 100)}
              min={0}
              max={100}
              step={1}
              onChange={val =>
                updateLineStyle('line2Style', {opacity: val / 100})
              }
              onSlidingStart={() => setIsSliding(true)}
              onSlidingComplete={() => setIsSliding(false)}
              unit="%"
            />
          </InfoLineStyleCard>
        </View>
      )}

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          自定义信息
        </Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>相机型号</Text>
          <TextInput
            style={styles.textInput}
            value={settings.customExif.model ?? ''}
            onChangeText={val => updateCustomExif('model', val)}
            placeholder={DEFAULT_EXIF_INFO.model}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>镜头信息</Text>
          <TextInput
            style={styles.textInput}
            value={settings.customExif.lens ?? ''}
            onChangeText={val => updateCustomExif('lens', val)}
            placeholder={DEFAULT_EXIF_INFO.lens}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>拍摄参数</Text>
          <TextInput
            style={styles.textInput}
            value={settings.customExif.params ?? ''}
            onChangeText={val => updateCustomExif('params', val)}
            placeholder={DEFAULT_EXIF_INFO.params}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>拍摄日期</Text>
          <TextInput
            style={styles.textInput}
            value={settings.customExif.date ?? ''}
            onChangeText={val => updateCustomExif('date', val)}
            placeholder={DEFAULT_EXIF_INFO.date}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLabelSpaced: {
    marginBottom: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  helperText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 8,
  },
  lineStyleSection: {
    paddingBottom: 8,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    fontSize: fontSize.sm,
  },
});
