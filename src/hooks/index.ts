/**
 * 自定义 Hooks 统一导出
 *
 * 按功能分组：
 * - 状态管理: Frame/Crop/Editor 设置状态
 * - 图片处理: 图片选择、宽高比计算
 * - 导出功能: 导出设置、工作流、保存
 * - UI 辅助: 相机选择器、菜单定位
 */

// ============ 状态管理 ============

/** 裁切控制状态 */
export {useCropControls} from './useCropControls';

/** 编辑器面板状态（Tab 切换、面板展开） */
export {useEditorPanelState} from './useEditorPanelState';

/** 帧设置状态（边框、背景、信息等） */
export {useFrameSettings} from './useFrameSettings';

/** 初始帧设置（从 EXIF 初始化） */
export {useInitialFrameSettings} from './useInitialFrameSettings';

// ============ 图片处理 ============

/** 图片选择器 */
export {useImagePicker} from './useImagePicker';

/** 图片宽高比计算 */
export {useImageAspectRatio} from './useImageAspectRatio';

/** 预览区域宽高比计算 */
export {usePreviewAspectRatio} from './usePreviewAspectRatio';

// ============ 导出功能 ============

/** 导出设置提取 */
export {useExportSettings} from './useExportSettings';

/** 导出工作流（高分辨率渲染） */
export {useExportWorkflow} from './useExportWorkflow';

/** 保存到相册 */
export {useSaveToCameraRoll} from './useSaveToCameraRoll';

/** 缩放设置计算 */
export {useScaledSettings} from './useScaledSettings';

// ============ UI 辅助 ============

/** 相机选择器状态 */
export {useCameraSelectorState} from './useCameraSelectorState';

/** 菜单位置计算 */
export {useMenuPosition} from './useMenuPosition';
export type {MenuPosition} from './useMenuPosition';
