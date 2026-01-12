import {useCallback} from 'react';
import {Alert} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

import {IMAGE_PICKER_OPTIONS} from '../config';
import {parseExif} from '../utils/exifUtils';
import type {ParsedExifData} from '../types';

interface UseImagePickerOptions {
  onImagePicked: (uri: string, exifData?: ParsedExifData) => void;
}

export const useImagePicker = ({
  onImagePicked,
}: UseImagePickerOptions): (() => Promise<void>) => {
  return useCallback(async () => {
    try {
      const result = await launchImageLibrary(IMAGE_PICKER_OPTIONS);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert(
          '选择失败',
          result.errorMessage ?? '请检查相册权限后重试。',
        );
        return;
      }

      const selectedUri = result.assets?.[0]?.uri;
      if (!selectedUri) {
        return;
      }

      try {
        const exifData = await parseExif(selectedUri);
        onImagePicked(selectedUri, exifData);
      } catch {
        onImagePicked(selectedUri);
      }
    } catch {
      Alert.alert('选择失败', '请稍后重试。');
    }
  }, [onImagePicked]);
};
