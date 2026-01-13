import React, {useMemo} from 'react';
import {View} from 'react-native';

import {styles} from './styles';
import type {CropBoxProps} from './types';

export const CropBox: React.FC<CropBoxProps> = React.memo(
  ({cropBoxX, cropBoxY, width, height}) => {
    const cropBoxStyle = useMemo(
      () => ({
        left: cropBoxX,
        top: cropBoxY,
        width,
        height,
      }),
      [cropBoxX, cropBoxY, width, height],
    );

    return (
      <View style={[styles.cropBox, cropBoxStyle]} pointerEvents="none">
        {/* 角落装饰 */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* 三分网格线 */}
        <View style={[styles.gridVertical, styles.gridVerticalThird]} />
        <View style={[styles.gridVertical, styles.gridVerticalTwoThird]} />
        <View style={[styles.gridHorizontal, styles.gridHorizontalThird]} />
        <View style={[styles.gridHorizontal, styles.gridHorizontalTwoThird]} />
      </View>
    );
  },
);
