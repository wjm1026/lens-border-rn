import React, {useCallback, useMemo, useState} from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import type {FrameSettings, CropFlip, CropRect} from '../../types';
import {
  DEFAULT_CROP_RECT,
  PREVIEW_EXIF_PADDING,
} from '../../config';
import {SharedPreview} from './SharedPreview';

interface ImagePreviewProps {
  imageUri: string;
  settings: FrameSettings;
  previewAspectRatio: number;
  framePadding: number;
  captureRef: React.RefObject<View>; // 用于导出的 View ref
  onInfoOffsetChange: (offset: {x: number; y: number}) => void;
  onCustomExifChange?: (
    key: keyof FrameSettings['customExif'],
    value: string,
  ) => void;
  onTextColorChange?: (color: string) => void;
  cropRect?: CropRect;
  cropRotation?: number;
  cropFlip?: CropFlip;
}

export default function ImagePreview({
  imageUri,
  settings,
  previewAspectRatio,
  framePadding,
  captureRef,
  onInfoOffsetChange,
  onCustomExifChange,
  onTextColorChange,
  cropRect = DEFAULT_CROP_RECT,
  cropRotation = 0,
  cropFlip = {horizontal: false, vertical: false},
}: ImagePreviewProps) {
  const {width} = useWindowDimensions();
  const [previewAreaSize, setPreviewAreaSize] = useState({
    width: 0,
    height: 0,
  });

  const handlePreviewAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const {width: layoutWidth, height: layoutHeight} = event.nativeEvent.layout;
    if (layoutWidth > 0 && layoutHeight > 0) {
      setPreviewAreaSize(prev =>
        prev.width === layoutWidth && prev.height === layoutHeight
          ? prev
          : {width: layoutWidth, height: layoutHeight},
      );
    }
  }, []);

  const viewportSize = useMemo(() => {
    const baseWidth = previewAreaSize.width || width;
    const baseHeight = previewAreaSize.height || 0;
    const exifPadding = settings.showExif ? PREVIEW_EXIF_PADDING : 0;
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

  return (
    <View style={styles.previewArea} onLayout={handlePreviewAreaLayout}>
      <View ref={captureRef} collapsable={false}>
        <SharedPreview
          imageUri={imageUri}
          settings={settings}
          viewportSize={viewportSize}
          framePadding={framePadding}
          cropRect={cropRect}
          cropRotation={cropRotation}
          cropFlip={cropFlip}
          onInfoOffsetChange={onInfoOffsetChange}
          onCustomExifChange={onCustomExifChange}
          onTextColorChange={onTextColorChange}
        />
      </View>
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
});
