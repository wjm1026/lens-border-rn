import {useMemo} from 'react';

import type {ExportSettings, FrameSettings} from '../types';

export const useExportSettings = (
  settings: FrameSettings,
): ExportSettings => {
  return useMemo(
    () => ({
      format: settings.exportFormat === 'jpeg' ? 'jpg' : 'png',
      quality: settings.exportQuality,
      scale: settings.exportScale,
    }),
    [settings.exportFormat, settings.exportQuality, settings.exportScale],
  );
};
