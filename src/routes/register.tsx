import { FormEvent, useState } from "react";
import { useAuth } from "../providers/AuthContext.tsx";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button.tsx";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import Loader from "@/components/loader";

const RegisterRoute = () => {
  const [name, setName] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [identification, setIdentification] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const { toast } = useToast();
  const auth = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      //validamos que las contraseñas coincidan
      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }
      //validamos si el correo es de la universidad
      if (!email.includes("@correo.uis.edu.co")) {
        throw new Error("El correo debe ser de la universidad UIS");
      }
      //validamos si las contraseñas tiene una may,min y un numero
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
        throw new Error(
          "La contraseña debe tener al menos una mayúscula, una minúscula y un número"
        );
      }

      await auth?.register(
        email,
        password,
        confirmPassword,
        name,
        lastname,
        identification
      );
      toast({
        title: "Registro exitoso",
        description: "Por favor revisa tu correo para confirmar tu cuenta",
      });
      navigate("/login");
    } catch (error) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        (error as Error).message ||
        "Ha ocurrido un error inesperado";

      toast({
        variant: "destructive",
        title: "Registro fallido",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Loader isLoading={isLoading} />
      <Card className="p-4 min-w-96 space-y-4">
        <h1 className="text-2xl text-center">Registro de usuario</h1>
        <h4 className="text-xs text-center">
          Crea una cuenta para acceder al sistema de ajuste de matricula
        </h4>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-normal" htmlFor="email">
                Nombre
              </Label>
              <Input
                required
                id="name"
                autoComplete="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="font-normal" htmlFor="email">
                Apellido
              </Label>
              <Input
                required
                id="lastname"
                autoComplete="lastname"
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="codigo">
              Codigo
            </Label>
            <Input
              required
              id="identification"
              autoComplete="identification"
              type="number"
              value={identification}
              onChange={(e) => setIdentification(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="email">
              Correo electrónico
            </Label>
            <Input
              required
              id="email"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="password">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                required
                minLength={8}
                id="password"
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="confirmPassword">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                required
                minLength={8}
                id="confirmPassword"
                autoComplete="new-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button type="submit">
            <UserPlus className="mr-2" size={20} />
            Registrarse
          </Button>
        </form>
        <Link
          to="/login"
          className={buttonVariants({ variant: "link" }) + " text-xs"}
        >
          ¿Ya tienes una cuenta? Ingresa aquí
        </Link>
      </Card>
    </div>
  );
};

export default RegisterRoute;
