import React, {useState, useRef, useEffect} from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type KeyboardEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import {colors} from '../../theme';

interface EditableTextProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  style?: StyleProp<TextStyle>;
  textAlign?: 'left' | 'center' | 'right';
}

const KEYBOARD_OFFSET = 60; // 输入框距离键盘顶部的距离

export default function EditableText({
  value,
  placeholder,
  onChange,
  style,
  textAlign = 'center',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [elementY, setElementY] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const containerRef = useRef<View>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const {height: screenHeight} = useWindowDimensions();

  // 监听键盘事件
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      const kbHeight = event.endCoordinates.height;
      setKeyboardHeight(kbHeight);

      // 计算需要移动的距离
      if (isEditing && elementY > 0) {
        const visibleAreaBottom = screenHeight - kbHeight - KEYBOARD_OFFSET;
        const needToMove = elementY - visibleAreaBottom;
        if (needToMove > 0) {
          Animated.spring(translateY, {
            toValue: -needToMove,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      }
    };

    const handleKeyboardHide = () => {
      setKeyboardHeight(0);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    };

    const showSubscription = Keyboard.addListener(
      showEvent,
      handleKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      hideEvent,
      handleKeyboardHide,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [isEditing, elementY, screenHeight, translateY]);

  // 当开始编辑时，如果键盘已经显示，立即计算移动距离
  useEffect(() => {
    if (isEditing && keyboardHeight > 0 && elementY > 0) {
      const visibleAreaBottom = screenHeight - keyboardHeight - KEYBOARD_OFFSET;
      const needToMove = elementY - visibleAreaBottom;
      if (needToMove > 0) {
        Animated.spring(translateY, {
          toValue: -needToMove,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }).start();
      }
    }
  }, [isEditing, keyboardHeight, elementY, screenHeight, translateY]);

  const handleLayout = (_event: LayoutChangeEvent) => {
    // 获取元素在屏幕上的 Y 坐标
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setElementY(y + height);
    });
  };

  const handlePress = () => {
    setLocalValue(value);
    setIsEditing(true);
    // 延迟聚焦，确保 TextInput 已渲染
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
    // 动画回到原位置
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  };

  const handleSubmit = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
    Keyboard.dismiss();
  };

  const displayValue = value || placeholder;

  return (
    <Animated.View
      ref={containerRef}
      style={[styles.container, {transform: [{translateY}]}]}
      onLayout={handleLayout}>
      {isEditing ? (
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, style, {textAlign}]}
            value={localValue}
            onChangeText={setLocalValue}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            returnKeyType="done"
            selectTextOnFocus
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={styles.textContainer}>
          <Text style={[style, {textAlign}, !value && styles.placeholder]}>
            {displayValue}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  textContainer: {
    position: 'relative',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    padding: 0,
    margin: 0,
    minWidth: 50,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  placeholder: {
    opacity: 0.5,
  },
});
