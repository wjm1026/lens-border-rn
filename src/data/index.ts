/**
 * 相机数据模块统一入口
 * 整合品牌 Logo、相机型号和工具函数
 */

import {BRAND_LOGOS, type BrandId, type BrandLogoSet} from './brandLogos';
import {
  CAMERA_MODELS,
  BRAND_DISPLAY_NAMES,
  BRAND_ORDER,
  type CameraPreset,
} from './cameraModels';

// ============ 类型导出 ============

export type {BrandId, BrandLogoSet, CameraPreset};

/**
 * 完整的品牌信息（包含 Logo 和型号）
 */
export interface CameraBrand {
  id: BrandId;
  name: string;
  logo?: any;
  logoWhite?: any;
  logoBlack?: any;
  logoColor?: any;
  models: CameraPreset[];
}

// ============ 数据导出 ============

export {BRAND_LOGOS, CAMERA_MODELS, BRAND_DISPLAY_NAMES, BRAND_ORDER};

/**
 * 组装完整的品牌列表（带 Logo 和型号）
 * 使用 getter 实现惰性求值，避免模块加载时的性能开销
 */
let _cameraBrandsCache: CameraBrand[] | null = null;

export const CAMERA_BRANDS: CameraBrand[] = (() => {
  if (_cameraBrandsCache) {
    return _cameraBrandsCache;
  }

  _cameraBrandsCache = BRAND_ORDER
    .filter(id => CAMERA_MODELS[id].length > 0) // 过滤掉没有型号的品牌
    .map(id => ({
      id,
      name: BRAND_DISPLAY_NAMES[id],
      logo: BRAND_LOGOS[id]?.white,
      logoWhite: BRAND_LOGOS[id]?.white,
      logoBlack: BRAND_LOGOS[id]?.black,
      logoColor: BRAND_LOGOS[id]?.color,
      models: CAMERA_MODELS[id],
    }));

  return _cameraBrandsCache;
})();

// ============ 工具函数 ============

/**
 * 获取所有相机预设（扁平化列表）
 */
export const getAllCameraPresets = (): CameraPreset[] => {
  return CAMERA_BRANDS.flatMap(brand => brand.models);
};

/**
 * 根据 ID 获取相机预设
 */
export const getCameraPresetById = (id: string): CameraPreset | undefined => {
  for (const brand of CAMERA_BRANDS) {
    const preset = brand.models.find(m => m.id === id);
    if (preset) {
      return preset;
    }
  }
  return undefined;
};

/**
 * 搜索相机预设
 */
export const searchCameraPresets = (query: string): CameraPreset[] => {
  const lowerQuery = query.toLowerCase();
  return getAllCameraPresets().filter(
    preset =>
      preset.displayName.toLowerCase().includes(lowerQuery) ||
      preset.brand.toLowerCase().includes(lowerQuery) ||
      preset.model.toLowerCase().includes(lowerQuery),
  );
};

/**
 * 根据预设 ID 获取所属品牌
 */
export const getBrandByPresetId = (presetId: string): CameraBrand | undefined => {
  return CAMERA_BRANDS.find(brand =>
    brand.models.some(model => model.id === presetId),
  );
};

/**
 * 根据品牌 ID 获取品牌信息
 */
export const getBrandById = (brandId: BrandId): CameraBrand | undefined => {
  return CAMERA_BRANDS.find(brand => brand.id === brandId);
};

export const getBrandLogo = (
  brandId: BrandId,
  variant: 'white' | 'black' | 'color' = 'white',
): any => {
  return BRAND_LOGOS[brandId]?.[variant];
};

/**
 * 根据 EXIF 信息匹配相机预设
 * @param exifModel EXIF 中的 Model 字段（如 "NIKON D800E"）
 * @returns 匹配到的预设，如果没有匹配则返回 undefined
 */
export const matchPresetByExif = (exifModel?: string): CameraPreset | undefined => {
  if (!exifModel) {
    return undefined;
  }

  const normalizedExif = exifModel.toLowerCase().replace(/\s+/g, '');

  // 遍历所有预设，寻找匹配
  for (const preset of getAllCameraPresets()) {
    const normalizedPresetModel = preset.model.toLowerCase().replace(/\s+/g, '');
    const normalizedPresetBrandModel = `${preset.brand}${preset.model}`.toLowerCase().replace(/\s+/g, '');

    // 精确匹配或包含匹配
    if (
      normalizedExif === normalizedPresetModel ||
      normalizedExif === normalizedPresetBrandModel ||
      normalizedExif.includes(normalizedPresetModel) ||
      normalizedPresetModel.includes(normalizedExif)
    ) {
      return preset;
    }
  }

  return undefined;
};
