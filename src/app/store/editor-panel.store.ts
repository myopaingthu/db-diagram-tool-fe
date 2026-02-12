import { create } from "zustand";

type TabValue = "dbml" | "properties" | "ai";

interface EditorPanelState {
  activeTab: TabValue;
  selectedNodeId: string | null;
  setActiveTab: (tab: TabValue) => void;
  setSelectedNodeId: (id: string | null) => void;
  selectNode: (id: string) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const useEditorPanelStore = create<EditorPanelState>((set) => ({
  activeTab: "dbml",
  selectedNodeId: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  selectNode: (id) =>
    set({
      selectedNodeId: id,
      activeTab: "properties",
    }),

  clearSelection: () =>
    set({
      selectedNodeId: null,
      activeTab: "dbml",
    }),

  reset: () =>
    set({
      activeTab: "dbml",
      selectedNodeId: null,
    }),
}));
