import { FormEvent, useState, useEffect } from "react";
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
import { UserType } from "../types/userTypes.ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const LoginRoute = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [isValidatingUsername, setIsValidatingUsername] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const [validEmail, setValidEmail] = useState<UserType | null>(null);

  const { toast } = useToast();
  const auth = useAuth();

  // Función para validar el nombre de usuario
  const validateUsername = async (usernameToValidate: string) => {
    if (!usernameToValidate) return;

    try {
      setIsValidatingUsername(true);
      const emailValidate = await auth.verifyEmail(usernameToValidate);
      setValidEmail(emailValidate);
    } catch (error) {
      console.error("Error validating email:", error);
      toast({
        variant: "destructive",
        title: "Correo institucional no registrado",
        description:
          "El correo institucional ingresado no está registrado en el sistema, por favor verifique o registrese.",
      });
      return;
    } finally {
      setIsValidatingUsername(false);
    }
  };

  // useEffect para validar email cuando termine de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim()) {
        validateUsername(username);
      }
    }, 500); // Espera .5 segundo después de que termine de escribir

    return () => clearTimeout(timeoutId);
  }, [username]);

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

  const sendForgotPassword = async () => {
    try {
      setIsLoading(true);
      await auth.forgotPassword(email);

      toast({
        title: "Solicitud enviada",
        description:
          "Se ha enviado un correo con las instrucciones necesarias para recuperar su contraseña",
      });

      setShowForgotPassword(false);
      setEmail("");
      navigate("/cambiar-contraseña");
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Solicitud fallida",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setShowForgotPassword(false);
    }
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
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !username || !password || !validEmail}
          >
            <LogIn className="mr-2" size={20} />
            Iniciar sesión
          </Button>
        </form>
        <div className="md:flex w-full justify-between items-center">
          <AlertDialog
            open={showForgotPassword}
            onOpenChange={setShowForgotPassword}
          >
            <AlertDialogTrigger>
              <Button variant="link" className="text-xs">
                ¿Olvidó su Contraseña?
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Recuperar Contraseña</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription>
                Para recuperar su contraseña, ingrese su correo electrónico y le
                enviaremos las instrucciones necesarias.
                <div className="flex flex-col gap-2 my-6">
                  <Label className="font-normal" htmlFor="email">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Input
                      required
                      id="email"
                      autoComplete="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isValidatingUsername}
                    />
                    {isValidatingUsername && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={sendForgotPassword}>
                  Recuperar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Link
            to="/register"
            className={buttonVariants({ variant: "link" }) + " text-xs"}
          >
            ¿No tiene una cuenta? Registrese aquí
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginRoute;
