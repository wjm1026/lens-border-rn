/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-14 01:03:54
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-14 01:05:46
 * @FilePath: /code/lens-border-rn/src/components/Cropper/types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type {CropFlip, CropRect} from '../../types';

export interface CropperProps {
  imageUri: string;
  initialCropRect?: CropRect;
  onCropChange: (rect: CropRect) => void;
  aspectRatio?: number; // undefined means free
  rotation: number;
  onRotationChange: (rotation: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  flip: CropFlip;
}

export interface Size {
  width: number;
  height: number;
}

export interface Offset {
  x: number;
  y: number;
}

export interface CropperState {
  containerSize: Size;
  imageNaturalSize: Size;
  imageOffset: Offset;
  customCropSize: Size | null;
  baseFitSize: Size;
  cropBoxSize: Size;
  imageDisplaySize: Size;
  isReady: boolean;
}

export interface GestureState {
  startOffset: Offset;
  startZoom: number;
  startDistance: number;
  startRotation: number;
  startAngle: number;
  isPinching: boolean;
  startCropSize: Size;
  lastDistance: number;
  lastAngle: number;
  lastCenterX: number;
  lastCenterY: number;
}

export type CornerType = 'tl' | 'tr' | 'bl' | 'br';

export interface CropBoxProps {
  cropBoxX: number;
  cropBoxY: number;
  width: number;
  height: number;
}

export interface CropOverlayProps {
  containerSize: Size;
  cropBoxX: number;
  cropBoxY: number;
  cropBoxSize: Size;
}

export interface CropHandlesProps {
  cropBoxX: number;
  cropBoxY: number;
  cropBoxSize: Size;
  cornerResponders: Record<CornerType, {panHandlers: object}>;
}
