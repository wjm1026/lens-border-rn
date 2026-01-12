import {useMemo} from 'react';

import {DEFAULT_SETTINGS} from '../config';
import {buildExifParams} from '../utils/exifUtils';
import type {FrameSettings, ParsedExifData} from '../types';

export const useInitialFrameSettings = (
  initialExif?: ParsedExifData,
): FrameSettings => {
  return useMemo(() => {
    if (!initialExif) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      customExif: {
        model: initialExif.Model,
        lens: initialExif.LensModel,
        params: buildExifParams(initialExif),
        date: initialExif.DateTime,
      },
    };
  }, [initialExif]);
};
