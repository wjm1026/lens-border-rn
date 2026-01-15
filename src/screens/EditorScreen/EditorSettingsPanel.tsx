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
} from '../../components';
import type {
  CropControls,
  FrameSettings,
  ParsedExifData,
  TabId,
} from '../../types';

interface EditorSettingsPanelProps {
  activeTab: TabId;
  isOpen: boolean;
  onClose: () => void;
  settings: FrameSettings;
  updateSettings: <K extends keyof FrameSettings>(
    key: K,
    value: FrameSettings[K],
  ) => void;
  patchSettings: (patch: Partial<FrameSettings>) => void;
  cropControls: CropControls;
  onResetInfo: () => void;
  onSave: () => void;
  isSaving: boolean;
  initialExif?: ParsedExifData;
  isSliding: boolean;
  setIsSliding: (sliding: boolean) => void;
}

type PanelRenderProps = Pick<
  EditorSettingsPanelProps,
  | 'settings'
  | 'updateSettings'
  | 'patchSettings'
  | 'cropControls'
  | 'onResetInfo'
  | 'onSave'
  | 'isSaving'
  | 'initialExif'
  | 'isSliding'
  | 'setIsSliding'
>;

const PANEL_RENDERERS: Record<
  TabId,
  (props: PanelRenderProps) => React.ReactNode
> = {
  layout: ({settings, updateSettings, setIsSliding}) => (
    <LayoutPanel
      settings={settings}
      updateSettings={updateSettings}
      setIsSliding={setIsSliding}
    />
  ),
  crop: ({cropControls}) => (
    <CropPanel
      aspectId={cropControls.cropAspect}
      onAspectChange={cropControls.setCropAspect}
      rotation={cropControls.cropRotation}
      onRotationChange={cropControls.setCropRotation}
      onRotateStep={cropControls.handleRotateStep}
      flip={cropControls.cropFlip}
      onFlipChange={cropControls.setCropFlip}
    />
  ),
  border: ({settings, updateSettings, setIsSliding}) => (
    <BorderPanel
      settings={settings}
      updateSettings={updateSettings}
      setIsSliding={setIsSliding}
    />
  ),
  bg: ({settings, updateSettings, patchSettings, setIsSliding}) => (
    <BackgroundPanel
      settings={settings}
      updateSettings={updateSettings}
      patchSettings={patchSettings}
      setIsSliding={setIsSliding}
    />
  ),
  info: ({
    settings,
    updateSettings,
    patchSettings,
    onResetInfo,
    initialExif,
    setIsSliding,
  }) => (
    <InfoPanel
      settings={settings}
      updateSettings={updateSettings}
      patchSettings={patchSettings}
      onReset={onResetInfo}
      initialExif={initialExif}
      setIsSliding={setIsSliding}
    />
  ),
  export: ({settings, updateSettings, onSave, isSaving}) => (
    <ExportPanel
      settings={settings}
      updateSettings={updateSettings}
      onSave={onSave}
      isSaving={isSaving}
    />
  ),
};

export default function EditorSettingsPanel({
  activeTab,
  isOpen,
  onClose,
  settings,
  updateSettings,
  patchSettings,
  cropControls,
  onResetInfo,
  onSave,
  isSaving,
  initialExif,
  isSliding,
  setIsSliding,
}: EditorSettingsPanelProps) {
  const panelContent = PANEL_RENDERERS[activeTab]({
    settings,
    updateSettings,
    patchSettings,
    cropControls,
    onResetInfo,
    onSave,
    isSaving,
    initialExif,
    isSliding,
    setIsSliding,
  });

  return (
    <>
      {isOpen && (
        <Pressable style={styles.panelDismissOverlay} onPress={onClose} />
      )}
      <FloatingPanel
        visible={isOpen}
        contentKey={activeTab}
        isSliding={isSliding}>
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
