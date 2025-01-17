export const buildFilterQuery = (
  search: string,
  params: string[],
  statuses?: string[]
) => {
  const conditions = [];

  // Añadir condiciones de búsqueda si existe un término
  if (search && search !== "") {
    const searchConditions = params.map((param) => ({
      [param]: { $regex: search, $options: "i" },
    }));

    conditions.push({
      $or: searchConditions,
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
