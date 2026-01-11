/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:41
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-11 20:38:58
 * @FilePath: /lens-border-rn/src/screens/EditorScreen/EditorScreen.tsx
 * @Description: 照片编辑主屏幕
 */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronLeft, Trash2} from 'lucide-react-native';

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
  const [cropAspect, setCropAspect] = useState<CropAspectId>('free');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropFlip, setCropFlip] = useState({
    horizontal: false,
    vertical: false,
  });
  const [cropOffset, setCropOffset] = useState({x: 0, y: 0});
  const [cropRect, setCropRect] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [viewportSize, setViewportSize] = useState({width: 0, height: 0});
  const cropOffsetRef = useRef(cropOffset);
  const panStartRef = useRef({x: 0, y: 0});
  const cropRectRef = useRef(cropRect);
  const resizeStartRef = useRef(cropRect);
  const isResizingRef = useRef(false);
  const {width} = useWindowDimensions();
  const framePadding = Math.max(0, settings.padding);
  const [previewAreaSize, setPreviewAreaSize] = useState({width: 0, height: 0});
  const cropAspectRatio = useMemo(() => {
    switch (cropAspect) {
      case '1:1':
        return 1;
      case '4:3':
        return 4 / 3;
      case '3:4':
        return 3 / 4;
      case '16:9':
        return 16 / 9;
      case '9:16':
        return 9 / 16;
      case 'free':
      default:
        return undefined;
    }
  }, [cropAspect]);
  const isCropActive = activeTab === 'crop';
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

  const baseImageSize = useMemo(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return {width: 0, height: 0};
    }
    const viewRatio = viewportSize.width / viewportSize.height;
    if (imageAspectRatio > viewRatio) {
      return {
        width: viewportSize.height * imageAspectRatio,
        height: viewportSize.height,
      };
    }
    return {
      width: viewportSize.width,
      height: viewportSize.width / imageAspectRatio,
    };
  }, [imageAspectRatio, viewportSize.height, viewportSize.width]);

  const clampOffset = useCallback(
    (nextOffset: {x: number; y: number}) => {
      const displayWidth =
        isCropActive && cropRect.width > 0 ? cropRect.width : viewportSize.width;
      const displayHeight =
        isCropActive && cropRect.height > 0
          ? cropRect.height
          : viewportSize.height;
      if (displayWidth <= 0 || displayHeight <= 0) {
        return {x: 0, y: 0};
      }
      if (baseImageSize.width <= 0 || baseImageSize.height <= 0) {
        return {x: 0, y: 0};
      }
      const maxX = Math.max(
        0,
        (baseImageSize.width * cropZoom - displayWidth) / 2,
      );
      const maxY = Math.max(
        0,
        (baseImageSize.height * cropZoom - displayHeight) / 2,
      );
      return {
        x: Math.max(-maxX, Math.min(maxX, nextOffset.x)),
        y: Math.max(-maxY, Math.min(maxY, nextOffset.y)),
      };
    },
    [
      baseImageSize.height,
      baseImageSize.width,
      cropRect.height,
      cropRect.width,
      cropZoom,
      isCropActive,
      viewportSize.height,
      viewportSize.width,
    ],
  );

  useEffect(() => {
    cropOffsetRef.current = cropOffset;
  }, [cropOffset]);

  useEffect(() => {
    cropRectRef.current = cropRect;
  }, [cropRect]);

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

  useEffect(() => {
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }
    setCropOffset(prev => clampOffset(prev));
  }, [clampOffset, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    setCropOffset({x: 0, y: 0});
  }, [cropAspect, imageUri]);

  const updateSettings = useCallback(
    <K extends keyof FrameSettings>(key: K, value: FrameSettings[K]) => {
      setSettings(prev => ({...prev, [key]: value}));
    },
    [],
  );

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const {width: layoutWidth, height: layoutHeight} =
      event.nativeEvent.layout;
    if (layoutWidth > 0 && layoutHeight > 0) {
      setViewportSize({width: layoutWidth, height: layoutHeight});
    }
  }, []);
  const handlePreviewAreaLayout = useCallback((event: LayoutChangeEvent) => {
    const {width: layoutWidth, height: layoutHeight} =
      event.nativeEvent.layout;
    if (layoutWidth > 0 && layoutHeight > 0) {
      setPreviewAreaSize(prev =>
        prev.width === layoutWidth && prev.height === layoutHeight
          ? prev
          : {width: layoutWidth, height: layoutHeight},
      );
    }
  }, []);

  const handleRotateStep = useCallback((delta: number) => {
    setCropRotation(prev => {
      const next = (prev + delta) % 360;
      return next < 0 ? next + 360 : next;
    });
  }, []);

  const getCenteredCropRect = useCallback(
    (ratio?: number) => {
      const {width: viewportWidth, height: viewportHeight} = viewportSize;
      if (viewportWidth <= 0 || viewportHeight <= 0) {
        return {x: 0, y: 0, width: 0, height: 0};
      }
      if (!ratio) {
        return {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight,
        };
      }
      let width = viewportWidth;
      let height = width / ratio;
      if (height > viewportHeight) {
        height = viewportHeight;
        width = height * ratio;
      }
      return {
        x: (viewportWidth - width) / 2,
        y: (viewportHeight - height) / 2,
        width,
        height,
      };
    },
    [viewportSize],
  );

  const clampCropRect = useCallback(
    (
      rect: {x: number; y: number; width: number; height: number},
      ratio?: number,
    ) => {
      const minSize = 80;
      const {width: viewportWidth, height: viewportHeight} = viewportSize;
      if (viewportWidth <= 0 || viewportHeight <= 0) {
        return rect;
      }
      let {x, y, width, height} = rect;
      if (ratio) {
        width = Math.max(minSize, width);
        height = width / ratio;
        if (height < minSize) {
          height = minSize;
          width = height * ratio;
        }
        if (width > viewportWidth) {
          width = viewportWidth;
          height = width / ratio;
        }
        if (height > viewportHeight) {
          height = viewportHeight;
          width = height * ratio;
        }
      } else {
        width = Math.max(minSize, Math.min(width, viewportWidth));
        height = Math.max(minSize, Math.min(height, viewportHeight));
      }
      x = Math.max(0, Math.min(x, viewportWidth - width));
      y = Math.max(0, Math.min(y, viewportHeight - height));
      return {x, y, width, height};
    },
    [viewportSize],
  );

  const getResizedRect = useCallback(
    (
      handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
      dx: number,
      dy: number,
      startRect: {x: number; y: number; width: number; height: number},
    ) => {
      const ratio = cropAspectRatio;
      const isLeft = handle === 'topLeft' || handle === 'bottomLeft';
      const isRight = handle === 'topRight' || handle === 'bottomRight';
      const isTop = handle === 'topLeft' || handle === 'topRight';
      const isBottom = handle === 'bottomLeft' || handle === 'bottomRight';

      let {x, y, width, height} = startRect;

      if (!ratio) {
        if (isLeft) {
          x += dx;
          width -= dx;
        }
        if (isRight) {
          width += dx;
        }
        if (isTop) {
          y += dy;
          height -= dy;
        }
        if (isBottom) {
          height += dy;
        }
        return clampCropRect({x, y, width, height});
      }

      const deltaX = isLeft ? -dx : dx;
      const deltaY = isTop ? -dy : dy;
      const useX = Math.abs(deltaX) >= Math.abs(deltaY);
      let nextWidth = width;
      let nextHeight = height;
      if (useX) {
        nextWidth = width + deltaX;
        nextHeight = nextWidth / ratio;
      } else {
        nextHeight = height + deltaY;
        nextWidth = nextHeight * ratio;
      }
      if (isLeft) {
        x = x + (width - nextWidth);
      }
      if (isTop) {
        y = y + (height - nextHeight);
      }
      return clampCropRect({x, y, width: nextWidth, height: nextHeight}, ratio);
    },
    [clampCropRect, cropAspectRatio],
  );

  useEffect(() => {
    if (!isCropActive) {
      return;
    }
    if (viewportSize.width <= 0 || viewportSize.height <= 0) {
      return;
    }
    if (cropAspectRatio) {
      setCropRect(getCenteredCropRect(cropAspectRatio));
      return;
    }
    setCropRect(prev => {
      if (prev.width <= 0 || prev.height <= 0) {
        return getCenteredCropRect();
      }
      return clampCropRect(prev);
    });
  }, [
    clampCropRect,
    cropAspectRatio,
    getCenteredCropRect,
    imageUri,
    isCropActive,
    viewportSize.height,
    viewportSize.width,
  ]);

  const imagePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          isCropActive && !isResizingRef.current,
        onMoveShouldSetPanResponder: () =>
          isCropActive && !isResizingRef.current,
        onPanResponderGrant: () => {
          panStartRef.current = cropOffsetRef.current;
        },
        onPanResponderMove: (_evt, gestureState) => {
          const nextOffset = {
            x: panStartRef.current.x + gestureState.dx,
            y: panStartRef.current.y + gestureState.dy,
          };
          setCropOffset(clampOffset(nextOffset));
        },
      }),
    [clampOffset, isCropActive],
  );

  const resizeHandlers = useMemo(() => {
    const createResponder = (
      handle: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight',
    ) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isCropActive,
        onMoveShouldSetPanResponder: () => isCropActive,
        onPanResponderGrant: () => {
          isResizingRef.current = true;
          resizeStartRef.current = cropRectRef.current;
        },
        onPanResponderMove: (_evt, gestureState) => {
          const nextRect = getResizedRect(
            handle,
            gestureState.dx,
            gestureState.dy,
            resizeStartRef.current,
          );
          setCropRect(nextRect);
        },
        onPanResponderRelease: () => {
          isResizingRef.current = false;
        },
        onPanResponderTerminate: () => {
          isResizingRef.current = false;
        },
      });

    return {
      topLeft: createResponder('topLeft'),
      topRight: createResponder('topRight'),
      bottomLeft: createResponder('bottomLeft'),
      bottomRight: createResponder('bottomRight'),
    };
  }, [getResizedRect, isCropActive]);

  const imagePanHandlers = useMemo(
    () => (isCropActive ? imagePanResponder.panHandlers : {}),
    [imagePanResponder.panHandlers, isCropActive],
  );

  const imageTransform = useMemo(() => {
    const scaleX = cropZoom * (cropFlip.horizontal ? -1 : 1);
    const scaleY = cropZoom * (cropFlip.vertical ? -1 : 1);
    return {
      transform: [
        {scaleX},
        {scaleY},
        {rotate: `${cropRotation}deg`},
        {translateX: cropOffset.x},
        {translateY: cropOffset.y},
      ],
    };
  }, [cropFlip.horizontal, cropFlip.vertical, cropOffset, cropRotation, cropZoom]);
  const showCropOverlay =
    isCropActive && cropRect.width > 0 && cropRect.height > 0;
  const cropOutlineStyle =
    isCropActive && settings.borderWidth === 0
      ? styles.cropViewportActive
      : null;
  const handleHitSlop = {top: 12, bottom: 12, left: 12, right: 12};
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
      setIsPanelOpen(prevOpen =>
        activeTab === nextTab ? !prevOpen : true,
      );
      setActiveTab(nextTab);
    },
    [activeTab],
  );

  const renderSettingsPanel = () => {
    if (!isPanelOpen) {
      return null;
    }
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
          <BackgroundPanel settings={settings} updateSettings={updateSettings} />
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
          <ExportPanel settings={settings} updateSettings={updateSettings} />
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
        <Pressable
          style={styles.panelDismissOverlay}
          onPress={() => setIsPanelOpen(false)}
        />
        <FloatingPanel>{panelContent}</FloatingPanel>
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
          <View style={styles.imageFrame}>
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
              <View
                style={[styles.imageViewport, imageBorderStyle, cropOutlineStyle]}
                onLayout={handleViewportLayout}>
                <Image
                  source={{uri: imageUri}}
                  style={[styles.previewImage, imageTransform]}
                  resizeMode="cover"
                  {...imagePanHandlers}
                />
                {showCropOverlay && (
                  <>
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cropMask,
                        {left: 0, right: 0, top: 0, height: cropRect.y},
                      ]}
                    />
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cropMask,
                        {
                          left: 0,
                          top: cropRect.y,
                          width: cropRect.x,
                          height: cropRect.height,
                        },
                      ]}
                    />
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cropMask,
                        {
                          left: cropRect.x + cropRect.width,
                          right: 0,
                          top: cropRect.y,
                          height: cropRect.height,
                        },
                      ]}
                    />
                    <View
                      pointerEvents="none"
                      style={[
                        styles.cropMask,
                        {
                          left: 0,
                          right: 0,
                          top: cropRect.y + cropRect.height,
                          bottom: 0,
                        },
                      ]}
                    />
                    <View
                      pointerEvents="box-none"
                      style={[
                        styles.cropBox,
                        {
                          left: cropRect.x,
                          top: cropRect.y,
                          width: cropRect.width,
                          height: cropRect.height,
                        },
                      ]}>
                      <View
                        pointerEvents="none"
                        style={styles.cropBoxBorder}
                      />
                      <View
                        style={[styles.cropHandle, styles.cropHandleTopLeft]}
                        hitSlop={handleHitSlop}
                        {...resizeHandlers.topLeft.panHandlers}
                      />
                      <View
                        style={[styles.cropHandle, styles.cropHandleTopRight]}
                        hitSlop={handleHitSlop}
                        {...resizeHandlers.topRight.panHandlers}
                      />
                      <View
                        style={[styles.cropHandle, styles.cropHandleBottomLeft]}
                        hitSlop={handleHitSlop}
                        {...resizeHandlers.bottomLeft.panHandlers}
                      />
                      <View
                        style={[styles.cropHandle, styles.cropHandleBottomRight]}
                        hitSlop={handleHitSlop}
                        {...resizeHandlers.bottomRight.panHandlers}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
            <InfoOverlay
              settings={settings}
              framePadding={framePadding}
              onOffsetChange={updateInfoOffset}
            />
          </View>
        </View>

        {renderSettingsPanel()}
      </SafeAreaView>

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}
