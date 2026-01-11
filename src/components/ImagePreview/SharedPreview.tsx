import React, {useMemo} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {colors} from '../../theme';
import type {FrameSettings, CropRect} from '../../types';
import {BackgroundLayer} from '../BackgroundLayer';
import {InfoOverlay} from '../InfoOverlay';

interface SharedPreviewProps {
  imageUri: string;
  settings: FrameSettings;
  viewportSize: {width: number; height: number};
  framePadding: number;
  cropRect?: CropRect;
  cropRotation?: number;
  cropFlip?: {horizontal: boolean; vertical: boolean};
  onInfoOffsetChange?: (offset: {x: number; y: number}) => void;
  exifPadding?: number;
  infoBaseBottom?: number;
  onImageLoad?: () => void;
}

export const SharedPreview = React.memo(
  ({
    imageUri,
    settings,
    viewportSize,
    framePadding,
    cropRect = {x: 0, y: 0, width: 1, height: 1},
    cropRotation = 0,
    cropFlip = {horizontal: false, vertical: false},
    onInfoOffsetChange = () => {},
    exifPadding = 40,
    infoBaseBottom = 12,
    onImageLoad,
  }: SharedPreviewProps) => {
    const imageShadowStyle = useMemo(() => {
      const shadowSize = Math.max(0, settings.shadowSize);
      const shadowOpacity = shadowSize > 0 ? settings.shadowOpacity : 0;
      return {
        borderRadius: Math.max(0, settings.borderRadius),
        shadowColor: colors.black,
        shadowOffset: {width: 0, height: shadowSize * 0.6},
        shadowOpacity,
        shadowRadius: shadowSize,
        elevation: shadowSize > 0 ? Math.round(shadowSize) : 0,
      };
    }, [settings.borderRadius, settings.shadowOpacity, settings.shadowSize]);

    const imageBorderStyle = useMemo(
      () => ({
        borderRadius: Math.max(0, settings.borderRadius),
        borderWidth: Math.max(0, settings.borderWidth),
        borderColor: settings.borderColor,
      }),
      [settings.borderColor, settings.borderRadius, settings.borderWidth],
    );

    const frameStyle = useMemo(
      () => [
        styles.imageFrame,
        {
          padding: framePadding,
          paddingBottom: framePadding + (settings.showExif ? exifPadding : 0),
          width: viewportSize.width + framePadding * 2,
        },
      ],
      [framePadding, settings.showExif, viewportSize.width, exifPadding],
    );

    // Math for Visual Crop Transform
    const visualW = viewportSize.width / cropRect.width;
    const visualH = viewportSize.height / cropRect.height;

    const isRotated = cropRotation % 180 !== 0;
    const imgStyleW = isRotated ? visualH : visualW;
    const imgStyleH = isRotated ? visualW : visualH;

    return (
      <View style={frameStyle} collapsable={false}>
        <BackgroundLayer settings={settings} imageUri={imageUri} />
        <View
          style={[
            styles.imageViewportOuter,
            imageShadowStyle,
            {
              width: viewportSize.width,
              height: viewportSize.height,
            },
          ]}>
          <View style={[styles.imageViewport, imageBorderStyle]}>
            <View
              style={{
                width: visualW,
                height: visualH,
                left: -cropRect.x * visualW,
                top: -cropRect.y * visualH,
                position: 'absolute',
                overflow: 'hidden',
              }}>
              <Image
                source={{uri: imageUri}}
                style={{
                  width: imgStyleW,
                  height: imgStyleH,
                  left: (visualW - imgStyleW) / 2,
                  top: (visualH - imgStyleH) / 2,
                  position: 'absolute',
                  transform: [
                    {rotate: `${cropRotation}deg`},
                    {scaleX: cropFlip.horizontal ? -1 : 1},
                    {scaleY: cropFlip.vertical ? -1 : 1},
                  ],
                }}
                resizeMode="cover"
                onLoadEnd={onImageLoad}
              />
            </View>
          </View>
        </View>
        <InfoOverlay
          settings={settings}
          framePadding={framePadding}
          onOffsetChange={onInfoOffsetChange}
          baseBottom={infoBaseBottom}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  imageFrame: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  imageViewportOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewport: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.placeholder,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
