import { ColumnDef } from "@tanstack/react-table";
import { Solicitud, getBadgeColor, getStatusLabel } from "./solicitudesTypes";
import { UserType } from "./userTypes";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import SolicitudTiempoEspera from "@/utils/tiempoEspera";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Estado de ordenamiento de la tabla
export type SortingState = { field: string | null; sort: "asc" | "desc" };

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

// Columnas de la tabla de usuarios
export const UsuariosColumns: ColumnDef<UserType>[] = [
  {
    header: "Nombre",
    accessorKey: "name",
  },
  {
    header: "Apellido",
    accessorKey: "lastname",
  },
  {
    header: "Email",
    accessorKey: "username",
  },
  {
    header: "Acciones",
    accessorKey: "accion",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Pencil />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Editar / Crear</AlertDialogTitle>
              <AlertDialogDescription>
                Estas a punto de Editar/Registrar un usuario completa los campos
                requeridos con la información correspondiente
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => console.log(row.original)}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de eliminar a {row.original.name}{" "}
                {row.original.lastname}. Ten en cuenta que esta acción es
                irreversible. ¿Deseas eliminarlo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => console.log(row.original)}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ),
  },
];
