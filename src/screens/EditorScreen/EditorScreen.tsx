/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:41
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 00:33:39
 * @FilePath: /lens-border-rn/src/screens/EditorScreen/EditorScreen.tsx
 * @Description: 照片编辑主屏幕
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Image,
  LayoutChangeEvent,
  Linking,
  PanResponder,
  Pressable,
  PermissionsAndroid,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronLeft, Trash2} from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

import {
  BottomTabs,
  CropPanel,
  BorderPanel,
  BackgroundPanel,
  BackgroundLayer,
  InfoPanel,
  ExportPanel,
  InfoOverlay,
  FloatingPanel,
  LayoutPanel,
  type CropAspectId,
  type TabId,
} from '../../components';
import {colors} from '../../theme';
import {DEFAULT_SETTINGS, type FrameSettings} from '../../types';
import {createStyles, EXIF_PADDING_EXTRA} from './styles';

interface EditorScreenProps {
  imageUri: string;
  onReset: () => void;
}

export default function EditorScreen({imageUri, onReset}: EditorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [settings, setSettings] = useState<FrameSettings>(DEFAULT_SETTINGS);
  const [imageAspectRatio, setImageAspectRatio] = useState(3 / 2);

  // 裁切相关状态（只保留UI状态，暂无功能实现）
  const [cropAspect, setCropAspect] = useState<CropAspectId>('free');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropFlip, setCropFlip] = useState({
    horizontal: false,
    vertical: false,
  });

  const viewShotRef = useRef<ViewShot | null>(null);
  const {width} = useWindowDimensions();
  const framePadding = Math.max(0, settings.padding);
  const [previewAreaSize, setPreviewAreaSize] = useState({width: 0, height: 0});

  // 最小缩放值
  const minZoom = 1;

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
        return imageAspectRatio;
    }
  }, [imageAspectRatio, settings.aspectRatio]);

  const styles = useMemo(
    () => createStyles(framePadding, settings.showExif),
    [framePadding, settings.showExif],
  );

  const previewViewportSize = useMemo(() => {
    const baseWidth = previewAreaSize.width || width;
    const baseHeight = previewAreaSize.height || 0;
    const exifPadding = settings.showExif ? EXIF_PADDING_EXTRA : 0;
    const maxWidth = Math.max(0, baseWidth - framePadding * 2);
    const maxHeight = Math.max(0, baseHeight - framePadding * 2 - exifPadding);
    if (maxWidth === 0 || maxHeight === 0) {
      return {width: 0, height: 0};
    }
    const availableRatio = maxWidth / maxHeight;
    if (previewAspectRatio >= availableRatio) {
      return {width: maxWidth, height: maxWidth / previewAspectRatio};
    }
    return {width: maxHeight * previewAspectRatio, height: maxHeight};
  }, [
    framePadding,
    previewAreaSize.height,
    previewAreaSize.width,
    previewAspectRatio,
    settings.showExif,
    width,
  ]);

  const imageShadowStyle = useMemo(() => {
    const shadowSize = Math.max(0, settings.shadowSize);
    const shadowOpacity = shadowSize > 0 ? settings.shadowOpacity : 0;
    return {
      borderRadius: Math.max(0, settings.borderRadius),
      shadowColor: colors.black,
      shadowOffset: {width: 0, height: shadowSize * 0.6},
      shadowOpacity,
      shadowRadius: shadowSize,
      elevation: shadowSize > 0 ? Math.round(shadowSize) : 0,
    };
  }, [settings.borderRadius, settings.shadowOpacity, settings.shadowSize]);

  const imageBorderStyle = useMemo(
    () => ({
      borderRadius: Math.max(0, settings.borderRadius),
      borderWidth: Math.max(0, settings.borderWidth),
      borderColor: settings.borderColor,
    }),
    [settings.borderColor, settings.borderRadius, settings.borderWidth],
  );

  const captureOptions = useMemo(() => {
    const format = (settings.exportFormat === 'jpeg' ? 'jpg' : 'png') as
      | 'jpg'
      | 'png';
    const quality =
      settings.exportFormat === 'jpeg' ? settings.exportQuality : 1;
    return {format, quality, result: 'tmpfile' as const};
  }, [settings.exportFormat, settings.exportQuality]);

  // 获取图片比例
  useEffect(() => {
    let isActive = true;
    Image.getSize(
      imageUri,
      (imgWidth, imgHeight) => {
        if (!isActive) {
          return;
        }
        if (imgWidth > 0 && imgHeight > 0) {
          setImageAspectRatio(imgWidth / imgHeight);
        }
      },
      () => {
        if (isActive) {
          setImageAspectRatio(3 / 2);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [imageUri]);

  // 重置裁切状态
  useEffect(() => {
    setCropZoom(1);
    setCropRotation(0);
    setCropFlip({horizontal: false, vertical: false});
    setCropAspect('free');
  }, [imageUri]);

  const updateSettings = useCallback(
    <K extends keyof FrameSettings>(key: K, value: FrameSettings[K]) => {
      setSettings(prev => ({...prev, [key]: value}));
    },
    [],
  );

  const handlePreviewAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const {width: layoutWidth, height: layoutHeight} = event.nativeEvent.layout;
    if (layoutWidth > 0 && layoutHeight > 0) {
      setPreviewAreaSize(prev =>
        prev.width === layoutWidth && prev.height === layoutHeight
          ? prev
          : {width: layoutWidth, height: layoutHeight},
      );
    }
  }, []);

  // 裁切面板回调（暂时只更新UI状态，无实际功能）
  const handleRotateStep = useCallback((delta: number) => {
    setCropRotation(prev => {
      const next = (prev + delta) % 360;
      return next < 0 ? next + 360 : next;
    });
  }, []);

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

  const requestAndroidSavePermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }
    if (Platform.Version >= 29) {
      return true;
    }
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission, {
      title: '存储权限',
      message: '需要存储权限以保存图片到相册。',
      buttonPositive: '允许',
      buttonNegative: '取消',
    });
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const handleSave = useCallback(async () => {
    const hasPermission = await requestAndroidSavePermission();
    if (!hasPermission) {
      Alert.alert('保存失败', '没有存储权限，无法保存到相册。');
      return;
    }
    if (!viewShotRef.current) {
      Alert.alert('保存失败', '未能获取预览内容。');
      return;
    }
    try {
      if (!viewShotRef.current?.capture) {
        Alert.alert('保存失败', '截图功能不可用，请重试。');
        return;
      }
      const uri = await viewShotRef.current.capture();
      if (!uri) {
        Alert.alert('保存失败', '生成图片失败，请重试。');
        return;
      }
      const normalizedUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      await CameraRoll.saveAsset(normalizedUri, {type: 'photo'});
      Alert.alert('已保存', '图片已保存到相册。');
    } catch (error) {
      const err = error as {code?: string; message?: string};
      const message =
        typeof err?.message === 'string' && err.message.length > 0
          ? err.message
          : '保存过程中出错，请稍后重试。';
      if (
        err?.code === 'E_PHOTO_LIBRARY_AUTH_DENIED' ||
        err?.code === 'E_PHOTO_LIBRARY_AUTH_RESTRICTED'
      ) {
        Alert.alert('保存失败', '相册权限被拒绝，请在系统设置中开启。', [
          {text: '取消', style: 'cancel'},
          {text: '去设置', onPress: () => Linking.openSettings()},
        ]);
        return;
      }
      Alert.alert('保存失败', message);
    }
  }, [requestAndroidSavePermission]);

  const handleTabChange = useCallback(
    (nextTab: TabId) => {
      setIsPanelOpen(prevOpen => (activeTab === nextTab ? !prevOpen : true));
      setActiveTab(nextTab);
    },
    [activeTab],
  );

  const renderSettingsPanel = () => {
    let panelContent: React.ReactNode = null;
    switch (activeTab) {
      case 'layout':
        panelContent = (
          <LayoutPanel settings={settings} updateSettings={updateSettings} />
        );
        break;
      case 'crop':
        panelContent = (
          <CropPanel
            aspectId={cropAspect}
            onAspectChange={setCropAspect}
            zoom={cropZoom}
            minZoom={minZoom}
            onZoomChange={setCropZoom}
            rotation={cropRotation}
            onRotationChange={setCropRotation}
            onRotateStep={handleRotateStep}
            flip={cropFlip}
            onFlipChange={setCropFlip}
          />
        );
        break;
      case 'border':
        panelContent = (
          <BorderPanel settings={settings} updateSettings={updateSettings} />
        );
        break;
      case 'bg':
        panelContent = (
          <BackgroundPanel
            settings={settings}
            updateSettings={updateSettings}
          />
        );
        break;
      case 'info':
        panelContent = (
          <InfoPanel
            settings={settings}
            updateSettings={updateSettings}
            onReset={resetInfoSettings}
          />
        );
        break;
      case 'export':
        panelContent = (
          <ExportPanel
            settings={settings}
            updateSettings={updateSettings}
            onSave={handleSave}
          />
        );
        break;
      default:
        panelContent = null;
    }
    if (!panelContent) {
      return null;
    }
    return (
      <>
        {isPanelOpen && (
          <Pressable
            style={styles.panelDismissOverlay}
            onPress={() => setIsPanelOpen(false)}
          />
        )}
        <FloatingPanel visible={isPanelOpen} contentKey={activeTab}>
          {panelContent}
        </FloatingPanel>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onReset} style={styles.iconButton}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>编辑照片</Text>
          <TouchableOpacity onPress={onReset} style={styles.iconButton}>
            <Trash2 color={colors.danger} size={20} />
          </TouchableOpacity>
        </View>

        {/* Image Preview Container */}
        <View style={styles.previewArea} onLayout={handlePreviewAreaLayout}>
          <ViewShot
            ref={viewShotRef}
            style={styles.imageFrame}
            options={captureOptions}>
            <BackgroundLayer settings={settings} imageUri={imageUri} />
            <View
              style={[
                styles.imageViewportOuter,
                imageShadowStyle,
                {
                  width: previewViewportSize.width,
                  height: previewViewportSize.height,
                },
              ]}>
              <View style={[styles.imageViewport, imageBorderStyle]}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            </View>
            <InfoOverlay
              settings={settings}
              framePadding={framePadding}
              onOffsetChange={updateInfoOffset}
            />
          </ViewShot>
        </View>

        {renderSettingsPanel()}
      </SafeAreaView>

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
