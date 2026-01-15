import React, {useRef, useCallback} from 'react';
import {View, PanResponder, StyleSheet, ViewStyle} from 'react-native';

interface SwatchPickerProps<T> {
  items: ReadonlyArray<T>;
  onSelect: (item: T) => void;
  renderItem: (item: T, isActive: boolean, index: number) => React.ReactNode;
  activeId: string | number | undefined;
  getId: (item: T, index: number) => string | number;
  setIsSliding: (sliding: boolean) => void;
  containerStyle?: ViewStyle;
}

export function SwatchPicker<T>({
  items,
  onSelect,
  renderItem,
  activeId,
  getId,
  setIsSliding,
  containerStyle,
}: SwatchPickerProps<T>) {
  const layouts = useRef<
    Record<number, {x: number; y: number; width: number; height: number}>
  >({}).current;
  const containerRef = useRef<View>(null);
  const lastSelectedIndex = useRef<number>(-1);

  const containerPos = useRef({x: 0, y: 0}).current;

  const handleTouch = useCallback(
    (pageX: number, pageY: number) => {
      const rx = pageX - containerPos.x;
      const ry = pageY - containerPos.y;

      for (let i = 0; i < items.length; i++) {
        const l = layouts[i];
        if (
          l &&
          rx >= l.x &&
          rx <= l.x + l.width &&
          ry >= l.y &&
          ry <= l.y + l.height
        ) {
          if (lastSelectedIndex.current !== i) {
            onSelect(items[i]);
            lastSelectedIndex.current = i;
          }
          break;
        }
      }
    },
    [items, onSelect, layouts, containerPos],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: evt => {
        setIsSliding(true);
        lastSelectedIndex.current = -1;
        const {pageX, pageY} = evt.nativeEvent;
        containerRef.current?.measureInWindow((cx, cy) => {
          containerPos.x = cx;
          containerPos.y = cy;
          handleTouch(pageX, pageY);
        });
      },
      onPanResponderMove: evt => {
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
      onPanResponderRelease: () => {
        setIsSliding(false);
        lastSelectedIndex.current = -1;
      },
      onPanResponderTerminate: () => {
        setIsSliding(false);
        lastSelectedIndex.current = -1;
      },
    }),
  ).current;

  return (
    <View
      ref={containerRef}
      style={[styles.container, containerStyle]}
      {...panResponder.panHandlers}>
      {items.map((item, index) => (
        <View
          key={getId(item, index)}
          onLayout={e => {
            layouts[index] = e.nativeEvent.layout;
          }}
          pointerEvents="none">
          {renderItem(item, getId(item, index) === activeId, index)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
