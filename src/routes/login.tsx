import { FormEvent, useState } from "react";
import { useAuth } from "../providers/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button.tsx";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import { useToast } from "@/hooks/use-toast";

const LoginRoute = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const { toast } = useToast();
  const auth = useAuth();

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await auth?.login(username, password);
      navigate("/");
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Inicio de sesión fallido",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="p-4 min-w-96 space-y-4">
        <h1 className="text-2xl text-center">Ajuste de Matricula</h1>
        <h4 className="text-xs text-center">
          Ingrese sus credenciales para acceder al sistema
        </h4>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="email">
              Correo electrónico
            </Label>
            <Input
              required
              id="email"
              autoComplete="email"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="password">
              Contraseña
            </Label>
            <Input
              required
              id="password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit">Iniciar sesión</Button>
        </form>
        <Button variant="link" className="text-xs">
          ¿Olvidó su Contraseña?
        </Button>
        <Link
          to="/register"
          className={buttonVariants({ variant: "link" }) + " text-xs"}
        >
          ¿No tiene una cuenta? Registrese aquí
        </Link>
      </Card>
    </div>
  );
};

export default LoginRoute;
