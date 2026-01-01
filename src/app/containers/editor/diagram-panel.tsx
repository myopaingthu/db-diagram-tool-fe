import { type FC, useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type Node,
  type NodeChange,
  type EdgeChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore, useEditorPanelStore } from "@/app/store";
import { useSyncContext } from "@/app/contexts/sync.context";
import { useValidatedDiagramEdit } from "@/app/hooks/use-validated-diagram-edit";
import { DatabaseSchemaNodeCustom } from "@/app/components/diagram/database-schema-node-custom";
import { AddTablePanel } from "@/app/components/diagram/add-table-panel";

const nodeTypes = {
  databaseSchema: DatabaseSchemaNodeCustom,
} as const;

export const DiagramPanel: FC = () => {
  const { addRelationship, addTable } = useValidatedDiagramEdit();
  const { debouncedSyncBackend } = useSyncContext();
  const { nodes, edges, setNodes, setEdges, updateNodePosition } =
    useDiagramStore();
  const { selectNode, selectedNodeId, clearSelection } = useEditorPanelStore();

  const nodesWithSelection = nodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
  }));

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log("node changes", changes, nodes);
      const selectChange = changes.find((c) => c.type === "select");
      if (selectChange && selectChange.type === "select") {
        if (selectChange.selected) {
          selectNode(selectChange.id);
        }
      }

      setNodes(applyNodeChanges(changes, nodes));
    },
    [nodes, setNodes, selectNode]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(applyEdgeChanges(changes, edges));
    },
    [edges, setEdges]
  );

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      updateNodePosition(node.id, node.position);
      
      setTimeout(() => {
        const { nodes: currentNodes, edges: currentEdges } = useDiagramStore.getState();
        debouncedSyncBackend({
          nodes: currentNodes,
          edges: currentEdges,
        });
      }, 0);
    },
    [updateNodePosition, debouncedSyncBackend]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
        return;
      }

      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      const fromColumn = connection.sourceHandle.replace("-source", "");
      const toColumn = connection.targetHandle;

      addRelationship(
        connection.source,
        fromColumn,
        connection.target,
        toColumn,
        "ONE_TO_MANY"
      );
    },
    [nodes, addRelationship]
  );

  const handleAddTable = useCallback(() => {
    const tableId = addTable();
    if (tableId) {
      selectNode(tableId);
    }
  }, [addTable, selectNode]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
        <AddTablePanel onAddTable={handleAddTable} />
      </ReactFlow>
    </div>
  );
};

