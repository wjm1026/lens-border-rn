import React from 'react';
import {View, StyleSheet} from 'react-native';

import {Slider} from '../../ui/Slider';
import {SegmentedControl} from '../../ui/SegmentedControl';
import type {FrameSettings, AspectRatio} from '../../../types';

const ASPECT_RATIO_OPTIONS = [
  {id: 'original' as const, label: '适应'},
  {id: 'square' as const, label: '1:1'},
  {id: 'portrait' as const, label: '3:4'},
  {id: 'landscape' as const, label: '4:3'},
];

interface LayoutPanelProps {
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
}

export default function LayoutPanel({
  settings,
  updateSettings,
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
        unit="px"
      />

      <SegmentedControl<AspectRatio>
        label="容器比例"
        options={ASPECT_RATIO_OPTIONS}
        value={settings.aspectRatio}
        onChange={val => updateSettings('aspectRatio', val)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
});
