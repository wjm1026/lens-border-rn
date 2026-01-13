/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-14 01:04:55
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-14 01:07:02
 * @FilePath: /code/lens-border-rn/src/components/Cropper/CropHandles.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
