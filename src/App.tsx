import "./App.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CalendarDays,
  FileText,
  AlertCircle,
  TriangleAlert,
} from "lucide-react";

function App() {
  const [horario, setHorario] = useState(false);

  useEffect(() => {
    const loadHorario = () => {
      setTimeout(() => {
        setHorario(true);
      }, 3000);
    };

    loadHorario();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">
        Bienvenido al sistema de ajuste de matrícula
      </h1>
      {/* Alerta de horario */}
      {!horario ? (
        <Alert variant="destructive" className="my-4 mx-8">
          <AlertCircle />
          <AlertTitle>¡Horario no registrado!</AlertTitle>
          <AlertDescription>
            Debe cargar el horario antes de crear una solicitud de ajuste de
            matrícula.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="my-4 mx-8">
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
          <Label className="text-gray-500">
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
          <Label className="text-gray-500">
            Solicita cambios en tu matricula académica
          </Label>
          <p>En esta sección podrá:</p>
          <ul className="list-disc list-inside text-sm">
            <li>Incluir o cancelar materias.</li>
            <li>Cambiar los grupos de las materias.</li>
            <li>Solicitar excepciones académicas.</li>
          </ul>
          <Link
            to={"/solicitudes"}
            className={buttonVariants() + "w-fit mx-auto"}
          >
            Crear solicitud
          </Link>
        </Card>
      </div>
    </div>
  );
}

export default App;
