export interface Materia {
  _id?: string;
  sku: string;
  name: string;
  requirements?: string[];
  credits?: number;
  level?: string;
  groups: {
    sku: string;
    capacity?: number;
    enrolled?: number;
    schedule?: {
      day: string;
      time: string;
      building?: string;
      room?: string;
      professor?: string;
    }[];
  }[];
  group?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getMateriaNameBySku = (
  materias: Materia[],
  requirements: Materia["requirements"]
) => {
  const requisitos = requirements?.map((req) => {
    const materia = materias.find((m) => m.sku === req);
    return materia?.name || "";
  });
  return requisitos?.join(", ");
};
