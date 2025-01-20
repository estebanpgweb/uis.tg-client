import { FormEvent, useState } from "react";
import { useAuth } from "../providers/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button.tsx";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import Loader from "@/components/loader";

const LoginRoute = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const { toast } = useToast();
  const auth = useAuth();

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Esperamos a que se complete el login y obtenemos los datos del usuario
      const userData = await auth.login(username, password);

      // Ahora podemos usar los datos del usuario directamente
      if (userData.kind === "STUDENT") {
        navigate("/");
      } else {
        navigate("/solicitudes");
      }
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
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loader isLoading={isLoading} />
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
            <div className="relative">
              <Input
                required
                id="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit">
            <LogIn className="mr-2" size={20} />
            Iniciar sesión
          </Button>
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
