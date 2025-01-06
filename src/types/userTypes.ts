interface UserType {
  id: number;
  username: string;
  permissions: string[];
  kind: "STUDENT" | "ROOT";
}

export default UserType;
