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
  | 'google'
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
    black: require('../assets/logos/Nikon_Black.svg'),
    color: require('../assets/logos/Nikon_Color.svg'),
    original: require('../assets/logos/Nikon.svg'),
  },
  canon: {
    white: require('../assets/logos/Canon_White.svg'),
    black: require('../assets/logos/Canon_Black.svg'),
    color: require('../assets/logos/Canon_Color.svg'),
  },
  sony: {
    white: require('../assets/logos/SONY_White.svg'),
    black: require('../assets/logos/SONY_Black.svg'),
    alphaWhite: require('../assets/logos/SONYalpha_White.svg'),
    alphaBlack: require('../assets/logos/SONYalpha_Black.svg'),
  },
  fujifilm: {
    white: require('../assets/logos/Fujifilm_White.svg'),
    black: require('../assets/logos/Fujifilm_BLack.svg'),
    color: require('../assets/logos/Fujifilm_Color.svg'),
  },
  panasonic: {
    white: require('../assets/logos/Lumix_White.svg'),
    black: require('../assets/logos/Lumix_Black.svg'),
  },
  leica: {
    white: require('../assets/logos/Leica_White.svg'),
    black: require('../assets/logos/Leica_Black.svg'),
    color: require('../assets/logos/Leica_Color.svg'),
    isSquare: true,
  },
  hasselblad: {
    white: require('../assets/logos/hasselblad-White.svg'),
    black: require('../assets/logos/hasselblad-Black.svg'),
  },
  dji: {
    white: require('../assets/logos/DJI_White.svg'),
    black: require('../assets/logos/DJI_Black.svg'),
  },
  apple: {
    white: require('../assets/logos/Apple_White.svg'),
    black: require('../assets/logos/Apple_Black.svg'),
    isSquare: true,
  },
  samsung: {
    white: require('../assets/logos/Samsung_White.svg'),
    black: require('../assets/logos/Samsung_black-1.svg'),
    color: require('../assets/logos/Samsung_black-2.svg'),
  },
  xiaomi: {
    white: require('../assets/logos/Xiaomi_White.svg'),
    black: require('../assets/logos/Xiaomi_Black.svg'),
    color: require('../assets/logos/Xiaomi.svg'),
    isSquare: true,
  },
  huawei: {
    white: require('../assets/logos/Huawei_White.svg'),
    black: require('../assets/logos/Huawei_Black.svg'),
    color: require('../assets/logos/Huawei_Color.svg'),
    isSquare: true,
  },
  google: {
    white: undefined,
    black: undefined,
  },
  oppo: {
    white: require('../assets/logos/OPPO_White.svg'),
    black: require('../assets/logos/OPPO_Black.svg'),
    color: require('../assets/logos/OPPO_Color.svg'),
  },
  vivo: {
    white: require('../assets/logos/VIvo_White.svg'),
    black: require('../assets/logos/VIvo_Black.svg'),
    color: require('../assets/logos/VIvo_Color.svg'),
  },
  oneplus: {
    white: require('../assets/logos/Oneplus_White.svg'),
    black: require('../assets/logos/Oneplus_Black.svg'),
    color: require('../assets/logos/Oneplus_Color.svg'),
  },
  honor: {
    white: require('../assets/logos/HONOR_White.svg'),
    black: require('../assets/logos/honor.svg'),
  },
  realme: {
    white: require('../assets/logos/Realme_White.svg'),
    black: require('../assets/logos/Realme_Black.svg'),
  },
  meizu: {
    white: require('../assets/logos/Meizu-White.svg'),
    black: require('../assets/logos/Meizu-Black.svg'),
    color: require('../assets/logos/Meizu_Color.svg'),
  },
  iqoo: {
    white: require('../assets/logos/IQOO_White.svg'),
    black: require('../assets/logos/IQOO.svg'),
    color: require('../assets/logos/IQOO_Color.svg'),
  },
  gopro: {
    white: require('../assets/logos/GoPro_White.svg'),
    black: require('../assets/logos/GoPro_Black.svg'),
    color: require('../assets/logos/GoPro_Color.svg'),
  },
  insta360: {
    white: require('../assets/logos/Insta360_White.svg'),
    black: require('../assets/logos/Insta360_Black.svg'),
  },
  phaseone: {
    white: require('../assets/logos/phaseone_White.svg'),
    black: require('../assets/logos/phaseone.svg'),
    color: require('../assets/logos/phaseone_Color.svg'),
  },
  osmo_action: {
    white: require('../assets/logos/Osmo_Action_White.svg'),
    black: require('../assets/logos/Osmo_Action_Black.svg'),
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
