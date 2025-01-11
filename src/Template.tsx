import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthContext.tsx";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import UIS from "./assets/UIS.avif";
import { User } from "lucide-react";

const Template = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const location = useLocation();
  const kind = auth?.user?.kind || "";

  const LogOut = () => {
    auth?.logout();
  };

  const navLinks = [
    { path: "/solicitudes", label: "Solicitudes", kind: "" },
    { path: "/horario", label: "Horario", kind: "STUDENT" },
    { path: "/usuarios", label: "Usuarios", kind: "ROOT" },
    { path: "/estadisticas", label: "Estadisticas", kind: "ROOT" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <nav className="w-full h-1/12 flex justify-between items-center p-4 fixed top-0 left-0 right-0 z-10 bg-background shadow-md">
        <img src={UIS} alt="logo uis" className="w-1/12" />
        <ul className="flex gap-x-8 items-center">
          {navLinks
            .filter((link) => link.kind === kind || link.kind === "")
            .map((link) => (
              <li key={link.path}>
                <Link
                  className={`${
                    location.pathname === link.path && "!font-extrabold"
                  } ${buttonVariants({ variant: "link" })} !text-lg`}
                  to={link.path}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          <li>
            <User
              onClick={() => LogOut()}
              size={24}
              className="cursor-pointer"
            />
          </li>
        </ul>
      </nav>
      <main className="flex-1 py-14 px-10 bg-template mt-16">
        <Card className="px-12 py-6">{children}</Card>
      </main>
    </div>
  );
};

export default Template;
