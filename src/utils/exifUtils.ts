import {readAsync} from '@lodev09/react-native-exify';
import type {ParsedExifData} from '../types';

const formatExposureTime = (exposureTime?: number) => {
  if (!exposureTime) {
    return undefined;
  }
  if (exposureTime >= 1) {
    return `${exposureTime}`;
  }
  if (exposureTime > 0) {
    return `1/${Math.round(1 / exposureTime)}`;
  }
  return undefined;
};

const formatExifDate = (dateString?: string) => {
  if (!dateString) {
    return undefined;
  }
  try {
    return dateString
      .replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1/$2/$3')
      .substring(0, 16);
  } catch {
    return dateString;
  }
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const toString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const getIsoValue = (value: unknown): string | number | undefined => {
  if (Array.isArray(value)) {
    return getIsoValue(value[0]);
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  return undefined;
};

export const normalizeCameraModel = (model: string): string =>
  model
    .replace(/([A-Za-z])\s+(\d)/g, '$1$2')
    .replace(/(\d)\s+([A-Za-z])/g, '$1$2')
    .trim();

export const buildExifParams = (
  exif?: ParsedExifData,
): string | undefined => {
  if (!exif) {
    return undefined;
  }
  const parts: string[] = [];
  if (exif.FNumber) {
    parts.push(`F${exif.FNumber}`);
  }
  if (exif.ExposureTime) {
    parts.push(`${exif.ExposureTime}s`);
  }
  if (exif.ISO !== undefined && exif.ISO !== null) {
    const isoValue = String(exif.ISO).trim();
    if (isoValue.length > 0) {
      parts.push(`ISO${isoValue}`);
    }
  }
  return parts.length > 0 ? parts.join(' ') : undefined;
};

export async function parseExif(uri: string): Promise<ParsedExifData> {
  const exif = (await readAsync(uri)) as Record<string, unknown>;

  const fNumberValue = toNumber(exif.FNumber);
  const exposureValue = toNumber(exif.ExposureTime);
  const isoValue = getIsoValue(exif.ISOSpeedRatings ?? exif.ISO);
  const dateValue =
    toString(exif.DateTimeOriginal) ??
    toString(exif.DateTimeDigitized) ??
    toString(exif.DateTime);

  return {
    Make: toString(exif.Make),
    Model: toString(exif.Model),
    LensModel:
      toString(exif.LensModel) ||
      toString(exif.LensSpecification) ||
      toString(exif.LensInfo) ||
      '未知镜头',
    FNumber:
      typeof fNumberValue === 'number'
        ? fNumberValue.toFixed(1).replace(/\.0$/, '')
        : undefined,
    ExposureTime: formatExposureTime(exposureValue),
    ISO: isoValue,
    DateTime: formatExifDate(dateValue),
    _raw: exif,
  };
}
