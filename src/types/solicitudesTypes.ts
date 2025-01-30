// Tipos de datos
export interface Solicitud {
  _id?: string;
  student?: {
    name: string;
    lastname: string;
    username: string;
    identification: string;
    shift?: {
      day: dayType;
      time: "AM" | "PM";
    } | null;
  };
  requests: {
    from: {
      group: string;
      sku: string;
      name: string;
      approved?: boolean | null;
    } | null;
    to:
      | {
          group: string;
          sku: string;
          name: string;
          approved: boolean | null;
        }[]
      | null;
    status?: RequestStatus;
    reason?: string | null;
  }[];
  status?: "PENDING" | "REVIEW" | "PARTIAL_REJECTED" | "REJECTED" | "APPROVED";
  ask?: string;
  observation?: string;
  attended?: {
    name: string;
    lastname: string;
    _id: string;
  };
  logs?: {
    message: string;
    user: {
      name: string;
      lastname: string;
    };
  }[];
  createdAt?: string;
  updatedAt?: string;
}

type dayType = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

//Funcion para obtener el dia y jornada del shift
export const getShiftLabel = (shift: {
  day: dayType;
  time: "AM" | "PM";
}): string => {
  const days: Record<dayType, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
  };

  return `${days[shift.day]} - ${shift.time === "AM" ? "Mañana" : "Tarde"}`;
};

export const getShiftDate = (shift: {
  day: dayType;
  time: "AM" | "PM";
}): string => {
  const dateMap: Record<dayType, string> = {
    MONDAY: "2025-01-27",
    TUESDAY: "2025-01-28", // Corregido el "38" a "28"
    WEDNESDAY: "2025-01-29",
    THURSDAY: "2025-01-30",
    FRIDAY: "2025-01-31",
  };

  const targetDate = new Date(dateMap[shift.day]);
  if (shift.time === "AM") {
    targetDate.setHours(8, 0, 0, 0);
  } else {
    targetDate.setHours(14, 0, 0, 0);
  }

  return targetDate.toISOString();
};

export const validateShiftTiming = (solicitud: Solicitud) => {
  if (!solicitud.student?.shift || !solicitud.createdAt) {
    return;
  }

  const createdAtUTC = new Date(solicitud.createdAt);
  const shiftStartDate = new Date(getShiftDate(solicitud.student.shift));

  // Comparar fechas completas primero
  const createdAtTime = createdAtUTC.getTime();
  const shiftStartTime = shiftStartDate.getTime();

  // Obtener solo las horas para el log
  const createdAtHours = createdAtUTC.getUTCHours();
  const createdAtMinutes = createdAtUTC.getUTCMinutes();
  const shiftStartHours = shiftStartDate.getUTCHours();
  const shiftStartMinutes = shiftStartDate.getUTCMinutes();

  // Convertir horas a minutos para el log
  const createdAtTotalMinutes = createdAtHours * 60 + createdAtMinutes;
  const shiftStartTotalMinutes = shiftStartHours * 60 + shiftStartMinutes;

  // Determinar qué fecha es mayor
  const dayDifference = Math.floor(
    (createdAtTime - shiftStartTime) / (1000 * 60 * 60 * 24)
  );

  if (dayDifference !== 0) {
    return dayDifference > 0 ? createdAtUTC : shiftStartDate;
  } else {
    return createdAtTotalMinutes > shiftStartTotalMinutes
      ? createdAtUTC
      : shiftStartDate;
  }
};

// Función para obtener el texto del estado
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    REVIEW: "En Revisión",
    PARTIAL_REJECTED: "Parcialmente Completada",
    REJECTED: "Fallida",
    APPROVED: "Completada",
  };
  return statusLabels[status] || "Desconocido";
};

// Función para obtener el color del estado
export const getBadgeColor = (status: string): string => {
  const statusVariants: Record<string, string> = {
    PENDING: "bg-yellow-500",
    REVIEW: "bg-blue-500",
    PARTIAL_REJECTED: "bg-orange-500",
    REJECTED: "bg-red-500",
    APPROVED: "bg-green-500",
  };
  return statusVariants[status];
};
