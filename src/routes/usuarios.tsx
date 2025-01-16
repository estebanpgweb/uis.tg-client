import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { SortingState, UsuariosColumns } from "@/types/tableTypes";
import { UserType } from "@/types/userTypes";
import { buildFilterQuery } from "@/utils/filterQuery";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function UsuariosRoute() {
  const [usuarios, setUsuarios] = useState<UserType[]>([]);
  const [cachedUsuarios, setCachedUsuarios] = useState<
    Record<number, UserType[]>
  >({});
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>({
    field: null,
    sort: "asc",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<UserType>({
    name: "",
    lastname: "",
    username: "",
    kind: "ADMIN", // Valor predeterminado, ajusta según tu estructura.
    permissions: [],
    verified: false,
    password: "",
  });

  const axios: AxiosInstance = useAxios();
  const { toast } = useToast();

  const pageLimit = 10;
  const paramsFilter = ["name", "lastname", "username"];

  const fetchUsuarios = async (
    page: number,
    filter: string,
    sorting: SortingState
  ) => {
    try {
      setIsLoading(true);
      // Construye el filtro combinado
      const dynamicFilter = buildFilterQuery(filter, paramsFilter);
      const fixedFilter = { kind: { $ne: "ROOT" } }; // Retira los usuarios ROOT
      const combinedFilter = { ...dynamicFilter, ...fixedFilter };

      const params = new URLSearchParams({
        filter: JSON.stringify(combinedFilter),
        limit: pageLimit.toString(),
        skip: (page * pageLimit).toString(),
        sort: sorting.sort,
        sortBy: sorting.field || "createdAt",
      }).toString();

      const { data } = await axios.get(`/api/users?${params}`);
      return data;
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Usuarios no disponibles",
        description: errorMessage,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const crearUsuario = async (usuario: UserType) => {
    try {
      setIsLoading(true);
      console.log(usuario);
      await axios.post(`/api/users`, usuario);
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      setFormData({
        name: "",
        lastname: "",
        username: "",
        kind: "ADMIN",
        permissions: [],
        verified: false,
        password: "",
      }); // Reinicia el formulario
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Crear usuario fallido",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const editarUsuario = async (usuario: UserType) => {
    try {
      setIsLoading(true);
      await axios.put(`/api/users/${usuario._id}`, usuario);
      toast({
        title: "Usuario editado",
        description: "El usuario ha sido editado exitosamente",
      });
      setUsuarios((prev) =>
        prev.map((u) => (u._id === usuario._id ? usuario : u))
      );
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Editar usuario fallido",
        description: errorMessage,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarUsuario = async (usuario: UserType) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/users/${usuario._id}`);
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Eliminar usuario fallido",
        description: errorMessage,
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (filter !== "" || sorting.field) {
        const data = await fetchUsuarios(page, filter, sorting);
        setUsuarios(data);
        return;
      }

      if (cachedUsuarios[page]?.length > 0) {
        setUsuarios(cachedUsuarios[page]);
        return;
      }

      const data = await fetchUsuarios(page, "", sorting);
      setCachedUsuarios((prev) => ({ ...prev, [page]: data }));
      setUsuarios(data);
    };

    fetchData();
  }, [page, filter, sorting]);

  useEffect(() => {
    const getUsuariosCount = async () => {
      try {
        const filterQuery = buildFilterQuery(filter, paramsFilter);
        const { data } = await axios.get(`/api/users/count`, {
          params: { filter: JSON.stringify(filterQuery) },
        });
        setTotalUsuarios(data);
      } catch (error) {
        console.error("Error fetching Usuarios count", error);
      }
    };

    getUsuariosCount();
  }, [axios, filter]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  if (isLoading) {
    return <div className="text-center p-4">Cargando usuarios...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <Plus size={24} />
              Crear usuario
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Crear Usuario</AlertDialogTitle>
              <AlertDialogDescription>
                Estas a punto de crear un usuario. Completa los campos
                necesarios con la informacion correspondiente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                crearUsuario(formData);
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
                <AlertDialogAction type="submit">Crear</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <DataTable
        data={usuarios}
        columns={UsuariosColumns({ editarUsuario, eliminarUsuario })}
        rows={totalUsuarios}
        page={page}
        setPage={setPage}
        filter={filter}
        setFilter={setFilter}
        sorting={sorting}
        setSorting={setSorting}
      />
    </div>
  );
}
