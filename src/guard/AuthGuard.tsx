import { useAuth } from "../providers/AuthContext.tsx";
import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import KindGuard from "./KindGuard.tsx";
import Template from "@/Template.tsx";

const AuthGuard = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const access_token: string | null = localStorage.getItem("access_token");

  if (!auth) return null;

  if (!access_token) {
    auth?.logout();
    return <Navigate to={"/login"} />;
  }

  if (access_token && !auth?.loggedIn) {
    auth?.me();
  }

  return (
    <KindGuard>
      <Template>{children}</Template>
    </KindGuard>
  );
};

export default AuthGuard;
