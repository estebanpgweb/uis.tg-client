import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  FilterFn,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { getStatusLabel } from "@/types/solicitudesTypes";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

// Mejoramos el tipado del FilterFn
const globalFilterFn: FilterFn<any> = (
  row,
  _,
  filterValue: string | string[]
) => {
  // Si el valor del filtro es un string, hacemos la búsqueda global
  if (typeof filterValue === "string") {
    const searchValue = filterValue.toLowerCase();
    return Object.values(row.original)
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  }
  return true;
};

export function DataTable<TData extends { status?: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const statusOptions = ["REJECTED", "PENDING", "PARTIAL_REJECTED", "APPROVED"];

  // Filtrado combinado
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      // Aplicar filtro global
      const matchesSearch = Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(globalFilter.toLowerCase());

      // Aplicar filtro de estados
      const matchesStatus =
        selectedStatuses.length === 0 ||
        (item.status && selectedStatuses.includes(item.status));

      return matchesSearch && matchesStatus;
    });
  }, [data, globalFilter, selectedStatuses]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
  });

  const handleStatusChange = (status: string) => {
    if (!selectedStatuses.includes(status)) {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const removeStatus = (statusToRemove: string) => {
    setSelectedStatuses(
      selectedStatuses.filter((status) => status !== statusToRemove)
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between py-6">
        <div className="relative">
          <Input
            id="buscar"
            placeholder="Buscar"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
          <Search
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          />
        </div>
        <Select onValueChange={handleStatusChange} name="estados">
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Seleccionar Estados" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {getStatusLabel(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mostrar estados seleccionados */}
      {selectedStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="px-3 py-1">
              {getStatusLabel(status)}
              <button
                onClick={() => removeStatus(status)}
                className="ml-2 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedStatuses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStatuses([])}
              className="h-7"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

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
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No hay resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
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
  );
}
