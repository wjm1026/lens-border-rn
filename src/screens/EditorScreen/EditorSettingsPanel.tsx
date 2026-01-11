import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import {
  BackgroundPanel,
  BorderPanel,
  CropPanel,
  ExportPanel,
  FloatingPanel,
  InfoPanel,
  LayoutPanel,
  type TabId,
} from '../../components';
import type {CropAspectId, FrameSettings} from '../../types';

type CropControls = {
  cropAspect: CropAspectId;
  cropZoom: number;
  cropRotation: number;
  cropFlip: {horizontal: boolean; vertical: boolean};
  minZoom: number;
  setCropAspect: (id: CropAspectId) => void;
  setCropZoom: (value: number) => void;
  setCropRotation: (value: number) => void;
  setCropFlip: (value: {horizontal: boolean; vertical: boolean}) => void;
  handleRotateStep: (delta: number) => void;
};

interface EditorSettingsPanelProps {
  activeTab: TabId;
  isOpen: boolean;
  onClose: () => void;
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  cropControls: CropControls;
  onResetInfo: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function EditorSettingsPanel({
  activeTab,
  isOpen,
  onClose,
  settings,
  updateSettings,
  cropControls,
  onResetInfo,
  onSave,
  isSaving,
}: EditorSettingsPanelProps) {
  let panelContent: React.ReactNode = null;
  switch (activeTab) {
    case 'layout':
      panelContent = (
        <LayoutPanel settings={settings} updateSettings={updateSettings} />
      );
      break;
    case 'crop':
      panelContent = (
        <CropPanel
          aspectId={cropControls.cropAspect}
          onAspectChange={cropControls.setCropAspect}
          zoom={cropControls.cropZoom}
          minZoom={cropControls.minZoom}
          onZoomChange={cropControls.setCropZoom}
          rotation={cropControls.cropRotation}
          onRotationChange={cropControls.setCropRotation}
          onRotateStep={cropControls.handleRotateStep}
          flip={cropControls.cropFlip}
          onFlipChange={cropControls.setCropFlip}
        />
      );
      break;
    case 'border':
      panelContent = (
        <BorderPanel settings={settings} updateSettings={updateSettings} />
      );
      break;
    case 'bg':
      panelContent = (
        <BackgroundPanel settings={settings} updateSettings={updateSettings} />
      );
      break;
    case 'info':
      panelContent = (
        <InfoPanel
          settings={settings}
          updateSettings={updateSettings}
          onReset={onResetInfo}
        />
      );
      break;
    case 'export':
      panelContent = (
        <ExportPanel
          settings={settings}
          updateSettings={updateSettings}
          onSave={onSave}
          isSaving={isSaving}
        />
      );
      break;
    default:
      panelContent = null;
  }

  if (!panelContent) {
    return null;
  }

  return (
    <>
      {isOpen && <Pressable style={styles.panelDismissOverlay} onPress={onClose} />}
      <FloatingPanel visible={isOpen} contentKey={activeTab}>
        {panelContent}
      </FloatingPanel>
    </>
  );
}

const styles = StyleSheet.create({
  panelDismissOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
