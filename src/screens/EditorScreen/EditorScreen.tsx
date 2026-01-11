/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:41
 * @Description: 照片编辑主屏幕
 */
import React, {useCallback, useMemo, useRef, useState} from 'react';
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
import {
  DEFAULT_SETTINGS,
  type FrameSettings,
  type CropAspectId,
} from '../../types';
import {useCropControls} from '../../hooks/useCropControls';
import {useImageAspectRatio} from '../../hooks/useImageAspectRatio';
import {
  useSaveToCameraRoll,
  type ExportSettings,
} from '../../hooks/useSaveToCameraRoll';
import EditorSettingsPanel from './EditorSettingsPanel';
import {styles} from './styles';

interface EditorScreenProps {
  imageUri: string;
  onReset: () => void;
}

const getAspectRatioNumber = (id: CropAspectId): number | undefined => {
  if (id === 'free') {
    return undefined;
  }
  const parts = id.split(':');
  if (parts.length === 2) {
    return Number(parts[0]) / Number(parts[1]);
  }
  return undefined;
};

export default function EditorScreen({imageUri, onReset}: EditorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [settings, setSettings] = useState<FrameSettings>(DEFAULT_SETTINGS);
  const imageAspectRatio = useImageAspectRatio(imageUri);
  const cropControls = useCropControls(imageUri);

  // 使用新的高分辨率导出 ref
  const highResCaptureRef = useRef<View>(null);
  // 仅用于预览的 dummy ref，避免 hook 规则错误
  const previewCaptureRef = useRef(null);

  // 导出设置
  const exportSettings: ExportSettings = useMemo(
    () => ({
      format: settings.exportFormat === 'jpeg' ? 'jpg' : 'png',
      quality: settings.exportQuality,
      scale: settings.exportScale,
    }),
    [settings.exportFormat, settings.exportQuality, settings.exportScale],
  );

  // 核心 hook，用于执行截图
  const {handleSave: executeSave, isSaving} = useSaveToCameraRoll(
    highResCaptureRef,
    exportSettings,
  );

  // 控制导出组件的按需挂载
  const [isMountingExport, setIsMountingExport] = useState(false);

  // 1. 用户点击保存 -> 开始挂载隐藏的高清组件
  const handleUserSave = useCallback(() => {
    setIsMountingExport(true);
  }, []);

  // 2. 高清组件布局完成 -> 执行截图 -> 卸载组件
  const handleExportReady = useCallback(async () => {
    // 稍微延迟一帧以确保渲染完全提交（保险起见）
    setTimeout(async () => {
      await executeSave();
      setIsMountingExport(false);
    }, 50);
  }, [executeSave]);

  // 组合加载状态
  const isProcessing = isSaving || isMountingExport;

  const framePadding = Math.max(0, settings.padding);

  const effectiveImageAspectRatio = useMemo(() => {
    if (!imageAspectRatio) {
      return 1;
    }
    const isRotated = cropControls.cropRotation % 180 !== 0;
    const contentRatio = isRotated ? 1 / imageAspectRatio : imageAspectRatio;
    return (
      (cropControls.cropRect.width / cropControls.cropRect.height) *
      contentRatio
    );
  }, [imageAspectRatio, cropControls.cropRotation, cropControls.cropRect]);

  const previewAspectRatio = useMemo(() => {
    switch (settings.aspectRatio) {
      case 'square':
        return 1;
      case 'portrait':
        return 3 / 4;
      case 'landscape':
        return 4 / 3;
      case 'original':
      default:
        return effectiveImageAspectRatio;
    }
  }, [effectiveImageAspectRatio, settings.aspectRatio]);

  const updateSettings = useCallback(
    <K extends keyof FrameSettings>(key: K, value: FrameSettings[K]) => {
      setSettings(prev => ({...prev, [key]: value}));
    },
    [],
  );

  const updateInfoOffset = useCallback((nextOffset: {x: number; y: number}) => {
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
      infoOffset: DEFAULT_SETTINGS.infoOffset,
      line1Style: DEFAULT_SETTINGS.line1Style,
      line2Style: DEFAULT_SETTINGS.line2Style,
      customExif: {},
      selectedCameraPresetId: null,
    }));
  }, []);

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

        <View style={{flex: 1, width: '100%'}}>
          {activeTab === 'crop' ? (
            <Cropper
              imageUri={imageUri}
              cropRect={cropControls.cropRect}
              onCropChange={cropControls.setCropRect}
              rotation={cropControls.cropRotation}
              zoom={cropControls.cropZoom}
              flip={cropControls.cropFlip}
              aspectRatio={getAspectRatioNumber(cropControls.cropAspect)}
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
          onSave={handleUserSave} // 绑定新的处理函数
          isSaving={isProcessing} // 使用组合状态
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
