import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image} from 'react-native';

import {CROP_EDGE_PADDING, DEFAULT_CROP_RECT} from '../../config';
import type {CropRect} from '../../types';
import type {Offset, Size} from './types';

interface UseCropperStateOptions {
  imageUri: string;
  initialCropRect?: CropRect;
  aspectRatio?: number;
  zoom: number;
  onCropChange: (rect: CropRect) => void;
}

interface UseCropperStateReturn {
  containerSize: Size;
  setContainerSize: (size: Size) => void;
  imageNaturalSize: Size;
  imageOffset: Offset;
  setImageOffset: (offset: Offset) => void;
  customCropSize: Size | null;
  setCustomCropSize: (size: Size | null) => void;
  baseFitSize: Size;
  cropBoxSize: Size;
  imageDisplaySize: Size;
  isReady: boolean;
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
}

export const useCropperState = ({
  imageUri,
  initialCropRect,
  aspectRatio,
  zoom,
  onCropChange,
}: UseCropperStateOptions): UseCropperStateReturn => {
  const [containerSize, setContainerSize] = useState<Size>({width: 0, height: 0});
  const [imageNaturalSize, setImageNaturalSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [imageOffset, setImageOffset] = useState<Offset>({x: 0, y: 0});
  const [customCropSize, setCustomCropSize] = useState<Size | null>(null);

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

    const availableW = containerSize.width - CROP_EDGE_PADDING * 2;
    const availableH = containerSize.height - CROP_EDGE_PADDING * 2;
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

    if (customCropSize) {
      return customCropSize;
    }

    if (aspectRatio === undefined) {
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
      return {width: baseFitSize.width, height: baseFitSize.height};
    }

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

  // 限制图片偏移量
  const clampImageOffset = useCallback(
    (ox: number, oy: number, currentZoom: number, currentCropSize: Size) => {
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
    (offset: Offset, currentZoom: number, currentCropSize: Size): CropRect => {
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
    if (aspectRatio === prevAspectRatioRef.current) {
      return;
    }

    if (baseFitSize.width > 0) {
      let targetSize;
      if (aspectRatio === undefined) {
        if (customCropSize) {
          targetSize = customCropSize;
        } else if (prevAspectRatioRef.current !== undefined) {
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
          setCustomCropSize(targetSize);
        } else {
          targetSize = baseFitSize;
        }
      } else {
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
        const imgW = baseFitSize.width * zoom;
        const imgH = baseFitSize.height * zoom;

        const normCenterX = initialCropRect.x + initialCropRect.width / 2;
        const normCenterY = initialCropRect.y + initialCropRect.height / 2;
        const offsetX = -(normCenterX - 0.5) * imgW;
        const offsetY = -(normCenterY - 0.5) * imgH;

        setImageOffset({x: offsetX, y: offsetY});

        if (aspectRatio === undefined) {
          setCustomCropSize({
            width: initialCropRect.width * imgW,
            height: initialCropRect.height * imgH,
          });
        }
      } else {
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

  const isReady =
    containerSize.width > 0 &&
    containerSize.height > 0 &&
    imageDisplaySize.width > 0 &&
    imageNaturalSize.width > 0;

  return {
    containerSize,
    setContainerSize,
    imageNaturalSize,
    imageOffset,
    setImageOffset,
    customCropSize,
    setCustomCropSize,
    baseFitSize,
    cropBoxSize,
    imageDisplaySize,
    isReady,
    clampImageOffset,
    calculateCropRect,
  };
};
