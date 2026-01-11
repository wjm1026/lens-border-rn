import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
} from 'lucide-react-native';

import {colors} from '../../../theme';
import {Slider} from '../../ui/Slider';
import {
  SegmentedControl,
  type SegmentedOption,
} from '../../ui/SegmentedControl';

export type CropAspectId = 'free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

const CROP_ASPECT_OPTIONS: SegmentedOption<CropAspectId>[] = [
  {id: 'free', label: '自由'},
  {id: '1:1', label: '1:1'},
  {id: '4:3', label: '4:3'},
  {id: '3:4', label: '3:4'},
  {id: '16:9', label: '16:9'},
  {id: '9:16', label: '9:16'},
];

interface CropPanelProps {
  aspectId: CropAspectId;
  onAspectChange: (id: CropAspectId) => void;
  zoom: number;
  minZoom?: number;
  onZoomChange: (value: number) => void;
  rotation: number;
  onRotationChange: (value: number) => void;
  onRotateStep: (delta: number) => void;
  flip: {horizontal: boolean; vertical: boolean};
  onFlipChange: (value: {horizontal: boolean; vertical: boolean}) => void;
}

export default function CropPanel({
  aspectId,
  onAspectChange,
  zoom,
  minZoom = 1,
  onZoomChange,
  rotation,
  onRotationChange,
  onRotateStep,
  flip,
  onFlipChange,
}: CropPanelProps) {
  const isFree = aspectId === 'free';

  return (
    <View style={styles.container}>
      <SegmentedControl<CropAspectId>
        label="裁剪比例"
        options={CROP_ASPECT_OPTIONS}
        value={aspectId}
        onChange={onAspectChange}
      />

      <Slider
        label="缩放"
        value={zoom}
        min={minZoom}
        max={Math.max(minZoom + 2, 3)}
        step={0.1}
        onChange={onZoomChange}
        unit="x"
      />

      <Slider
        label="旋转角度"
        value={rotation}
        min={0}
        max={360}
        step={1}
        onChange={onRotationChange}
        unit="°"
      />

      <View style={styles.rotateRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonLeft]}
          onPress={() => onRotateStep(-90)}
          activeOpacity={0.7}>
          <RotateCcw color={colors.textSecondary} size={16} />
          <Text style={styles.actionLabel}>左转 90°</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onRotateStep(90)}
          activeOpacity={0.7}>
          <RotateCw color={colors.textSecondary} size={16} />
          <Text style={styles.actionLabel}>右转 90°</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flipRow}>
        <TouchableOpacity
          style={[
            styles.flipButton,
            styles.flipButtonLeft,
            flip.horizontal && styles.flipButtonActive,
          ]}
          onPress={() =>
            onFlipChange({
              horizontal: !flip.horizontal,
              vertical: flip.vertical,
            })
          }
          activeOpacity={0.7}>
          <FlipHorizontal
            color={flip.horizontal ? colors.textPrimary : colors.textSecondary}
            size={16}
          />
          <Text
            style={[
              styles.flipLabel,
              flip.horizontal && styles.flipLabelActive,
            ]}>
            水平
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.flipButton, flip.vertical && styles.flipButtonActive]}
          onPress={() =>
            onFlipChange({
              horizontal: flip.horizontal,
              vertical: !flip.vertical,
            })
          }
          activeOpacity={0.7}>
          <FlipVertical
            color={flip.vertical ? colors.textPrimary : colors.textSecondary}
            size={16}
          />
          <Text
            style={[styles.flipLabel, flip.vertical && styles.flipLabelActive]}>
            垂直
          </Text>
        </TouchableOpacity>
      </View>

      {isFree && <Text style={styles.hint}>拖动裁剪框四角调整比例</Text>}
      <Text style={styles.hint}>拖拽图片移动</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  rotateRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonLeft: {
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  flipRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  flipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flipButtonLeft: {
    marginRight: 12,
  },
  flipButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  flipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  flipLabelActive: {
    color: colors.textPrimary,
  },
  hint: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
