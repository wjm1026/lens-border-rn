import React, {useMemo} from 'react';
import {View} from 'react-native';

import {styles} from './styles';
import type {CropOverlayProps} from './types';

export const CropOverlay: React.FC<CropOverlayProps> = React.memo(
  ({containerSize, cropBoxX, cropBoxY, cropBoxSize}) => {
    const overlayTopStyle = useMemo(
      () => ({
        top: 0,
        left: 0,
        right: 0,
        height: Math.max(0, cropBoxY),
      }),
      [cropBoxY],
    );

    const overlayBottomStyle = useMemo(
      () => ({
        bottom: 0,
        left: 0,
        right: 0,
        height: Math.max(
          0,
          containerSize.height - cropBoxY - cropBoxSize.height,
        ),
      }),
      [containerSize.height, cropBoxSize.height, cropBoxY],
    );

    const overlayLeftStyle = useMemo(
      () => ({
        top: cropBoxY,
        left: 0,
        width: Math.max(0, cropBoxX),
        height: cropBoxSize.height,
      }),
      [cropBoxSize.height, cropBoxX, cropBoxY],
    );

    const overlayRightStyle = useMemo(
      () => ({
        top: cropBoxY,
        right: 0,
        width: Math.max(0, containerSize.width - cropBoxX - cropBoxSize.width),
        height: cropBoxSize.height,
      }),
      [
        containerSize.width,
        cropBoxSize.height,
        cropBoxSize.width,
        cropBoxX,
        cropBoxY,
      ],
    );

    return (
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={[styles.overlay, overlayTopStyle]} />
        <View style={[styles.overlay, overlayBottomStyle]} />
        <View style={[styles.overlay, overlayLeftStyle]} />
        <View style={[styles.overlay, overlayRightStyle]} />
      </View>
    );
  },
);
