import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Solicitud } from "../types/solicitudesTypes";
import { SolicitudesColumns } from "../types/tableTypes";
import { useAuth } from "@/providers/AuthContext";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

const SolicitudRoute = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const axios: AxiosInstance = useAxios();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const getSolicitudes = async () => {
      try {
        setIsLoading(true);
        const kind = auth?.user?.kind || "STUDENT";
        let data: Solicitud[] = [];
        if (kind === "STUDENT") {
          const response = await axios.get(`/api/student/appeal`);
          data = response.data;
        } else {
          const response = await axios.get(`/api/appeal`);
          data = response.data;
        }

        setSolicitudes(data);
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
