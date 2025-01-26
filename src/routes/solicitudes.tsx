import { useState, useEffect, useMemo } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { useAuth } from "@/providers/AuthContext";
import { Solicitud } from "../types/solicitudesTypes";
import { SolicitudesColumns, SortingState } from "../types/tableTypes";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
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
import { buildFilterQuery } from "@/utils/filterQuery";
import { Plus } from "lucide-react";
import Loader from "@/components/loader";

const SolicitudRoute = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [lastReviewSolicitud, setLastReviewSolicitud] =
    useState<Solicitud["_id"]>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [horario, setHorario] = useState(0);
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
  const [isLoading, setIsLoading] = useState(true);
  const axios: AxiosInstance = useAxios();
  const auth = useAuth();
  const kind = auth?.user?.kind;
  const user = auth?.user;
  const userId = auth?.user?.id;
  const { toast } = useToast();
  const navigate = useNavigate();

  const pageLimit = 10;
  const paramsFilter = useMemo(
    () => [
      "student.identification",
      "student.name",
      "student.lastname",
      "logs.user.name",
      "logs.user.lastname",
    ],
    []
  );

  const fetchSolicitudes = async (
    page: number,
    filter: string,
    statuses: string[],
    sorting: SortingState
  ) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        filter: JSON.stringify(
          buildFilterQuery(filter, paramsFilter, statuses)
        ),
        limit: pageLimit.toString(),
        skip: (page * pageLimit).toString(),
        sort: sorting.sort,
        sortBy: sorting.field || "createdAt",
      }).toString();

      const { data } =
        kind === "STUDENT"
          ? await axios.get(`/api/appeal?${params}`, {
              headers: { "x-resource-id": userId },
            })
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
    if (!userId) return;

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
      setLastReviewSolicitud(
        data.find(
          (solicitud: Solicitud) =>
            solicitud.status === "REVIEW" && solicitud.attended?._id === userId
        )
      );
    };

    fetchData();
  }, [page, filter, selectedStatuses, sorting, userId, user]);

  useEffect(() => {
    if (!userId || !kind) return;
    const soli =
      solicitudes &&
      solicitudes.find(
        (solicitud: Solicitud) =>
          solicitud.status === "REVIEW" && solicitud.attended?._id === userId
      );
    const solicitudId = soli ? soli._id : undefined;

    if (solicitudId && kind !== "STUDENT") {
      setDialogOpen(true);
    }
    setLastReviewSolicitud(solicitudId);
  }, [userId, solicitudes, kind]);

  useEffect(() => {
    if (!userId) return;

    const getSolicitudesCount = async () => {
      try {
        const filterQuery = buildFilterQuery(
          filter,
          paramsFilter,
          selectedStatuses
        );

        const { data } =
          kind === "STUDENT"
            ? await axios.get(`/api/appeal/count`, {
                params: { filter: JSON.stringify(filterQuery) },
                headers: { "x-resource-id": userId },
              })
            : await axios.get(`/api/appeal/count`, {
                params: { filter: JSON.stringify(filterQuery) },
              });
        setTotalSolicitudes(data);
      } catch (error) {
        console.error("Error fetching solicitudes count", error);
      }
    };

    getSolicitudesCount();
  }, [axios, filter, selectedStatuses, kind, userId, paramsFilter, user]);

  useEffect(() => {
    if (!userId) return;

    const fetchHorario = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/schedule`, {
          headers: { "x-resource-id": userId },
        });
        setHorario(data.length);
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ||
          (error as Error).message ||
          "Ha ocurrido un error inesperado";

        toast({
          variant: "destructive",
          title: "Horario fallida",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHorario();
  }, [axios, toast, userId]);

  return (
    <div className="container mx-auto">
      <Loader isLoading={isLoading} />
      <AlertDialog open={dialogOpen} onOpenChange={() => setDialogOpen(false)}>
        <AlertDialogTrigger></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Solicitud de ajuste de matrícula pendiente
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Tiene una solicitud de ajuste de matrícula pendiente, ¿desea ver la
            solicitud?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate(`/solicitudes/${lastReviewSolicitud}`)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Solicitudes de Ajuste de Matrícula
        </h1>
        {kind === "STUDENT" && (
          <Button
            onClick={() => {
              if (horario === 0) {
                toast({
                  variant: "destructive",
                  title: "Horario no registrado",
                  description:
                    "Debe cargar el horario antes de crear una solicitud de ajuste de matrícula.",
                });
              } else if (
                solicitudes.filter(
                  (solicitud) =>
                    solicitud.status === "PENDING" ||
                    solicitud.status === "REVIEW"
                ).length > 0
              ) {
                toast({
                  variant: "destructive",
                  title: "Solicitud pendiente",
                  description:
                    "Ya tiene una solicitud de ajuste de matrícula pendiente.",
                });
              } else {
                navigate("/solicitud/crear");
              }
            }}
          >
            <Plus size={24} />
            Crear solicitud
          </Button>
        )}
      </div>
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
