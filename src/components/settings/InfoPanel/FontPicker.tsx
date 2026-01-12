import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ChevronDown} from 'lucide-react-native';

import {colors} from '../../../theme';
import {FONT_OPTIONS} from '../../../types';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const MENU_MAX_HEIGHT = 260;
const MENU_PADDING = 12;

interface FontPickerProps {
  value: string;
  onChange: (id: string) => void;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

export default function FontPicker({value, onChange}: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: MENU_MAX_HEIGHT,
  });
  const buttonRef = useRef<View>(null);

  const selectedOption = useMemo(
    () => FONT_OPTIONS.find(option => option.id === value) || FONT_OPTIONS[0],
    [value],
  );

  const openMenu = useCallback(() => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const maxHeight = Math.min(MENU_MAX_HEIGHT, SCREEN_HEIGHT - MENU_PADDING * 2);
      let left = Math.max(MENU_PADDING, Math.min(x, SCREEN_WIDTH - width - MENU_PADDING));
      let top = y + height + 8;

      const spaceBelow = SCREEN_HEIGHT - (y + height);
      const spaceAbove = y;

      if (spaceBelow < maxHeight + 16 && spaceAbove >= maxHeight + 16) {
        top = y - maxHeight - 8;
      } else if (spaceBelow < maxHeight + 16 && spaceAbove < maxHeight + 16) {
        top = Math.max(MENU_PADDING, SCREEN_HEIGHT - maxHeight - MENU_PADDING);
      }

      if (left + width > SCREEN_WIDTH - MENU_PADDING) {
        left = SCREEN_WIDTH - width - MENU_PADDING;
      }

      setMenuPosition({top, left, width, maxHeight});
      setIsOpen(true);
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onChange(id);
      closeMenu();
    },
    [closeMenu, onChange],
  );

  return (
    <View>
      <View ref={buttonRef} collapsable={false}>
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
