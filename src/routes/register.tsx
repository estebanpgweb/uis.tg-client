import { FormEvent, useState, useEffect } from "react";
import { useAuth } from "../providers/AuthContext.tsx";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button.tsx";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card.tsx";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff, Mail } from "lucide-react";
import Loader from "@/components/loader";
import { UserType } from "../types/userTypes.ts";

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
  const [validEmail, setValidEmail] = useState<UserType | null>(null);

  const { toast } = useToast();
  const auth = useAuth();
  const navigate = useNavigate();

  const validateUsername = async (usernameToValidate: string) => {
    if (!usernameToValidate) return;

    try {
      const emailValidate = await auth.verifyEmail(usernameToValidate);
      console.log("Email validation result:", emailValidate);
      setName(emailValidate.name || "");
      setLastname(emailValidate.lastname || "");
      setIdentification(emailValidate.identification || "");
      toast({
        title: "Correo registrado",
        description: "Continúa con el registro y verifica tu correo.",
      });
      setValidEmail(emailValidate);
    } catch (error) {
      console.error("Error validating email:", error);
      toast({
        variant: "destructive",
        title: "Correo institucional no registrado",
        description:
          "El correo institucional ingresado no está registrado en el sistema, por favor verifique o registrese.",
      });
      setValidEmail(null);
      setName("");
      setLastname("");
      setIdentification("");
      return;
    }
  };

  // useEffect para validar email cuando termine de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email.trim()) {
        validateUsername(email);
      }
    }, 500); // Espera .5 segundo después de que termine de escribir

    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleRegisterUser = async () => {
    // Si no hay un email válido, procedemos con el registro
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
      //validamos que el codigo de estudiante este dentro del texto del correo
      if (!email.includes(identification)) {
        throw new Error("El código de estudiante no coincide con el correo");
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

  const handleEmailValidation = async () => {
    // Si el email es valido, enviamos una solicitud para recuperar la contraseña
    try {
      setIsLoading(true);
      await auth.forgotPassword(email);
      toast({
        title: "Correo enviado",
        description:
          "Por favor revisa tu correo para crear una contraseña nueva y continuar con el registro",
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

  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (validEmail) {
      await handleEmailValidation();
    } else {
      await handleRegisterUser();
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
          <div className="flex flex-col gap-2">
            <Label className="font-normal" htmlFor="email">
              Correo institucional
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
          <div className="flex flex-col w-full md:flex-row gap-4">
            <div className="flex w-full flex-col gap-2">
              <Label className="font-normal" htmlFor="email">
                Nombre
              </Label>
              <Input
                required
                id="name"
                autoComplete="name"
                type="text"
                value={name}
                disabled={!!validEmail}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex w-full flex-col gap-2">
              <Label className="font-normal" htmlFor="email">
                Apellido
              </Label>
              <Input
                required
                id="lastname"
                autoComplete="lastname"
                type="text"
                value={lastname}
                disabled={!!validEmail}
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
              disabled={!!validEmail}
              onChange={(e) => setIdentification(e.target.value)}
            />
          </div>
          {!validEmail && (
            <>
              <div className={`flex flex-col gap-2`}>
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
              <div className={`flex flex-col gap-2`}>
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
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          <Button type="submit">
            {validEmail ? (
              <>
                <Mail className="mr-2" size={20} />
                Validar Email
              </>
            ) : (
              <>
                <UserPlus className="mr-2" size={20} />
                Registrarse
              </>
            )}
          </Button>
        </form>
        <Link
          to="/login"
          className={buttonVariants({ variant: "link" }) + " text-xs"}
        >
          ¿Ya tienes una cuenta? Ingresa aquí
        </Link>
        <p className="text-xs text-muted-foreground px-2">
          ¿Tienes problemas? Escríbenos a{" "}
          <a
            href="mailto:dilancorr@gmail.com"
            className="text-blue-500 underline break-all"
          >
            dilancorr@gmail.com
          </a>
        </p>
      </Card>
    </div>
  );
};

export default RegisterRoute;
