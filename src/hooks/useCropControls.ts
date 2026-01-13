import {useCallback, useEffect, useMemo, useState} from 'react';

import {DEFAULT_CROP_RECT, MIN_CROP_ZOOM} from '../config';
import type {CropAspectId, CropControls, CropFlip, CropRect} from '../types';

export const useCropControls = (imageUri: string): CropControls => {
  const [cropAspect, setCropAspect] = useState<CropAspectId>('free');
  const [cropZoom, setCropZoom] = useState(MIN_CROP_ZOOM);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropFlip, setCropFlip] = useState<CropFlip>({
    horizontal: false,
    vertical: false,
  });

  // 默认全选 (0,0,1,1)
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);

  useEffect(() => {
    setCropZoom(MIN_CROP_ZOOM);
    setCropRotation(0);
    setCropFlip({horizontal: false, vertical: false});
    setCropAspect('free');
    setCropRect(DEFAULT_CROP_RECT);
  }, [imageUri]);

  const cropAspectRatio = useMemo(() => {
    if (cropAspect === 'free') {
      return undefined;
    }
    const parts = cropAspect.split(':');
    if (parts.length !== 2) {
      return undefined;
    }
    const width = Number(parts[0]);
    const height = Number(parts[1]);
    if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
      return undefined;
    }
    return width / height;
  }, [cropAspect]);

  const handleRotateStep = useCallback((delta: number) => {
    setCropRotation(prev => {
      const next = (prev + delta) % 360;
      return next < 0 ? next + 360 : next;
    });
  }, []);

  return {
    cropAspect,
    cropZoom,
    cropRotation,
    cropFlip,
    cropRect,
    cropAspectRatio,
    minZoom: MIN_CROP_ZOOM,
    setCropAspect,
    setCropZoom,
    setCropRotation,
    setCropFlip,
    setCropRect,
    handleRotateStep,
  };
};
