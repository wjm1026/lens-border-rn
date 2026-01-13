import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import {colors} from '../../../theme';

interface FloatingPanelProps {
  children: React.ReactNode;
  visible?: boolean;
  contentKey?: string;
  maxHeightRatio?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  onDismissComplete?: () => void;
}

const ANIMATION_DURATION = 250;
const CONTENT_ANIMATION_DURATION = 150;
const SLIDE_DISTANCE = 80;

export default function FloatingPanel({
  children,
  visible = true,
  contentKey,
  maxHeightRatio = 0.55,
  onLayout,
  onDismissComplete,
}: FloatingPanelProps) {
  const {height} = useWindowDimensions();
  const maxHeight = Math.max(240, height * maxHeightRatio);
  const [shouldRender, setShouldRender] = useState(visible);
  const [displayedContent, setDisplayedContent] =
    useState<React.ReactNode>(children);
  const prevContentKeyRef = useRef(contentKey);
  const isFirstRender = useRef(true);

  // Animation values
  const translateY = useRef(
    new Animated.Value(visible ? 0 : SLIDE_DISTANCE),
  ).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateX = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION * 0.5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SLIDE_DISTANCE,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION * 0.8,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setShouldRender(false);
        onDismissComplete?.();
      }
    });
  }, [onDismissComplete, opacity, translateY]);

  // 追踪visible的变化
  const prevVisibleRef = useRef(visible);

  // 面板显示/隐藏动画 - 只在visible真正变化时触发
  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (visible && !wasVisible) {
      // 从隐藏变为可见：立即同步内容，避免显示旧内容
      setDisplayedContent(children);
      prevContentKeyRef.current = contentKey;
      // 重置内容动画状态
      contentOpacity.setValue(1);
      contentTranslateX.setValue(0);
      // 显示面板
      setShouldRender(true);
      translateY.setValue(SLIDE_DISTANCE);
      opacity.setValue(0);
      animateIn();
    } else if (!visible && wasVisible && shouldRender) {
      // 从可见变为隐藏
      animateOut();
    }
  }, [
    animateIn,
    animateOut,
    children,
    contentKey,
    contentOpacity,
    contentTranslateX,
    opacity,
    shouldRender,
    translateY,
    visible,
  ]);

  // 内容切换动画 - 只在面板已可见时且切换tab才触发
  useEffect(() => {
    // 跳过首次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 面板不可见时不处理
    if (!visible) {
      return;
    }

    // 如果contentKey没变化，直接更新内容（属性变化）
    if (contentKey === prevContentKeyRef.current) {
      setDisplayedContent(children);
      return;
    }

    prevContentKeyRef.current = contentKey;

    // 淡出 + 轻微左移
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: CONTENT_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: -10,
        duration: CONTENT_ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setDisplayedContent(children);
        // 从右侧淡入
        contentTranslateX.setValue(10);
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: CONTENT_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateX, {
            toValue: 0,
            duration: CONTENT_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [children, contentKey, contentOpacity, contentTranslateX, visible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          opacity,
          transform: [{translateY}],
        },
      ]}
      onLayout={onLayout}>
      <View style={[styles.panel, {maxHeight}]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View
            style={[
              styles.content,
              {
                opacity: contentOpacity,
                transform: [{translateX: contentTranslateX}],
              },
            ]}>
            {displayedContent}
          </Animated.View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
});
