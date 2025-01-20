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
      day: string;
      time: string;
      building: string;
      room: string;
      professor: string;
    }[];
  }[];
  group?: string;
  createdAt?: string;
  updatedAt?: string;
}
