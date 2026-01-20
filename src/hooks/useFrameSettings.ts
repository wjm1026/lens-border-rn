import {useCallback, useState} from 'react';

import {DEFAULT_SETTINGS} from '../config';
import type {FrameSettings} from '../types';

export const useFrameSettings = (
  initialSettings: FrameSettings = DEFAULT_SETTINGS,
) => {
  const [settings, setSettings] = useState<FrameSettings>(initialSettings);

  const updateSettings = useCallback(
    <K extends keyof FrameSettings>(key: K, value: FrameSettings[K]) => {
      setSettings(prev => (prev[key] === value ? prev : {...prev, [key]: value}));
    },
    [],
  );

  const patchSettings = useCallback((patch: Partial<FrameSettings>) => {
    if (Object.keys(patch).length === 0) {
      return;
    }
    setSettings(prev => ({...prev, ...patch}));
  }, []);

  const updateInfoOffset = useCallback((nextOffset: FrameSettings['infoOffset']) => {
    setSettings(prev => ({...prev, infoOffset: nextOffset}));
  }, []);

  const resetInfoSettings = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showExif: initialSettings.showExif,
      showBrandLogo: initialSettings.showBrandLogo,
      textColor: initialSettings.textColor,
      infoLayout: initialSettings.infoLayout,
      infoPadding: initialSettings.infoPadding,
      infoGap: initialSettings.infoGap,
      infoOffset: {...initialSettings.infoOffset},
      line1Style: {...initialSettings.line1Style},
      line2Style: {...initialSettings.line2Style},
      customExif: {...initialSettings.customExif},
      selectedCameraPresetId: initialSettings.selectedCameraPresetId,
    }));
  }, [initialSettings]);

  return {
    settings,
    updateSettings,
    patchSettings,
    updateInfoOffset,
    resetInfoSettings,
  };
};
