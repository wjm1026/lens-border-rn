import {StyleSheet} from 'react-native';

import {colors} from '../../theme';

export const EXIF_PADDING_EXTRA = 40;

export const createStyles = (framePadding: number, showExif: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    panelDismissOverlay: {
      ...StyleSheet.absoluteFillObject,
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
      padding: 0,
    },
    imageFrame: {
      backgroundColor: 'transparent',
      padding: framePadding,
      paddingBottom: framePadding + (showExif ? EXIF_PADDING_EXTRA : 0),
      alignItems: 'center',
      shadowColor: colors.black,
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
      position: 'relative',
    },
    imageViewportOuter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageViewport: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.placeholder,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    cropViewportActive: {
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    previewImage: {
      width: '100%',
      height: '100%',
    },
    cropMask: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    cropBox: {
      position: 'absolute',
    },
    cropBoxBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 2,
      borderColor: colors.accent,
    },
    cropHandle: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.white,
      backgroundColor: colors.accent,
    },
    cropHandleTopLeft: {
      left: -12,
      top: -12,
    },
    cropHandleTopRight: {
      right: -12,
      top: -12,
    },
    cropHandleBottomLeft: {
      left: -12,
      bottom: -12,
    },
    cropHandleBottomRight: {
      right: -12,
      bottom: -12,
    },
    placeholderText: {
      color: colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });
