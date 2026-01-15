import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  Animated,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

import type {FrameSettings} from '../../types';
import {getGradientPoints} from '../../utils/gradient';

interface BackgroundLayerProps {
  settings: FrameSettings;
  imageUri: string;
  disableAnimation?: boolean;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function BackgroundLayer({
  settings,
  imageUri,
  disableAnimation = false,
  onImageLoad,
}: BackgroundLayerProps & {onImageLoad?: () => void}) {
  const [size, setSize] = useState({width: 0, height: 0});
  // 生成实例唯一的 ID，防止导出界面和预览界面的驱动冲突
  const gradientId = useRef(
    `bgGradient_${Math.random().toString(36).substr(2, 9)}`,
  ).current;

  // 动画透明度控制
  const colorOpacity = useRef(
    new Animated.Value(settings.backgroundType === 'color' ? 1 : 0),
  ).current;
  const gradientOpacity = useRef(
    new Animated.Value(settings.backgroundType === 'gradient' ? 1 : 0),
  ).current;
  const blurOpacity = useRef(
    new Animated.Value(settings.backgroundType === 'blur' ? 1 : 0),
  ).current;

  useEffect(() => {
    const type = settings.backgroundType;
    const targets = {
      color: type === 'color' ? 1 : 0,
      gradient: type === 'gradient' ? 1 : 0,
      blur: type === 'blur' ? 1 : 0,
    };

    if (disableAnimation) {
      colorOpacity.setValue(targets.color);
      gradientOpacity.setValue(targets.gradient);
      blurOpacity.setValue(targets.blur);
      return;
    }

    Animated.parallel([
      Animated.timing(colorOpacity, {
        toValue: targets.color,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(gradientOpacity, {
        toValue: targets.gradient,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(blurOpacity, {
        toValue: targets.blur,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    settings.backgroundType,
    disableAnimation,
    colorOpacity,
    gradientOpacity,
    blurOpacity,
  ]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setSize({width, height});
  };

  const gradientPoints = useMemo(
    () => getGradientPoints(settings.gradientAngle),
    [settings.gradientAngle],
  );

  const brightnessOverlay = useMemo(() => {
    const brightness = clamp(settings.backgroundBrightness, 20, 200);
    if (brightness === 100) {
      return null;
    }
    if (brightness < 100) {
      const alpha = ((100 - brightness) / 80) * 0.6;
      return {backgroundColor: `rgba(0, 0, 0, ${alpha})`};
    }
    const alpha = ((brightness - 100) / 100) * 0.3;
    return {backgroundColor: `rgba(255, 255, 255, ${alpha})`};
  }, [settings.backgroundBrightness]);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* 纯色层: 仅当需要时渲染 */}
      {(settings.backgroundType === 'color' || !disableAnimation) && (
        <Animated.View
          style={[
            styles.fill,
            {backgroundColor: settings.backgroundColor, opacity: colorOpacity},
          ]}
        />
      )}

      {/* 渐变层 */}
      {(settings.backgroundType === 'gradient' || !disableAnimation) && (
        <Animated.View
          style={[styles.fill, {opacity: gradientOpacity}]}
          onLayout={handleLayout}>
          {size.width > 0 && (
            <Svg
              style={styles.fill}
              viewBox={`0 0 ${size.width} ${size.height}`}
              preserveAspectRatio="none">
              <Defs>
                <LinearGradient
                  id={gradientId}
                  x1={gradientPoints.x1}
                  y1={gradientPoints.y1}
                  x2={gradientPoints.x2}
                  y2={gradientPoints.y2}>
                  <Stop offset="0" stopColor={settings.gradientStartColor} />
                  <Stop offset="1" stopColor={settings.gradientEndColor} />
                </LinearGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width={size.width}
                height={size.height}
                fill={`url(#${gradientId})`}
              />
            </Svg>
          )}
        </Animated.View>
      )}

      {/* 模糊层 */}
      {(settings.backgroundType === 'blur' || !disableAnimation) && (
        <Animated.View style={[styles.fill, {opacity: blurOpacity}]}>
          <Image
            source={{uri: imageUri}}
            style={styles.fill}
            resizeMode="cover"
            blurRadius={Math.max(0, settings.blurAmount)}
            fadeDuration={0}
            onLoadEnd={() =>
              settings.backgroundType === 'blur' && onImageLoad?.()
            }
          />
          <View style={[styles.fill, styles.blurOverlay]} />
        </Animated.View>
      )}

      {brightnessOverlay && <View style={[styles.fill, brightnessOverlay]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
});
