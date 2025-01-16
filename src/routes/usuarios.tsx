import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { SortingState, UsuariosColumns } from "@/types/tableTypes";
import { UserType } from "@/types/userTypes";
import { buildFilterQuery } from "@/utils/filterQuery";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

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
      const params = new URLSearchParams({
        filter: JSON.stringify(buildFilterQuery(filter, paramsFilter)),
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

  useEffect(() => {
    const fetchData = async () => {
      // Si hay un filtro o estados seleccionados, siempre consultar la API
      if (filter !== "" || sorting.field) {
        const data = await fetchUsuarios(page, filter, sorting);
        setUsuarios(data);
        return;
      }

      // Si no hay filtros y hay caché, usar el caché
      if (cachedUsuarios[page]?.length > 0) {
        setUsuarios(cachedUsuarios[page]);
        return;
      }

      // Consultar la API si no hay filtros ni caché
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

  if (isLoading) {
    return <div className="text-center p-4">Cargando usuarios...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <DataTable
        data={usuarios}
        columns={UsuariosColumns}
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
