import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Solicitud, RequestStatus } from "../types/solicitudesTypes";
import { ArrowLeft, User, ClipboardList, Send, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
import SolicitudTiempoEspera from "@/utils/tiempoEspera";

const SolicitudDetalleRoute = () => {
  const { id } = useParams<{ id: string }>(); // Captura el id desde la URL
  const axios: AxiosInstance = useAxios();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/appeal/${id}`);
        setSolicitud(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [axios, id]);

  const handlePeticion = async (index: number, status: RequestStatus) => {
    const newSolicitud: Solicitud = {
      ...solicitud,
      requests:
        solicitud?.requests?.map((request, i) =>
          i === index ? { ...request, status } : request
        ) || [],
    };

    setSolicitud(newSolicitud);
    toast({
      title: "Peticion actualizada",
      description: `La petición #${
        index + 1
      } ha sido actualizada correctamente`,
    });
  };

  const validateRequests = () => {
    return solicitud?.requests?.every(
      (request) =>
        request.status === "APPROVED" || request.status === "REJECTED"
    );
  };

  const handleDirector = async () => {
    console.log("Enviar al director");
    toast({
      title: "Solicitud enviada",
      description: "La solicitud ha sido enviada al director de escuela",
    });
    // try {
    //   await axios.put(`/api/appeal/${solicitud?._id}`, { newSolicitud });
    // } catch (err) {
    //   console.error(err);
    // }
  };

  const handleCompletada = async () => {
    console.log("Marcar como completada");
    toast({
      title: "Solicitud completada",
      description: "La solicitud ha sido marcada como completada",
    });
    // try {
    //   await axios.put(`/api/appeal/${solicitud?._id}`, { newSolicitud });
    // } catch (err) {
    //   console.error(err);
    // }
  };

  const peticionMessage = (index: number) => {
    const request = solicitud?.requests[index];
    if (request?.from && request?.to) {
      return `Cambio del grupo ${request.from.group} al ${request.to.group} en la materia ${request.from.sku}`;
    } else if (request?.from && !request?.to) {
      return `Cancelar la materia ${request.from.sku}`;
    } else if (!request?.from && request?.to) {
      return `Incluir la materia ${request?.to.sku} grupo ${request.to.group}`;
    }
    return "Petición desconocida";
  };

  if (isLoading) {
    return <div className="text-center">Cargando solicitud...</div>;
  }

  if (!solicitud) {
    return (
      <div className="text-center">
        No se encontraron datos para la solicitud especificada.
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/solicitudes"
          className={buttonVariants({ variant: "link" }) + " text-xl"}
        >
          <ArrowLeft /> Volver
        </Link>
        <h1 className="text-2xl font-bold">
          Detalles de Solicitud de Matricula
        </h1>
      </div>
      <Label className="text-gray-500 mx-4">
        ID de la solicitud: {solicitud._id}
      </Label>
      <div className="flex mx-8 my-4 gap-x-8 justify-between">
        <Card className="flex flex-col gap-6 flex-1 px-6 py-4">
          <div className="flex items-center gap-x-4 mb-2">
            <User size={28} />
            <h2 className="text-xl font-medium">Datos del estudiante</h2>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="text-gray-500">Código del estudiante</Label>
            <Label className="font-medium text-lg">{solicitud._id}</Label>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="text-gray-500">Nombre del estudiante</Label>
            <Label className="font-medium text-lg">{solicitud._id}</Label>
          </div>
          <div className="flex flex-col gap-2 mx-4">
            <Label className="text-gray-500">
              Tiempo en espera de la solicitud
            </Label>
            <Label className="font-medium text-lg">
              {solicitud.createdAt &&
                SolicitudTiempoEspera({ createdAt: solicitud.createdAt })}
            </Label>
          </div>
        </Card>
        <Card className="flex flex-col gap-6 flex-1 px-6 py-4">
          <div className="flex items-center gap-x-4 mb-2">
            <ClipboardList size={28} />
            <h2 className="text-xl font-medium">Lista de peticiones</h2>
          </div>
          {Array.isArray(solicitud.requests) &&
            solicitud.requests.map((_, index) => (
              <div className="flex items-center justify-between" key={index}>
                <div className="flex flex-col gap-1 mx-4">
                  <Label className="text-lg">Petición #{index + 1}</Label>
                  <Label className="text-gray-500">
                    {peticionMessage(index)}
                  </Label>
                </div>
                <div className="flex gap-x-2">
                  <Button
                    onClick={() => handlePeticion(index, "APPROVED")}
                    className="bg-green-500 text-white"
                    size={"sm"}
                  >
                    <Check />
                  </Button>
                  <Button
                    onClick={() => handlePeticion(index, "REJECTED")}
                    className="bg-red-500 text-white"
                    size={"sm"}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
        </Card>
      </div>
      <div className="flex justify-around mt-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              disabled={solicitud?.status !== "PENDING"}
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
                enviar en caso de incapacidad de resolver alguna petición, luego
                se te asignará una nueva solicitud.
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
            <Button
              disabled={solicitud?.status !== "PENDING" || !validateRequests()}
            >
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
