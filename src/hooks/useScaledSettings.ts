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
