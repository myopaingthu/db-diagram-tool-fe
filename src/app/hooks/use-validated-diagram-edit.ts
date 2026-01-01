import { useCallback } from "react";
import { useDiagramStore } from "@/app/store/diagram.store";
import { useSyncContext } from "@/app/contexts/sync.context";
import { flowToAst } from "@/app/utils/flow-to-ast";
import { validateAst } from "@/app/utils/ast-validator";
import { toast } from "sonner";
import type { ColumnData } from "@/app/store/diagram.store";

export const useValidatedDiagramEdit = () => {
  const { syncAstToBackend } = useSyncContext();
  const {
    updateTableName: storeUpdateTableName,
    addTable: storeAddTable,
    addColumn: storeAddColumn,
    removeColumn: storeRemoveColumn,
    updateColumn: storeUpdateColumn,
    addRelationship: storeAddRelationship,
    removeRelationship: storeRemoveRelationship,
    updateRelationshipType: storeUpdateRelationshipType,
    removeTable: storeRemoveTable,
    savePreviousState,
    revertToPrevious,
  } = useDiagramStore();


  const addTable = useCallback(
    (position?: { x: number; y: number }) => {
      savePreviousState();
      const tableId = storeAddTable(position);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return null;
      }

      syncAstToBackend(ast);
      return tableId;
    },
    [storeAddTable, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const updateTableName = useCallback(
    (tableId: string, name: string) => {
      savePreviousState();
      storeUpdateTableName(tableId, name);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeUpdateTableName, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const addColumn = useCallback(
    (tableId: string, column?: Partial<ColumnData>) => {
      savePreviousState();
      storeAddColumn(tableId, column);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeAddColumn, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const removeColumn = useCallback(
    (tableId: string, columnTitle: string) => {
      savePreviousState();
      storeRemoveColumn(tableId, columnTitle);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeRemoveColumn, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const updateColumn = useCallback(
    (tableId: string, columnTitle: string, updates: Partial<ColumnData>) => {
      savePreviousState();
      storeUpdateColumn(tableId, columnTitle, updates);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeUpdateColumn, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const addRelationship = useCallback(
    (
      fromTableId: string,
      fromColumn: string,
      toTableId: string,
      toColumn: string,
      type?: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY"
    ) => {
      savePreviousState();
      const edgeId = storeAddRelationship(fromTableId, fromColumn, toTableId, toColumn, type);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return edgeId;
      }

      syncAstToBackend(ast);
      return edgeId;
    },
    [storeAddRelationship, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const removeRelationship = useCallback(
    (edgeId: string) => {
      savePreviousState();
      storeRemoveRelationship(edgeId);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeRemoveRelationship, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const updateRelationshipType = useCallback(
    (edgeId: string, type: string) => {
      savePreviousState();
      storeUpdateRelationshipType(edgeId, type);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeUpdateRelationshipType, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  const removeTable = useCallback(
    (tableId: string) => {
      savePreviousState();
      storeRemoveTable(tableId);
      const { nodes: updatedNodes, edges: updatedEdges } = useDiagramStore.getState();
      const ast = flowToAst(updatedNodes, updatedEdges);
      const validation = validateAst(ast);

      if (!validation.valid) {
        toast.error(validation.errors[0]?.message || "Validation failed");
        revertToPrevious();
        return;
      }

      syncAstToBackend(ast);
    },
    [storeRemoveTable, savePreviousState, revertToPrevious, syncAstToBackend]
  );

  return {
    addTable,
    updateTableName,
    addColumn,
    removeColumn,
    updateColumn,
    addRelationship,
    removeRelationship,
    updateRelationshipType,
    removeTable,
  };
};

