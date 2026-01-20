/**
 * 相机型号数据
 * 按品牌组织的相机型号列表
 */

import type {BrandId} from './brandLogos';

export interface CameraPreset {
  id: string;
  brand: string;
  model: string;
  modelOnly: string; // 仅型号名称，不含品牌（如 "Z8" 而不是 "NIKON Z8"）
  displayName: string;
  defaultLens?: string;
}

/**
 * 各品牌相机型号数据
 * 类型安全的品牌ID到型号列表的映射
 */
export const CAMERA_MODELS: Record<BrandId, CameraPreset[]> = {
  nikon: [
    {id: 'nikon-z9', brand: 'NIKON CORPORATION', model: 'NIKON Z9', modelOnly: 'Z9', displayName: 'Nikon Z9', defaultLens: 'NIKKOR Z 24-70mm F2.8 S'},
    {id: 'nikon-z8', brand: 'NIKON CORPORATION', model: 'NIKON Z8', modelOnly: 'Z8', displayName: 'Nikon Z8', defaultLens: 'NIKKOR Z 24-70mm F2.8 S'},
    {id: 'nikon-z7ii', brand: 'NIKON CORPORATION', model: 'NIKON Z7II', modelOnly: 'Z7II', displayName: 'Nikon Z7 II', defaultLens: 'NIKKOR Z 24-70mm F4 S'},
    {id: 'nikon-z6iii', brand: 'NIKON CORPORATION', model: 'NIKON Z6III', modelOnly: 'Z6III', displayName: 'Nikon Z6 III', defaultLens: 'NIKKOR Z 24-120mm F4 S'},
    {id: 'nikon-z6ii', brand: 'NIKON CORPORATION', model: 'NIKON Z6II', modelOnly: 'Z6II', displayName: 'Nikon Z6 II', defaultLens: 'NIKKOR Z 24-70mm F4 S'},
    {id: 'nikon-zf', brand: 'NIKON CORPORATION', model: 'NIKON Zf', modelOnly: 'Zf', displayName: 'Nikon Zf', defaultLens: 'NIKKOR Z 40mm F2'},
    {id: 'nikon-z5', brand: 'NIKON CORPORATION', model: 'NIKON Z5', modelOnly: 'Z5', displayName: 'Nikon Z5', defaultLens: 'NIKKOR Z 24-50mm F4-6.3'},
    {id: 'nikon-zfc', brand: 'NIKON CORPORATION', model: 'NIKON Zfc', modelOnly: 'Zfc', displayName: 'Nikon Z fc', defaultLens: 'NIKKOR Z DX 16-50mm F3.5-6.3 VR'},
    {id: 'nikon-z50', brand: 'NIKON CORPORATION', model: 'NIKON Z50', modelOnly: 'Z50', displayName: 'Nikon Z50', defaultLens: 'NIKKOR Z DX 16-50mm F3.5-6.3 VR'},
    {id: 'nikon-d850', brand: 'NIKON CORPORATION', model: 'NIKON D850', modelOnly: 'D850', displayName: 'Nikon D850', defaultLens: 'AF-S NIKKOR 24-70mm F2.8E ED VR'},
    {id: 'nikon-d800e', brand: 'NIKON CORPORATION', model: 'NIKON D800E', modelOnly: 'D800E', displayName: 'Nikon D800E', defaultLens: 'AF-S NIKKOR 24-70mm F2.8G ED'},
    {id: 'nikon-d800', brand: 'NIKON CORPORATION', model: 'NIKON D800', modelOnly: 'D800', displayName: 'Nikon D800', defaultLens: 'AF-S NIKKOR 24-70mm F2.8G ED'},
    {id: 'nikon-d780', brand: 'NIKON CORPORATION', model: 'NIKON D780', modelOnly: 'D780', displayName: 'Nikon D780', defaultLens: 'AF-S NIKKOR 24-120mm F4G ED VR'},
    {id: 'nikon-d7500', brand: 'NIKON CORPORATION', model: 'NIKON D7500', modelOnly: 'D7500', displayName: 'Nikon D7500', defaultLens: 'AF-S DX NIKKOR 18-140mm F3.5-5.6G ED VR'},
  ],
  canon: [
    {id: 'canon-r1', brand: 'Canon', model: 'Canon EOS R1', modelOnly: 'EOS R1', displayName: 'Canon EOS R1', defaultLens: 'RF 24-70mm F2.8 L IS USM'},
    {id: 'canon-r5ii', brand: 'Canon', model: 'Canon EOS R5 Mark II', modelOnly: 'EOS R5 II', displayName: 'Canon EOS R5 II', defaultLens: 'RF 24-70mm F2.8 L IS USM'},
    {id: 'canon-r5', brand: 'Canon', model: 'Canon EOS R5', modelOnly: 'EOS R5', displayName: 'Canon EOS R5', defaultLens: 'RF 24-70mm F2.8 L IS USM'},
    {id: 'canon-r6ii', brand: 'Canon', model: 'Canon EOS R6 Mark II', modelOnly: 'EOS R6 II', displayName: 'Canon EOS R6 II', defaultLens: 'RF 24-105mm F4 L IS USM'},
    {id: 'canon-r6', brand: 'Canon', model: 'Canon EOS R6', modelOnly: 'EOS R6', displayName: 'Canon EOS R6', defaultLens: 'RF 24-105mm F4 L IS USM'},
    {id: 'canon-r8', brand: 'Canon', model: 'Canon EOS R8', modelOnly: 'EOS R8', displayName: 'Canon EOS R8', defaultLens: 'RF 24-50mm F4.5-6.3 IS STM'},
    {id: 'canon-r7', brand: 'Canon', model: 'Canon EOS R7', modelOnly: 'EOS R7', displayName: 'Canon EOS R7', defaultLens: 'RF-S 18-150mm F3.5-6.3 IS STM'},
    {id: 'canon-r10', brand: 'Canon', model: 'Canon EOS R10', modelOnly: 'EOS R10', displayName: 'Canon EOS R10', defaultLens: 'RF-S 18-45mm F4.5-6.3 IS STM'},
    {id: 'canon-r50', brand: 'Canon', model: 'Canon EOS R50', modelOnly: 'EOS R50', displayName: 'Canon EOS R50', defaultLens: 'RF-S 18-45mm F4.5-6.3 IS STM'},
    {id: 'canon-5div', brand: 'Canon', model: 'Canon EOS 5D Mark IV', modelOnly: 'EOS 5D IV', displayName: 'Canon EOS 5D IV', defaultLens: 'EF 24-70mm F2.8L II USM'},
    {id: 'canon-6dii', brand: 'Canon', model: 'Canon EOS 6D Mark II', modelOnly: 'EOS 6D II', displayName: 'Canon EOS 6D II', defaultLens: 'EF 24-105mm F4L IS II USM'},
    {id: 'canon-90d', brand: 'Canon', model: 'Canon EOS 90D', modelOnly: 'EOS 90D', displayName: 'Canon EOS 90D', defaultLens: 'EF-S 18-135mm F3.5-5.6 IS USM'},
  ],
  sony: [
    {id: 'sony-a1', brand: 'SONY', model: 'ILCE-1', modelOnly: 'A1', displayName: 'Sony A1', defaultLens: 'FE 24-70mm F2.8 GM II'},
    {id: 'sony-a9iii', brand: 'SONY', model: 'ILCE-9M3', modelOnly: 'A9 III', displayName: 'Sony A9 III', defaultLens: 'FE 24-70mm F2.8 GM II'},
    {id: 'sony-a7rv', brand: 'SONY', model: 'ILCE-7RM5', modelOnly: 'A7R V', displayName: 'Sony A7R V', defaultLens: 'FE 24-70mm F2.8 GM II'},
    {id: 'sony-a7riv', brand: 'SONY', model: 'ILCE-7RM4', modelOnly: 'A7R IV', displayName: 'Sony A7R IV', defaultLens: 'FE 24-70mm F2.8 GM'},
    {id: 'sony-a7iv', brand: 'SONY', model: 'ILCE-7M4', modelOnly: 'A7 IV', displayName: 'Sony A7 IV', defaultLens: 'FE 24-105mm F4 G OSS'},
    {id: 'sony-a7cii', brand: 'SONY', model: 'ILCE-7CM2', modelOnly: 'A7C II', displayName: 'Sony A7C II', defaultLens: 'FE 28-60mm F4-5.6'},
    {id: 'sony-a7c', brand: 'SONY', model: 'ILCE-7C', modelOnly: 'A7C', displayName: 'Sony A7C', defaultLens: 'FE 28-60mm F4-5.6'},
    {id: 'sony-a6700', brand: 'SONY', model: 'ILCE-6700', modelOnly: 'A6700', displayName: 'Sony A6700', defaultLens: 'E 16-55mm F2.8 G'},
    {id: 'sony-a6600', brand: 'SONY', model: 'ILCE-6600', modelOnly: 'A6600', displayName: 'Sony A6600', defaultLens: 'E 18-135mm F3.5-5.6 OSS'},
    {id: 'sony-a6400', brand: 'SONY', model: 'ILCE-6400', modelOnly: 'A6400', displayName: 'Sony A6400', defaultLens: 'E 18-135mm F3.5-5.6 OSS'},
    {id: 'sony-zve1', brand: 'SONY', model: 'ZV-E1', modelOnly: 'ZV-E1', displayName: 'Sony ZV-E1', defaultLens: 'FE 28-60mm F4-5.6'},
    {id: 'sony-zve10', brand: 'SONY', model: 'ZV-E10', modelOnly: 'ZV-E10', displayName: 'Sony ZV-E10', defaultLens: 'E PZ 16-50mm F3.5-5.6 OSS'},
  ],
  fujifilm: [
    {id: 'fuji-gfx100ii', brand: 'FUJIFILM', model: 'GFX100 II', modelOnly: 'GFX100 II', displayName: 'Fujifilm GFX100 II', defaultLens: 'GF 32-64mm F4 R LM WR'},
    {id: 'fuji-gfx100s', brand: 'FUJIFILM', model: 'GFX100S', modelOnly: 'GFX100S', displayName: 'Fujifilm GFX100S', defaultLens: 'GF 32-64mm F4 R LM WR'},
    {id: 'fuji-xh2s', brand: 'FUJIFILM', model: 'X-H2S', modelOnly: 'X-H2S', displayName: 'Fujifilm X-H2S', defaultLens: 'XF 18-120mm F4 LM PZ WR'},
    {id: 'fuji-xh2', brand: 'FUJIFILM', model: 'X-H2', modelOnly: 'X-H2', displayName: 'Fujifilm X-H2', defaultLens: 'XF 16-80mm F4 R OIS WR'},
    {id: 'fuji-xt5', brand: 'FUJIFILM', model: 'X-T5', modelOnly: 'X-T5', displayName: 'Fujifilm X-T5', defaultLens: 'XF 18-55mm F2.8-4 R LM OIS'},
    {id: 'fuji-xt4', brand: 'FUJIFILM', model: 'X-T4', modelOnly: 'X-T4', displayName: 'Fujifilm X-T4', defaultLens: 'XF 18-55mm F2.8-4 R LM OIS'},
    {id: 'fuji-xt30ii', brand: 'FUJIFILM', model: 'X-T30 II', modelOnly: 'X-T30 II', displayName: 'Fujifilm X-T30 II', defaultLens: 'XF 18-55mm F2.8-4 R LM OIS'},
    {id: 'fuji-xs20', brand: 'FUJIFILM', model: 'X-S20', modelOnly: 'X-S20', displayName: 'Fujifilm X-S20', defaultLens: 'XF 18-55mm F2.8-4 R LM OIS'},
    {id: 'fuji-xs10', brand: 'FUJIFILM', model: 'X-S10', modelOnly: 'X-S10', displayName: 'Fujifilm X-S10', defaultLens: 'XF 18-55mm F2.8-4 R LM OIS'},
    {id: 'fuji-xpro3', brand: 'FUJIFILM', model: 'X-Pro3', modelOnly: 'X-Pro3', displayName: 'Fujifilm X-Pro3', defaultLens: 'XF 23mm F2 R WR'},
    {id: 'fuji-x100vi', brand: 'FUJIFILM', model: 'X100VI', modelOnly: 'X100VI', displayName: 'Fujifilm X100VI', defaultLens: '23mm F2'},
    {id: 'fuji-x100v', brand: 'FUJIFILM', model: 'X100V', modelOnly: 'X100V', displayName: 'Fujifilm X100V', defaultLens: '23mm F2'},
  ],
  panasonic: [
    {id: 'pana-s1h', brand: 'Panasonic', model: 'DC-S1H', modelOnly: 'S1H', displayName: 'Panasonic S1H', defaultLens: 'LUMIX S 24-70mm F2.8'},
    {id: 'pana-s1r', brand: 'Panasonic', model: 'DC-S1R', modelOnly: 'S1R', displayName: 'Panasonic S1R', defaultLens: 'LUMIX S 24-70mm F2.8'},
    {id: 'pana-s1', brand: 'Panasonic', model: 'DC-S1', modelOnly: 'S1', displayName: 'Panasonic S1', defaultLens: 'LUMIX S 24-105mm F4'},
    {id: 'pana-s5ii', brand: 'Panasonic', model: 'DC-S5M2', modelOnly: 'S5 II', displayName: 'Panasonic S5 II', defaultLens: 'LUMIX S 20-60mm F3.5-5.6'},
    {id: 'pana-s5', brand: 'Panasonic', model: 'DC-S5', modelOnly: 'S5', displayName: 'Panasonic S5', defaultLens: 'LUMIX S 20-60mm F3.5-5.6'},
    {id: 'pana-gh6', brand: 'Panasonic', model: 'DC-GH6', modelOnly: 'GH6', displayName: 'Panasonic GH6', defaultLens: 'LEICA DG 12-60mm F2.8-4.0'},
    {id: 'pana-gh5ii', brand: 'Panasonic', model: 'DC-GH5M2', modelOnly: 'GH5 II', displayName: 'Panasonic GH5 II', defaultLens: 'LEICA DG 12-60mm F2.8-4.0'},
    {id: 'pana-g9ii', brand: 'Panasonic', model: 'DC-G9M2', modelOnly: 'G9 II', displayName: 'Panasonic G9 II', defaultLens: 'LEICA DG 12-60mm F2.8-4.0'},
  ],
  leica: [
    {id: 'leica-sl3', brand: 'LEICA CAMERA AG', model: 'LEICA SL3', modelOnly: 'SL3', displayName: 'Leica SL3', defaultLens: 'VARIO-ELMARIT-SL 24-70 F2.8 ASPH.'},
    {id: 'leica-sl2s', brand: 'LEICA CAMERA AG', model: 'LEICA SL2-S', modelOnly: 'SL2-S', displayName: 'Leica SL2-S', defaultLens: 'VARIO-ELMARIT-SL 24-70 F2.8 ASPH.'},
    {id: 'leica-sl2', brand: 'LEICA CAMERA AG', model: 'LEICA SL2', modelOnly: 'SL2', displayName: 'Leica SL2', defaultLens: 'VARIO-ELMARIT-SL 24-90 F2.8-4 ASPH.'},
    {id: 'leica-m11', brand: 'LEICA CAMERA AG', model: 'LEICA M11', modelOnly: 'M11', displayName: 'Leica M11', defaultLens: 'SUMMILUX-M 50 F1.4 ASPH.'},
    {id: 'leica-m11p', brand: 'LEICA CAMERA AG', model: 'LEICA M11-P', modelOnly: 'M11-P', displayName: 'Leica M11-P', defaultLens: 'SUMMILUX-M 35 F1.4 ASPH.'},
    {id: 'leica-m10r', brand: 'LEICA CAMERA AG', model: 'LEICA M10-R', modelOnly: 'M10-R', displayName: 'Leica M10-R', defaultLens: 'SUMMICRON-M 35 F2 ASPH.'},
    {id: 'leica-q3', brand: 'LEICA CAMERA AG', model: 'LEICA Q3', modelOnly: 'Q3', displayName: 'Leica Q3', defaultLens: 'SUMMILUX 28 F1.7 ASPH.'},
    {id: 'leica-q2', brand: 'LEICA CAMERA AG', model: 'LEICA Q2', modelOnly: 'Q2', displayName: 'Leica Q2', defaultLens: 'SUMMILUX 28 F1.7 ASPH.'},
  ],
  hasselblad: [
    {id: 'hass-x2d', brand: 'Hasselblad', model: 'X2D 100C', modelOnly: 'X2D 100C', displayName: 'Hasselblad X2D 100C', defaultLens: 'XCD 55V'},
    {id: 'hass-x1dii', brand: 'Hasselblad', model: 'X1D II 50C', modelOnly: 'X1D II', displayName: 'Hasselblad X1D II', defaultLens: 'XCD 45P'},
    {id: 'hass-907x', brand: 'Hasselblad', model: '907X 50C', modelOnly: '907X', displayName: 'Hasselblad 907X', defaultLens: 'XCD 30'},
    {id: 'hass-h6d100c', brand: 'Hasselblad', model: 'H6D-100c', modelOnly: 'H6D-100c', displayName: 'Hasselblad H6D-100c', defaultLens: 'HC 80mm F2.8'},
  ],
  dji: [
    {id: 'dji-mavic3pro', brand: 'DJI', model: 'Mavic 3 Pro', modelOnly: 'Mavic 3 Pro', displayName: 'DJI Mavic 3 Pro', defaultLens: 'Hasselblad L2D-20c'},
    {id: 'dji-mavic3', brand: 'DJI', model: 'Mavic 3', modelOnly: 'Mavic 3', displayName: 'DJI Mavic 3', defaultLens: 'Hasselblad L2D-20c'},
    {id: 'dji-air3', brand: 'DJI', model: 'Air 3', modelOnly: 'Air 3', displayName: 'DJI Air 3', defaultLens: '24mm & 70mm Dual Camera'},
    {id: 'dji-mini4pro', brand: 'DJI', model: 'Mini 4 Pro', modelOnly: 'Mini 4 Pro', displayName: 'DJI Mini 4 Pro', defaultLens: '24mm F1.7'},
    {id: 'dji-pocket3', brand: 'DJI', model: 'Osmo Pocket 3', modelOnly: 'Pocket 3', displayName: 'DJI Osmo Pocket 3', defaultLens: '20mm F2.0'},
  ],
  apple: [
    {id: 'apple-iphone15promax', brand: 'Apple', model: 'iPhone 15 Pro Max', modelOnly: 'iPhone 15 Pro Max', displayName: 'iPhone 15 Pro Max', defaultLens: '24mm F1.78 Main'},
    {id: 'apple-iphone15pro', brand: 'Apple', model: 'iPhone 15 Pro', modelOnly: 'iPhone 15 Pro', displayName: 'iPhone 15 Pro', defaultLens: '24mm F1.78 Main'},
    {id: 'apple-iphone14promax', brand: 'Apple', model: 'iPhone 14 Pro Max', modelOnly: 'iPhone 14 Pro Max', displayName: 'iPhone 14 Pro Max', defaultLens: '24mm F1.78 Main'},
    {id: 'apple-iphone14pro', brand: 'Apple', model: 'iPhone 14 Pro', modelOnly: 'iPhone 14 Pro', displayName: 'iPhone 14 Pro', defaultLens: '24mm F1.78 Main'},
    {id: 'apple-iphone13pro', brand: 'Apple', model: 'iPhone 13 Pro', modelOnly: 'iPhone 13 Pro', displayName: 'iPhone 13 Pro', defaultLens: '26mm F1.5 Main'},
  ],
  samsung: [
    {id: 'samsung-s24ultra', brand: 'Samsung', model: 'Galaxy S24 Ultra', modelOnly: 'Galaxy S24 Ultra', displayName: 'Samsung Galaxy S24 Ultra', defaultLens: '200MP Main Camera'},
    {id: 'samsung-s23ultra', brand: 'Samsung', model: 'Galaxy S23 Ultra', modelOnly: 'Galaxy S23 Ultra', displayName: 'Samsung Galaxy S23 Ultra', defaultLens: '200MP Main Camera'},
    {id: 'samsung-s22ultra', brand: 'Samsung', model: 'Galaxy S22 Ultra', modelOnly: 'Galaxy S22 Ultra', displayName: 'Samsung Galaxy S22 Ultra', defaultLens: '108MP Main Camera'},
  ],
  xiaomi: [
    {id: 'xiaomi-14ultra', brand: 'Xiaomi', model: 'Xiaomi 14 Ultra', modelOnly: '14 Ultra', displayName: 'Xiaomi 14 Ultra', defaultLens: 'Leica Summilux Lens'},
    {id: 'xiaomi-13ultra', brand: 'Xiaomi', model: 'Xiaomi 13 Ultra', modelOnly: '13 Ultra', displayName: 'Xiaomi 13 Ultra', defaultLens: 'Leica Vario-Summicron'},
    {id: 'xiaomi-12sultra', brand: 'Xiaomi', model: 'Xiaomi 12S Ultra', modelOnly: '12S Ultra', displayName: 'Xiaomi 12S Ultra', defaultLens: 'Leica Vario-Summicron'},
  ],
  huawei: [
    {id: 'huawei-p60pro', brand: 'HUAWEI', model: 'P60 Pro', modelOnly: 'P60 Pro', displayName: 'Huawei P60 Pro', defaultLens: 'XMAGE Camera'},
    {id: 'huawei-mate60pro', brand: 'HUAWEI', model: 'Mate 60 Pro', modelOnly: 'Mate 60 Pro', displayName: 'Huawei Mate 60 Pro', defaultLens: 'XMAGE Camera'},
    {id: 'huawei-p50pro', brand: 'HUAWEI', model: 'P50 Pro', modelOnly: 'P50 Pro', displayName: 'Huawei P50 Pro', defaultLens: 'Dual-Matrix Camera'},
  ],
  oppo: [
    {id: 'oppo-findx7ultra', brand: 'OPPO', model: 'Find X7 Ultra', modelOnly: 'Find X7 Ultra', displayName: 'OPPO Find X7 Ultra', defaultLens: 'Hasselblad Master Camera'},
    {id: 'oppo-findx6pro', brand: 'OPPO', model: 'Find X6 Pro', modelOnly: 'Find X6 Pro', displayName: 'OPPO Find X6 Pro', defaultLens: 'Hasselblad Camera'},
    {id: 'oppo-findn3', brand: 'OPPO', model: 'Find N3', modelOnly: 'Find N3', displayName: 'OPPO Find N3', defaultLens: 'Hasselblad Camera'},
  ],
  vivo: [
    {id: 'vivo-x100ultra', brand: 'vivo', model: 'X100 Ultra', modelOnly: 'X100 Ultra', displayName: 'Vivo X100 Ultra', defaultLens: 'ZEISS Vario-Apo-Sonnar'},
    {id: 'vivo-x100pro', brand: 'vivo', model: 'X100 Pro', modelOnly: 'X100 Pro', displayName: 'Vivo X100 Pro', defaultLens: 'ZEISS Vario-Summicron'},
    {id: 'vivo-xfold3pro', brand: 'vivo', model: 'X Fold3 Pro', modelOnly: 'X Fold3 Pro', displayName: 'Vivo X Fold3 Pro', defaultLens: 'ZEISS Vario-Tessar'},
  ],
  oneplus: [
    {id: 'oneplus-12', brand: 'OnePlus', model: 'OnePlus 12', modelOnly: '12', displayName: 'OnePlus 12', defaultLens: 'Hasselblad Camera for Mobile'},
    {id: 'oneplus-11', brand: 'OnePlus', model: 'OnePlus 11', modelOnly: '11', displayName: 'OnePlus 11', defaultLens: 'Hasselblad Camera for Mobile'},
    {id: 'oneplus-open', brand: 'OnePlus', model: 'OnePlus Open', modelOnly: 'Open', displayName: 'OnePlus Open', defaultLens: 'Hasselblad Camera for Mobile'},
  ],
  honor: [
    {id: 'honor-magic6pro', brand: 'HONOR', model: 'Magic6 Pro', modelOnly: 'Magic6 Pro', displayName: 'Honor Magic6 Pro', defaultLens: 'Falcon Camera'},
    {id: 'honor-magic5pro', brand: 'HONOR', model: 'Magic5 Pro', modelOnly: 'Magic5 Pro', displayName: 'Honor Magic5 Pro', defaultLens: 'Falcon Camera'},
  ],
  realme: [
    {id: 'realme-gt5pro', brand: 'realme', model: 'GT5 Pro', modelOnly: 'GT5 Pro', displayName: 'Realme GT5 Pro', defaultLens: 'Sony LYT-808 Main Camera'},
    {id: 'realme-12proplus', brand: 'realme', model: '12 Pro+', modelOnly: '12 Pro+', displayName: 'Realme 12 Pro+', defaultLens: 'OmniVision OV64B Periscope'},
  ],
  meizu: [
    {id: 'meizu-21pro', brand: 'Meizu', model: 'Meizu 21 Pro', modelOnly: '21 Pro', displayName: 'Meizu 21 Pro', defaultLens: 'Ultra-sensitive Main Camera'},
    {id: 'meizu-20pro', brand: 'Meizu', model: 'Meizu 20 Pro', modelOnly: '20 Pro', displayName: 'Meizu 20 Pro', defaultLens: '50MP Triple Camera'},
  ],
  iqoo: [
    {id: 'iqoo-12pro', brand: 'iQOO', model: 'iQOO 12 Pro', modelOnly: '12 Pro', displayName: 'iQOO 12 Pro', defaultLens: 'Ultra-Sensing Main Camera'},
    {id: 'iqoo-neo9pro', brand: 'iQOO', model: 'iQOO Neo9 Pro', modelOnly: 'Neo9 Pro', displayName: 'iQOO Neo9 Pro', defaultLens: 'VCS IMX920 Camera'},
  ],
  gopro: [
    {id: 'gopro-hero12', brand: 'GoPro', model: 'HERO12 Black', modelOnly: 'HERO12 Black', displayName: 'GoPro HERO12 Black', defaultLens: 'SuperView Lens'},
    {id: 'gopro-hero11', brand: 'GoPro', model: 'HERO11 Black', modelOnly: 'HERO11 Black', displayName: 'GoPro HERO11 Black', defaultLens: 'Wide Lens'},
  ],
  insta360: [
    {id: 'insta360-x4', brand: 'Insta360', model: 'X4', modelOnly: 'X4', displayName: 'Insta360 X4', defaultLens: '360 Lens'},
    {id: 'insta360-acepro', brand: 'Insta360', model: 'Ace Pro', modelOnly: 'Ace Pro', displayName: 'Insta360 Ace Pro', defaultLens: 'Leica Summarit Lens'},
    {id: 'insta360-go3', brand: 'Insta360', model: 'GO 3', modelOnly: 'GO 3', displayName: 'Insta360 GO 3', defaultLens: 'Wide Lens'},
  ],
  phaseone: [
    {id: 'phase-xf', brand: 'Phase One', model: 'XF IQ4', modelOnly: 'XF IQ4', displayName: 'Phase One XF IQ4', defaultLens: 'Schneider Kreuznach 80mm LS F2.8'},
  ],
  osmo_action: [
    {id: 'dji-action4', brand: 'DJI', model: 'Osmo Action 4', modelOnly: 'Action 4', displayName: 'DJI Osmo Action 4', defaultLens: '1/1.3" CMOS Camera'},
    {id: 'dji-action3', brand: 'DJI', model: 'Osmo Action 3', modelOnly: 'Action 3', displayName: 'DJI Osmo Action 3', defaultLens: '1/1.7" CMOS Camera'},
  ],
};

