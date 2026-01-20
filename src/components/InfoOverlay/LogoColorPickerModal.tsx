import React from 'react';
import {ColorPicker} from '../ui';

interface LogoColorPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

export default function LogoColorPickerModal({
  visible,
  onClose,
  currentColor,
  onColorChange,
}: LogoColorPickerModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <ColorPicker
      color={currentColor}
      onChange={onColorChange}
      size={0} // Hide the trigger button
      initialOpen={true}
      onClose={onClose}
    />
  );
}
