import { useState, useEffect } from "react";
import { useAxios } from "../providers/AxiosContext";
import { AxiosInstance } from "axios";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye } from "lucide-react";
import {
  Solicitud,
  getStatusLabel,
  getBadgeColor,
} from "../types/solicitudesTypes";

const SolicitudRoute = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const axios: AxiosInstance = useAxios();

  const limit = 5;

  useEffect(() => {
    const getSolicitudes = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `/api/appeal?limit=${limit}&skip=${currentPage * limit}`
        );
        setSolicitudes(data);
        setHasNextPage(data.length === limit);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSolicitudes();
  }, [axios, currentPage]);

  const handlePageChange = (
    e: React.MouseEvent,
    direction: "next" | "previous"
  ) => {
    e.preventDefault();
    setCurrentPage((prev) =>
      direction === "next" ? prev + 1 : Math.max(prev - 1, 0)
    );
  };

  if (isLoading) {
    return <div className="text-center p-4">Cargando solicitudes...</div>;
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Solicitudes de Ajuste de Matrícula
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Solicitud</TableHead>
            <TableHead>Código Estudiante</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitudes.length ? (
            solicitudes.map((solicitud) => (
              <TableRow key={solicitud._id}>
                <TableCell>{solicitud._id}</TableCell>
                <TableCell>{solicitud.studentId}</TableCell>
                <TableCell>
                  <Badge
                    className={getBadgeColor(solicitud.status) + " text-white"}
                  >
                    {getStatusLabel(solicitud.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    to={`/solicitudes/${solicitud._id}`}
                    className={`${buttonVariants({
                      variant: "link",
                    })} text-xs flex items-center gap-1`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye size={20} /> Ver Detalles
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No hay solicitudes disponibles.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => handlePageChange(e, "previous")}
              className={
                currentPage === 0
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={(e) => handlePageChange(e, "next")}
              className={
                !hasNextPage
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default SolicitudRoute;
