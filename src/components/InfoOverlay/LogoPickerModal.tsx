import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {BRAND_LOGOS} from '../../data/index';
import type {CameraBrand} from '../../data/index';

interface LogoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  brand: CameraBrand | undefined;
  selectedVariant: string | undefined;
  onSelect: (variant: string) => void;
}

export default function LogoPickerModal({
  visible,
  onClose,
  brand,
  selectedVariant,
  onSelect,
}: LogoPickerModalProps) {
  if (!brand || !visible) {
    return null;
  }

  const brandLogos = BRAND_LOGOS[brand.id];
  if (!brandLogos) {
    return null;
  }

  const EXCLUDED_KEYS = ['isSquare', 'aspectRatio', 'variants'];
  const variants = Object.keys(brandLogos).filter(
    k => !EXCLUDED_KEYS.includes(k),
  ) as string[];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>选择 Logo 样式</Text>
          <ScrollView
            contentContainerStyle={styles.logoGrid}
            showsVerticalScrollIndicator={false}>
            {variants.map(variant => {
              const Src = brandLogos[variant]?.default || brandLogos[variant];
              if (!Src) {
                return null;
              }
              const isSelected =
                selectedVariant === variant ||
                (!selectedVariant && variant === 'white');

              // 背景色处理：如果是白色logo，给个深色背景方便看；黑色的给浅色背景
              const isWhiteVariant = variant.toLowerCase().includes('white');
              const bgColor = isWhiteVariant ? '#333' : '#f5f5f5';

              return (
                <TouchableOpacity
                  key={variant}
                  style={[
                    styles.logoOption,
                    {backgroundColor: bgColor},
                    isSelected && styles.logoOptionSelected,
                  ]}
                  onPress={() => {
                    onSelect(variant);
                    onClose();
                  }}>
                  <Src
                    width={60}
                    height={40}
                    style={{color: isWhiteVariant ? '#FFF' : '#000'}}
                    fill={isWhiteVariant ? '#FFF' : '#000'}
                  />
                  <Text
                    style={[
                      styles.variantName,
                      {color: isWhiteVariant ? '#ccc' : '#666'},
                    ]}>
                    {variant}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoOption: {
    width: '46%',
    aspectRatio: 1.5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 8,
    marginBottom: 8,
  },
  logoOptionSelected: {
    borderColor: '#007AFF', // System Blue
  },
  variantName: {
    fontSize: 12,
    marginTop: 4,
    position: 'absolute',
    bottom: 4,
  },
});
