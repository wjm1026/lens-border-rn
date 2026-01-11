/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 20:16:42
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-11 20:17:59
 * @FilePath: /code/lens-border-rn/src/components/ui/Slider/Slider.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, {useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';

import {colors} from '../../../theme';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
}: SliderProps) {
  const trackWidth = useRef(0);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    trackWidth.current = event.nativeEvent.layout.width;
  }, []);

  const calculateValue = useCallback(
    (x: number) => {
      const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
      const rawValue = min + ratio * (max - min);
      const snappedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, snappedValue));
    },
    [min, max, step],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const newValue = calculateValue(evt.nativeEvent.locationX);
        onChange(newValue);
      },
      onPanResponderMove: evt => {
        const newValue = calculateValue(evt.nativeEvent.locationX);
        onChange(newValue);
      },
    }),
  ).current;

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>
          {value}
          {unit}
        </Text>
      </View>
      <View
        style={styles.trackContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.fill, {width: `${percentage}%`}]} />
        </View>
        <View style={[styles.thumb, {left: `${percentage}%`}]} />
      </View>
    </View>
  );
}

const THUMB_SIZE = 20;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  trackContainer: {
    height: 40,
    justifyContent: 'center',
    marginHorizontal: THUMB_SIZE / 2,
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.accent,
    marginLeft: -THUMB_SIZE / 2,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
