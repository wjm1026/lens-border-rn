import {useCallback, useState} from 'react';

import {DEFAULT_SETTINGS, type FrameSettings} from '../types';

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

  const updateInfoOffset = useCallback((nextOffset: FrameSettings['infoOffset']) => {
    setSettings(prev => ({...prev, infoOffset: nextOffset}));
  }, []);

  const resetInfoSettings = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showExif: DEFAULT_SETTINGS.showExif,
      textColor: DEFAULT_SETTINGS.textColor,
      infoLayout: DEFAULT_SETTINGS.infoLayout,
      infoPadding: DEFAULT_SETTINGS.infoPadding,
      infoGap: DEFAULT_SETTINGS.infoGap,
      infoOffset: {...DEFAULT_SETTINGS.infoOffset},
      line1Style: {...DEFAULT_SETTINGS.line1Style},
      line2Style: {...DEFAULT_SETTINGS.line2Style},
      customExif: {},
      selectedCameraPresetId: null,
    }));
  }, []);

  return {settings, updateSettings, updateInfoOffset, resetInfoSettings};
};
