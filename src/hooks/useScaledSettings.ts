/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-12 05:09:46
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 05:13:34
 * @FilePath: /code/lens-border-rn/src/hooks/useScaledSettings.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {useMemo} from 'react';
import {type FrameSettings} from '../types';

/**
 * 将设置中的尺寸参数按照指定倍数进行缩放
 * 用于高分辨率导出时保持相对比例
 */
export const useScaledSettings = (
  settings: FrameSettings,
  scale: number,
) => {
  return useMemo(() => {
    // 如果是 1x，直接返回原设置，避免不必要的计算
    if (scale === 1) {
      return settings;
    }

    return {
      ...settings,
      padding: settings.padding * scale,
      borderRadius: settings.borderRadius * scale,
      shadowSize: settings.shadowSize * scale,
      borderWidth: settings.borderWidth * scale,
      infoPadding: settings.infoPadding * scale,
      infoGap: settings.infoGap * scale,
      // 缩放模糊半径
      blurAmount: settings.blurAmount * scale,
      infoOffset: {
        x: settings.infoOffset.x * scale,
        y: settings.infoOffset.y * scale,
      },
      line1Style: {
        ...settings.line1Style,
        fontSize: settings.line1Style.fontSize * scale,
        // letterSpacing is relative (multiplier), no need to scale
      },
      line2Style: {
        ...settings.line2Style,
        fontSize: settings.line2Style.fontSize * scale,
      },
    };
  }, [settings, scale]);
};
