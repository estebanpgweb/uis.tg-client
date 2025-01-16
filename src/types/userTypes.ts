export interface UserType {
  _id: number;
  name: string;
  lastname: string;
  username: string;
  permissions: string[];
  kind: "STUDENT" | "ROOT" | "ADMIN";
  verified: boolean;
}
