import React, {useMemo, useState} from 'react';
import {Image, LayoutChangeEvent, StyleSheet, View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

import type {FrameSettings} from '../../types';
import {getGradientPoints} from '../../utils/gradient';

interface BackgroundLayerProps {
  settings: FrameSettings;
  imageUri: string;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function BackgroundLayer({
  settings,
  imageUri,
}: BackgroundLayerProps) {
  const [size, setSize] = useState({width: 0, height: 0});

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
    <View style={styles.container} pointerEvents="none" onLayout={handleLayout}>
      {settings.backgroundType === 'color' && (
        <View
          style={[styles.fill, {backgroundColor: settings.backgroundColor}]}
        />
      )}

      {settings.backgroundType === 'gradient' && size.width > 0 && (
        <Svg
          style={styles.fill}
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}>
          <Defs>
            <LinearGradient
              id="bgGradient"
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
            fill="url(#bgGradient)"
          />
        </Svg>
      )}

      {settings.backgroundType === 'blur' && (
        <>
          <Image
            source={{uri: imageUri}}
            style={styles.fill}
            resizeMode="cover"
            blurRadius={Math.max(0, settings.blurAmount)}
          />
          <View style={[styles.fill, styles.blurOverlay]} />
        </>
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
