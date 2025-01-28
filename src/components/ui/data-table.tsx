import { useState, useEffect } from "react";
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
import { X, ArrowUp, ArrowDown, ArrowUpDown, RefreshCcw } from "lucide-react";
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
  onRefresh?: () => void;
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
  onRefresh,
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

  // Hook de debounce
  const useDebounce = (value: string, delay: number = 1000) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedFilter = useDebounce(filterInput, 800);

  // Manejadores de búsqueda
  const handleSearch = () => {
    setFilter(filterInput);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Efecto para el debounce
  useEffect(() => {
    setFilter(debouncedFilter);
    setPage(0);
  }, [debouncedFilter]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between py-4 md:py-6 gap-4 md:gap-0">
        <Input
          type="search"
          id="buscar"
          placeholder="Buscar"
          value={filterInput}
          onChange={(e) => setFilterInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="md:w-2/6"
        />
        {/* Filtro de estados */}
        {selectedStatuses && (
          <Select
            onValueChange={handleStatusChange}
            value={selectedStatuses.length > 0 ? selectedStatuses[0] : ""}
            name="estados"
          >
            <SelectTrigger className="w-full md:w-2/6">
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
        <div className="flex gap-x-2 items-center ">
          <p className="hidden md:inline-block opacity-50 text-sm">
            Mostrando {data.length} de {rows} resultados
          </p>
          {onRefresh && (
            <Button size={"sm"} onClick={() => onRefresh()}>
              <RefreshCcw />
            </Button>
          )}
        </div>
      </div>

      {selectedStatuses && selectedStatuses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedStatuses.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="px-2 py-1 text-xs md:px-3 md:py-1"
            >
              {getStatusLabel(status)}
              <button
                onClick={() => removeStatus(status)}
                className="ml-1 md:ml-2 hover:text-red-500"
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
            className="h-6 md:h-7 text-xs md:text-sm"
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
                  <TableHead key={header.id} className="text-xs md:text-base">
                    {header.isPlaceholder ? null : (
                      <Button
                        variant={
                          header.id === sorting.field ? "secondary" : "ghost"
                        }
                        className={`${
                          header.id === sorting.field ? "font-semibold" : ""
                        } text-xs md:text-base`}
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
                  className="text-xs md:text-base"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-xs md:text-base">
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
                  className="h-24 text-center text-xs md:text-base"
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
                  } text-xs md:text-base`}
                />
              </PaginationItem>
              {Array.from({ length: Math.ceil(rows / 10) }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    onClick={() => setPage(index)}
                    isActive={index === page}
                    className="text-xs md:text-base"
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
                  } text-xs md:text-base`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
