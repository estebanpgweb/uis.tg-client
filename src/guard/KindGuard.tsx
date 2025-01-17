import { useAuth } from "../providers/AuthContext.tsx";
import { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

const KindGuard = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const location = useLocation();
  const kind: "STUDENT" | "ROOT" | "ADMIN" = auth?.user?.kind || "STUDENT";

  if (!auth?.loggedIn) return null;

  // Definir rutas permitidas según el tipo de usuario
  const routesByKind = {
    STUDENT: [
      "/",
      "/horario",
      "/solicitudes",
      "/solicitud/crear",
      { pattern: /^\/solicitudes\/[^/]+$/, defaultRoute: "/solicitudes" },
    ],
    ROOT: [
      "/solicitudes",
      "/estadisticas",
      "/usuarios",
      { pattern: /^\/solicitudes\/[^/]+$/, defaultRoute: "/solicitudes" },
    ],
    ADMIN: [
      "/solicitudes",
      { pattern: /^\/solicitudes\/[^/]+$/, defaultRoute: "/solicitudes" },
    ],
  };

  const allowedRoutes = routesByKind[kind] || [];

  // Verificar si la ruta actual está permitida
  const isAllowed = allowedRoutes.some((route) => {
    if (typeof route === "string") {
      return location.pathname === route;
    }
    return route.pattern.test(location.pathname);
  });

  if (!isAllowed) {
    // Redirigir a la primera ruta permitida
    const defaultRoute =
      allowedRoutes.find((route) => typeof route === "string") || "/";
    return <Navigate to={defaultRoute} />;
  }

  return children;
};

export default KindGuard;
