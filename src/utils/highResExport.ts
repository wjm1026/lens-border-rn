/**
 * @description 高分辨率导出服务
 * 使用离屏渲染技术实现高清图片导出
 */
import {Dimensions} from 'react-native';
import {captureRef} from 'react-native-view-shot';
import type {View} from 'react-native';
import type {RefObject} from 'react';

export interface HighResExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  scale: number; // 1-4x
}

/**
 * 高分辨率导出
 * 通过设置 captureRef 的 width 参数来实现高分辨率导出
 *
 * 注意：这种方法的效果取决于 react-native-view-shot 的实现
 * 如果图片仍然模糊，可能需要使用原生模块或其他方案
 */
export async function captureHighRes(
  viewRef: RefObject<View>,
  options: HighResExportOptions,
): Promise<string> {
  if (!viewRef.current) {
    throw new Error('View ref is not available');
  }

  const screenWidth = Dimensions.get('window').width;
  // 目标宽度 = 屏幕宽度 * 用户选择的倍数
  // 对于 iPhone，这可以达到 375 * 4 = 1500px
  // 对于更大屏幕设备，可以达到更高分辨率
  const targetWidth = Math.round(screenWidth * options.scale);

  console.log(`[HighResExport] Capturing at ${targetWidth}px width (${options.scale}x)`);

  const uri = await captureRef(viewRef.current, {
    format: options.format,
    quality: options.quality,
    result: 'tmpfile',
    width: targetWidth,
  });

  console.log(`[HighResExport] Captured: ${uri}`);
  return uri;
}
