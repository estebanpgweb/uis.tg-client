// Función para construir el filtro basado en MongoDB
export const buildFilterQuery = (search: string, statuses?: string[]) => {
  const conditions = [];

  // Añadir condiciones de búsqueda si existe un término
  if (search && search !== "") {
    conditions.push({
      $or: [
        { _id: { $regex: search, $options: "i" } },
        { "student.identification": { $regex: search, $options: "i" } },
      ],
    });
  }

  // Añadir condiciones de estado si hay estados seleccionados
  if (statuses && statuses.length > 0) {
    conditions.push({
      status: { $in: statuses },
    });
  }

  // Combinar todas las condiciones con $and
  return conditions.length > 0 ? { $and: conditions } : {};
};
