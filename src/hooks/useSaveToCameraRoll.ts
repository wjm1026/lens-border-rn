import {useCallback, useState, type RefObject} from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import type ViewShot from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

const normalizeFileUri = (uri: string) =>
  uri.startsWith('file://') ? uri : `file://${uri}`;

const requestAndroidSavePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }
  if (Platform.Version >= 29) {
    return true;
  }
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }
  const status = await PermissionsAndroid.request(permission, {
    title: '存储权限',
    message: '需要存储权限以保存图片到相册。',
    buttonPositive: '允许',
    buttonNegative: '取消',
  });
  return status === PermissionsAndroid.RESULTS.GRANTED;
};

export const useSaveToCameraRoll = (viewShotRef: RefObject<ViewShot>) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      const hasPermission = await requestAndroidSavePermission();
      if (!hasPermission) {
        Alert.alert('保存失败', '没有存储权限，无法保存到相册。');
        return;
      }
      if (!viewShotRef.current?.capture) {
        Alert.alert('保存失败', '截图功能不可用，请重试。');
        return;
      }
      const uri = await viewShotRef.current.capture();
      if (!uri) {
        Alert.alert('保存失败', '生成图片失败，请重试。');
        return;
      }
      await CameraRoll.saveAsset(normalizeFileUri(uri), {type: 'photo'});
      Alert.alert('已保存', '图片已保存到相册。');
    } catch (error) {
      const err = error as {code?: string; message?: string};
      if (
        err?.code === 'E_PHOTO_LIBRARY_AUTH_DENIED' ||
        err?.code === 'E_PHOTO_LIBRARY_AUTH_RESTRICTED'
      ) {
        Alert.alert('保存失败', '相册权限被拒绝，请在系统设置中开启。', [
          {text: '取消', style: 'cancel'},
          {text: '去设置', onPress: () => Linking.openSettings()},
        ]);
        return;
      }
      const message =
        typeof err?.message === 'string' && err.message.length > 0
          ? err.message
          : '保存过程中出错，请稍后重试。';
      Alert.alert('保存失败', message);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, viewShotRef]);

  return {handleSave, isSaving};
};
