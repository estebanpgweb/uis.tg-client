import "./App.css";
import { useAxios } from "./providers/AxiosContext";
import { useAuth } from "./providers/AuthContext";
import { AxiosInstance } from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./components/ui/button";
import { buttonVariants } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "./hooks/use-toast";
import {
  CalendarDays,
  FileText,
  AlertCircle,
  TriangleAlert,
} from "lucide-react";
import Loader from "./components/loader";
import { buildFilterQuery } from "./utils/filterQuery";
import { useNavigate } from "react-router-dom";

function App() {
  const [horario, setHorario] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [solicitud, setSolicitud] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const axios: AxiosInstance = useAxios();
  const auth = useAuth();
  const userId = auth?.user?.id;

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

  useEffect(() => {
    if (!userId) return;

    const fetchSolicitud = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          filter: JSON.stringify(
            buildFilterQuery("", [], ["PENDING", "REVIEW"])
          ),
        }).toString();
        const { data } = await axios.get(`/api/appeal?${params}`, {
          headers: { "x-resource-id": userId },
        });
        setSolicitud(data.length);
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
  }, [axios, toast, userId]);

  return (
    <div className="container mx-auto">
      <Loader isLoading={isLoading} />
      <h1 className="text-2xl font-bold mb-4">
        Bienvenido al sistema de ajuste de matrícula
      </h1>
      {/* Alerta de horario */}
      {!horario || horario === 0 ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>¡Horario no registrado!</AlertTitle>
          <AlertDescription>
            Debe cargar el horario y la franja de atención antes de crear una
            solicitud de ajuste de matrícula.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <TriangleAlert />
          <AlertTitle>¡Importante!</AlertTitle>
          <AlertDescription>
            El éxito de su solicitud de ajuste de matrícula depende de que su
            horario y franja de atención estén registrados correctamente.
            Asegúrese de revisar y confirmar su horario antes de crear una
            solicitud de ajuste.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col md:flex-row md:mx-8 my-4 gap-x-8 gap-y-4 justify-between">
        {/* Horario */}
        <Card className="flex flex-col gap-2 md:gap-4 flex-1 px-3 py-2 md:px-6 md:py-4">
          <div className="flex items-center gap-x-4 mb-2">
            <CalendarDays size={28} />
            <h2 className="text-xl font-medium">Cargar Horario</h2>
          </div>
          <Label className="opacity-50">
            Visualiza y organiza tu horario académico
          </Label>
          <p>En esta sección podrá:</p>
          <ul className="list-disc list-inside text-sm">
            <li>Registrar tu horario actual.</li>
            <li>Visualizar las materias registradas.</li>
            <li>Editar el horario en caso de errores.</li>
          </ul>
          <Link to={"/horario"} className={buttonVariants() + "w-fit mx-auto"}>
            Gestionar horario
          </Link>
        </Card>
        {/* Solicitudes */}
        <Card className="flex flex-col gap-2 md:gap-4 flex-1 px-3 py-2 md:px-6 md:py-4">
          <div className="flex items-center gap-x-4 mb-2">
            <FileText size={28} />
            <h2 className="text-xl font-medium">Crear Solicitud de Ajuste</h2>
          </div>
          <Label className="opacity-50">
            Solicita cambios en tu matricula académica
          </Label>
          <p>En esta sección podrá:</p>
          <ul className="list-disc list-inside text-sm">
            <li>Incluir o cancelar materias.</li>
            <li>Cambiar los grupos de las materias.</li>
            <li>Solicitar excepciones académicas.</li>
          </ul>
          <Button
            className={"w-fit mx-auto"}
            onClick={
              () =>
                horario && horario > 0 && (!solicitud || solicitud === 0)
                  ? navigate("/solicitud/crear")
                  : toast({
                      variant: "destructive",
                      title: "¡Horario no registrado o solicitud pendiente!",
                      description:
                        "Debe cargar el horario antes de crear una solicitud de ajuste de matrícula y no tener ninguna solciitud pendiente o en revisión.",
                    })
              // toast({
              //   variant: "destructive",
              //   title: "¡Funcionalidad no disponible!",
              //   description: "Se acabo el periodo de creación de solicitudes.",
              // })
            }
          >
            Crear solicitud
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default App;
