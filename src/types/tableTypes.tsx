import { ColumnDef } from "@tanstack/react-table";
import { Solicitud, getBadgeColor, getStatusLabel } from "./solicitudesTypes";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import SolicitudTiempoEspera from "@/utils/tiempoEspera";

// Columnas de la tabla de solicitudes
export const SolicitudesColumns: ColumnDef<Solicitud>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    header: "Código Estudiante",
    accessorKey: "student.identification",
    id: "student.identification",
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge className={getBadgeColor(status || "") + " text-white"}>
          {getStatusLabel(status || "")}
        </Badge>
      );
    },
  },
  {
    header: "Tiempo Total",
    accessorKey: "createdAt",
    cell: ({ row }) =>
      SolicitudTiempoEspera({ createdAt: row.original.createdAt ?? "" }),
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
