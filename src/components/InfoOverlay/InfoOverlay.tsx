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

const resolveInfoText = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

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
      left: framePadding,
      right: framePadding,
      bottom: baseBottom,
      transform: [
        {translateX: settings.infoOffset.x},
        {translateY: settings.infoOffset.y},
      ],
      alignItems,
    }),
    [
      alignItems,
      baseBottom,
      framePadding,
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

  if (!settings.showExif) {
    return null;
  }

  // 如果没有 onCustomExifChange 回调，使用静态显示模式
  const isEditable = !!onCustomExifChange;

  return (
    <View
      style={[styles.container, containerStyle]}
      {...panResponder.panHandlers}>
      {settings.infoLayout === 'centered' ? (
        <View style={[styles.centeredBlock, {padding: settings.infoPadding}]}>
          <EditableText
            value={modelValue}
            placeholder={modelPlaceholder}
            onChange={val => handleExifChange('model', val)}
            style={line1Style}
            textAlign="center"
          />
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
        <View style={[styles.classicRow, {padding: settings.infoPadding}]}>
          <View style={styles.classicColumn}>
            <EditableText
              value={modelValue}
              placeholder={modelPlaceholder}
              onChange={val => handleExifChange('model', val)}
              style={[styles.modelText, line1Style]}
              textAlign="left"
            />
            <View style={{marginTop: 2}}>
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
            <View style={{marginTop: 2}}>
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
});
