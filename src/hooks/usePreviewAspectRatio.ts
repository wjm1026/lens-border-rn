/**
 * usePreviewAspectRatio Hook
 *
 * 计算预览区域的宽高比，支持多种布局模式：
 * - original: 保持原图/裁切后的宽高比
 * - square: 1:1 正方形
 * - portrait: 3:4 竖向
 * - landscape: 4:3 横向
 *
 * 切换布局时会自动触发 LayoutAnimation 动画
 */

import {useMemo, useRef} from 'react';
import {LayoutAnimation, Platform, UIManager} from 'react-native';

import {LAYOUT_ANIMATION_CONFIG} from '../config';
import type {AspectRatio, CropRect} from '../types';

// 在 Android 上启用 LayoutAnimation
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PreviewAspectParams {
  imageAspectRatio: number;
  cropRect: CropRect;
  layoutAspectRatio: AspectRatio;
}

export const usePreviewAspectRatio = ({
  imageAspectRatio,
  cropRect,
  layoutAspectRatio,
}: PreviewAspectParams) => {
  // 追踪 layoutAspectRatio 变化，在变化**之前**配置动画
  const prevLayoutAspectRatioRef = useRef(layoutAspectRatio);

  // 在 layoutAspectRatio 变化时立即触发 LayoutAnimation
  // 注意：这里使用 useMemo 而不是 useEffect，因为需要在渲染**之前**配置动画
  if (prevLayoutAspectRatioRef.current !== layoutAspectRatio) {
    prevLayoutAspectRatioRef.current = layoutAspectRatio;
    LayoutAnimation.configureNext(LAYOUT_ANIMATION_CONFIG);
  }

  const effectiveImageAspectRatio = useMemo(() => {
    const safeImageRatio = imageAspectRatio > 0 ? imageAspectRatio : 1;
    // 不根据旋转角度自动调整宽高比，完全由用户控制
    const contentRatio = safeImageRatio;
    const cropRatio = cropRect.height > 0 ? cropRect.width / cropRect.height : 1;
    return cropRatio * contentRatio;
  }, [
    cropRect.height,
    cropRect.width,
    imageAspectRatio,
  ]);

  const previewAspectRatio = useMemo(() => {
    switch (layoutAspectRatio) {
      case 'square':
        return 1;
      case 'portrait':
        return 3 / 4;
      case 'landscape':
        return 4 / 3;
      case 'original':
      default:
        return effectiveImageAspectRatio;
    }
  }, [effectiveImageAspectRatio, layoutAspectRatio]);

  return {effectiveImageAspectRatio, previewAspectRatio};
};
