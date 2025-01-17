export interface Materia {
  _id: string;
  sku: string;
  name: string;
  requirements?: string[];
  credits: number;
  level: number;
  groups: {
    sku: string;
    capacity?: number;
    enrolled?: number;
    schedule: {
      dia: string;
      hora: string;
      edificio: string;
      aula: string;
      profesor: string;
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}
