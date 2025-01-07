import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthContext.tsx";
import { buttonVariants } from "@/components/ui/button";
import UIS from "./assets/UIS.avif";
import { User } from "lucide-react";

const Template = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const location = useLocation();

  const LogOut = () => {
    auth?.logout();
  };

  const navLinks = [
    { path: "/solicitudes", label: "Solicitudes", kind: "" },
    { path: "/horario", label: "Horario", kind: "STUDENT" },
    { path: "/usuarios", label: "Usuarios", kind: "ROOT" },
    { path: "/estadisticas", label: "Estadisticas", kind: "ROOT" },
  ];

  const kind = auth?.user?.kind || "STUDENT";

  return (
    <div className="w-full h-full">
      <nav className="w-full flex justify-between items-center p-4">
        <img src={UIS} alt="logo uis" className="w-1/12" />
        <ul className="flex gap-x-8 items-center">
          {navLinks
            .filter((link) => link.kind === kind || link.kind === "")
            .map((link) => (
              <li key={link.path}>
                <Link
                  className={`${
                    location.pathname === link.path && "!font-extrabold"
                  } ${buttonVariants({ variant: "link" })} !text-lg
                    `}
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
      <main className="h-full py-4 px-8 bg-template">{children}</main>
    </div>
  );
};

export default Template;
