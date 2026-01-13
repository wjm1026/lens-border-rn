import {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, type View} from 'react-native';

export interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

interface UseMenuPositionOptions {
  maxHeight: number;
  padding?: number;
  offset?: number;
  onClose?: () => void;
  onOpen?: () => void;
}

export const useMenuPosition = ({
  maxHeight,
  padding = 12,
  offset = 8,
  onClose,
  onOpen,
}: UseMenuPositionOptions) => {
  const triggerRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight,
  });

  useEffect(() => {
    setMenuPosition(prev => ({...prev, maxHeight}));
  }, [maxHeight]);

  const openMenu = useCallback(() => {
    const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const resolvedMaxHeight = Math.min(
        maxHeight,
        screenHeight - padding * 2,
      );
      let left = Math.max(
        padding,
        Math.min(x, screenWidth - width - padding),
      );
      let top = y + height + offset;

      const spaceBelow = screenHeight - (y + height);
      const spaceAbove = y;
      const threshold = resolvedMaxHeight + offset * 2;

      if (spaceBelow < threshold && spaceAbove >= threshold) {
        top = y - resolvedMaxHeight - offset;
      } else if (spaceBelow < threshold && spaceAbove < threshold) {
        top = Math.max(padding, screenHeight - resolvedMaxHeight - padding);
      }

      if (left + width > screenWidth - padding) {
        left = screenWidth - width - padding;
      }

      setMenuPosition({top, left, width, maxHeight: resolvedMaxHeight});
      setIsOpen(true);
      onOpen?.();
    });
  }, [maxHeight, offset, onOpen, padding]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  return {
    isOpen,
    menuPosition,
    openMenu,
    closeMenu,
    triggerRef,
  };
};
