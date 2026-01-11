import React from 'react';
import {
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import {colors} from '../../../theme';

interface FloatingPanelProps {
  children: React.ReactNode;
  maxHeightRatio?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export default function FloatingPanel({
  children,
  maxHeightRatio = 0.55,
  onLayout,
}: FloatingPanelProps) {
  const {height} = useWindowDimensions();
  const maxHeight = Math.max(240, height * maxHeightRatio);

  return (
    <View pointerEvents="box-none" style={styles.container} onLayout={onLayout}>
      <View style={[styles.panel, {maxHeight}]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
});
