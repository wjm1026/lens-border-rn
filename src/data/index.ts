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
  isSquare?: boolean;
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
      isSquare: BRAND_LOGOS[id]?.isSquare,
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
  return undefined;
};

/**
 * 从文本内容中检测品牌
 * 用于当无法匹配特定型号预设时，尝试识别品牌Logo
 */
export const detectBrandFromContent = (content: string): CameraBrand | undefined => {
  if (!content) return undefined;
  
  const lowerContent = content.toLowerCase();
  
  // 遍历所有品牌进行模糊匹配
  // 注意：需要确保 CAMERA_BRANDS 包含了所有定义的品牌，即使该品牌目前没有预设型号
  // 目前 CAMERA_BRANDS只包含有 models 的品牌，如果 google 等只有 logo 没有 models，可能需要直接查 BRAND_LOGOS
  
  // 优先匹配 CAMERA_BRANDS (已有的完整品牌数据)
  for (const brand of CAMERA_BRANDS) {
    if (
      lowerContent.includes(brand.id.toLowerCase()) || 
      lowerContent.includes(brand.name.toLowerCase())
    ) {
      return brand;
    }
  }
  
  // 如果上面的没匹配到（因为filtered out empty models），尝试直接匹配 BRAND_LOGOS 中的 key
  // 这样即使暂时没有录入该品牌的具体型号，只要能识别出品牌名，也能显示 Logo
  for (const brandId of BRAND_ORDER) {
    const name = BRAND_DISPLAY_NAMES[brandId];
    if (
        lowerContent.includes(brandId.toLowerCase()) || 
        (name && lowerContent.includes(name.toLowerCase()))
    ) {
        // 构造一个临时的 CameraBrand 对象
        return {
            id: brandId,
            name: name || brandId,
            logo: BRAND_LOGOS[brandId]?.white,
            logoWhite: BRAND_LOGOS[brandId]?.white,
            logoBlack: BRAND_LOGOS[brandId]?.black,
            logoColor: BRAND_LOGOS[brandId]?.color,
            isSquare: BRAND_LOGOS[brandId]?.isSquare,
            models: []
        } as CameraBrand;
    }
  }

  return undefined;
};
