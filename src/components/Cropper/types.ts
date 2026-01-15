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
