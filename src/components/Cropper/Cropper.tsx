/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-12 01:25:00
 * @Description: 裁切组件 - 支持双指缩放、拖动图片、拖动角落调整裁切框
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, PanResponder, StyleSheet, View} from 'react-native';

import {
  DEFAULT_CROP_RECT,
  MAX_CROP_ZOOM,
  MIN_CROP_SIZE,
  MIN_CROP_ZOOM,
} from '../../config';
import type {CropRect} from '../../types';

interface CropperProps {
  imageUri: string;
  initialCropRect?: CropRect;
  onCropChange: (rect: CropRect) => void;
  aspectRatio?: number; // undefined means free
  rotation: number;
  onRotationChange: (rotation: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  flip: {horizontal: boolean; vertical: boolean};
}

const EDGE_PADDING = 20;
const CORNER_LENGTH = 20;
const CORNER_THICKNESS = 3;
const HANDLE_SIZE = 44;

export const Cropper: React.FC<CropperProps> = ({
  imageUri,
  initialCropRect,
  onCropChange,
  aspectRatio,
  rotation,
  onRotationChange,
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

  // 自定义裁切框尺寸（用于手动调整后的尺寸）
  const [customCropSize, setCustomCropSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const prevAspectRatioRef = useRef(aspectRatio);
  const isInitializedRef = useRef(false);

  // 加载图片原始尺寸
  useEffect(() => {
    let isActive = true;
    isInitializedRef.current = false;
    setCustomCropSize(null);
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

  // 使用原始图片尺寸，不根据旋转角度自动交换宽高
  const visualImageW = imageNaturalSize.width;
  const visualImageH = imageNaturalSize.height;

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

    // 1. 如果有自定义尺寸，优先使用 (包括从固定切换到自由后的持久化尺寸)
    if (customCropSize) {
      if (aspectRatio === undefined) {
        return customCropSize;
      }
      // 固定比例模式下，优先返回自定义尺寸（它已经被约束了）
      return customCropSize;
    }

    // 2. 自由比例模式 (aspectRatio === undefined)
    if (aspectRatio === undefined) {
      // 关键修复：消除切换闪烁
      // 当从固定比例切换到自由模式时，customCropSize 更新是异步的（在 Effect 中）。
      // 在这期间的一帧，如果直接返回全屏尺寸，会导致 Layuout 剧烈跳变（甚至产生翻转错觉）。
      // 所以如果检测到“刚刚还是固定比例”（prevAspectRatioRef 有值），
      // 我们就在这里临时计算并返回那个比例的尺寸，保持视觉稳定。
      if (prevAspectRatioRef.current !== undefined) {
        const prevRatio = prevAspectRatioRef.current;
        const boxRatio = baseFitSize.width / baseFitSize.height;
        if (prevRatio > boxRatio) {
          return {
            width: baseFitSize.width,
            height: baseFitSize.width / prevRatio,
          };
        } else {
          return {
            width: baseFitSize.height * prevRatio,
            height: baseFitSize.height,
          };
        }
      }

      // 如果真的是初始自由模式，或者没有之前的比例记录，则默认全选
      return {
        width: baseFitSize.width,
        height: baseFitSize.height,
      };
    }

    // 3. 固定比例模式 - 默认最大化适应
    // (逻辑：只有在没有 customCropSize 时才会走到这里，通常是刚切换到一个新的固定比例)
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
  }, [baseFitSize, aspectRatio, customCropSize]);

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
        return DEFAULT_CROP_RECT;
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
    // 只有当 aspectRatio 真正变化时才执行
    if (aspectRatio === prevAspectRatioRef.current) {
      return;
    }

    if (baseFitSize.width > 0) {
      // 移除强制重置，保留当前的 offset，但需要 clamp 确保不越界
      // setImageOffset({x: 0, y: 0});

      let targetSize;
      if (aspectRatio === undefined) {
        // === 切换到自由模式 ===
        if (customCropSize) {
          targetSize = customCropSize;
        } else if (prevAspectRatioRef.current !== undefined) {
          // 之前的比例存在，计算出当时的尺寸作为自由模式的初始尺寸
          const prevRatio = prevAspectRatioRef.current;
          const boxRatio = baseFitSize.width / baseFitSize.height;
          if (prevRatio > boxRatio) {
            targetSize = {
              width: baseFitSize.width,
              height: baseFitSize.width / prevRatio,
            };
          } else {
            targetSize = {
              width: baseFitSize.height * prevRatio,
              height: baseFitSize.height,
            };
          }
          // 保存这个尺寸作为自定义尺寸
          setCustomCropSize(targetSize);
        } else {
          // 默认全选
          targetSize = baseFitSize;
        }
      } else {
        // === 切换到固定比例 ===
        // 重置自定义尺寸，使用新的固定比例计算尺寸
        setCustomCropSize(null);

        const boxRatio = baseFitSize.width / baseFitSize.height;
        if (aspectRatio > boxRatio) {
          targetSize = {
            width: baseFitSize.width,
            height: baseFitSize.width / aspectRatio,
          };
        } else {
          targetSize = {
            width: baseFitSize.height * aspectRatio,
            height: baseFitSize.height,
          };
        }
      }

      if (targetSize) {
        // 使用当前的 offset 进行 clamp，确保在新的裁切框尺寸下合法
        const clampedOffset = clampImageOffset(
          imageOffset.x,
          imageOffset.y,
          zoom,
          targetSize,
        );
        setImageOffset(clampedOffset);

        const newCropRect = calculateCropRect(clampedOffset, zoom, targetSize);
        onCropChange(newCropRect);
      }
    }
    prevAspectRatioRef.current = aspectRatio;
  }, [
    aspectRatio,
    baseFitSize,
    calculateCropRect,
    onCropChange,
    zoom,
    customCropSize,
    clampImageOffset,
    imageOffset,
  ]);

  // 初始化
  useEffect(() => {
    if (
      baseFitSize.width > 0 &&
      baseFitSize.height > 0 &&
      !isInitializedRef.current
    ) {
      isInitializedRef.current = true;

      if (initialCropRect && initialCropRect.width > 0) {
        // 如果有初始位置，反向计算内部状态
        const imgW = baseFitSize.width * zoom;
        const imgH = baseFitSize.height * zoom;

        // 计算位移: -(normCenterX - 0.5) * imgW
        const normCenterX = initialCropRect.x + initialCropRect.width / 2;
        const normCenterY = initialCropRect.y + initialCropRect.height / 2;
        const offsetX = -(normCenterX - 0.5) * imgW;
        const offsetY = -(normCenterY - 0.5) * imgH;

        setImageOffset({x: offsetX, y: offsetY});

        // 如果是自由比例模式，还原框大小
        if (aspectRatio === undefined) {
          setCustomCropSize({
            width: initialCropRect.width * imgW,
            height: initialCropRect.height * imgH,
          });
        }
      } else {
        // 默认全选
        const newCropRect = calculateCropRect({x: 0, y: 0}, zoom, cropBoxSize);
        onCropChange(newCropRect);
      }
    }
  }, [
    baseFitSize,
    calculateCropRect,
    cropBoxSize,
    onCropChange,
    zoom,
    initialCropRect,
    aspectRatio,
  ]);

  // 手势状态
  const gestureRef = useRef({
    startOffset: {x: 0, y: 0},
    startZoom: 1,
    startDistance: 0,
    startRotation: 0,
    startAngle: 0,
    isPinching: false,
    startCropSize: {width: 0, height: 0},
    // 增量更新用的上一帧状态
    lastDistance: 0,
    lastAngle: 0,
    lastCenterX: 0,
    lastCenterY: 0,
  });

  const stateRef = useRef({zoom, rotation, imageOffset, cropBoxSize});
  useEffect(() => {
    stateRef.current = {zoom, rotation, imageOffset, cropBoxSize};
  }, [zoom, rotation, imageOffset, cropBoxSize]);

  // 图片拖动和双指缩放/旋转手势
  const imageGestureResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: evt => {
          const touches = evt.nativeEvent.touches;
          gestureRef.current.startOffset = {...stateRef.current.imageOffset};
          gestureRef.current.startZoom = stateRef.current.zoom;
          gestureRef.current.startRotation = stateRef.current.rotation;

          if (touches.length === 2) {
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const centerX = (touches[0].pageX + touches[1].pageX) / 2;
            const centerY = (touches[0].pageY + touches[1].pageY) / 2;

            gestureRef.current.startDistance = distance;
            gestureRef.current.startAngle = angle;
            gestureRef.current.lastDistance = distance;
            gestureRef.current.lastAngle = angle;
            gestureRef.current.lastCenterX = centerX;
            gestureRef.current.lastCenterY = centerY;
            gestureRef.current.isPinching = true;
          } else {
            gestureRef.current.isPinching = false;
            gestureRef.current.startDistance = 0;
            gestureRef.current.startAngle = 0;
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;
          const currentCropSize = stateRef.current.cropBoxSize;

          if (touches.length === 2) {
            const dx = touches[0].pageX - touches[1].pageX;
            const dy = touches[0].pageY - touches[1].pageY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const centerX = (touches[0].pageX + touches[1].pageX) / 2;
            const centerY = (touches[0].pageY + touches[1].pageY) / 2;

            // 如果是刚刚开始识别到双指，则初始化
            if (
              !gestureRef.current.isPinching ||
              gestureRef.current.startDistance === 0
            ) {
              gestureRef.current.isPinching = true;
              gestureRef.current.startDistance = distance;
              gestureRef.current.startAngle = angle;
              gestureRef.current.startZoom = stateRef.current.zoom;
              gestureRef.current.startRotation = stateRef.current.rotation;
              gestureRef.current.startOffset = {
                ...stateRef.current.imageOffset,
              };
              gestureRef.current.lastDistance = distance;
              gestureRef.current.lastAngle = angle;
              gestureRef.current.lastCenterX = centerX;
              gestureRef.current.lastCenterY = centerY;
              return;
            }

            // 增量计算
            const deltaScale = distance / gestureRef.current.lastDistance;
            const deltaAngle = angle - gestureRef.current.lastAngle;
            const deltaCenterX = centerX - gestureRef.current.lastCenterX;
            const deltaCenterY = centerY - gestureRef.current.lastCenterY;

            // 更新 last 状态
            gestureRef.current.lastDistance = distance;
            gestureRef.current.lastAngle = angle;
            gestureRef.current.lastCenterX = centerX;
            gestureRef.current.lastCenterY = centerY;

            // 计算新的 zoom
            const currentZoom = stateRef.current.zoom;
            const newZoom = Math.max(
              MIN_CROP_ZOOM,
              Math.min(MAX_CROP_ZOOM, currentZoom * deltaScale),
            );

            // 计算新的旋转角度
            const currentRotation = stateRef.current.rotation;
            let newRotation = (currentRotation + deltaAngle) % 360;
            if (newRotation < 0) newRotation += 360;

            // 计算新的偏移（增量更新）
            const currentOffset = stateRef.current.imageOffset;
            // 偏移量随着双指中点移动
            const newOffsetX = currentOffset.x + deltaCenterX;
            const newOffsetY = currentOffset.y + deltaCenterY;

            onZoomChange(newZoom);
            onRotationChange(Math.round(newRotation));

            const clamped = clampImageOffset(
              newOffsetX,
              newOffsetY,
              newZoom,
              currentCropSize,
            );
            setImageOffset(clamped);
          } else if (!gestureRef.current.isPinching && touches.length === 1) {
            // 单指拖动
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
    [
      clampImageOffset,
      onZoomChange,
      onRotationChange,
      calculateCropRect,
      onCropChange,
    ],
  );

  // 角落拖动手势
  const createCornerResponder = useCallback(
    (corner: 'tl' | 'tr' | 'bl' | 'br') => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          gestureRef.current.startCropSize = {...stateRef.current.cropBoxSize};
          gestureRef.current.startOffset = {...stateRef.current.imageOffset};
        },
        onPanResponderMove: (_, gestureState) => {
          const {dx, dy} = gestureState;
          const startSize = gestureRef.current.startCropSize;
          const imgW = baseFitSize.width * stateRef.current.zoom;
          const imgH = baseFitSize.height * stateRef.current.zoom;

          let newW = startSize.width;
          let newH = startSize.height;

          // 基础变化量
          let deltaW = 0;
          let deltaH = 0;

          // 根据角落确定变化方向符号 (Left/Top 移动增加尺寸意味着坐标减小，反之亦然)
          // TL: dx<0 -> W++, dy<0 -> H++
          // TR: dx>0 -> W++, dy<0 -> H++
          // BL: dx<0 -> W++, dy>0 -> H++
          // BR: dx>0 -> W++, dy>0 -> H++

          const isLeft = corner === 'tl' || corner === 'bl';
          const isTop = corner === 'tl' || corner === 'tr';

          const signW = isLeft ? -1 : 1;
          const signH = isTop ? -1 : 1;

          deltaW = dx * signW;
          deltaH = dy * signH;

          if (aspectRatio !== undefined) {
            // 固定比例模式：限制长宽比
            // 策略：取变化较大的那个维度作为主导，或者取投影
            // 简单策略：看那个维度的 '有效变化' 更大
            // 这里我们采用 "以宽为主" 或 "以高为主" 的动态策略，
            // 比较 abs(deltaW) 和 abs(deltaH * ratio)
            if (Math.abs(deltaW) > Math.abs(deltaH * aspectRatio)) {
              // 宽度变化更多，以宽度为准
              newW = startSize.width + deltaW;
              newH = newW / aspectRatio;
            } else {
              // 高度变化更多，以高度为准
              newH = startSize.height + deltaH;
              newW = newH * aspectRatio;
            }
          } else {
            // 自由模式
            newW = startSize.width + deltaW;
            newH = startSize.height + deltaH;
          }

          // 限制尺寸 (Min / Max)
          // 注意：固定比例下，如果 Clamp 了一个维度，必须重新计算另一个维度以保持比例
          // 1. Min Size
          if (newW < MIN_CROP_SIZE) {
            newW = MIN_CROP_SIZE;
            if (aspectRatio !== undefined) newH = newW / aspectRatio;
          }
          if (newH < MIN_CROP_SIZE) {
            newH = MIN_CROP_SIZE;
            if (aspectRatio !== undefined) newW = newH * aspectRatio;
          }

          // 2. Max Size (Image Bounds)
          if (newW > imgW) {
            newW = imgW;
            if (aspectRatio !== undefined) newH = newW / aspectRatio;
          }
          if (newH > imgH) {
            newH = imgH;
            if (aspectRatio !== undefined) newW = newH * aspectRatio;
          }

          // Double check fit (sometimes recalculating one dimension might break the other limit)
          if (newW > imgW) {
            newW = imgW;
            if (aspectRatio !== undefined) newH = newW / aspectRatio;
          }
          if (newH > imgH) {
            newH = imgH;
            if (aspectRatio !== undefined) newW = newH * aspectRatio;
          }

          setCustomCropSize({width: newW, height: newH});

          // 计算位移补偿，保持对角不动
          const finalDW = newW - startSize.width;
          const finalDH = newH - startSize.height;

          // 根据角落应用补偿
          // Logic:
          // offsetDx moves the Image.
          // TL moves Left (-dw/2). To anchor BR, Image must move Right (+dw/2).
          // BUT `offsetDx` in code was `-dx/2`.
          // If TL drags Left (-), `dx` is neg. `offsetDx` is pos. Image moves Right. Correct.
          // Formula:
          // isLeft (TL/BL): Offset = +dW / 2
          // isRight (TR/BR): Offset = -dW / 2
          // isTop (TL/TR): Offset = +dH / 2
          // isBottom (BL/BR): Offset = -dH / 2

          const offsetDx = (isLeft ? 1 : -1) * (finalDW / 2);
          const offsetDy = (isTop ? 1 : -1) * (finalDH / 2);

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
    return {
      width: imageDisplaySize.width,
      height: imageDisplaySize.height,
      left: imageX,
      top: imageY,
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
      height: Math.max(0, containerSize.height - cropBoxY - cropBoxSize.height),
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
      width: Math.max(0, containerSize.width - cropBoxX - cropBoxSize.width),
      height: cropBoxSize.height,
    }),
    [
      containerSize.width,
      cropBoxSize.height,
      cropBoxSize.width,
      cropBoxX,
      cropBoxY,
    ],
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
            <View
              style={[styles.gridHorizontal, styles.gridHorizontalTwoThird]}
            />
          </View>

          {/* 四角拖动手柄 (全模式支持) */}
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
