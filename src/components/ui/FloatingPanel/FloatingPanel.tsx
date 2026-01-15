import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  LayoutAnimation,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';

// 在 Android 上启用 LayoutAnimation
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import {colors} from '../../../theme';
import {
  FLOATING_PANEL_ANIMATION,
  LAYOUT_ANIMATION_CONFIG,
} from '../../../config';

interface FloatingPanelProps {
  children: React.ReactNode;
  visible?: boolean;
  contentKey?: string;
  maxHeightRatio?: number;
  onLayout?: (event: LayoutChangeEvent) => void;
  onDismissComplete?: () => void;
  isSliding?: boolean;
}

const {
  duration: ANIMATION_DURATION,
  contentAnimationDuration: CONTENT_ANIMATION_DURATION,
  slideDistance: SLIDE_DISTANCE,
} = FLOATING_PANEL_ANIMATION;

export default function FloatingPanel({
  children,
  visible = true,
  contentKey,
  maxHeightRatio = 0.55,
  onLayout,
  onDismissComplete,
  isSliding,
}: FloatingPanelProps) {
  const {height} = useWindowDimensions();
  const maxHeight = Math.max(240, height * maxHeightRatio);
  const [shouldRender, setShouldRender] = useState(visible);
  const [displayedContent, setDisplayedContent] =
    useState<React.ReactNode>(children);
  const prevContentKeyRef = useRef(contentKey);
  const isFirstRender = useRef(true);
  // 追踪内容切换动画是否正在进行中
  const isContentAnimating = useRef(false);
  // 缓存最新的 children，用于动画完成后更新
  const pendingChildrenRef = useRef<React.ReactNode>(children);

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

  // 滑拽时的幽灵化效果
  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.timing(opacity, {
      toValue: isSliding ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSliding, opacity, visible]);

  // 状态追踪
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
    // 始终更新缓存的 children
    pendingChildrenRef.current = children;

    // 跳过首次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 面板不可见时不处理
    if (!visible) {
      return;
    }

    // 如果动画正在进行中，忽略此次更新（children 已被缓存）
    if (isContentAnimating.current) {
      return;
    }

    // 如果contentKey没变化，说明是内容内部更新（如切换背景类型），配置高度变化动画
    if (contentKey === prevContentKeyRef.current) {
      LayoutAnimation.configureNext(LAYOUT_ANIMATION_CONFIG);
      setDisplayedContent(children);
      return;
    }

    // 开始 tab 切换动画
    isContentAnimating.current = true;
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
        // 在更新内容之前配置高度变化动画
        LayoutAnimation.configureNext(LAYOUT_ANIMATION_CONFIG);
        // 使用最新缓存的 children，而不是闭包中的旧值
        setDisplayedContent(pendingChildrenRef.current);
        // 从右侧淡入 - 等待一帧确保布局完成后再开始动画
        contentTranslateX.setValue(10);
        requestAnimationFrame(() => {
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
          ]).start(({finished: fadeInFinished}) => {
            if (fadeInFinished) {
              // 动画完成，解除锁定
              isContentAnimating.current = false;
            }
          });
        });
      } else {
        // 动画被中断，解除锁定
        isContentAnimating.current = false;
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
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!isSliding}>
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
    paddingTop: 24,
    paddingBottom: 20,
  },
});
