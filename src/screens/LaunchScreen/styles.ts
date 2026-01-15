import {StyleSheet} from 'react-native';

import {colors, fontSize} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 22,
    marginBottom: 20,
  },
  logoText: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  logoHighlight: {
    color: colors.highlight,
  },
  subText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginTop: 10,
  },
  uploadArea: {
    width: '100%',
    aspectRatio: 1.6,
  },
  uploadBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
});
