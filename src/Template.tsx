import { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthContext.tsx";
import UIS from "./assets/UIS.avif";
import { buttonVariants } from "@/components/ui/button";

const Template = ({ children }: PropsWithChildren) => {
  const auth = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: "/horario", label: "Horario", kind: "STUDENT" },
    { path: "/solicitudes", label: "Solicitudes", kind: "" },
  ];

  const kind = auth?.user?.kind || "STUDENT";

  return (
    <div className="w-full h-full">
      <nav className="w-full flex justify-between items-center p-4">
        <img src={UIS} alt="logo uis" className="w-1/12" />
        <ul className="flex gap-x-8">
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
        </ul>
      </nav>
      <main className="h-full py-4 px-8 bg-template">{children}</main>
    </div>
  );
};

export default Template;
