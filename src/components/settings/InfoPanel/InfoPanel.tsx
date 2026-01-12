import React, {useCallback} from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RotateCcw} from 'lucide-react-native';

import {colors} from '../../../theme';
import {Slider, SegmentedControl, ColorPicker} from '../../ui';
import CameraSelector from '../../CameraSelector';
import InfoLineStyleCard from './InfoLineStyleCard';
import type {FrameSettings, LineStyle} from '../../../types';
import type {CameraPreset} from '../../../data/cameraPresets';

const INFO_LAYOUT_OPTIONS = [
  {id: 'centered' as const, label: '居中双行'},
  {id: 'classic' as const, label: '经典左右'},
];

const normalizeCameraModel = (model: string): string =>
  model
    .replace(/([A-Za-z])\s+(\d)/g, '$1$2')
    .replace(/(\d)\s+([A-Za-z])/g, '$1$2')
    .trim();

interface InfoPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  onReset: () => void;
  exifCamera?: string;
}

export default function InfoPanel({
  settings,
  updateSettings,
  onReset,
  exifCamera,
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
        updateSettings('selectedCameraPresetId', preset.id);
        updateSettings('customExif', {
          ...settings.customExif,
          model: normalizeCameraModel(preset.model),
          lens: preset.defaultLens || settings.customExif.lens,
        });
        return;
      }

      updateSettings('selectedCameraPresetId', null);
      updateSettings('customExif', {
        ...settings.customExif,
        model: undefined,
        lens: undefined,
      });
    },
    [settings.customExif, updateSettings],
  );

  const cameraHint = exifCamera;

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
        <Switch
          value={settings.showExif}
          onValueChange={val => updateSettings('showExif', val)}
          thumbColor={colors.white}
          trackColor={{false: colors.border, true: colors.accent}}
        />
      </View>

      <SegmentedControl<FrameSettings['infoLayout']>
        label="显示布局"
        options={INFO_LAYOUT_OPTIONS}
        value={settings.infoLayout}
        onChange={val => updateSettings('infoLayout', val)}
      />

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          相机型号
        </Text>
        <CameraSelector
          onSelect={handleCameraSelect}
          selectedId={settings.selectedCameraPresetId ?? null}
          currentExifCamera={cameraHint}
        />
        <Text style={styles.helperText}>预设可快速更换品牌和镜头</Text>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>文字颜色</Text>
        <ColorPicker
          color={settings.textColor}
          onChange={color => updateSettings('textColor', color)}
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
          unit="px"
        />
      )}

      {settings.infoLayout === 'centered' && (
        <View style={styles.lineStyleSection}>
          <InfoLineStyleCard
            title="第一行: 相机型号"
            fontId={settings.line1Style.fontId}
            onFontIdChange={fontId =>
              updateLineStyle('line1Style', {fontId})
            }
            fontSize={settings.line1Style.fontSize}
            onFontSizeChange={val =>
              updateLineStyle('line1Style', {fontSize: val})
            }
            maxFontSize={48}
          >
            <Slider
              label="字重"
              value={settings.line1Style.fontWeight}
              min={100}
              max={900}
              step={100}
              onChange={val => updateLineStyle('line1Style', {fontWeight: val})}
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
            />
          </InfoLineStyleCard>

          <InfoLineStyleCard
            title="第二行: 拍摄参数"
            fontId={settings.line2Style.fontId}
            onFontIdChange={fontId =>
              updateLineStyle('line2Style', {fontId})
            }
            fontSize={settings.line2Style.fontSize}
            onFontSizeChange={val =>
              updateLineStyle('line2Style', {fontSize: val})
            }
            maxFontSize={36}
          >
            <Slider
              label="不透明度"
              value={Math.round(settings.line2Style.opacity * 100)}
              min={0}
              max={100}
              step={1}
              onChange={val =>
                updateLineStyle('line2Style', {opacity: val / 100})
              }
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
            placeholder="NIKON Z9"
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
            placeholder="NIKKOR 28mm f/1.4"
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
            placeholder="28.5mm f/7.1 1/60 ISO100"
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
            placeholder="2025/01/01 12:00"
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 12,
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 12,
  },
});
