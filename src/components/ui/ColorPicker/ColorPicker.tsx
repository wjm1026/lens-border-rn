import React, {useState, useCallback, useMemo, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  TextInput,
  PanResponder,
  Pressable,
  Animated,
  type ViewStyle,
} from 'react-native';
import Svg, {Rect, Defs, LinearGradient, Stop} from 'react-native-svg';
import {colors, fontSize} from '../../../theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const PICKER_WIDTH = 240;
const PICKER_HEIGHT = 320;

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  size?: number;
  onSlidingStart?: () => void;
  onSlidingComplete?: () => void;
  initialOpen?: boolean;
  onClose?: () => void;
}

const PRESET_COLORS = [
  '#FFFFFF',
  '#000000',
  '#F43F5E',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
];

// 颜色转换工具函数
function hexToHsv(hex: string): {h: number; s: number; v: number} {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {h: h * 360, s: s * 100, v: v * 100};
}

function hsvToHex(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hueToColor(h: number): string {
  return hsvToHex(h, 100, 100);
}

export function ColorPicker({
  color,
  onChange,
  label,
  size = 40,
  onSlidingStart,
  onSlidingComplete,
  initialOpen = false,
  onClose,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const initialHsv = hexToHsv(color);
  const [hue, setHue] = useState(initialHsv.h);
  const [saturation, setSaturation] = useState(initialHsv.s);
  const [brightness, setBrightness] = useState(initialHsv.v);
  const [hexInput, setHexInput] = useState(color.replace('#', ''));
  const [isInteracting, setIsInteracting] = useState(false);

  // 动画
  const pickerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(pickerOpacity, {
      toValue: isInteracting ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isInteracting, pickerOpacity]);

  const [pickerPosition, setPickerPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 100,
    left: 24,
  });

  const buttonRef = useRef<View>(null);
  const panelRef = useRef<View>(null);
  const hueRef = useRef<View>(null);
  const panelPosition = useRef({x: 0, y: 0, width: 0, height: 0});
  const huePosition = useRef({x: 0, y: 0, width: 0, height: 0});
  const lastColorRef = useRef(color);

  const localColor = hsvToHex(hue, saturation, brightness);

  // 实时更新颜色
  useEffect(() => {
    // 始终更新 hex 显示，确保与当前颜色同步
    setHexInput(localColor.replace('#', ''));

    if (isOpen && localColor !== lastColorRef.current) {
      lastColorRef.current = localColor;
      onChange(localColor);
    }
  }, [localColor, isOpen, onChange]);

  const panelIndicatorStyle = useMemo(
    () =>
      ({
        left: `${saturation}%`,
        top: `${100 - brightness}%`,
        borderColor: brightness > 50 ? '#000' : '#FFF',
      } as ViewStyle),
    [brightness, saturation],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const handleHexInputChange = (text: string) => {
    const sanitized = text.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    setHexInput(sanitized.toUpperCase());
    if (sanitized.length === 6) {
      const hsv = hexToHsv(`#${sanitized}`);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
    }
  };

  const handlePresetSelect = (presetColor: string) => {
    const hsv = hexToHsv(presetColor);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    setHexInput(presetColor.replace('#', '').toUpperCase());
  };

  const openPicker = useCallback(() => {
    const hsv = hexToHsv(color);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    setHexInput(color.replace('#', '').toUpperCase());
    lastColorRef.current = color;

    // 测量按钮位置并计算弹窗位置
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      const buttonCenterX = x + width / 2;
      let left = buttonCenterX - PICKER_WIDTH / 2;
      // 确保不超出屏幕
      left = Math.max(16, Math.min(left, SCREEN_WIDTH - PICKER_WIDTH - 16));

      // 判断显示在按钮上方还是下方
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      const spaceAbove = y;

      let top;
      if (spaceBelow >= PICKER_HEIGHT + 20) {
        // 下方有足够空间
        top = y + height + 12;
      } else if (spaceAbove >= PICKER_HEIGHT + 20) {
        // 上方有足够空间
        top = y - PICKER_HEIGHT - 12;
      } else {
        // 居中显示
        top = (SCREEN_HEIGHT - PICKER_HEIGHT) / 2;
      }

      setPickerPosition({top, left});
      setIsOpen(true);
    });
  }, [color]);

  const measurePanel = useCallback(() => {
    panelRef.current?.measureInWindow((x, y, width, height) => {
      panelPosition.current = {x, y, width, height};
    });
  }, []);

  const measureHue = useCallback(() => {
    hueRef.current?.measureInWindow((x, y, width, height) => {
      huePosition.current = {x, y, width, height};
    });
  }, []);

  // 色板 PanResponder
  const panelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // 不允许其他响应者抢走手势
      onShouldBlockNativeResponder: () => true, // 阻止原生滚动
      onPanResponderGrant: evt => {
        const {pageX, pageY} = evt.nativeEvent;
        setIsInteracting(true);
        onSlidingStart?.();
        panelRef.current?.measureInWindow((x, y, width, height) => {
          panelPosition.current = {x, y, width, height};
          const relativeX = pageX - x;
          const relativeY = pageY - y;
          const s = Math.max(0, Math.min(100, (relativeX / width) * 100));
          const v = Math.max(
            0,
            Math.min(100, 100 - (relativeY / height) * 100),
          );
          setSaturation(s);
          setBrightness(v);
        });
      },
      onPanResponderMove: evt => {
        const {pageX, pageY} = evt.nativeEvent;
        const {x, y, width, height} = panelPosition.current;
        if (width > 0 && height > 0) {
          const relativeX = pageX - x;
          const relativeY = pageY - y;
          const s = Math.max(0, Math.min(100, (relativeX / width) * 100));
          const v = Math.max(
            0,
            Math.min(100, 100 - (relativeY / height) * 100),
          );
          setSaturation(s);
          setBrightness(v);
        }
      },
      onPanResponderRelease: () => {
        setIsInteracting(false);
        onSlidingComplete?.();
      },
      onPanResponderTerminate: () => {
        setIsInteracting(false);
        onSlidingComplete?.();
      },
    }),
  ).current;

  // 色相 PanResponder
  const huePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // 不允许其他响应者抢走手势
      onShouldBlockNativeResponder: () => true, // 阻止原生滚动
      onPanResponderGrant: evt => {
        const {pageX} = evt.nativeEvent;
        setIsInteracting(true);
        onSlidingStart?.();
        hueRef.current?.measureInWindow((x, _y, width, height) => {
          huePosition.current = {x, y: _y, width, height};
          const relativeX = pageX - x;
          const h = Math.max(0, Math.min(360, (relativeX / width) * 360));
          setHue(h);
        });
      },
      onPanResponderMove: evt => {
        const {pageX} = evt.nativeEvent;
        const {x, width} = huePosition.current;
        if (width > 0) {
          const relativeX = pageX - x;
          const h = Math.max(0, Math.min(360, (relativeX / width) * 360));
          setHue(h);
        }
      },
      onPanResponderRelease: () => {
        setIsInteracting(false);
        onSlidingComplete?.();
      },
      onPanResponderTerminate: () => {
        setIsInteracting(false);
        onSlidingComplete?.();
      },
    }),
  ).current;

  // 预设颜色滑动选择
  const swatchLayouts = useRef<Record<number, {x: number; y: number; width: number; height: number}>>({});
  const swatchContainerRef = useRef<View>(null);
  const swatchContainerPos = useRef({x: 0, y: 0});
  const lastSwatchIndex = useRef(-1);

  const handleSwatchTouch = useCallback(
    (pageX: number, pageY: number) => {
      const rx = pageX - swatchContainerPos.current.x;
      const ry = pageY - swatchContainerPos.current.y;

      for (let i = 0; i < PRESET_COLORS.length; i++) {
        const layout = swatchLayouts.current[i];
        if (
          layout &&
          rx >= layout.x &&
          rx <= layout.x + layout.width &&
          ry >= layout.y &&
          ry <= layout.y + layout.height
        ) {
          if (lastSwatchIndex.current !== i) {
            handlePresetSelect(PRESET_COLORS[i]);
            lastSwatchIndex.current = i;
          }
          break;
        }
      }
    },
    [handlePresetSelect],
  );

  const swatchPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: evt => {
        setIsInteracting(true);
        onSlidingStart?.();
        lastSwatchIndex.current = -1;
        const {pageX, pageY} = evt.nativeEvent;
        swatchContainerRef.current?.measureInWindow((cx, cy) => {
          swatchContainerPos.current = {x: cx, y: cy};
          handleSwatchTouch(pageX, pageY);
        });
      },
      onPanResponderMove: evt => {
        handleSwatchTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
      onPanResponderRelease: () => {
        setIsInteracting(false);
        onSlidingComplete?.();
        lastSwatchIndex.current = -1;
      },
      onPanResponderTerminate: () => {
        setIsInteracting(false);
        onSlidingComplete?.();
        lastSwatchIndex.current = -1;
      },
    }),
  ).current;

  return (
    <>
      {/* 颜色预览按钮 */}
      <TouchableOpacity
        onPress={openPicker}
        onPressIn={() => {
          setIsInteracting(true);
          onSlidingStart?.();
        }}
        onPressOut={() => {
          setIsInteracting(false);
          onSlidingComplete?.();
        }}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label || '选择颜色'}>
        <View
          ref={buttonRef}
          style={[
            styles.colorButton,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}>
          <View style={styles.colorButtonHighlight} />
        </View>
      </TouchableOpacity>

      {label && <Text style={styles.label}>{label}</Text>}

      {/* 颜色选择器弹窗 */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}>
        <Animated.View style={[styles.flex1, {opacity: pickerOpacity}]}>
          <Pressable style={styles.modalOverlay} onPress={handleClose}>
            <Pressable
              onPress={e => e.stopPropagation()}
              style={[
                styles.pickerContainer,
                {
                  top: pickerPosition.top,
                  left: pickerPosition.left,
                },
              ]}>
              {/* 色板 - 饱和度/亮度 */}
              <View
                ref={panelRef}
                style={styles.panel}
                onLayout={measurePanel}
                {...panelPanResponder.panHandlers}>
                <View
                  style={[
                    styles.panelBackground,
                    {backgroundColor: hueToColor(hue)},
                  ]}
                  pointerEvents="none"
                />
                <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Defs>
                    <LinearGradient id="whiteGrad" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
                      <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#whiteGrad)"
                  />
                </Svg>
                <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Defs>
                    <LinearGradient id="blackGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#000000" stopOpacity="0" />
                      <Stop offset="1" stopColor="#000000" stopOpacity="1" />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#blackGrad)"
                  />
                </Svg>
                {/* 指示器 */}
                <View
                  pointerEvents="none"
                  style={[styles.panelIndicator, panelIndicatorStyle]}
                />
              </View>

              {/* 色相滑块 */}
              <View
                ref={hueRef}
                style={styles.hueSlider}
                onLayout={measureHue}
                {...huePanResponder.panHandlers}>
                <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Defs>
                    <LinearGradient id="hueGrad" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0" stopColor="#FF0000" />
                      <Stop offset="0.167" stopColor="#FFFF00" />
                      <Stop offset="0.333" stopColor="#00FF00" />
                      <Stop offset="0.5" stopColor="#00FFFF" />
                      <Stop offset="0.667" stopColor="#0000FF" />
                      <Stop offset="0.833" stopColor="#FF00FF" />
                      <Stop offset="1" stopColor="#FF0000" />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#hueGrad)"
                    rx="12"
                  />
                </Svg>
                <View
                  pointerEvents="none"
                  style={[
                    styles.hueIndicator,
                    {
                      left: `${(hue / 360) * 100}%`,
                      backgroundColor: hueToColor(hue),
                    },
                  ]}
                />
              </View>

              {/* Hex 输入框 */}
              <View style={styles.hexInputContainer}>
                <Text style={styles.hexPrefix}>#</Text>
                <TextInput
                  style={styles.hexInput}
                  value={hexInput}
                  onChangeText={handleHexInputChange}
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* 预设颜色 - 支持滑动选择 */}
              <View
                ref={swatchContainerRef}
                style={styles.swatchRow}
                {...swatchPanResponder.panHandlers}>
                {PRESET_COLORS.map((presetColor, index) => (
                  <View
                    key={presetColor}
                    onLayout={e => {
                      swatchLayouts.current[index] = e.nativeEvent.layout;
                    }}
                    pointerEvents="none"
                    style={[
                      styles.swatch,
                      {backgroundColor: presetColor},
                      localColor.toUpperCase() === presetColor.toUpperCase() &&
                        styles.swatchActive,
                    ]}
                  />
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  colorButton: {
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  colorButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    position: 'absolute',
    width: PICKER_WIDTH,
    backgroundColor: '#1C1C1E', // 强制使用深色背景，接近参考图
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  panel: {
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  panelBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  panelIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    marginLeft: -12,
    marginTop: -12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  hueSlider: {
    height: 24,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  hueIndicator: {
    position: 'absolute',
    top: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: -14,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  hexInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hexPrefix: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: 'Courier',
  },
  hexInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Courier',
    letterSpacing: 2,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center', // 居中显示，保持紧凑的间距
    marginTop: 4,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatchActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
