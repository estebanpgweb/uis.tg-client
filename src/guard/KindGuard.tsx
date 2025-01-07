import { useAuth } from "../providers/AuthContext.tsx";
import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

const KindGuard = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const location = useLocation();

  const kind = auth?.user?.kind || "STUDENT";

  if (!auth?.loggedIn) return null;

  // Definir rutas permitidas según el tipo de usuario
  const routesByKind = {
    STUDENT: ["/horario","/solicitudes", "/"],
    ROOT: ["/solicitudes", "/estadisticas", "/usuarios"],
  };

  const allowedRoutes = routesByKind[kind] || [];
  if (!allowedRoutes.includes(location.pathname)) {
    // Redirigir a la primera ruta permitida para el usuario
    return <Navigate to={allowedRoutes[0]} />;
  }

  return children;
};

export default KindGuard;
