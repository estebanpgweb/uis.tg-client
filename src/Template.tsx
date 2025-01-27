import { useState } from "react";
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
import { Menu, X, User, LogOut } from "lucide-react";
import UIS from "./assets/UIS.avif";

const Template = ({ children }: PropsWithChildren) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useAuth();
  const location = useLocation();
  const kind = auth?.user?.kind || "";

  const handleLogOut = () => {
    auth?.logout();
    setIsMobileMenuOpen(false);
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
      { pattern: /^\/solicitud\/crear$/, defaultRoute: "/solicitudes" },
    ];

    if (path === "/") {
      return location.pathname === "/";
    }

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
    <div className="flex flex-col h-screen max-w-full">
      {/* Mobile Menu Toggle Button */}
      <nav className="w-full flex justify-between items-center p-4 bg-background shadow-md">
        <div className="flex items-center w-full">
          <img src={UIS} alt="logo uis" className=" w-1/4 md:w-1/12" />

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-x-8 items-center ml-auto">
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
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-background">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <img src={UIS} alt="logo uis" className="w-1/4" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="flex flex-col">
                {navLinks
                  .filter((link) => link.kind === kind || link.kind === "")
                  .map((link) => (
                    <li key={link.path} className="border-b">
                      <Link
                        className={`block p-4 ${
                          isActiveRoute(link.path)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="p-4 border-t">
              <p className="text-center text-xl mb-2">
                Hola, {auth?.user?.name} {auth?.user?.lastname}
              </p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogOut}
              >
                <LogOut className="mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 py-2 px-1 md:py-6 md:px-8 bg-template">
        <Card className="py-4 px-2 md:px-6 md:py-4">{children}</Card>
      </main>
    </div>
  );
};

export default Template;
