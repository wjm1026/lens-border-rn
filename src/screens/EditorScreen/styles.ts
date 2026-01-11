import {StyleSheet} from 'react-native';

import {colors} from '../../theme';

const PREVIEW_HORIZONTAL_PADDING = 88;

export const createStyles = (windowWidth: number) =>
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
      padding: 20,
      paddingBottom: 60,
      shadowColor: colors.black,
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    previewImage: {
      width: Math.max(0, windowWidth - PREVIEW_HORIZONTAL_PADDING),
      aspectRatio: 3 / 2,
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
      padding: 20,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    settingsTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: 20,
    },
    sliderTrack: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    sliderFill: {
      height: '100%',
      backgroundColor: colors.accent,
      borderRadius: 2,
    },
    sliderThumb: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.white,
      borderWidth: 4,
      borderColor: colors.accent,
    },
    ratioContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    ratioButton: {
      backgroundColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      flex: 1,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    ratioText: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '500',
    },
  });
