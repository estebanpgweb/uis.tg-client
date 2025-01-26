import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { PropsWithChildren } from "react";
import { AxiosProvider } from "./AxiosContext.tsx";
import { AuthProvider, useAuth } from "./AuthContext.tsx";
import AuthGuard from "../guard/AuthGuard.tsx";
import GuestGuard from "../guard/GuestGuard.tsx";
import { ThemeProvider } from "@/providers/ThemeProvider.tsx";
import App from "../App.tsx";
// student
import HorarioRoute from "../routes/horario.tsx";
import SolicitudCrearRoute from "@/routes/solicitudCrear.tsx";
// root
import SolicitudRoute from "../routes/solicitudes.tsx";
import SolicitudDetalleRoute from "@/routes/solicitudDetalle.tsx";
import UsuariosRoute from "../routes/usuarios.tsx";
import EstadisticasRoute from "../routes/estadisticas.tsx";
// login
import LoginRoute from "../routes/login.tsx";
import RegisterRoute from "../routes/register.tsx";
import RecuperarContraseñaRoute from "@/routes/recuperarContraseña.tsx";

// Componente para manejar redirecciones basadas en el tipo de usuario
const DefaultRedirect = () => {
  const { user } = useAuth();
  const kind = user.kind;

  // Puedes personalizar las rutas por defecto según el tipo de usuario
  const defaultRoutes: Record<string, string> = {
    STUDENT: "/",
    ADMIN: "/solicitudes",
    ROOT: "/solicitudes",
  };

  return <Navigate to={defaultRoutes[kind]} replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <App />
      </AuthGuard>
    ),
  },
  {
    path: "/horario",
    element: (
      <AuthGuard>
        <HorarioRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/solicitud/crear",
    element: (
      <AuthGuard>
        <SolicitudCrearRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/solicitudes/:id",
    element: (
      <AuthGuard>
        <SolicitudDetalleRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/solicitudes",
    element: (
      <AuthGuard>
        <SolicitudRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/usuarios",
    element: (
      <AuthGuard>
        <UsuariosRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/estadisticas",
    element: (
      <AuthGuard>
        <EstadisticasRoute />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestGuard>
        <LoginRoute />
      </GuestGuard>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestGuard>
        <RegisterRoute />
      </GuestGuard>
    ),
  },
  {
    path: "/cambiar-contrasena",
    element: (
      <GuestGuard>
        <RecuperarContraseñaRoute />
      </GuestGuard>
    ),
  },
  {
    // Captura cualquier ruta no definida
    path: "*",
    element: (
      <AuthGuard>
        <DefaultRedirect />
      </AuthGuard>
    ),
  },
]);

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <AxiosProvider>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </AxiosProvider>
  );
};

export default Providers;
