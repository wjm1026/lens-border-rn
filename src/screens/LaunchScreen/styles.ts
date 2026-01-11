import {StyleSheet} from 'react-native';

import {colors} from '../../theme';

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
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  logoHighlight: {
    color: colors.highlight,
  },
  subText: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
