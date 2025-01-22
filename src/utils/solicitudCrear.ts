import { Materia } from "@/types/materiaTypes";
import { Solicitud } from "@/types/solicitudesTypes";

// Genera las solicitudes de cambio basadas en las diferencias entre el horario inicial y el actual
export function generateAppeals(
  horarioInicial: Materia[],
  horarioActual: Materia[]
): Solicitud["requests"] {
  const appeals: Solicitud["requests"] = [];

  // Crear un mapa de materias iniciales para fácil acceso
  const materiasInicialesMap = new Map(
    horarioInicial.map((materia) => [
      materia._id,
      {
        name: materia.name,
        sku: materia.sku,
        groups: materia.groups,
      },
    ])
  );

  // 1. Procesar eliminaciones y cambios de grupo
  horarioInicial.forEach((materiaInicial) => {
    const materiaActual = horarioActual.find(
      (m) => m._id === materiaInicial._id
    );

    if (!materiaActual) {
      // Caso: Materia completamente eliminada
      materiaInicial.groups.forEach((group) => {
        appeals.push({
          from: {
            group: group.sku,
            sku: materiaInicial.sku,
            name: materiaInicial.name,
          },
          to: null,
          status: "PENDING",
          reason: null,
        });
      });
    } else {
      // Caso: Cambios en grupos de una materia existente
      const gruposIniciales = new Set(materiaInicial.groups.map((g) => g.sku));
      const gruposActuales = new Set(materiaActual.groups.map((g) => g.sku));

      // Si hay diferencias en los grupos, registrar el cambio
      if (
        gruposIniciales.size !== gruposActuales.size ||
        [...gruposIniciales].some((g) => !gruposActuales.has(g))
      ) {
        materiaInicial.groups.forEach((groupInicial) => {
          if (!materiaActual.groups.every((g) => g.sku === groupInicial.sku)) {
            // El grupo inicial ya no está presente, registrar cambio o eliminación
            const appeal: Solicitud["requests"][0] = {
              from: {
                group: groupInicial.sku,
                sku: materiaInicial.sku,
                name: materiaInicial.name,
              },
              to: null,
              status: "PENDING",
              reason: null,
            };

            // Si hay nuevos grupos, agregarlos como destino
            if (materiaActual.groups.length > 0) {
              appeal.to = materiaActual.groups
                .filter((g) => g.sku !== groupInicial.sku)
                .map((g) => ({
                  group: g.sku,
                  sku: materiaActual.sku,
                  name: materiaActual.name,
                  approved: null,
                }));
            } else {
              appeal.to = null;
            }

            appeals.push(appeal);
          }
        });
      }
    }
  });

  // 2. Procesar nuevas materias agregadas
  horarioActual.forEach((materiaActual) => {
    if (!materiasInicialesMap.has(materiaActual._id)) {
      // Caso: Nueva materia agregada
      appeals.push({
        from: null,
        to: materiaActual.groups.map((g) => ({
          group: g.sku,
          sku: materiaActual.sku,
          name: materiaActual.name,
          approved: null,
        })),
        status: "PENDING",
        reason: null,
      });
    }
  });

  return appeals;
}

// Actualiza una solicitud con los cambios generados entre horarios
export function updateSolicitud(
  solicitud: Solicitud,
  horarioInicial: Materia[],
  horarioActual: Materia[]
): Solicitud {
  return {
    ...solicitud,
    requests: generateAppeals(horarioInicial, horarioActual),
    status: "PENDING",
  };
}

// Verifica si una solicitud tiene cambios pendientes
export function hasPendingChanges(
  horarioInicial: Materia[],
  horarioActual: Materia[]
): boolean {
  const appeals = generateAppeals(horarioInicial, horarioActual);
  return appeals.length > 0;
}

// Obtiene un resumen de los cambios en la solicitud
export function getSolicitudSummary(solicitud: Solicitud): {
  totalRequests: number;
  approved: number;
  rejected: number;
  pending: number;
} {
  return {
    totalRequests: solicitud.requests.length,
    approved: solicitud.requests.filter((r) => r.status === "APPROVED").length,
    rejected: solicitud.requests.filter((r) => r.status === "REJECTED").length,
    pending: solicitud.requests.filter((r) => r.status === "PENDING").length,
  };
}
