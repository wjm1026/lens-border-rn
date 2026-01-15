import type {AspectRatio, CropAspectId, FrameSettings} from '../types';

type Option<T> = {
  id: T;
  label: string;
};

export const ASPECT_RATIO_OPTIONS: ReadonlyArray<Option<AspectRatio>> = [
  {id: 'original', label: '适应'},
  {id: 'square', label: '1:1'},
  {id: 'portrait', label: '3:4'},
  {id: 'landscape', label: '4:3'},
];

export const CROP_ASPECT_OPTIONS: ReadonlyArray<Option<CropAspectId>> = [
  {id: 'free', label: '自由'},
  {id: '1:1', label: '1:1'},
  {id: '4:3', label: '4:3'},
  {id: '3:4', label: '3:4'},
  {id: '16:9', label: '16:9'},
  {id: '9:16', label: '9:16'},
];

export const INFO_LAYOUT_OPTIONS: ReadonlyArray<
  Option<FrameSettings['infoLayout']>
> = [
  {id: 'centered', label: '居中双行'},
  {id: 'classic', label: '经典左右'},
];

export const BACKGROUND_TYPES: ReadonlyArray<
  Option<FrameSettings['backgroundType']>
> = [
  {id: 'color', label: '纯色'},
  {id: 'gradient', label: '渐变'},
  {id: 'blur', label: '模糊'},
];

export const EXPORT_FORMAT_OPTIONS: ReadonlyArray<
  Option<FrameSettings['exportFormat']>
> = [
  {id: 'jpeg', label: 'JPEG'},
  {id: 'png', label: 'PNG'},
];

export const EXPORT_SCALE_OPTIONS: ReadonlyArray<Option<number>> = [
  {id: 1, label: '1x'},
  {id: 2, label: '2x'},
  {id: 3, label: '3x'},
  {id: 4, label: '4x'},
];

export const BORDER_COLORS = [
  '#FFFFFF',
  '#000000',
  '#F5F5F5',
  '#D1D5DB',
  '#9CA3AF',
  '#4B5563',
  '#FBBF24',
  '#93C5FD',
] as const;

export const BACKGROUND_COLORS = [
  '#FFFFFF',
  '#F5F5F5',
  '#E5E7EB',
  '#CBD5E1',
  '#9CA3AF',
  '#6B7280',
  '#111827',
  '#000000',
  '#FBBF24',
  '#F472B6',
  '#60A5FA',
  '#34D399',
] as const;

export const PRESET_GRADIENTS = [
  {start: '#4facfe', end: '#00f2fe'},
  {start: '#a18cd1', end: '#fbc2eb'},
  {start: '#ff9a9e', end: '#fecfef'},
  {start: '#fbc2eb', end: '#a6c1ee'},
  {start: '#667eea', end: '#764ba2'},
  {start: '#f093fb', end: '#f5576c'},
  {start: '#4facfe', end: '#84fab0'},
  {start: '#fa709a', end: '#fee140'},
  {start: '#30cfd0', end: '#330867'},
  {start: '#f8b500', end: '#ff6b6b'},
  {start: '#000000', end: '#434343'},
  {start: '#ece9e6', end: '#ffffff'},
] as const;
