import {StyleSheet} from 'react-native';

import {colors, fontSize} from '../../theme';

const MIN_BOTTOM_PADDING = 20;

export const createStyles = (bottomInset: number) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
      paddingBottom: Math.max(bottomInset, MIN_BOTTOM_PADDING),
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    tab: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    label: {
      fontSize: fontSize.xs,
      color: colors.textSecondary,
      marginTop: 6,
    },
    activeLabel: {
      color: colors.accent,
      fontWeight: '600',
    },
    indicator: {
      width: 20,
      height: 2,
      backgroundColor: colors.accent,
      borderRadius: 1,
      marginTop: 4,
    },
  });
