import type { SchemaAST, TableNode } from "@/app/types";

export interface ValidationError {
  table?: string;
  column?: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export const validateAst = (ast: SchemaAST): ValidationResult => {
  const errors: ValidationError[] = [];
  const tableNames = new Set<string>();
  const tableMap = new Map<string, TableNode>();

  for (const table of ast.tables) {
    if (!table.name || table.name.trim() === "") {
      errors.push({
        table: table.id,
        message: "Table name is required",
        code: "MISSING_TABLE_NAME",
      });
      continue;
    }

    if (tableNames.has(table.name)) {
      errors.push({
        table: table.name,
        message: `Duplicate table name: ${table.name}`,
        code: "DUPLICATE_TABLE",
      });
    } else {
      tableNames.add(table.name);
      tableMap.set(table.name, table);
    }

    if (!table.columns || table.columns.length === 0) {
      errors.push({
        table: table.name,
        message: `Table ${table.name} must have at least one column`,
        code: "EMPTY_TABLE",
      });
      continue;
    }

    const columnNames = new Set<string>();
    for (const column of table.columns) {
      if (!column.name || column.name.trim() === "") {
        errors.push({
          table: table.name,
          column: "unknown",
          message: "Column name is required",
          code: "MISSING_COLUMN_NAME",
        });
        continue;
      }

      if (columnNames.has(column.name)) {
        errors.push({
          table: table.name,
          column: column.name,
          message: `Duplicate column name: ${column.name} in table ${table.name}`,
          code: "DUPLICATE_COLUMN",
        });
      } else {
        columnNames.add(column.name);
      }

      if (!column.type || column.type.trim() === "") {
        errors.push({
          table: table.name,
          column: column.name,
          message: `Column ${column.name} must have a type`,
          code: "MISSING_COLUMN_TYPE",
        });
      }
    }
  }

  for (const rel of ast.relationships) {
    if (!rel.fromTable || !rel.toTable) {
      errors.push({
        message: `Relationship ${rel.id} has invalid endpoints`,
        code: "INVALID_RELATIONSHIP_ENDPOINTS",
      });
      continue;
    }

    if (!tableNames.has(rel.fromTable)) {
      errors.push({
        table: rel.fromTable,
        message: `Relationship references non-existent table: ${rel.fromTable}`,
        code: "INVALID_RELATIONSHIP_TABLE",
      });
    }

    if (!tableNames.has(rel.toTable)) {
      errors.push({
        table: rel.toTable,
        message: `Relationship references non-existent table: ${rel.toTable}`,
        code: "INVALID_RELATIONSHIP_TABLE",
      });
    }

    const fromTable = tableMap.get(rel.fromTable);
    if (fromTable && rel.fromColumn) {
      const hasColumn = fromTable.columns.some(
        (col) => col.name === rel.fromColumn
      );
      if (!hasColumn) {
        errors.push({
          table: rel.fromTable,
          column: rel.fromColumn,
          message: `Column ${rel.fromColumn} does not exist in table ${rel.fromTable}`,
          code: "INVALID_RELATIONSHIP_COLUMN",
        });
      }
    }

    const toTable = tableMap.get(rel.toTable);
    if (toTable && rel.toColumn) {
      const hasColumn = toTable.columns.some(
        (col) => col.name === rel.toColumn
      );
      if (!hasColumn) {
        errors.push({
          table: rel.toTable,
          column: rel.toColumn,
          message: `Column ${rel.toColumn} does not exist in table ${rel.toTable}`,
          code: "INVALID_RELATIONSHIP_COLUMN",
        });
      }
    }

    if (
      rel.fromTable === rel.toTable &&
      rel.fromColumn === rel.toColumn &&
      rel.fromColumn
    ) {
      errors.push({
        table: rel.fromTable,
        column: rel.fromColumn,
        message: `Cannot create relationship from column to itself`,
        code: "SELF_REFERENCING_COLUMN",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

