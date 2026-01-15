import React, {useCallback} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Camera, ChevronDown, Search, Sparkles} from 'lucide-react-native';

import {useCameraSelectorState} from '../../hooks/useCameraSelectorState';
import {useMenuPosition} from '../../hooks/useMenuPosition';
import {CAMERA_SELECTOR_MENU_MAX_HEIGHT} from '../../config';
import {colors, fontSize} from '../../theme';
import {type CameraBrand, type CameraPreset} from '../../data/cameraPresets';

interface CameraSelectorProps {
  onSelect: (preset: CameraPreset | null) => void;
  selectedId?: string | null;
  currentExifCamera?: string;
}

export default function CameraSelector({
  onSelect,
  selectedId,
  currentExifCamera,
}: CameraSelectorProps) {
  const {
    search,
    setSearch,
    expandedBrand,
    toggleBrand,
    selectedPreset,
    filteredBrands,
    hasSearchQuery,
    resetSearch,
  } = useCameraSelectorState({selectedId});
  const {isOpen, menuPosition, openMenu, closeMenu, triggerRef} =
    useMenuPosition({
      maxHeight: CAMERA_SELECTOR_MENU_MAX_HEIGHT,
      onClose: resetSearch,
    });

  const handleSelect = useCallback(
    (preset: CameraPreset) => {
      onSelect(preset);
      closeMenu();
    },
    [closeMenu, onSelect],
  );

  const handleReset = useCallback(() => {
    onSelect(null);
    closeMenu();
  }, [closeMenu, onSelect]);

  const isPresetSelected = Boolean(selectedPreset);
  const displayText =
    selectedPreset?.displayName || currentExifCamera || '选择相机型号';

  return (
    <View>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          style={[styles.triggerButton, isOpen && styles.triggerButtonActive]}
          onPress={openMenu}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="选择相机型号">
          <Camera size={16} color="rgba(255,255,255,0.6)" />
          <Text
            style={[
              styles.triggerText,
              isPresetSelected ? styles.triggerTextActive : null,
            ]}
            numberOfLines={1}>
            {displayText}
          </Text>
          {isPresetSelected && (
            <View style={styles.presetBadge}>
              <Text style={styles.presetBadgeText}>预设</Text>
            </View>
          )}
          <ChevronDown
            size={16}
            color="rgba(255,255,255,0.4)"
            style={isOpen ? styles.chevronOpen : undefined}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}>
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable
            style={[
              styles.menuContainer,
              {
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              },
            ]}
            onPress={e => e.stopPropagation()}>
            <View style={styles.searchContainer}>
              <Search size={16} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="搜索相机..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
            </View>

            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {currentExifCamera ? (
                <View style={styles.exifSection}>
                  <TouchableOpacity
                    style={[
                      styles.exifButton,
                      !isPresetSelected && styles.exifButtonActive,
                    ]}
                    onPress={handleReset}
                    activeOpacity={0.8}>
                    <Sparkles size={16} color={colors.accent} />
                    <View style={styles.exifTextBlock}>
                      <Text style={styles.exifTitle}>使用原始 EXIF</Text>
                      <Text style={styles.exifSubtitle} numberOfLines={1}>
                        {currentExifCamera}
                      </Text>
                    </View>
                    {!isPresetSelected && <View style={styles.exifDot} />}
                  </TouchableOpacity>
                </View>
              ) : null}

              {filteredBrands.map(brand => (
                <BrandGroup
                  key={brand.id}
                  brand={brand}
                  isExpanded={hasSearchQuery || expandedBrand === brand.id}
                  onToggle={() => toggleBrand(brand.id)}
                  onSelect={handleSelect}
                  selectedId={selectedId}
                />
              ))}

              {filteredBrands.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>未找到匹配的相机</Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface BrandGroupProps {
  brand: CameraBrand;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (preset: CameraPreset) => void;
  selectedId?: string | null;
}

function BrandGroup({
  brand,
  isExpanded,
  onToggle,
  onSelect,
  selectedId,
}: BrandGroupProps) {
  const hasSelected = brand.models.some(model => model.id === selectedId);

  return (
    <View style={styles.brandGroup}>
      <TouchableOpacity
        style={[styles.brandHeader, hasSelected && styles.brandHeaderActive]}
        onPress={onToggle}
        activeOpacity={0.8}>
        <Text style={styles.brandName}>{brand.name}</Text>
        <Text style={styles.brandCount}>({brand.models.length})</Text>
        <View style={styles.flexSpacer} />
        {hasSelected && <View style={styles.selectedDot} />}
        <ChevronDown
          size={16}
          color="rgba(255,255,255,0.35)"
          style={isExpanded ? styles.chevronOpen : undefined}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.modelsContainer}>
          {brand.models.map(model => {
            const isActive = model.id === selectedId;
            return (
              <TouchableOpacity
                key={model.id}
                style={[styles.modelRow, isActive && styles.modelRowActive]}
                onPress={() => onSelect(model)}
                activeOpacity={0.8}>
                <Text style={styles.modelText} numberOfLines={1}>
                  {model.displayName}
                </Text>
                {isActive && <View style={styles.selectedDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  triggerButtonActive: {
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  triggerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  triggerTextActive: {
    color: colors.textPrimary,
  },
  presetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(59,130,246,0.25)',
    marginRight: 6,
  },
  presetBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent,
  },
  chevronOpen: {
    transform: [{rotate: '180deg'}],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(17,17,17,0.96)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.05)',
    fontSize: fontSize.sm,
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingBottom: 8,
  },
  exifSection: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  exifButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  exifButtonActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  exifTextBlock: {
    flex: 1,
    marginLeft: 10,
  },
  exifTitle: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  exifSubtitle: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  exifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  brandGroup: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  brandHeaderActive: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },
  brandName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  brandCount: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.35)',
    marginLeft: 6,
  },
  flexSpacer: {
    flex: 1,
  },
  selectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  modelsContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  modelRowActive: {
    backgroundColor: 'rgba(59,130,246,0.2)',
  },
  modelText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.4)',
  },
});
