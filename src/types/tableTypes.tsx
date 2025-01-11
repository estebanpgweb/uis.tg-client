import { ColumnDef } from "@tanstack/react-table";
import { Solicitud, getBadgeColor, getStatusLabel } from "./solicitudesTypes";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowUpDown } from "lucide-react";

// Columnas de la tabla de solicitudes
export const SolicitudesColumns: ColumnDef<Solicitud>[] = [
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          N° Solicitud
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "_id",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Código Estudiante
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "studentId",
  },
  {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={getBadgeColor(status) + " text-white"}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    header: "Acciones",
    accessorKey: "accion",
    cell: ({ row }) => (
      <Link
        to={`/solicitudes/${row.original._id}`}
        className={buttonVariants({ variant: "link" }) + " font-semibold"}
      >
        <Eye />
        Ver detalles
      </Link>
    ),
  },
];
