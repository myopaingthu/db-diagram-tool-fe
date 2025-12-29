import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { LabeledHandle } from "@/components/labeled-handle";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/database-schema-node";

export interface DatabaseSchemaNodeData {
  label: string;
  schema: Array<{
    title: string;
    type: string;
    primaryKey?: boolean;
    foreignKey?: { table: string; column: string };
    nullable?: boolean;
    unique?: boolean;
  }>;
}

export const DatabaseSchemaNodeCustom = memo(
  ({ data }: NodeProps<any>) => {
    return (
      <DatabaseSchemaNode className="p-0">
        <DatabaseSchemaNodeHeader>{data.label}</DatabaseSchemaNodeHeader>
        <DatabaseSchemaNodeBody>
          {data.schema.map((entry: any) => (
            <DatabaseSchemaTableRow key={entry.title}>
              <DatabaseSchemaTableCell className="pl-0 pr-6 font-light">
                <LabeledHandle
                  id={entry.title}
                  title={entry.title}
                  type="target"
                  position={Position.Left}
                />
              </DatabaseSchemaTableCell>
              <DatabaseSchemaTableCell className="pr-0 font-thin">
                <div className="flex items-center justify-between">
                  {/*<span className="text-xs">{entry.type}</span>*/}
                  <div className="flex gap-1">
                    {entry.primaryKey && (
                      <span className="text-xs text-yellow-600">PK</span>
                    )}
                    {entry.unique && (
                      <span className="text-xs text-green-600">U</span>
                    )}
                    {!entry.nullable && (
                      <span className="text-xs text-red-600">NN</span>
                    )}
                  </div>
                </div>
                <LabeledHandle
                  id={`${entry.title}-source`}
                  title={entry.type}
                  type="source"
                  position={Position.Right}
                  className="p-0"
                  handleClassName="p-0"
                  labelClassName="p-0 w-full pr-3 text-right"
                />
              </DatabaseSchemaTableCell>
            </DatabaseSchemaTableRow>
          ))}
        </DatabaseSchemaNodeBody>
      </DatabaseSchemaNode>
    );
  }
);

DatabaseSchemaNodeCustom.displayName = "DatabaseSchemaNodeCustom";

