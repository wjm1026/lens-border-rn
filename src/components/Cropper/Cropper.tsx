/*
 * @Author: wjm 791215714@qq.com
 * @Date: 2026-01-12 01:25:00
 * @Description: 裁切组件，处理图像显示、裁切框覆盖及手势交互
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, PanResponder, StyleSheet, View} from 'react-native';

import {colors} from '../../theme';
import type {CropRect} from '../../types';

interface CropperProps {
  imageUri: string;
  cropRect: CropRect;
  onCropChange: (rect: CropRect) => void;
  aspectRatio?: number; // undefined means free
  rotation: number;
  zoom: number;
  flip: {horizontal: boolean; vertical: boolean};
}

const HANDLE_SIZE = 24;

export const Cropper: React.FC<CropperProps> = ({
  imageUri,
  cropRect,
  onCropChange,
  aspectRatio,
  rotation,
  zoom,
  flip,
}) => {
  const [viewSize, setViewSize] = useState({width: 0, height: 0});
  const [imageSize, setImageSize] = useState({width: 0, height: 0});
  // visualFitSize: Screen-fit size of the Visible (Rotated) Image Area without zoom
  const [visualFitSize, setVisualFitSize] = useState({width: 0, height: 0});

  useEffect(() => {
    let isActive = true;
    Image.getSize(
      imageUri,
      (width, height) => {
        if (isActive) setImageSize({width, height});
      },
      () => {},
    );
    return () => {
      isActive = false;
    };
  }, [imageUri]);

  // Calculate Visual Fit Size
  useEffect(() => {
    if (
      viewSize.width > 0 &&
      viewSize.height > 0 &&
      imageSize.width > 0 &&
      imageSize.height > 0
    ) {
      const isRotated = rotation % 180 !== 0;
      const visualImgW = isRotated ? imageSize.height : imageSize.width;
      const visualImgH = isRotated ? imageSize.width : imageSize.height;

      const viewRatio = viewSize.width / viewSize.height;
      const imgRatio = visualImgW / visualImgH;

      let width, height;
      if (imgRatio > viewRatio) {
        width = viewSize.width;
        height = viewSize.width / imgRatio;
      } else {
        height = viewSize.height;
        width = viewSize.height * imgRatio;
      }
      setVisualFitSize({width, height});
    }
  }, [viewSize, imageSize, rotation]);

  // Derived: Current Visual Image Size (With Zoom)
  const currentVisualW = visualFitSize.width * zoom;
  const currentVisualH = visualFitSize.height * zoom;

  // Visual Rect (Relative to the Zoomed Wrapper)
  const getVisualRect = useCallback(() => {
    return {
      x: cropRect.x * currentVisualW,
      y: cropRect.y * currentVisualH,
      width: cropRect.width * currentVisualW,
      height: cropRect.height * currentVisualH,
    };
  }, [cropRect, currentVisualW, currentVisualH]);

  const updateNormalizedRect = useCallback(
    (vx: number, vy: number, vw: number, vh: number) => {
      if (currentVisualW === 0 || currentVisualH === 0) return;
      onCropChange({
        x: vx / currentVisualW,
        y: vy / currentVisualH,
        width: vw / currentVisualW,
        height: vh / currentVisualH,
      });
    },
    [currentVisualW, currentVisualH, onCropChange],
  );

  const clampRect = useCallback(
    (x: number, y: number, w: number, h: number) => {
      const maxX = currentVisualW;
      const maxY = currentVisualH;
      const MIN_SIZE = 40;

      let newW = Math.max(MIN_SIZE, Math.min(w, maxX));
      let newH = Math.max(MIN_SIZE, Math.min(h, maxY));

      if (aspectRatio) {
        if (newW / newH > aspectRatio) {
          newW = newH * aspectRatio;
        } else {
          newH = newW / aspectRatio;
        }
      }

      if (newW > maxX) {
        newW = maxX;
        if (aspectRatio) newH = newW / aspectRatio;
      }
      if (newH > maxY) {
        newH = maxY;
        if (aspectRatio) newW = newH * aspectRatio;
      }

      let newX = Math.max(0, Math.min(x, maxX - newW));
      let newY = Math.max(0, Math.min(y, maxY - newH));

      return {x: newX, y: newY, width: newW, height: newH};
    },
    [currentVisualW, currentVisualH, aspectRatio],
  );

  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startRect: {x: 0, y: 0, width: 0, height: 0},
    mode: 'none',
    handle: '',
  });

  const createHandleResponder = (handle: string) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gestureRef.current = {
          startX: 0,
          startY: 0,
          startRect: getVisualRect(),
          mode: 'resize',
          handle,
        };
      },
      onPanResponderMove: (evt, gestureState) => {
        const {startRect, handle} = gestureRef.current;
        const {dx, dy} = gestureState;
        let {x, y, width, height} = startRect;

        if (handle.includes('l')) {
          x += dx;
          width -= dx;
        } else {
          width += dx;
        }
        if (handle.includes('t')) {
          y += dy;
          height -= dy;
        } else {
          height += dy;
        }

        if (aspectRatio) {
          const signW = handle.includes('l') ? -1 : 1;
          const signH = handle.includes('t') ? -1 : 1;
          if (Math.abs(dx) > Math.abs(dy)) {
            width = startRect.width + dx * signW;
            height = width / aspectRatio;
          } else {
            height = startRect.height + dy * signH;
            width = height * aspectRatio;
          }
          if (handle.includes('l')) x = startRect.x + startRect.width - width;
          if (handle.includes('t')) y = startRect.y + startRect.height - height;
        }
        const clamped = clampRect(x, y, width, height);
        updateNormalizedRect(
          clamped.x,
          clamped.y,
          clamped.width,
          clamped.height,
        );
      },
    });

  const moveResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      gestureRef.current = {
        startX: 0,
        startY: 0,
        startRect: getVisualRect(),
        mode: 'move',
        handle: '',
      };
    },
    onPanResponderMove: (evt, gestureState) => {
      const {startRect} = gestureRef.current;
      const {dx, dy} = gestureState;
      const clamped = clampRect(
        startRect.x + dx,
        startRect.y + dy,
        startRect.width,
        startRect.height,
      );
      updateNormalizedRect(clamped.x, clamped.y, clamped.width, clamped.height);
    },
  });

  const handleResponders = useMemo(
    () => ({
      tl: createHandleResponder('tl'),
      tr: createHandleResponder('tr'),
      bl: createHandleResponder('bl'),
      br: createHandleResponder('br'),
    }),
    [aspectRatio, clampRect, updateNormalizedRect, getVisualRect],
  );

  const vRect = getVisualRect();
  const isRotated = rotation % 180 !== 0;
  const imgStyleW = isRotated ? visualFitSize.height : visualFitSize.width;
  const imgStyleH = isRotated ? visualFitSize.width : visualFitSize.height;

  return (
    <View
      style={styles.container}
      onLayout={e => setViewSize(e.nativeEvent.layout)}>
      <View
        style={{
          width: currentVisualW,
          height: currentVisualH,
          position: 'relative',
        }}>
        <Image
          source={{uri: imageUri}}
          style={[
            styles.image,
            {
              width: imgStyleW * zoom,
              height: imgStyleH * zoom,
              left: (currentVisualW - imgStyleW * zoom) / 2,
              top: (currentVisualH - imgStyleH * zoom) / 2,
              transform: [
                {rotate: `${rotation}deg`},
                {scaleX: flip.horizontal ? -1 : 1},
                {scaleY: flip.vertical ? -1 : 1},
              ],
            },
          ]}
          resizeMode="stretch"
        />

        <View
          style={[
            styles.overlay,
            {top: 0, height: Math.max(0, vRect.y), left: 0, right: 0},
          ]}
        />
        <View
          style={[
            styles.overlay,
            {top: vRect.y + vRect.height, bottom: 0, left: 0, right: 0},
          ]}
        />
        <View
          style={[
            styles.overlay,
            {
              top: vRect.y,
              height: vRect.height,
              left: 0,
              width: Math.max(0, vRect.x),
            },
          ]}
        />
        <View
          style={[
            styles.overlay,
            {
              top: vRect.y,
              height: vRect.height,
              right: 0,
              width: Math.max(0, currentVisualW - (vRect.x + vRect.width)),
            },
          ]}
        />

        <View
          style={[
            styles.cropBox,
            {
              left: vRect.x,
              top: vRect.y,
              width: vRect.width,
              height: vRect.height,
            },
          ]}
          {...moveResponder.panHandlers}>
          <View style={[styles.border, styles.borderTop]} />
          <View style={[styles.border, styles.borderBottom]} />
          <View style={[styles.border, styles.borderLeft]} />
          <View style={[styles.border, styles.borderRight]} />

          <View style={styles.gridVertical} />
          <View style={[styles.gridVertical, {left: '66%'}]} />
          <View style={styles.gridHorizontal} />
          <View style={[styles.gridHorizontal, {top: '66%'}]} />

          <View
            style={[styles.handle, styles.handleTL]}
            {...handleResponders.tl.panHandlers}
          />
          <View
            style={[styles.handle, styles.handleTR]}
            {...handleResponders.tr.panHandlers}
          />
          <View
            style={[styles.handle, styles.handleBL]}
            {...handleResponders.bl.panHandlers}
          />
          <View
            style={[styles.handle, styles.handleBR]}
            {...handleResponders.br.panHandlers}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cropBox: {
    position: 'absolute',
  },
  border: {
    position: 'absolute',
    backgroundColor: 'white',
    elevation: 5,
  },
  borderTop: {top: -1, height: 2, left: 0, right: 0},
  borderBottom: {bottom: -1, height: 2, left: 0, right: 0},
  borderLeft: {left: -1, width: 2, top: 0, bottom: 0},
  borderRight: {right: -1, width: 2, top: 0, bottom: 0},

  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 10,
    zIndex: 10,
  },
  handleTL: {top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2},
  handleTR: {top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2},
  handleBL: {bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2},
  handleBR: {bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2},

  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    left: '33%',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: '33%',
  },
});
