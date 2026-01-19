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
import {getBrandByPresetId} from '../../data/cameraPresets';

interface InfoOverlayProps {
  settings: FrameSettings;
  framePadding: number;
  onOffsetChange?: (offset: {x: number; y: number}) => void;
  onCustomExifChange?: (
    key: keyof FrameSettings['customExif'],
    value: string,
  ) => void;
  baseBottom?: number;
}

const toFontWeight = (value: number): TextStyle['fontWeight'] =>
  `${value}` as TextStyle['fontWeight'];

export default function InfoOverlay({
  settings,
  framePadding,
  onOffsetChange,
  onCustomExifChange,
  baseBottom = 12,
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
  const modelValue = settings.customExif.model ?? '';
  const lensValue = settings.customExif.lens ?? '';
  const paramsValue = settings.customExif.params ?? '';
  const dateValue = settings.customExif.date ?? '';

  // 用于显示的默认值
  const modelPlaceholder = DEFAULT_EXIF_INFO.model;
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
      fontFamily: settings.line1Style.fontId,
    }),
    [
      settings.line1Style.fontId,
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
      fontFamily: settings.line2Style.fontId,
    }),
    [
      settings.line2Style.fontId,
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

  // 获取品牌Logo
  const brand = settings.selectedCameraPresetId
    ? getBrandByPresetId(settings.selectedCameraPresetId)
    : undefined;
  const logoSource = brand?.logoWhite;
  const LogoComponent = logoSource?.default || logoSource;
  const showLogo = settings.showBrandLogo && LogoComponent && typeof LogoComponent !== 'number';

  // Logo尺寸基于字体大小，使用更合理的高度和宽度比例
  const logoHeight = settings.line1Style.fontSize * 1.1;
  const logoWidth = logoHeight * 3.5; // 给横向Logo留足空间

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
            {showLogo && (
              <View style={[styles.logoContainer, {marginRight: 12}]}>
                <LogoComponent 
                  height={logoHeight} 
                  width={logoWidth} 
                  preserveAspectRatio="xMidYMid meet" 
                />
              </View>
            )}
            <EditableText
              value={modelValue}
              placeholder={modelPlaceholder}
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
              {showLogo && (
                <View style={[styles.logoContainer, {marginRight: 10}]}>
                  <LogoComponent 
                    height={logoHeight} 
                    width={logoWidth} 
                    preserveAspectRatio="xMinYMid meet" 
                  />
                </View>
              )}
              <EditableText
                value={modelValue}
                placeholder={modelPlaceholder}
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
