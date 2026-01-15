import React, {useMemo} from 'react';
import {View} from 'react-native';

import {CROP_HANDLE_SIZE} from '../../config';
import {styles} from './styles';
import type {CropHandlesProps} from './types';

export const CropHandles: React.FC<CropHandlesProps> = React.memo(
  ({cropBoxX, cropBoxY, cropBoxSize, cornerResponders}) => {
    const handleStyles = useMemo(
      () => ({
        tl: {
          left: cropBoxX - CROP_HANDLE_SIZE / 2,
          top: cropBoxY - CROP_HANDLE_SIZE / 2,
        },
        tr: {
          left: cropBoxX + cropBoxSize.width - CROP_HANDLE_SIZE / 2,
          top: cropBoxY - CROP_HANDLE_SIZE / 2,
        },
        bl: {
          left: cropBoxX - CROP_HANDLE_SIZE / 2,
          top: cropBoxY + cropBoxSize.height - CROP_HANDLE_SIZE / 2,
        },
        br: {
          left: cropBoxX + cropBoxSize.width - CROP_HANDLE_SIZE / 2,
          top: cropBoxY + cropBoxSize.height - CROP_HANDLE_SIZE / 2,
        },
      }),
      [cropBoxX, cropBoxY, cropBoxSize.width, cropBoxSize.height],
    );

    return (
      <>
        <View
          style={[styles.handleContainer, handleStyles.tl]}
          {...cornerResponders.tl.panHandlers}
        />
        <View
          style={[styles.handleContainer, handleStyles.tr]}
          {...cornerResponders.tr.panHandlers}
        />
        <View
          style={[styles.handleContainer, handleStyles.bl]}
          {...cornerResponders.bl.panHandlers}
        />
        <View
          style={[styles.handleContainer, handleStyles.br]}
          {...cornerResponders.br.panHandlers}
        />
      </>
    );
  },
);
