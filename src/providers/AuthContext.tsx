import { createContext, useContext, useState, useEffect } from "react";
import { useAxios } from "./AxiosContext.tsx";
import { AxiosInstance } from "axios";
import { UserType } from "../types/userTypes.ts";

type AuthContextType = {
  loggedIn: boolean;
  user: UserType | null;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastname: string,
    identification: string
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const axios: AxiosInstance = useAxios();

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastname: string,
    identification: string
  ): Promise<void> => {
    await axios.post("/api/auth/register", {
      email,
      password,
      confirm_password: confirmPassword,
      name,
      lastname,
      identification,
    });
  };

  const login = async (username: string, password: string): Promise<void> => {
    const { data } = await axios.post("/api/auth/login", {
      username,
      password,
    });
    localStorage.setItem("access_token", data.access_token);
    await me(); // Obtener datos del usuario automáticamente después de iniciar sesión
    setLoggedIn(true);
  };

  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    localStorage.removeItem("access_token");
  };

  const me = async (): Promise<void> => {
    try {
      const { data } = await axios.get("/api/auth/user");
      setUser(data);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !user) {
      me(); // Actualizar datos si hay un token válido pero no hay usuario en memoria
    }
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Evitar problemas con Fast Refresh exportando la función directamente
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
