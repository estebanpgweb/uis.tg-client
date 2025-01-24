import { UserType } from "@/types/userTypes";

export const buildFilterQuery = (
  search: string,
  params: string[],
  statuses?: string[],
  user?: UserType
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

  // Añadir condiciones de tipo de admin
  if (user?.kind === "ADMIN") {
    conditions.push({
      attendedBy: user.id,
    });
  }

  // Combinar todas las condiciones con $and
  return conditions.length > 0 ? { $and: conditions } : {};
};
