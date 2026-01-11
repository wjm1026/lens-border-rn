/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:41
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-11 20:00:00
 * @FilePath: /lens-border-rn/src/screens/EditorScreen/EditorScreen.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, {useMemo, useState} from 'react';
import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronLeft, Trash2} from 'lucide-react-native';
import {BottomTabs, type TabId} from '../../components';
import {colors} from '../../theme';
import {createStyles} from './styles';

interface EditorScreenProps {
  imageUri: string;
  onReset: () => void;
}

export default function EditorScreen({imageUri, onReset}: EditorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const {width} = useWindowDimensions();
  const styles = useMemo(() => createStyles(width), [width]);
  const ratioOptions = ['适应', '1:1', '3:4', '4:3'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.content} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onReset} style={styles.iconButton}>
            <ChevronLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>编辑照片</Text>
          <TouchableOpacity onPress={onReset} style={styles.iconButton}>
            <Trash2 color={colors.danger} size={20} />
          </TouchableOpacity>
        </View>

        {/* Image Preview Container */}
        <View style={styles.previewArea}>
          <View style={styles.imageFrame}>
            <Image
              source={{uri: imageUri}}
              style={styles.previewImage}
              resizeMode="contain"
            />
            {/* EXIF Overlay Placeholder */}
            <View style={styles.exifOverlay}>
              <Text style={styles.cameraModel}>NIKON Z9</Text>
              <Text style={styles.shootingParams}>
                28.5mm f/7.1 1/60 ISO100
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Panel Placeholder */}
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>
            {activeTab === 'layout' ? '画布外边距' : '编辑选项'}
          </Text>
          {/* Slider Placeholder */}
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, {width: '40%'}]} />
            <View style={[styles.sliderThumb, {left: '40%'}]} />
          </View>
          <View style={styles.ratioContainer}>
            {ratioOptions.map(ratio => (
              <TouchableOpacity key={ratio} style={styles.ratioButton}>
                <Text style={styles.ratioText}>{ratio}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
