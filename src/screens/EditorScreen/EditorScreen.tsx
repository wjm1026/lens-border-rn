/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:41
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-11 20:15:00
 * @FilePath: /lens-border-rn/src/screens/EditorScreen/EditorScreen.tsx
 * @Description: 照片编辑主屏幕
 */
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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

import {BottomTabs, LayoutPanel, type TabId} from '../../components';
import {colors} from '../../theme';
import {DEFAULT_SETTINGS, type FrameSettings} from '../../types';
import {createStyles} from './styles';

interface EditorScreenProps {
  imageUri: string;
  onReset: () => void;
}

export default function EditorScreen({imageUri, onReset}: EditorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [settings, setSettings] = useState<FrameSettings>(DEFAULT_SETTINGS);
  const [imageAspectRatio, setImageAspectRatio] = useState(3 / 2);
  const {width} = useWindowDimensions();
  const framePadding = Math.max(0, settings.padding);
  const previewAspectRatio = useMemo(() => {
    switch (settings.aspectRatio) {
      case 'square':
        return 1;
      case 'portrait':
        return 3 / 4;
      case 'landscape':
        return 4 / 3;
      case 'original':
      default:
        return imageAspectRatio;
    }
  }, [imageAspectRatio, settings.aspectRatio]);
  const styles = useMemo(
    () => createStyles(width, framePadding, previewAspectRatio),
    [framePadding, previewAspectRatio, width],
  );

  useEffect(() => {
    let isActive = true;
    Image.getSize(
      imageUri,
      (imgWidth, imgHeight) => {
        if (!isActive) {
          return;
        }
        if (imgWidth > 0 && imgHeight > 0) {
          setImageAspectRatio(imgWidth / imgHeight);
        }
      },
      () => {
        if (isActive) {
          setImageAspectRatio(3 / 2);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [imageUri]);

  const updateSettings = useCallback(
    <K extends keyof FrameSettings>(key: K, value: FrameSettings[K]) => {
      setSettings(prev => ({...prev, [key]: value}));
    },
    [],
  );

  const renderSettingsPanel = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <LayoutPanel settings={settings} updateSettings={updateSettings} />
        );
      case 'crop':
        return <Text style={styles.placeholderText}>裁剪设置</Text>;
      case 'border':
        return <Text style={styles.placeholderText}>边框设置</Text>;
      case 'bg':
        return <Text style={styles.placeholderText}>背景设置</Text>;
      case 'info':
        return <Text style={styles.placeholderText}>信息设置</Text>;
      case 'export':
        return <Text style={styles.placeholderText}>导出设置</Text>;
      default:
        return null;
    }
  };

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

        {/* Settings Panel */}
        <View style={styles.settingsPanel}>{renderSettingsPanel()}</View>
      </SafeAreaView>

      {/* Bottom Tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}
