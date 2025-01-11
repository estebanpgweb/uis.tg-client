import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Solicitud } from "../types/solicitudesTypes";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const SolicitudDetalleRoute = () => {
  const { id } = useParams<{ id: string }>(); // Captura el id desde la URL
  const axios: AxiosInstance = useAxios();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/appeal/${id}`);
        setSolicitud(data);
      } catch (err) {
        setError("No se pudo cargar la solicitud. Intenta nuevamente.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [axios, id]);

  if (isLoading) {
    return <div className="text-center p-4">Cargando solicitud...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!solicitud) {
    return (
      <div className="text-center p-4">
        No se encontraron datos para la solicitud especificada.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between">
        <Link
          to="/solicitudes"
          className={buttonVariants({ variant: "link" }) + " text-xl"}
        >
          <ArrowLeft /> Volver
        </Link>
        <h1 className="text-2xl font-bold mb-4">Detalles de la Solicitud</h1>
      </div>
      <div className="p-4 rounded shadow">
        <p>
          <strong>ID de la solicitud:</strong> {solicitud._id}
        </p>
        <p>
          <strong>ID del estudiante:</strong> {solicitud.studentId}
        </p>
        <p>
          <strong>Estado:</strong> {solicitud.status}
        </p>
        <p>
          <strong>Creado el:</strong>{" "}
          {new Date(solicitud.createdAt).toLocaleString()}
        </p>
        <p>
          <strong>Actualizado el:</strong>{" "}
          {new Date(solicitud.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default SolicitudDetalleRoute;
