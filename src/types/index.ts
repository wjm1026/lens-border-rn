export interface LineStyle {
  fontId: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  opacity: number;
}

export type AspectRatio = 'original' | 'square' | 'portrait' | 'landscape';
export type CropAspectId = 'free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export interface CropRect {
  x: number; // 0-1 (normalized)
  y: number; // 0-1
  width: number; // 0-1
  height: number; // 0-1
}

export interface FrameSettings {
  // 布局
  padding: number;
  aspectRatio: AspectRatio;

  // 边框
  borderRadius: number;
  shadowSize: number;
  shadowOpacity: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;

  // 背景
  backgroundType: 'color' | 'gradient' | 'blur';
  backgroundGradient: string;
  gradientStartColor: string;
  gradientEndColor: string;
  gradientAngle: number;
  backgroundBrightness: number;
  blurAmount: number;

  // 信息
  showExif: boolean;
  textColor: string;
  fontFamily: string;
  infoPosition: 'bottom' | 'side' | 'overlay';
  infoLayout: 'classic' | 'centered';
  infoPadding: number;
  infoGap: number;
  infoOffset: {x: number; y: number};

  // 样式配置
  line1Style: LineStyle;
  line2Style: LineStyle;

  customExif: {
    model?: string;
    lens?: string;
    params?: string;
    date?: string;
  };
  selectedCameraPresetId?: string | null;

  // 导出
  exportFormat: 'png' | 'jpeg';
  exportQuality: number;
  exportScale: number; // 1-4x，导出分辨率倍数
}

export interface ParsedExifData {
  Make?: string;
  Model?: string;
  LensModel?: string;
  FNumber?: string;
  ExposureTime?: string;
  ISO?: number | string;
  DateTime?: string;
  _raw?: unknown;
}
