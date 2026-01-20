/**
 * InfoPanel 组件
 * 用于配置照片信息展示相关的设置
 */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {RotateCcw} from 'lucide-react-native';


import {colors} from '../../../theme';
import {Slider, AnimatedSwitch} from '../../ui';
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
  const {updateLineStyle, handleCameraSelect, exifCameraName} =
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

    </View>
  );
}
