import React, {useCallback, useMemo} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronDown} from 'lucide-react-native';

import {useMenuPosition} from '../../../hooks/useMenuPosition';
import {colors} from '../../../theme';
import {FONT_OPTIONS} from '../../../config';

const MENU_MAX_HEIGHT = 260;

interface FontPickerProps {
  value: string;
  onChange: (id: string) => void;
}

export default function FontPicker({value, onChange}: FontPickerProps) {
  const {isOpen, menuPosition, openMenu, closeMenu, triggerRef} =
    useMenuPosition({
      maxHeight: MENU_MAX_HEIGHT,
    });

  const selectedOption = useMemo(
    () => FONT_OPTIONS.find(option => option.id === value) || FONT_OPTIONS[0],
    [value],
  );

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      closeMenu();
    },
    [closeMenu, onChange],
  );

  return (
    <View>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          style={styles.triggerButton}
          onPress={openMenu}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="选择字体"
        >
          <Text style={styles.triggerText} numberOfLines={1}>
            {selectedOption?.name || value}
          </Text>
          <ChevronDown size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menuContainer,
              {
                top: menuPosition.top,
                left: menuPosition.left,
                width: Math.max(menuPosition.width, 180),
                maxHeight: menuPosition.maxHeight,
              },
            ]}
            onPress={e => e.stopPropagation()}
          >
            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              {FONT_OPTIONS.map(option => {
                const isActive = option.id === value;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.optionRow, isActive && styles.optionRowActive]}
                    onPress={() => handleSelect(option.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                        {fontFamily: option.id},
                      ]}
                    >
                      {option.name}
                    </Text>
                    {isActive && <View style={styles.selectedDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(17,17,17,0.96)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  optionRowActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  optionText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});
