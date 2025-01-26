import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { X, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { getStatusLabel } from "@/types/solicitudesTypes";
import { SortingState } from "@/types/tableTypes";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rows: number;
  page: number;
  setPage: (page: number) => void;
  filter: string;
  setFilter: (filter: string) => void;
  selectedStatuses?: string[];
  setSelectedStatuses?: (statuses: string[]) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
}

export function DataTable<TData extends { status?: string }, TValue>({
  columns,
  data,
  rows,
  page,
  setPage,
  filter,
  setFilter,
  selectedStatuses,
  setSelectedStatuses,
  sorting,
  setSorting,
}: DataTableProps<TData, TValue>) {
  const [filterInput, setFilterInput] = useState<string>(filter || "");
  const statusOptions = ["REJECTED", "PENDING", "PARTIAL_REJECTED", "APPROVED"];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleStatusChange = (status: string) => {
    if (selectedStatuses && !selectedStatuses.includes(status)) {
      setSelectedStatuses?.([...selectedStatuses, status]);
    }
  };

  const removeStatus = (statusToRemove: string) => {
    setSelectedStatuses?.(
      selectedStatuses?.filter((status) => status !== statusToRemove) || []
    );
  };

  const handleSearch = () => {
    setFilter(filterInput);
    setPage(0); // Reset to first page when searching
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-6 gap-4 sm:gap-0">
        <div className="relative w-full sm:min-w-[250px] sm:w-auto">
          <Input
            id="buscar"
            placeholder="Buscar"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onClick={() => {
              handleSearch();
            }}
            className="pr-10"
          />
          <Search
            size={20}
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:cursor-pointer"
          />
        </div>
        {/* Filtro de estados */}
        {selectedStatuses && (
          <Select onValueChange={handleStatusChange} name="estados">
            <SelectTrigger className="w-full sm:max-w-sm">
              <SelectValue placeholder="Seleccionar Estados" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  disabled={selectedStatuses.includes(status)}
                >
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="hidden sm:block opacity-50 text-sm">
          Mostrando {data.length} de {rows} resultados
        </p>
      </div>

      {selectedStatuses && selectedStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatuses.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="px-2 py-1 text-xs sm:px-3 sm:py-1"
            >
              {getStatusLabel(status)}
              <button
                onClick={() => removeStatus(status)}
                className="ml-1 sm:ml-2 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStatuses?.([]);
              setPage(0);
            }}
            className="h-6 sm:h-7 text-xs sm:text-sm"
          >
            Limpiar filtros
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs sm:text-base">
                    {header.isPlaceholder ? null : (
                      <Button
                        variant={
                          header.id === sorting.field ? "secondary" : "ghost"
                        }
                        className={`${
                          header.id === sorting.field ? "font-semibold" : ""
                        } text-xs sm:text-base`}
                        onClick={() => {
                          if (header.id === "accion") return;
                          setSorting({
                            field: header.id,
                            sort: sorting.sort === "asc" ? "desc" : "asc",
                          });
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.id === "accion" ? null : header.id !==
                          sorting.field ? (
                          <ArrowUpDown size={16} />
                        ) : sorting.sort === "asc" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )}
                      </Button>
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
                  className="text-xs sm:text-base"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs sm:text-base">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs sm:text-base"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        {rows > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setPage(page - 1)}
                  className={`${
                    page === 0 ? "hidden" : ""
                  } text-xs sm:text-base`}
                />
              </PaginationItem>
              {Array.from({ length: Math.ceil(rows / 10) }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={() => setPage(index)}
                    isActive={index === page}
                    className="text-xs sm:text-base"
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setPage(page + 1)}
                  className={`${
                    page === Math.ceil(rows / 10) - 1 ? "hidden" : ""
                  } text-xs sm:text-base`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
