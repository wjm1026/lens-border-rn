/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-12 01:25:00
 * @Description: 裁切组件 - 支持双指缩放、拖动图片、拖动角落调整裁切框
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, PanResponder, StyleSheet, View} from 'react-native';

import type {CropRect} from '../../types';

interface CropperProps {
  imageUri: string;
  onCropChange: (rect: CropRect) => void;
  aspectRatio?: number; // undefined means free
  rotation: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  flip: {horizontal: boolean; vertical: boolean};
}

const EDGE_PADDING = 20;
const CORNER_LENGTH = 20;
const CORNER_THICKNESS = 3;
const HANDLE_SIZE = 44;
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const MIN_CROP_SIZE = 60;

export const Cropper: React.FC<CropperProps> = ({
  imageUri,
  onCropChange,
  aspectRatio,
  rotation,
  zoom,
  onZoomChange,
  flip,
}) => {
  const [containerSize, setContainerSize] = useState({width: 0, height: 0});
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });

  // 图片偏移量（相对于中心点）
  const [imageOffset, setImageOffset] = useState({x: 0, y: 0});

  // 自由比例模式下的裁切框尺寸
  const [freeCropSize, setFreeCropSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const prevAspectRatioRef = useRef(aspectRatio);
  const isInitializedRef = useRef(false);

  // 加载图片原始尺寸
  useEffect(() => {
    let isActive = true;
    isInitializedRef.current = false;
    setFreeCropSize(null);
    Image.getSize(
      imageUri,
      (width, height) => {
        if (isActive) {
          setImageNaturalSize({width, height});
          setImageOffset({x: 0, y: 0});
        }
      },
      () => {},
    );
    return () => {
      isActive = false;
    };
  }, [imageUri]);

  // 计算旋转后的视觉尺寸
  const isRotated90or270 = rotation % 180 !== 0;
  const visualImageW = isRotated90or270
    ? imageNaturalSize.height
    : imageNaturalSize.width;
  const visualImageH = isRotated90or270
    ? imageNaturalSize.width
    : imageNaturalSize.height;

  // 计算适应容器的基础尺寸
  const baseFitSize = useMemo(() => {
    if (
      containerSize.width === 0 ||
      containerSize.height === 0 ||
      visualImageW === 0 ||
      visualImageH === 0
    ) {
      return {width: 0, height: 0};
    }

    const availableW = containerSize.width - EDGE_PADDING * 2;
    const availableH = containerSize.height - EDGE_PADDING * 2;
    const imageRatio = visualImageW / visualImageH;
    const containerRatio = availableW / availableH;

    let width, height;
    if (imageRatio > containerRatio) {
      width = availableW;
      height = availableW / imageRatio;
    } else {
      height = availableH;
      width = availableH * imageRatio;
    }

    return {width, height};
  }, [containerSize, visualImageW, visualImageH]);

  // 裁切框尺寸
  const cropBoxSize = useMemo(() => {
    if (baseFitSize.width === 0 || baseFitSize.height === 0) {
      return {width: 0, height: 0};
    }

    // 自由比例模式且有自定义尺寸
    if (aspectRatio === undefined && freeCropSize) {
      return freeCropSize;
    }

    if (aspectRatio === undefined) {
      // 自由比例默认全选
      return {
        width: baseFitSize.width,
        height: baseFitSize.height,
      };
    }

    // 固定比例
    const boxRatio = baseFitSize.width / baseFitSize.height;
    if (aspectRatio > boxRatio) {
      return {
        width: baseFitSize.width,
        height: baseFitSize.width / aspectRatio,
      };
    } else {
      return {
        width: baseFitSize.height * aspectRatio,
        height: baseFitSize.height,
      };
    }
  }, [baseFitSize, aspectRatio, freeCropSize]);

  // 图片显示尺寸（应用 zoom）
  const imageDisplaySize = useMemo(
    () => ({
      width: baseFitSize.width * zoom,
      height: baseFitSize.height * zoom,
    }),
    [baseFitSize, zoom],
  );

  // 限制图片偏移量，确保裁切框始终在图片内
  const clampImageOffset = useCallback(
    (
      ox: number,
      oy: number,
      currentZoom: number,
      currentCropSize: {width: number; height: number},
    ) => {
      const imgW = baseFitSize.width * currentZoom;
      const imgH = baseFitSize.height * currentZoom;

      const maxOffsetX = Math.max(0, (imgW - currentCropSize.width) / 2);
      const maxOffsetY = Math.max(0, (imgH - currentCropSize.height) / 2);

      return {
        x: Math.max(-maxOffsetX, Math.min(maxOffsetX, ox)),
        y: Math.max(-maxOffsetY, Math.min(maxOffsetY, oy)),
      };
    },
    [baseFitSize],
  );

  // 计算 cropRect
  const calculateCropRect = useCallback(
    (
      offset: {x: number; y: number},
      currentZoom: number,
      currentCropSize: {width: number; height: number},
    ): CropRect => {
      const imgW = baseFitSize.width * currentZoom;
      const imgH = baseFitSize.height * currentZoom;

      if (imgW === 0 || imgH === 0) {
        return {x: 0, y: 0, width: 1, height: 1};
      }

      const cropCenterX = -offset.x;
      const cropCenterY = -offset.y;

      const normCenterX = 0.5 + cropCenterX / imgW;
      const normCenterY = 0.5 + cropCenterY / imgH;
      const normW = currentCropSize.width / imgW;
      const normH = currentCropSize.height / imgH;

      return {
        x: Math.max(0, Math.min(1 - normW, normCenterX - normW / 2)),
        y: Math.max(0, Math.min(1 - normH, normCenterY - normH / 2)),
        width: Math.min(1, normW),
        height: Math.min(1, normH),
      };
    },
    [baseFitSize],
  );

  // 处理 aspectRatio 变化
  useEffect(() => {
    if (aspectRatio !== prevAspectRatioRef.current && baseFitSize.width > 0) {
      setImageOffset({x: 0, y: 0});
      setFreeCropSize(null); // 重置自定义尺寸

      // 计算新的裁切框尺寸
      let newCropSize;
      if (aspectRatio === undefined) {
        newCropSize = baseFitSize;
      } else {
        const boxRatio = baseFitSize.width / baseFitSize.height;
        if (aspectRatio > boxRatio) {
          newCropSize = {
            width: baseFitSize.width,
            height: baseFitSize.width / aspectRatio,
          };
        } else {
          newCropSize = {
            width: baseFitSize.height * aspectRatio,
            height: baseFitSize.height,
          };
        }
      }

      const newCropRect = calculateCropRect({x: 0, y: 0}, zoom, newCropSize);
      onCropChange(newCropRect);
    }
    prevAspectRatioRef.current = aspectRatio;
  }, [aspectRatio, baseFitSize, calculateCropRect, onCropChange, zoom]);

  // 初始化
  useEffect(() => {
    if (
      baseFitSize.width > 0 &&
      baseFitSize.height > 0 &&
      !isInitializedRef.current
    ) {
      isInitializedRef.current = true;
      const newCropRect = calculateCropRect({x: 0, y: 0}, zoom, cropBoxSize);
      onCropChange(newCropRect);
    }
  }, [baseFitSize, calculateCropRect, cropBoxSize, onCropChange, zoom]);

  // 手势状态
  const gestureRef = useRef({
    startOffset: {x: 0, y: 0},
    startZoom: 1,
    startDistance: 0,
    isPinching: false,
    startCropSize: {width: 0, height: 0},
  });

  const stateRef = useRef({zoom, imageOffset, cropBoxSize});
  useEffect(() => {
    stateRef.current = {zoom, imageOffset, cropBoxSize};
  }, [zoom, imageOffset, cropBoxSize]);

  // 图片拖动和双指缩放手势
  const imageGestureResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const touches = evt.nativeEvent.touches;
          gestureRef.current.startOffset = {...stateRef.current.imageOffset};
          gestureRef.current.startZoom = stateRef.current.zoom;

          if (touches.length === 2) {
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            gestureRef.current.startDistance = Math.sqrt(dx * dx + dy * dy);
            gestureRef.current.isPinching = true;
          } else {
            gestureRef.current.isPinching = false;
            gestureRef.current.startDistance = 0;
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;
          const currentCropSize = stateRef.current.cropBoxSize;

          if (touches.length === 2 && gestureRef.current.startDistance > 0) {
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const scale = distance / gestureRef.current.startDistance;
            const newZoom = Math.max(
              MIN_ZOOM,
              Math.min(MAX_ZOOM, gestureRef.current.startZoom * scale),
            );
            onZoomChange(newZoom);

            const clamped = clampImageOffset(
              gestureRef.current.startOffset.x,
              gestureRef.current.startOffset.y,
              newZoom,
              currentCropSize,
            );
            setImageOffset(clamped);
            gestureRef.current.isPinching = true;
          } else if (!gestureRef.current.isPinching && touches.length === 1) {
            const newOffset = {
              x: gestureRef.current.startOffset.x + gestureState.dx,
              y: gestureRef.current.startOffset.y + gestureState.dy,
            };
            const clamped = clampImageOffset(
              newOffset.x,
              newOffset.y,
              stateRef.current.zoom,
              currentCropSize,
            );
            setImageOffset(clamped);
          }
        },
        onPanResponderRelease: () => {
          const newCropRect = calculateCropRect(
            stateRef.current.imageOffset,
            stateRef.current.zoom,
            stateRef.current.cropBoxSize,
          );
          onCropChange(newCropRect);
          gestureRef.current.isPinching = false;
        },
      }),
    [clampImageOffset, onZoomChange, calculateCropRect, onCropChange],
  );

  // 角落拖动手势（仅自由比例模式）
  const createCornerResponder = useCallback(
    (corner: 'tl' | 'tr' | 'bl' | 'br') => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => aspectRatio === undefined,
        onMoveShouldSetPanResponder: () => aspectRatio === undefined,
        onStartShouldSetPanResponderCapture: () => aspectRatio === undefined,
        onMoveShouldSetPanResponderCapture: () => aspectRatio === undefined,
        onPanResponderGrant: () => {
          gestureRef.current.startCropSize = {...stateRef.current.cropBoxSize};
          gestureRef.current.startOffset = {...stateRef.current.imageOffset};
        },
        onPanResponderMove: (_, gestureState) => {
          if (aspectRatio !== undefined) {
            return;
          }

          const {dx, dy} = gestureState;
          const startSize = gestureRef.current.startCropSize;
          const imgW = baseFitSize.width * stateRef.current.zoom;
          const imgH = baseFitSize.height * stateRef.current.zoom;

          let newW = startSize.width;
          let newH = startSize.height;
          let offsetDx = 0;
          let offsetDy = 0;

          // 根据角落位置调整尺寸和偏移
          switch (corner) {
            case 'tl':
              newW = startSize.width - dx;
              newH = startSize.height - dy;
              offsetDx = dx / 2;
              offsetDy = dy / 2;
              break;
            case 'tr':
              newW = startSize.width + dx;
              newH = startSize.height - dy;
              offsetDx = dx / 2;
              offsetDy = dy / 2;
              break;
            case 'bl':
              newW = startSize.width - dx;
              newH = startSize.height + dy;
              offsetDx = dx / 2;
              offsetDy = dy / 2;
              break;
            case 'br':
              newW = startSize.width + dx;
              newH = startSize.height + dy;
              offsetDx = dx / 2;
              offsetDy = dy / 2;
              break;
          }

          // 限制尺寸
          newW = Math.max(MIN_CROP_SIZE, Math.min(newW, imgW));
          newH = Math.max(MIN_CROP_SIZE, Math.min(newH, imgH));

          setFreeCropSize({width: newW, height: newH});

          // 调整偏移以保持图片在裁切框内
          const newOffset = {
            x: gestureRef.current.startOffset.x + offsetDx,
            y: gestureRef.current.startOffset.y + offsetDy,
          };
          const clamped = clampImageOffset(
            newOffset.x,
            newOffset.y,
            stateRef.current.zoom,
            {width: newW, height: newH},
          );
          setImageOffset(clamped);
        },
        onPanResponderRelease: () => {
          const newCropRect = calculateCropRect(
            stateRef.current.imageOffset,
            stateRef.current.zoom,
            stateRef.current.cropBoxSize,
          );
          onCropChange(newCropRect);
        },
      });
    },
    [
      aspectRatio,
      baseFitSize,
      clampImageOffset,
      calculateCropRect,
      onCropChange,
    ],
  );

  const cornerResponders = useMemo(
    () => ({
      tl: createCornerResponder('tl'),
      tr: createCornerResponder('tr'),
      bl: createCornerResponder('bl'),
      br: createCornerResponder('br'),
    }),
    [createCornerResponder],
  );

  // 位置计算
  const cropBoxX = (containerSize.width - cropBoxSize.width) / 2;
  const cropBoxY = (containerSize.height - cropBoxSize.height) / 2;

  const imageX =
    (containerSize.width - imageDisplaySize.width) / 2 + imageOffset.x;
  const imageY =
    (containerSize.height - imageDisplaySize.height) / 2 + imageOffset.y;

  const isReady =
    containerSize.width > 0 &&
    containerSize.height > 0 &&
    imageDisplaySize.width > 0 &&
    imageNaturalSize.width > 0;

  const isFreeMode = aspectRatio === undefined;

  const imageStyle = useMemo(() => {
    const width = isRotated90or270
      ? imageDisplaySize.height
      : imageDisplaySize.width;
    const height = isRotated90or270
      ? imageDisplaySize.width
      : imageDisplaySize.height;
    const leftOffset =
      imageX +
      (isRotated90or270
        ? (imageDisplaySize.width - imageDisplaySize.height) / 2
        : 0);
    const topOffset =
      imageY +
      (isRotated90or270
        ? (imageDisplaySize.height - imageDisplaySize.width) / 2
        : 0);

    return {
      width,
      height,
      left: leftOffset,
      top: topOffset,
      transform: [
        {rotate: `${rotation}deg`},
        {scaleX: flip.horizontal ? -1 : 1},
        {scaleY: flip.vertical ? -1 : 1},
      ],
    };
  }, [
    flip.horizontal,
    flip.vertical,
    imageDisplaySize.height,
    imageDisplaySize.width,
    imageX,
    imageY,
    isRotated90or270,
    rotation,
  ]);

  const cropBoxStyle = useMemo(
    () => ({
      left: cropBoxX,
      top: cropBoxY,
      width: cropBoxSize.width,
      height: cropBoxSize.height,
    }),
    [cropBoxSize.height, cropBoxSize.width, cropBoxX, cropBoxY],
  );

  const overlayTopStyle = useMemo(
    () => ({
      top: 0,
      left: 0,
      right: 0,
      height: Math.max(0, cropBoxY),
    }),
    [cropBoxY],
  );

  const overlayBottomStyle = useMemo(
    () => ({
      bottom: 0,
      left: 0,
      right: 0,
      height: Math.max(
        0,
        containerSize.height - cropBoxY - cropBoxSize.height,
      ),
    }),
    [containerSize.height, cropBoxSize.height, cropBoxY],
  );

  const overlayLeftStyle = useMemo(
    () => ({
      top: cropBoxY,
      left: 0,
      width: Math.max(0, cropBoxX),
      height: cropBoxSize.height,
    }),
    [cropBoxSize.height, cropBoxX, cropBoxY],
  );

  const overlayRightStyle = useMemo(
    () => ({
      top: cropBoxY,
      right: 0,
      width: Math.max(
        0,
        containerSize.width - cropBoxX - cropBoxSize.width,
      ),
      height: cropBoxSize.height,
    }),
    [containerSize.width, cropBoxSize.height, cropBoxSize.width, cropBoxX, cropBoxY],
  );

  const handleStyles = useMemo(
    () => ({
      tl: {
        left: cropBoxX - HANDLE_SIZE / 2,
        top: cropBoxY - HANDLE_SIZE / 2,
      },
      tr: {
        left: cropBoxX + cropBoxSize.width - HANDLE_SIZE / 2,
        top: cropBoxY - HANDLE_SIZE / 2,
      },
      bl: {
        left: cropBoxX - HANDLE_SIZE / 2,
        top: cropBoxY + cropBoxSize.height - HANDLE_SIZE / 2,
      },
      br: {
        left: cropBoxX + cropBoxSize.width - HANDLE_SIZE / 2,
        top: cropBoxY + cropBoxSize.height - HANDLE_SIZE / 2,
      },
    }),
    [cropBoxSize.height, cropBoxSize.width, cropBoxX, cropBoxY],
  );

  return (
    <View
      style={styles.container}
      onLayout={e => setContainerSize(e.nativeEvent.layout)}>
      {isReady && (
        <>
          {/* 可拖动的图片层 */}
          <View
            style={StyleSheet.absoluteFill}
            {...imageGestureResponder.panHandlers}>
            <Image
              source={{uri: imageUri}}
              style={[styles.image, imageStyle]}
              resizeMode="cover"
            />
          </View>

          {/* 遮罩层 */}
          <View style={styles.overlayContainer} pointerEvents="none">
            <View style={[styles.overlay, overlayTopStyle]} />
            <View style={[styles.overlay, overlayBottomStyle]} />
            <View style={[styles.overlay, overlayLeftStyle]} />
            <View style={[styles.overlay, overlayRightStyle]} />
          </View>

          {/* 裁切框边框 */}
          <View style={[styles.cropBox, cropBoxStyle]} pointerEvents="none">
            {/* 角落装饰 */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* 三分网格线 */}
            <View style={[styles.gridVertical, styles.gridVerticalThird]} />
            <View style={[styles.gridVertical, styles.gridVerticalTwoThird]} />
            <View style={[styles.gridHorizontal, styles.gridHorizontalThird]} />
            <View style={[styles.gridHorizontal, styles.gridHorizontalTwoThird]} />
          </View>

          {/* 四角拖动手柄（仅自由比例模式） */}
          {isFreeMode && (
            <>
              <View
                style={[styles.handleContainer, handleStyles.tl]}
                {...cornerResponders.tl.panHandlers}
              />
              <View
                style={[styles.handleContainer, handleStyles.tr]}
                {...cornerResponders.tr.panHandlers}
              />
              <View
                style={[styles.handleContainer, handleStyles.bl]}
                {...cornerResponders.bl.panHandlers}
              />
              <View
                style={[styles.handleContainer, handleStyles.br]}
                {...cornerResponders.br.panHandlers}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  corner: {
    position: 'absolute',
    width: CORNER_LENGTH,
    height: CORNER_LENGTH,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: 'white',
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: 'white',
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: 'white',
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: 'white',
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridVerticalThird: {
    left: '33.33%',
  },
  gridVerticalTwoThird: {
    left: '66.66%',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  gridHorizontalThird: {
    top: '33.33%',
  },
  gridHorizontalTwoThird: {
    top: '66.66%',
  },
  handleContainer: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    zIndex: 100,
  },
});
