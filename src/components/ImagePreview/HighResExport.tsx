import React, {useMemo} from 'react';
import {Dimensions, PixelRatio, StyleSheet, View} from 'react-native';

import {HIGH_RES_MAX_DIMENSION, PREVIEW_EXIF_PADDING, PREVIEW_INFO_BASE_BOTTOM} from '../../config';
import type {FrameSettings, CropRect} from '../../types';
import {useScaledSettings} from '../../hooks/useScaledSettings';
import {SharedPreview} from './SharedPreview';

interface HighResExportProps {
  imageUri: string;
  settings: FrameSettings;
  exportScale: number;
  previewAspectRatio: number;
  cropRect?: CropRect;
  cropRotation?: number;
  cropFlip?: {horizontal: boolean; vertical: boolean};
  captureRef: React.RefObject<View>;
  onReady?: () => void;
}

// 基础宽度，用于计算导出的逻辑分辨率
const BASE_WIDTH = Dimensions.get('window').width;

// iOS 纹理安全限制 (通常是 8192，留出余量设为 7200/6000)
// 对于 9:16 长图，4x 导出极易爆内存或超限

export const HighResExport = React.memo(
  ({
    imageUri,
    settings,
    exportScale,
    previewAspectRatio,
    cropRect,
    cropRotation,
    cropFlip,
    captureRef,
    onReady,
  }: HighResExportProps) => {
    // 0. 计算安全缩放倍数 (Safe Scale)
    const safeScale = useMemo(() => {
      const logicalWidth = BASE_WIDTH * exportScale;
      const logicalHeight = logicalWidth / previewAspectRatio;

      const pixelRatio = PixelRatio.get();
      const physicalWidth = logicalWidth * pixelRatio;
      const physicalHeight = logicalHeight * pixelRatio;

      const maxDim = Math.max(physicalWidth, physicalHeight);

      if (maxDim > HIGH_RES_MAX_DIMENSION) {
        // 如果超过限制，计算缩小比例
        // 比如想导出 8000px，限制 6000px -> scale 应该 * 0.75
        const ratio = HIGH_RES_MAX_DIMENSION / maxDim;
        const newScale = exportScale * ratio;
        return newScale;
      }
      return exportScale;
    }, [exportScale, previewAspectRatio]);

    // 1. 使用 Hook 获取缩放后的配置 (使用 safeScale)
    const scaledSettings = useScaledSettings(settings, safeScale);

    // 状态追踪：确保布局完成且图片加载完成
    const [isLayoutReady, setLayoutReady] = React.useState(false);
    const [isImageReady, setImageReady] = React.useState(false);

    // 2. 计算放大后的 Viewport 尺寸
    const viewportSize = useMemo(() => {
      // 保持长宽比，使用 safeScale 计算
      const totalWidth = BASE_WIDTH * safeScale;
      const contentWidth = Math.max(0, totalWidth - scaledSettings.padding * 2);
      const contentHeight = contentWidth / previewAspectRatio;

      return {
        width: contentWidth,
        height: contentHeight,
      };
    }, [safeScale, scaledSettings.padding, previewAspectRatio]);

    // 3. 计算缩放后的常量
    const extraExifPadding = PREVIEW_EXIF_PADDING * safeScale;
    const baseBottom = PREVIEW_INFO_BASE_BOTTOM * safeScale;

    // 4. 双重检查触发 onReady
    React.useEffect(() => {
      if (isLayoutReady && isImageReady && onReady) {
        // 使用 requestAnimationFrame 确保 UI 线程空闲，渲染已提交
        requestAnimationFrame(() => {
          onReady();
        });
      }
    }, [isLayoutReady, isImageReady, onReady]);

    const handleLayout = () => {
      setLayoutReady(true);
    };

    const handleImageLoad = () => {
      setImageReady(true);
    };

    return (
      <View
        style={styles.container}
        pointerEvents="none"
        onLayout={handleLayout} // 1. 监听容器布局
      >
        <View ref={captureRef} collapsable={false}>
          <SharedPreview
            imageUri={imageUri}
            settings={scaledSettings} // 传入放大后的配置
            viewportSize={viewportSize}
            framePadding={scaledSettings.padding} // 传入放大后的 padding
            cropRect={cropRect}
            cropRotation={cropRotation}
            cropFlip={cropFlip}
            // 导出时不处理 info 交互
            onInfoOffsetChange={undefined}
            exifPadding={extraExifPadding}
            infoBaseBottom={baseBottom}
            onImageLoad={handleImageLoad} // 2. 监听内部图片加载
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // 移出屏幕但保持可见性 (opacity 1) 以便截图
    left: Dimensions.get('window').width * 2,
    top: 0,
    opacity: 1,
    zIndex: -999,
  },
});
