import type { Node, Edge } from "@xyflow/react";
import type { SchemaAST, TableNode, RelationshipEdge } from "@/app/types";

export const astToNodes = (ast: SchemaAST, positions?: Map<string, { x: number; y: number }>): Node[] => {
  return ast.tables.map((table: TableNode, index: number) => {
    const defaultPosition = positions?.get(table.id) || {
      x: (index % 4) * 300,
      y: Math.floor(index / 4) * 200,
    };

    return {
      id: table.id,
      type: "databaseSchema",
      position: table.position || defaultPosition,
      data: {
        label: table.name,
        schema: table.columns.map((col) => ({
          title: col.name,
          type: col.type,
          primaryKey: col.primaryKey,
          foreignKey: col.foreignKey,
          nullable: col.nullable,
          unique: col.unique,
        })),
      },
    };
  });
};

export const astToEdges = (ast: SchemaAST): Edge[] => {
  return ast.relationships.filter((rel): rel is RelationshipEdge => rel !== null).map((rel: RelationshipEdge) => {
    const fromTable = ast.tables.find((t) => t.name === rel.fromTable);
    const toTable = ast.tables.find((t) => t.name === rel.toTable);

    if (!fromTable || !toTable) {
      throw new Error(`Relationship ${rel.id} has invalid table names: ${rel.fromTable} or ${rel.toTable}`);
    }

    return {
      id: rel.id,
      source: fromTable.id,
      target: toTable.id,
      sourceHandle: `${rel.fromColumn}-source`,
      targetHandle: rel.toColumn,
      type: "default",
      label: rel.type,
    };
  });
};

