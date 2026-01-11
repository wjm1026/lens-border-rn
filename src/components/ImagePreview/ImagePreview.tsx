import React, {useCallback, useMemo, useState} from 'react';
import {
  Image,
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import {colors} from '../../theme';
import type {FrameSettings} from '../../types';
import {BackgroundLayer} from '../BackgroundLayer';
import {InfoOverlay} from '../InfoOverlay';

const EXIF_PADDING_EXTRA = 40;

interface ImagePreviewProps {
  imageUri: string;
  settings: FrameSettings;
  previewAspectRatio: number;
  framePadding: number;
  captureOptions: {
    format: 'jpg' | 'png';
    quality: number;
    result: 'tmpfile';
  };
  viewShotRef: React.RefObject<ViewShot>;
  onInfoOffsetChange: (offset: {x: number; y: number}) => void;
}

export default function ImagePreview({
  imageUri,
  settings,
  previewAspectRatio,
  framePadding,
  captureOptions,
  viewShotRef,
  onInfoOffsetChange,
}: ImagePreviewProps) {
  const {width} = useWindowDimensions();
  const [previewAreaSize, setPreviewAreaSize] = useState({
    width: 0,
    height: 0,
  });

  const handlePreviewAreaLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const {width: layoutWidth, height: layoutHeight} =
        event.nativeEvent.layout;
      if (layoutWidth > 0 && layoutHeight > 0) {
        setPreviewAreaSize(prev =>
          prev.width === layoutWidth && prev.height === layoutHeight
            ? prev
            : {width: layoutWidth, height: layoutHeight},
        );
      }
    },
    [],
  );

  const previewViewportSize = useMemo(() => {
    const baseWidth = previewAreaSize.width || width;
    const baseHeight = previewAreaSize.height || 0;
    const exifPadding = settings.showExif ? EXIF_PADDING_EXTRA : 0;
    const maxWidth = Math.max(0, baseWidth - framePadding * 2);
    const maxHeight = Math.max(0, baseHeight - framePadding * 2 - exifPadding);
    if (maxWidth === 0 || maxHeight === 0) {
      return {width: 0, height: 0};
    }
    const availableRatio = maxWidth / maxHeight;
    if (previewAspectRatio >= availableRatio) {
      return {width: maxWidth, height: maxWidth / previewAspectRatio};
    }
    return {width: maxHeight * previewAspectRatio, height: maxHeight};
  }, [
    framePadding,
    previewAreaSize.height,
    previewAreaSize.width,
    previewAspectRatio,
    settings.showExif,
    width,
  ]);

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
        paddingBottom:
          framePadding + (settings.showExif ? EXIF_PADDING_EXTRA : 0),
      },
    ],
    [framePadding, settings.showExif],
  );

  return (
    <View style={styles.previewArea} onLayout={handlePreviewAreaLayout}>
      <ViewShot
        ref={viewShotRef}
        style={frameStyle}
        options={captureOptions}
        collapsable={false}>
        <BackgroundLayer settings={settings} imageUri={imageUri} />
        <View
          style={[
            styles.imageViewportOuter,
            imageShadowStyle,
            {
              width: previewViewportSize.width,
              height: previewViewportSize.height,
            },
          ]}>
          <View style={[styles.imageViewport, imageBorderStyle]}>
            <Image
              source={{uri: imageUri}}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <InfoOverlay
          settings={settings}
          framePadding={framePadding}
          onOffsetChange={onInfoOffsetChange}
        />
      </ViewShot>
    </View>
  );
}

const styles = StyleSheet.create({
  previewArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  imageFrame: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
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
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
