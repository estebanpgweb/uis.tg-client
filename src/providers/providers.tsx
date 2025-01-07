import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { PropsWithChildren } from "react";
import { AxiosProvider } from "./AxiosContext.tsx";
import { AuthProvider } from "./AuthContext.tsx";
import AuthGuard from "../guard/AuthGuard.tsx";
import GuestGuard from "../guard/GuestGuard.tsx";
import { ThemeProvider } from "@/providers/ThemeProvider.tsx";
import App from "../App.tsx";
//student
import HorarioRoute from "../routes/horario.tsx";
//root
import SolicitudRoute from "../routes/solicitudes.tsx";
import UsuariosRoute from "../routes/usuarios.tsx";
import EstadisticasRoute from "../routes/estadisticas.tsx";
//login
import LoginRoute from "../routes/login.tsx";
import RegisterRoute from "../routes/register.tsx";

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
        <LoginRoute />,
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
]);

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <AxiosProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <RouterProvider router={router} />
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </AxiosProvider>
    </>
  );
};

export default Providers;
