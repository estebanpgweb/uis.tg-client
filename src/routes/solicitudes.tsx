import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Solicitud } from "../types/solicitudesTypes";
import { SolicitudesColumns } from "../types/tableTypes";
import { useAuth } from "@/providers/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

type SortingState = { field: string | null; sort: "asc" | "desc" };

const SolicitudRoute = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cachedSolicitudes, setCachedSolicitudes] = useState<
    Record<number, Solicitud[]>
  >({});
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>({
    field: null,
    sort: "asc",
  });
  const pageLimit = 10;
  const [isLoading, setIsLoading] = useState(true);
  const axios: AxiosInstance = useAxios();
  const auth = useAuth();
  const { toast } = useToast();

  // Función para construir el filtro basado en MongoDB
  const buildFilterQuery = (search: string, statuses: string[]) => {
    const conditions = [];

    // Añadir condiciones de búsqueda si existe un término
    if (search && search !== "") {
      conditions.push({
        $or: [
          { _id: { $regex: search, $options: "i" } },
          { "student.identification": { $regex: search, $options: "i" } },
        ],
      });
    }

    // Añadir condiciones de estado si hay estados seleccionados
    if (statuses.length > 0) {
      conditions.push({
        status: { $in: statuses },
      });
    }

    // Combinar todas las condiciones con $and
    return conditions.length > 0 ? { $and: conditions } : {};
  };

  const fetchSolicitudes = async (
    page: number,
    filter: string,
    statuses: string[],
    sorting: SortingState
  ) => {
    try {
      setIsLoading(true);
      const kind = auth?.user?.kind || "STUDENT";
      const params = new URLSearchParams({
        filter: JSON.stringify(buildFilterQuery(filter, statuses)),
        limit: pageLimit.toString(),
        skip: (page * pageLimit).toString(),
        sort: sorting.sort,
        sortBy: sorting.field || "createdAt",
      }).toString();

      const { data } =
        kind === "STUDENT"
          ? await axios.get(`/api/student/appeal?${params}`)
          : await axios.get(`/api/appeal?${params}`);
      return data;
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Solicitud fallida",
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
      if (filter !== "" || selectedStatuses.length > 0 || sorting.field) {
        const data = await fetchSolicitudes(
          page,
          filter,
          selectedStatuses,
          sorting
        );
        setSolicitudes(data);
        return;
      }

      // Si no hay filtros y hay caché, usar el caché
      if (cachedSolicitudes[page]?.length > 0) {
        setSolicitudes(cachedSolicitudes[page]);
        return;
      }

      // Consultar la API si no hay filtros ni caché
      const data = await fetchSolicitudes(page, "", [], sorting);
      setCachedSolicitudes((prev) => ({ ...prev, [page]: data }));
      setSolicitudes(data);
    };

    fetchData();
  }, [page, filter, selectedStatuses, sorting]);

  useEffect(() => {
    const getSolicitudesCount = async () => {
      try {
        const filterQuery = buildFilterQuery(filter, selectedStatuses);
        const { data } = await axios.get(`/api/appeal/count`, {
          params: { filter: JSON.stringify(filterQuery) },
        });
        setTotalSolicitudes(data);
      } catch (error) {
        console.error("Error fetching solicitudes count", error);
      }
    };

    getSolicitudesCount();
  }, [axios, filter, selectedStatuses]);

  if (isLoading) {
    return <div className="text-center p-4">Cargando solicitudes...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Solicitudes de Ajuste de Matrícula</h1>
      <DataTable
        data={solicitudes}
        columns={SolicitudesColumns}
        rows={totalSolicitudes}
        page={page}
        setPage={setPage}
        filter={filter}
        setFilter={setFilter}
        selectedStatuses={selectedStatuses}
        setSelectedStatuses={setSelectedStatuses}
        sorting={sorting}
        setSorting={setSorting}
      />
    </div>
  );
};

export default SolicitudRoute;
