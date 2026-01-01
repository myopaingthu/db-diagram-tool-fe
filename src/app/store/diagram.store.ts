import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import {
  getNextTableId,
  getNextTableName,
  getNextColumnName,
  getNextRelationshipId,
} from "@/app/utils/flow-to-ast";

export interface ColumnData {
  title: string;
  type: string;
  primaryKey?: boolean;
  foreignKey?: { table: string; column: string };
  nullable?: boolean;
  unique?: boolean;
}

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  diagramId: string | null;
  previousNodes: Node[];
  previousEdges: Edge[];

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setDiagramId: (id: string | null) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  reset: () => void;
  savePreviousState: () => void;
  revertToPrevious: () => void;

  addTable: (position?: { x: number; y: number }) => string;
  removeTable: (tableId: string) => void;
  updateTableName: (tableId: string, name: string) => void;

  addColumn: (tableId: string, column?: Partial<ColumnData>) => void;
  removeColumn: (tableId: string, columnTitle: string) => void;
  updateColumn: (tableId: string, columnTitle: string, updates: Partial<ColumnData>) => void;

  addRelationship: (
    fromTableId: string,
    fromColumn: string,
    toTableId: string,
    toColumn: string,
    type?: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY"
  ) => string;
  removeRelationship: (edgeId: string) => void;
  updateRelationshipType: (edgeId: string, type: string) => void;

  getNodeById: (nodeId: string) => Node | undefined;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  diagramId: null,
  previousNodes: [],
  previousEdges: [],

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
      previousNodes: [],
      previousEdges: [],
    }),

  savePreviousState: () =>
    set((state) => ({
      previousNodes: [...state.nodes],
      previousEdges: [...state.edges],
    })),

  revertToPrevious: () =>
    set((state) => ({
      nodes: [...state.previousNodes],
      edges: [...state.previousEdges],
    })),

  addTable: (position) => {
    const { nodes } = get();
    const tableId = getNextTableId(nodes);
    const tableName = getNextTableName(nodes);

    const defaultPosition = position || {
      x: (nodes.length % 4) * 300,
      y: Math.floor(nodes.length / 4) * 250,
    };

    const newNode: Node = {
      id: tableId,
      type: "databaseSchema",
      position: defaultPosition,
      data: {
        label: tableName,
        schema: [
          {
            title: "id",
            type: "integer",
            primaryKey: true,
            nullable: false,
            unique: false,
          },
        ],
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));

    return tableId;
  },

  removeTable: (tableId) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== tableId),
      edges: state.edges.filter(
        (edge) => edge.source !== tableId && edge.target !== tableId
      ),
    })),

  updateTableName: (tableId, name) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === tableId
          ? { ...node, data: { ...node.data, label: name } }
          : node
      ),
    })),

  addColumn: (tableId, column) => {
    const { nodes } = get();
    const node = nodes.find((n) => n.id === tableId);
    if (!node) return;

    const data = node.data as { label: string; schema: ColumnData[] };
    const columnName = column?.title || getNextColumnName(data.schema);

    const newColumn: ColumnData = {
      title: columnName,
      type: column?.type || "varchar",
      primaryKey: column?.primaryKey || false,
      nullable: column?.nullable !== false,
      unique: column?.unique || false,
      foreignKey: column?.foreignKey,
    };

    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== tableId) return n;
        const nodeData = n.data as { label: string; schema: ColumnData[] };
        return {
          ...n,
          data: {
            ...nodeData,
            schema: [...nodeData.schema, newColumn],
          },
        };
      }),
    }));
  },

  removeColumn: (tableId, columnTitle) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== tableId) return node;
        const data = node.data as { label: string; schema: ColumnData[] };
        return {
          ...node,
          data: {
            ...data,
            schema: data.schema.filter((col) => col.title !== columnTitle),
          },
        };
      }),
      edges: state.edges.filter((edge) => {
        if (edge.source === tableId) {
          const sourceHandle = edge.sourceHandle || "";
          if (sourceHandle.replace("-source", "") === columnTitle) return false;
        }
        if (edge.target === tableId) {
          if (edge.targetHandle === columnTitle) return false;
        }
        return true;
      }),
    })),

  updateColumn: (tableId, columnTitle, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id !== tableId) return node;
        const data = node.data as { label: string; schema: ColumnData[] };
        return {
          ...node,
          data: {
            ...data,
            schema: data.schema.map((col) =>
              col.title === columnTitle ? { ...col, ...updates } : col
            ),
          },
        };
      }),
    })),

  addRelationship: (fromTableId, fromColumn, toTableId, toColumn, type = "ONE_TO_MANY") => {
    const { edges } = get();
    const edgeId = getNextRelationshipId(edges);

    const newEdge: Edge = {
      id: edgeId,
      source: fromTableId,
      target: toTableId,
      sourceHandle: `${fromColumn}-source`,
      targetHandle: toColumn,
      type: "default",
      label: type,
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    return edgeId;
  },

  removeRelationship: (edgeId) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    })),

  updateRelationshipType: (edgeId, type) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, label: type } : edge
      ),
    })),

  getNodeById: (nodeId) => {
    const { nodes } = get();
    return nodes.find((n) => n.id === nodeId);
  },
}));

