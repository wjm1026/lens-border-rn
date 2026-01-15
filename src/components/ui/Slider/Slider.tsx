import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';

import {colors, fontSize} from '../../../theme';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
  unit?: string;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onSlidingStart,
  onSlidingComplete,
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
          onSlidingStart?.();
        },
        onPanResponderMove: (_evt, gestureState) => {
          updateValue(gestureState.moveX);
        },
        onPanResponderRelease: () => {
          onSlidingComplete?.();
        },
        onPanResponderTerminate: () => {
          onSlidingComplete?.();
        },
      }),
    [calculateValue, updateValue, onSlidingStart, onSlidingComplete],
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
        <View style={styles.trackBackground}>
          <View style={styles.track}>
            <View style={[styles.fill, {width: `${percentage}%`}]} />
          </View>
        </View>
        <View style={[styles.thumbContainer, {left: `${percentage}%`}]}>
          <View style={styles.thumbOuter}>
            <View style={styles.thumbInner} />
          </View>
        </View>
      </View>
    </View>
  );
}

const THUMB_SIZE = 22;
const TRACK_HEIGHT = 6;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  trackContainer: {
    height: 36,
    justifyContent: 'center',
    marginHorizontal: THUMB_SIZE / 2,
  },
  trackBackground: {
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 1,
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumbContainer: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginLeft: -THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbOuter: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
