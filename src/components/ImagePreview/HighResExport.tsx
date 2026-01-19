import React, {useMemo} from 'react';
import {Dimensions, PixelRatio, StyleSheet, View} from 'react-native';

import {
  HIGH_RES_MAX_DIMENSION,
} from '../../config';
import type {CropFlip, CropRect, FrameSettings} from '../../types';
import {useScaledSettings} from '../../hooks/useScaledSettings';
import {SharedPreview} from './SharedPreview';

interface HighResExportProps {
  imageUri: string;
  settings: FrameSettings;
  exportScale: number;
  previewAspectRatio: number;
  cropRect?: CropRect;
  cropRotation?: number;
  cropFlip?: CropFlip;
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
    // 0. 计算安全缩放倍数 (恢复为相对于逻辑像素的倍数，确保比例一致)
    const safeScale = useMemo(() => {
      const logicalWidth = BASE_WIDTH * exportScale;
      const logicalHeight = logicalWidth / previewAspectRatio;

      const pixelRatio = PixelRatio.get();
      const physicalWidth = logicalWidth * pixelRatio;
      const physicalHeight = logicalHeight * pixelRatio;

      const maxDim = Math.max(physicalWidth, physicalHeight);

      if (maxDim > HIGH_RES_MAX_DIMENSION) {
        // 如果超过物理极限（如 7200px），按比例缩减 exportScale
        const ratio = HIGH_RES_MAX_DIMENSION / maxDim;
        return exportScale * ratio;
      }
      return exportScale;
    }, [exportScale, previewAspectRatio]);

    // 1. 获取缩放后的配置 (缩放比例必须与容器一致)
    const scaledSettings = useScaledSettings(settings, safeScale);

    // 状态追踪：确保布局完成、主图就绪、背景就绪
    const [isLayoutReady, setLayoutReady] = React.useState(false);
    const [isImageReady, setImageReady] = React.useState(false);
    const [isBgReady, setBgReady] = React.useState(
      settings.backgroundType !== 'blur',
    );

    // 2. 计算容器尺寸 (使用 settings 原始 padding 乘以 safeScale 以获得精准导出比例)
    const viewportSize = useMemo(() => {
      const totalWidth = BASE_WIDTH * safeScale;
      const contentWidth = Math.max(
        0,
        totalWidth - settings.padding * safeScale * 2,
      );
      const contentHeight = contentWidth / previewAspectRatio;

      return {
        width: contentWidth,
        height: contentHeight,
      };
    }, [safeScale, settings.padding, previewAspectRatio]);

    // 4. 三重检查触发 onReady
    React.useEffect(() => {
      if (isLayoutReady && isImageReady && isBgReady && onReady) {
        // 给布局引擎额外的一些渲染时间
        const timer = setTimeout(() => {
          onReady();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [isLayoutReady, isImageReady, isBgReady, onReady]);

    const handleLayout = () => {
      setLayoutReady(true);
    };

    const handleImageLoad = () => {
      setImageReady(true);
    };

    const handleBgLoad = () => {
      setBgReady(true);
    };

    return (
      <View
        style={styles.container}
        pointerEvents="none"
        onLayout={handleLayout}>
        <View ref={captureRef} collapsable={false}>
          <SharedPreview
            imageUri={imageUri}
            settings={scaledSettings}
            viewportSize={viewportSize}
            framePadding={scaledSettings.padding}
            cropRect={cropRect}
            cropRotation={cropRotation}
            cropFlip={cropFlip}
            onImageLoad={handleImageLoad}
            onBgLoad={handleBgLoad}
            disableBackgroundAnimation={true}
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
