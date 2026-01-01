import { type FC, useState } from "react";
import { useDiagramStore, useEditorPanelStore } from "@/app/store";
import { useValidatedDiagramEdit } from "@/app/hooks/use-validated-diagram-edit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ColumnData } from "@/app/store/diagram.store";

const COLUMN_TYPES = [
  "integer",
  "varchar",
  "text",
  "boolean",
  "timestamp",
  "date",
  "datetime",
  "float",
  "decimal",
  "bigint",
  "smallint",
  "uuid",
  "json",
  "string",
];

const RELATIONSHIP_TYPES = ["ONE_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY"];

export const NodePropertyPanel: FC = () => {
  const { selectedNodeId, clearSelection } = useEditorPanelStore();
  const {
    nodes,
    edges,
    getNodeById,
  } = useDiagramStore();
  const {
    updateTableName,
    addColumn,
    removeColumn,
    updateColumn,
    removeTable,
    addRelationship,
    removeRelationship,
  } = useValidatedDiagramEdit();

  const [deleteTableOpen, setDeleteTableOpen] = useState(false);
  const [deleteColumnOpen, setDeleteColumnOpen] = useState<string | null>(null);
  const [deleteRelationshipOpen, setDeleteRelationshipOpen] = useState<string | null>(null);
  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false);
  const [editRelationshipOpen, setEditRelationshipOpen] = useState<string | null>(null);

  const [newRelationship, setNewRelationship] = useState({
    fromColumn: "",
    toTableId: "",
    toColumn: "",
    type: "ONE_TO_MANY" as "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY",
  });

  const [editRelationship, setEditRelationship] = useState<{
    edgeId: string;
    fromColumn: string;
    toTableId: string;
    toColumn: string;
    type: "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY";
  } | null>(null);

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
        <p>Select a table to edit its properties</p>
      </div>
    );
  }

  const data = selectedNode.data as { label: string; schema: ColumnData[] };
  const tableEdges = edges.filter(
    (e) => e.source === selectedNodeId || e.target === selectedNodeId
  );

  const handleTableNameChange = (value: string) => {
    if (selectedNodeId) {
      updateTableName(selectedNodeId, value);
    }
    console.log("Table name updated:", { tableId: selectedNodeId, name: value });
  };

  const handleAddColumn = () => {
    if (selectedNodeId) {
      addColumn(selectedNodeId);
    }
    console.log("Column added to table:", selectedNodeId);
  };

  const handleRemoveColumn = (columnTitle: string) => {
    if (data.schema.length <= 1) {
      return;
    }
    setDeleteColumnOpen(columnTitle);
  };

  const confirmRemoveColumn = () => {
    if (deleteColumnOpen && selectedNodeId) {
      removeColumn(selectedNodeId, deleteColumnOpen);
      console.log("Column removed:", { tableId: selectedNodeId, column: deleteColumnOpen });
    }
    setDeleteColumnOpen(null);
  };

  const handleUpdateColumn = (
    columnTitle: string,
    updates: Partial<ColumnData>
  ) => {
    if (selectedNodeId) {
      updateColumn(selectedNodeId, columnTitle, updates);
    }
    console.log("Column updated:", { tableId: selectedNodeId, column: columnTitle, updates });
  };

  const handleRemoveTable = () => {
    setDeleteTableOpen(true);
  };

  const confirmRemoveTable = () => {
    if (selectedNodeId) {
      removeTable(selectedNodeId);
      clearSelection();
      console.log("Table removed:", selectedNodeId);
    }
    setDeleteTableOpen(false);
  };

  const handleAddRelationship = () => {
    if (data.schema.length === 0) return;
    const otherTables = nodes.filter((n) => n.id !== selectedNodeId);
    if (otherTables.length === 0) return;

    const firstOtherTable = otherTables[0];
    const firstOtherData = firstOtherTable.data as { label: string; schema: ColumnData[] };

    setNewRelationship({
      fromColumn: data.schema[0].title,
      toTableId: firstOtherTable.id,
      toColumn: firstOtherData.schema.length > 0 ? firstOtherData.schema[0].title : "",
      type: "ONE_TO_MANY",
    });
    setAddRelationshipOpen(true);
  };

  const confirmAddRelationship = () => {
    if (selectedNodeId && newRelationship.fromColumn && newRelationship.toTableId && newRelationship.toColumn) {
      const edgeId = addRelationship(
        selectedNodeId,
        newRelationship.fromColumn,
        newRelationship.toTableId,
        newRelationship.toColumn,
        newRelationship.type
      );
      console.log("Relationship added:", edgeId);
    }
    setAddRelationshipOpen(false);
  };

  const handleEditRelationship = (edge: any) => {
    const isSource = edge.source === selectedNodeId;
    const otherNodeId = isSource ? edge.target : edge.source;
    const fromColumn = edge.sourceHandle?.replace("-source", "") || "";
    const toColumn = edge.targetHandle || "";

    const edgeType = (edge.label as string) || "ONE_TO_MANY";
    setEditRelationship({
      edgeId: edge.id,
      fromColumn: isSource ? fromColumn : toColumn,
      toTableId: otherNodeId,
      toColumn: isSource ? toColumn : fromColumn,
      type: edgeType as "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY",
    });
    setEditRelationshipOpen(edge.id);
  };

  const confirmEditRelationship = () => {
    if (editRelationship && selectedNodeId) {
      const existingEdge = edges.find((e) => e.id === editRelationship.edgeId);
      if (existingEdge) {
        removeRelationship(editRelationship.edgeId);
        addRelationship(
          selectedNodeId,
          editRelationship.fromColumn,
          editRelationship.toTableId,
          editRelationship.toColumn,
          editRelationship.type
        );
        console.log("Relationship updated:", editRelationship);
      }
    }
    setEditRelationshipOpen(null);
    setEditRelationship(null);
  };

  const handleRemoveRelationship = (edgeId: string) => {
    setDeleteRelationshipOpen(edgeId);
  };

  const confirmRemoveRelationship = () => {
    if (deleteRelationshipOpen) {
      removeRelationship(deleteRelationshipOpen);
      console.log("Relationship removed:", deleteRelationshipOpen);
    }
    setDeleteRelationshipOpen(null);
  };

  return (
    <div className="h-full flex flex-col p-2">
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Table Properties</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={handleRemoveTable}
              title="Delete table"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-name">Table Name</Label>
            <Input
              id="table-name"
              value={data.label}
              onChange={(e) => handleTableNameChange(e.target.value)}
              placeholder="Enter table name"
            />
          </div>

          <Accordion type="multiple" defaultValue={[]} className="w-full">
            <AccordionItem value="columns">
              <AccordionTrigger className="py-2 text-sm">
                Columns ({data.schema.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {data.schema.map((column, index) => (
                    <div
                      key={column.title}
                      className="rounded border p-2 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Column {index + 1}
                        </span>
                        {data.schema.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveColumn(column.title)}
                            title="Delete column"
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={column.title}
                          onChange={(e) =>
                            handleUpdateColumn(column.title, { title: e.target.value })
                          }
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={column.type}
                          onValueChange={(value) =>
                            handleUpdateColumn(column.title, { type: value })
                          }
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLUMN_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.primaryKey || false}
                            onChange={(e) =>
                              handleUpdateColumn(column.title, {
                                primaryKey: e.target.checked,
                              })
                            }
                            className="h-3 w-3"
                          />
                          <span className="text-yellow-600">PK</span>
                        </label>
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.unique || false}
                            onChange={(e) =>
                              handleUpdateColumn(column.title, {
                                unique: e.target.checked,
                              })
                            }
                            className="h-3 w-3"
                          />
                          <span className="text-green-600">Unique</span>
                        </label>
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={column.nullable === false}
                            onChange={(e) =>
                              handleUpdateColumn(column.title, {
                                nullable: !e.target.checked,
                              })
                            }
                            className="h-3 w-3"
                          />
                          <span className="text-red-600">Not Null</span>
                        </label>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAddColumn}
                  >
                    + Add Column
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="relationships">
              <AccordionTrigger className="py-2 text-sm">
                Relationships ({tableEdges.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {tableEdges.map((edge) => {
                    const isSource = edge.source === selectedNodeId;
                    const otherNodeId = isSource ? edge.target : edge.source;
                    const otherNode = getNodeById(otherNodeId);
                    const otherLabel = otherNode
                      ? (otherNode.data as { label: string }).label
                      : "Unknown";

                    const fromColumn = edge.sourceHandle?.replace("-source", "") || "";
                    const toColumn = edge.targetHandle || "";

                    return (
                      <div key={edge.id} className="rounded border p-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">
                            {isSource ? `→ ${otherLabel}` : `← ${otherLabel}`}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-primary"
                              onClick={() => handleEditRelationship(edge)}
                              title="Edit relationship"
                            >
                              ✎
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveRelationship(edge.id)}
                              title="Delete relationship"
                            >
                              ×
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {isSource
                            ? `${data.label}.${fromColumn} → ${otherLabel}.${toColumn}`
                            : `${otherLabel}.${fromColumn} → ${data.label}.${toColumn}`}
                        </div>

                        <div className="text-xs">
                          Type: {(edge.label as string) || "ONE_TO_MANY"}
                        </div>
                      </div>
                    );
                  })}

                  {nodes.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleAddRelationship}
                    >
                      + Add Relationship
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <AlertDialog open={deleteTableOpen} onOpenChange={setDeleteTableOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Table</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the table "{data.label}"? This action cannot be undone and will also remove all relationships connected to this table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveTable} className="bg-destructive text-primary-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteColumnOpen !== null} onOpenChange={(open) => !open && setDeleteColumnOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the column "{deleteColumnOpen}"? This action cannot be undone and will also remove all relationships connected to this column.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveColumn} className="bg-destructive text-primary-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteRelationshipOpen !== null} onOpenChange={(open) => !open && setDeleteRelationshipOpen(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Relationship</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this relationship? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveRelationship} className="bg-destructive text-primary-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={addRelationshipOpen} onOpenChange={setAddRelationshipOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Relationship</AlertDialogTitle>
            <AlertDialogDescription>
              Configure the relationship between tables.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">From Column ({data.label})</Label>
              <Select
                value={newRelationship.fromColumn}
                onValueChange={(value) =>
                  setNewRelationship({ ...newRelationship, fromColumn: value })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.schema.map((col) => (
                    <SelectItem key={col.title} value={col.title}>
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">To Table</Label>
              <Select
                value={newRelationship.toTableId}
                onValueChange={(value) => {
                  const targetNode = getNodeById(value);
                  const targetData = targetNode
                    ? (targetNode.data as { label: string; schema: ColumnData[] })
                    : null;
                  setNewRelationship({
                    ...newRelationship,
                    toTableId: value,
                    toColumn: targetData && targetData.schema.length > 0 ? targetData.schema[0].title : "",
                  });
                }}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter((n) => n.id !== selectedNodeId)
                    .map((node) => {
                      const nodeData = node.data as { label: string };
                      return (
                        <SelectItem key={node.id} value={node.id}>
                          {nodeData.label}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            {newRelationship.toTableId && (
              <div className="space-y-2">
                <Label className="text-xs">To Column</Label>
                <Select
                  value={newRelationship.toColumn}
                  onValueChange={(value) =>
                    setNewRelationship({ ...newRelationship, toColumn: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const targetNode = getNodeById(newRelationship.toTableId);
                      const targetData = targetNode
                        ? (targetNode.data as { label: string; schema: ColumnData[] })
                        : null;
                      return targetData?.schema.map((col) => (
                        <SelectItem key={col.title} value={col.title}>
                          {col.title}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select
                value={newRelationship.type}
                onValueChange={(value) =>
                  setNewRelationship({
                    ...newRelationship,
                    type: value as "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY",
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAddRelationship}
              disabled={
                !newRelationship.fromColumn ||
                !newRelationship.toTableId ||
                !newRelationship.toColumn
              }
            >
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={editRelationshipOpen !== null}
        onOpenChange={(open) => !open && setEditRelationshipOpen(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Relationship</AlertDialogTitle>
            <AlertDialogDescription>
              Update the relationship configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {editRelationship && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs">From Column ({data.label})</Label>
                <Select
                  value={editRelationship.fromColumn}
                  onValueChange={(value) =>
                    setEditRelationship({ ...editRelationship, fromColumn: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {data.schema.map((col) => (
                      <SelectItem key={col.title} value={col.title}>
                        {col.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">To Table</Label>
                <Select
                  value={editRelationship.toTableId}
                  onValueChange={(value) => {
                    const targetNode = getNodeById(value);
                    const targetData = targetNode
                      ? (targetNode.data as { label: string; schema: ColumnData[] })
                      : null;
                    setEditRelationship({
                      ...editRelationship,
                      toTableId: value,
                      toColumn: targetData && targetData.schema.length > 0 ? targetData.schema[0].title : "",
                    });
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes
                      .filter((n) => n.id !== selectedNodeId)
                      .map((node) => {
                        const nodeData = node.data as { label: string };
                        return (
                          <SelectItem key={node.id} value={node.id}>
                            {nodeData.label}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>

              {editRelationship.toTableId && (
                <div className="space-y-2">
                  <Label className="text-xs">To Column</Label>
                  <Select
                    value={editRelationship.toColumn}
                    onValueChange={(value) =>
                      setEditRelationship({ ...editRelationship, toColumn: value })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const targetNode = getNodeById(editRelationship.toTableId);
                        const targetData = targetNode
                          ? (targetNode.data as { label: string; schema: ColumnData[] })
                          : null;
                        return targetData?.schema.map((col) => (
                          <SelectItem key={col.title} value={col.title}>
                            {col.title}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={editRelationship.type}
                  onValueChange={(value) =>
                    setEditRelationship({
                      ...editRelationship,
                      type: value as "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY",
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEditRelationship}
              disabled={
                !editRelationship?.fromColumn ||
                !editRelationship?.toTableId ||
                !editRelationship?.toColumn
              }
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

