/**
 * 品牌 Logo 资源统一管理
 * 将 Logo 资源与相机数据分离，便于单独维护
 */

export interface BrandLogoSet {
  white?: any;
  black?: any;
  color?: any;
  original?: any;
  alphaWhite?: any;
  alphaBlack?: any;
  isSquare?: boolean;
  [key: string]: any;
}

export type BrandId =
  | 'nikon'
  | 'canon'
  | 'sony'
  | 'fujifilm'
  | 'panasonic'
  | 'leica'
  | 'hasselblad'
  | 'dji'
  | 'apple'
  | 'samsung'
  | 'xiaomi'
  | 'huawei'
  | 'oppo'
  | 'vivo'
  | 'oneplus'
  | 'honor'
  | 'realme'
  | 'meizu'
  | 'iqoo'
  | 'gopro'
  | 'insta360'
  | 'phaseone'
  | 'osmo_action';

export const BRAND_LOGOS: Record<BrandId, BrandLogoSet> = {
  nikon: {
    white: require('../assets/logos/Nikon_White.svg'),
    original: require('../assets/logos/Nikon.svg'),
  },
  canon: {
    color: require('../assets/logos/Canon_Color.svg'),
  },
  sony: {
    white: require('../assets/logos/SONY_White.svg'),
    alphaWhite: require('../assets/logos/SONYalpha_White.svg'),
  },
  fujifilm: {
    white: require('../assets/logos/Fujifilm_White.svg'),
  },
  panasonic: {
    white: require('../assets/logos/Lumix_White.svg'),
  },
  leica: {
    white: require('../assets/logos/Leica_White.svg'),
    black: require('../assets/logos/Leica_Black.svg'),
    color: require('../assets/logos/Leica_Color.svg'),
    isSquare: true,
  },
  hasselblad: {
    white: require('../assets/logos/hasselblad-White.svg'),
  },
  dji: {
    white: require('../assets/logos/DJI_White.svg'),
  },
  apple: {
    white: require('../assets/logos/Apple_White.svg'),
    isSquare: true,
  },
  samsung: {
    white: require('../assets/logos/Samsung_White.svg'),
  },
  xiaomi: {
    color: require('../assets/logos/Xiaomi.svg'),
    isSquare: true,
  },
  huawei: {
    white: require('../assets/logos/Huawei_White.svg'),
    color: require('../assets/logos/Huawei_Color.svg'),
    isSquare: true,
  },
  oppo: {
    white: require('../assets/logos/OPPO_White.svg'),
  },
  vivo: {
    white: require('../assets/logos/VIvo_White.svg'),
  },
  oneplus: {
    white: require('../assets/logos/Oneplus_White.svg'),
  },
  honor: {
    white: require('../assets/logos/HONOR_White.svg'),
  },
  realme: {
    white: require('../assets/logos/Realme_White.svg'),
  },
  meizu: {
    white: require('../assets/logos/Meizu-White.svg'),
  },
  iqoo: {
    white: require('../assets/logos/IQOO_White.svg'),
  },
  gopro: {
    white: require('../assets/logos/GoPro_White.svg'),
  },
  insta360: {
    white: require('../assets/logos/Insta360_White.svg'),
  },
  phaseone: {
    white: require('../assets/logos/phaseone_White.svg'),
    color: require('../assets/logos/phaseone_Color.svg'),
  },
  osmo_action: {
    white: require('../assets/logos/Osmo_Action_White.svg'),
  },
};

/**
 * 根据品牌 ID 获取 Logo
 */
export const getBrandLogo = (
  brandId: BrandId,
  variant: keyof BrandLogoSet = 'white',
): any => {
  return BRAND_LOGOS[brandId]?.[variant];
};
