/**
 * useEditorPanelState Hook
 *
 * 管理编辑器面板的状态：
 * - activeTab: 当前激活的标签页
 * - isPanelOpen: 面板是否展开
 *
 * 状态转换逻辑：
 * - 点击同一个 Tab: 切换面板展开/收起
 * - 点击不同 Tab: 切换到该 Tab 并展开面板
 */

import {useCallback, useReducer} from 'react';

import {DEFAULT_EDITOR_TAB} from '../config';
import type {TabId} from '../types';

type EditorPanelState = {
  activeTab: TabId;
  isPanelOpen: boolean;
};

type EditorPanelAction =
  | {type: 'tab.change'; tab: TabId}
  | {type: 'panel.close'};

const editorPanelReducer = (
  state: EditorPanelState,
  action: EditorPanelAction,
): EditorPanelState => {
  switch (action.type) {
    case 'tab.change': {
      const isSameTab = state.activeTab === action.tab;
      return {
        activeTab: action.tab,
        isPanelOpen: isSameTab ? !state.isPanelOpen : true,
      };
    }
    case 'panel.close':
      return {...state, isPanelOpen: false};
    default:
      return state;
  }
};

export const useEditorPanelState = (
  initialTab: TabId = DEFAULT_EDITOR_TAB,
) => {
  const [state, dispatch] = useReducer(editorPanelReducer, {
    activeTab: initialTab,
    isPanelOpen: false,
  });

  const handleTabChange = useCallback((nextTab: TabId) => {
    dispatch({type: 'tab.change', tab: nextTab});
  }, []);

  const closePanel = useCallback(() => {
    dispatch({type: 'panel.close'});
  }, []);

  return {
    activeTab: state.activeTab,
    isPanelOpen: state.isPanelOpen,
    handleTabChange,
    closePanel,
  };
};
