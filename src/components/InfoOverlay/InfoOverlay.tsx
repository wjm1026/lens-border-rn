import React, {useEffect, useMemo, useRef} from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type {FrameSettings} from '../../types';
import {DEFAULT_EXIF_INFO} from '../../config';
import EditableText from './EditableText';
import {
  getBrandByPresetId, 
  getCameraPresetById, 
  detectBrandFromContent
} from '../../data/index';

interface InfoOverlayProps {
  settings: FrameSettings;
  framePadding: number;
  onOffsetChange?: (offset: {x: number; y: number}) => void;
  onCustomExifChange?: (
    key: keyof FrameSettings['customExif'],
    value: string,
  ) => void;
}

const toFontWeight = (value: number): TextStyle['fontWeight'] =>
  `${value}` as TextStyle['fontWeight'];

export default function InfoOverlay({
  settings,
  framePadding,
  onOffsetChange,
  onCustomExifChange,
}: InfoOverlayProps) {
  const offsetRef = useRef(settings.infoOffset);
  const dragStartRef = useRef(settings.infoOffset);

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
  const lensValue = settings.customExif.lens ?? '';
  const paramsValue = settings.customExif.params ?? '';
  const dateValue = settings.customExif.date ?? '';

  // 用于显示的默认值
  const lensPlaceholder = DEFAULT_EXIF_INFO.lens;
  const paramsPlaceholder = DEFAULT_EXIF_INFO.params;
  const datePlaceholder = DEFAULT_EXIF_INFO.date;

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

  const alignItems: ViewStyle['alignItems'] =
    settings.infoLayout === 'centered' ? 'center' : 'stretch';

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

  const logoSource = brand?.logoWhite;
  const LogoComponent = logoSource?.default || logoSource;
  // 确保 Logo 资源有效且不是数字索引（SVG组件通常是函数）
  const hasValidLogo = !!(LogoComponent && typeof LogoComponent !== 'number');
  
  // 最终是否显示 Logo 的决策开关
  // 规则: 设置开启 && 找到了品牌 && 品牌有有效的Logo资源
  const shouldShowLogo = settings.showBrandLogo && !!brand && hasValidLogo;

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
  // 4. 样式计算
  // ===========================================================================

  const logoHeight = settings.line1Style.fontSize * 1.1;
  const isSquareLogo = brand?.isSquare;
  const logoWidth = logoHeight * (isSquareLogo ? 1.2 : 3.5);

  if (!settings.showExif) {
    return null;
  }

  return (
    <View
      style={[styles.container, containerStyle]}
      {...panResponder.panHandlers}>
      {settings.infoLayout === 'centered' ? (
        <View style={styles.centeredBlock}>
          <View style={styles.modelRow}>
            {shouldShowLogo && (
              <View style={styles.logoContainerCentered}>
                <LogoComponent
                  height={logoHeight}
                  width={logoWidth}
                  preserveAspectRatio="xMaxYMid meet"
                />
              </View>
            )}
            <EditableText
              value={displayModelText}
              placeholder={actualModelPlaceholder}
              onChange={val => handleExifChange('model', val)}
              style={line1Style}
              textAlign="center"
            />
          </View>
          <View style={{marginTop: settings.infoGap}}>
            <EditableText
              value={paramsValue}
              placeholder={paramsPlaceholder}
              onChange={val => handleExifChange('params', val)}
              style={line2Style}
              textAlign="center"
            />
          </View>
        </View>
      ) : (
        <View style={styles.classicRow}>
          <View style={styles.classicColumn}>
            <View style={styles.modelRow}>
              {shouldShowLogo && (
                <View style={styles.logoContainerClassic}>
                  <LogoComponent
                    height={logoHeight}
                    width={logoWidth}
                    preserveAspectRatio="xMaxYMid meet"
                  />
                </View>
              )}
              <EditableText
                value={displayModelText}
                placeholder={actualModelPlaceholder}
                onChange={val => handleExifChange('model', val)}
                style={[styles.modelText, line1Style]}
                textAlign="left"
              />
            </View>
            <View style={styles.marginTopSmall}>
              <EditableText
                value={lensValue}
                placeholder={lensPlaceholder}
                onChange={val => handleExifChange('lens', val)}
                style={line2Style}
                textAlign="left"
              />
            </View>
          </View>
          <View style={[styles.classicColumn, styles.classicColumnRight]}>
            <EditableText
              value={paramsValue}
              placeholder={paramsPlaceholder}
              onChange={val => handleExifChange('params', val)}
              style={line2Style}
              textAlign="right"
            />
            <View style={styles.marginTopSmall}>
              <EditableText
                value={dateValue}
                placeholder={datePlaceholder}
                onChange={val => handleExifChange('date', val)}
                style={line2Style}
                textAlign="right"
              />
            </View>
          </View>
        </View>
      )}
    </View>
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainerCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoContainerClassic: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  classicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  classicColumn: {
    flexShrink: 1,
  },
  classicColumnRight: {
    alignItems: 'flex-end',
  },
  modelText: {
    textTransform: 'uppercase',
  },
  marginTopSmall: {
    marginTop: 2,
  },
});
