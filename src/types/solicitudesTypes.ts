// Tipos de datos
export interface Solicitud {
  _id: string;
  studentId: string;
  requests: {
    from?: {
      group: string;
      sku: string;
    };
    to?: {
      group: string;
      sku: string;
    };
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Función para obtener el texto del estado
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PARTIAL_REJECTED: "En Revisión",
    REJECTED: "Completamente Fallido",
    APPROVED: "Completada",
  };
  return statusLabels[status] || "Desconocido";
};

// Función para obtener el color del estado
export const getBadgeColor = (status: string): string => {
  const statusVariants: Record<string, string> = {
    PENDING: "bg-yellow-500",
    PARTIAL_REJECTED: "bg-blue-500",
    REJECTED: "bg-red-500",
    APPROVED: "bg-green-500",
  };
  return statusVariants[status];
};
