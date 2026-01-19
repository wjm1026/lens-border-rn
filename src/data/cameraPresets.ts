/**
 * @deprecated 此文件已废弃，请使用 './index' 导入
 * 保留此文件仅为向后兼容，后续版本将移除
 */

// 重新导出所有内容以保持向后兼容
export * from './index';

// 显式导出常用项
export {
  CAMERA_BRANDS,
  BRAND_LOGOS,
  getAllCameraPresets,
  getCameraPresetById,
  searchCameraPresets,
  getBrandByPresetId,
} from './index';

export type {CameraPreset, CameraBrand, BrandId} from './index';
