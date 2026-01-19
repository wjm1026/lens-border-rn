/**
 * Cropper 相关的工具函数
 * 提取复杂计算逻辑，提升代码可读性和可测试性
 */

import type {CropRect} from '../../types';
import type {Offset, Size} from './types';
import {CROP_EDGE_PADDING} from '../../config';

/**
 * 计算适应容器的基础图片尺寸
 * 保持图片宽高比，使图片完全fit在容器内
 */
export function calculateBaseFitSize(
  containerSize: Size,
  imageSize: Size,
): Size {
  const {width: containerW, height: containerH} = containerSize;
  const {width: imageW, height: imageH} = imageSize;

  if (containerW === 0 || containerH === 0 || imageW === 0 || imageH === 0) {
    return {width: 0, height: 0};
  }

  const availableW = containerW - CROP_EDGE_PADDING * 2;
  const availableH = containerH - CROP_EDGE_PADDING * 2;
  const imageRatio = imageW / imageH;
  const containerRatio = availableW / availableH;

  if (imageRatio > containerRatio) {
    return {
      width: availableW,
      height: availableW / imageRatio,
    };
  }

  return {
    width: availableH * imageRatio,
    height: availableH,
  };
}

/**
 * 基于宽高比计算裁切框尺寸
 */
export function calculateCropBoxSize(
  baseFitSize: Size,
  aspectRatio?: number,
  previousAspectRatio?: number,
): Size {
  if (baseFitSize.width === 0 || baseFitSize.height === 0) {
    return {width: 0, height: 0};
  }

  // 无宽高比限制时
  if (aspectRatio === undefined) {
    // 保持之前的宽高比
    if (previousAspectRatio !== undefined) {
      const boxRatio = baseFitSize.width / baseFitSize.height;
      if (previousAspectRatio > boxRatio) {
        return {
          width: baseFitSize.width,
          height: baseFitSize.width / previousAspectRatio,
        };
      }
      return {
        width: baseFitSize.height * previousAspectRatio,
        height: baseFitSize.height,
      };
    }
    return baseFitSize;
  }

  // 有宽高比限制
  const boxRatio = baseFitSize.width / baseFitSize.height;
  if (aspectRatio > boxRatio) {
    return {
      width: baseFitSize.width,
      height: baseFitSize.width / aspectRatio,
    };
  }

  return {
    width: baseFitSize.height * aspectRatio,
    height: baseFitSize.height,
  };
}

/**
 * 限制图片偏移量在有效范围内
 * 确保裁切框始终在图片范围内
 */
export function clampOffset(
  offset: Offset,
  imageSize: Size,
  cropSize: Size,
): Offset {
  const maxOffsetX = Math.max(0, (imageSize.width - cropSize.width) / 2);
  const maxOffsetY = Math.max(0, (imageSize.height - cropSize.height) / 2);

  return {
    x: Math.max(-maxOffsetX, Math.min(maxOffsetX, offset.x)),
    y: Math.max(-maxOffsetY, Math.min(maxOffsetY, offset.y)),
  };
}

/**
 * 根据偏移量计算归一化的裁切矩形
 * 返回值范围 [0, 1]
 */
export function calculateNormalizedCropRect(
  offset: Offset,
  imageDisplaySize: Size,
  cropSize: Size,
  defaultRect: CropRect,
): CropRect {
  const {width: imgW, height: imgH} = imageDisplaySize;

  if (imgW === 0 || imgH === 0) {
    return defaultRect;
  }

  const cropCenterX = -offset.x;
  const cropCenterY = -offset.y;

  const normCenterX = 0.5 + cropCenterX / imgW;
  const normCenterY = 0.5 + cropCenterY / imgH;
  const normW = cropSize.width / imgW;
  const normH = cropSize.height / imgH;

  return {
    x: Math.max(0, Math.min(1 - normW, normCenterX - normW / 2)),
    y: Math.max(0, Math.min(1 - normH, normCenterY - normH / 2)),
    width: Math.min(1, normW),
    height: Math.min(1, normH),
  };
}

/**
 * 计算双指手势的距离和角度
 */
export function calculatePinchGesture(
  touch1: {pageX: number; pageY: number},
  touch2: {pageX: number; pageY: number},
) {
  const dx = touch1.pageX - touch2.pageX;
  const dy = touch1.pageY - touch2.pageY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const centerX = (touch1.pageX + touch2.pageX) / 2;
  const centerY = (touch1.pageY + touch2.pageY) / 2;

  return {distance, angle, centerX, centerY};
}

/**
 * 计算新的缩放值并限制在有效范围内
 */
export function calculateNewZoom(
  currentZoom: number,
  deltaScale: number,
  minZoom: number,
  maxZoom: number,
): number {
  return Math.max(minZoom, Math.min(maxZoom, currentZoom * deltaScale));
}

/**
 * 计算新的旋转角度并归一化到 [0, 360)
 */
export function calculateNewRotation(
  currentRotation: number,
  deltaAngle: number,
): number {
  let newRotation = (currentRotation + deltaAngle) % 360;
  if (newRotation < 0) {
    newRotation += 360;
  }
  return Math.round(newRotation);
}
