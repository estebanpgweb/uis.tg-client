import { useState, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/loader";
import { useAuth } from "@/providers/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const RecuperarContraseñaRoute = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get("t");

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Token no encontrado en la URL",
      });
    }
  }, [toast]);

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      //validamos que las contraseñas coincidan
      if (password !== confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }
      //validamos si las contraseñas tiene una may,min y un numero
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(password)) {
        throw new Error(
          "La contraseña debe tener al menos una mayúscula, una minúscula y un número"
        );
      }

      if (!token) {
        throw new Error("Token no encontrado");
      }
      await auth.changePassword(password, confirmPassword, token);
      toast({
        title: "Contraseña actualizada",
        description:
          "Su contraseña ha sido actualizada con éxito, por favor inicie sesión.",
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
        title: "Error al recuperar contraseña",
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
        <h1 className="text-2xl text-center">Ajuste de Matricula</h1>
        <h4 className="text-xs text-center">
          Ingrese la nueva contraseña para su cuenta
        </h4>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="password">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                required
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="confirmarContraseña">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Input
                required
                id="confirmarContraseña"
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Button type="submit">
            <LogIn className="mr-2" size={20} />
            Enviar
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RecuperarContraseñaRoute;
