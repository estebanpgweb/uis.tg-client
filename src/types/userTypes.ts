interface UserType {
  id: number;
  username: string;
  permissions: string[];
  kind: "STUDENT" | "ROOT" | "ADMIN";
}

export default UserType;
