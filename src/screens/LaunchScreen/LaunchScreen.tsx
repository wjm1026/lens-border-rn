/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:34:18
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 22:48:19
 * @FilePath: /code/lens-border-rn/src/screens/LaunchScreen/LaunchScreen.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import {StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {Upload} from 'lucide-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../theme';
import {styles} from './styles';
import {useImagePicker} from '../../hooks/useImagePicker';

import {type ParsedExifData} from '../../types';

interface LaunchScreenProps {
  onImagePicked: (uri: string, exifData?: ParsedExifData) => void;
}

export default function LaunchScreen({onImagePicked}: LaunchScreenProps) {
  const handlePicker = useImagePicker({onImagePicked});

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.logoText}>
          Lens<Text style={styles.logoHighlight}>Border</Text>
        </Text>
        <Text style={styles.subText}>打造专业级照片边框 & EXIF 数据展示</Text>
      </View>

      <TouchableOpacity
        style={styles.uploadArea}
        onPress={handlePicker}
        activeOpacity={0.7}>
        <View style={styles.uploadBox}>
          <View style={styles.iconCircle}>
            <Upload size={32} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={styles.uploadTitle}>点击上传照片</Text>
          <Text style={styles.uploadHint}>支持 JPG, PNG, HEIC 格式</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
