/**
 * InfoPanel 相关的自定义 Hook
 * 封装 InfoPanel 中的业务逻辑，使组件更纯粹
 */

import {useCallback} from 'react';
import type {FrameSettings, LineStyle, ParsedExifData} from '../../../types';
import type {CameraPreset} from '../../../data';
import {buildExifParams, normalizeCameraModel} from '../../../utils/exifUtils';

interface UseInfoPanelLogicOptions {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  patchSettings: (patch: Partial<FrameSettings>) => void;
  initialExif?: ParsedExifData;
}

/**
 * InfoPanel 业务逻辑 Hook
 * 处理自定义 EXIF、行样式更新、相机选择等逻辑
 */
export function useInfoPanelLogic({
  settings,
  updateSettings,
  patchSettings,
  initialExif,
}: UseInfoPanelLogicOptions) {
  /**
   * 更新自定义 EXIF 字段
   */
  const updateCustomExif = useCallback(
    (key: keyof FrameSettings['customExif'], value: string) => {
      updateSettings('customExif', {...settings.customExif, [key]: value});
    },
    [settings.customExif, updateSettings],
  );

  /**
   * 更新行样式（line1Style 或 line2Style）
   */
  const updateLineStyle = useCallback(
    (target: 'line1Style' | 'line2Style', patch: Partial<LineStyle>) => {
      const next = {...settings[target], ...patch};
      updateSettings(target, next);
    },
    [settings, updateSettings],
  );

  /**
   * 处理相机预设选择
   */
  const handleCameraSelect = useCallback(
    (preset: CameraPreset | null) => {
      if (preset) {
        // 应用预设
        patchSettings({
          selectedCameraPresetId: preset.id,
          customExif: {
            ...settings.customExif,
            model: normalizeCameraModel(preset.model),
            lens: preset.defaultLens || settings.customExif.lens,
          },
        });
        return;
      }

      // 恢复到原始 EXIF 数据
      patchSettings({
        selectedCameraPresetId: null,
        customExif: {
          ...settings.customExif,
          model: initialExif?.Model,
          lens: initialExif?.LensModel,
          params: buildExifParams(initialExif),
          date: initialExif?.DateTime,
        },
      });
    },
    [patchSettings, settings.customExif, initialExif],
  );

  /**
   * 从 initialExif 生成相机显示名称
   */
  const exifCameraName =
    initialExif?.Make || initialExif?.Model
      ? `${initialExif.Make || ''} ${initialExif.Model || ''}`.trim()
      : undefined;

  return {
    updateCustomExif,
    updateLineStyle,
    handleCameraSelect,
    exifCameraName,
  };
}
