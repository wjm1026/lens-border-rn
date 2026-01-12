/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-11 19:14:04
 * @LastEditors: wjm 791215714@qq.com
 * @LastEditTime: 2026-01-12 00:29:24
 * @FilePath: /lens-border-rn/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, {useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {EditorScreen, LaunchScreen} from './src/screens';

import {type ParsedExifData} from './src/types';

export default function App() {
  const [imageSource, setImageSource] = useState<{
    uri: string;
    exif?: ParsedExifData;
  } | null>(null);

  const handleImagePicked = (uri: string, data?: ParsedExifData) => {
    console.log('🚀 [App] 接收到图片并准备跳转:', uri, !!data);
    setImageSource({uri, exif: data});
  };

  const handleReset = () => {
    setImageSource(null);
  };

  return (
    <SafeAreaProvider>
      {!imageSource ? (
        <LaunchScreen onImagePicked={handleImagePicked} />
      ) : (
        <EditorScreen
          key={imageSource.uri}
          imageUri={imageSource.uri}
          initialExif={imageSource.exif}
          onReset={handleReset}
        />
      )}
    </SafeAreaProvider>
  );
}
