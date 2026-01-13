import {useMemo} from 'react';

import type {AspectRatio, CropRect} from '../types';

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
