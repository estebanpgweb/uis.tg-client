import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthContext.tsx";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button.tsx";
import UIS from "./assets/UIS.avif";
import { User, LogOut } from "lucide-react";

const Template = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const location = useLocation();
  const kind = auth?.user?.kind || "";

  const handleLogOut = () => {
    auth?.logout();
  };

  const navLinks = [
    { path: "/", label: "Inicio", kind: "STUDENT" },
    { path: "/horario", label: "Horario", kind: "STUDENT" },
    { path: "/solicitudes", label: "Solicitudes", kind: "" },
    { path: "/usuarios", label: "Usuarios", kind: "ROOT" },
    { path: "/estadisticas", label: "Estadisticas", kind: "ROOT" },
  ];

  const isActiveRoute = (path: string): boolean => {
    const routePatterns = [
      { pattern: /^\/solicitudes\/[^/]+$/, defaultRoute: "/solicitudes" },
    ];

    if (location.pathname.startsWith(path)) {
      return true;
    }

    // Verificar patrones dinámicos
    for (const { pattern, defaultRoute } of routePatterns) {
      if (pattern.test(location.pathname) && defaultRoute === path) {
        return true;
      }
    }

    return false;
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="w-full flex justify-between items-center p-4 bg-background shadow-md">
        <img src={UIS} alt="logo uis" className="w-1/12" />
        <ul className="flex gap-x-8 items-center">
          {navLinks
            .filter((link) => link.kind === kind || link.kind === "")
            .map((link) => (
              <li key={link.path}>
                <Link
                  className={`${
                    isActiveRoute(link.path) && "!font-extrabold !text-xl"
                  } ${buttonVariants({ variant: "link" })} !text-lg`}
                  to={link.path}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          <li>
            <Popover>
              <PopoverTrigger asChild>
                <User size={24} className="hover:cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-60 flex flex-col">
                <p className="text-center text-xl mb-2">
                  Hola, {auth?.user?.name} {auth?.user?.lastname}
                </p>
                <Button variant="destructive" onClick={handleLogOut}>
                  <LogOut />
                  Cerrar sesión
                </Button>
              </PopoverContent>
            </Popover>
          </li>
        </ul>
      </nav>
      <main className="flex-1 py-6 px-8 bg-template">
        <Card className="px-6 py-4">{children}</Card>
      </main>
    </div>
  );
};

export default Template;
