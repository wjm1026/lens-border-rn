import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Layout,
  Scissors,
  Square,
  Palette,
  Info,
  Download,
  LucideIcon,
} from 'lucide-react-native';

import {colors} from '../../theme';
import {createStyles} from './styles';

export type TabId = 'layout' | 'crop' | 'border' | 'bg' | 'info' | 'export';

type TabItem = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

const TAB_ITEMS: TabItem[] = [
  {id: 'layout', label: '布局', icon: Layout},
  {id: 'crop', label: '裁剪', icon: Scissors},
  {id: 'border', label: '边框', icon: Square},
  {id: 'bg', label: '背景', icon: Palette},
  {id: 'info', label: '信息', icon: Info},
  {id: 'export', label: '导出', icon: Download},
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

export default function BottomTabs({activeTab, onTabChange}: BottomTabsProps) {
  const {bottom} = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(bottom), [bottom]);

  return (
    <View style={styles.container}>
      {TAB_ITEMS.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}>
            <Icon
              size={24}
              color={isActive ? colors.accent : colors.textSecondary}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
