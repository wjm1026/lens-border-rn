import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ChevronLeft, Trash2} from 'lucide-react-native';

import {colors, fontSize} from '../../theme';

interface EditorHeaderProps {
  title?: string;
  onBack: () => void;
  onDelete: () => void;
}

export default function EditorHeader({
  title = '编辑照片',
  onBack,
  onDelete,
}: EditorHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="返回">
        <ChevronLeft color={colors.textPrimary} size={24} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        onPress={onDelete}
        style={styles.iconButton}
        accessibilityRole="button"
        accessibilityLabel="删除">
        <Trash2 color={colors.danger} size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
