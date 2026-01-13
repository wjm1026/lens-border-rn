import React, {useMemo} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import type {CropFlip, CropRect} from '../../types';
import {CropBox} from './CropBox';
import {CropHandles} from './CropHandles';
import {CropOverlay} from './CropOverlay';
import {styles} from './styles';
import {useCropperGestures} from './useCropperGestures';
import {useCropperState} from './useCropperState';

interface CropperProps {
  imageUri: string;
  initialCropRect?: CropRect;
  onCropChange: (rect: CropRect) => void;
  aspectRatio?: number;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  flip: CropFlip;
}

export const Cropper: React.FC<CropperProps> = ({
  imageUri,
  initialCropRect,
  onCropChange,
  aspectRatio,
  rotation,
  onRotationChange,
  zoom,
  onZoomChange,
  flip,
}) => {
  const {
    containerSize,
    setContainerSize,
    imageOffset,
    setImageOffset,
    setCustomCropSize,
    baseFitSize,
    cropBoxSize,
    imageDisplaySize,
    isReady,
    clampImageOffset,
    calculateCropRect,
  } = useCropperState({
    imageUri,
    initialCropRect,
    aspectRatio,
    zoom,
    onCropChange,
  });

  const {imageGestureResponder, cornerResponders} = useCropperGestures({
    zoom,
    rotation,
    imageOffset,
    cropBoxSize,
    baseFitSize,
    aspectRatio,
    onZoomChange,
    onRotationChange,
    setImageOffset,
    setCustomCropSize,
    clampImageOffset,
    calculateCropRect,
    onCropChange,
  });

  // 位置计算
  const cropBoxX = (containerSize.width - cropBoxSize.width) / 2;
  const cropBoxY = (containerSize.height - cropBoxSize.height) / 2;

  const imageX =
    (containerSize.width - imageDisplaySize.width) / 2 + imageOffset.x;
  const imageY =
    (containerSize.height - imageDisplaySize.height) / 2 + imageOffset.y;

  const imageStyle = useMemo(() => {
    return {
      width: imageDisplaySize.width,
      height: imageDisplaySize.height,
      left: imageX,
      top: imageY,
      transform: [
        {rotate: `${rotation}deg`},
        {scaleX: flip.horizontal ? -1 : 1},
        {scaleY: flip.vertical ? -1 : 1},
      ],
    };
  }, [
    flip.horizontal,
    flip.vertical,
    imageDisplaySize.height,
    imageDisplaySize.width,
    imageX,
    imageY,
    rotation,
  ]);

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerSize(e.nativeEvent.layout)}>
      {isReady && (
        <>
          {/* 可拖动的图片层 */}
          <View
            style={StyleSheet.absoluteFill}
            {...imageGestureResponder.panHandlers}>
            <Image
              source={{uri: imageUri}}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          </View>

          {/* 遮罩层 */}
          <CropOverlay
            containerSize={containerSize}
            cropBoxX={cropBoxX}
            cropBoxY={cropBoxY}
            cropBoxSize={cropBoxSize}
          />

          {/* 裁切框边框 */}
          <CropBox
            cropBoxX={cropBoxX}
            cropBoxY={cropBoxY}
            width={cropBoxSize.width}
            height={cropBoxSize.height}
          />

          {/* 四角拖动手柄 */}
          <CropHandles
            cropBoxX={cropBoxX}
            cropBoxY={cropBoxY}
            cropBoxSize={cropBoxSize}
            cornerResponders={cornerResponders}
          />
        </>
      )}
    </View>
  );
};
