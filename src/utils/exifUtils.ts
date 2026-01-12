import { readAsync } from '@lodev09/react-native-exify';
import { type ParsedExifData } from '../types';

/**
 * 格式化快门速度 (1/50, 0.02 -> 1/50)
 */
function formatExposureTime(exposureTime?: number) {
  if (!exposureTime) return undefined;
  if (exposureTime >= 1) return `${exposureTime}`; // 长曝光比如 2s
  if (exposureTime > 0) return `1/${Math.round(1 / exposureTime)}`; // 比如 0.02 -> 1/50
  return undefined;
}

/**
 * 格式化日期 (YYYY:MM:DD HH:mm:ss -> YYYY/MM/DD HH:mm)
 */
function formatExifDate(dateString?: string) {
  if (!dateString) return undefined;
  // 许多相机EXIF日期格式是 "2023:01:01 12:00:00"，我们转成更通用的格式
  try {
     // 尝试简单正则替换
     return dateString.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1/$2/$3').substring(0, 16); 
  } catch {
    return dateString;
  }
}

/**
 * 解析图片的 EXIF 数据 (使用 @lodev09/react-native-exify)
 */
export async function parseExif(uri: string): Promise<ParsedExifData> {
  console.log('📸 [ExifUtils] 准备解析图片:', uri);

  try {
    // 1. 直接使用 readAsync 读取
    const exif = await readAsync(uri);
    console.log('✅ [ExifUtils] 解析结果:', exif);

    // 2. 增强格式化逻辑
    const formattedData: ParsedExifData = {
      Make: exif.Make as string | undefined,
      Model: exif.Model as string | undefined,
      LensModel: (exif.LensModel || exif.LensSpecification || exif.LensInfo || '未知镜头') as string,
      
      // 格式化数值
      FNumber: exif.FNumber ? Number(exif.FNumber).toFixed(1).replace(/\.0$/, '') : undefined, // f/1.80 -> 1.8
      ExposureTime: formatExposureTime(Number(exif.ExposureTime)), // 0.02 -> 1/50
      ISO: Array.isArray(exif.ISOSpeedRatings) ? exif.ISOSpeedRatings[0] : (exif.ISOSpeedRatings || exif.ISO),
      
      // 格式化时间
      DateTime: formatExifDate(exif.DateTimeOriginal || exif.DateTimeDigitized || exif.DateTime),
      
      _raw: exif, 
    };

    return formattedData;

  } catch (error) {
    console.error('❌ [ExifUtils] 解析失败:', error);
    throw error;
  }
}
