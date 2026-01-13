import {useCallback, useEffect, useMemo, useRef} from 'react';
import {PanResponder} from 'react-native';

import {MAX_CROP_ZOOM, MIN_CROP_SIZE, MIN_CROP_ZOOM} from '../../config';
import type {CropRect} from '../../types';
import type {CornerType, GestureState, Offset, Size} from './types';

interface UseCropperGesturesOptions {
  zoom: number;
  rotation: number;
  imageOffset: Offset;
  cropBoxSize: Size;
  baseFitSize: Size;
  aspectRatio?: number;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  setImageOffset: (offset: Offset) => void;
  setCustomCropSize: (size: Size | null) => void;
  clampImageOffset: (
    ox: number,
    oy: number,
    currentZoom: number,
    currentCropSize: Size,
  ) => Offset;
  calculateCropRect: (
    offset: Offset,
    currentZoom: number,
    currentCropSize: Size,
  ) => CropRect;
  onCropChange: (rect: CropRect) => void;
}

export const useCropperGestures = ({
  zoom,
  rotation,
  imageOffset,
  cropBoxSize,
  baseFitSize,
  aspectRatio,
  onZoomChange,
  onRotationChange,
  setImageOffset,
  setCustomCropSize,
  clampImageOffset,
  calculateCropRect,
  onCropChange,
}: UseCropperGesturesOptions) => {
  const gestureRef = useRef<GestureState>({
    startOffset: {x: 0, y: 0},
    startZoom: 1,
    startDistance: 0,
    startRotation: 0,
    startAngle: 0,
    isPinching: false,
    startCropSize: {width: 0, height: 0},
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

            const deltaScale = distance / gestureRef.current.lastDistance;
            const deltaAngle = angle - gestureRef.current.lastAngle;
            const deltaCenterX = centerX - gestureRef.current.lastCenterX;
            const deltaCenterY = centerY - gestureRef.current.lastCenterY;

            gestureRef.current.lastDistance = distance;
            gestureRef.current.lastAngle = angle;
            gestureRef.current.lastCenterX = centerX;
            gestureRef.current.lastCenterY = centerY;

            const currentZoom = stateRef.current.zoom;
            const newZoom = Math.max(
              MIN_CROP_ZOOM,
              Math.min(MAX_CROP_ZOOM, currentZoom * deltaScale),
            );

            const currentRotation = stateRef.current.rotation;
            let newRotation = (currentRotation + deltaAngle) % 360;
            if (newRotation < 0) {
              newRotation += 360;
            }

            const currentOffset = stateRef.current.imageOffset;
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
      setImageOffset,
    ],
  );

  // 角落拖动手势
  const createCornerResponder = useCallback(
    (corner: CornerType) => {
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
          let deltaW = 0;
          let deltaH = 0;

          const isLeft = corner === 'tl' || corner === 'bl';
          const isTop = corner === 'tl' || corner === 'tr';

          const signW = isLeft ? -1 : 1;
          const signH = isTop ? -1 : 1;

          deltaW = dx * signW;
          deltaH = dy * signH;

          if (aspectRatio !== undefined) {
            if (Math.abs(deltaW) > Math.abs(deltaH * aspectRatio)) {
              newW = startSize.width + deltaW;
              newH = newW / aspectRatio;
            } else {
              newH = startSize.height + deltaH;
              newW = newH * aspectRatio;
            }
          } else {
            newW = startSize.width + deltaW;
            newH = startSize.height + deltaH;
          }

          // 限制尺寸
          if (newW < MIN_CROP_SIZE) {
            newW = MIN_CROP_SIZE;
            if (aspectRatio !== undefined) {
              newH = newW / aspectRatio;
            }
          }
          if (newH < MIN_CROP_SIZE) {
            newH = MIN_CROP_SIZE;
            if (aspectRatio !== undefined) {
              newW = newH * aspectRatio;
            }
          }
          if (newW > imgW) {
            newW = imgW;
            if (aspectRatio !== undefined) {
              newH = newW / aspectRatio;
            }
          }
          if (newH > imgH) {
            newH = imgH;
            if (aspectRatio !== undefined) {
              newW = newH * aspectRatio;
            }
          }
          if (newW > imgW) {
            newW = imgW;
            if (aspectRatio !== undefined) {
              newH = newW / aspectRatio;
            }
          }
          if (newH > imgH) {
            newH = imgH;
            if (aspectRatio !== undefined) {
              newW = newH * aspectRatio;
            }
          }

          setCustomCropSize({width: newW, height: newH});

          const finalDW = newW - startSize.width;
          const finalDH = newH - startSize.height;

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
      setImageOffset,
      setCustomCropSize,
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

  return {
    imageGestureResponder,
    cornerResponders,
  };
};
