import type { Node, Edge } from "@xyflow/react";
import type { SchemaAST, TableNode, Column, RelationshipEdge } from "@/app/types";

export const nodesToTables = (nodes: Node[]): TableNode[] => {
  return nodes
    .filter((node) => node.type === "databaseSchema")
    .map((node) => {
      const data = node.data as {
        label: string;
        schema: Array<{
          title: string;
          type: string;
          primaryKey?: boolean;
          foreignKey?: { table: string; column: string };
          nullable?: boolean;
          unique?: boolean;
        }>;
      };

      const columns: Column[] = data.schema.map((col) => ({
        name: col.title,
        type: col.type,
        primaryKey: col.primaryKey || false,
        foreignKey: col.foreignKey,
        nullable: col.nullable !== false,
        unique: col.unique || false,
      }));

      return {
        id: node.id,
        name: data.label,
        columns,
        position: node.position,
      };
    });
};

export const edgesToRelationships = (
  edges: Edge[],
  nodes: Node[]
): RelationshipEdge[] => {
  const nodeMap = new Map<string, Node>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  return edges
    .filter((edge) => edge.source && edge.target)
    .map((edge) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (!sourceNode || !targetNode) {
        throw new Error(
          `Edge ${edge.id} references invalid nodes: ${edge.source} or ${edge.target}`
        );
      }

      const sourceData = sourceNode.data as { label: string };
      const targetData = targetNode.data as { label: string };

      const sourceHandle = edge.sourceHandle || "";
      const targetHandle = edge.targetHandle || "";

      const fromColumn = sourceHandle.replace("-source", "");
      const toColumn = targetHandle;

      const edgeType =
        (edge.label as string) || (edge.data?.type as string) || "ONE_TO_MANY";

      return {
        id: edge.id,
        fromTable: sourceData.label,
        fromColumn,
        toTable: targetData.label,
        toColumn,
        type: edgeType as "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY",
      };
    });
};

export const flowToAst = (nodes: Node[], edges: Edge[]): SchemaAST => {
  const tables = nodesToTables(nodes);
  const relationships = edgesToRelationships(edges, nodes);

  return {
    tables,
    relationships,
  };
};

export const getNextTableId = (nodes: Node[]): string => {
  const existingIds = nodes
    .map((n) => n.id)
    .filter((id) => id.startsWith("table_"))
    .map((id) => parseInt(id.replace("table_", ""), 10))
    .filter((num) => !isNaN(num));

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `table_${maxId + 1}`;
};

export const getNextRelationshipId = (edges: Edge[]): string => {
  const existingIds = edges
    .map((e) => e.id)
    .filter((id) => id.startsWith("rel_"))
    .map((id) => parseInt(id.replace("rel_", ""), 10))
    .filter((num) => !isNaN(num));

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `rel_${maxId + 1}`;
};

export const getNextTableName = (nodes: Node[]): string => {
  const existingNames = new Set(
    nodes.map((n) => (n.data as { label: string }).label)
  );
  let counter = nodes.length + 1;
  let name = `new_table_${counter}`;
  while (existingNames.has(name)) {
    counter++;
    name = `new_table_${counter}`;
  }
  return name;
};

export const getNextColumnName = (
  schema: Array<{ title: string }>
): string => {
  const existingNames = new Set(schema.map((c) => c.title));
  let counter = schema.length + 1;
  let name = `column_${counter}`;
  while (existingNames.has(name)) {
    counter++;
    name = `column_${counter}`;
  }
  return name;
};

