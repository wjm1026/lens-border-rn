/**
 * InfoPanel 组件
 * 用于配置照片信息展示相关的设置
 */

import React from 'react';
import {Text, TextInput, TouchableOpacity, View} from 'react-native';
import {RotateCcw} from 'lucide-react-native';

import {DEFAULT_EXIF_INFO, INFO_LAYOUT_OPTIONS} from '../../../config';
import {colors} from '../../../theme';
import {Slider, SegmentedControl, ColorPicker, AnimatedSwitch} from '../../ui';
import CameraSelector from '../../CameraSelector';
import InfoLineStyleCard from './InfoLineStyleCard';
import {useInfoPanelLogic} from './useInfoPanelLogic';
import {infoPanelStyles as styles} from './styles';
import type {FrameSettings, ParsedExifData} from '../../../types';

// ========== 类型定义 ==========

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

// ========== 主组件 ==========

export default function InfoPanel({
  settings,
  updateSettings,
  patchSettings,
  onReset,
  initialExif,
  setIsSliding,
}: InfoPanelProps) {
  // 使用提取的业务逻辑 Hook
  const {updateCustomExif, updateLineStyle, handleCameraSelect, exifCameraName} =
    useInfoPanelLogic({
      settings,
      updateSettings,
      patchSettings,
      initialExif,
    });

  return (
    <View style={styles.container}>
      {/* 头部区域 */}
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

      {/* 显示开关 */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>显示参数信息</Text>
        <AnimatedSwitch
          value={settings.showExif}
          onValueChange={val => updateSettings('showExif', val)}
        />
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>显示品牌 Logo</Text>
        <AnimatedSwitch
          value={settings.showBrandLogo}
          onValueChange={val => updateSettings('showBrandLogo', val)}
        />
      </View>

      {/* 布局选择 */}
      <SegmentedControl<FrameSettings['infoLayout']>
        label="显示布局"
        options={INFO_LAYOUT_OPTIONS}
        value={settings.infoLayout}
        onChange={val => updateSettings('infoLayout', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
      />

      {/* 相机选择器 */}
      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          相机型号
        </Text>
        <CameraSelector
          onSelect={handleCameraSelect}
          selectedId={settings.selectedCameraPresetId ?? null}
          currentExifCamera={exifCameraName}
        />
        <Text style={styles.helperText}>预设可快速更换品牌和镜头</Text>
      </View>

      {/* 文字颜色 */}
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

      {/* 内边距 */}
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

      {/* Centered 布局特有选项 */}
      {settings.infoLayout === 'centered' && (
        <>
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

          <View style={styles.lineStyleSection}>
            {/* 第一行样式 */}
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

            {/* 第二行样式 */}
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
        </>
      )}

      {/* 自定义信息 */}
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
