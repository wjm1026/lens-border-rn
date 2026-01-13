import React, {useEffect, useMemo, useRef} from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type {FrameSettings} from '../../types';
import {DEFAULT_EXIF_INFO} from '../../config';

interface InfoOverlayProps {
  settings: FrameSettings;
  framePadding: number;
  onOffsetChange?: (offset: {x: number; y: number}) => void;
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

  const model = resolveInfoText(
    settings.customExif.model,
    DEFAULT_EXIF_INFO.model,
  );
  const lens = resolveInfoText(
    settings.customExif.lens,
    DEFAULT_EXIF_INFO.lens,
  );
  const params = resolveInfoText(
    settings.customExif.params,
    DEFAULT_EXIF_INFO.params,
  );
  const date = resolveInfoText(
    settings.customExif.date,
    DEFAULT_EXIF_INFO.date,
  );

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

  if (!settings.showExif) {
    return null;
  }

  return (
    <View
      style={[styles.container, containerStyle]}
      {...panResponder.panHandlers}>
      {settings.infoLayout === 'centered' ? (
        <View style={[styles.centeredBlock, {padding: settings.infoPadding}]}>
          <Text style={[styles.centeredText, line1Style]}>{model}</Text>
          <Text
            style={[
              styles.centeredText,
              line2Style,
              {marginTop: settings.infoGap},
            ]}>
            {params}
          </Text>
        </View>
      ) : (
        <View style={[styles.classicRow, {padding: settings.infoPadding}]}>
          <View style={styles.classicColumn}>
            <Text style={[styles.modelText, line1Style]}>{model}</Text>
            <Text style={[styles.lensText, line2Style]}>{lens}</Text>
          </View>
          <View style={[styles.classicColumn, styles.classicColumnRight]}>
            <Text style={[styles.paramsText, line2Style]}>{params}</Text>
            <Text style={[styles.dateText, line2Style]}>{date}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // bottom: 12,
  },
  centeredBlock: {
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
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
  lensText: {
    marginTop: 2,
  },
  paramsText: {
    textAlign: 'right',
  },
  dateText: {
    marginTop: 2,
    textAlign: 'right',
  },
});
