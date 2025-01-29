import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Solicitud,
  getBadgeColor,
  getStatusLabel,
  getShiftLabel,
} from "./solicitudesTypes";
import { UserType, getUserColor } from "./userTypes";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { SolicitudTiempoEspera } from "@/utils/tiempoEspera";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Estado de ordenamiento de la tabla
export type SortingState = { sortBy: string | null; sort: "asc" | "desc" };

// Columnas de la tabla de solicitudes
export const SolicitudesColumns: ColumnDef<Solicitud>[] = [
  {
    accessorKey: "student.name",
    header: "Nombre Estudiante",
    id: "student.name",
    cell: ({ row }) =>
      `${row.original.student?.name} ${row.original.student?.lastname}`,
  },
  {
    header: "Código Estudiante",
    accessorKey: "student.identification",
    id: "student.identification",
  },
  {
    header: "Franja Horaria",
    accessorKey: "student.shift",
    cell: ({ row }) =>
      getShiftLabel(
        row.original?.student?.shift || { day: "THURSDAY", time: "AM" }
      ),
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
    header: "Atendido por",
    accessorKey: "logs",
    cell: ({ row }) => {
      const logs = row.original.logs || [];
      const lastLog = logs.length > 1 ? logs[logs.length - 1] : null;
      const user = lastLog?.user;
      return lastLog && user && user.name && user.lastname
        ? `${user.name} ${user.lastname}`
        : "";
    },
  },
  {
    header: "Tiempo Total",
    accessorKey: "createdAt",
    cell: ({ row }) =>
      SolicitudTiempoEspera({
        createdAt: row.original.createdAt ?? "",
        updatedAt: row.original.updatedAt ?? "",
      }),
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
export const UsuariosColumns = ({
  editarUsuario,
  eliminarUsuario,
}: {
  editarUsuario: (usuario: UserType) => void;
  eliminarUsuario: (usuario: UserType) => void;
}): ColumnDef<UserType>[] => [
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
    header: "Tipo",
    accessorKey: "kind",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={getUserColor(row.original.kind) + " text-white"}
      >
        {row.original.kind}
      </Badge>
    ),
  },
  {
    header: "Acciones",
    accessorKey: "accion",
    cell: ({ row }) => {
      const [formData, setFormData] = useState<UserType>({
        ...row.original,
        kind: row.original.kind || "STUDENT",
      });

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
      };

      return (
        <div className="flex gap-2">
          {/* Botón para editar */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Pencil />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Editar Usuario</AlertDialogTitle>
                <AlertDialogDescription>
                  Estas a punto de editar a {row.original.name}{" "}
                  {row.original.lastname}. Completa los campos necesarios con la
                  información correspondiente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  editarUsuario(formData);
                }}
              >
                <div className="flex flex-col gap-2">
                  <Label className="font-normal" htmlFor="name">
                    Nombre
                  </Label>
                  <Input
                    required
                    id="name"
                    autoComplete="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-normal" htmlFor="lastname">
                    Apellido
                  </Label>
                  <Input
                    required
                    id="lastname"
                    autoComplete="lastname"
                    type="text"
                    value={formData.lastname}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-normal" htmlFor="username">
                    Correo electrónico
                  </Label>
                  <Input
                    required
                    id="username"
                    autoComplete="username"
                    type="email"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-normal" htmlFor="password">
                    Contraseña
                  </Label>
                  <Input
                    required
                    id="password"
                    autoComplete="password"
                    type="text"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="font-normal" htmlFor="kind">
                    Tipo de usuario
                  </Label>
                  <Select
                    value={formData.kind}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        kind: value as "ADMIN" | "STUDENT",
                      }))
                    }
                    name="kind"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="STUDENT">Estudiante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction type="submit">Editar</AlertDialogAction>
                </AlertDialogFooter>
              </form>
            </AlertDialogContent>
          </AlertDialog>

          {/* Botón para eliminar */}
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
                  {row.original.lastname}. Esta acción es irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => eliminarUsuario(row.original)}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
