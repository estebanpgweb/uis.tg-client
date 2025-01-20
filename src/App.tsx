import "./App.css";
import { useAxios } from "./providers/AxiosContext";
import { AxiosInstance } from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function App() {
  const [horario, setHorario] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const axios: AxiosInstance = useAxios();

  useEffect(() => {
    const fetchHorario = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/schedule/count`);
        setHorario(data);
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
  }, [axios, toast]);

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
            Debe cargar el horario antes de crear una solicitud de ajuste de
            matrícula.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <TriangleAlert />
          <AlertTitle>¡Importante!</AlertTitle>
          <AlertDescription>
            El éxito de su solicitud de ajuste de matrícula depende de que su
            horario esté registrado correctamente. Asegúrese de revisar y
            confirmar su horario antes de crear una solicitud de ajuste.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex mx-8 my-4 gap-x-8 justify-between">
        {/* Horario */}
        <Card className="flex flex-col gap-4 flex-1 px-6 py-4">
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
        <Card className="flex flex-col gap-4 flex-1 px-6 py-4">
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
            onClick={() =>
              horario && horario > 0
                ? navigate("/solicitud/crear")
                : toast({
                    variant: "destructive",
                    title: "¡Horario no registrado!",
                    description:
                      "Debe cargar el horario antes de crear una solicitud de ajuste de matrícula.",
                  })
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
