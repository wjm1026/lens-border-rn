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
