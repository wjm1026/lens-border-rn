import {useCallback, useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';

import {useSaveToCameraRoll} from './useSaveToCameraRoll';
import type {ExportSettings} from '../types';

export const useExportWorkflow = (exportSettings: ExportSettings) => {
  const highResCaptureRef = useRef<View>(null);
  const previewCaptureRef = useRef<View>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMountingExport, setIsMountingExport] = useState(false);
  const {handleSave, isSaving} = useSaveToCameraRoll(
    highResCaptureRef,
    exportSettings,
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const requestExport = useCallback(() => {
    setIsMountingExport(true);
  }, []);

  const handleExportReady = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      await handleSave();
      setIsMountingExport(false);
    }, 50);
  }, [handleSave]);

  const isProcessing = isSaving || isMountingExport;

  return {
    previewCaptureRef,
    highResCaptureRef,
    isMountingExport,
    isProcessing,
    requestExport,
    handleExportReady,
  };
};
