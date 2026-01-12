import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../../../theme';
import {Slider} from '../../ui';
import FontPicker from './FontPicker';

interface InfoLineStyleCardProps {
  title: string;
  fontId: string;
  onFontIdChange: (id: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  maxFontSize: number;
  children?: React.ReactNode;
}

export default function InfoLineStyleCard({
  title,
  fontId,
  onFontIdChange,
  fontSize,
  onFontSizeChange,
  maxFontSize,
  children,
}: InfoLineStyleCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.field}>
        <Text style={styles.label}>字体</Text>
        <FontPicker value={fontId} onChange={onFontIdChange} />
      </View>

      <Slider
        label="字号"
        value={fontSize}
        min={10}
        max={maxFontSize}
        onChange={onFontSizeChange}
        unit="px"
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(17,17,17,0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,34,34,0.5)',
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
});
