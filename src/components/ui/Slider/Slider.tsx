import React, {useCallback, useEffect, useMemo, useRef} from 'react';
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
  const trackRef = useRef<View>(null);
  const trackLayout = useRef({left: 0, width: 0});
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const updateTrackLayout = useCallback(() => {
    trackRef.current?.measureInWindow((left, _top, width) => {
      if (width > 0) {
        trackLayout.current = {left, width};
      }
    });
  }, []);

  const handleLayout = useCallback(
    (_event: LayoutChangeEvent) => {
      updateTrackLayout();
    },
    [updateTrackLayout],
  );

  const stepDecimals = useMemo(() => {
    const stepString = step.toString();
    const decimalIndex = stepString.indexOf('.');
    return decimalIndex >= 0 ? stepString.length - decimalIndex - 1 : 0;
  }, [step]);

  const calculateValue = useCallback(
    (pageX: number, layout = trackLayout.current) => {
      if (layout.width <= 0) {
        return min;
      }
      const ratio = Math.max(
        0,
        Math.min(1, (pageX - layout.left) / layout.width),
      );
      const rawValue = min + ratio * (max - min);
      const snappedValue = Math.round(rawValue / step) * step;
      const roundedValue =
        stepDecimals > 0
          ? Number(snappedValue.toFixed(stepDecimals))
          : snappedValue;
      return Math.max(min, Math.min(max, roundedValue));
    },
    [min, max, step, stepDecimals],
  );

  const updateValue = useCallback(
    (pageX: number) => {
      if (trackLayout.current.width <= 0) {
        return;
      }
      const newValue = calculateValue(pageX);
      onChangeRef.current(newValue);
    },
    [calculateValue],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false, // 不允许其他响应者抢走手势
        onShouldBlockNativeResponder: () => true, // 阻止原生滚动
        onPanResponderGrant: evt => {
          const pageX = evt.nativeEvent.pageX;
          trackRef.current?.measureInWindow((left, _top, width) => {
            if (width > 0) {
              trackLayout.current = {left, width};
              onChangeRef.current(calculateValue(pageX, {left, width}));
            }
          });
        },
        onPanResponderMove: (_evt, gestureState) => {
          updateValue(gestureState.moveX);
        },
      }),
    [calculateValue, updateValue],
  );

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueText}>
          {stepDecimals > 0 ? value.toFixed(stepDecimals) : Math.round(value)}
          {unit}
        </Text>
      </View>
      <View
        style={styles.trackContainer}
        ref={trackRef}
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
