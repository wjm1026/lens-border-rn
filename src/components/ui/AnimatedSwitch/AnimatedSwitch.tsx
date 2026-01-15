import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View, ViewStyle} from 'react-native';

import {colors} from '../../../theme';

interface AnimatedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 24;
const THUMB_MARGIN = 3;
const ANIMATION_DURATION = 200;

export default function AnimatedSwitch({
  value,
  onValueChange,
  disabled = false,
  style,
}: AnimatedSwitchProps) {
  const translateX = useRef(
    new Animated.Value(value ? TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2 : 0),
  ).current;
  const trackOpacity = useRef(new Animated.Value(value ? 1 : 0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const toValue = value ? TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2 : 0;

    Animated.parallel([
      Animated.spring(translateX, {
        toValue,
        useNativeDriver: true,
        damping: 20,
        stiffness: 250,
        mass: 0.8,
      }),
      Animated.timing(trackOpacity, {
        toValue: value ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, translateX, trackOpacity]);

  const handlePressIn = useCallback(() => {
    Animated.spring(thumbScale, {
      toValue: 0.9,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
    }).start();
  }, [thumbScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(thumbScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 400,
    }).start();
  }, [thumbScale]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onValueChange(!value);
    }
  }, [disabled, onValueChange, value]);

  const trackBackgroundColor = trackOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.12)', colors.accent],
  });

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}>
      <Animated.View
        style={[styles.track, {backgroundColor: trackBackgroundColor}]}>
        <View style={styles.trackInner}>
          <Animated.View
            style={[
              styles.thumb,
              {
                transform: [{translateX}, {scale: thumbScale}],
              },
            ]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackInner: {
    flex: 1,
    borderRadius: (TRACK_HEIGHT - 2) / 2,
    paddingHorizontal: THUMB_MARGIN,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
});
