import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import {
  Solicitud,
  RequestStatus,
  getBadgeColor,
  getStatusLabel,
  getShiftLabel,
} from "../types/solicitudesTypes";
import {
  ArrowLeft,
  User,
  ClipboardList,
  Send,
  Check,
  X,
  FileText,
  Logs,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { SolicitudTiempoEspera } from "@/utils/tiempoEspera";
import { useAuth } from "@/providers/AuthContext";
import Loader from "@/components/loader";
import { useNavigate } from "react-router-dom";

const SolicitudDetalleRoute = () => {
  const { id } = useParams<{ id: string }>(); // Captura el id desde la URL
  const axios: AxiosInstance = useAxios();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState<boolean>(false);
  const [observaciones, setObservaciones] = useState<string>("");
  const [disabled, setDisabled] = useState<boolean>(false);
  const [attended, setAttended] = useState<string>("");
  const { toast } = useToast();
  const auth = useAuth();
  const kind = auth?.user?.kind;
  const userId = auth?.user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    const fetchSolicitud = async () => {
      try {
        setIsLoading(true);
        const { data } =
          kind === "STUDENT"
            ? await axios.get(`/api/appeal/${id}`, {
                headers: { "x-resource-id": userId },
              })
            : await axios.get(`/api/appeal/${id}`);
        setSolicitud(data);
      } catch (error) {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message ||
          (error as Error).message ||
          "Ha ocurrido un error inesperado";

        toast({
          variant: "destructive",
          title: "Solicitud fallida",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [axios, id, toast, completed, kind, userId]);

  useEffect(() => {
    if (
      (solicitud?.status === "REVIEW" && solicitud.attended?._id !== userId) ||
      kind === "STUDENT" ||
      solicitud?.status === "APPROVED" ||
      solicitud?.status === "REJECTED" ||
      solicitud?.status === "PARTIAL_REJECTED"
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [solicitud, kind, userId]);

  useEffect(() => {
    const logs = solicitud?.logs || [];
    const lastLog = logs.length > 1 ? logs[logs.length - 1] : null;
    const user = lastLog?.user;
    if (user && user.name && user.lastname) {
      setAttended(user.name + " " + user.lastname);
    } else {
      setAttended("");
    }
  }, [solicitud]);

  const handlePeticion = async (index: number, status: RequestStatus) => {
    const newSolicitud: Solicitud = {
      ...solicitud,
      requests:
        solicitud?.requests?.map((request, i) =>
          i === index
            ? {
                ...request,
                status,
                to:
                  request.to && request.to?.length < 2
                    ? request.to.map((group) => ({
                        ...group,
                        approved: status === "APPROVED",
                      }))
                    : request.to,
              }
            : request
        ) || [],
    };

    setSolicitud(newSolicitud);
  };

  const handlePeticionReason = async (index: number, reason: string) => {
    const newSolicitud: Solicitud = {
      ...solicitud,
      requests:
        solicitud?.requests?.map((request, i) =>
          i === index ? { ...request, reason } : request
        ) || [],
    };

    setSolicitud(newSolicitud);
  };

  const handlePeticionGroupApproved = async (index: number, group: string) => {
    const newSolicitud: Solicitud = {
      ...solicitud,
      requests:
        // todos los grupos que no sean el seleccionado se marcan como no aprobados y el seleccionado como aprobado
        solicitud?.requests?.map((request, i) =>
          i === index
            ? {
                ...request,
                to: request.to
                  ? request.to.map((g) =>
                      g.group === group
                        ? { ...g, approved: true }
                        : { ...g, approved: false }
                    )
                  : null,
              }
            : request
        ) || [],
    };

    setSolicitud(newSolicitud);
  };

  const validateRequests = () => {
    return solicitud?.requests?.every(
      (request) =>
        //validamos que este aprobado o rechazado y que tenga un motivo si esta rechazado y que tenga un grupo aprobado si esta aprobado
        (request.status === "APPROVED" &&
          (request.to === null || request.to?.some((g) => g.approved))) ||
        (request.status === "REJECTED" && request.reason)
    );
  };

  const handleDirector = async () => {
    const newStatus = solicitudStatus();
    const newSolicitud: Solicitud = {
      ...solicitud,
      status: newStatus,
      requests: solicitud?.requests || [],
      observation: observaciones,
    };
    try {
      await axios.put(`/api/appeal/${solicitud?._id}/scale`, {
        id: newSolicitud._id,
      });
      toast({
        title: "Solicitud enviada",
        description: "La solicitud ha sido enviada al director de escuela",
      });
      setCompleted(true);
      navigate("/solicitudes");
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
    }
  };

  const solicitudStatus = () => {
    const peticionesStatus = solicitud?.requests.map(
      (request) => request.status
    );
    if (!peticionesStatus?.includes("APPROVED")) {
      return "REJECTED";
    } else if (peticionesStatus?.includes("REJECTED")) {
      return "PARTIAL_REJECTED";
    } else {
      return "APPROVED";
    }
  };

  const handleCompletada = async () => {
    const newStatus = solicitudStatus();
    const newSolicitud: Solicitud = {
      ...solicitud,
      status: newStatus,
      requests: solicitud?.requests || [],
      observation: observaciones,
    };

    try {
      await axios.put(`/api/appeal/${solicitud?._id}`, newSolicitud);
      setCompleted(true);
      toast({
        title: "Solicitud completada",
        description: "La solicitud ha sido marcada como completada",
      });
      navigate("/solicitudes");
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
    }
  };

  const peticionMessage = (index: number) => {
    const request = solicitud?.requests[index];

    if (request?.from && request?.to) {
      return `Cambio del grupo ${request.from.group} al ${request.to
        .map((g) => g.group)
        .join(", ")} en la materia ${request.from.sku} - ${request.from.name}`;
    } else if (request?.from && !request?.to) {
      return `Cancelar la materia ${request.from.sku} - ${request.from.name}`;
    } else if (!request?.from && request?.to) {
      return `Incluir la materia ${request.to[0].sku} - ${
        request.to[0].name
      } en el grupo ${request.to.map((g) => g.group).join(", ")}`;
    }

    return "Petición desconocida";
  };

  if (!solicitud) {
    return (
      <div className="text-center">
        No se encontraron datos para la solicitud especificada.
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <Loader isLoading={isLoading} />
      {/* Titulo de la vista */}
      <div className="flex items-center justify-between mb-1 md:mb-4">
        <Link
          to="/solicitudes"
          className={buttonVariants({ variant: "link" }) + " text-xl"}
        >
          <ArrowLeft />
          <span className="hidden md:block">Volver</span>
        </Link>
        <h1 className="text-2xl font-bold">Detalles de Solicitud</h1>
      </div>
      {/* Información de la solicitud */}
      <div className="flex flex-col md:flex-row gap-y-2 items-center justify-between md:mx-8">
        <Label className="opacity-50 mx-4">Atendida por: {attended}</Label>
        <Label className="opacity-50 mx-4">
          Estado de la solicitud:{" "}
          <Badge
            className={getBadgeColor(solicitud.status || "") + " text-white"}
          >
            {getStatusLabel(solicitud.status || "")}
          </Badge>
        </Label>
      </div>
      <div className="flex flex-col md:flex-row my-2 md:mx-8 md:my-4 gap-y-4 gap-x-8 justify-between">
        {/* Información del estudiante */}
        <Card className="flex flex-col gap-2 md:gap-6 flex-1 px-3 py-2 md:px-6 md:py-4">
          <div className="flex items-center gap-x-4 mb-2">
            <User size={28} />
            <h2 className="text-xl font-medium">Datos del estudiante</h2>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="opacity-50">Código del estudiante</Label>
            <Label className="font-medium text-lg">
              {solicitud.student?.identification}
            </Label>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="opacity-50">Nombre del estudiante</Label>
            <Label className="font-medium text-lg">
              {solicitud.student?.name + " " + solicitud.student?.lastname}
            </Label>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="opacity-50">Franja de atención</Label>
            <Label className="font-medium text-lg">
              {getShiftLabel(
                solicitud.student?.shift || { day: "THURSDAY", time: "AM" }
              )}
            </Label>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="opacity-50">
              Tiempo en espera de la solicitud
            </Label>
            <Label className="font-medium text-lg">
              {solicitud.createdAt &&
                SolicitudTiempoEspera({
                  createdAt: solicitud.createdAt,
                  updatedAt: solicitud.updatedAt || "",
                })}
            </Label>
          </div>
        </Card>
        {/* Lista de peticiones */}
        <Card className="flex flex-col gap-2 md:gap-6 flex-1 px-3 py-2 md:px-6 md:py-4">
          <div className="flex items-center gap-x-4 mb-2">
            <ClipboardList size={28} />
            <h2 className="text-xl font-medium">Lista de peticiones</h2>
          </div>
          {Array.isArray(solicitud.requests) &&
            solicitud.requests.map((petición, index) => (
              <div className="flex items-center justify-between" key={index}>
                <div className="flex flex-col gap-1 mx-4">
                  <Label className="text-lg">Petición #{index + 1}</Label>
                  <Label className="opacity-50">{peticionMessage(index)}</Label>
                  {/* Motivo de rechazo de la peticion */}
                  <div hidden={petición.status !== "REJECTED"}>
                    <Select
                      disabled={disabled}
                      value={petición.reason || ""}
                      onValueChange={(value) =>
                        handlePeticionReason(index, value)
                      }
                      name="motivo"
                    >
                      <SelectTrigger className="text-xs w-52 md:w-full md:text-sm">
                        <SelectValue placeholder="Selecciona un motivo de rechazo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interferencia">
                          Interferencia Horaria
                        </SelectItem>
                        <SelectItem value="cursada">
                          Asignatura Cursada
                        </SelectItem>
                        <SelectItem value="requisito">
                          No cumple requisitos
                        </SelectItem>
                        <SelectItem value="capacidad">
                          Capacidad de grupo
                        </SelectItem>
                        <SelectItem value="semestre">
                          Semestre superior
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Grupo aprobado del listado de to de la peticion */}
                  <div
                    hidden={
                      petición.status === "APPROVED" &&
                      petición.to &&
                      petición.to?.length > 1
                        ? false
                        : true
                    }
                  >
                    <Select
                      required
                      disabled={disabled}
                      value={
                        petición.to?.find((group) => {
                          return group.approved === true;
                        })?.group || ""
                      }
                      onValueChange={(value) =>
                        handlePeticionGroupApproved(index, value)
                      }
                      name="grupoAprobado"
                    >
                      <SelectTrigger className="text-xs w-52 md:w-full md:text-sm">
                        <SelectValue placeholder="Selecciona el grupo aprobado" />
                      </SelectTrigger>
                      <SelectContent>
                        {petición.to?.map((group, index) => (
                          <SelectItem key={index} value={group.group}>
                            {group.group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Botones de acción aprobar o rechazar */}
                <div className="flex gap-x-2">
                  <Button
                    onClick={() => handlePeticion(index, "APPROVED")}
                    disabled={disabled}
                    className={`${
                      petición.status !== "REJECTED" &&
                      "bg-green-500 text-white"
                    }`}
                    variant={`${
                      petición.status !== "REJECTED" ? "default" : "outline"
                    }`}
                    size={"sm"}
                  >
                    <Check />
                  </Button>
                  <Button
                    onClick={() => handlePeticion(index, "REJECTED")}
                    disabled={disabled}
                    className={` ${
                      petición.status !== "APPROVED" && "bg-red-500 text-white"
                    } `}
                    variant={`${
                      petición.status !== "APPROVED" ? "default" : "outline"
                    }`}
                    size={"sm"}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
        </Card>
      </div>
      {/* Indicaciones estudiante */}
      <Card className="flex flex-col gap-2 md:gap-4 flex-1 px-3 py-2 md:px-6 md:py-4 md:mx-8 my-4">
        <div className="flex items-center gap-x-4">
          <Logs />
          <h2 className="text-xl font-medium">Indicaciones estudiante</h2>
        </div>
        {(solicitud?.ask && <p>{solicitud.ask}</p>) || (
          <p className="opacity-50">No hay indicaciones del estudiante.</p>
        )}
      </Card>
      {/* Observaciones adicionales */}
      <Card className="flex flex-col gap-2 md:gap-4 flex-1 px-3 py-2 md:px-6 md:py-4 md:mx-8 my-4">
        <div className="flex items-center gap-x-4">
          <FileText />
          <h2 className="text-xl font-medium">Observaciones adicionales</h2>
        </div>
        <Textarea
          disabled={disabled}
          value={solicitud?.observation || observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ingrese observaciones adicionales para la solicitud del estudiante."
        />
      </Card>
      {/* Botones de acción */}
      <div
        className={
          kind === "STUDENT"
            ? "hidden"
            : "flex flex-col md:flex-row gap-y-4 justify-around mt-4 md:mt-8"
        }
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className={`${kind !== "ADMIN" ? "hidden" : ""}`}
              disabled={disabled}
              variant={"outline"}
            >
              <Send />
              Enviar al Director
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Enviar Solicitud al Director?
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de enviar esta solicitud al director? Solo debes
                enviar en caso de incapacidad de resolver alguna petición y la
                solicitud se enviara sin cambios el director, luego se te
                asignará una nueva solicitud.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDirector}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={disabled || !validateRequests()}>
              <Check />
              Completada
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Completar Solicitud?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Está seguro de marcar esta solicitud como completada? Se
                notificará al estudiante y se guardarán los cambios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCompletada}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SolicitudDetalleRoute;