/**
 * 品牌显示名称映射
 */
export const BRAND_DISPLAY_NAMES: Record<BrandId, string> = {
  nikon: 'Nikon',
  canon: 'Canon',
  sony: 'Sony',
  fujifilm: 'Fujifilm',
  panasonic: 'Panasonic',
  leica: 'Leica',
  hasselblad: 'Hasselblad',
  dji: 'DJI',
  apple: 'Apple',
  samsung: 'Samsung',
  xiaomi: 'Xiaomi',
  huawei: 'Huawei',
  oppo: 'OPPO',
  vivo: 'Vivo',
  oneplus: 'OnePlus',
  honor: 'Honor',
  realme: 'Realme',
  meizu: 'Meizu',
  iqoo: 'iQOO',
  gopro: 'GoPro',
  insta360: 'Insta360',
  phaseone: 'Phase One',
  osmo_action: 'Osmo Action',
};

/**
 * 所有品牌 ID 列表（控制显示顺序）
 */
export const BRAND_ORDER: BrandId[] = [
  'nikon',
  'canon',
  'sony',
  'fujifilm',
  'panasonic',
  'leica',
  'hasselblad',
  'dji',
  'apple',
  'samsung',
  'xiaomi',
  'huawei',
  'oppo',
  'vivo',
  'oneplus',
  'honor',
  'realme',
  'meizu',
  'iqoo',
  'gopro',
  'insta360',
  'phaseone',
  'osmo_action',
];
