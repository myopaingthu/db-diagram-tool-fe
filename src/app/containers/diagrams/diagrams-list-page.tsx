import { type FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useApi } from "@/app/services/api";
import type { Diagram } from "@/app/services/api/diagrams";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";

export const DiagramsListPage: FC = () => {
  const navigate = useNavigate();
  const api = useApi();
  const [data, setData] = useState<Diagram[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const columns: ColumnDef<Diagram>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name || "Untitled"}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.description || "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || "idle";
        const statusColors: Record<string, string> = {
          idle: "text-green-600",
          editing: "text-yellow-600",
          saving: "text-yellow-600",
          parsing: "text-yellow-600",
          error: "text-red-600",
        };
        return (
          <div className={statusColors[status] || "text-gray-600"}>
            {status}
          </div>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = row.original.updatedAt;
        if (!date) return "-";
        try {
          const d = new Date(date);
          return d.toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return "-";
        }
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/diagram/${row.original._id}`)}
          >
            Open
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    const fetchDiagrams = async () => {
      try {
        setLoading(true);
        const page = pagination.pageIndex + 1;
        const limit = pagination.pageSize;
        const response = await api.diagrams.list(page, limit);

        if (response.status && response.data) {
          setData(response.data.diagrams);
          setTotalPages(response.data.totalPages);
          setTotal(response.data.total);
        } else {
          toast.error(response.error || "Failed to load diagrams");
        }
      } catch (error: any) {
        toast.error(error?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchDiagrams();
  }, [pagination.pageIndex, pagination.pageSize]);

  if (loading && data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Diagrams</h1>
        <Button onClick={() => navigate("/diagram/new")}>
          <PlusIcon className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto border rounded-lg">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No diagrams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.length > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            total
          )}{" "}
          of {total} diagrams
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {pagination.pageIndex + 1} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

