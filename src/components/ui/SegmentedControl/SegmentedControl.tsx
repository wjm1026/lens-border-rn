import React, {useCallback, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

import {colors} from '../../../theme';

// 启用Android的LayoutAnimation
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface SegmentedOption<T> {
  id: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  const activeIndex = useMemo(() => {
    if (options.length === 0) {
      return -1;
    }
    const index = options.findIndex(opt => opt.id === value);
    return index >= 0 ? index : 0;
  }, [options, value]);
  const activeId = activeIndex >= 0 ? options[activeIndex].id : undefined;

  const handlePress = useCallback(
    (id: T) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onChange(id);
    },
    [onChange],
  );

  if (options.length === 0) {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.controlContainer}>
        {/* Sliding Background Indicator */}
        <View
          style={[
            styles.indicator,
            {
              width: `${100 / options.length}%`,
              left: `${(activeIndex * 100) / options.length}%`,
            },
          ]}
          pointerEvents="none"
        />
        {options.map(opt => {
          const isActive = activeId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={styles.button}
              onPress={() => handlePress(opt.id)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{selected: isActive}}>
              <Text
                style={[
                  styles.buttonText,
                  isActive && styles.activeButtonText,
                ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  controlContainer: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: colors.borderSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeButtonText: {
    color: colors.textPrimary,
  },
});
