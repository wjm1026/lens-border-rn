import React, {useCallback} from 'react';
import {StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  BottomTabs,
  EditorHeader,
  ImagePreview,
  HighResExport,
  Cropper,
} from '../../components';
import {colors} from '../../theme';
import {useCropControls} from '../../hooks/useCropControls';
import {useEditorPanelState} from '../../hooks/useEditorPanelState';
import {useExportSettings} from '../../hooks/useExportSettings';
import {useImageAspectRatio} from '../../hooks/useImageAspectRatio';
import {useExportWorkflow} from '../../hooks/useExportWorkflow';
import {useFrameSettings} from '../../hooks/useFrameSettings';
import {useInitialFrameSettings} from '../../hooks/useInitialFrameSettings';
import {usePreviewAspectRatio} from '../../hooks/usePreviewAspectRatio';
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
  const {activeTab, isPanelOpen, handleTabChange, closePanel} =
    useEditorPanelState();

  const initialSettings = useInitialFrameSettings(initialExif);

  const {
    settings,
    updateSettings,
    patchSettings,
    updateInfoOffset,
    resetInfoSettings,
  } = useFrameSettings(initialSettings);
  const imageAspectRatio = useImageAspectRatio(imageUri);
  const cropControls = useCropControls(imageUri);

  // 导出设置
  const exportSettings = useExportSettings(settings);

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
    layoutAspectRatio: settings.aspectRatio,
  });

  const handleCustomExifChange = useCallback(
    (key: keyof typeof settings.customExif, value: string) => {
      updateSettings('customExif', {...settings.customExif, [key]: value});
    },
    [settings, updateSettings],
  );

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
              onCustomExifChange={handleCustomExifChange}
              cropRect={cropControls.cropRect}
              cropRotation={cropControls.cropRotation}
              cropFlip={cropControls.cropFlip}
            />
          )}
        </View>

        <EditorSettingsPanel
          activeTab={activeTab}
          isOpen={isPanelOpen}
          onClose={closePanel}
          settings={settings}
          updateSettings={updateSettings}
          patchSettings={patchSettings}
          cropControls={cropControls}
          onResetInfo={resetInfoSettings}
          onSave={requestExport}
          isSaving={isProcessing}
          initialExif={initialExif}
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
