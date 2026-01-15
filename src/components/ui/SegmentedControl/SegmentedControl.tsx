import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';

import {colors, fontSize} from '../../../theme';

export interface SegmentedOption<T> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
}

const PADDING = 4;
const ANIMATION_CONFIG = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
  useNativeDriver: false, // 位置动画需要使用JS驱动
};

export default function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  label,
  onSlidingStart,
  onSlidingComplete,
}: SegmentedControlProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const buttonScales = useRef(options.map(() => new Animated.Value(1))).current;
  const containerRef = useRef<View>(null);
  const containerPos = useRef({x: 0, y: 0}).current;
  const lastSelectedIndex = useRef<number>(-1);
  const isDragging = useRef(false);

  const activeIndex = useMemo(() => {
    if (options.length === 0) {
      return -1;
    }
    const index = options.findIndex(opt => opt.id === value);
    return index >= 0 ? index : 0;
  }, [options, value]);

  const activeId = activeIndex >= 0 ? options[activeIndex].id : undefined;

  // 计算segment宽度
  const innerWidth = containerWidth - PADDING * 2;
  const segmentWidth = options.length > 0 ? innerWidth / options.length : 0;

  // 当activeIndex或containerWidth变化时，动画移动indicator
  useEffect(() => {
    if (containerWidth > 0 && activeIndex >= 0) {
      const targetPosition = PADDING + activeIndex * segmentWidth;
      Animated.spring(indicatorPosition, {
        toValue: targetPosition,
        ...ANIMATION_CONFIG,
      }).start();
    }
  }, [activeIndex, containerWidth, segmentWidth, indicatorPosition]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth(width);
  }, []);

  // 处理滑动触摸，计算当前触摸位置对应的选项索引
  const handleTouch = useCallback(
    (pageX: number) => {
      if (containerWidth === 0 || options.length === 0) {
        return;
      }

      const rx = pageX - containerPos.x - PADDING;
      const index = Math.floor(rx / segmentWidth);
      const clampedIndex = Math.max(0, Math.min(options.length - 1, index));

      if (lastSelectedIndex.current !== clampedIndex) {
        onChange(options[clampedIndex].id);
        lastSelectedIndex.current = clampedIndex;
      }
    },
    [containerWidth, options, segmentWidth, onChange, containerPos],
  );

  // PanResponder 实现滑动选择
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: evt => {
        isDragging.current = true;
        lastSelectedIndex.current = -1;
        onSlidingStart?.();

        // 在异步回调之前保存 pageX，因为 evt 可能会被回收
        const initialPageX = evt.nativeEvent.pageX;
        containerRef.current?.measureInWindow((cx, cy) => {
          containerPos.x = cx;
          containerPos.y = cy;
          handleTouch(initialPageX);
        });
      },
      onPanResponderMove: evt => {
        handleTouch(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        lastSelectedIndex.current = -1;
        onSlidingComplete?.();
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        lastSelectedIndex.current = -1;
        onSlidingComplete?.();
      },
    }),
  ).current;

  const handlePress = useCallback(
    (id: T) => {
      // 如果正在拖动，不处理点击
      if (isDragging.current) {
        return;
      }
      onChange(id);
    },
    [onChange],
  );

  const handlePressIn = useCallback(
    (index: number) => {
      if (isDragging.current) {
        return;
      }
      Animated.spring(buttonScales[index], {
        toValue: 0.95,
        useNativeDriver: true,
        damping: 20,
        stiffness: 400,
      }).start();
    },
    [buttonScales],
  );

  const handlePressOut = useCallback(
    (index: number) => {
      if (isDragging.current) {
        return;
      }
      Animated.spring(buttonScales[index], {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 400,
      }).start();
    },
    [buttonScales],
  );

  if (options.length === 0) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        ref={containerRef}
        style={styles.controlContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}>
        {/* Animated Sliding Background Indicator */}
        {containerWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                width: segmentWidth,
                left: indicatorPosition,
              },
            ]}
            pointerEvents="none"
          />
        )}
        {options.map((opt, index) => {
          const isActive = activeId === opt.id;
          return (
            <Animated.View
              key={opt.id}
              style={[
                styles.buttonWrapper,
                {transform: [{scale: buttonScales[index]}]},
              ]}>
              <Pressable
                style={styles.button}
                onPress={() => handlePress(opt.id)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                accessibilityRole="tab"
                accessibilityState={{selected: isActive}}>
                <Text
                  style={[
                    styles.buttonText,
                    isActive && styles.activeButtonText,
                  ]}>
                  {opt.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  controlContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: PADDING,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  buttonWrapper: {
    flex: 1,
  },
  button: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  activeButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
