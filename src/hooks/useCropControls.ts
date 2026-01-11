import {useCallback, useEffect, useState} from 'react';

import type {CropAspectId} from '../types';

const MIN_ZOOM = 1;

export const useCropControls = (imageUri: string) => {
  const [cropAspect, setCropAspect] = useState<CropAspectId>('free');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropFlip, setCropFlip] = useState({
    horizontal: false,
    vertical: false,
  });

  useEffect(() => {
    setCropZoom(1);
    setCropRotation(0);
    setCropFlip({horizontal: false, vertical: false});
    setCropAspect('free');
  }, [imageUri]);

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
    minZoom: MIN_ZOOM,
    setCropAspect,
    setCropZoom,
    setCropRotation,
    setCropFlip,
    handleRotateStep,
  };
};
