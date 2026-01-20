import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
  TouchableOpacity,
} from 'react-native';

import type {FrameSettings} from '../../types';
import {DEFAULT_EXIF_INFO} from '../../config';
import EditableText from './EditableText';
import LogoPickerModal from './LogoPickerModal';
import LogoColorPickerModal from './LogoColorPickerModal';
import {
  getBrandByPresetId,
  getCameraPresetById,
  detectBrandFromContent,
  BRAND_LOGOS,
} from '../../data/index';

interface InfoOverlayProps {
  settings: FrameSettings;
  framePadding: number;
  onOffsetChange?: (offset: {x: number; y: number}) => void;
  onCustomExifChange?: (
    key: keyof FrameSettings['customExif'],
    value: string,
  ) => void;
  onTextColorChange?: (color: string) => void;
}

const toFontWeight = (value: number): TextStyle['fontWeight'] =>
  `${value}` as TextStyle['fontWeight'];

export default function InfoOverlay({
  settings,
  framePadding,
  onOffsetChange,
  onCustomExifChange,
  onTextColorChange,
}: InfoOverlayProps) {
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const offsetRef = useRef(settings.infoOffset);
  const dragStartRef = useRef(settings.infoOffset);
  const isFirstRun = useRef(true);

  useEffect(() => {
    offsetRef.current = settings.infoOffset;
  }, [settings.infoOffset]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          dragStartRef.current = offsetRef.current;
        },
        onPanResponderMove: (_evt, gesture) => {
          onOffsetChange?.({
            x: dragStartRef.current.x + gesture.dx,
            y: dragStartRef.current.y + gesture.dy,
          });
        },
      }),
    [onOffsetChange],
  );

  // 用于编辑的值（显示当前自定义值或使用占位符）
  const paramsValue = settings.customExif.params ?? '';

  // 用于显示的默认值
  const paramsPlaceholder = DEFAULT_EXIF_INFO.params;

  const line1Style = useMemo(
    () => ({
      color: settings.textColor,
      fontSize: settings.line1Style.fontSize,
      fontWeight: toFontWeight(settings.line1Style.fontWeight),
      letterSpacing:
        settings.line1Style.letterSpacing * settings.line1Style.fontSize,
      opacity: settings.line1Style.opacity,
    }),
    [
      settings.line1Style.fontSize,
      settings.line1Style.fontWeight,
      settings.line1Style.letterSpacing,
      settings.line1Style.opacity,
      settings.textColor,
    ],
  );

  const line2Style = useMemo(
    () => ({
      color: settings.textColor,
      fontSize: settings.line2Style.fontSize,
      fontWeight: toFontWeight(settings.line2Style.fontWeight),
      letterSpacing:
        settings.line2Style.letterSpacing * settings.line2Style.fontSize,
      opacity: settings.line2Style.opacity,
    }),
    [
      settings.line2Style.fontSize,
      settings.line2Style.fontWeight,
      settings.line2Style.letterSpacing,
      settings.line2Style.opacity,
      settings.textColor,
    ],
  );

  const alignItems: ViewStyle['alignItems'] = 'center';

  const containerStyle = useMemo(
    () => ({
      left: 0,
      right: 0,
      bottom: 0,
      height: settings.infoPadding,
      paddingHorizontal: framePadding,
      justifyContent: 'center' as const,
      transform: [
        {translateX: settings.infoOffset.x},
        {translateY: settings.infoOffset.y},
      ],
      alignItems,
    }),
    [
      alignItems,
      framePadding,
      settings.infoPadding,
      settings.infoOffset.x,
      settings.infoOffset.y,
    ],
  );

  const handleExifChange = (
    key: keyof FrameSettings['customExif'],
    value: string,
  ) => {
    onCustomExifChange?.(key, value);
  };

  // 当 logoVariant 发生变化时（用户切换了 Logo 样式），自动清除自定义颜色
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (settings.customExif.logoColor) {
      onCustomExifChange?.('logoColor', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.customExif.logoVariant]);

  // ===========================================================================
  // 1. 数据解析与品牌识别
  // ===========================================================================

  // 获取原始文本值
  const rawModelValue = settings.customExif.model || '';

  // 识别品牌和预设
  // 优先基于选中的预设ID，如果没有则尝试从文本内容中自动识别品牌
  const {brand, cameraPreset} = useMemo(() => {
    // Case A: 用户明确选择了某个相机的预设
    if (settings.selectedCameraPresetId) {
      return {
        brand: getBrandByPresetId(settings.selectedCameraPresetId),
        cameraPreset: getCameraPresetById(settings.selectedCameraPresetId),
      };
    }

    // Case B: 没有选择预设，尝试从文本中智能分析品牌 (例如从 "NIKON D800" 识别出 Nikon)
    if (rawModelValue) {
      return {
        brand: detectBrandFromContent(rawModelValue),
        cameraPreset: undefined,
      };
    }

    return {brand: undefined, cameraPreset: undefined};
  }, [settings.selectedCameraPresetId, rawModelValue]);

  // ===========================================================================
  // 2. Logo 显示逻辑
  // ===========================================================================

  // 用户选择的 Logo 变体
  const logoVariant = settings.customExif.logoVariant;
  const customLogoColor = settings.customExif.logoColor;

  // 计算实际使用的变体
  // 规则：如果用户指定了自定义颜色，强制使用 'white' 变体（因为只有 white 变体支持 currentColor）
  const effectiveVariant = useMemo(
    () => (customLogoColor ? 'white' : logoVariant || 'white'),
    [customLogoColor, logoVariant],
  );

  // 获取 Logo 资源
  const logoSource = useMemo(() => {
    if (!brand) return null;
    const brandLogos = BRAND_LOGOS[brand.id];
    if (!brandLogos) return null;

    // 1. 尝试选中的变体
    if (brandLogos[effectiveVariant]) {
      return brandLogos[effectiveVariant];
    }

    // 2. 依次尝试回退到常用变体
    return (
      brandLogos.white ||
      brandLogos.color ||
      brandLogos.original ||
      // 3. 实在不行，拿第一个非配置字段出来显示
      brandLogos[Object.keys(brandLogos).find(k => k !== 'isSquare') || '']
    );
  }, [brand, effectiveVariant]);

  const LogoComponent = logoSource?.default || logoSource;
  const hasValidLogo = !!LogoComponent && typeof LogoComponent !== 'number';
  const shouldShowLogo = settings.showBrandLogo && !!brand && hasValidLogo;

  // 计算 Logo 颜色
  // Logo 颜色完全独立于文字颜色
  // 仅对 white 变体生效（其他变体使用 SVG 原本的颜色）
  const activeLogoColor = useMemo(() => {
    // 如果用户设置了自定义 Logo 颜色，使用它
    if (customLogoColor) return customLogoColor;
    // 非 white 变体使用 SVG 原本的颜色
    if (logoVariant && logoVariant !== 'white') return undefined;
    // white 变体默认使用白色（独立于文字颜色）
    return '#FFFFFF';
  }, [customLogoColor, logoVariant]);

  // ===========================================================================
  // 3. 文案排重逻辑
  // ===========================================================================

  // 计算 Placeholder (当用户未输入时显示的提示文案)
  const actualModelPlaceholder = useMemo(() => {
    // 默认回退值
    const defaultText = DEFAULT_EXIF_INFO.model;

    if (cameraPreset) {
      // 如果显示 Logo -> 用简短型号 (e.g. "Z8")
      // 如果仅显示文字 -> 用完整型号 (e.g. "Nikon Z8")
      return shouldShowLogo ? cameraPreset.modelOnly : cameraPreset.displayName;
    }

    return defaultText;
  }, [cameraPreset, shouldShowLogo]);

  // 计算实际显示的文本 (Value)
  const displayModelText = useMemo(() => {
    if (!rawModelValue) return '';

    // 规则 3: 如果不显示 Logo (功能关闭 或 没匹配到)，直接显示完整文案
    if (!shouldShowLogo) {
      return rawModelValue;
    }

    // 规则 2: 有 Logo 的情况下，需要去除文案中的品牌名称避免重复
    const text = rawModelValue.trim();
    const lowerText = text.toLowerCase();

    // 2.1 精确匹配预设 (如果内容完全等于预设的全名，直接用 Short Name)
    if (cameraPreset && text === cameraPreset.model) {
      return cameraPreset.modelOnly;
    }

    // 2.2 通用匹配：智能移除品牌前缀
    if (brand) {
      // 尝试移除 Display Name (e.g. "Nikon" from "Nikon D800")
      if (brand.name) {
        const brandNameLower = brand.name.toLowerCase();
        if (lowerText.startsWith(brandNameLower)) {
          return text.slice(brand.name.length).trim();
        }
      }

      // 尝试移除 Brand ID (e.g. "nikon" from "NIKON CORPORATION D800")
      if (brand.id) {
        const brandIdLower = brand.id.toLowerCase();
        if (lowerText.startsWith(brandIdLower)) {
          return text.slice(brand.id.length).trim();
        }
      }
    }

    // 如果没法智能移除，就保持原样 (这通常是用户自定义的非标准格式)
    return text;
  }, [rawModelValue, shouldShowLogo, cameraPreset, brand]);

  // ===========================================================================
  // 4. 样式计算与渲染
  // ===========================================================================

  const logoHeight = settings.line1Style.fontSize * 1.1;
  const brandLogos = brand ? BRAND_LOGOS[brand.id] : null;
  const variantMeta = brandLogos?.variants?.[effectiveVariant];

  const effectivelySquare = variantMeta?.isSquare ?? brand?.isSquare;
  const logoAspectRatio =
    variantMeta?.aspectRatio ?? (effectivelySquare ? 1.2 : 3.5);

  const logoWidth = logoHeight * logoAspectRatio;

  if (!settings.showExif) {
    return null;
  }

  return (
    <>
      <View
        style={[styles.container, containerStyle]}
        {...panResponder.panHandlers}>
        <View style={styles.centeredBlock}>
          <View style={styles.modelRow}>
            {shouldShowLogo && (
              <TouchableOpacity
                onPress={() => setShowLogoPicker(true)}
                onLongPress={() => setShowColorPicker(true)}
                delayLongPress={500}
                activeOpacity={0.6}
                style={styles.logoContainerCentered}>
                <LogoComponent
                  height={logoHeight}
                  width={logoWidth}
                  fill={activeLogoColor}
                  style={activeLogoColor ? {color: activeLogoColor} : undefined}
                  preserveAspectRatio="xMidYMid meet"
                />
              </TouchableOpacity>
            )}
            <EditableText
              value={displayModelText}
              placeholder={actualModelPlaceholder}
              onChange={val => handleExifChange('model', val)}
              onLongPress={() => setShowTextColorPicker(true)}
              style={line1Style}
              textAlign="center"
            />
          </View>
          <View style={{marginTop: settings.infoGap}}>
            <EditableText
              value={paramsValue}
              placeholder={paramsPlaceholder}
              onChange={val => handleExifChange('params', val)}
              onLongPress={() => setShowTextColorPicker(true)}
              style={line2Style}
              textAlign="center"
            />
          </View>
        </View>
      </View>

      <LogoPickerModal
        visible={showLogoPicker}
        onClose={() => setShowLogoPicker(false)}
        brand={brand}
        selectedVariant={logoVariant}
        onSelect={variant => handleExifChange('logoVariant', variant)}
      />

      <LogoColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={activeLogoColor || settings.textColor || '#FFFFFF'}
        onColorChange={color => handleExifChange('logoColor', color)}
      />

      <LogoColorPickerModal
        visible={showTextColorPicker}
        onClose={() => setShowTextColorPicker(false)}
        currentColor={settings.textColor || '#FFFFFF'}
        onColorChange={color => onTextColorChange?.(color)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  centeredBlock: {
    alignItems: 'center',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainerCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
});
