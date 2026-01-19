import {useMemo} from 'react';

import {DEFAULT_SETTINGS} from '../config';
import {buildExifParams} from '../utils/exifUtils';
import {matchPresetByExif} from '../data';
import type {FrameSettings, ParsedExifData} from '../types';

export const useInitialFrameSettings = (
  initialExif?: ParsedExifData,
): FrameSettings => {
  return useMemo(() => {
    if (!initialExif) {
      return DEFAULT_SETTINGS;
    }

    // 尝试根据 EXIF 的 Model 自动匹配预设
    const matchedPreset = matchPresetByExif(initialExif.Model);

    return {
      ...DEFAULT_SETTINGS,
      // 如果匹配到预设，自动设置选中的预设 ID（这样就能显示 Logo）
      selectedCameraPresetId: matchedPreset?.id ?? null,
      customExif: {
        model: initialExif.Model,
        lens: initialExif.LensModel,
        params: buildExifParams(initialExif),
        date: initialExif.DateTime,
      },
    };
  }, [initialExif]);
};
