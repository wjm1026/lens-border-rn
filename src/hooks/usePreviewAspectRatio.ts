import {useMemo} from 'react';

import type {AspectRatio, CropRect} from '../types';

interface PreviewAspectParams {
  imageAspectRatio: number;
  cropRect: CropRect;
  cropRotation: number;
  layoutAspectRatio: AspectRatio;
}

export const usePreviewAspectRatio = ({
  imageAspectRatio,
  cropRect,
  cropRotation,
  layoutAspectRatio,
}: PreviewAspectParams) => {
  const effectiveImageAspectRatio = useMemo(() => {
    const safeImageRatio = imageAspectRatio > 0 ? imageAspectRatio : 1;
    const isRotated = cropRotation % 180 !== 0;
    const contentRatio = isRotated ? 1 / safeImageRatio : safeImageRatio;
    const cropRatio = cropRect.height > 0 ? cropRect.width / cropRect.height : 1;
    return cropRatio * contentRatio;
  }, [
    cropRect.height,
    cropRect.width,
    cropRotation,
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
