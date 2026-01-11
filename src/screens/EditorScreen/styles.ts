import {StyleSheet} from 'react-native';

import {colors} from '../../theme';

const PREVIEW_HORIZONTAL_PADDING = 88;
const EXIF_PADDING_EXTRA = 40;

export const createStyles = (
  windowWidth: number,
  framePadding: number,
  imageAspectRatio: number,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      height: 56,
    },
    headerTitle: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: '600',
    },
    iconButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewArea: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    imageFrame: {
      backgroundColor: colors.white,
      padding: framePadding,
      paddingBottom: framePadding + EXIF_PADDING_EXTRA,
      shadowColor: colors.black,
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    previewImage: {
      width: Math.max(
        0,
        windowWidth - PREVIEW_HORIZONTAL_PADDING - framePadding * 2,
      ),
      aspectRatio: imageAspectRatio,
      backgroundColor: colors.placeholder,
    },
    exifOverlay: {
      position: 'absolute',
      bottom: 12,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    cameraModel: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.textDark,
      textTransform: 'uppercase',
    },
    shootingParams: {
      fontSize: 10,
      color: colors.textDim,
      marginTop: 2,
    },
    settingsPanel: {
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });
