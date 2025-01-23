import { createContext, useContext, useState, useEffect } from "react";
import { useAxios } from "./AxiosContext.tsx";
import { AxiosInstance } from "axios";
import { UserType } from "../types/userTypes.ts";
import Loader from "@/components/loader.tsx";

type AuthContextType = {
  loggedIn: boolean;
  user: UserType;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    lastname: string,
    identification: string
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<UserType>;
  logout: () => void;
  me: () => Promise<UserType>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const emptyUser: UserType = {
    id: "",
    name: "",
    lastname: "",
    shift: null,
    username: "",
    permissions: [],
    kind: "",
    verified: false,
  };

  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem("access_token");
  });
  const [user, setUser] = useState<UserType>(emptyUser);
  const [isLoading, setIsLoading] = useState(true);

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

  const me = async (): Promise<UserType> => {
    try {
      const { data } = await axios.get("/api/auth/user");
      console.log("User data:", data);
      setUser(data);
      setLoggedIn(true);
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<UserType> => {
    const { data } = await axios.post("/api/auth/login", {
      username,
      password,
    });
    localStorage.setItem("access_token", data.access_token);
    setLoggedIn(true);
    // Esperamos a que se obtengan los datos del usuario y los retornamos
    const userData = await me();
    return userData;
  };

  const logout = () => {
    setLoggedIn(false);
    setUser(emptyUser);
    localStorage.removeItem("access_token");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      me();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <Loader isLoading={isLoading} />;
  }

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        user,
        register,
        login,
        logout,
        me,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
