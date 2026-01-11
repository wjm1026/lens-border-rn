import {useEffect, useState} from 'react';
import {Image} from 'react-native';

const DEFAULT_ASPECT_RATIO = 3 / 2;

export const useImageAspectRatio = (
  imageUri: string,
  fallbackRatio: number = DEFAULT_ASPECT_RATIO,
) => {
  const [aspectRatio, setAspectRatio] = useState(fallbackRatio);

  useEffect(() => {
    let isActive = true;
    Image.getSize(
      imageUri,
      (width, height) => {
        if (!isActive) {
          return;
        }
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        if (isActive) {
          setAspectRatio(fallbackRatio);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [fallbackRatio, imageUri]);

  return aspectRatio;
};
