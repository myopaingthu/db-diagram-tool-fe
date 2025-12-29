import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  diagramId: string | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setDiagramId: (id: string | null) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  reset: () => void;
}

export const useDiagramStore = create<DiagramState>((set) => ({
  nodes: [],
  edges: [],
  diagramId: null,
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setDiagramId: (id) => set({ diagramId: id }),
  updateNodePosition: (nodeId, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, position } : node
      ),
    })),
  reset: () =>
    set({
      nodes: [],
      edges: [],
      diagramId: null,
    }),
}));

