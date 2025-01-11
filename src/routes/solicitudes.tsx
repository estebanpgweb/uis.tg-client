import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { DataTable } from "@/components/ui/data-table";
import { Solicitud } from "../types/solicitudesTypes";
import { SolicitudesColumns } from "../types/tableTypes";

const SolicitudRoute = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const axios: AxiosInstance = useAxios();

  useEffect(() => {
    const getSolicitudes = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`/api/appeal`);
        setSolicitudes(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSolicitudes();
  }, [axios]);

  if (isLoading) {
    return <div className="text-center p-4">Cargando solicitudes...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Solicitudes de Ajuste de Matrícula</h1>
      <DataTable data={solicitudes} columns={SolicitudesColumns} />
    </div>
  );
};

export default SolicitudRoute;
