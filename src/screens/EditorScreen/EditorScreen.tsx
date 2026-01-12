/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:41
 * @Description: 照片编辑主屏幕
 */
import React, {useCallback, useMemo, useState} from 'react';
import {StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  BottomTabs,
  EditorHeader,
  ImagePreview,
  HighResExport,
  Cropper,
  type TabId,
} from '../../components';
import {colors} from '../../theme';
import {useCropControls} from '../../hooks/useCropControls';
import {useImageAspectRatio} from '../../hooks/useImageAspectRatio';
import {useExportWorkflow} from '../../hooks/useExportWorkflow';
import {useFrameSettings} from '../../hooks/useFrameSettings';
import {useInitialFrameSettings} from '../../hooks/useInitialFrameSettings';
import {usePreviewAspectRatio} from '../../hooks/usePreviewAspectRatio';
import type {ExportSettings} from '../../hooks/useSaveToCameraRoll';
import EditorSettingsPanel from './EditorSettingsPanel';
import {styles} from './styles';
import type {ParsedExifData} from '../../types';

interface EditorScreenProps {
  imageUri: string;
  initialExif?: ParsedExifData;
  onReset: () => void;
}

export default function EditorScreen({
  imageUri,
  initialExif,
  onReset,
}: EditorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const initialSettings = useInitialFrameSettings(initialExif);

  const {settings, updateSettings, updateInfoOffset, resetInfoSettings} =
    useFrameSettings(initialSettings);
  const imageAspectRatio = useImageAspectRatio(imageUri);
  const cropControls = useCropControls(imageUri);

  // 导出设置
  const exportSettings: ExportSettings = useMemo(
    () => ({
      format: settings.exportFormat === 'jpeg' ? 'jpg' : 'png',
      quality: settings.exportQuality,
      scale: settings.exportScale,
    }),
    [settings.exportFormat, settings.exportQuality, settings.exportScale],
  );

  const {
    previewCaptureRef,
    highResCaptureRef,
    isMountingExport,
    isProcessing,
    requestExport,
    handleExportReady,
  } = useExportWorkflow(exportSettings);

  const framePadding = Math.max(0, settings.padding);
  const {previewAspectRatio} = usePreviewAspectRatio({
    imageAspectRatio,
    cropRect: cropControls.cropRect,
    cropRotation: cropControls.cropRotation,
    layoutAspectRatio: settings.aspectRatio,
  });

  const handleTabChange = useCallback(
    (nextTab: TabId) => {
      setIsPanelOpen(prevOpen => (activeTab === nextTab ? !prevOpen : true));
      setActiveTab(nextTab);
    },
    [activeTab],
  );

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.content} edges={['top']}>
        <EditorHeader onBack={onReset} onDelete={onReset} />

        <View style={styles.previewContainer}>
          {activeTab === 'crop' ? (
            <Cropper
              imageUri={imageUri}
              initialCropRect={cropControls.cropRect}
              onCropChange={cropControls.setCropRect}
              rotation={cropControls.cropRotation}
              onRotationChange={cropControls.setCropRotation}
              zoom={cropControls.cropZoom}
              onZoomChange={cropControls.setCropZoom}
              flip={cropControls.cropFlip}
              aspectRatio={cropControls.cropAspectRatio}
            />
          ) : (
            <ImagePreview
              imageUri={imageUri}
              settings={settings}
              previewAspectRatio={previewAspectRatio}
              framePadding={framePadding}
              captureRef={previewCaptureRef}
              onInfoOffsetChange={updateInfoOffset}
              cropRect={cropControls.cropRect}
              cropRotation={cropControls.cropRotation}
              cropFlip={cropControls.cropFlip}
            />
          )}
        </View>

        <EditorSettingsPanel
          activeTab={activeTab}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          settings={settings}
          updateSettings={updateSettings}
          cropControls={cropControls}
          onResetInfo={resetInfoSettings}
          onSave={requestExport}
          isSaving={isProcessing}
        />
      </SafeAreaView>

      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 按需渲染：平时不挂载，点击保存才挂载，用完即焚 */}
      {isMountingExport && (
        <HighResExport
          imageUri={imageUri}
          settings={settings}
          exportScale={settings.exportScale}
          previewAspectRatio={previewAspectRatio}
          cropRect={cropControls.cropRect}
          cropRotation={cropControls.cropRotation}
          cropFlip={cropControls.cropFlip}
          captureRef={highResCaptureRef}
          onReady={handleExportReady}
        />
      )}
    </View>
  );
}
