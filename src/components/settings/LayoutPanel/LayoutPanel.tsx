import React from 'react';
import {View, StyleSheet} from 'react-native';

import {Slider} from '../../ui/Slider';
import {SegmentedControl} from '../../ui/SegmentedControl';
import {ASPECT_RATIO_OPTIONS} from '../../../config';
import type {FrameSettings, AspectRatio} from '../../../types';

interface LayoutPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  setIsSliding: (sliding: boolean) => void;
}

export default function LayoutPanel({
  settings,
  updateSettings,
  setIsSliding,
}: LayoutPanelProps) {
  return (
    <View style={styles.container}>
      <Slider
        label="画布外边距"
        value={settings.padding}
        min={0}
        max={200}
        step={1}
        onChange={val => updateSettings('padding', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
        unit="px"
      />

      <SegmentedControl<AspectRatio>
        label="容器比例"
        options={ASPECT_RATIO_OPTIONS}
        value={settings.aspectRatio}
        onChange={val => updateSettings('aspectRatio', val)}
        onSlidingStart={() => setIsSliding(true)}
        onSlidingComplete={() => setIsSliding(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
});
